import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { activityService, type CreateReservationInput } from "@/services/activityService";
import type { Activity, ActivityId, Reservation, SlotAvailability } from "@/types/activity";

export function useActivities() {
    return useQuery<Activity[], Error>({
        queryKey: ["activities"],
        queryFn: () => activityService.getActivities(),
        staleTime: 1000 * 60 * 10,
        retry: false,
    });
}

export function useActivity(id: string | undefined) {
    return useQuery<Activity | null, Error>({
        queryKey: ["activity", id],
        queryFn: () => (id ? activityService.getActivityById(id) : Promise.resolve(null)),
        enabled: Boolean(id),
    });
}

export function useParkRules() {
    return useQuery({
        queryKey: ["park-rules"],
        queryFn: () => activityService.getParkRules(),
        retry: false,
    });
}

export function useSlotsAvailability(
    activityId: ActivityId | undefined,
    fecha: string | undefined,
) {
    return useQuery<SlotAvailability[], Error>({
        queryKey: ["slots", activityId, fecha],
        queryFn: () => {
            if (!activityId || !fecha) {
                return Promise.resolve([]);
            }
            return activityService.getSlotsAvailability(activityId, fecha);
        },
        enabled: Boolean(activityId && fecha),
        staleTime: 0,
        refetchInterval: 15000,
        retry: false,
    });
}

export function useCreateReservation() {
    const queryClient = useQueryClient();

    return useMutation<Reservation, Error, CreateReservationInput>({
        mutationFn: (input) => activityService.createReservation(input),
        onSuccess: (_data, variables) => {
            // Invalidar la consulta de cupos para la actividad y fecha correspondientes
            queryClient.invalidateQueries({
                queryKey: ["slots", variables.activityId, variables.fecha],
            });
        },
    });
}
