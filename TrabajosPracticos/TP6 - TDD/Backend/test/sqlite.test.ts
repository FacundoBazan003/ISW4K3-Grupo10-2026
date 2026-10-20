import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, rmdirSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { it, type TestContext } from "node:test";
import { crearApp } from "../src/api/app";
import { crearActividadesMock } from "../src/inscripciones/datos-mocks";
import { inscribirActividad } from "../src/inscripciones/servicio";
import { AlmacenSqlite } from "../src/persistencia/sqlite";

function preparar(t: TestContext) {
  t.mock.method(Date, "now", () =>
    new Date("2026-10-20T10:00:00-03:00").getTime(),
  );
  const carpeta = mkdtempSync(join(tmpdir(), "ecoharmony-sqlite-"));
  const archivo = join(carpeta, "prueba.db");
  const abiertos = new Set<AlmacenSqlite>();
  t.after(() => {
    for (const almacen of abiertos) almacen.cerrar();
    rmSync(archivo, { force: true });
    rmdirSync(carpeta);
  });
  const abrir = () => {
    const almacen = new AlmacenSqlite(archivo);
    abiertos.add(almacen);
    return almacen;
  };
  const cerrar = (almacen: AlmacenSqlite) => {
    almacen.cerrar();
    abiertos.delete(almacen);
  };
  return { archivo, abrir, cerrar };
}

function registrar(
  almacen: AlmacenSqlite,
  participantes = [{ nombre: "Visitante", dni: "40123456", edad: 25 }],
) {
  return almacen.transaccion((inscripciones) =>
    inscribirActividad(
      {
        actividad: "Safari",
        horario: "2026-10-20T11:00:00-03:00",
        participantes,
        aceptaTerminos: true,
      },
      { actividades: crearActividadesMock(), inscripciones },
    ),
  );
}

