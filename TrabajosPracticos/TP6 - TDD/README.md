# EcoHarmony Park - Sistema de Inscripción de Actividad

Sistema web para la inscripción de actividades en el parque EcoHarmony, desarrollado con TDD (Test-Driven Development).

## 📑 Índice

- [Descripción](#-descripción)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Reglas de Negocio](#-reglas-de-negocio)
  - [Horarios y Operación General](#-1-horarios-y-operación-general)
  - [Inscripción y Gestión de Actividades](#-2-inscripción-y-gestión-de-actividades)
    - [Catálogo, Cupos y Restricciones de Edad](#catálogo-cupos-y-restricciones-de-edad)
  - [Notificaciones y Confirmaciones](#-3-notificaciones-y-confirmaciones)
  - [Lineamientos Técnicos y de Diseño](#-4-lineamientos-técnicos-y-de-diseño)
- [Tests del backend del TP6](#-tests-del-backend-del-tp6)
  - [Tests de Inscripción](#tests-de-inscripción)
  - [Tests de Entrada y Participantes](#tests-de-entrada-y-participantes)
  - [Tests de Cupos, Vestimenta y Edad](#tests-de-cupos-vestimenta-y-edad)
  - [Tests de Fechas y Horarios](#tests-de-fechas-y-horarios)
  - [Tests de Conflictos de Reserva](#tests-de-conflictos-de-reserva)
- [Tecnologías](#️-tecnologías)

---

## 🌳 Descripción

EcoHarmony Park es un sistema que permite a los usuarios:

- Elegir una actividad del parque: Tirolesa, Safari, Palestra o Jardinería.
- Indicar el día y horario del turno.
- Cargar los datos de uno o varios participantes.
- Informar el talle de vestimenta si la actividad lo requiere.
- Aceptar los términos y condiciones.
- Enviar la solicitud de inscripción.
- Recibir una confirmación con un código QR si cumple las condiciones.

---

## 📂 Estructura del Proyecto

```text
TP6 - TDD/
├── Backend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── app.ts
│   │   │   └── reglas.ts
│   │   ├── inscripciones/
│   │   │   ├── datos-mocks.ts
│   │   │   ├── modelos.ts
│   │   │   └── servicio.ts
│   │   ├── persistencia/
│   │   │   ├── almacen.ts
│   │   │   └── sqlite.ts
│   │   ├── index.ts
│   │   └── ver-bd.ts
│   ├── test/
│   │   └── inscripciones.test.ts
│   ├── package.json
│   ├── package-lock.json
│   └── tsconfig.json
├── Frontend/
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   ├── assets/img/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   └── inscription/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── mocks/
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   └── inscription/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── store/
│   │   ├── types/
│   │   ├── index.css
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── pnpm-workspace.yaml
│   ├── tsconfig*.json
│   └── vite.config.ts
└── .gitignore
```

---

## 🎫 Reglas de Negocio

### 🕒 1. Horarios y Operación General

- **Días de apertura:** el parque abre todos los días, con excepción de:
  - ❌ Lunes (cerrado).
  - ❌ Feriados / festivos: 25 de diciembre y 1 de enero.
- **Comportamiento en UI (calendario):** si la fecha seleccionada corresponde a un día cerrado, el componente debe mostrar el día deshabilitado o bloquear la selección.
- **Horario general del parque:** 08:30 a 19:00 hs.
- **Capacidad diaria:** no existe un cupo máximo total de visitantes por día para el ingreso general al parque.

### 🧗 2. Inscripción y Gestión de Actividades

#### Catálogo, Cupos y Restricciones de Edad

| Actividad | Cupo Máximo | Edad Mínima | Requiere Talle |
| :--- | :---: | :---: | :---: |
| 🚙 **Safari** | 8 personas | Todas las edades | No |
| 🧗 **Palestra** | 12 personas | 12 años | Sí |
| 🌱 **Jardinería** | 12 personas | Todas las edades | No |
| 🪂 **Tirolesa** | 10 personas | 8 años | Sí |

- **Visibilidad de cupos:** la interfaz debe mostrar en todo momento la cantidad de cupos disponibles por turno.
- **Talles disponibles (indumentaria):** `XS`, `S`, `M`, `L`, `XL`, `XXL`. Obligatorio para Tirolesa y Palestra.
- **Horarios de los turnos:**
  - De 09:00 a 18:00 hs.
  - Frecuencia: 1 turno por hora (el turno de las 18:00 hs marca la cota superior, no hay turno que inicie a esa hora).
- **Ventanas temporales de reserva:**
  - **Anticipación máxima:** solo dentro de las 24 hs previas al inicio del turno (no permite reservar días previos).
  - **Cierre de inscripción:** hasta 15 minutos antes del inicio del turno.
- **Reglas de concurrencia y validación:**
  - 🚫 **Solapamiento:** un visitante no puede estar registrado en dos actividades simultáneas en el mismo bloque horario.
  - 👥 **Límite por titular:** no existe límite máximo de participantes por transacción, siempre que la capacidad del turno lo permita.
  - 🆔 **Identificación:** se requiere Nombre, Edad, Talle (si aplica) y exclusivamente DNI (sin pasaportes ni formatos alfanuméricos).
- **Términos y condiciones:** cada actividad debe contar con sus propios términos y condiciones obligatorios de aceptar.

### ✉️ 3. Notificaciones y Confirmaciones

- **Detalle de actividad (inscripción):**
  - Correo electrónico que incluye: número de orden, detalle de participantes, subtotales, total general y códigos QR de acceso.
- **Simulaciones requeridas:**
  - **Servicio de correo:** modal o vista mockeada que simule la bandeja de entrada del correo con datos transaccionales y archivo adjunto.

### 🎨 4. Lineamientos Técnicos y de Diseño

- **Plataforma objetivo:** Mobile App o Web Responsive adaptada a mobile.
- **Tipografía:** [Lato](https://fonts.google.com/specimen/Lato)
- **Paleta de colores:**
  - Forest Green: `#386641`
  - May Green: `#6A994E`
  - Yellow Green: `#A7C957`
  - Parchment: `#F2E8CF`
  - Bittersweet Shimmer: `#BC4749`
- **Mocks de sesión:** se permite iniciar la aplicación con datos de usuario y sesión precargados (mockeados).

---

## 🧪 Tests del backend del TP6

### Casos testeados

#### Tests de Inscripción

- ✅ Permitir inscripciones a actividades que no requieren vestimenta.
- ✅ Permitir inscripciones con un talle de vestimenta permitido.
- ✅ Permitir reservar exactamente 24 horas antes del turno.
- ✅ Permitir que una persona se inscriba en distintos turnos.
- ✅ Descontar los cupos disponibles después de una inscripción exitosa.
- ✅ Retornar un código QR no vacío al completar la inscripción.

#### Tests de Entrada y Participantes

- ✅ Rechazar solicitudes sin una actividad seleccionada.
- ✅ Rechazar inscripciones sin participantes.
- ✅ Rechazar participantes sin DNI.
- ✅ Rechazar participantes sin edad.
- ✅ Rechazar participantes sin nombre.
- ✅ Rechazar inscripciones a actividades no disponibles.
- ✅ Rechazar inscripciones si no se aceptan los términos y condiciones.

#### Tests de Cupos, Vestimenta y Edad

- ✅ Rechazar inscripciones cuando no hay cupos suficientes para todo el grupo.
- ✅ Rechazar inscripciones si falta el talle requerido.
- ✅ Rechazar talles de vestimenta no válidos.
- ✅ Rechazar participantes menores a la edad mínima de Palestra.
- ✅ Rechazar participantes menores a la edad mínima de Tirolesa.
- ✅ Aceptar participantes que cumplen la edad mínima de Tirolesa.

#### Tests de Fechas y Horarios

- ✅ Rechazar inscripciones en días semanales de cierre del parque.
- ✅ Rechazar inscripciones en feriados.
- ✅ Rechazar reservas realizadas con más de 24 horas de anticipación.
- ✅ Rechazar inscripciones realizadas a 15 minutos o menos del inicio.
- ✅ Rechazar turnos fuera del horario de actividades.
- ✅ Aceptar turnos en los límites del horario de actividades.
- ✅ Rechazar turnos que no comienzan en punto.
- ✅ Rechazar inscripciones durante los horarios de cierre del parque.

#### Tests de Conflictos de Reserva

- ✅ Rechazar reservas de actividades simultáneas.

---

## 🛠️ Tecnologías

- **Backend:** Node.js, TypeScript, Express 5 y SQLite (`node:sqlite`).
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS 4 y daisyUI.
- **Enrutamiento y estado:** React Router, Zustand y TanStack Query.
- **Formularios y validación:** React Hook Form y Zod.
- **Fechas e iconografía:** date-fns, React Day Picker, Cally y Phosphor Icons.
- **Pruebas y calidad:** Node.js Test Runner, tsx, ESLint y Prettier.
- **Gestión de paquetes:** npm para el backend y pnpm para el frontend.
