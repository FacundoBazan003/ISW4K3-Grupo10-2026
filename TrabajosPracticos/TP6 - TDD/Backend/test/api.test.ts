import assert from "node:assert/strict";
import { createServer } from "node:http";
import { it, type TestContext } from "node:test";
import { crearApp } from "../src/api/app";
import { crearActividadesMock } from "../src/inscripciones/datos-mocks";
import type { Inscripcion } from "../src/inscripciones/modelos";

const AHORA = new Date("2026-10-20T10:00:00-03:00").getTime();

async function iniciarApi(
  t: TestContext,
  actividades = crearActividadesMock(),
) {
  t.mock.method(Date, "now", () => AHORA);
  const inscripciones: Inscripcion[] = [];
  const servidor = createServer(crearApp({ actividades, inscripciones }));
  await new Promise<void>((resolve) =>
    servidor.listen(0, "127.0.0.1", resolve),
  );
  t.after(async () => {
    servidor.closeAllConnections();
    await new Promise<void>((resolve, reject) =>
      servidor.close((error) => (error ? reject(error) : resolve())),
    );
  });
  const direccion = servidor.address();
  assert.ok(direccion && typeof direccion !== "string");
  const base = `http://127.0.0.1:${direccion.port}/api`;
  const post = (body: unknown) =>
    fetch(`${base}/inscripciones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  return { base, post, inscripciones };
}

function solicitud(overrides: Record<string, unknown> = {}) {
  return {
    activityId: "safari",
    fecha: "2026-10-20",
    horario: "11:00",
    participantes: [{ nombre: "Visitante", dni: "40123456", edad: 25 }],
    aceptaTerminos: true,
    titularNombre: "Visitante de prueba",
    titularEmail: "visitante@example.com",
    ...overrides,
  };
}

it("API: devuelve el catálogo y las reglas del backend", async (t) => {
  const { base } = await iniciarApi(t);
  const catalogo = await (await fetch(`${base}/actividades`)).json();
  assert.equal(
    catalogo.find((a: { id: string }) => a.id === "safari").cuposPorTurno,
    8,
  );
  assert.equal(
    catalogo.find((a: { id: string }) => a.id === "tirolesa").edadMinima,
    8,
  );
  const reglas = await (await fetch(`${base}/parque/reglas`)).json();
  assert.deepEqual(reglas.diasCerrados, ["LUNES"]);
});

it("API: registra una inscripción válida y conserva los cupos entre clientes", async (t) => {
  const { base, post, inscripciones } = await iniciarApi(t);
  const respuesta = await post(solicitud());
  assert.equal(respuesta.status, 201);
  const reserva = await respuesta.json();
  assert.equal(reserva.activityName, "Safari");
  assert.equal(reserva.titularEmail, "visitante@example.com");
  assert.ok(reserva.codigoQR);
  assert.equal(inscripciones.length, 1);
  assert.equal(inscripciones[0].fechaHora, "2026-10-20T11:00:00-03:00");
  const turnos = await (
    await fetch(`${base}/actividades/safari/turnos?fecha=2026-10-20`)
  ).json();
  assert.equal(
    turnos.find((s: { horario: string }) => s.horario === "11:00")
      .cuposDisponibles,
    7,
  );
  assert.equal(
    turnos.find((s: { horario: string }) => s.horario === "12:00")
      .cuposDisponibles,
    8,
  );
  const otros = await (
    await fetch(`${base}/actividades/palestra/turnos?fecha=2026-10-20`)
  ).json();
  assert.equal(
    otros.find((s: { horario: string }) => s.horario === "11:00")
      .cuposDisponibles,
    12,
  );
});

it("API: adapta talle M y acepta la edad mínima de Tirolesa", async (t) => {
  const { post } = await iniciarApi(t);
  const respuesta = await post(
    solicitud({
      activityId: "tirolesa",
      participantes: [{ nombre: "Visitante", dni: "40123456", edad: 8, talle: "M" }],
    }),
  );
  assert.equal(respuesta.status, 201);
  assert.equal((await respuesta.json()).participantes[0].talle, "M");
});

it("API: acepta exactamente 24 horas de anticipación", async (t) => {
  const { post } = await iniciarApi(t);
  assert.equal(
    (await post(solicitud({ fecha: "2026-10-21", horario: "10:00" }))).status,
    201,
  );
});

it("API: disponibilidad y reserva rechazan 15 minutos o menos", async (t) => {
  const { base, post, inscripciones } = await iniciarApi(t);
  const casos = [
    { ahora: "2026-10-20T10:44:59.999-03:00", dni: "40123456", permite: true },
    { ahora: "2026-10-20T10:45:00.000-03:00", dni: "40123457", permite: false },
    { ahora: "2026-10-20T10:45:00.001-03:00", dni: "40123458", permite: false },
  ];
  for (const caso of casos) {
    t.mock.method(Date, "now", () => new Date(caso.ahora).getTime());
    const turnos = await (
      await fetch(`${base}/actividades/safari/turnos?fecha=2026-10-20`)
    ).json();
    const turno = turnos.find((s: { horario: string }) => s.horario === "11:00");
    assert.equal(turno.disponible, caso.permite, caso.ahora);
    const respuesta = await post(solicitud({
      participantes: [{ nombre: "Visitante", dni: caso.dni, edad: 25 }],
    }));
    assert.equal(respuesta.status, caso.permite ? 201 : 400, caso.ahora);
    if (caso.permite) {
      assert.ok((await respuesta.json()).codigoQR);
    } else {
      assert.equal((await respuesta.json()).motivo, "CIERRE_DE_INSCRIPCION");
    }
  }
  assert.equal(inscripciones.length, 1);
});

it("API: propaga los rechazos del dominio sin registrar ni ocupar cupos", async (t) => {
  const { post, inscripciones } = await iniciarApi(t);
  const casos = [
    {
      cambios: { participantes: [{ dni: "40123456", edad: 25 }] },
      motivo: "PARTICIPANTE_INCOMPLETO",
    },
    {
      cambios: { participantes: [{ nombre: "", dni: "40123456", edad: 25 }] },
      motivo: "PARTICIPANTE_INCOMPLETO",
    },
    { cambios: { aceptaTerminos: false }, motivo: "TERMINOS_NO_ACEPTADOS" },
    { cambios: { participantes: [] }, motivo: "SIN_PARTICIPANTES" },
    {
      cambios: { participantes: [{ nombre: "Visitante", edad: 25 }] },
      motivo: "PARTICIPANTE_INCOMPLETO",
    },
    {
      cambios: { participantes: [{ nombre: "Visitante", dni: "40123456" }] },
      motivo: "PARTICIPANTE_INCOMPLETO",
    },
    {
      cambios: {
        activityId: "palestra",
        participantes: [{ nombre: "Visitante", dni: "40123456", edad: 11, talle: "M" }],
      },
      motivo: "EDAD_MINIMA_NO_CUMPLIDA",
    },
    {
      cambios: {
        activityId: "tirolesa",
        participantes: [{ nombre: "Visitante", dni: "40123456", edad: 7, talle: "M" }],
      },
      motivo: "EDAD_MINIMA_NO_CUMPLIDA",
    },
    { cambios: { activityId: "palestra" }, motivo: "VESTIMENTA_REQUERIDA" },
    {
      cambios: {
        activityId: "palestra",
        participantes: [{ nombre: "Visitante", dni: "40123456", edad: 25, talle: "XXXL" }],
      },
      motivo: "TALLE_INVALIDO",
    },
    {
      cambios: { fecha: "2026-10-21", horario: "11:00" },
      motivo: "FUERA_DE_ANTICIPACION",
    },
  ];
  for (const caso of casos) {
    const respuesta = await post(solicitud(caso.cambios));
    assert.equal(respuesta.status, 400, caso.motivo);
    assert.equal((await respuesta.json()).motivo, caso.motivo);
  }
  assert.equal(inscripciones.length, 0);
});

it("API: rechaza una actividad inexistente o deshabilitada", async (t) => {
  const actividades = crearActividadesMock();
  actividades.find((a) => a.id === "safari")!.disponible = false;
  const { post, inscripciones } = await iniciarApi(t, actividades);
  for (const activityId of ["safari", "inexistente"]) {
    const respuesta = await post(solicitud({ activityId }));
    assert.equal(respuesta.status, 400);
    assert.equal((await respuesta.json()).motivo, "ACTIVIDAD_NO_DISPONIBLE");
  }
  assert.equal(inscripciones.length, 0);
});

it("API: rechaza grupos sin cupo y evita sobreventa con solicitudes concurrentes", async (t) => {
  const { post, inscripciones } = await iniciarApi(t);
  const grupo = (inicio: number, cantidad: number) =>
    Array.from({ length: cantidad }, (_, i) => ({
      nombre: "Visitante de prueba",
      dni: String(inicio + i),
      edad: 25,
    }));
  assert.equal(
    (await post(solicitud({ participantes: grupo(30000000, 7) }))).status,
    201,
  );
  assert.equal(
    (await post(solicitud({ participantes: grupo(40000000, 2) }))).status,
    409,
  );
  const concurrentes = await Promise.all([
    post(solicitud({ participantes: grupo(50000000, 1) })),
    post(solicitud({ participantes: grupo(60000000, 1) })),
  ]);
  assert.deepEqual(concurrentes.map((r) => r.status).sort(), [201, 409]);
  assert.equal(
    inscripciones.reduce((total, i) => total + i.participantes.length, 0),
    8,
  );
});

it("API: mantiene las restricciones de calendario y horario del frontend", async (t) => {
  const { post, inscripciones } = await iniciarApi(t);
  const casos = [
    {
      ahora: "2026-10-25T10:00:00-03:00",
      fecha: "2026-10-26",
      horario: "09:00",
      motivo: "PARQUE_CERRADO",
    },
    {
      ahora: "2026-12-24T10:00:00-03:00",
      fecha: "2026-12-25",
      horario: "09:00",
      motivo: "PARQUE_CERRADO",
    },
    {
      ahora: "2026-12-31T10:00:00-03:00",
      fecha: "2027-01-01",
      horario: "09:00",
      motivo: "PARQUE_CERRADO",
    },
    {
      ahora: "2026-10-20T10:46:00-03:00",
      fecha: "2026-10-20",
      horario: "11:00",
      motivo: "CIERRE_DE_INSCRIPCION",
    },
    {
      ahora: "2026-10-20T10:00:00-03:00",
      fecha: "2026-10-20",
      horario: "09:00",
      motivo: "CIERRE_DE_INSCRIPCION",
    },
    {
      ahora: "2026-10-20T10:00:00-03:00",
      fecha: "2026-10-20",
      horario: "18:00",
      motivo: "HORARIO_NO_DISPONIBLE",
    },
    {
      ahora: "2026-10-20T10:00:00-03:00",
      fecha: "2026-10-20",
      horario: "11:30",
      motivo: "HORARIO_NO_DISPONIBLE",
    },
  ];
  for (const caso of casos) {
    t.mock.method(Date, "now", () => new Date(caso.ahora).getTime());
    const respuesta = await post(
      solicitud({ fecha: caso.fecha, horario: caso.horario }),
    );
    assert.equal(respuesta.status, 400, caso.motivo);
    assert.equal((await respuesta.json()).motivo, caso.motivo);
  }
  assert.equal(inscripciones.length, 0);
});

it("API: rechaza DNI simultáneo pero permite otro turno", async (t) => {
  const { post } = await iniciarApi(t);
  assert.equal((await post(solicitud())).status, 201);
  const repetida = await post(solicitud({ activityId: "jardineria" }));
  assert.equal(repetida.status, 409);
  assert.equal((await repetida.json()).motivo, "INSCRIPCION_SUPERPUESTA");
  assert.equal((await post(solicitud({ horario: "12:00" }))).status, 201);
});

it("API: devuelve errores JSON para entradas malformadas y rutas desconocidas", async (t) => {
  const { base, post, inscripciones } = await iniciarApi(t);
  for (const cambios of [
    { fecha: "2026-02-31" },
    { horario: "texto" },
    { participantes: "texto" },
    { participantes: [null] },
    { participantes: [{ dni: "40123456", edad: -1 }] },
  ]) {
    const respuesta = await post(solicitud(cambios));
    assert.equal(respuesta.status, 400);
    assert.equal((await respuesta.json()).exito, false);
  }
  const jsonInvalido = await fetch(`${base}/inscripciones`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{",
  });
  assert.equal(jsonInvalido.status, 400);
  assert.equal((await jsonInvalido.json()).exito, false);
  assert.equal((await fetch(`${base}/inexistente`)).status, 404);
  assert.equal(inscripciones.length, 0);
});
