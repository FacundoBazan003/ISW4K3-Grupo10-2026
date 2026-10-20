import assert from "node:assert/strict";
import { it } from "node:test";
import {
    activityService,
    ApiError,
    isParkOpenOnDate,
    type CreateReservationInput,
} from "../src/services/activityService";
import { inscriptionSchema } from "../src/schemas/inscriptionSchema";

const input: CreateReservationInput = {
    activityId: "safari",
    fecha: "2026-10-20",
    horario: "11:00",
    participantes: [{ nombre: "Visitante", dni: "40123456", edad: 25 }],
    aceptaTerminos: true,
    titularNombre: "Visitante",
    titularEmail: "visitante@example.com",
};

it("frontend: toma cupos y edades de la API y conserva los textos de presentación", async (t) => {
    t.mock.method(globalThis, "fetch", async (url: string) => {
        assert.equal(url, "/api/actividades");
        return Response.json([
            {
                id: "safari",
                name: "Safari",
                disponible: true,
                cuposPorTurno: 3,
                edadMinima: null,
                requiereTalle: false,
                turnos: ["11:00"],
            },
            {
                id: "palestra",
                name: "Palestra",
                disponible: false,
                cuposPorTurno: 12,
                edadMinima: 12,
                requiereTalle: true,
                turnos: [],
            },
        ]);
    });
    const actividades = await activityService.getActivities();
    assert.equal(actividades.length, 1);
    assert.equal(actividades[0].cuposPorTurno, 3);
    assert.ok(actividades[0].description);
    assert.ok(actividades[0].terminosYCondiciones);
});

it("frontend: envía los términos y los participantes a la API y usa su confirmación", async (t) => {
    const reserva = { ...input, id: "1", orderNumber: "ECO-00001", codigoQR: "QR-DEL-BACKEND" };
    t.mock.method(globalThis, "fetch", async (url: string, options: RequestInit) => {
        assert.equal(url, "/api/inscripciones");
        assert.equal(options.method, "POST");
        assert.deepEqual(JSON.parse(String(options.body)), input);
        return Response.json(reserva, { status: 201 });
    });
    assert.equal((await activityService.createReservation(input)).codigoQR, "QR-DEL-BACKEND");
});

it("frontend: muestra la disponibilidad enviada por el servidor", async (t) => {
    const turnos = [{ horario: "11:00", cuposDisponibles: 0, disponible: false }];
    t.mock.method(globalThis, "fetch", async (url: string) => {
        assert.equal(url, "/api/actividades/safari/turnos?fecha=2026-10-20");
        return Response.json(turnos);
    });
    assert.deepEqual(await activityService.getSlotsAvailability("safari", "2026-10-20"), turnos);
});

it("frontend: propaga el motivo de rechazo y no inventa una reserva exitosa", async (t) => {
    t.mock.method(globalThis, "fetch", async () =>
        Response.json(
            {
                exito: false,
                motivo: "SIN_CUPOS",
                mensaje: "No quedan lugares para el grupo.",
            },
            { status: 409 },
        ),
    );
    await assert.rejects(
        activityService.createReservation(input),
        (error: unknown) =>
            error instanceof ApiError &&
            error.status === 409 &&
            error.motivo === "SIN_CUPOS" &&
            error.message.includes("grupo"),
    );
});

it("frontend: informa desconexión y respuestas inválidas sin recurrir a los mocks", async (t) => {
    t.mock.method(globalThis, "fetch", async () => {
        throw new TypeError("offline");
    });
    await assert.rejects(
        activityService.getActivities(),
        /servicio de reservas no está disponible/,
    );
    t.mock.method(
        globalThis,
        "fetch",
        async () => new Response("<html>error</html>", { status: 200 }),
    );
    await assert.rejects(
        activityService.getActivities(),
        /respuesta del servicio de reservas no es válida/,
    );
});

it("frontend: conserva nombre obligatorio de 2 a 50 caracteres", () => {
    assert.equal(inscriptionSchema.safeParse(input).success, true);
    for (const nombre of [undefined, "", "A", "A".repeat(51)]) {
        assert.equal(inscriptionSchema.safeParse({
            ...input,
            participantes: [{ ...input.participantes[0], nombre }],
        }).success, false);
    }
    for (const nombre of ["Ana", "AB", "A".repeat(50)]) {
        assert.equal(inscriptionSchema.safeParse({
            ...input,
            participantes: [{ ...input.participantes[0], nombre }],
        }).success, true);
    }
});

it("frontend: conserva datos obligatorios, DNI, edades, talles y términos del original", () => {
    assert.equal(inscriptionSchema.safeParse({ ...input, aceptaTerminos: false }).success, false);
    assert.equal(inscriptionSchema.safeParse({ ...input, participantes: [] }).success, false);
    for (const cambios of [
        { dni: undefined }, { dni: "123456" }, { dni: "123456789" }, { dni: "abcdefg" },
        { edad: undefined }, { edad: null }, { edad: -1 }, { edad: 1.5 }, { edad: 121 },
        { talle: "XXXL" },
    ]) {
        assert.equal(inscriptionSchema.safeParse({
            ...input,
            participantes: [{ ...input.participantes[0], ...cambios }],
        }).success, false, JSON.stringify(cambios));
    }
    assert.equal(inscriptionSchema.safeParse({
        ...input, participantes: [input.participantes[0], input.participantes[0]],
    }).success, false);
    for (const [activityId, minimo] of [["tirolesa", 8], ["palestra", 12]] as const) {
        for (const [edad, esperado] of [[minimo - 1, false], [minimo, true]] as const) {
            assert.equal(inscriptionSchema.safeParse({
                ...input, activityId,
                participantes: [{ ...input.participantes[0], edad, talle: "M" }],
            }).success, esperado);
        }
        assert.equal(inscriptionSchema.safeParse({ ...input, activityId }).success, false);
        for (const talle of ["XS", "S", "M", "L", "XL", "XXL"]) {
            assert.equal(inscriptionSchema.safeParse({
                ...input, activityId,
                participantes: [{ ...input.participantes[0], talle }],
            }).success, true);
        }
    }
    for (const activityId of ["safari", "jardineria"]) {
        assert.equal(inscriptionSchema.safeParse({
            ...input,
            activityId, participantes: [{ ...input.participantes[0], edad: 0 }],
        }).success, true);
    }
    for (const cambios of [{ activityId: "otra" }, { fecha: "" }, { horario: "" }]) {
        assert.equal(inscriptionSchema.safeParse({ ...input, ...cambios }).success, false);
    }
});

it("frontend: el calendario utiliza las reglas recibidas de la API", () => {
    const reglas = {
        diasCerrados: ["MARTES"],
        fechasCerradas: [],
        diasMesCerrados: [{ dia: 25, mes: 12 }],
    };
    assert.equal(isParkOpenOnDate(new Date("2026-10-20T00:00:00Z"), reglas).isOpen, false);
    assert.equal(isParkOpenOnDate(new Date("2026-10-19T00:00:00Z"), reglas).isOpen, true);
    assert.equal(isParkOpenOnDate(new Date("2026-12-25T00:00:00Z"), reglas).isOpen, false);
});
