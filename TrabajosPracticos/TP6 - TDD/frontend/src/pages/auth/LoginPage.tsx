import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link, useLocation } from "react-router";
import {
    EnvelopeSimpleIcon,
    SignInIcon,
    UserIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
} from "@phosphor-icons/react";
import { useAuthStore } from "@/store/authStore";
import { userMock, type User } from "@/mocks/users.mocks";

const loginSchema = z.object({
    email: z
        .string()
        .min(1, "El correo electrónico es obligatorio")
        .email("Ingresá un correo electrónico válido"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const from = (location.state as { from?: string } | null)?.from || "/";

    const login = useAuthStore((state) => state.login);
    const [loginError, setLoginError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = (data: LoginFormData) => {
        setLoginError(null);
        const normalizedEmail = data.email.trim().toLowerCase();
        const foundUser = userMock.find(
            (u) => u.email.toLowerCase() === normalizedEmail,
        );

        if (!foundUser) {
            setLoginError(
                "Usuario no encontrado. Podés seleccionar uno de los usuarios de prueba sugeridos abajo.",
            );
            return;
        }

        login(foundUser);
        navigate(from, { replace: true });
    };

    const handleSelectMockUser = (user: User) => {
        setValue("email", user.email, { shouldValidate: true });
        setLoginError(null);
    };

    return (
        <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
            <div className="card bg-base-100 border border-base-300 w-full max-w-md shadow-md rounded-3xl p-6 sm:p-8">
                {/* Header */}
                <div className="text-center space-y-2 mb-6">
                    <span className="inline-block text-xs font-bold tracking-widest text-primary uppercase">
                        EcoHarmony Park
                    </span>
                    <h1 className="text-2xl font-extrabold text-base-content">
                        Iniciar Sesión
                    </h1>
                    <p className="text-xs sm:text-sm text-base-content/70">
                        Ingresá con tu correo para gestionar tus inscripciones
                    </p>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="form-control">
                        <label className="label" htmlFor="email-input">
                            <span className="label-text font-bold text-xs text-base-content flex items-center gap-1.5">
                                <EnvelopeSimpleIcon size={16} weight="duotone" className="text-primary" />
                                Correo electrónico
                            </span>
                        </label>
                        <input
                            id="email-input"
                            type="email"
                            placeholder="ejemplo@email.com"
                            className={`input input-bordered w-full rounded-xl bg-base-200/40 text-sm focus:border-primary ${
                                errors.email ? "input-error" : ""
                            }`}
                            {...register("email")}
                        />
                        {errors.email && (
                            <span className="text-error text-xs mt-1.5 font-medium">
                                {errors.email.message}
                            </span>
                        )}
                    </div>

                    {loginError && (
                        <div className="rounded-xl bg-error/10 border border-error/20 p-3 text-xs text-error font-medium">
                            {loginError}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn btn-primary w-full rounded-full font-bold shadow-xs active:scale-95 transition-transform mt-2 flex items-center justify-center gap-2"
                    >
                        <SignInIcon size={18} weight="bold" />
                        <span>Ingresar</span>
                    </button>
                </form>

                {/* Accesos rápidos de prueba (Mock) */}
                <div className="mt-8 border-t border-base-200 pt-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-base-content/80">
                            Usuarios de prueba disponibles:
                        </span>
                        <span className="badge badge-neutral badge-xs font-mono">Mock</span>
                    </div>

                    <div className="space-y-2">
                        {userMock.map((u) => (
                            <button
                                key={u.id}
                                type="button"
                                onClick={() => handleSelectMockUser(u)}
                                className="w-full text-left p-2.5 rounded-xl border border-base-200 hover:border-primary/50 hover:bg-base-200/60 transition-all flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 rounded-lg bg-base-200 text-base-content/70 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                        <UserIcon size={16} weight="duotone" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-base-content group-hover:text-primary transition-colors">
                                            {u.name}
                                        </p>
                                        <p className="text-[11px] text-base-content/60 font-mono">
                                            {u.email}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                    <span>Usar</span>
                                    <ArrowRightIcon size={14} weight="bold" />
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-1.5 text-xs text-base-content/70 hover:text-primary hover:underline transition-colors"
                    >
                        <ArrowLeftIcon size={14} weight="bold" />
                        <span>Volver a Actividades</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
