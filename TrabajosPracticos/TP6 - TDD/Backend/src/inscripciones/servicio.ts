import {
  InscripcionRechazadaError,
  type Participante,
} from "./modelos";

const ACTIVIDADES_CON_VESTIMENTA = ["Palestra", "Tirolesa"];
const TALLES_PERMITIDOS = ["XS", "S", "M", "L", "XL", "XXL"];
const EDAD_MINIMA_PALESTRA = 12;

export function inscribirActividad(solicitud: any): any {
  if (!solicitud?.actividad) {
    throw new Error("Debe seleccionar una actividad");
  }

  if (!solicitud.participantes || solicitud.participantes.length === 0) {
    throw new Error("Debe ingresar al menos un participante");
  }

  if (solicitud.aceptaTerminos !== true) {
    throw new InscripcionRechazadaError(
      "TERMINOS_NO_ACEPTADOS"
    );
  }

  // Validación de vestimenta si la actividad lo demanda
  if (ACTIVIDADES_CON_VESTIMENTA.includes(solicitud.actividad)) {
    for (const p of solicitud.participantes) {
      if (!p.talla) {
        throw new Error("Requiere talle de vestimenta");
      }
      if (!TALLES_PERMITIDOS.includes(p.talla)) {
        throw new Error("Talle no válido");
      }
    }
  }
    // Validación de edad mínima de Palestra.
  if (solicitud.actividad === "Palestra") {
    validarEdadMinima(
      solicitud.participantes,
      EDAD_MINIMA_PALESTRA
    );
  }

  const codigoQR = `QR-${solicitud.actividad}-${Date.now()}`;

  return {
    exito: true,
    codigoQR,
  };
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