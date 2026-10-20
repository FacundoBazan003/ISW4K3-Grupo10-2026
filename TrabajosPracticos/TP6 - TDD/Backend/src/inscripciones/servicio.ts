const ACTIVIDADES_CON_VESTIMENTA = ["Palestra", "Tirolesa"];
const TALLES_PERMITIDOS = ["XS", "S", "M", "L", "XL", "XXL"];

export function inscribirActividad(solicitud: any): any {
  if (!solicitud?.actividad) {
    throw new Error("Debe seleccionar una actividad");
  }

  if (!solicitud.participantes || solicitud.participantes.length === 0) {
    throw new Error("Debe ingresar al menos un participante");
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

  const codigoQR = `QR-${solicitud.actividad}-${Date.now()}`;

  return {
    exito: true,
    codigoQR,
  };
}