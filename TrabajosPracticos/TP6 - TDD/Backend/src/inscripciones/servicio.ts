export function inscribirActividad(solicitud: any): any {
  if (!solicitud?.actividad) {
    throw new Error("Debe seleccionar una actividad");
  }

  // Generamos un código identificador/QR para la inscripción exitosa
  const codigoQR = `QR-${solicitud.actividad}-${Date.now()}`;

  return {
    exito: true,
    codigoQR,
  };
}