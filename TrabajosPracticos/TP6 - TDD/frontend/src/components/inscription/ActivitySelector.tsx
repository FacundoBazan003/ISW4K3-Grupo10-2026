import type { Activity, ActivityId } from "@/types/activity";

interface ActivitySelectorProps {
    activities: Activity[];
    selectedId?: ActivityId;
    onSelect: (id: ActivityId) => void;
    error?: string;
}

export default function ActivitySelector({
    activities,
    selectedId,
    onSelect,
    error,
}: ActivitySelectorProps) {
    return (
        <div className="space-y-3">
            <div>
                <label className="text-xs font-bold uppercase tracking-wider text-base-content/80">
                    Paso 1: Seleccioná la Actividad
                </label>
                <p className="text-[11px] text-base-content/60">
                    Elegí una de las actividades del parque para ver sus turnos y requisitos
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {activities.map((act) => {
                    const isSelected = selectedId === act.id;
                    return (
                        <button
                            key={act.id}
                            type="button"
                            onClick={() => onSelect(act.id)}
                            className={`text-left rounded-2xl border p-4 transition-all flex flex-col justify-between ${
                                isSelected
                                    ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                                    : "border-base-300 bg-base-100 hover:border-primary/40 hover:bg-base-200/40"
                            }`}
                        >
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl p-2 rounded-xl bg-base-200/80">
                                        {act.icon}
                                    </span>
                                    {isSelected ? (
                                        <span className="badge badge-primary badge-xs font-bold">
                                            ✓ Elegida
                                        </span>
                                    ) : (
                                        <span className="badge badge-ghost badge-xs text-base-content/70">
                                            {act.cuposPorTurno} cupos
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <h4 className="font-bold text-sm text-base-content">
                                        {act.name}
                                    </h4>
                                    <p className="text-[11px] text-base-content/70 line-clamp-2 mt-0.5">
                                        {act.description}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-3 pt-2.5 border-t border-base-200/80 space-y-1 text-[11px]">
                                <div className="flex justify-between text-base-content/80">
                                    <span>Edad mínima:</span>
                                    <span className="font-semibold text-base-content">
                                        {act.edadMinima ? `${act.edadMinima}+ años` : "Todas"}
                                    </span>
                                </div>
                                <div className="flex justify-between text-base-content/80">
                                    <span>Vestimenta:</span>
                                    <span className="font-semibold text-base-content">
                                        {act.requiereTalle ? "Requiere talle" : "No requiere"}
                                    </span>
                                </div>
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
