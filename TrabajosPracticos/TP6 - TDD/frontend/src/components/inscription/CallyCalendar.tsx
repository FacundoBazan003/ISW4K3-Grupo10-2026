import { useEffect, useRef } from "react";
import "cally";
import { isParkOpenOnDate } from "@/services/activityService";

interface CallyCalendarProps {
    value?: string; // YYYY-MM-DD
    onChange: (dateStr: string) => void;
    minDate?: string;
    maxDate?: string;
    error?: string;
}

function formatLocalDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

export default function CallyCalendar({
    value,
    onChange,
    minDate,
    maxDate,
    error,
}: CallyCalendarProps) {
    const calendarRef = useRef<HTMLElement | null>(null);

    // Calcular fechas mínimas y máximas por defecto (hoy hasta 30 días adelante) usando fecha local
    const today = new Date();
    const todayStr = formatLocalDate(today);
    const defaultMin = minDate ?? todayStr;

    const maxDateObj = new Date();
    maxDateObj.setDate(maxDateObj.getDate() + 30);
    const defaultMax = maxDate ?? formatLocalDate(maxDateObj);

    // Sincronizar el valor hacia el elemento de Cally si cambia externamente
    useEffect(() => {
        const el = calendarRef.current as (HTMLElement & { value?: string }) | null;
        if (el && value !== undefined && el.value !== value) {
            el.value = value;
        }
    }, [value]);

    useEffect(() => {
        const el = calendarRef.current;
        if (!el) return;

        // Configurar función para deshabilitar días cerrados (Lunes, 25/12, 01/01)
        (el as unknown as { isDateDisallowed: (date: Date) => boolean }).isDateDisallowed = (
            date: Date,
        ) => {
            const status = isParkOpenOnDate(date);
            return !status.isOpen;
        };

        const handleChange = (e: Event) => {
            const target = e.target as HTMLElement & { value?: string };
            if (target && target.value) {
                onChange(target.value);
            }
        };

        el.addEventListener("change", handleChange);
        return () => {
            el.removeEventListener("change", handleChange);
        };
    }, [onChange]);

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                    <label className="text-xs font-bold uppercase tracking-wider text-base-content/80 block">
                        Fecha de la actividad
                    </label>
                    <p className="text-[11px] text-base-content/60 truncate">
                        Lunes cerrado por mantenimiento
                    </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                    {value !== todayStr && (
                        <button
                            type="button"
                            onClick={() => onChange(todayStr)}
                            className="btn btn-ghost btn-xs text-primary font-bold hover:bg-primary/10 rounded-full text-[11px] px-2 shrink-0"
                            title="Volver a la fecha de hoy"
                        >
                            ↺ Hoy
                        </button>
                    )}
                    {value && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 font-mono text-xs font-bold text-primary whitespace-nowrap shrink-0 shadow-2xs">
                            <span className="text-xs">📅</span>
                            <span>{value}</span>
                        </span>
                    )}
                </div>
            </div>

            {/* Contenedor del calendario Cally con clases nativas de DaisyUI */}
            <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-xs flex justify-center">
                <calendar-date
                    ref={(node: HTMLElement | null) => {
                        calendarRef.current = node;
                    }}
                    class="cally bg-base-100 text-base-content rounded-xl border border-base-200 p-2 shadow-xs"
                    value={value}
                    min={defaultMin}
                    max={defaultMax}
                >
                    <svg
                        aria-label="Mes anterior"
                        className="fill-current size-4 text-base-content/70 hover:text-primary transition-colors"
                        slot="previous"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                    >
                        <path d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                    <svg
                        aria-label="Mes siguiente"
                        className="fill-current size-4 text-base-content/70 hover:text-primary transition-colors"
                        slot="next"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                    >
                        <path d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                    <calendar-month></calendar-month>
                </calendar-date>
            </div>

            {error && (
                <p className="text-error text-xs font-medium mt-1">
                    {error}
                </p>
            )}
        </div>
    );
}
