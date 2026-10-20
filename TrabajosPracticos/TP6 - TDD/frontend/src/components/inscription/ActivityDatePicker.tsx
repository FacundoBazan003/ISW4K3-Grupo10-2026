import { DayPicker } from "react-day-picker";
import { es } from "date-fns/locale";
import { format, parseISO, startOfToday, addDays } from "date-fns";
import {
    ArrowCounterClockwiseIcon,
    CalendarBlankIcon,
} from "@phosphor-icons/react";
import "react-day-picker/style.css";
import { isParkOpenOnDate } from "@/services/activityService";

interface ActivityDatePickerProps {
    value?: string; // YYYY-MM-DD
    onChange: (dateStr: string) => void;
    minDate?: string;
    maxDate?: string;
    error?: string;
}

const WEEKDAYS_SHORT = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"];

export default function ActivityDatePicker({
    value,
    onChange,
    minDate,
    maxDate,
    error,
}: ActivityDatePickerProps) {
    const today = startOfToday();
    const todayStr = format(today, "yyyy-MM-dd");

    const minAllowed = minDate ? parseISO(minDate) : today;
    const maxAllowed = maxDate ? parseISO(maxDate) : addDays(today, 30);

    const selectedDate = value ? parseISO(value) : today;

    // Formatear la fecha seleccionada en español natural (ej: "Sábado 24 de octubre, 2026")
    const formattedHumanDate = format(selectedDate, "EEEE d 'de' MMMM, yyyy", {
        locale: es,
    });

    // Regla de deshabilitación: días cerrados (lunes, 25/12, 01/01) o fuera de rango
    const isDateDisabled = (date: Date): boolean => {
        if (date < minAllowed || date > maxAllowed) return true;
        const status = isParkOpenOnDate(date);
        return !status.isOpen;
    };

    const handleSelect = (date: Date | undefined) => {
        if (!date) return;
        onChange(format(date, "yyyy-MM-dd"));
    };

    return (
        <div className="space-y-3">
            {/* Header del selector */}
            <div className="flex items-center justify-between gap-3">
                <div>
                    <label className="text-base-content/80 block text-xs font-bold tracking-wider uppercase">
                        Fecha de la actividad
                    </label>
                    <p className="text-base-content/60 text-[11px]">
                        Lunes cerrado por mantenimiento
                    </p>
                </div>

                {/* Botón Hoy con tamaño cómodo y visible */}
                {value !== todayStr && (
                    <button
                        type="button"
                        onClick={() => onChange(todayStr)}
                        className="btn btn-outline btn-xs sm:btn-sm text-primary border-primary/40 hover:bg-primary hover:text-primary-content hover:border-primary gap-1.5 rounded-full font-bold shadow-2xs transition-all"
                        title="Volver a la fecha de hoy"
                    >
                        <ArrowCounterClockwiseIcon size={14} weight="bold" />
                        <span>Hoy</span>
                    </button>
                )}
            </div>

            {/* Contenedor del calendario */}
            <div className="border-base-300 bg-base-100 flex flex-col items-center rounded-2xl border p-4 shadow-xs">
                <style>{`
                    .rdp-root {
                        --rdp-accent-color: var(--color-primary);
                        --rdp-accent-background-color: var(--color-primary);
                        --rdp-day-height: 38px;
                        --rdp-day-width: 38px;
                        --rdp-day_button-border-radius: 9999px;
                        font-family: inherit;
                        margin: 0;
                    }
                    .rdp-caption_label {
                        font-weight: 800;
                        text-transform: capitalize;
                        color: var(--color-base-content);
                        font-size: 0.95rem;
                    }
                    .rdp-weekday {
                        font-weight: 700;
                        font-size: 0.75rem;
                        color: var(--color-base-content);
                        opacity: 0.75;
                    }
                    .rdp-day_button {
                        font-size: 0.85rem;
                        font-weight: 600;
                        transition: all 0.15s ease;
                    }
                    .rdp-day_button:hover:not([disabled]) {
                        background-color: var(--color-base-200);
                        color: var(--color-primary);
                    }
                    .rdp-selected .rdp-day_button {
                        background-color: var(--color-primary) !important;
                        color: var(--color-primary-content) !important;
                        font-weight: 800;
                    }
                    .rdp-today:not(.rdp-selected) .rdp-day_button {
                        border: 1.5px solid var(--color-primary);
                        color: var(--color-primary);
                        font-weight: 700;
                    }
                    .rdp-disabled .rdp-day_button {
                        opacity: 0.25;
                        cursor: not-allowed;
                    }
                    .rdp-nav_button {
                        border-radius: 9999px;
                        color: var(--color-base-content);
                    }
                    .rdp-nav_button:hover {
                        background-color: var(--color-base-200);
                        color: var(--color-primary);
                    }
                `}</style>

                <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleSelect}
                    locale={es}
                    weekStartsOn={0}
                    disabled={isDateDisabled}
                    startMonth={minAllowed}
                    endMonth={maxAllowed}
                    formatters={{
                        formatWeekdayName: (date) => WEEKDAYS_SHORT[date.getDay()] ?? "",
                    }}
                />

                {/* Confirmación de fecha en lenguaje humano debajo del calendario */}
                <div className="bg-base-200/70 border-base-300/60 mt-3 flex w-full items-center justify-between rounded-xl border px-3.5 py-2 text-xs">
                    <span className="text-base-content/70">Fecha elegida:</span>
                    <span className="text-primary flex items-center gap-1.5 font-bold capitalize">
                        <CalendarBlankIcon size={16} weight="duotone" />
                        <span>{formattedHumanDate}</span>
                    </span>
                </div>
            </div>

            {error && <p className="text-error mt-1 text-xs font-medium">{error}</p>}
        </div>
    );
}
