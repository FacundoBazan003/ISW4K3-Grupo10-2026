import {
  crearActividadesMock,
  crearHorarioParqueMock,
  crearHorariosActividadesMock,
  crearSesionUsuarioMock,
  crearReglasCierreParqueMock,
} from "./datos-mocks";
import {
  InscripcionRechazadaError,
  type Actividad,
  type DiaSemana,
  type Inscripcion,
  type Participante,
} from "./modelos";

const TALLES_PERMITIDOS = ["XS", "S", "M", "L", "XL", "XXL"];
const ANTICIPACION_MINIMA_MS = 15 * 60 * 1000;
const ANTICIPACION_MAXIMA_MS = 24 * 60 * 60 * 1000;
const ZONA_HORARIA_PARQUE = "America/Argentina/Buenos_Aires";
const FORMATEADOR_HORA_PARQUE = new Intl.DateTimeFormat("en-GB", {
  timeZone: ZONA_HORARIA_PARQUE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});
const DIAS_SEMANA: DiaSemana[] = [
  "DOMINGO",
  "LUNES",
  "MARTES",
  "MIERCOLES",
  "JUEVES",
  "VIERNES",
  "SABADO",
];

interface ContextoInscripcion {
  actividades?: Actividad[];
  inscripciones?: Inscripcion[];
  horarioParque?: ReturnType<typeof crearHorarioParqueMock>;
}

export function inscribirActividad(
  solicitud: any,
  contexto: ContextoInscripcion = {}
): any {
  if (!solicitud?.actividad) {
    throw new Error("Debe seleccionar una actividad");
  }

  const actividades = contexto.actividades ?? crearActividadesMock();
  const actividad = buscarActividad(actividades, solicitud.actividad);
  validarDisponibilidad(actividad);

  validarParticipantesInformados(solicitud.participantes);
  validarDatosObligatoriosParticipantes(solicitud.participantes);

  validarTerminos(solicitud.aceptaTerminos);

  // Validación de vestimenta si la actividad lo demanda
  if (actividad?.requiereVestimenta) {
    validarVestimenta(solicitud.participantes);
  }
  // Validación de edad mínima si la actividad la define
  if (actividad?.edadMinima !== undefined) {
    validarEdadMinima(solicitud.participantes, actividad.edadMinima);
  }

  validarAnticipacion(solicitud.horario);

  validarCierreSemanal(solicitud.horario);
  validarCierreHorario(
    solicitud.horario,
    contexto.horarioParque ?? crearHorarioParqueMock(),
  );

  validarHorarioActividad(solicitud.horario);
  validarFeriados(solicitud.horario);

  validarInicioTurnoEnPunto(solicitud.horario);

  const inscripciones = contexto.inscripciones ?? [];

  validarInscripcionesSuperpuestas(solicitud, inscripciones);

  if (actividad) {
    validarCupos(solicitud, actividad, inscripciones);
    registrarInscripcion(solicitud, actividad, inscripciones);
  }

  const codigoQR = `QR-${solicitud.actividad}-${Date.now()}`;

  return {
    exito: true,
    codigoQR,
  };
}

function buscarActividad(
  actividades: Actividad[],
  nombre: string
): Actividad | undefined {
  return actividades.find((actividad) => actividad.nombre === nombre);
}

function validarDisponibilidad(actividad: Actividad | undefined): void {
  if (actividad?.disponible === false) {
    throw new InscripcionRechazadaError("ACTIVIDAD_NO_DISPONIBLE");
  }
}

function validarEdadMinima(
  participantes: Participante[],
  edadMinima: number
): void {
  for (const participante of participantes) {
    if (participante.edad < edadMinima) {
      throw new InscripcionRechazadaError(
        "EDAD_MINIMA_NO_CUMPLIDA"
      );
    }
  }
}

function validarTerminos(aceptaTerminos: boolean): void {
  if (aceptaTerminos !== true) {
    throw new InscripcionRechazadaError(
      "TERMINOS_NO_ACEPTADOS"
    );
  }
}

function validarParticipantesInformados(participantes?: Participante[]): void {
  if (!participantes || participantes.length === 0) {
    throw new InscripcionRechazadaError("SIN_PARTICIPANTES");
  }
}

function validarDatosObligatoriosParticipantes(participantes: Participante[]): void {
  for (const participante of participantes) {
    if (!tieneDatosObligatorios(participante)) {
      throw new InscripcionRechazadaError(
        "PARTICIPANTE_INCOMPLETO"
      );
    }
  }
}

function tieneDatosObligatorios(participante: Participante): boolean {
  return (
    Boolean(participante.nombre) &&
    Boolean(participante.dni) &&
    participante.edad !== undefined &&
    participante.edad !== null
  );
}

function validarAnticipacion(horario: string): void {
  const anticipacionMs =
    new Date(horario).getTime() - Date.now();

  if (anticipacionMs >= 0 && anticipacionMs <= ANTICIPACION_MINIMA_MS) {
    throw new InscripcionRechazadaError(
      "CIERRE_DE_INSCRIPCION"
    );
  }

  if (anticipacionMs > ANTICIPACION_MAXIMA_MS) {
    throw new InscripcionRechazadaError(
      "FUERA_DE_ANTICIPACION"
    );
  }
}

