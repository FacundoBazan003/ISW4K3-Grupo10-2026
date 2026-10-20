import type { SlotAvailability } from "@/types/activity";
import { InfoIcon, CheckIcon } from "@phosphor-icons/react";

interface ScheduleSelectorProps {
    slots: SlotAvailability[];
    selectedHorario?: string;
    onSelectHorario: (horario: string) => void;
    isLoading?: boolean;
    error?: string;
}

export default function ScheduleSelector({
    slots,
    selectedHorario,
    onSelectHorario,
    isLoading,
    error,
}: ScheduleSelectorProps) {
    if (isLoading) {
        return (
            <div className="space-y-3">
                <label className="text-base-content/80 text-xs font-bold tracking-wider uppercase">
                    Paso 2: Horarios y Cupos Disponibles
                </label>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-5">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <div
                            key={i}
                            className="bg-base-200/60 border-base-300/40 h-16 animate-pulse rounded-xl border"
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (slots.length === 0) {
        return (
            <div className="border-base-300 text-base-content/70 rounded-2xl border border-dashed p-6 text-center text-xs">
                Seleccioná una fecha para ver los turnos y cupos disponibles.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                <div>
                    <label className="text-base-content/80 text-xs font-bold tracking-wider uppercase">
                        Paso 2: Horarios y Cupos Disponibles
                    </label>
                    <p className="text-base-content/60 text-[11px]">
                        Turnos de 1 hora entre 09:00 y 17:00 hs (cupos en tiempo real)
                    </p>
                </div>
            </div>

            {/* Aviso informativo de reglas de reserva */}
            <div className="bg-base-200/90 border-base-300/80 text-base-content/85 flex items-center gap-2.5 rounded-xl border px-3.5 py-2 text-xs">
                <InfoIcon size={18} weight="bold" className="text-primary shrink-0" />
                <span>
                    Los turnos se habilitan{" "}
                    <strong className="text-base-content font-bold">
                        dentro de las 24 hs previas
                    </strong>{" "}
                    y cierran{" "}
                    <strong className="text-base-content font-bold">15 minutos antes</strong> de su
                    inicio.
                </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {slots.map((slot) => {
                    const isSelected = selectedHorario === slot.horario;
                    const isDisabled = !slot.disponible;

                    return (
                        <button
                            key={slot.horario}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => onSelectHorario(slot.horario)}
                            className={`flex min-h-[5.25rem] flex-col justify-between rounded-2xl border p-3.5 text-left transition-all ${
                                isDisabled
                                    ? "bg-base-200/50 border-base-300 cursor-not-allowed opacity-60"
                                    : isSelected
                                      ? "border-primary bg-primary text-primary-content ring-primary/20 scale-[1.01] shadow-sm ring-2"
                                      : "border-base-300 bg-base-100 hover:border-primary/60 hover:bg-base-200/60 shadow-xs"
                            }`}
                        >
                            <div className="flex w-full items-center justify-between">
                                <span className="font-mono text-sm font-extrabold whitespace-nowrap">
                                    {slot.horario} hs
                                </span>
                                {isSelected && (
                                    <span className="badge badge-xs text-primary border-0 bg-white font-bold flex items-center justify-center p-0.5">
                                        <CheckIcon size={10} weight="bold" />
                                    </span>
                                )}
                            </div>

                            <div className="mt-2.5 flex w-full items-center">
                                {isDisabled ? (
                                    <span
                                        className="badge badge-error badge-xs font-semibold px-2 py-1 leading-none"
                                        title={slot.motivoNoDisponible}
                                    >
                                        {slot.cuposDisponibles === 0
                                            ? "Sin cupos"
                                            : slot.motivoNoDisponible?.includes("15 min")
                                              ? "Turno cerrado"
                                              : slot.motivoNoDisponible?.includes("24 hs")
                                                ? "Habilita 24 hs antes"
                                                : "No disponible"}
                                    </span>
                                ) : (
                                    <span
                                        className={`badge badge-xs px-2 py-1 font-semibold ${
                                            isSelected
                                                ? "border-0 bg-white/20 text-white"
                                                : slot.cuposDisponibles <= 3
                                                  ? "badge-warning"
                                                  : "badge-accent"
                                        }`}
                                    >
                                        {slot.cuposDisponibles} de {slot.cupoMaximo} libres
                                    </span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {error && <p className="text-error mt-1 text-xs font-medium">{error}</p>}
        </div>
    );
}
