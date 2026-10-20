import express, { type ErrorRequestHandler } from "express";
import {
  crearActividadesMock,
  crearHorariosActividadesMock,
  crearReglasCierreParqueMock,
} from "../inscripciones/datos-mocks";
import {
  InscripcionRechazadaError,
  type Actividad,
  type Inscripcion,
} from "../inscripciones/modelos";
import { inscribirActividad } from "../inscripciones/servicio";
import {
  AlmacenEnMemoria,
  type AlmacenInscripciones,
} from "../persistencia/almacen";
import {
  fechaHoraDelParque,
  MENSAJES_RECHAZO,
  SolicitudApiError,
  validarFecha,
  validarTurnoApi,
} from "./reglas";

interface ContextoApi {
  actividades?: Actividad[];
  inscripciones?: Inscripcion[];
  almacen?: AlmacenInscripciones;
}

interface ParticipanteApi {
  nombre?: string;
  dni: string;
  edad: number;
  talle?: string;
}

function esObjeto(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function leerParticipantes(value: unknown): ParticipanteApi[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) {
    throw new SolicitudApiError(
      "DATOS_INVALIDOS",
      "La lista de participantes debe ser un arreglo.",
    );
  }
  return value.map((p: unknown) => {
    if (
      !esObjeto(p) ||
      (p.nombre !== undefined && typeof p.nombre !== "string") ||
      (p.dni !== undefined && typeof p.dni !== "string") ||
      (p.edad !== undefined &&
        (!Number.isInteger(p.edad) ||
          Number(p.edad) < 0 ||
          Number(p.edad) > 120)) ||
      (p.talle !== undefined && typeof p.talle !== "string")
    ) {
      throw new SolicitudApiError(
        "DATOS_INVALIDOS",
        "Los datos de un participante no son válidos.",
      );
    }
    return {
      nombre:
        typeof p.nombre === "string" ? p.nombre.trim() || undefined : undefined,
      dni: typeof p.dni === "string" ? p.dni.trim() : undefined,
      edad: p.edad,
      talle: p.talle,
    } as ParticipanteApi;
  });
}

