import { z } from "zod";
import { TALLES_DISPONIBLES, type TalleVestimenta } from "@/types/activity";

export const participantSchema = z.object({
    nombre: z
        .string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(50, "El nombre no puede superar los 50 caracteres"),
    dni: z
        .string()
        .regex(/^\d{7,8}$/, "El DNI debe contener exactamente 7 u 8 números"),
    edad: z
        .number({ message: "Ingresá una edad válida" })
        .int("La edad debe ser un número entero")
        .min(0, "La edad no puede ser negativa")
        .max(120, "Ingresá una edad válida"),
    talle: z
        .enum(TALLES_DISPONIBLES as unknown as [TalleVestimenta, ...TalleVestimenta[]])
        .optional(),
});

export const inscriptionSchema = z
    .object({
        activityId: z.enum(["tirolesa", "safari", "palestra", "jardineria"], {
            message: "Debés seleccionar una actividad",
        }),
        fecha: z
            .string()
            .min(1, "Debés seleccionar una fecha de visita"),
        horario: z
            .string()
            .min(1, "Debés seleccionar un turno horario"),
        participantes: z
            .array(participantSchema)
            .min(1, "Debés registrar al menos un visitante"),
        aceptaTerminos: z.boolean().refine((val) => val === true, {
            message: "Debés leer y aceptar los términos y condiciones de la actividad",
        }),
    })
    .superRefine((data, ctx) => {
        // 1. Validar duplicación de DNI dentro de la misma reserva
        const seenDnis = new Map<string, number>();
        data.participantes.forEach((p, idx) => {
            const trimmedDni = p.dni.trim();
            if (trimmedDni.length > 0) {
                if (seenDnis.has(trimmedDni)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: `Este DNI ya fue cargado para el participante #${seenDnis.get(trimmedDni)! + 1}`,
                        path: ["participantes", idx, "dni"],
                    });
                } else {
                    seenDnis.set(trimmedDni, idx);
                }
            }
        });

        // 2. Validaciones condicionales por actividad
        const requiresClothing =
            data.activityId === "palestra" || data.activityId === "tirolesa";

        data.participantes.forEach((p, idx) => {
            // Talle obligatorio para Tirolesa y Palestra
            if (requiresClothing && !p.talle) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "El talle de vestimenta es obligatorio para esta actividad",
                    path: ["participantes", idx, "talle"],
                });
            }

            // Edad mínima para Tirolesa (8+)
            if (data.activityId === "tirolesa" && p.edad < 8) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "La edad mínima para realizar Tirolesa es de 8 años",
                    path: ["participantes", idx, "edad"],
                });
            }

            // Edad mínima para Palestra (12+)
            if (data.activityId === "palestra" && p.edad < 12) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "La edad mínima para realizar Palestra es de 12 años",
                    path: ["participantes", idx, "edad"],
                });
            }
        });
    });

export type InscriptionFormData = z.infer<typeof inscriptionSchema>;
export type ParticipantFormData = z.infer<typeof participantSchema>;
