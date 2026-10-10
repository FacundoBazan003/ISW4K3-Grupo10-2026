import { Outlet } from "react-router";

export default function MainLayout() {
    return (
        <div className="bg-base-200 text-base-content flex min-h-screen flex-col">
            <header className="bg-base-100 border-base-300 sticky top-0 z-50 border-b">
                <nav className="navbar container mx-auto max-w-7xl px-4">
                    <div className="flex flex-1 items-center gap-3">
                        <h2 className="text-base-content text-xl font-bold tracking-tight">
                            Mi aplicación
                        </h2>
                    </div>
                </nav>
            </header>

            <main className="container mx-auto max-w-7xl flex-1 px-4 py-8">
                <Outlet />
            </main>
        </div>
    );
}