async function iniciarApi(t: TestContext, almacen: AlmacenSqlite) {
  const servidor = createServer(crearApp({ almacen }));
  await new Promise<void>((resolve) =>
    servidor.listen(0, "127.0.0.1", resolve),
  );
  const cerrar = async () => {
    servidor.closeAllConnections();
    if (!servidor.listening) return;
    await new Promise<void>((resolve, reject) =>
      servidor.close((error) => (error ? reject(error) : resolve())),
    );
  };
  t.after(cerrar);
  const direccion = servidor.address();
  assert.ok(direccion && typeof direccion !== "string");
  const base = `http://127.0.0.1:${direccion.port}/api`;
  return {
    base,
    cerrar,
    post: (cambios: Record<string, unknown> = {}) =>
      fetch(`${base}/inscripciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activityId: "safari",
          fecha: "2026-10-20",
          horario: "11:00",
          participantes: [{ nombre: "Visitante", dni: "40123456", edad: 25 }],
          aceptaTerminos: true,
          titularNombre: "Visitante",
          titularEmail: "visitante@example.com",
          ...cambios,
        }),
      }),
  };
}

it("SQLite: crea un archivo real y conserva la inscripción al cerrar y reabrir", (t) => {
  const { archivo, abrir, cerrar } = preparar(t);
  const primero = abrir();
  assert.equal(registrar(primero).exito, true);
  cerrar(primero);
  assert.equal(
    readFileSync(archivo).subarray(0, 16).toString(),
    "SQLite format 3\0",
  );
  const segundo = abrir();
  const guardadas = segundo.listar();
  assert.equal(guardadas.length, 1);
  assert.equal(guardadas[0].actividadId, "safari");
  assert.equal(guardadas[0].participantes[0].dni, "40123456");
});

it("SQLite: conserva participantes, orden, nombre omitido, talle y edad cero", (t) => {
  const { abrir } = preparar(t);
  const almacen = abrir();
  almacen.transaccion((inscripciones) => {
    inscripciones.push({
      id: 1,
      usuarioId: "visitante",
      actividadId: "safari",
      fechaHora: "2026-10-20T11:00:00-03:00",
      participantes: [
        { dni: "40123456", edad: 0 },
        { dni: "41234567", nombre: "Ana", edad: 30, talleVestimenta: "M" },
      ],
    });
  });
  const participantes = almacen.listar()[0].participantes;
  assert.equal(participantes[0].edad, 0);
  assert.equal(participantes[0].nombre, undefined);
  assert.equal(participantes[1].nombre, "Ana");
  assert.equal(participantes[1].talleVestimenta, "M");
});

it("SQLite: revierte una operación rechazada sin guardar cambios parciales", (t) => {
  const { abrir } = preparar(t);
  const almacen = abrir();
  registrar(almacen);
  assert.throws(
    () =>
      almacen.transaccion((inscripciones) => {
        inscripciones.push({ ...inscripciones[0], id: 2 });
        throw new Error("Operación rechazada");
      }),
    /Operación rechazada/,
  );
  assert.equal(almacen.listar().length, 1);
  assert.equal(registrar(almacen, [{ nombre: "Ana", dni: "41234567", edad: 30 }]).exito, true);
  assert.equal(almacen.listar()[1].id, 2);
});

it("SQLite: un fallo al guardar participantes revierte toda la inscripción", (t) => {
  const { abrir } = preparar(t);
  const almacen = abrir();
  assert.throws(
    () =>
      almacen.transaccion((inscripciones) => {
        inscripciones.push({
          id: 1,
          usuarioId: "visitante",
          actividadId: "safari",
          fechaHora: "2026-10-20T11:00:00-03:00",
          participantes: [
            { dni: "40123456", edad: 25 },
            { dni: "41234567", edad: -1 },
          ],
        });
      }),
    /CHECK constraint failed/,
  );
  assert.equal(almacen.listar().length, 0);
  assert.equal(registrar(almacen).exito, true);
  assert.equal(almacen.listar()[0].participantes.length, 1);
});

it("SQLite: dos conexiones consultan las mismas inscripciones", (t) => {
  const { abrir } = preparar(t);
  const primero = abrir();
  const segundo = abrir();
  registrar(primero);
  assert.equal(segundo.listar().length, 1);
  registrar(segundo, [{ nombre: "Ana", dni: "41234567", edad: 30 }]);
  assert.equal(primero.listar().length, 2);
});

it("SQLite + HTTP: cupos y solapamientos se conservan tras reiniciar la API", async (t) => {
  const { abrir, cerrar } = preparar(t);
  const primero = abrir();
  const api1 = await iniciarApi(t, primero);
  assert.equal((await api1.post()).status, 201);
  await api1.cerrar();
  cerrar(primero);
  const api2 = await iniciarApi(t, abrir());
  const turnos = await (
    await fetch(`${api2.base}/actividades/safari/turnos?fecha=2026-10-20`)
  ).json();
  assert.equal(
    turnos.find((turno: { horario: string }) => turno.horario === "11:00")
      .cuposDisponibles,
    7,
  );
  const repetida = await api2.post({ activityId: "jardineria" });
  assert.equal(repetida.status, 409);
  assert.equal((await repetida.json()).motivo, "INSCRIPCION_SUPERPUESTA");
  assert.equal((await api2.post({ horario: "12:00" })).status, 201);
});

it("SQLite + HTTP: no guarda inscripciones rechazadas ni descuenta cupos", async (t) => {
  const { abrir } = preparar(t);
  const almacen = abrir();
  const api = await iniciarApi(t, almacen);
  assert.equal((await api.post({ aceptaTerminos: false })).status, 400);
  assert.equal(almacen.listar().length, 0);
  assert.equal((await api.post()).status, 201);
  const grupo = Array.from({ length: 8 }, (_, i) => ({
    nombre: "Visitante de prueba",
    dni: String(50000000 + i),
    edad: 25,
  }));
  assert.equal((await api.post({ participantes: grupo })).status, 409);
  assert.equal(almacen.listar().length, 1);
});

it("SQLite + HTTP: dos instancias evitan vender el último cupo dos veces", async (t) => {
  const { abrir } = preparar(t);
  const primero = abrir();
  const api1 = await iniciarApi(t, primero);
  const api2 = await iniciarApi(t, abrir());
  const grupo = Array.from({ length: 7 }, (_, i) => ({
    nombre: "Visitante de prueba",
    dni: String(30000000 + i),
    edad: 25,
  }));
  assert.equal((await api1.post({ participantes: grupo })).status, 201);
  const respuestas = await Promise.all([
    api1.post({ participantes: [{ nombre: "Visitante uno", dni: "50123456", edad: 25 }] }),
    api2.post({ participantes: [{ nombre: "Visitante dos", dni: "60123456", edad: 25 }] }),
  ]);
  assert.deepEqual(respuestas.map((r) => r.status).sort(), [201, 409]);
  assert.equal(
    primero.listar().reduce((total, i) => total + i.participantes.length, 0),
    8,
  );
});
