export type NombreActividad = "Tirolesa" | "Safari" | "Palestra" | "Jardinería";

export type TalleVestimenta = "XS" | "S" | "M" | "L" | "XL" | "XXL";

export type DiaSemana =
  | "DOMINGO"
  | "LUNES"
  | "MARTES"
  | "MIERCOLES"
  | "JUEVES"
  | "VIERNES"
  | "SABADO";

export interface CierreHorarioParque {
  diasSemana?: DiaSemana[];
  desde: string;
  hasta: string;
}

export interface ReglasCierreParque {
  diasCerrados: DiaSemana[];
  fechasCerradas: string[];
  diasMesCerrados: { dia: number; mes: number }[];
  horariosCerrados: CierreHorarioParque[];
}

export interface Actividad {
  id: string;
  nombre: NombreActividad;
  disponible: boolean;
  requiereVestimenta: boolean;
  cuposPorTurno: number;
  edadMinima?: number;
}

export interface Participante {
  nombre?: string;
  dni: string;
  edad: number;
  talleVestimenta?: TalleVestimenta;
}

export interface SolicitudInscripcion {
  actividadId: string;
  fechaHora: string;
  participantes: Participante[];
  aceptaTerminos: boolean;
}

export interface SesionUsuarioMock {
  usuarioId: string;
}

export interface Inscripcion {
  id: number;
  usuarioId: string;
  actividadId: string;
  fechaHora: string;
  participantes: Participante[];
}

export type MotivoRechazo =
  | "ACTIVIDAD_NO_DISPONIBLE"
  | "HORARIO_NO_DISPONIBLE"
  | "PARQUE_CERRADO"
  | "SIN_CUPOS"
  | "TERMINOS_NO_ACEPTADOS"
  | "VESTIMENTA_REQUERIDA"
  | "TALLE_INVALIDO"
  | "PARTICIPANTE_INCOMPLETO"
  | "EDAD_MINIMA_NO_CUMPLIDA"
  | "FUERA_DE_ANTICIPACION"
  | "CIERRE_DE_INSCRIPCION"
  | "INSCRIPCION_SUPERPUESTA";

export class InscripcionRechazadaError extends Error {
  constructor(public readonly motivo: MotivoRechazo) {
    super(`Inscripción rechazada: ${motivo}`);
    this.name = "InscripcionRechazadaError";
  }
}
