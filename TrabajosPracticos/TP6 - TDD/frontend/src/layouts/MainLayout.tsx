import { Outlet, Link, useNavigate } from "react-router";
import { useAuthStore } from "@/store/authStore";
import { UserCircleIcon, SignOutIcon, SignInIcon, TicketIcon } from "@phosphor-icons/react";

import logoNavbar from "@/assets/img/logo.png";
import logoFooter from "@/assets/img/logo_footer.png";

export default function MainLayout() {
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <div className="bg-base-100 text-base-content flex min-h-screen flex-col font-sans">
            {/* Header / Navbar */}
            <header className="bg-base-100/95 border-base-300/60 sticky top-0 z-50 border-b backdrop-blur-sm">
                <nav className="navbar container mx-auto max-w-7xl justify-between px-4 py-2 sm:px-6">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center">
                            <img
                                src={logoNavbar}
                                alt="EcoHarmony Park"
                                className="h-12 w-auto object-contain sm:h-14"
                            />
                        </Link>
                    </div>

                    {/* Nav Links */}
                    <div className="text-base-content/90 hidden items-center gap-6 text-sm font-semibold md:flex">
                        <Link
                            to="/"
                            className="hover:text-primary text-primary font-bold transition-colors"
                        >
                            Actividades
                        </Link>
                    </div>

                    {/* Usuario mockeado y CTA */}
                    <div className="flex items-center gap-3">
                        {isAuthenticated && user ? (
                            <div className="flex items-center gap-2">
                                <div className="bg-base-200/80 border-base-300/80 text-base-content hidden items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs sm:flex">
                                    <UserCircleIcon
                                        size={16}
                                        weight="duotone"
                                        className="text-secondary"
                                    />
                                    <span className="text-base-content font-bold">{user.name}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="btn btn-ghost btn-xs text-base-content/70 hover:text-error flex items-center gap-1"
                                    title="Cerrar sesión"
                                >
                                    <SignOutIcon size={14} weight="bold" />
                                    <span>Salir</span>
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="btn btn-ghost btn-sm flex items-center gap-1.5 rounded-full text-xs font-bold"
                            >
                                <SignInIcon size={14} weight="bold" />
                                <span>Iniciar Sesión</span>
                            </Link>
                        )}

                        <Link
                            to="/inscribirme"
                            className="btn btn-primary flex items-center gap-1.5 rounded-full px-5 text-sm font-bold shadow-sm transition-transform active:scale-95"
                        >
                            <TicketIcon size={16} weight="bold" />
                            <span>Inscribirme a Actividad</span>
                        </Link>
                    </div>
                </nav>
            </header>

            {/* Main Content */}
            <main className="flex-1">
                <Outlet />
            </main>

            {/* Footer Minimalista */}
            <footer className="bg-primary text-primary-content mt-16 py-8">
                <div className="text-primary-content/80 container mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-xs sm:flex-row sm:px-6">
                    <div className="flex items-center gap-3">
                        <img
                            src={logoFooter}
                            alt="EcoHarmony Park"
                            className="h-10 w-auto object-contain brightness-0 invert"
                        />
                        <span>• Reserva de Actividades en el Parque</span>
                    </div>
                    <p>© 2026 EcoHarmony Park. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
}
