import {
  crearHorariosActividadesMock,
  crearReglasCierreParqueMock,
} from "../inscripciones/datos-mocks";
import {
  InscripcionRechazadaError,
  type DiaSemana,
} from "../inscripciones/modelos";

const DIAS_SEMANA: DiaSemana[] = [
  "DOMINGO",
  "LUNES",
  "MARTES",
  "MIERCOLES",
  "JUEVES",
  "VIERNES",
  "SABADO",
];

export class SolicitudApiError extends Error {
  constructor(
    public readonly motivo: string,
    mensaje: string,
    public readonly estado = 400,
  ) {
    super(mensaje);
  }
}

export function esEdadParticipanteValida(edad: unknown): edad is number {
  return (
    typeof edad === "number" &&
    Number.isInteger(edad) &&
    edad >= 0 &&
    edad <= 120
  );
}

export function validarFecha(fecha: unknown): asserts fecha is string {
  if (typeof fecha !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    throw new SolicitudApiError(
      "DATOS_INVALIDOS",
      "Debe indicar una fecha válida (AAAA-MM-DD).",
    );
  }
  const date = new Date(`${fecha}T12:00:00Z`);
  if (
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== fecha
  ) {
    throw new SolicitudApiError(
      "DATOS_INVALIDOS",
      "La fecha indicada no existe.",
    );
  }
}

export function fechaHoraDelParque(fecha: string, horario: string): string {
  return `${fecha}T${horario}:00-03:00`;
}

// Compatibilidad con las reglas que ya aplicaba el frontend con mocks.
// Se mantienen fuera de inscribirActividad para conservar su avance de TDD.
export function validarTurnoApi(
  fecha: string,
  horario: unknown,
): asserts horario is string {
  validarFecha(fecha);
  if (
    typeof horario !== "string" ||
    !crearHorariosActividadesMock().includes(horario)
  ) {
    throw new InscripcionRechazadaError("HORARIO_NO_DISPONIBLE");
  }
  const reglas = crearReglasCierreParqueMock();
  const fechaCalendario = new Date(`${fecha}T12:00:00Z`);
  const diaSemana = DIAS_SEMANA[fechaCalendario.getUTCDay()];
  if (
    reglas.diasCerrados.includes(diaSemana) ||
    reglas.fechasCerradas.includes(fecha) ||
    reglas.diasMesCerrados.some(
      (cierre) =>
        cierre.dia === fechaCalendario.getUTCDate() &&
        cierre.mes === fechaCalendario.getUTCMonth() + 1,
    )
  ) {
    throw new InscripcionRechazadaError("PARQUE_CERRADO");
  }
  const anticipacion =
    new Date(fechaHoraDelParque(fecha, horario)).getTime() - Date.now();
  if (anticipacion > 24 * 60 * 60 * 1000) {
    throw new InscripcionRechazadaError("FUERA_DE_ANTICIPACION");
  }
  // El cierre incluye el instante exacto de los 15 minutos previos al turno.
  if (anticipacion <= 15 * 60 * 1000) {
    throw new InscripcionRechazadaError("CIERRE_DE_INSCRIPCION");
  }
}

export const MENSAJES_RECHAZO: Record<string, string> = {
  ACTIVIDAD_NO_DISPONIBLE: "La actividad seleccionada no está disponible.",
  HORARIO_NO_DISPONIBLE:
    "Debe seleccionar un turno en punto entre las 09:00 y las 17:00.",
  PARQUE_CERRADO: "El parque está cerrado en la fecha seleccionada.",
  SIN_CUPOS: "No hay lugares suficientes para todo el grupo.",
  SIN_PARTICIPANTES: "Debe ingresar al menos un participante.",
  PARTICIPANTE_INCOMPLETO: "Todos los participantes deben informar nombre, DNI y edad.",
  TERMINOS_NO_ACEPTADOS:
    "Debe aceptar los términos y condiciones de la actividad.",
  VESTIMENTA_REQUERIDA:
    "Debe informar el talle de cada participante para esta actividad.",
  TALLE_INVALIDO: "El talle debe ser XS, S, M, L, XL o XXL.",
  EDAD_MINIMA_NO_CUMPLIDA:
    "Un participante no cumple la edad mínima de la actividad.",
  FUERA_DE_ANTICIPACION: "El turno se habilita 24 horas antes de su inicio.",
  CIERRE_DE_INSCRIPCION:
    "La inscripción cierra 15 minutos antes del inicio del turno.",
  INSCRIPCION_SUPERPUESTA:
    "Un participante ya tiene una reserva en ese mismo horario.",
};
