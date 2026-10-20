import { Outlet, Link } from "react-router";
import { useAuthStore } from "@/store/authStore";

import logoNavbar from "@/assets/img/logo.png";
import logoFooter from "@/assets/img/logo_footer.png";

export default function MainLayout() {
    const { isAuthenticated, user, logout } = useAuthStore();

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
                    <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-base-content/90">
                        <Link
                            to="/"
                            className="hover:text-primary transition-colors text-primary font-bold"
                        >
                            Actividades
                        </Link>
                    </div>

                    {/* Usuario mockeado y CTA */}
                    <div className="flex items-center gap-3">
                        {isAuthenticated && user ? (
                            <div className="flex items-center gap-2">
                                <div className="hidden sm:flex items-center gap-2 rounded-full bg-base-200/80 px-3.5 py-1.5 border border-base-300/80 text-xs text-base-content">
                                    <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
                                    <span className="font-bold text-base-content">{user.name}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={logout}
                                    className="btn btn-ghost btn-xs text-base-content/70 hover:text-error"
                                    title="Cerrar sesión"
                                >
                                    Salir
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="btn btn-ghost btn-sm text-xs font-bold rounded-full"
                            >
                                Iniciar Sesión
                            </Link>
                        )}

                        <Link
                            to="/inscribirme"
                            className="btn btn-primary rounded-full px-5 text-sm font-bold shadow-sm transition-transform active:scale-95"
                        >
                            Inscribirme a Actividad
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
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-primary-content/80">
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



