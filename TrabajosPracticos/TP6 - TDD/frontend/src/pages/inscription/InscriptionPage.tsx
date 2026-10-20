import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/store/authStore";
import { userMock } from "@/mocks/users.mocks";
import {
    useActivities,
    useSlotsAvailability,
    useCreateReservation,
} from "@/hooks/useActivities";
import {
    inscriptionSchema,
    type InscriptionFormData,
} from "@/schemas/inscriptionSchema";
import type { ActivityId, Reservation } from "@/types/activity";

import ActivitySelector from "@/components/inscription/ActivitySelector";
import ActivityDatePicker from "@/components/inscription/ActivityDatePicker";
import ScheduleSelector from "@/components/inscription/ScheduleSelector";
import ParticipantForm from "@/components/inscription/ParticipantForm";
import TermsModal from "@/components/inscription/TermsModal";
import EmailConfirmationModal from "@/components/inscription/EmailConfirmationModal";

export default function InscriptionPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const queryActivity = searchParams.get("activity") as ActivityId | null;

    const { user } = useAuthStore();
    // Si no hay usuario logueado en store, usar el mock predeterminado (FAQ 19)
    const activeUser = user ?? userMock[0];

    const { data: activities = [], isLoading: isLoadingActivities } = useActivities();
    const [confirmedReservation, setConfirmedReservation] = useState<Reservation | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Formulario principal
    const methods = useForm<InscriptionFormData>({
        resolver: zodResolver(inscriptionSchema),
        defaultValues: {
            activityId: queryActivity ?? "tirolesa",
            fecha: new Date().toISOString().split("T")[0],
            horario: "",
            participantes: [
                {
                    nombre: activeUser.name,
                    dni: "",
                    edad: 25,
                    talle: "M",
                },
            ],
            aceptaTerminos: false,
        },
    });

    const {
        watch,
        setValue,
        handleSubmit,
        formState: { errors },
    } = methods;

    const selectedActivityId = watch("activityId");
    const selectedFecha = watch("fecha");
    const selectedHorario = watch("horario");

    // Sincronizar parámetro URL si cambia la actividad
    useEffect(() => {
        if (queryActivity && queryActivity !== selectedActivityId) {
            setValue("activityId", queryActivity);
        }
    }, [queryActivity, setValue, selectedActivityId]);

    const handleSelectActivity = (id: ActivityId) => {
        setValue("activityId", id, { shouldValidate: true });
        setValue("horario", ""); // Reset de turno si cambia la actividad
        setSearchParams({ activity: id });
    };

    // Consulta de cupos disponibles con TanStack Query
    const {
        data: availableSlots = [],
        isLoading: isLoadingSlots,
    } = useSlotsAvailability(selectedActivityId, selectedFecha);

    const { mutate: createReservation, isPending: isSubmitting } = useCreateReservation();

    const selectedActivity = activities.find((a) => a.id === selectedActivityId);
    const selectedSlotInfo = availableSlots.find((s) => s.horario === selectedHorario);

    const onSubmit = (data: InscriptionFormData) => {
        setSubmitError(null);

        createReservation(
            {
                activityId: data.activityId,
                fecha: data.fecha,
                horario: data.horario,
                participantes: data.participantes,
                titularNombre: activeUser.name,
                titularEmail: activeUser.email,
            },
            {
                onSuccess: (reservation) => {
                    setConfirmedReservation(reservation);
                },
                onError: (err) => {
                    setSubmitError(err.message || "Ocurrió un error al procesar la inscripción.");
                },
            },
        );
    };

    if (isLoadingActivities) {
        return (
            <div className="container mx-auto max-w-5xl px-4 py-16 text-center">
                <span className="loading loading-spinner loading-lg text-primary"></span>
                <p className="mt-3 text-sm text-base-content/70">
                    Cargando actividades disponibles...
                </p>
            </div>
        );
    }

    return (
        <FormProvider {...methods}>
            <div className="container mx-auto max-w-5xl px-4 py-8 sm:py-12 space-y-8">
                {/* Header / Breadcrumb */}
                <div className="space-y-2">
                    <div className="text-xs breadcrumbs text-base-content/60">
                        <ul>
                            <li>
                                <Link to="/" className="hover:text-primary">
                                    Inicio
                                </Link>
                            </li>
                            <li className="font-bold text-base-content">
                                Inscripción a Actividad
                            </li>
                        </ul>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <span className="inline-block text-xs font-bold tracking-widest text-primary uppercase">
                                Reserva de Turnos
                            </span>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content">
                                Inscribirme a una Actividad
                            </h1>
                            <p className="text-xs sm:text-sm text-base-content/70 mt-1">
                                Completá los datos del turno y los participantes para asegurar tus lugares.
                            </p>
                        </div>

                        <div className="bg-base-200/80 px-4 py-2 rounded-2xl border border-base-300/80 text-xs text-base-content">
                            <span className="text-base-content/60 block text-[10px] uppercase font-bold">
                                Titular de la reserva:
                            </span>
                            <span className="font-bold text-base-content">
                                {activeUser.name}
                            </span>{" "}
                            <span className="text-[11px] text-base-content/60">
                                ({activeUser.email})
                            </span>
                        </div>
                    </div>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {/* Paso 1: Selector de Actividad */}
                    <div className="card bg-base-100 border border-base-300 p-5 sm:p-6 rounded-3xl shadow-sm">
                        <ActivitySelector
                            activities={activities}
                            selectedId={selectedActivityId}
                            onSelect={handleSelectActivity}
                            error={errors.activityId?.message}
                        />
                    </div>

                    {/* Paso 2: Fecha y Horarios */}
                    <div className="card bg-base-100 border border-base-300 p-5 sm:p-6 rounded-3xl shadow-sm space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                            <div className="lg:col-span-5">
                                <ActivityDatePicker
                                    value={selectedFecha}
                                    onChange={(newDate) => {
                                        setValue("fecha", newDate, { shouldValidate: true });
                                        setValue("horario", ""); // Reset horario al cambiar fecha
                                    }}
                                    error={errors.fecha?.message}
                                />
                            </div>

                            <div className="lg:col-span-7">
                                <ScheduleSelector
                                    slots={availableSlots}
                                    selectedHorario={selectedHorario}
                                    onSelectHorario={(h) =>
                                        setValue("horario", h, { shouldValidate: true })
                                    }
                                    isLoading={isLoadingSlots}
                                    error={errors.horario?.message}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Paso 3: Datos de los Participantes */}
                    <div className="card bg-base-100 border border-base-300 p-5 sm:p-6 rounded-3xl shadow-sm">
                        <ParticipantForm
                            requiereTalle={selectedActivity?.requiereTalle ?? false}
                            edadMinima={selectedActivity?.edadMinima ?? null}
                            cuposDisponibles={selectedSlotInfo?.cuposDisponibles}
                            hasSelectedHorario={Boolean(selectedHorario && selectedSlotInfo?.disponible)}
                        />
                        {errors.participantes?.root && (
                            <p className="text-error text-xs font-medium mt-2">
                                {errors.participantes.root.message}
                            </p>
                        )}
                    </div>

                    {/* Paso 4: Términos y Condiciones */}
                    <div className="card bg-base-100 border border-base-300 p-5 sm:p-6 rounded-3xl shadow-sm">
                        <TermsModal
                            activityName={selectedActivity?.name ?? "la actividad"}
                            termsContent={
                                selectedActivity?.terminosYCondiciones ??
                                "El participante se compromete a respetar todas las normas de seguridad del parque."
                            }
                        />
                    </div>

                    {/* Feedback de Error Global */}
                    {submitError && (
                        <div className="rounded-2xl bg-error/15 border border-error/30 p-4 text-xs text-error font-medium flex items-center gap-3">
                            <span className="text-lg">⚠️</span>
                            <div>
                                <strong className="block text-sm">No pudimos procesar la reserva</strong>
                                <span>{submitError}</span>
                            </div>
                        </div>
                    )}

                    {/* Botón de Confirmación */}
                    <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                        <Link
                            to="/"
                            className="btn btn-ghost rounded-full px-6 text-xs font-bold w-full sm:w-auto"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn btn-primary rounded-full px-8 text-sm font-bold shadow-md active:scale-95 transition-transform w-full sm:w-auto gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="loading loading-spinner loading-xs"></span>
                                    <span>Confirmando inscripción...</span>
                                </>
                            ) : (
                                <span>Confirmar Reserva</span>
                            )}
                        </button>
                    </div>
                </form>

                {/* Modal de Confirmación y Envío de Correo (FAQ 5, 18, 28) */}
                {confirmedReservation && (
                    <EmailConfirmationModal
                        reservation={confirmedReservation}
                        onClose={() => setConfirmedReservation(null)}
                    />
                )}
            </div>
        </FormProvider>
    );
}
