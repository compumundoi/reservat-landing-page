// Validación de los datos de una reserva.
//
// La usan la ficha del servicio y la edición desde el carrito: si viven en
// dos lugares, tarde o temprano una acepta lo que la otra rechaza.

import { esPorRango } from "./precios";

/** Capacidad declarada del servicio, o null si el proveedor no la cargó. */
export const capacidadDelServicio = (detalles) => {
  if (!detalles) return null;

  let datos = detalles;
  if (typeof datos === "string") {
    try {
      datos = JSON.parse(datos);
    } catch {
      return null;
    }
  }

  const capacidad = Number(datos?.capacidad);
  return Number.isFinite(capacidad) && capacidad > 0 ? capacidad : null;
};

const aFechaLocal = (valor) => {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor || "");
  return partes
    ? new Date(Number(partes[1]), Number(partes[2]) - 1, Number(partes[3]))
    : new Date(valor);
};

/**
 * Valida los datos de reserva de un servicio.
 *
 * Devuelve `{ ok: true, reserva }` con los campos que corresponden al tipo,
 * o `{ ok: false, titulo, mensaje }` con el primer problema encontrado.
 */
export const validarReserva = ({
  tipoServicio,
  personas,
  fechaEntrada,
  fechaSalida,
  hora,
  capacidad,
}) => {
  const cantidad = Number(personas);

  if (!Number.isFinite(cantidad) || cantidad < 1) {
    return {
      ok: false,
      titulo: "Cantidad inválida",
      mensaje: "La cantidad de personas debe ser al menos 1",
    };
  }

  if (capacidad != null && cantidad > capacidad) {
    return {
      ok: false,
      titulo: "Supera la capacidad",
      mensaje: `Este servicio admite hasta ${capacidad} ${
        capacidad === 1 ? "persona" : "personas"
      }.`,
    };
  }

  if (!fechaEntrada) {
    return {
      ok: false,
      titulo: "Fecha requerida",
      mensaje: "Debes seleccionar una fecha de entrada",
    };
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const entrada = aFechaLocal(fechaEntrada);

  if (!(entrada > hoy)) {
    return {
      ok: false,
      titulo: "Fecha de entrada inválida",
      mensaje: "La fecha de entrada debe ser mayor a la fecha actual",
    };
  }

  if (esPorRango(tipoServicio)) {
    if (!fechaSalida) {
      return {
        ok: false,
        titulo: "Fecha de salida requerida",
        mensaje: "Debes seleccionar una fecha de salida",
      };
    }

    if (!(aFechaLocal(fechaSalida) > entrada)) {
      return {
        ok: false,
        titulo: "Fecha de salida inválida",
        mensaje: "La fecha de salida debe ser mayor a la fecha de entrada",
      };
    }

    return {
      ok: true,
      reserva: { fecha_entrada: fechaEntrada, fecha_salida: fechaSalida },
    };
  }

  if (!hora) {
    return {
      ok: false,
      titulo: "Hora requerida",
      mensaje: "Debes seleccionar una hora",
    };
  }

  return { ok: true, reserva: { fecha_entrada: fechaEntrada, hora } };
};