export function crearApp(contexto: ContextoApi = {}) {
  const app = express();
  const actividades = contexto.actividades ?? crearActividadesMock();
  const almacen =
    contexto.almacen ?? new AlmacenEnMemoria(contexto.inscripciones);
  app.use(express.json({ limit: "64kb" }));

  const buscarActividad = (id: unknown) => {
    const actividad = actividades.find((a) => a.id === id);
    if (!actividad || !actividad.disponible) {
      throw new InscripcionRechazadaError("ACTIVIDAD_NO_DISPONIBLE");
    }
    return actividad;
  };

  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

  app.get("/api/actividades", (_req, res) => {
    res.json(
      actividades.map((a) => ({
        id: a.id,
        name: a.nombre,
        disponible: a.disponible,
        cuposPorTurno: a.cuposPorTurno,
        edadMinima: a.edadMinima ?? null,
        requiereTalle: a.requiereVestimenta,
        turnos: crearHorariosActividadesMock(),
      })),
    );
  });

  app.get("/api/parque/reglas", (_req, res) =>
    res.json(crearReglasCierreParqueMock()),
  );

  app.get("/api/actividades/:id/turnos", (req, res) => {
    const actividad = buscarActividad(req.params.id);
    const fecha = req.query.fecha;
    validarFecha(fecha);
    const inscripciones = almacen.listar();
    res.json(
      crearHorariosActividadesMock().map((horario) => {
        const fechaHora = fechaHoraDelParque(fecha, horario);
        const cuposOcupados = inscripciones
          .filter(
            (i) => i.actividadId === actividad.id && i.fechaHora === fechaHora,
          )
          .reduce((total, i) => total + i.participantes.length, 0);
        const cuposDisponibles = Math.max(
          0,
          actividad.cuposPorTurno - cuposOcupados,
        );
        let motivoNoDisponible: string | undefined;
        try {
          validarTurnoApi(fecha, horario);
        } catch (error) {
          if (!(error instanceof InscripcionRechazadaError)) throw error;
          motivoNoDisponible = MENSAJES_RECHAZO[error.motivo];
        }
        if (!motivoNoDisponible && cuposDisponibles === 0)
          motivoNoDisponible = MENSAJES_RECHAZO.SIN_CUPOS;
        return {
          horario,
          cupoMaximo: actividad.cuposPorTurno,
          cuposOcupados,
          cuposDisponibles,
          disponible: !motivoNoDisponible,
          motivoNoDisponible,
        };
      }),
    );
  });

  app.post("/api/inscripciones", (req, res) => {
    if (!esObjeto(req.body))
      throw new SolicitudApiError(
        "DATOS_INVALIDOS",
        "Debe enviar una solicitud JSON.",
      );
    const body = req.body;
    const actividad = buscarActividad(body.activityId);
    const fecha = body.fecha;
    validarFecha(fecha);
    const horario = body.horario;
    validarTurnoApi(fecha, horario);
    const participantes = leerParticipantes(body.participantes);
    const fechaHora = fechaHoraDelParque(fecha, horario);

    const reserva = almacen.transaccion((inscripciones) => {
      // El dominio valida reservas simultáneas existentes; aquí se evita
      // repetir un DNI dentro del mismo grupo, como ya hacía el formulario.
      const dnis = new Set<string>();
      for (const participante of participantes) {
        if (!participante.dni) continue; // El dominio informa PARTICIPANTE_INCOMPLETO.
        if (dnis.has(participante.dni)) {
          throw new InscripcionRechazadaError("INSCRIPCION_SUPERPUESTA");
        }
        dnis.add(participante.dni);
      }

      const indiceNuevaInscripcion = inscripciones.length;
      const resultado = inscribirActividad(
        {
          actividad: actividad.nombre,
          horario: fechaHora,
          participantes: participantes.map((p) => ({
            ...p,
            talla: p.talle,
            talleVestimenta: p.talle,
          })),
          aceptaTerminos: body.aceptaTerminos,
        },
        { actividades, inscripciones },
      );
      // La validación y el registro son síncronos: nadie puede ocupar cupos entre ambos.
      const registro = inscripciones[indiceNuevaInscripcion];
      return {
        id: String(registro.id),
        orderNumber: `ECO-${String(registro.id).padStart(5, "0")}`,
        activityId: actividad.id,
        activityName: actividad.nombre,
        fecha,
        horario,
        participantes,
        titularNombre:
          typeof body.titularNombre === "string"
            ? body.titularNombre
            : "Visitante",
        titularEmail:
          typeof body.titularEmail === "string" ? body.titularEmail : "",
        createdAt: new Date(Date.now()).toISOString(),
        codigoQR: resultado.codigoQR,
      };
    });
    res.status(201).json(reserva);
  });

  app.use("/api", (_req, res) =>
    res.status(404).json({
      exito: false,
      motivo: "RUTA_NO_ENCONTRADA",
      mensaje: "La ruta solicitada no existe.",
    }),
  );

  const manejarError: ErrorRequestHandler = (
    error: unknown,
    _req,
    res,
    _next,
  ) => {
    if (error instanceof InscripcionRechazadaError) {
      const estado = ["SIN_CUPOS", "INSCRIPCION_SUPERPUESTA"].includes(
        error.motivo,
      )
        ? 409
        : 400;
      res.status(estado).json({
        exito: false,
        motivo: error.motivo,
        mensaje: MENSAJES_RECHAZO[error.motivo],
      });
      return;
    }
    if (error instanceof SolicitudApiError) {
      res
        .status(error.estado)
        .json({ exito: false, motivo: error.motivo, mensaje: error.message });
      return;
    }
    if (
      esObjeto(error) &&
      (error.type === "entity.parse.failed" ||
        error.type === "entity.too.large")
    ) {
      res.status(400).json({
        exito: false,
        motivo: "DATOS_INVALIDOS",
        mensaje: "El cuerpo JSON no es válido o supera el tamaño permitido.",
      });
      return;
    }
    console.error(error);
    res.status(500).json({
      exito: false,
      motivo: "ERROR_INTERNO",
      mensaje: "No se pudo procesar la inscripción.",
    });
  };
  app.use(manejarError);
  return app;
}
