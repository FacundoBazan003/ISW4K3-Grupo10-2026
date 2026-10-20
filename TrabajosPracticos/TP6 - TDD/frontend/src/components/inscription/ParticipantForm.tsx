import { useFieldArray, useFormContext, type FieldArrayWithId } from "react-hook-form";
import { PlusIcon, TrashIcon, WarningCircleIcon, UserIcon } from "@phosphor-icons/react";
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

    const canAddMore = cuposDisponibles === undefined || fields.length < cuposDisponibles;

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
            <div className="border-base-200 flex flex-col justify-between gap-2 border-b pb-3 sm:flex-row sm:items-center">
                <div>
                    <label className="text-base-content/80 text-xs font-bold tracking-wider uppercase">
                        Paso 3: Datos de los Visitantes ({fields.length})
                    </label>
                    <p className="text-base-content/60 text-[11px]">
                        Ingresá los datos de cada persona que participará de la actividad
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleAdd}
                    disabled={!canAddMore}
                    className="btn btn-secondary btn-sm gap-1.5 self-start rounded-full text-xs font-bold sm:self-auto"
                >
                    <PlusIcon size={14} weight="bold" />
                    <span>Agregar Visitante</span>
                </button>
            </div>

            {cuposDisponibles !== undefined && fields.length >= cuposDisponibles && (
                <div className="bg-warning/15 border-warning/30 text-warning-content flex items-center gap-2 rounded-xl border p-3 text-xs font-medium">
                    <WarningCircleIcon size={18} weight="bold" className="text-warning shrink-0" />
                    <span className="text-warning">
                        Alcanzaste el límite de cupos disponibles ({cuposDisponibles}) para este
                        turno.
                    </span>
                </div>
            )}

            <div className="space-y-4">
                {fields.map(
                    (
                        field: FieldArrayWithId<InscriptionFormData, "participantes", "id">,
                        index: number,
                    ) => {
                        const participantErrors = errors.participantes?.[index];

                        return (
                            <div
                                key={field.id}
                                className="card bg-base-100 border-base-300 relative rounded-2xl border p-4 shadow-xs sm:p-5"
                            >
                                <div className="border-base-200/80 mb-3 flex items-center justify-between border-b pb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="badge badge-primary badge-sm flex items-center gap-1 font-bold">
                                            <UserIcon size={12} weight="bold" />
                                            <span>#{index + 1}</span>
                                        </span>
                                        <h4 className="text-base-content text-xs font-bold tracking-wider uppercase">
                                            Visitante {index + 1}
                                        </h4>
                                    </div>

                                    {fields.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="btn btn-ghost btn-xs text-error hover:bg-error/10 gap-1 rounded-lg"
                                            title="Eliminar visitante"
                                        >
                                            <TrashIcon size={14} weight="bold" />
                                            <span>Quitar</span>
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
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
                                            className={`input input-sm input-bordered bg-base-200/40 focus:border-primary w-full rounded-xl text-xs ${
                                                participantErrors?.nombre ? "input-error" : ""
                                            }`}
                                            {...register(`participantes.${index}.nombre`)}
                                        />
                                        {participantErrors?.nombre && (
                                            <span className="text-error mt-1 text-[11px] font-medium">
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
                                            className={`input input-sm input-bordered bg-base-200/40 focus:border-primary w-full rounded-xl font-mono text-xs ${
                                                participantErrors?.dni ? "input-error" : ""
                                            }`}
                                            {...register(`participantes.${index}.dni`)}
                                        />
                                        {participantErrors?.dni && (
                                            <span className="text-error mt-1 text-[11px] font-medium">
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
                                                    <span className="text-base-content/60 text-[10px] font-normal">
                                                        (mín. {edadMinima} años)
                                                    </span>
                                                )}
                                            </span>
                                        </label>
                                        <input
                                            type="number"
                                            min={0}
                                            max={120}
                                            className={`input input-sm input-bordered bg-base-200/40 focus:border-primary w-full rounded-xl text-xs ${
                                                participantErrors?.edad ? "input-error" : ""
                                            }`}
                                            {...register(`participantes.${index}.edad`, {
                                                valueAsNumber: true,
                                            })}
                                        />
                                        {participantErrors?.edad && (
                                            <span className="text-error mt-1 text-[11px] font-medium">
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
                                                className={`select select-sm select-bordered bg-base-200/40 focus:border-primary w-full rounded-xl text-xs font-semibold ${
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
                                                <span className="text-error mt-1 text-[11px] font-medium">
                                                    {participantErrors.talle.message}
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="form-control justify-center">
                                            <label className="label py-1">
                                                <span className="label-text text-base-content/50 text-xs font-bold">
                                                    Talle de vestimenta
                                                </span>
                                            </label>
                                            <div className="bg-base-200/50 border-base-300/40 text-base-content/60 flex h-8 items-center rounded-xl border px-3 text-[11px] italic">
                                                No requerido para esta actividad
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    },
                )}
            </div>
        </div>
    );
}
