# Estructura del Repositorio

El repositorio se organiza de forma jerárquica para facilitar la identificación, ubicación y mantenimiento de los distintos elementos utilizados durante el cursado de la materia Ingeniería de Software.

## Árbol de carpetas

```text
ISW4K3-Grupo10-2026/
├── README.md
│
├── DocumentacionGeneral/
│   ├── EstructuraRepositorio.md      # Este archivo
│   ├── Glosario.md                   # Siglas y términos utilizados
│   └── PlanDeConfiguracion.md        # ICs, reglas de nombrado y líneas base
│
├── ReglasDeJuego/
│   ├── RDJ_Programa.pdf
│   ├── RDJ_PresentacionDeLaMateria.pdf
│   └── RDJ_MaterialDeApoyo.pdf
│
├── Resumenes/
│   └── README.md                     # Índice de resúmenes
│
├── TrabajosPracticos/
│   ├── TP1 - <NombreTP>/
│   │   ├── README.md
│   │   ├── links.md
│   │   └── TP1_<NombreTP>_<Tipo>.<ext>
│   ├── TP2 - <NombreTP>/
│   ├── TP3 - <NombreTP>/
│   └── TP4 - SCM - Herramientas de SCM/
│       ├── README.md
│       ├── links.md
│       └── TP4_HerramientasSCM_Enunciado.pdf
│
└── Teorico/
    ├── Bibliografia/
    │   ├── ISW/                      # Ingeniería de Software
    │   ├── PA/                       # Pensamiento Ágil
    │   ├── SCM/                      # Gestión de Configuración de Software
    │   ├── TS/                       # Testing de Software
    │   └── LeanKanban/               # Lean y Kanban
    └── Presentaciones/
        ├── PC_IntroduccionALaIngenieriaDeSoftware.pdf
        └── PC_GestionDeConfiguracionDeSoftware.pdf
```

## Descripción de las carpetas

| Carpeta | Contenido |
| ------- | --------- |
| `DocumentacionGeneral/` | Documentación que define cómo se organiza y administra el repositorio: estructura, glosario y plan de configuración. |
| `ReglasDeJuego/` | Material provisto por la cátedra que establece las pautas de cursado: programa, presentación de la materia y material de apoyo. |
| `Resumenes/` | Resúmenes elaborados por el grupo para las distintas unidades o temas de la materia. |
| `TrabajosPracticos/` | Trabajos Prácticos. Cada TP se almacena en una carpeta propia junto con su README, sus enlaces, el enunciado y los entregables asociados. |
| `Teorico/Bibliografia/` | Material bibliográfico clasificado por temática. |
| `Teorico/Presentaciones/` | Presentaciones utilizadas durante las clases teóricas. |

## Convención de carpetas de Trabajos Prácticos

Cada Trabajo Práctico se almacena en una carpeta con el formato:

```
TP<x> - <NombreTP>/
```

Ejemplo: `TP4 - SCM - Herramientas de SCM/`

Cada carpeta de TP contiene como mínimo:

* `README.md` — descripción del trabajo, contenido de la carpeta y estado de la entrega.
* `links.md` — enlaces externos relacionados con el trabajo.
* Los entregables, nombrados según la regla definida en [`PlanDeConfiguracion.md`](PlanDeConfiguracion.md).

## Criterio de ubicación

Cada archivo debe almacenarse en la carpeta que corresponda según su tipo y finalidad. **La ubicación forma parte de la identificación del Ítem de Configuración** y debe mantenerse consistente durante todo el cursado.

Las carpetas que aún no contienen archivos mantienen un `README.md` o un `.gitkeep` para preservar la estructura, dado que Git no versiona carpetas vacías.
