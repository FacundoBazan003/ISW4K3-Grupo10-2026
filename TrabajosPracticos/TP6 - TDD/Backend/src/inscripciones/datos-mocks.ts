import type {
  Actividad,
  ReglasCierreParque,
  SesionUsuarioMock,
} from "./modelos.ts";

export function crearActividadesMock(): Actividad[] {
  return [
    {
      id: "tirolesa",
      nombre: "Tirolesa",
      disponible: true,
      requiereVestimenta: true,
      cuposPorTurno: 10,
      edadMinima: 8,
    },
    {
      id: "safari",
      nombre: "Safari",
      disponible: true,
      requiereVestimenta: false,
      cuposPorTurno: 8,
    },
    {
      id: "palestra",
      nombre: "Palestra",
      disponible: true,
      requiereVestimenta: true,
      cuposPorTurno: 12,
      edadMinima: 12,
    },
    {
      id: "jardineria",
      nombre: "Jardinería",
      disponible: true,
      requiereVestimenta: false,
      cuposPorTurno: 12,
    },
  ];
}

export function crearSesionUsuarioMock(): SesionUsuarioMock {
  return { usuarioId: "visitante-mock" };
}

export function crearHorarioParqueMock(): { apertura: string; cierre: string } {
  return { apertura: "08:30", cierre: "19:00" };
}

export function crearHorariosActividadesMock(): string[] {
  return [
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
  ];
}

export function crearReglasCierreParqueMock(): ReglasCierreParque {
  return {
    diasCerrados: ["LUNES"],
    fechasCerradas: [],
    diasMesCerrados: [
      { dia: 25, mes: 12 },
      { dia: 1, mes: 1 },
    ],
    horariosCerrados: [],
  };
}
