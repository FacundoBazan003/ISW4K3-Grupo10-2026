export type ActivityId = "tirolesa" | "safari" | "palestra" | "jardineria";

export type TalleVestimenta = "XS" | "S" | "M" | "L" | "XL" | "XXL";

export const TALLES_DISPONIBLES: readonly TalleVestimenta[] = [
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "XXL",
] as const;

export interface Activity {
    id: ActivityId;
    name: string;
    description: string;
    icon: string;
    cuposPorTurno: number;
    edadMinima: number | null;
    requiereTalle: boolean;
    turnos: string[];
    terminosYCondiciones: string;
}

export interface Participant {
    nombre: string;
    dni: string;
    edad: number;
    talle?: TalleVestimenta;
}

export interface Reservation {
    id: string;
    orderNumber: string;
    activityId: ActivityId;
    activityName: string;
    fecha: string; // Formato YYYY-MM-DD
    horario: string; // Formato HH:mm
    participantes: Participant[];
    titularNombre: string;
    titularEmail: string;
    createdAt: string;
}

export interface SlotAvailability {
    horario: string;
    cupoMaximo: number;
    cuposOcupados: number;
    cuposDisponibles: number;
    disponible: boolean;
    motivoNoDisponible?: string;
}
