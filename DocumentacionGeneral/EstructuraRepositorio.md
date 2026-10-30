# Estructura del Repositorio

El repositorio se organiza de forma jerárquica para facilitar la identificación, ubicación y mantenimiento de los distintos elementos utilizados durante el cursado de la materia Ingeniería de Software.

## Árbol de carpetas

```text
ISW4K3-Grupo10-2026/
├── DocumentacionGeneral/
├── ReglasDeJuego/
├── Resumenes/
│   └── <ApellidoNombre>/
├── TrabajosPracticos/
│   ├── TP<x> - <NombreTP>/
│   └── TIG<x>/
└── Teorico/
    ├── Bibliografia/
    │   └── <Tematica>/
    └── Presentaciones/
```

El árbol representa únicamente carpetas. Los archivos que se incorporen se identifican y ubican según las reglas definidas en [`PlanDeConfiguracion.md`](PlanDeConfiguracion.md).

## Descripción de las carpetas

| Carpeta | Contenido |
| ------- | --------- |
| `DocumentacionGeneral/` | Documentación que define cómo se organiza y administra el repositorio: estructura, glosario y plan de configuración. |
| `ReglasDeJuego/` | Material provisto por la cátedra que establece las pautas de cursado: programa, presentación de la materia y material de apoyo. |
| `Resumenes/` | Resúmenes elaborados individualmente para las distintas unidades o temas de la materia, organizados en una subcarpeta por alumno (`<ApellidoNombre>/`). |
| `TrabajosPracticos/` | Trabajos Prácticos (TP) y Trabajos de Investigación Grupal (TIG). Cada trabajo se almacena en una carpeta propia junto con su `README.md`, los enunciados disponibles, los entregables asociados y, cuando corresponda, un archivo `links.md`. |
| `Teorico/Bibliografia/` | Material bibliográfico clasificado por temática. |
| `Teorico/Presentaciones/` | Presentaciones utilizadas durante las clases teóricas. |

## Convención de carpetas de Trabajos Prácticos

Cada Trabajo Práctico se almacena en una carpeta con el formato:

```
TP<x> - <NombreTP>/
```

Ejemplo: `TP4 - SCM - Herramientas de SCM/`

La forma genérica permite incorporar cualquier cantidad de Trabajos Prácticos sin modificar la estructura definida.

## Convención de carpetas de Trabajos de Investigación Grupal

Cada Trabajo de Investigación Grupal se almacena en una carpeta con el formato:

```
TIG<x>/
```

Ejemplo: `TIG1/`.

Cada carpeta contiene un `README.md` que describe el tema, identifica los archivos incorporados e indica su estado. Los enunciados y los entregables se identifican según la convención TIG del Plan de Configuración. `links.md` se incorpora cuando hay referencias que registrar.

## Organización interna de trabajos con código

Los trabajos con código pueden incluir subcarpetas para sus componentes y conservar la organización propia de las herramientas utilizadas. En el TP6 se utilizan `Backend/` y `frontend/`. Los archivos fuente, pruebas, recursos y configuraciones mantienen los nombres requeridos por cada proyecto.

La documentación auxiliar, como `INTEGRACION.md`, se ubica en la carpeta del trabajo o del componente correspondiente y se referencia desde el `README.md` del trabajo. Los árboles y las referencias deben respetar las mayúsculas y minúsculas de las rutas versionadas.

## Convención de carpetas temáticas

El material bibliográfico se clasifica en subcarpetas temáticas con el formato:

```
<Tematica>/
```

Las nuevas temáticas se agregan con la misma regla. Las presentaciones se incorporan en su carpeta correspondiente y cada resumen se almacena en `/Resumenes/<ApellidoNombre>`, según las reglas de nombrado del Plan de Configuración.

## Criterio de ubicación

Cada archivo debe almacenarse en la carpeta que corresponda según su tipo y finalidad. **La ubicación forma parte de la identificación del Ítem de Configuración** y debe mantenerse consistente durante todo el cursado.

Las carpetas que aún no contienen archivos mantienen un `.gitkeep` para preservar la estructura, dado que Git no versiona carpetas vacías. Ese marcador se elimina cuando la carpeta recibe su primer archivo real.
