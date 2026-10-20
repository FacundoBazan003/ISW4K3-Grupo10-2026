import { useState } from "react";
import { useFormContext } from "react-hook-form";
import type { InscriptionFormData } from "@/schemas/inscriptionSchema";

interface TermsModalProps {
    activityName: string;
    termsContent: string;
}

export default function TermsModal({
    activityName,
    termsContent,
}: TermsModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const {
        register,
        formState: { errors },
    } = useFormContext<InscriptionFormData>();

    return (
        <div className="space-y-3 pt-2">
            <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-xs">
                <div className="flex items-start gap-3">
                    <input
                        type="checkbox"
                        id="acepta-terminos-checkbox"
                        className={`checkbox checkbox-primary checkbox-sm mt-0.5 rounded-lg ${
                            errors.aceptaTerminos ? "checkbox-error" : ""
                        }`}
                        {...register("aceptaTerminos")}
                    />
                    <div className="text-xs space-y-1">
                        <label
                            htmlFor="acepta-terminos-checkbox"
                            className="font-semibold text-base-content cursor-pointer select-none"
                        >
                            He leído y acepto los{" "}
                            <button
                                type="button"
                                onClick={() => setIsOpen(true)}
                                className="text-primary underline font-bold hover:text-primary/80 transition-colors"
                            >
                                Términos y Condiciones específicos de {activityName}
                            </button>
                            .
                        </label>
                        <p className="text-[11px] text-base-content/60">
                            Es obligatorio aceptar las directivas de seguridad para confirmar tu lugar en la actividad.
                        </p>
                    </div>
                </div>

                {errors.aceptaTerminos && (
                    <p className="text-error text-xs font-medium mt-2 pl-7">
                        {errors.aceptaTerminos.message}
                    </p>
                )}
            </div>

            {/* Modal de Términos y Condiciones */}
            {isOpen && (
                <div className="modal modal-open z-50">
                    <div className="modal-box max-w-lg rounded-3xl bg-base-100 p-6 border border-base-300 shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-base-200">
                            <div>
                                <span className="text-[10px] uppercase font-bold tracking-widest text-primary">
                                    EcoHarmony Park • Seguridad
                                </span>
                                <h3 className="text-lg font-bold text-base-content">
                                    Términos y Condiciones: {activityName}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="btn btn-sm btn-circle btn-ghost"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="py-4 text-xs text-base-content/80 whitespace-pre-line leading-relaxed max-h-72 overflow-y-auto">
                            {termsContent}
                        </div>

                        <div className="modal-action border-t border-base-200 pt-3">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="btn btn-primary btn-sm rounded-full px-6 font-bold"
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                    <div
                        className="modal-backdrop bg-black/40 backdrop-blur-xs"
                        onClick={() => setIsOpen(false)}
                    />
                </div>
            )}
        </div>
    );
}
