import type { SlotAvailability } from "@/types/activity";

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
                <label className="text-xs font-bold uppercase tracking-wider text-base-content/80">
                    Paso 2: Horarios y Cupos Disponibles
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-16 rounded-xl bg-base-200/60 animate-pulse border border-base-300/40"
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (slots.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-base-300 p-6 text-center text-xs text-base-content/70">
                Seleccioná una fecha para ver los turnos y cupos disponibles.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-base-content/80">
                        Paso 2: Horarios y Cupos Disponibles
                    </label>
                    <p className="text-[11px] text-base-content/60">
                        Turnos de 1 hora entre 09:00 y 17:00 hs (cupos en tiempo real)
                    </p>
                </div>
            </div>

            {/* Aviso informativo de reglas de reserva */}
            <div className="rounded-xl bg-base-200/90 border border-base-300/80 px-3.5 py-2 text-xs text-base-content/85 flex items-center gap-2.5">
                <span className="text-primary text-sm font-bold">ℹ️</span>
                <span>
                    Los turnos se habilitan <strong className="text-base-content font-bold">dentro de las 24 hs previas</strong> y cierran <strong className="text-base-content font-bold">15 minutos antes</strong> de su inicio.
                </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {slots.map((slot) => {
                    const isSelected = selectedHorario === slot.horario;
                    const isDisabled = !slot.disponible;

                    return (
                        <button
                            key={slot.horario}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => onSelectHorario(slot.horario)}
                            className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between min-h-[82px] ${
                                isDisabled
                                    ? "opacity-55 bg-base-200/50 border-base-300 cursor-not-allowed"
                                    : isSelected
                                      ? "border-primary bg-primary text-primary-content shadow-sm ring-2 ring-primary/20 scale-[1.01]"
                                      : "border-base-300 bg-base-100 hover:border-primary/60 hover:bg-base-200/60 shadow-xs"
                            }`}
                        >
                            <div className="flex items-center justify-between w-full">
                                <span className="font-mono text-sm font-extrabold">
                                    {slot.horario} hs
                                </span>
                                {isSelected && (
                                    <span className="badge badge-xs bg-white text-primary font-bold border-0">
                                        ✓
                                    </span>
                                )}
                            </div>

                            <div className="mt-2.5 flex items-center justify-between gap-1 w-full">
                                {isDisabled ? (
                                    <span className="badge badge-error badge-xs font-bold py-1 px-2 shrink-0">
                                        {slot.cuposDisponibles === 0 ? "Sin cupo" : "No disponible"}
                                    </span>
                                ) : (
                                    <span
                                        className={`badge badge-xs font-semibold py-1 px-2 ${
                                            isSelected
                                                ? "bg-white/20 text-white border-0"
                                                : slot.cuposDisponibles <= 3
                                                  ? "badge-warning"
                                                  : "badge-accent"
                                        }`}
                                    >
                                        {slot.cuposDisponibles} de {slot.cupoMaximo} libres
                                    </span>
                                )}

                                {isDisabled && slot.motivoNoDisponible && (
                                    <span
                                        className="text-[10px] text-base-content/60 truncate text-right block"
                                        title={slot.motivoNoDisponible}
                                    >
                                        {slot.motivoNoDisponible}
                                    </span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {error && (
                <p className="text-error text-xs font-medium mt-1">
                    {error}
                </p>
            )}
        </div>
    );
}
