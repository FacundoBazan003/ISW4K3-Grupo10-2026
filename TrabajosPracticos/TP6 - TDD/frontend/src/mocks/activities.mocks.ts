import type { Activity } from "@/types/activity";

export const HORARIOS_ACTIVIDADES = [
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
] as const;

export const ACTIVITIES_DATA: Activity[] = [
    {
        id: "tirolesa",
        name: "Tirolesa",
        description: "Recorrido aéreo a través de las copas de los árboles con vistas panorámicas del parque.",
        icon: "🌲",
        cuposPorTurno: 10,
        edadMinima: 8,
        requiereTalle: true,
        turnos: [...HORARIOS_ACTIVIDADES],
        terminosYCondiciones:
            "Términos y Condiciones para Tirolesa:\n" +
            "1. La edad mínima requerida es de 8 años cumplidos al día de la actividad.\n" +
            "2. El uso del arnés de seguridad y casco provisto por EcoHarmony Park es estrictamente obligatorio durante todo el circuito.\n" +
            "3. Se debe declarar el talle adecuado para la vestimenta y arnés para garantizar la sujeción correcta.\n" +
            "4. No está permitido el acceso con calzado abierto ni objetos sueltos en bolsillos.\n" +
            "5. El participante se compromete a seguir en todo momento las directivas del personal de instrucción y rescate.",
    },
    {
        id: "safari",
        name: "Safari",
        description: "Expedición guiada por hábitats naturales para observar especies en su entorno protegido.",
        icon: "🚙",
        cuposPorTurno: 8,
        edadMinima: null,
        requiereTalle: false,
        turnos: [...HORARIOS_ACTIVIDADES],
        terminosYCondiciones:
            "Términos y Condiciones para Safari:\n" +
            "1. Actividad apta para todas las edades. Los menores de edad deben estar acompañados por un adulto responsable.\n" +
            "2. Queda terminantemente prohibido descender de los vehículos todoterreno fuera de las áreas designadas.\n" +
            "3. Prohibido alimentar, tocar o arrojar objetos a los animales del parque.\n" +
            "4. Mantener un tono de voz moderado para no perturbar a la fauna autóctona.\n" +
            "5. El parque se reserva el derecho de modificar el itinerario por cuestiones climáticas o de bienestar animal.",
    },
    {
        id: "palestra",
        name: "Palestra",
        description: "Muro de escalada supervisado con instructores certificados y equipo de seguridad completo.",
        icon: "🧗",
        cuposPorTurno: 12,
        edadMinima: 12,
        requiereTalle: true,
        turnos: [...HORARIOS_ACTIVIDADES],
        terminosYCondiciones:
            "Términos y Condiciones para Palestra:\n" +
            "1. La edad mínima de participación es de 12 años.\n" +
            "2. Es obligatorio el uso de arnés, casco y pies de gato del talle correspondiente provistos por el parque.\n" +
            "3. Cada participante debe realizar el chequeo previo con el instructor antes de iniciar cualquier vía de ascenso.\n" +
            "4. No se permite escalar sin la cuerda de aseguramiento activa ni descender sin autorización del asegurador.\n" +
            "5. Personas con problemas articulares o cardíacos deben consultar con el personal médico del parque antes de escalar.",
    },
    {
        id: "jardineria",
        name: "Jardinería",
        description: "Taller práctico para conectar con la flora autóctona y aprender técnicas de conservación.",
        icon: "🌱",
        cuposPorTurno: 12,
        edadMinima: null,
        requiereTalle: false,
        turnos: [...HORARIOS_ACTIVIDADES],
        terminosYCondiciones:
            "Términos y Condiciones para Jardinería:\n" +
            "1. Taller abierto a todas las edades, ideal para disfrutar en familia.\n" +
            "2. El uso responsable de las herramientas de huerta y plantación es supervisado por los coordinadores botánicos.\n" +
            "3. No dañar especies florales ni extraer especímenes fuera de los habilitados para trasplante.\n" +
            "4. Al finalizar la actividad se deben devolver las herramientas limpias y en su correspondiente lugar de guardado.",
    },
];
