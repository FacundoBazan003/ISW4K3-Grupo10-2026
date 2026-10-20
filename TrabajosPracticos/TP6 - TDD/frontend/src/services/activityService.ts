import { ACTIVITIES_DATA } from "@/mocks/activities.mocks";
import { useReservationStore } from "@/store/reservationStore";
import type {
    Activity,
    ActivityId,
    Participant,
    Reservation,
    SlotAvailability,
} from "@/types/activity";

export interface CreateReservationInput {
    activityId: ActivityId;
    fecha: string; // YYYY-MM-DD
    horario: string; // HH:mm
    participantes: Participant[];
    titularNombre: string;
    titularEmail: string;
}

/**
 * Verifica si el parque se encuentra abierto en la fecha especificada.
 * Lunes cerrado; 25 de diciembre y 1 de enero festivos cerrados.
 */
export function isParkOpenOnDate(date: Date): { isOpen: boolean; reason?: string } {
    // Si la fecha fue generada en medianoche UTC (como hace Cally), usamos métodos UTC
    // para evitar el desfase de zona horaria negativa (ej. UTC-3 de Argentina).
    const isUtcMidnight =
        date.getUTCHours() === 0 &&
        date.getUTCMinutes() === 0 &&
        date.getUTCSeconds() === 0;

    const dayOfWeek = isUtcMidnight ? date.getUTCDay() : date.getDay(); // 0 = Domingo, 1 = Lunes, ...
    if (dayOfWeek === 1) {
        return { isOpen: false, reason: "Parque cerrado los lunes." };
    }

    const month = isUtcMidnight ? date.getUTCMonth() : date.getMonth(); // 0-indexed (11 = Diciembre, 0 = Enero)
    const dayOfMonth = isUtcMidnight ? date.getUTCDate() : date.getDate();

    if (month === 11 && dayOfMonth === 25) {
        return { isOpen: false, reason: "Feriado de Navidad (Cerrado)." };
    }

    if (month === 0 && dayOfMonth === 1) {
        return { isOpen: false, reason: "Feriado de Año Nuevo (Cerrado)." };
    }

    return { isOpen: true };
}

/**
 * Valida si un turno cumple con la ventana de reserva:
 * - Dentro de las 24 hs previas al inicio del turno (FAQ 23).
 * - Con un margen de anticipación de hasta 15 minutos antes del turno (FAQ 30).
 */
export function isTurnoInWindow(fechaStr: string, horarioStr: string): {
    isValid: boolean;
    reason?: string;
} {
    const [year, month, day] = fechaStr.split("-").map(Number);
    const [hour, minute] = horarioStr.split(":").map(Number);
    const turnoDate = new Date(year, month - 1, day, hour, minute, 0);

    const now = new Date();

    // 15 minutos antes del inicio del turno
    const fifteenMinutesBeforeTurno = new Date(turnoDate.getTime() - 15 * 60 * 1000);
    if (now > fifteenMinutesBeforeTurno) {
        return {
            isValid: false,
            reason: "Turno cerrado (15 min antes)",
        };
    }

    // Máximo 24 hs previas al turno
    const twentyFourHoursBeforeTurno = new Date(turnoDate.getTime() - 24 * 60 * 60 * 1000);
    if (now < twentyFourHoursBeforeTurno) {
        return {
            isValid: false,
            reason: "Habilitado 24 hs antes",
        };
    }

    return { isValid: true };
}

