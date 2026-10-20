import { crearActividadesMock, crearSesionUsuarioMock } from "./datos-mocks";
import {
  InscripcionRechazadaError,
  type Actividad,
  type Inscripcion,
  type Participante,
} from "./modelos";

const TALLES_PERMITIDOS = ["XS", "S", "M", "L", "XL", "XXL"];
const ANTICIPACION_MAXIMA_MS = 24 * 60 * 60 * 1000;

interface ContextoInscripcion {
  actividades?: Actividad[];
  inscripciones?: Inscripcion[];
}

export function inscribirActividad(
  solicitud: any,
  contexto: ContextoInscripcion = {}
): any {
  if (!solicitud?.actividad) {
    throw new Error("Debe seleccionar una actividad");
  }

  const actividades = contexto.actividades ?? crearActividadesMock();
  const actividad = buscarActividad(actividades, solicitud.actividad);
  validarDisponibilidad(actividad);

  if (!solicitud.participantes || solicitud.participantes.length === 0) {
    throw new Error("Debe ingresar al menos un participante");
  }

  validarDatosObligatoriosParticipantes(solicitud.participantes);

  validarTerminos(solicitud.aceptaTerminos);

  // Validación de vestimenta si la actividad lo demanda
  if (actividad?.requiereVestimenta) {
    validarVestimenta(solicitud.participantes);
  }
  // Validación de edad mínima si la actividad la define
  if (actividad?.edadMinima !== undefined) {
    validarEdadMinima(solicitud.participantes, actividad.edadMinima);
  }

  validarAnticipacion(solicitud.horario);

  const inscripciones = contexto.inscripciones ?? [];

  if (actividad) {
    const cuposOcupados = inscripciones
      .filter(
        (inscripcion) =>
          inscripcion.actividadId === actividad.id &&
          inscripcion.fechaHora === solicitud.horario
      )
      .reduce(
        (total, inscripcion) => total + inscripcion.participantes.length,
        0
      );

    const cuposDisponibles = actividad.cuposPorTurno - cuposOcupados;

    if (solicitud.participantes.length > cuposDisponibles) {
      throw new InscripcionRechazadaError("SIN_CUPOS");
    }

    registrarInscripcion(solicitud, actividad, inscripciones);
  }

  const codigoQR = `QR-${solicitud.actividad}-${Date.now()}`;

  return {
    exito: true,
    codigoQR,
  };
}

function buscarActividad(
  actividades: Actividad[],
  nombre: string
): Actividad | undefined {
  return actividades.find((actividad) => actividad.nombre === nombre);
}

function validarDisponibilidad(actividad: Actividad | undefined): void {
  if (actividad?.disponible === false) {
    throw new InscripcionRechazadaError("ACTIVIDAD_NO_DISPONIBLE");
  }
}

function validarEdadMinima(
  participantes: Participante[],
  edadMinima: number
): void {
  for (const participante of participantes) {
    if (participante.edad < edadMinima) {
      throw new InscripcionRechazadaError(
        "EDAD_MINIMA_NO_CUMPLIDA"
      );
    }
  }
}

function validarTerminos(aceptaTerminos: boolean): void {
  if (aceptaTerminos !== true) {
    throw new InscripcionRechazadaError(
      "TERMINOS_NO_ACEPTADOS"
    );
  }
}

function validarDatosObligatoriosParticipantes(participantes: Participante[]): void {
  for (const participante of participantes) {
    if (
      !participante.dni ||
      participante.edad === undefined ||
      participante.edad === null
    ) {
      throw new InscripcionRechazadaError(
        "PARTICIPANTE_INCOMPLETO"
      );
    }
  }
}

function validarAnticipacion(horario: string): void {
  const anticipacionMs =
    new Date(horario).getTime() - Date.now();

  if (anticipacionMs > ANTICIPACION_MAXIMA_MS) {
    throw new InscripcionRechazadaError(
      "FUERA_DE_ANTICIPACION"
    );
  }
}

function registrarInscripcion(
  solicitud: any,
  actividad: Actividad,
  inscripciones: Inscripcion[]
): void {
  const nuevaInscripcion: Inscripcion = {
    id: Math.max(0, ...inscripciones.map((i) => i.id)) + 1,
    usuarioId: crearSesionUsuarioMock().usuarioId,
    actividadId: actividad.id,
    fechaHora: solicitud.horario,
    participantes: solicitud.participantes,
  };

  inscripciones.push(nuevaInscripcion);
}

function validarVestimenta(participantes: { talla?: string }[]): void {
  for (const participante of participantes) {
    if (!participante.talla) {
      throw new InscripcionRechazadaError("VESTIMENTA_REQUERIDA");
    }

    if (!TALLES_PERMITIDOS.includes(participante.talla)) {
      throw new Error("Talle no válido");
    }
  }
}