function registrarInscripcion(
  solicitud: any,
  actividad: Actividad,
  inscripciones: Inscripcion[]
): void {
  const nuevaInscripcion: Inscripcion = {
    id: Math.max(0, ...inscripciones.map((i) => i.id)) + 1,
    usuarioId: crearSesionUsuarioMock().usuarioId,
    actividadId: actividad.id,
    fechaHora: solicitud.horario,
    participantes: solicitud.participantes,
  };

  inscripciones.push(nuevaInscripcion);
}

function validarVestimenta(participantes: { talla?: string }[]): void {
  for (const participante of participantes) {
    if (!participante.talla) {
      throw new InscripcionRechazadaError("VESTIMENTA_REQUERIDA");
    }

    if (!esTallePermitido(participante.talla)) {
      throw new InscripcionRechazadaError("TALLE_INVALIDO");
    }
  }
}

function esTallePermitido(talla: string): boolean {
  return TALLES_PERMITIDOS.includes(talla);
}

function validarCupos(
  solicitud: any,
  actividad: Actividad,
  inscripciones: Inscripcion[]
): void {
  const cuposOcupados = inscripciones
    .filter(
      (inscripcion) =>
        inscripcion.actividadId === actividad.id &&
        esMismoTurno(inscripcion, solicitud.horario)
    )
    .reduce(
      (total, inscripcion) => total + inscripcion.participantes.length,
      0
    );

  const cuposDisponibles = actividad.cuposPorTurno - cuposOcupados;

  if (solicitud.participantes.length > cuposDisponibles) {
    throw new InscripcionRechazadaError("SIN_CUPOS");
  }
}

function validarInscripcionesSuperpuestas(
  solicitud: any,
  inscripciones: Inscripcion[]
): void {
  for (const participante of solicitud.participantes) {
    const tieneOtraInscripcion = inscripciones.some(
      (inscripcion) =>
        esMismoTurno(inscripcion, solicitud.horario) &&
        estaInscripto(participante, inscripcion)
    );

    if (tieneOtraInscripcion) {
      throw new InscripcionRechazadaError("INSCRIPCION_SUPERPUESTA");
    }
  }
}

function esMismoTurno(inscripcion: Inscripcion, horario: string): boolean {
  return inscripcion.fechaHora === horario;
}

function estaInscripto(
  participante: Participante,
  inscripcion: Inscripcion
): boolean {
  return inscripcion.participantes.some(
    (inscripto) => inscripto.dni === participante.dni
  );
}

function validarCierreSemanal(horario: string): void {
  const reglasCierre = crearReglasCierreParqueMock();

  const fechaTurno = new Date(horario);
  const diaTurno = DIAS_SEMANA[fechaTurno.getDay()];

  if (reglasCierre.diasCerrados.includes(diaTurno)) {
    throw new InscripcionRechazadaError("PARQUE_CERRADO");
  }
}

function validarFeriados(horario: string): void {
  const reglasCierre = crearReglasCierreParqueMock();
  const fechaEnParque = new Intl.DateTimeFormat("es-AR", {
    timeZone: ZONA_HORARIA_PARQUE,
    day: "numeric",
    month: "numeric",
  }).formatToParts(new Date(horario));
  const diaTurno = Number(fechaEnParque.find((parte) => parte.type === "day")?.value);
  const mesTurno = Number(fechaEnParque.find((parte) => parte.type === "month")?.value);

  if (
    reglasCierre.diasMesCerrados.some(
      (feriado) => feriado.dia === diaTurno && feriado.mes === mesTurno
    )
  ) {
    throw new InscripcionRechazadaError("PARQUE_CERRADO");
  }
}

function validarInicioTurnoEnPunto(horario: string): void {
  const minutosTurno = minutosDesdeMedianoche(horaEnParque(new Date(horario)));

  if (minutosTurno === undefined || minutosTurno % 60 !== 0) {
    throw new InscripcionRechazadaError("HORARIO_NO_DISPONIBLE");
  }
}

function validarCierreHorario(
  horario: string,
  horarioParque: ReturnType<typeof crearHorarioParqueMock>,
): void {
  const fechaTurno = new Date(horario);
  if (Number.isNaN(fechaTurno.getTime())) {
    throw new InscripcionRechazadaError("HORARIO_NO_DISPONIBLE");
  }

  const minutosTurno = minutosDesdeMedianoche(horaEnParque(fechaTurno));
  const minutosApertura = minutosDesdeMedianoche(horarioParque.apertura);
  const minutosCierre = minutosDesdeMedianoche(horarioParque.cierre);

  if (
    minutosTurno === undefined ||
    minutosApertura === undefined ||
    minutosCierre === undefined ||
    minutosApertura >= minutosCierre
  ) {
    throw new Error("El horario de apertura o cierre del parque es inválido.");
  }

  if (minutosTurno < minutosApertura || minutosTurno >= minutosCierre) {
    throw new InscripcionRechazadaError("PARQUE_CERRADO");
  }
}

function validarHorarioActividad(horario: string): void {
  const horasActividades = crearHorariosActividadesMock().map((turno) =>
    Number(turno.split(":")[0])
  );

  const horaTurno = Number(horaEnParque(new Date(horario)).split(":")[0]);

  if (!horasActividades.includes(horaTurno)) {
    throw new InscripcionRechazadaError("HORARIO_NO_DISPONIBLE");
  }
}

function horaEnParque(fecha: Date): string {
  return FORMATEADOR_HORA_PARQUE.format(fecha);
}

function minutosDesdeMedianoche(hora: string): number | undefined {
  const coincidencia = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(hora);
  if (!coincidencia) {
    return undefined;
  }

  return Number(coincidencia[1]) * 60 + Number(coincidencia[2]);
}
