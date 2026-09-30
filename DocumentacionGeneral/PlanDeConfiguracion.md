# Plan de Gestión de Configuración

Este documento establece los criterios utilizados para identificar, nombrar, ubicar y versionar los Ítems de Configuración del repositorio de la materia Ingeniería de Software.

---

## 1. Identificación de Ítems de Configuración

Se considera **Ítem de Configuración (IC)** a todo elemento del repositorio que debe ser identificado, almacenado y controlado durante el cursado.

De acuerdo con la clasificación utilizada por la cátedra, los IC pueden corresponder al **Producto**, al **Proyecto** o a una **Iteración**. En este repositorio, cada Trabajo Práctico se considera una iteración de trabajo: su enunciado y su documentación organizativa pertenecen a la Iteración, mientras que los resultados elaborados por el grupo pertenecen al Producto. Los documentos y materiales que sirven de soporte durante todo el cursado pertenecen al Proyecto.

| Sigla | Ítem de Configuración | Tipo | Ubicación |
| --- | --- | --- | --- |
| DOC | `README.md` general del repositorio | Proyecto | `/` |
| DOC | Plan de Configuración | Proyecto | `/DocumentacionGeneral` |
| DOC | Estructura del Repositorio | Proyecto | `/DocumentacionGeneral` |
| DOC | Glosario | Proyecto | `/DocumentacionGeneral` |
| CFG | Configuración técnica de Git y del repositorio (`.gitignore`, `.gitattributes` y equivalentes) | Proyecto | `/` o carpeta del TP cuando la configuración sea específica |
| RDJ | Reglas de Juego provistas por la cátedra | Proyecto | `/ReglasDeJuego` |
| MB | Material Bibliográfico | Proyecto | `/Teorico/Bibliografia/<Tematica>` |
| PC | Presentación de Clase | Proyecto | `/Teorico/Presentaciones` |
| TP | Enunciado del Trabajo Práctico | Iteración | `/TrabajosPracticos/TP<x> - <NombreTP>` |
| TP | `README.md` y `links.md` del Trabajo Práctico | Iteración | `/TrabajosPracticos/TP<x> - <NombreTP>` |
| TP | Informe, código, anexos y demás entregables elaborados por el grupo | Producto | `/TrabajosPracticos/TP<x> - <NombreTP>` |
| R | Resumen elaborado individualmente por cada alumno como material de apoyo | Proyecto | `/Resumenes/<ApellidoNombre>` |

La tabla identifica clases de IC y no cada instancia concreta incorporada al repositorio. Por eso no necesita actualizarse cada vez que se agrega un nuevo archivo de una clase ya definida. Las carpetas solo establecen la ubicación de los IC y no se consideran IC. Los marcadores `.gitkeep` preservan carpetas vacías en Git y tampoco se consideran IC.

---

## 2. Regla de nombrado

Los nombres se construyen con una sigla que identifica la clase de IC, separando los componentes con guion bajo (`_`) y utilizando notación *PascalCase* sin espacios ni acentos.

### Reglas de Juego

```
RDJ_<NombreDocumento>.<ext>

```

Ejemplos:

* `RDJ_Programa.pdf`
* `RDJ_PresentacionDeLaMateria.pdf`
* `RDJ_MaterialDeApoyo.pdf`

### Material Bibliográfico

```
MB_<NombreMaterial>_<Autor>.<ext>

```

Ejemplos:

* `MB_ElementsOfSoftwareConfigurationManagement_Bersoff.pdf`
* `MB_LittleBookOfConfigurationManagement_AirlieSoftwareCouncil.pdf`
* `MB_AgileSCM_Berczuk.pdf`

### Presentaciones de Clase

```
PC_<n>_<NombrePresentacion>.<ext>

```

Donde:

* `PC` identifica que se trata de una Presentación de Clase.
* `<n>` es el número de la presentación.
* `<NombrePresentacion>` identifica el tema de la presentación.
* `<ext>` es la extensión del archivo.

Ejemplos:

* `PC_01_IntroduccionALaIngenieriaDeSoftware.pdf`
* `PC_02_GestionDeConfiguracionDeSoftware.pdf`
* `PC_03_TestingDeSoftware.pdf`

### Trabajos Prácticos

```
TP<x>_<NombreTP>_<Tipo>.<ext>

```

Donde:

* `TP` identifica que se trata de un Trabajo Práctico.
* `<x>` es el número del Trabajo Práctico.
* `<NombreTP>` identifica el tema del trabajo.
* `<Tipo>` indica la clase de archivo dentro del TP: `Enunciado`, `Informe`, `Codigo`, `Anexo`.
* `<ext>` es la extensión del archivo.

Ejemplos:

* `TP4_HerramientasSCM_Enunciado.pdf`
* `TP4_HerramientasSCM_Informe.pdf`
* `TP5_UsoDelRepositorio_Enunciado.pdf`

### Resúmenes

```
R_<Tema>.<ext>

```

Ejemplo:

* `R_GestionDeConfiguracionDeSoftware.pdf`

Cada alumno almacena sus resúmenes en una subcarpeta propia identificada con el formato `<ApellidoNombre>`.

El objetivo de la regla es que el nombre permita identificar el tipo y el contenido del archivo sin necesidad de abrirlo.

### Documentación y configuración del repositorio

