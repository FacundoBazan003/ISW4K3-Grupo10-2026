# Plan de Gestión de Configuración

Este documento establece los criterios utilizados para identificar, nombrar, ubicar y versionar los Ítems de Configuración del repositorio de la materia Ingeniería de Software.

---

## 1. Ítems de Configuración

Se considera **Ítem de Configuración (IC)** a todo elemento del repositorio que debe ser identificado, almacenado y controlado durante el cursado.

Se definen los siguientes tipos:

| Sigla | Ítem de Configuración | Descripción |
| --- | --- | --- |
| RDJ | Reglas de Juego | Documentos provistos por la cátedra que establecen las pautas de cursado: programa, presentación de la materia, material de apoyo. |
| MB | Material Bibliográfico | Documentos bibliográficos utilizados como material de estudio, clasificados por temática. |
| PC | Presentación de Clase | Presentaciones utilizadas o provistas durante las clases teóricas. |
| TP | Trabajo Práctico | Archivos asociados a cada Trabajo Práctico: enunciado, informe, código u otros entregables. |
| R | Resumen | Resúmenes elaborados por el grupo sobre las unidades o temas de la materia. |

Los archivos de documentación propia del repositorio (`README.md`, `Glosario.md`, `EstructuraRepositorio.md`, este mismo documento) se nombran de forma descriptiva y se ubican en `DocumentacionGeneral/`.

---

## 2. Regla de nombrado

Los nombres se construyen con una sigla que identifica el tipo de IC, separando los componentes con guion bajo (`_`) y utilizando notación *PascalCase* sin espacios ni acentos.

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
* `<n>` es el número de la presentacion.
* `<NombrePresentacion>` identifica el tema de la presentacion.
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

El objetivo de la regla es que el nombre permita identificar el tipo y el contenido del archivo sin necesidad de abrirlo.

---

## 3. Ubicación de los Ítems de Configuración

La ubicación forma parte de la identificación del IC. Cada archivo debe almacenarse en la carpeta definida para su tipo:

| Ítem de Configuración | Regla de nombrado | Ubicación |
| --- | --- | --- |
| Reglas de Juego | `RDJ_<NombreDocumento>.<ext>` | `/ReglasDeJuego` |
| Material Bibliográfico | `MB_<NombreMaterial>_<Autor>.<ext>` | `/Teorico/Bibliografia/<Tematica>` |
| Presentación de Clase | `PC_<NombrePresentacion>.<ext>` | `/Teorico/Presentaciones` |
| Trabajo Práctico | `TP<x>_<NombreTP>_<Tipo>.<ext>` | `/TrabajosPracticos/TP<x> - <NombreTP>` |
| Resumen | `R_<Tema>.<ext>` | `/Resumenes` |
| Documentación de configuración | Nombre descriptivo | `/DocumentacionGeneral` |

Las temáticas admitidas para la bibliografía son: `ISW`, `PA`, `SCM`, `TS`, `LeanKanban`.

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

Se establece una **Línea Base (LB)** de manera periódica **cada 30 días** a lo largo del cursado. La Línea Base está compuesta por la totalidad de la documentación, código y demás Ítems de Configuración consolidados y estables en el repositorio hasta esa fecha.

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