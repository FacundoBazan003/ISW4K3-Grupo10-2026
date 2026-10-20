import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

const ruta = resolve(process.env.SQLITE_PATH ?? "data/ecoharmony.db");
if (!existsSync(ruta)) {
  console.error(
    `Todavía no existe la base de datos: ${ruta}. Iniciá el backend para crearla.`,
  );
  process.exitCode = 1;
} else {
  const db = new DatabaseSync(ruta, { readOnly: true });
  try {
    console.log(`Consulta de solo lectura: ${ruta}`);
    console.log("INSCRIPCIONES (últimas 100)");
    console.table(
      db
        .prepare(
          "SELECT id, usuario_id, actividad_id, fecha_hora FROM inscripciones ORDER BY id DESC LIMIT 100",
        )
        .all(),
    );
    console.log("PARTICIPANTES (últimos 100)");
    console.table(
      db
        .prepare(
          "SELECT id, inscripcion_id, nombre, dni, edad, talle FROM participantes ORDER BY id DESC LIMIT 100",
        )
        .all(),
    );
  } finally {
    db.close();
  }
}
