export function inscribirActividad(solicitud: any): any {
  if (!solicitud?.actividad) {
    throw new Error("Debe seleccionar una actividad");
  }

  return { exito: true };
}