export const activityService = {
    async getActivities(): Promise<Activity[]> {
        // Simular latencia de red
        await new Promise((resolve) => setTimeout(resolve, 80));
        return ACTIVITIES_DATA;
    },

    async getActivityById(id: string): Promise<Activity | null> {
        await new Promise((resolve) => setTimeout(resolve, 50));
        const found = ACTIVITIES_DATA.find((act) => act.id === id);
        return found ?? null;
    },

    async getSlotsAvailability(
        activityId: ActivityId,
        fecha: string,
    ): Promise<SlotAvailability[]> {
        await new Promise((resolve) => setTimeout(resolve, 80));

        const activity = ACTIVITIES_DATA.find((a) => a.id === activityId);
        if (!activity) {
            throw new Error(`Actividad no encontrada: ${activityId}`);
        }

        const [y, m, d] = fecha.split("-").map(Number);
        const selectedDate = new Date(y, m - 1, d);
        const parkStatus = isParkOpenOnDate(selectedDate);

        const store = useReservationStore.getState();

        return activity.turnos.map((horario) => {
            if (!parkStatus.isOpen) {
                return {
                    horario,
                    cupoMaximo: activity.cuposPorTurno,
                    cuposOcupados: 0,
                    cuposDisponibles: 0,
                    disponible: false,
                    motivoNoDisponible: parkStatus.reason,
                };
            }

            const windowStatus = isTurnoInWindow(fecha, horario);
            const occupied = store.getOccupiedSlotsCount(activityId, fecha, horario);
            const available = Math.max(0, activity.cuposPorTurno - occupied);

            if (!windowStatus.isValid) {
                return {
                    horario,
                    cupoMaximo: activity.cuposPorTurno,
                    cuposOcupados: occupied,
                    cuposDisponibles: available,
                    disponible: false,
                    motivoNoDisponible: windowStatus.reason,
                };
            }

            return {
                horario,
                cupoMaximo: activity.cuposPorTurno,
                cuposOcupados: occupied,
                cuposDisponibles: available,
                disponible: available > 0,
                motivoNoDisponible: available === 0 ? "Sin cupos disponibles" : undefined,
            };
        });
    },

    async createReservation(input: CreateReservationInput): Promise<Reservation> {
        await new Promise((resolve) => setTimeout(resolve, 150));

        const activity = ACTIVITIES_DATA.find((a) => a.id === input.activityId);
        if (!activity) {
            throw new Error("Actividad inválida");
        }

        // 1. Validar apertura de parque
        const [y, m, d] = input.fecha.split("-").map(Number);
        const parkStatus = isParkOpenOnDate(new Date(y, m - 1, d));
        if (!parkStatus.isOpen) {
            throw new Error(parkStatus.reason ?? "El parque está cerrado en la fecha seleccionada.");
        }

        // 2. Validar ventana temporal (24h y 15m)
        const windowStatus = isTurnoInWindow(input.fecha, input.horario);
        if (!windowStatus.isValid) {
            throw new Error(windowStatus.reason ?? "El turno seleccionado no está disponible para reserva.");
        }

        const store = useReservationStore.getState();

        // 3. Validar cupos disponibles suficientes
        const occupied = store.getOccupiedSlotsCount(input.activityId, input.fecha, input.horario);
        const remaining = activity.cuposPorTurno - occupied;
        if (input.participantes.length > remaining) {
            throw new Error(
                `No hay cupos suficientes para ${input.participantes.length} persona(s). Cupos disponibles: ${remaining}.`,
            );
        }

        // 4. Validar solapamiento de DNI en otros turnos simultáneos (FAQ 29)
        for (const p of input.participantes) {
            const overlapCheck = store.hasOverlappingDni(p.dni, input.fecha, input.horario);
            if (overlapCheck.overlapping) {
                throw new Error(
                    `El participante con DNI ${p.dni} (${p.nombre}) ya posee una reserva en el mismo horario en ${overlapCheck.activityName ?? "otra actividad"}.`,
                );
            }
        }

        // 5. Crear la reserva
        const orderNumber = `ECO-${Math.floor(10000 + Math.random() * 90000)}`;
        const newReservation: Reservation = {
            id: crypto.randomUUID(),
            orderNumber,
            activityId: input.activityId,
            activityName: activity.name,
            fecha: input.fecha,
            horario: input.horario,
            participantes: input.participantes,
            titularNombre: input.titularNombre,
            titularEmail: input.titularEmail,
            createdAt: new Date().toISOString(),
        };

        store.addReservation(newReservation);
        return newReservation;
    },
};
