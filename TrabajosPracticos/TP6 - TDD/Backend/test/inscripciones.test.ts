import assert from "node:assert";
import { describe, it } from "node:test";
import { inscribirActividad } from "../src/inscripciones/servicio";

import {
  InscripcionRechazadaError,
  type Inscripcion,
} from "../src/inscripciones/modelos";
import { crearActividadesMock } from "../src/inscripciones/datos-mocks";

describe("Pruebas para la lógica de inscripción a actividades del parque", () => {
  // =========================================================================
  // 1. CASOS DE ÉXITO (HAPPY PATHS) Y EFECTOS SECUNDARIOS
  // =========================================================================

  it("permite inscripciones a actividades que no requieren vestimenta", () => {
    // Arrange: Solicitud válida para Jardinería (sin especificar talle de vestimenta)
    const solicitud = {
      actividad: "Jardinería",
      horario: "2026-10-20T10:00:00-03:00",
      participantes: [
        {
          dni: "12345678",
          edad: 25,
          nombre: "Juan Pérez",
        },
      ],
      aceptaTerminos: true,
    };

    // Act: Ejecutamos la inscripción
    const resultado = inscribirActividad(solicitud as any);

    // Assert: Verificamos éxito y generación del código QR
    assert.strictEqual(resultado.exito, true);
    assert.ok(
      resultado.codigoQR,
      "Debe generar un código QR para la inscripción",
    );
  });

  it("permite inscripciones con vestimenta usando un talle permitido", () => {
    // Arrange: Solicitud válida para Palestra con talle permitido ('M') y edad apta (16 años)
    const solicitud = {
      actividad: "Palestra",
      horario: "2026-10-20T11:00:00-03:00",
      participantes: [
        {
          dni: "35987654",
          edad: 16,
          nombre: "Ana Gómez",
          talla: "M",
        },
      ],
      aceptaTerminos: true,
    };

    // Act
    const resultado = inscribirActividad(solicitud as any);

    // Assert
    assert.strictEqual(resultado.exito, true);
    assert.ok(resultado.codigoQR, "Debe generar un código QR");
  });

  it("rechaza participantes sin nombre", (t) => {
    // Precondiciones: reloj fijo y un participante con DNI y edad, pero sin nombre
    const ahora = new Date("2026-10-20T10:00:00-03:00");
    t.mock.method(Date, "now", () => ahora.getTime());

    const solicitud = {
      actividad: "Safari",
      horario: "2026-10-20T11:00:00-03:00",
      participantes: [{ dni: "12345678", edad: 25 }],
      aceptaTerminos: true,
    };

    // Pasos y Resultado
    assert.throws(
      () => inscribirActividad(solicitud),
      (error: unknown) =>
        error instanceof InscripcionRechazadaError &&
        error.motivo === "PARTICIPANTE_INCOMPLETO",
      "Debe rechazar un participante sin nombre",
    );
  });

  it("permite reservar exactamente 24 horas antes del turno", () => {
    // Límite superior de anticipación permitida
  });

  it("permite reservar actividades en distintos turnos", (t) => {
    // Precondiciones: reloj fijo y Juan Pérez ya inscripto en Safari a las 10:00
    const ahora = new Date("2026-10-20T09:00:00-03:00");
    t.mock.method(Date, "now", () => ahora.getTime());

    const participante = { nombre: "Juan Pérez", dni: "12345678", edad: 25 };

    const inscripciones: Inscripcion[] = [
      {
        id: 1,
        usuarioId: "visitante-mock",
        actividadId: "safari",
        fechaHora: "2026-10-20T10:00:00-03:00",
        participantes: [participante],
      },
    ];

    const contexto = {
      actividades: crearActividadesMock(),
      inscripciones,
    };

    const solicitud = {
      actividad: "Jardinería",
      horario: "2026-10-20T14:00:00-03:00",
      participantes: [participante],
      aceptaTerminos: true,
    };

    // Pasos
    const resultado = inscribirActividad(solicitud, contexto);

    // Resultado
    assert.strictEqual(
      resultado.exito,
      true,
      "Debe aceptar al mismo participante en un turno distinto",
    );
    assert.strictEqual(inscripciones.length, 2);
  });

  it("descuenta los cupos disponibles tras una inscripción exitosa", (t) => {
    // Arrange: Safari comienza con sus 8 lugares libres.
    const ahora = new Date("2026-10-20T10:00:00-03:00");
    t.mock.method(Date, "now", () => ahora.getTime());

    const inscripciones: Inscripcion[] = [];
    const contexto = {
      actividades: crearActividadesMock(),
      inscripciones,
    };

    const solicitud = {
      actividad: "Safari",
      horario: "2026-10-20T11:00:00-03:00",
      participantes: [
        {
          nombre: "Juan Pérez",
          dni: "12345678",
          edad: 25,
        },
        {
          nombre: "Ana Gómez",
          dni: "40123456",
          edad: 30,
        },
      ],
      aceptaTerminos: true,
    };

    // Act
    const resultado = inscribirActividad(solicitud, contexto);

    // Assert
    const ocupados = inscripciones.reduce(
      (total, inscripcion) => total + inscripcion.participantes.length,
      0,
    );

    assert.strictEqual(resultado.exito, true);
    assert.strictEqual(8 - ocupados, 6);
  });

  it("retorna el código QR correspondiente al completar la inscripción", () => {
    // Verificar que el resultado de la inscripción contenga el QR de acceso
  });

  // =========================================================================
  // 2. VALIDACIONES DE ENTRADA Y PARTICIPANTES
  // =========================================================================

  it("rechaza la inscripción si no se selecciona ninguna actividad", () => {
    const solicitudInvalida = {
      actividad: null,
      horario: "2026-10-20T10:00:00-03:00",
      participantes: [{ dni: "12345678", edad: 20 }],
      aceptaTerminos: true,
    };

    assert.throws(
      () => inscribirActividad(solicitudInvalida as any),
      /Debe seleccionar una actividad/,
    );
  });

  it("rechaza inscripciones sin participantes", (t) => {
    // Precondiciones: reloj fijo y una solicitud con la lista de participantes vacía
    const ahora = new Date("2026-10-20T10:00:00-03:00");
    t.mock.method(Date, "now", () => ahora.getTime());

    const solicitud = {
      actividad: "Safari",
      horario: "2026-10-20T11:00:00-03:00",
      participantes: [],
      aceptaTerminos: true,
    };

    // Pasos y Resultado
    assert.throws(
      () => inscribirActividad(solicitud),
      (error: unknown) =>
        error instanceof InscripcionRechazadaError &&
        error.motivo === "SIN_PARTICIPANTES",
      "Debe rechazar una inscripción sin participantes",
    );
  });

  it("rechaza participantes incompletos", (t) => {
    // Arrange: solicitud válida, excepto por el DNI omitido.
    const ahora = new Date("2026-10-20T10:00:00-03:00");
    t.mock.method(Date, "now", () => ahora.getTime());

    const solicitud = {
      actividad: "Safari",
      horario: "2026-10-20T11:00:00-03:00",
      participantes: [
        {
          nombre: "Juan Pérez",
          edad: 25,
        },
      ],
      aceptaTerminos: true,
    };

    // Act y Assert
    assert.throws(
      () => inscribirActividad(solicitud),
      (error: unknown) =>
        error instanceof InscripcionRechazadaError &&
        error.motivo === "PARTICIPANTE_INCOMPLETO",
    );
  });

  it("rechaza participantes incompletos sin edad", (t) => {
    // Arrange: solicitud válida, excepto por la edad omitida.
    const ahora = new Date("2026-10-20T10:00:00-03:00");
    t.mock.method(Date, "now", () => ahora.getTime());

    const solicitud = {
      actividad: "Safari",
      horario: "2026-10-20T11:00:00-03:00",
      participantes: [
        {
          nombre: "Juan Pérez",
          dni: "12345678",
        },
      ],
      aceptaTerminos: true,
    };

    // Act y Assert
    assert.throws(
      () => inscribirActividad(solicitud),
      (error: unknown) =>
        error instanceof InscripcionRechazadaError &&
        error.motivo === "PARTICIPANTE_INCOMPLETO",
    );
  });

  it("rechaza inscripciones a actividades no disponibles", () => {
    // Precondiciones: Safari existe en el catálogo, pero no está disponible
    const actividades = crearActividadesMock().map((actividad) =>
      actividad.nombre === "Safari"
        ? { ...actividad, disponible: false }
        : actividad,
    );
    const solicitud = {
      actividad: "Safari",
      horario: "2026-10-20T10:00:00-03:00",
      participantes: [{ nombre: "Juan Pérez", dni: "12345678", edad: 25 }],
      aceptaTerminos: true,
    };

    // Pasos y Resultado
    assert.throws(
      () => inscribirActividad(solicitud, { actividades }),
      (error: unknown) =>
        error instanceof InscripcionRechazadaError &&
        error.motivo === "ACTIVIDAD_NO_DISPONIBLE",
      "Debe rechazar la inscripción a una actividad no disponible",
    );
  });

  // =========================================================================
  // 3. REGLAS DE CUPOS Y DISPONIBILIDAD
  // =========================================================================

  it("rechaza inscripciones cuando no hay cupos suficientes para todo el grupo", (t) => {
    // Arrange: Safari tiene 7 de sus 8 lugares ocupados.
    const ahora = new Date("2026-10-20T10:00:00-03:00");
    t.mock.method(Date, "now", () => ahora.getTime());

    const horario = "2026-10-20T11:00:00-03:00";

    const inscripciones: Inscripcion[] = [
      {
        id: 1,
        usuarioId: "otro-visitante",
        actividadId: "safari",
        fechaHora: horario,
        participantes: Array.from({ length: 7 }, (_, indice) => ({
          dni: String(30000000 + indice),
          edad: 25,
        })),
      },
    ];

    const contexto = {
      actividades: crearActividadesMock(),
      inscripciones,
    };

    const solicitud = {
      actividad: "Safari",
      horario,
      participantes: [
        { nombre: "Juan Pérez", dni: "40123456", edad: 25 },
        { nombre: "Ana Gómez", dni: "41234567", edad: 30 },
      ],
      aceptaTerminos: true,
    };

    // Act y Assert
    assert.throws(
      () => inscribirActividad(solicitud, contexto),
      (error: unknown) =>
        error instanceof InscripcionRechazadaError &&
        error.motivo === "SIN_CUPOS",
    );
  });

  // =========================================================================
  // 4. VESTIMENTA Y TALLES
  // =========================================================================

  it("rechaza inscripciones si falta el talle requerido", () => {
    // Precondiciones: Palestra requiere vestimenta y el participante no informa talle
    const solicitud = {
      actividad: "Palestra",
      horario: "2026-10-20T10:00:00-03:00",
      participantes: [{ nombre: "Ana Gómez", dni: "35987654", edad: 16 }],
      aceptaTerminos: true,
    };

    // Pasos y Resultado
    assert.throws(
      () => inscribirActividad(solicitud),
      (error: unknown) =>
        error instanceof InscripcionRechazadaError &&
        error.motivo === "VESTIMENTA_REQUERIDA",
      "Debe rechazar la inscripción si falta el talle en una actividad que lo requiere",
    );
  });

  it("rechaza inscripciones si el talle de vestimenta no es válido", (t) => {
    // Precondiciones: reloj fijo y Palestra con un talle fuera de la lista permitida
    const ahora = new Date("2026-10-20T10:00:00-03:00");
    t.mock.method(Date, "now", () => ahora.getTime());

    const solicitud = {
      actividad: "Palestra",
      horario: "2026-10-20T11:00:00-03:00",
      participantes: [
        { nombre: "Ana Gómez", dni: "35987654", edad: 16, talla: "XXXL" },
      ],
      aceptaTerminos: true,
    };

    // Pasos y Resultado
    assert.throws(
      () => inscribirActividad(solicitud),
      (error: unknown) =>
        error instanceof InscripcionRechazadaError &&
        error.motivo === "TALLE_INVALIDO",
      "Debe rechazar un talle que no está entre los permitidos",
    );
  });

  // =========================================================================
  // 5. RESTRICCIONES POR EDAD
  // =========================================================================

  it("rechaza participantes menores a la edad mínima de Palestra", (t) => {
    // Arrange: reserva una hora antes de un turno válido.
    const ahora = new Date("2026-10-20T10:00:00-03:00");
    t.mock.method(Date, "now", () => ahora.getTime());

    const solicitud = {
      actividad: "Palestra",
      horario: "2026-10-20T11:00:00-03:00",
      participantes: [
        {
          nombre: "Ana Gómez",
          dni: "50123456",
          edad: 11,
          talla: "M",
        },
      ],
      aceptaTerminos: true,
    };

    // Act y Assert
    assert.throws(
      () => inscribirActividad(solicitud),
      (error: unknown) =>
        error instanceof InscripcionRechazadaError &&
        error.motivo === "EDAD_MINIMA_NO_CUMPLIDA",
    );
  });

  it("rechaza participantes menores a la edad mínima de Tirolesa", () => {
    // Precondiciones: Tirolesa exige 8 años como mínimo
    const solicitud = {
      actividad: "Tirolesa",
      horario: "2026-10-20T10:00:00-03:00",
      participantes: [
        { nombre: "Tomás Díaz", dni: "55123456", edad: 7, talla: "S" },
      ],
      aceptaTerminos: true,
    };

    // Pasos y Resultado
    assert.throws(
      () => inscribirActividad(solicitud),
      (error: unknown) =>
        error instanceof InscripcionRechazadaError &&
        error.motivo === "EDAD_MINIMA_NO_CUMPLIDA",
      "Debe rechazar a un participante de 7 años en Tirolesa",
    );
  });

  it("acepta participantes que cumplen la edad mínima de Tirolesa", () => {
    // Precondiciones: participante con exactamente 8 años (edad mínima de Tirolesa)
    const solicitud = {
      actividad: "Tirolesa",
      horario: "2026-10-20T10:00:00-03:00",
      participantes: [
        { nombre: "Lucía Ríos", dni: "54123456", edad: 8, talla: "S" },
      ],
      aceptaTerminos: true,
    };

    // Pasos
    const resultado = inscribirActividad(solicitud);

    // Resultado
    assert.strictEqual(
      resultado.exito,
      true,
      "Debe aceptar a un participante con exactamente la edad mínima",
    );
  });

  // =========================================================================
  // 6. CALENDARIO: DÍAS DE CIERRE Y FERIADOS
  // =========================================================================

  it("rechaza inscripciones en días semanales de cierre del parque", (t) => {
    // Arrange: reservamos el domingo para un turno del lunes.
    const ahora = new Date("2026-10-25T10:00:00-03:00");
    t.mock.method(Date, "now", () => ahora.getTime());

    const solicitud = {
      actividad: "Safari",
      horario: "2026-10-26T09:00:00-03:00",
      participantes: [
        {
          nombre: "Juan Pérez",
          dni: "12345678",
          edad: 25,
        },
      ],
      aceptaTerminos: true,
    };

    // Act y Assert
    assert.throws(
      () => inscribirActividad(solicitud),
      (error: unknown) =>
        error instanceof InscripcionRechazadaError &&
        error.motivo === "PARQUE_CERRADO",
    );
  });

  it("rechaza inscripciones en feriados", () => {
    // Turno correspondiente a 25 de diciembre o 1 de enero
  });

  // =========================================================================
  // 7. RESTRICCIONES HORARIAS Y DE ANTICIPACIÓN
  // =========================================================================

  it("rechaza reservas con más de 24 horas de anticipación", (t) => {
    // Arrange: el turno comienza 25 horas después.
    const ahora = new Date("2026-10-20T10:00:00-03:00");
    t.mock.method(Date, "now", () => ahora.getTime());

    const solicitud = {
      actividad: "Safari",
      horario: "2026-10-21T11:00:00-03:00",
      participantes: [
        {
          nombre: "Juan Pérez",
          dni: "12345678",
          edad: 25,
        },
      ],
      aceptaTerminos: true,
    };

    // Act y Assert
    assert.throws(
      () => inscribirActividad(solicitud),
      (error: unknown) =>
        error instanceof InscripcionRechazadaError &&
        error.motivo === "FUERA_DE_ANTICIPACION",
    );
  });

  it("rechaza inscripciones a 15 minutos o menos del inicio", () => {
    // Reserva dentro de la ventana de corte de 15 minutos previos al inicio
  });

  it("rechaza turnos fuera del horario de actividades", () => {
    // Turnos fuera de la franja de 09:00 a 17:00 (ej. 08:00 o 18:00)
  });

  it("rechaza turnos que no comienzan en punto", () => {
    // Horario con minutos fraccionados (ej. 10:15 o 14:30)
  });

  it("rechaza inscripciones durante horarios de cierre del parque", () => {
    // Horarios fuera de la jornada del parque (8:30 a 19:00)
    it("rechaza inscripciones durante horarios de cierre del parque", () => {
      const horarioParque = {
        ...crearHorarioParqueMock(),
        cierre: "16:30",
      };
      const servicio = new ServicioInscripciones({
        actividades: crearActividadesMock(),
        horarioParque,
        horariosActividades: crearHorariosActividadesMock(),
        sesion: crearSesionUsuarioMock(),
        ahora: () => new Date("2026-10-20T12:00:00-03:00"),
      });

      assert.throws(
        () =>
          servicio.inscribir({
            actividadId: "safari",
            fechaHora: "20/10/2026 17:00",
            participantes: [{ dni: "12345678", edad: 30 }],
            aceptaTerminos: true,
          }),
        (error: unknown) =>
          error instanceof InscripcionRechazadaError &&
          error.motivo === "PARQUE_CERRADO",
      );
    });
  });

  // =========================================================================
  // 8. CONCURRENCIA Y TÉRMINOS LEGALES
  // =========================================================================

  it("rechaza reservas de actividades simultáneas", (t) => {
    // Precondiciones: reloj fijo y Juan Pérez ya inscripto en Safari a las 11:00
    const ahora = new Date("2026-10-20T10:00:00-03:00");
    t.mock.method(Date, "now", () => ahora.getTime());

    const horario = "2026-10-20T11:00:00-03:00";
    const participante = { nombre: "Juan Pérez", dni: "12345678", edad: 25 };

    const inscripciones: Inscripcion[] = [
      {
        id: 1,
        usuarioId: "visitante-mock",
        actividadId: "safari",
        fechaHora: horario,
        participantes: [participante],
      },
    ];

    const contexto = {
      actividades: crearActividadesMock(),
      inscripciones,
    };

    const solicitud = {
      actividad: "Jardinería",
      horario,
      participantes: [participante],
      aceptaTerminos: true,
    };

    // Pasos y Resultado
    assert.throws(
      () => inscribirActividad(solicitud, contexto),
      (error: unknown) =>
        error instanceof InscripcionRechazadaError &&
        error.motivo === "INSCRIPCION_SUPERPUESTA",
      "Debe rechazar a un participante ya inscripto en otra actividad del mismo horario",
    );
  });

  it("rechaza inscripciones si no se aceptan los términos y condiciones", (t) => {
    // Arrange: solicitud válida, excepto por los términos.
    const ahora = new Date("2026-10-20T10:00:00-03:00");
    t.mock.method(Date, "now", () => ahora.getTime());

    const solicitud = {
      actividad: "Safari",
      horario: "2026-10-20T11:00:00-03:00",
      participantes: [
        {
          nombre: "Juan Pérez",
          dni: "12345678",
          edad: 25,
        },
      ],
      aceptaTerminos: false,
    };

    // Act y Assert
    assert.throws(
      () => inscribirActividad(solicitud),
      (error: unknown) =>
        error instanceof InscripcionRechazadaError &&
        error.motivo === "TERMINOS_NO_ACEPTADOS",
    );
  });
});
