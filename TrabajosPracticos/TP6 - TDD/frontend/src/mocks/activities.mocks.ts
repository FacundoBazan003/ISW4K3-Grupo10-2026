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
            "Términos y Condiciones para Tirolesa (Circuito Aéreo):\n\n" +
            "1. Requisitos de Edad y Físicos:\n" +
            "   • La edad mínima obligatoria es de 8 años cumplidos al día de la actividad.\n" +
            "   • Peso admitido: mínimo 30 kg, máximo 115 kg (por calibración de tensión y frenos automáticos).\n" +
            "   • No recomendada para personas con afecciones cardíacas, lesiones cervicales o de columna, vértigo agudo o personas gestantes.\n\n" +
            "2. Equipamiento y Vestimenta:\n" +
            "   • Uso obligatorio de arnés y casco de seguridad provistos por el parque según el talle declarado (XS a XXL).\n" +
            "   • Calzado cerrado con cordones o ajuste firme (prohibidas ojotas, sandalias o calzado con taco).\n" +
            "   • Cabello largo debidamente recogido. Prohibido portar bufandas, cadenas o prendas sueltas.\n\n" +
            "3. Seguridad y Conducta:\n" +
            "   • Prohibido descender con teléfonos celulares, cámaras o mochilas sin sujeción homologada.\n" +
            "   • Asistencia obligatoria a la charla técnica y de seguridad previa.\n" +
            "   • Prohibido manipular mosquetones, poleas o líneas de vida sin autorización del instructor.\n\n" +
            "4. Clima y Reprogramaciones:\n" +
            "   • En caso de vientos superiores a 40 km/h o tormentas eléctricas, los turnos se reprogramarán por seguridad.",
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
            "Términos y Condiciones para Safari (Expedición en Hábitats Protegidos):\n\n" +
            "1. Admisión y Acompañamiento:\n" +
            "   • Actividad apta para todo público sin restricción de edad.\n" +
            "   • Menores de 12 años deben ingresar y permanecer acompañados en todo momento por un adulto responsable.\n\n" +
            "2. Seguridad a Bordo:\n" +
            "   • Permanecer sentados con cinturón de seguridad abrochado durante todo el recorrido del vehículo todo terreno.\n" +
            "   • Prohibido descender del vehículo fuera de los miradores y paradas expresamente designadas por los guardaparques.\n" +
            "   • No asomar extremidades ni objetos fuera de las ventanillas o barras de protección del vehículo en movimiento.\n\n" +
            "3. Protección de la Fauna Silvestre:\n" +
            "   • Tolerancia cero a la alimentación animal: estrictamente prohibido alimentar, tocar, llamar o arrojar objetos a los animales.\n" +
            "   • Mantener un volumen de voz moderado; prohibido el uso de parlantes o silbatos que alteren la fauna.\n" +
            "   • Fotografías únicamente sin flash directo a los ejemplares.\n\n" +
            "4. Cuidado del Entorno Natural:\n" +
            "   • Prohibido fumar, encender fuego o arrojar residuos durante el trayecto.",
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
            "Términos y Condiciones para Palestra (Muro de Escalada y Descenso):\n\n" +
            "1. Requisitos de Admisión:\n" +
            "   • Edad mínima obligatoria de 12 años cumplidos al momento de la actividad.\n" +
            "   • Buen estado físico general; no recomendada ante lesiones recientes en hombros, muñecas o columna, ni vértigo severo.\n\n" +
            "2. Equipamiento Técnico Obligatorio:\n" +
            "   • Uso obligatorio de arnés pélvico, casco y calzado técnico (pies de gato) provistos por el parque en el talle seleccionado.\n" +
            "   • Prohibido escalar con anillos, pulseras o relojes por riesgo de atrapamiento.\n\n" +
            "3. Protocolo de Ascenso y Vías:\n" +
            "   • Verificación previa obligatoria de nudo y mosquetón con el instructor (buddy check) antes de iniciar cualquier vía.\n" +
            "   • Respetar estrictamente la vía de ascenso asignada sin invadir las líneas contiguas.\n" +
            "   • No ubicarse ni transitar dentro del colchón de impacto debajo de otros escaladores en actividad.\n\n" +
            "4. Descenso Controlado:\n" +
            "   • El descenso se realiza exclusivamente mediante la maniobra de descuelgue guiada por el asegurador oficial. Prohibido saltar de la pared.",
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
            "Términos y Condiciones para Jardinería (Taller Botánico y Huerta Agroecológica):\n\n" +
            "1. Participación Familiar:\n" +
            "   • Taller abierto a todas las edades, diseñado para fomentar la conexión con la naturaleza y el aprendizaje colectivo.\n" +
            "   • Menores de 8 años deben estar acompañados por un adulto responsable en el uso de herramientas de siembra.\n\n" +
            "2. Manejo de Herramientas y Seguridad:\n" +
            "   • Se proveen guantes de protección y palas de mano. El uso de tijeras de podar queda restringido a mayores de 14 años bajo supervisión.\n" +
            "   • Al finalizar el taller, las herramientas deben limpiarse y retornarse a los tableros organizadores.\n\n" +
            "3. Respeto y Cuidado Botánico:\n" +
            "   • Prohibido arrancar ramas, flores o ejemplares que no estén expresamente habilitados para cosecha o trasplante educativo.\n" +
            "   • Transitar únicamente por los senderos delimitados entre los canteros para no compactar la tierra fértil.\n\n" +
            "4. Compromiso Agroecológico:\n" +
            "   • Clasificar los residuos generados en compostables y reciclables según los contenedores del vivero.\n" +
            "   • Uso responsable y medido del agua de riego durante las prácticas.",
    },
];
