# Tests del backend — EcoHarmony Park

Estado revisado al 20 de octubre de 2026 en la rama `codex/tp6-integracion-front-back`.

Este inventario reúne los casos del equipo presentes en `Backend/test/inscripciones.test.ts`, que prueban la función `inscribirActividad` de `Backend/src/inscripciones/servicio.ts`.

## Estado general

- **28 tests declarados.**
- **26 tests implementados con comprobaciones.**
- **2 tests pendientes:** reserva exactamente 24 horas antes del turno y retorno del código QR.

Los dos pendientes tienen el cuerpo vacío, salvo un comentario. El ejecutor los muestra como aprobados, pero todavía no comprueban ningún comportamiento. La funcionalidad que permitiría aprobar ambos ya existe en el servicio.

## Casos de éxito y cupos

| Estado | Test | Qué comprueba actualmente |
| --- | --- | --- |
| Hecho | Permite inscripciones a actividades que no requieren vestimenta | Jardinería sin talle, con participante informado y términos aceptados. Comprueba éxito y existencia de un QR. |
| Hecho | Permite inscripciones con vestimenta usando un talle permitido | Palestra, participante de 16 años y `talla: "M"`. Comprueba éxito y existencia de un QR. |
| Pendiente | Permite reservar exactamente 24 horas antes del turno | El test está vacío. Falta fijar el reloj y comprobar que una reserva con exactamente 24 horas de anticipación sea aceptada. |
| Hecho | Permite reservar actividades en distintos turnos | Un participante ya inscripto en Safari a las 10:00 puede inscribirse en Jardinería a las 14:00. Comprueba éxito y que se registre una segunda inscripción. |
| Hecho | Descuenta los cupos disponibles tras una inscripción exitosa | Inscribe dos participantes en Safari, inicialmente sin reservas. Calcula los lugares ocupados y comprueba que quedan 6 de los 8 cupos. |
| Pendiente | Retorna el código QR correspondiente al completar la inscripción | El test específico está vacío. Los primeros dos tests ya comprueban que exista un QR. El ejemplo propuesto en la conversación todavía no está incorporado al archivo. |
| Hecho | Rechaza inscripciones cuando no hay cupos suficientes para todo el grupo | Safari tiene 7 de sus 8 lugares ocupados y se intenta inscribir a dos personas. Exige el motivo `SIN_CUPOS`. |

## Datos de entrada y disponibilidad

| Estado | Test | Qué comprueba actualmente |
| --- | --- | --- |
| Hecho | Rechaza la inscripción si no se selecciona ninguna actividad | Envía `actividad: null` y exige el mensaje de error `Debe seleccionar una actividad`. |
| Hecho | Rechaza inscripciones sin participantes | Envía un arreglo vacío y exige el motivo `SIN_PARTICIPANTES`. |
| Hecho | Rechaza participantes incompletos | Omite el DNI de un participante con nombre y edad. Exige `PARTICIPANTE_INCOMPLETO`. |
| Hecho | Rechaza participantes incompletos sin edad | Omite la edad de un participante con nombre y DNI. Exige `PARTICIPANTE_INCOMPLETO`. |
| Hecho | Rechaza participantes sin nombre | Omite el nombre de un participante con DNI y edad. Exige `PARTICIPANTE_INCOMPLETO`. El caso anterior que permitía omitir el nombre fue reemplazado por este comportamiento. |
| Hecho | Rechaza inscripciones a actividades no disponibles | Marca Safari como no disponible en el contexto de la prueba. Exige `ACTIVIDAD_NO_DISPONIBLE`. |

## Vestimenta y edad

| Estado | Test | Qué comprueba actualmente |
| --- | --- | --- |
| Hecho | Rechaza inscripciones si falta el talle requerido | Solicita Palestra sin talle y exige `VESTIMENTA_REQUERIDA`. |
| Hecho | Rechaza inscripciones si el talle de vestimenta no es válido | Solicita Palestra con `talla: "XXXL"` y exige `TALLE_INVALIDO`. |
| Hecho | Rechaza participantes menores a la edad mínima de Palestra | Intenta inscribir a una persona de 11 años con talle válido. Exige `EDAD_MINIMA_NO_CUMPLIDA`; el mínimo de Palestra es 12 años. |
| Hecho | Rechaza participantes menores a la edad mínima de Tirolesa | Intenta inscribir a una persona de 7 años con talle válido. Exige `EDAD_MINIMA_NO_CUMPLIDA`. |
| Hecho | Acepta participantes que cumplen la edad mínima de Tirolesa | Inscribe a una persona con exactamente 8 años y talle válido. Comprueba éxito. |

