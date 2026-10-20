import assert from "node:assert";
import { describe, it } from "node:test";
import { inscribirActividad } from "../src/inscripciones/servicio";

import { InscripcionRechazadaError } from "../src/inscripciones/modelos";
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
    assert.ok(resultado.codigoQR, "Debe generar un código QR para la inscripción");
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

  it("permite omitir el nombre de un participante", () => {
    // DNI y edad presentes, nombre omitido
  });

  it("permite reservar exactamente 24 horas antes del turno", () => {
    // Límite superior de anticipación permitida
  });

  it("permite reservar actividades en distintos turnos", () => {
    // Mismo participante en turnos separados (ej. 10:00 y 14:00)
  });

  it("descuenta los cupos disponibles tras una inscripción exitosa", () => {
    // Inscribir N participantes y verificar que los cupos del turno disminuyan en N
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

  it("rechaza inscripciones sin participantes", () => {
    // Lista de participantes vacía []
  });

  it("rechaza participantes incompletos", () => {
    // Participante sin DNI o sin edad
  });

  it("rechaza inscripciones a actividades no disponibles", () => {
    // Precondiciones: Safari existe en el catálogo, pero no está disponible
    const actividades = crearActividadesMock().map((actividad) =>
      actividad.nombre === "Safari"
        ? { ...actividad, disponible: false }
        : actividad
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
      "Debe rechazar la inscripción a una actividad no disponible"
    );
  });

  // =========================================================================
  // 3. REGLAS DE CUPOS Y DISPONIBILIDAD
  // =========================================================================

  it("rechaza inscripciones cuando no hay cupos suficientes para todo el grupo", () => {
    // Intentar inscribir más participantes que el cupo libre del turno
  });

  // =========================================================================
  // 4. VESTIMENTA Y TALLES
  // =========================================================================

  it("rechaza inscripciones si falta el talle requerido", () => {
    // Solicitud a 'Palestra' o 'Tirolesa' sin especificar talle
  });

  it("rechaza inscripciones si el talle de vestimenta no es válido", () => {
    // Talle fuera de la lista: XS, S, M, L, XL, XXL (ej. 'XXXXL')
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
        error.motivo === "EDAD_MINIMA_NO_CUMPLIDA"
    );
  });

  it("acepta participantes que cumplen la edad mínima de Tirolesa", () => {
    // Participante con exactamente 8 años inscribiéndose a Tirolesa
  });

  // =========================================================================
  // 6. CALENDARIO: DÍAS DE CIERRE Y FERIADOS
  // =========================================================================

  it("rechaza inscripciones en días semanales de cierre del parque", () => {
    // Turno correspondiente a un día lunes
  });

  it("rechaza inscripciones en feriados", () => {
    // Turno correspondiente a 25 de diciembre o 1 de enero
  });

  // =========================================================================
  // 7. RESTRICCIONES HORARIAS Y DE ANTICIPACIÓN
  // =========================================================================

  it("rechaza reservas con más de 24 horas de anticipación", () => {
    // Reserva intentada más de 24 horas antes del turno
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
  });

  // =========================================================================
  // 8. CONCURRENCIA Y TÉRMINOS LEGALES
  // =========================================================================

  it("rechaza reservas de actividades simultáneas", () => {
    // Mismo participante intentando reservar dos actividades en el mismo horario
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
        error.motivo === "TERMINOS_NO_ACEPTADOS"
    );
  });
});
