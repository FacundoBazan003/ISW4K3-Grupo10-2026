# Prueba de integración de frontend y backend

La integración conecta el formulario de `frontend` con la lógica de inscripción de `Backend` mediante una API Express y guarda las inscripciones en SQLite. Se conservan los avances del dominio y su regla de rechazar reservas a 15 minutos o menos del inicio; la disponibilidad que muestra el frontend utiliza el mismo criterio.

## Ejecutar

Se necesita Node.js 22.13 o superior y pnpm para el frontend. Se verificó con Node 22.20.0, cuyo módulo `node:sqlite` funciona y muestra una advertencia de experimental. Abrir dos terminales desde la carpeta de este TP.

**Terminal 1, backend:**

```powershell
cd Backend
npm ci
npm run build
npm start
```

La API escucha en `http://127.0.0.1:3000`. `GET /api/health` permite comprobarla. También se puede usar `npm run dev` en lugar de compilar e iniciar.

**Terminal 2, frontend:**

```powershell
cd frontend
pnpm install --frozen-lockfile
pnpm dev --port 5180 --strictPort
```

Abrir `http://127.0.0.1:5180`. Vite redirige `/api` al puerto 3000. El puerto 5180 evita interferir con una demo previa que ya esté ejecutándose en 5173.

Para revisar el frontend compilado se puede usar `pnpm build` y luego `pnpm preview --port 4180 --strictPort`; el preview tiene el mismo proxy a la API.

## Contrato HTTP

| Método y ruta | Función |
| --- | --- |
| `GET /api/health` | Estado del servidor. |
| `GET /api/actividades` | Catálogo con capacidades, edades, vestimenta y turnos del backend. |
| `GET /api/parque/reglas` | Calendario de cierre que utiliza la interfaz. |
| `GET /api/actividades/:id/turnos?fecha=AAAA-MM-DD` | Disponibilidad real del turno según las inscripciones guardadas en SQLite. |
| `POST /api/inscripciones` | Validación y registro de la inscripción. |

El POST recibe `activityId`, `fecha`, `horario`, `participantes`, `aceptaTerminos`, `titularNombre` y `titularEmail`. El dominio actualizado requiere nombre, DNI y edad; el formulario conserva su regla original de nombre obligatorio de 2 a 50 caracteres. Su talle se llama `talle` en el contrato. La API adapta estos datos a `actividad`, `horario` ISO y `talla`, utilizados actualmente por `inscribirActividad`.

La fecha y la hora del turno corresponden a Argentina (UTC-3). Una respuesta exitosa usa estado 201 e incluye el identificador, número de orden, resumen y `codigoQR` devuelto por el backend. Los rechazos se devuelven como JSON con `exito: false`, `motivo` y `mensaje`; cupos y solapamientos usan estado 409 y las demás validaciones, 400.

## Qué se conserva

- El dominio conserva las reglas de `main` incorporadas en `c5dc482`, incluido el test que rechaza a 15 minutos o menos, y el refactor horario de `c87d534`. La suite contiene 31 casos con comprobaciones, incluidos el de confirmación a exactamente 24 horas, los tres de validación de edad utilizada por la API y el que verifica que una inscripción exitosa retorna un código QR de tipo texto y no vacío.
- El frontend incorpora los cambios de su rama remota hasta `5298100`: calendario, iconos, rutas con sesión simulada, carga de horarios de dos segundos y agregado de visitantes condicionado a un turno disponible. Se mantienen las adaptaciones a la API para catálogo, calendario, disponibilidad y confirmación. La ampliación de términos no agrega validaciones automáticas de peso, salud u otras condiciones mencionadas en ellos.
- La sesión continúa simulada. Se conservan el diseño, los textos y la simulación de correo/comprobante del frontend.
- En ejecución normal las reservas se guardan en `Backend/data/ecoharmony.db`, con las tablas `inscripciones` y `participantes`. Se conservan al reiniciar el backend. El archivo es local y está excluido de Git.
- Los tests originales conservan la lista en memoria. La capa de persistencia carga las inscripciones para ejecutar la misma función del dominio y guarda las nuevas dentro de una transacción SQLite. La lectura de cupos, la validación y la escritura se realizan bajo el mismo bloqueo para evitar sobreventa.
- Ya no se leen ni escriben reservas mediante el store de `localStorage`; ese archivo queda como referencia del frontend original. Las reservas de la demo anterior que estaba ejecutándose en memoria no se importan automáticamente a SQLite.
- El QR sigue siendo el identificador simulado existente: el dibujo no es un QR escaneable, el modal no envía correo real y el botón de descarga del comprobante sigue siendo una simulación.

