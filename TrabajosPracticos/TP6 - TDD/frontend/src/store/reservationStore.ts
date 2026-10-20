import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ActivityId, Reservation } from "@/types/activity";

interface ReservationStoreState {
    reservations: Reservation[];
    addReservation: (reservation: Reservation) => void;
    getOccupiedSlotsCount: (activityId: ActivityId, fecha: string, horario: string) => number;
    hasOverlappingDni: (
        dni: string,
        fecha: string,
        horario: string,
    ) => { overlapping: boolean; activityName?: string };
    resetToInitialMock: () => void;
}

const INITIAL_MOCK_RESERVATIONS: Reservation[] = [
    // Simulación de un turno de Tirolesa casi lleno (10 cupos totales, 10 ocupados para probar "Sin cupo")
    {
        id: "mock-res-1",
        orderNumber: "ECO-10001",
        codigoQR: "QR-MOCK-10001",
        activityId: "tirolesa",
        activityName: "Tirolesa",
        fecha: new Date().toISOString().split("T")[0],
        horario: "11:00",
        participantes: Array.from({ length: 10 }, (_, i) => ({
            nombre: `Visitante Prueba ${i + 1}`,
            dni: `3000000${i}`,
            edad: 25,
            talle: "M",
        })),
        titularNombre: "Visitante Ejemplo",
        titularEmail: "visitante@ejemplo.com",
        createdAt: new Date().toISOString(),
    },
    // Simulación de un participante con DNI 40123456 ya inscripto en Safari a las 14:00
    {
        id: "mock-res-2",
        orderNumber: "ECO-10002",
        codigoQR: "QR-MOCK-10002",
        activityId: "safari",
        activityName: "Safari",
        fecha: new Date().toISOString().split("T")[0],
        horario: "14:00",
        participantes: [
            {
                nombre: "Ana Gómez",
                dni: "40123456",
                edad: 30,
            },
        ],
        titularNombre: "Juan Perez",
        titularEmail: "juanperez@email.com",
        createdAt: new Date().toISOString(),
    },
];

export const useReservationStore = create<ReservationStoreState>()(
    persist(
        (set, get) => ({
            reservations: INITIAL_MOCK_RESERVATIONS,

            addReservation: (reservation: Reservation) =>
                set((state) => ({
                    reservations: [reservation, ...state.reservations],
                })),

            getOccupiedSlotsCount: (activityId: ActivityId, fecha: string, horario: string) => {
                const relevant = get().reservations.filter(
                    (r) =>
                        r.activityId === activityId && r.fecha === fecha && r.horario === horario,
                );
                return relevant.reduce((total, r) => total + r.participantes.length, 0);
            },

            hasOverlappingDni: (dni: string, fecha: string, horario: string) => {
                const cleanDni = dni.trim();
                const conflict = get().reservations.find(
                    (r) =>
                        r.fecha === fecha &&
                        r.horario === horario &&
                        r.participantes.some((p) => p.dni.trim() === cleanDni),
                );

                if (conflict) {
                    return {
                        overlapping: true,
                        activityName: conflict.activityName,
                    };
                }

                return { overlapping: false };
            },

            resetToInitialMock: () => set({ reservations: INITIAL_MOCK_RESERVATIONS }),
        }),
        {
            name: "eco-harmony-reservations",
        },
    ),
);
