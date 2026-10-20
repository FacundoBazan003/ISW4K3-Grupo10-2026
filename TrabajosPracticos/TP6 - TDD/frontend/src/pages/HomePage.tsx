import { Link } from "react-router";

interface ActivityCardInfo {
    id: string;
    name: string;
    description: string;
    icon: string;
    cuposPorTurno: number;
    edadMinima: number | null;
    requiereTalle: boolean;
    turnos: string[];
}

const ACTIVITIES: ActivityCardInfo[] = [
    {
        id: "tirolesa",
        name: "Tirolesa",
        description: "Recorrido aéreo a través de las copas de los árboles con vistas panorámicas del parque.",
        icon: "🌲",
        cuposPorTurno: 10,
        edadMinima: 8,
        requiereTalle: true,
        turnos: ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"],
    },
    {
        id: "safari",
        name: "Safari",
        description: "Expedición guiada por hábitats naturales para observar especies en su entorno protegido.",
        icon: "🚙",
        cuposPorTurno: 8,
        edadMinima: null,
        requiereTalle: false,
        turnos: ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"],
    },
    {
        id: "palestra",
        name: "Palestra",
        description: "Muro de escalada supervisado con instructores certificados y equipo de seguridad.",
        icon: "🧗",
        cuposPorTurno: 12,
        edadMinima: 12,
        requiereTalle: true,
        turnos: ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"],
    },
    {
        id: "jardineria",
        name: "Jardinería",
        description: "Taller práctico para conectar con la flora autóctona y aprender técnicas de conservación.",
        icon: "🌱",
        cuposPorTurno: 12,
        edadMinima: null,
        requiereTalle: false,
        turnos: ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"],
    },
];

export default function HomePage() {
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
                            🕒 Horario: 9:00 a 18:00 hs
                        </span>
                        <span className="flex items-center gap-1.5 bg-base-100 px-3 py-1.5 rounded-full border border-base-300">
                            📅 Abierto: Martes a Domingos (Lunes cerrado)
                        </span>
                        <span className="flex items-center gap-1.5 bg-base-100 px-3 py-1.5 rounded-full border border-base-300">
                            ⚡ Reserva hasta 15 min antes
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {ACTIVITIES.map((act) => (
                        <div
                            key={act.id}
                            className="card bg-base-100 border border-base-300 shadow-sm rounded-2xl flex flex-col justify-between hover:border-primary/50 transition-colors p-5"
                        >
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-3xl p-2.5 bg-base-200/80 rounded-2xl">
                                        {act.icon}
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
                                className="btn btn-primary btn-sm rounded-full w-full mt-5 font-bold shadow-xs active:scale-95 transition-transform text-center flex items-center justify-center"
                            >
                                Inscribirme
                            </Link>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}