Los archivos DOC y CFG conservan sus nombres descriptivos o técnicos (`README.md`, `EstructuraRepositorio.md`, `.gitignore`, etc.) porque son nombres convencionales y su ubicación permite identificarlos de manera unívoca.

### Documentación propia de los Trabajos Prácticos

Cada carpeta de Trabajo Práctico contiene un archivo `README.md`. Su finalidad es identificar y describir el TP, detallar el contenido de la carpeta e indicar el estado de la entrega o cualquier instrucción necesaria para utilizar sus archivos.

Cuando un Trabajo Práctico requiera referencias, también puede incluir un archivo `links.md`. Este archivo contiene enlaces internos o externos, una breve descripción de cada recurso y su relación con el TP. Su finalidad es centralizar las referencias necesarias para consultar documentación almacenada dentro o fuera del repositorio.

Tanto `README.md` como `links.md` se consideran IC asociados a la Iteración y se ubican dentro de la carpeta del Trabajo Práctico correspondiente. `README.md` se incluye en todos los TP; `links.md` solo se crea cuando existen referencias que registrar. Los archivos `links.md` existentes se conservan mientras contengan referencias útiles.

---

## 3. Ubicación de los Ítems de Configuración

La ubicación forma parte de la identificación del IC. Cada archivo debe almacenarse en la carpeta definida para su tipo:

| Ítem de Configuración | Regla de nombrado | Ubicación |
| --- | --- | --- |
| Documentación del Repositorio | Nombre descriptivo | `/` o `/DocumentacionGeneral` |
| Configuración Técnica | Nombre técnico convencional | `/` o carpeta del TP cuando corresponda |
| Reglas de Juego | `RDJ_<NombreDocumento>.<ext>` | `/ReglasDeJuego` |
| Material Bibliográfico | `MB_<NombreMaterial>_<Autor>.<ext>` | `/Teorico/Bibliografia/<Tematica>` |
| Presentación de Clase | `PC_<n>_<NombrePresentacion>.<ext>` | `/Teorico/Presentaciones` |
| Trabajo Práctico | `TP<x>_<NombreTP>_<Tipo>.<ext>`, `README.md` o `links.md` | `/TrabajosPracticos/TP<x> - <NombreTP>` |
| Resumen | `R_<Tema>.<ext>` | `/Resumenes/<ApellidoNombre>` |

Cada temática de bibliografía se incorpora en una subcarpeta propia, aplicando el patrón genérico `<Tematica>` definido en la estructura del repositorio.

La estructura completa se documenta en [`EstructuraRepositorio.md`](EstructuraRepositorio.md).

---

## 4. Gestión de cambios

Los cambios se controlan mediante Git. Toda incorporación, modificación o eliminación significativa debe registrarse mediante un commit.

### Convención de mensajes de commit

| Prefijo | Uso | Ejemplo |
| --- | --- | --- |
| `add:` | Incorporar un elemento nuevo | `add: agregar enunciado del TP4` |
| `update:` | Modificar o mejorar un elemento existente | `update: corregir tabla de ICs en PlanDeConfiguracion` |
| `remove:` | Eliminar un elemento | `remove: eliminar presentación duplicada` |

Pautas:

* Usar verbos en presente.
* El mensaje debe dejar claro **qué** se modificó y **con qué objetivo**.
* Un commit por cambio lógico; evitar commits que mezclen incorporaciones no relacionadas.

### Archivos excluidos del control

No se versionan archivos derivados ni dependencias descargables (por ejemplo `node_modules/`, `target/`, `build/`, `.env`). Cada TP que incluya código debe incorporar su propio `.gitignore` antes del primer commit del código.

---

## 5. Criterio para establecer una Línea Base

Se establece una **Línea Base (LB)** de manera periódica **cada 30 días** a lo largo del cursado, tomando como fecha inicial el 1 de septiembre de 2026. La Línea Base está compuesta por la totalidad de la documentación, código y demás Ítems de Configuración consolidados y estables en el repositorio hasta esa fecha.

La Línea Base representa un estado formal y de referencia del repositorio. Una vez marcada no se modifica: los cambios posteriores se registran mediante nuevos commits y se integrarán en la siguiente Línea Base programada.

---

## 6. Identificación de Líneas Base

Cada Línea Base se identifica con un número de versión:

```
vX.0 - <descripcion>

```

* El número **mayor** (`X`) se incrementa secuencialmente con cada ciclo periódico de 30 días (`v1.0`, `v2.0`, `v3.0`, etc.).
* El número **menor** se mantiene en `0` para las líneas base programadas, o se incrementa (`vX.1`, `vX.2`) únicamente si surge una corrección de emergencia sobre una línea base ya cerrada.

Ejemplos:

* `v1.0 - Linea Base Mes 1 (Dia 30)`
* `v2.0 - Linea Base Mes 2 (Dia 60)`
* `v3.0 - Linea Base Mes 3 (Dia 90)`

En Git, la Línea Base se materializa mediante un **tag anotado**, donde el nombre del tag es el número de versión y el mensaje es la descripción:

```bash
git tag -a v1.0 -m "Linea Base Mes 1 (Dia 30)"
git push origin v1.0

```

---

## 7. Herramientas

| Herramienta | Uso |
| --- | --- |
| Git | Motor de control de versiones. |
| GitHub | Repositorio remoto de acceso público para los integrantes y la cátedra. |

---
