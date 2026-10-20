import { crearActividadesMock } from "./datos-mocks";
import {
  InscripcionRechazadaError,
  type Actividad,
  type Participante,
} from "./modelos";

const TALLES_PERMITIDOS = ["XS", "S", "M", "L", "XL", "XXL"];
const EDAD_MINIMA_PALESTRA = 12;
const ANTICIPACION_MAXIMA_MS = 24 * 60 * 60 * 1000;

interface ContextoInscripcion {
  actividades?: Actividad[];
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
    for (const p of solicitud.participantes) {
      if (!p.talla) {
        throw new Error("Requiere talle de vestimenta");
      }
      if (!TALLES_PERMITIDOS.includes(p.talla)) {
        throw new Error("Talle no válido");
      }
    }
  }
    // Validación de edad mínima de Palestra.
  if (solicitud.actividad === "Palestra") {
    validarEdadMinima(
      solicitud.participantes,
      EDAD_MINIMA_PALESTRA
    );
  }
  if (solicitud.actividad === "Tirolesa") {
    validarEdadMinima(solicitud.participantes, 8);
  }

  validarAnticipacion(solicitud.horario);

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