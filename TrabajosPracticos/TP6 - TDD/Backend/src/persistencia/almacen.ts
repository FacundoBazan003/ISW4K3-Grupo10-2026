import type { Inscripcion } from "../inscripciones/modelos";

export interface AlmacenInscripciones {
  listar(): Inscripcion[];
  transaccion<T>(operacion: (inscripciones: Inscripcion[]) => T): T;
}

// Conserva el contexto de los tests originales y de la primera integración.
export class AlmacenEnMemoria implements AlmacenInscripciones {
  constructor(private readonly inscripciones: Inscripcion[] = []) {}

  listar(): Inscripcion[] {
    return this.inscripciones;
  }

  transaccion<T>(operacion: (inscripciones: Inscripcion[]) => T): T {
    return operacion(this.inscripciones);
  }
}
