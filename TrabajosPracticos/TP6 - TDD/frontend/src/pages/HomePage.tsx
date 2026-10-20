import { Link } from "react-router";
import { useActivities } from "@/hooks/useActivities";
import {
    ClockIcon,
    CalendarCheckIcon,
    LightningIcon,
    TreeIcon,
    JeepIcon,
    MountainsIcon,
    PottedPlantIcon,
    TicketIcon,
    SparkleIcon,
} from "@phosphor-icons/react";


function renderActivityCardIcon(id: string) {
    switch (id) {
        case "tirolesa":
            return <TreeIcon size={32} weight="duotone" className="text-primary" />;
        case "safari":
            return <JeepIcon size={32} weight="duotone" className="text-primary" />;
        case "palestra":
            return <MountainsIcon size={32} weight="duotone" className="text-primary" />;
        case "jardineria":
            return <PottedPlantIcon size={32} weight="duotone" className="text-primary" />;
        default:
            return <SparkleIcon size={32} weight="duotone" className="text-primary" />;
    }
}


export default function HomePage() {
    const { data: activities = [], isLoading, error } = useActivities();
    return (
        <div className="space-y-10 py-6 sm:py-10">
            {/* Header del MVP */}
            <section className="container mx-auto max-w-7xl px-4 sm:px-6">
                <div className="bg-primary/10 border border-primary/20 rounded-3xl p-6 sm:p-10">
                    <span className="inline-block text-xs font-bold tracking-widest text-primary uppercase mb-2">
                        EcoHarmony Park • Reserva de Turnos
                    </span>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-base-content max-w-2xl">
                        Inscripción a Actividades del Parque
                    </h1>
                    <p className="mt-3 text-sm sm:text-base text-base-content/80 max-w-xl">
                        Elegí tu actividad, seleccioná tu horario preferido y reservá tu lugar antes de tu visita.
                        Recordá que los turnos se reservan dentro de las 24 hs previas al inicio.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3 text-xs text-base-content/70">
                        <span className="flex items-center gap-1.5 bg-base-100 px-3 py-1.5 rounded-full border border-base-300">
                            <ClockIcon size={14} weight="bold" className="text-primary" />
                            <span>Horario: 9:00 a 18:00 hs</span>
                        </span>
                        <span className="flex items-center gap-1.5 bg-base-100 px-3 py-1.5 rounded-full border border-base-300">
                            <CalendarCheckIcon size={14} weight="bold" className="text-primary" />
                            <span>Abierto: Martes a Domingos (Lunes cerrado)</span>
                        </span>
                        <span className="flex items-center gap-1.5 bg-base-100 px-3 py-1.5 rounded-full border border-base-300">
                            <LightningIcon size={14} weight="bold" className="text-primary" />
                            <span>Reserva hasta 15 min antes</span>
                        </span>
                    </div>
                </div>
            </section>

            {/* Listado de Actividades Disponibles */}
            <section className="container mx-auto max-w-7xl px-4 sm:px-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-base-content">
                            Actividades Disponibles
                        </h2>
                        <p className="text-xs sm:text-sm text-base-content/70">
                            Seleccioná la actividad en la que deseás participar
                        </p>
                    </div>
                </div>

                {isLoading && <p>Cargando actividades...</p>}
                {error && <p role="alert" className="text-error">{error.message}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {activities.map((act) => (
                        <div
                            key={act.id}
                            className="card bg-base-100 border border-base-300 shadow-sm rounded-2xl flex flex-col justify-between hover:border-primary/50 transition-colors p-5"
                        >
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="p-2.5 bg-base-200/80 rounded-2xl flex items-center justify-center">
                                        {renderActivityCardIcon(act.id)}
                                    </span>
                                    <span className="badge badge-accent badge-sm font-semibold">
                                        {act.cuposPorTurno} cupos / turno
                                    </span>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-base-content">
                                        {act.name}
                                    </h3>
                                    <p className="text-xs text-base-content/70 mt-1 line-clamp-3">
                                        {act.description}
                                    </p>
                                </div>

                                <div className="space-y-1.5 border-t border-base-200 pt-3 text-xs">
                                    <div className="flex justify-between text-base-content/80">
                                        <span>Edad mínima:</span>
                                        <span className="font-semibold text-base-content">
                                            {act.edadMinima ? `${act.edadMinima}+ años` : "Todas las edades"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-base-content/80">
                                        <span>Requiere talle:</span>
                                        <span className="font-semibold text-base-content">
                                            {act.requiereTalle ? "Sí (XS a XXL)" : "No"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Link
                                to={`/inscribirme?activity=${act.id}`}
                                className="btn btn-primary btn-sm rounded-full w-full mt-5 font-bold shadow-xs active:scale-95 transition-transform text-center flex items-center justify-center gap-1.5"
                            >
                                <TicketIcon size={16} weight="bold" />
                                <span>Inscribirme</span>
                            </Link>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}



