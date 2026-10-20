import { ACTIVITIES_DATA } from "@/mocks/activities.mocks";
import type {
    Activity,
    ActivityId,
    Participant,
    Reservation,
    SlotAvailability,
} from "@/types/activity";

export interface CreateReservationInput {
    activityId: ActivityId;
    fecha: string;
    horario: string;
    participantes: Participant[];
    aceptaTerminos: boolean;
    titularNombre: string;
    titularEmail: string;
}

export interface ParkRules {
    diasCerrados: string[];
    fechasCerradas: string[];
    diasMesCerrados: { dia: number; mes: number }[];
}

export class ApiError extends Error {
    readonly status: number;
    readonly motivo?: string;

    constructor(message: string, status: number, motivo?: string) {
        super(message);
        this.status = status;
        this.motivo = motivo;
    }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    let response: Response;
    try {
        response = await fetch(`/api${path}`, options);
    } catch {
        throw new ApiError("El servicio de reservas no está disponible. Intentá nuevamente.", 0);
    }
    const data = await response.json().catch(() => null);
    if (!response.ok) {
        throw new ApiError(
            data?.mensaje ?? "No se pudo procesar la solicitud.",
            response.status,
            data?.motivo,
        );
    }
    if (data === null)
        throw new ApiError("La respuesta del servicio de reservas no es válida.", response.status);
    return data as T;
}

// Conservar el día de calendario tanto en fechas locales como a medianoche UTC.
export function isParkOpenOnDate(
    date: Date,
    rules: ParkRules,
): { isOpen: boolean; reason?: string } {
    const utc =
        date.getUTCHours() === 0 && date.getUTCMinutes() === 0 && date.getUTCSeconds() === 0;
    const dias = ["DOMINGO", "LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"];
    const dia = utc ? date.getUTCDate() : date.getDate();
    const mes = (utc ? date.getUTCMonth() : date.getMonth()) + 1;
    const anio = utc ? date.getUTCFullYear() : date.getFullYear();
    const fecha = `${anio}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    const diaSemana = dias[utc ? date.getUTCDay() : date.getDay()];
    const cerrado =
        rules.diasCerrados.includes(diaSemana) ||
        rules.fechasCerradas.includes(fecha) ||
        rules.diasMesCerrados.some((cierre) => cierre.dia === dia && cierre.mes === mes);
    return {
        isOpen: !cerrado,
        reason: cerrado ? "El parque está cerrado en esta fecha." : undefined,
    };
}

type ActivityApi = Pick<
    Activity,
    "id" | "name" | "cuposPorTurno" | "edadMinima" | "requiereTalle" | "turnos"
> & {
    disponible: boolean;
};

export const activityService = {
    async getActivities(): Promise<Activity[]> {
        const catalogo = await request<ActivityApi[]>("/actividades");
        return catalogo
            .filter((a) => a.disponible)
            .map((a) => {
                // Los textos y las imágenes permanecen en la presentación; las reglas vienen del backend.
                const presentacion = ACTIVITIES_DATA.find((item) => item.id === a.id);
                return {
                    ...a,
                    description: presentacion?.description ?? "",
                    icon: presentacion?.icon ?? "🌳",
                    terminosYCondiciones: presentacion?.terminosYCondiciones ?? "",
                };
            });
    },
    async getActivityById(id: string): Promise<Activity | null> {
        return (await this.getActivities()).find((a) => a.id === id) ?? null;
    },
    getParkRules(): Promise<ParkRules> {
        return request<ParkRules>("/parque/reglas");
    },
    getSlotsAvailability(activityId: ActivityId, fecha: string): Promise<SlotAvailability[]> {
        return request<SlotAvailability[]>(
            `/actividades/${encodeURIComponent(activityId)}/turnos?fecha=${encodeURIComponent(fecha)}`,
        );
    },
    createReservation(input: CreateReservationInput): Promise<Reservation> {
        return request<Reservation>("/inscripciones", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
        });
    },
};
