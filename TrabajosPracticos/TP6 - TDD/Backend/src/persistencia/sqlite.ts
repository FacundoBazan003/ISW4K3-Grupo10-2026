import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import type {
  Inscripcion,
  Participante,
  TalleVestimenta,
} from "../inscripciones/modelos";
import type { AlmacenInscripciones } from "./almacen";

export class AlmacenSqlite implements AlmacenInscripciones {
  private readonly db: DatabaseSync;
  readonly ruta: string;

  constructor(ruta: string) {
    this.ruta = ruta === ":memory:" ? ruta : resolve(ruta);
    if (this.ruta !== ":memory:")
      mkdirSync(dirname(this.ruta), { recursive: true });
    this.db = new DatabaseSync(this.ruta);
    this.db.exec(`
      PRAGMA foreign_keys = ON;
      PRAGMA busy_timeout = 5000;
      CREATE TABLE IF NOT EXISTS inscripciones (
        id INTEGER PRIMARY KEY,
        usuario_id TEXT NOT NULL,
        actividad_id TEXT NOT NULL,
        fecha_hora TEXT NOT NULL
      ) STRICT;
      CREATE TABLE IF NOT EXISTS participantes (
        id INTEGER PRIMARY KEY,
        inscripcion_id INTEGER NOT NULL REFERENCES inscripciones(id) ON DELETE CASCADE,
        orden INTEGER NOT NULL,
        nombre TEXT,
        dni TEXT NOT NULL,
        edad INTEGER NOT NULL CHECK (edad >= 0),
        talle TEXT,
        UNIQUE (inscripcion_id, orden)
      ) STRICT;
      CREATE INDEX IF NOT EXISTS inscripciones_turno ON inscripciones(actividad_id, fecha_hora);
    `);
  }

  listar(): Inscripcion[] {
    const filas = this.db
      .prepare(
        "SELECT id, usuario_id, actividad_id, fecha_hora FROM inscripciones ORDER BY id",
      )
      .all();
    const buscarParticipantes = this.db.prepare(
      "SELECT nombre, dni, edad, talle FROM participantes WHERE inscripcion_id = ? ORDER BY orden",
    );
    return filas.map((fila) => ({
      id: Number(fila.id),
      usuarioId: String(fila.usuario_id),
      actividadId: String(fila.actividad_id),
      fechaHora: String(fila.fecha_hora),
      participantes: buscarParticipantes
        .all(Number(fila.id))
        .map((p): Participante => ({
          nombre: p.nombre === null ? undefined : String(p.nombre),
          dni: String(p.dni),
          edad: Number(p.edad),
          talleVestimenta:
            p.talle === null ? undefined : (String(p.talle) as TalleVestimenta),
        })),
    }));
  }

  transaccion<T>(operacion: (inscripciones: Inscripcion[]) => T): T {
    // Leer cupos, validar y guardar bajo el mismo bloqueo de escritura.
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const inscripciones = this.listar();
      const cantidadAnterior = inscripciones.length;
      const resultado = operacion(inscripciones);
      const insertarInscripcion = this.db.prepare(
        "INSERT INTO inscripciones (id, usuario_id, actividad_id, fecha_hora) VALUES (?, ?, ?, ?)",
      );
      const insertarParticipante = this.db.prepare(
        "INSERT INTO participantes (inscripcion_id, orden, nombre, dni, edad, talle) VALUES (?, ?, ?, ?, ?, ?)",
      );
      for (const inscripcion of inscripciones.slice(cantidadAnterior)) {
        insertarInscripcion.run(
          inscripcion.id,
          inscripcion.usuarioId,
          inscripcion.actividadId,
          inscripcion.fechaHora,
        );
        inscripcion.participantes.forEach((p, orden) => {
          insertarParticipante.run(
            inscripcion.id,
            orden,
            p.nombre ?? null,
            p.dni,
            p.edad,
            p.talleVestimenta ?? null,
          );
        });
      }
      this.db.exec("COMMIT");
      return resultado;
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }

  cerrar(): void {
    this.db.close();
  }
}
