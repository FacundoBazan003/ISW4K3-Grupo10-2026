import {
    useFieldArray,
    useFormContext,
    type FieldArrayWithId,
} from "react-hook-form";
import { TALLES_DISPONIBLES } from "@/types/activity";
import type { InscriptionFormData } from "@/schemas/inscriptionSchema";

interface ParticipantFormProps {
    requiereTalle: boolean;
    edadMinima: number | null;
    cuposDisponibles?: number;
}

export default function ParticipantForm({
    requiereTalle,
    edadMinima,
    cuposDisponibles,
}: ParticipantFormProps) {
    const {
        control,
        register,
        formState: { errors },
    } = useFormContext<InscriptionFormData>();

    const { fields, append, remove } = useFieldArray({
        control,
        name: "participantes",
    });

    const canAddMore =
        cuposDisponibles === undefined || fields.length < cuposDisponibles;

    const handleAdd = () => {
        if (!canAddMore) return;
        append({
            nombre: "",
            dni: "",
            edad: edadMinima ?? 18,
            talle: requiereTalle ? "M" : undefined,
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-base-200 pb-3">
                <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-base-content/80">
                        Paso 3: Datos de los Visitantes ({fields.length})
                    </label>
                    <p className="text-[11px] text-base-content/60">
                        Ingresá los datos de cada persona que participará de la actividad
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleAdd}
                    disabled={!canAddMore}
                    className="btn btn-secondary btn-sm rounded-full text-xs font-bold gap-1 self-start sm:self-auto"
                >
                    <span>+</span> Agregar Visitante
                </button>
            </div>

            {cuposDisponibles !== undefined && fields.length >= cuposDisponibles && (
                <div className="rounded-xl bg-warning/15 border border-warning/30 p-3 text-xs text-warning-content font-medium">
                    ⚠️ Alcanzaste el límite de cupos disponibles ({cuposDisponibles}) para este turno.
                </div>
            )}

            <div className="space-y-4">
                {fields.map((field: FieldArrayWithId<InscriptionFormData, "participantes", "id">, index: number) => {
                    const participantErrors = errors.participantes?.[index];

                    return (
                        <div
                            key={field.id}
                            className="card bg-base-100 border border-base-300 rounded-2xl p-4 sm:p-5 shadow-xs relative"
                        >
                            <div className="flex items-center justify-between mb-3 border-b border-base-200/80 pb-2">
                                <div className="flex items-center gap-2">
                                    <span className="badge badge-primary badge-sm font-bold">
                                        #{index + 1}
                                    </span>
                                    <h4 className="text-xs font-bold text-base-content uppercase tracking-wider">
                                        Visitante {index + 1}
                                    </h4>
                                </div>

                                {fields.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        className="btn btn-ghost btn-xs text-error hover:bg-error/10 rounded-lg"
                                        title="Eliminar visitante"
                                    >
                                        Quitar
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                                {/* Nombre */}
                                <div className="form-control">
                                    <label className="label py-1">
                                        <span className="label-text text-xs font-bold">
                                            Nombre y Apellido
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ej. Lucas Silva"
                                        className={`input input-sm input-bordered w-full rounded-xl bg-base-200/40 text-xs focus:border-primary ${
                                            participantErrors?.nombre ? "input-error" : ""
                                        }`}
                                        {...register(`participantes.${index}.nombre`)}
                                    />
                                    {participantErrors?.nombre && (
                                        <span className="text-error text-[11px] mt-1 font-medium">
                                            {participantErrors.nombre.message}
                                        </span>
                                    )}
                                </div>

                                {/* DNI */}
                                <div className="form-control">
                                    <label className="label py-1">
                                        <span className="label-text text-xs font-bold">
                                            DNI (solo números)
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={8}
                                        placeholder="Ej. 38123456"
                                        className={`input input-sm input-bordered w-full rounded-xl bg-base-200/40 text-xs font-mono focus:border-primary ${
                                            participantErrors?.dni ? "input-error" : ""
                                        }`}
                                        {...register(`participantes.${index}.dni`)}
                                    />
                                    {participantErrors?.dni && (
                                        <span className="text-error text-[11px] mt-1 font-medium">
                                            {participantErrors.dni.message}
                                        </span>
                                    )}
                                </div>

                                {/* Edad */}
                                <div className="form-control">
                                    <label className="label py-1">
                                        <span className="label-text text-xs font-bold">
                                            Edad{" "}
                                            {edadMinima && (
                                                <span className="text-[10px] text-base-content/60 font-normal">
                                                    (mín. {edadMinima} años)
                                                </span>
                                            )}
                                        </span>
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={120}
                                        className={`input input-sm input-bordered w-full rounded-xl bg-base-200/40 text-xs focus:border-primary ${
                                            participantErrors?.edad ? "input-error" : ""
                                        }`}
                                        {...register(`participantes.${index}.edad`, {
                                            valueAsNumber: true,
                                        })}
                                    />
                                    {participantErrors?.edad && (
                                        <span className="text-error text-[11px] mt-1 font-medium">
                                            {participantErrors.edad.message}
                                        </span>
                                    )}
                                </div>

                                {/* Talle de vestimenta (condicional según actividad) */}
                                {requiereTalle ? (
                                    <div className="form-control">
                                        <label className="label py-1">
                                            <span className="label-text text-xs font-bold">
                                                Talle de vestimenta
                                            </span>
                                        </label>
                                        <select
                                            className={`select select-sm select-bordered w-full rounded-xl bg-base-200/40 text-xs font-semibold focus:border-primary ${
                                                participantErrors?.talle ? "select-error" : ""
                                            }`}
                                            {...register(`participantes.${index}.talle`)}
                                        >
                                            <option value="">Seleccionar talle</option>
                                            {TALLES_DISPONIBLES.map((t) => (
                                                <option key={t} value={t}>
                                                    Talle {t}
                                                </option>
                                            ))}
                                        </select>
                                        {participantErrors?.talle && (
                                            <span className="text-error text-[11px] mt-1 font-medium">
                                                {participantErrors.talle.message}
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <div className="form-control justify-center">
                                        <label className="label py-1">
                                            <span className="label-text text-xs font-bold text-base-content/50">
                                                Talle de vestimenta
                                            </span>
                                        </label>
                                        <div className="h-8 rounded-xl bg-base-200/50 border border-base-300/40 px-3 flex items-center text-[11px] text-base-content/60 italic">
                                            No requerido para esta actividad
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