## Calendario y horarios

| Estado | Test | Qué comprueba actualmente |
| --- | --- | --- |
| Hecho | Rechaza inscripciones en días semanales de cierre del parque | Reserva el domingo para un turno del lunes, dentro de las 24 horas. Exige `PARQUE_CERRADO`. |
| Hecho | Rechaza inscripciones en feriados | Comprueba el 25 de diciembre de 2026 y el 1 de enero de 2027, reservando 23 horas antes. Exige `PARQUE_CERRADO` en ambos casos. |
| Hecho | Rechaza reservas con más de 24 horas de anticipación | Solicita un turno 25 horas después del momento de la reserva. Exige `FUERA_DE_ANTICIPACION`. |
| Hecho | Rechaza inscripciones a 15 minutos o menos del inicio | El caso escrito usa exactamente 15 minutos: reserva a las 10:45 para las 11:00. Exige `CIERRE_DE_INSCRIPCION`. No incluye otro ejemplo con menos de 15 minutos. |
| Hecho | Rechaza turnos fuera del horario de actividades | Solicita las 18:00, fuera de la franja de actividades de 09:00 a 17:00. Exige `HORARIO_NO_DISPONIBLE`. |
| Hecho | Acepta turnos en los límites del horario de actividades | Comprueba que las 09:00 y las 17:00 se acepten con suficiente anticipación. |
| Hecho | Rechaza turnos que no comienzan en punto | Solicita las 10:15 y las 14:30. Exige `HORARIO_NO_DISPONIBLE` en ambos casos. |
| Hecho | Rechaza inscripciones durante horarios de cierre del parque | Configura el cierre del parque a las 16:30 y solicita las 17:00. Exige `PARQUE_CERRADO`. |

## Reservas simultáneas y términos

| Estado | Test | Qué comprueba actualmente |
| --- | --- | --- |
| Hecho | Rechaza reservas de actividades simultáneas | Un participante ya inscripto en Safari a las 11:00 intenta inscribirse en Jardinería en ese mismo turno. Exige `INSCRIPCION_SUPERPUESTA`. |
| Hecho | Rechaza inscripciones si no se aceptan los términos y condiciones | Envía una solicitud válida con `aceptaTerminos: false`. Exige `TERMINOS_NO_ACEPTADOS`. |

## Pendientes y TDD

- [ ] Completar el test de aceptación a exactamente 24 horas.
- [ ] Completar el test específico de retorno del QR simulado.

Ambos casos deberían pasar con la implementación actual. Al completarlos se agrega cobertura; no corresponde llamarlos RED si no fallan. No es necesario quitar funcionalidad existente para forzar un fallo.

El ciclo RED → GREEN → REFACTOR se aplica cuando un nuevo comportamiento todavía no está implementado: primero se observa un fallo por el motivo esperado, luego se agrega la solución mínima y finalmente se mejora la estructura si hace falta, manteniendo las pruebas en verde. Este inventario no atribuye un ciclo completo a cada caso solamente porque su test pase.

## Cómo ejecutar

Desde la carpeta `TrabajosPracticos/TP6 - TDD/Backend`:

```powershell
npm test
npx tsc --noEmit
```

El primer comando ejecuta las pruebas; el segundo verifica los tipos de TypeScript.

## Alcance del inventario

Estos tests ejercitan el dominio con datos en memoria. No prueban por sí solos las rutas HTTP, la escritura en SQLite ni la interfaz del frontend. Las comprobaciones puntuales de integración realizadas durante el desarrollo no se agregaron como archivos de tests, de acuerdo con lo acordado.

El QR se considera simulado dentro del alcance del TP. Estos casos no verifican una imagen QR escaneable, envío real de correo ni generación real de PDF.
