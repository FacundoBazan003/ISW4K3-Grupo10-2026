import { describe, it } from "node:test";
import assert from "node:assert";
import { inscribirActividad } from "../src/inscripciones/servicio";

describe("US: Inscribirme a actividad", () => {
  it("rechaza la inscripcion si no se selecciona ninguna actividad", () => {
    const solicitudInvalida = {
      actividad: null,
      horario: "2026-10-20T10:00:00-03:00",
      participantes: [{ dni: "12345678", edad: 20 }],
      aceptaTerminos: true
    };

    assert.throws(
      () => inscribirActividad(solicitudInvalida as any),
      /Debe seleccionar una actividad/
    );
  });
});