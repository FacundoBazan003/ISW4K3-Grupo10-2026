import { crearApp } from "./api/app";
import { AlmacenSqlite } from "./persistencia/sqlite";

const puerto = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "127.0.0.1";
const almacen = new AlmacenSqlite(
  process.env.SQLITE_PATH ?? "data/ecoharmony.db",
);
const servidor = crearApp({ almacen }).listen(puerto, host, () => {
  console.log(
    `API EcoHarmony disponible en http://${host}:${puerto}/api/health`,
  );
  console.log(`Base SQLite: ${almacen.ruta}`);
});

function cerrar(): void {
  servidor.close(() => {
    almacen.cerrar();
    process.exit(0);
  });
}

process.once("SIGINT", cerrar);
process.once("SIGTERM", cerrar);