## Reglas adicionales de la integración

El frontend original ya impedía feriados, turnos fuera de horario, reservas tardías y DNI simultáneos. La API conserva las restricciones que aún no desarrolla el dominio. Las reservas simultáneas existentes ahora se validan en `inscribirActividad`, utilizando los registros cargados de SQLite; la API solo mantiene el control adicional de DNI repetidos dentro del mismo grupo. El esquema del formulario coincide con la rama remota del frontend; se conservan la fecha inicial y el comportamiento de los términos al cambiar de actividad.

**Límite de 15 minutos resuelto por decisión del usuario:** exactamente 15 minutos antes se rechaza, igual que con menos de 15 minutos; para reservar deben faltar más de 15 minutos. La consulta de disponibilidad y el registro del dominio comparten ese comportamiento.

Cuando se incorporen nuevas reglas al dominio, se deberá revisar esta capa para evitar duplicar validaciones.

## Verificación automatizada

Desde `Backend`:

```powershell
npm test
npm run build
```

`npm test` ejecuta los 31 casos de `test/inscripciones.test.ts`, incluidos los tres de la función de validación de edad de la API. El caso específico del QR comprueba que la inscripción sea exitosa y que `codigoQR` sea un texto no vacío; no comprueba que el código pueda escanearse. No se incluyen suites adicionales de pruebas de API, SQLite ni frontend. La integración HTTP y la persistencia se pueden comprobar siguiendo los pasos manuales y usando `npm run db:ver`.

## Consultar la base de datos

Desde `Backend`, ejecutar:

```powershell
npm run db:ver
```

El comando consulta SQLite en modo de solo lectura y muestra en tablas las últimas 100 inscripciones y los últimos 100 participantes. Ejecutarlo antes y después de una inscripción permite comprobar el impacto real. También se puede abrir `Backend/data/ecoharmony.db` con un visor de SQLite.

La ubicación puede cambiarse mediante `SQLITE_PATH`; usar la misma variable al iniciar el backend y al ejecutar `db:ver`. El esquema se crea si todavía no existe. No hay una pantalla administrativa nueva en el frontend.

Si hay una demo anterior ejecutándose en los puertos 3000/5180, se puede probar SQLite sin detenerla:

```powershell
# Terminal Backend
$env:PORT = "3100"
npm start

# Terminal frontend
$env:API_TARGET = "http://127.0.0.1:3100"
pnpm dev --port 5181 --strictPort
```

En ese caso, abrir `http://127.0.0.1:5181`. Para volver a los puertos predeterminados, eliminar esas variables de las terminales o abrir terminales nuevas.

Desde `frontend`:

```powershell
pnpm build
pnpm lint
```

Lint conserva una advertencia previa de React Hook Form por `watch()`; no impide la compilación.

## Prueba manual repetible

1. Levantar ambos servidores, iniciar sesión con un usuario de prueba y elegir Safari, un día abierto y un turno habilitado (más de 15 minutos y hasta 24 horas de anticipación). La consulta de horarios conserva una espera simulada de dos segundos.
2. Ingresar nombre de al menos 2 caracteres, DNI de prueba de 8 dígitos y edad válida. Sin aceptar términos, confirmar: se debe mostrar el error y no generar la reserva.
3. Aceptar los términos y confirmar: debe aparecer el número de orden y el código devuelto por el backend; debe disminuir el cupo disponible en uno.
4. Abrir otra pestaña para el mismo turno: debe mostrar el cupo ya reducido aunque esa pestaña no haya creado la reserva.
5. Intentar reservar el mismo DNI, día y horario en Jardinería: debe aparecer el rechazo por reserva simultánea.
6. Cambiar a otro turno habilitado y confirmar: debe permitirse la reserva.
7. Comprobar que los lunes aparecen deshabilitados y que los turnos fuera de la ventana no se pueden elegir.

Para comprobar la persistencia, ejecutar `npm run db:ver` antes y después de una inscripción y consultar nuevamente tras reiniciar el backend.
