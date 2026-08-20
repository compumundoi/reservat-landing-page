// Cálculo del precio de una reserva.
//
// La regla depende del tipo de servicio y es la misma en el carrito, en la
// ficha del servicio y en el resumen, así que vive en un solo lugar.

// Tipos que se reservan por rango de fechas. El resto se reserva por turno.
const TIPOS_POR_RANGO = ["alojamiento", "hoteles", "hotel"];

export const esPorRango = (tipoServicio) =>
  TIPOS_POR_RANGO.includes(String(tipoServicio || "").toLowerCase());

/**
 * Noches entre dos fechas "YYYY-MM-DD".
 *
 * Se comparan como fechas locales para que el cambio de huso no sume ni
 * reste una noche. Sin fechas válidas se asume 1 para no dejar el total en
 * cero mientras el usuario todavía está eligiendo.
 */
export const calcularNoches = (fechaEntrada, fechaSalida) => {
  if (!fechaEntrada || !fechaSalida) return 1;

  const aFecha = (valor) => {
    const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
    return partes
      ? new Date(Number(partes[1]), Number(partes[2]) - 1, Number(partes[3]))
      : new Date(valor);
  };

  const entrada = aFecha(fechaEntrada);
  const salida = aFecha(fechaSalida);
  if (isNaN(entrada.getTime()) || isNaN(salida.getTime())) return 1;

  const noches = Math.round((salida - entrada) / (1000 * 60 * 60 * 24));
  return noches > 0 ? noches : 1;
};

/**
 * Total de un ítem del carrito.
 *
 * Alojamiento: el precio es por habitación y por noche, así que multiplica
 * por las noches. Las personas sólo validan contra la capacidad.
 * Resto (experiencias, restaurantes, transportes): el precio es por persona.
 */
export const calcularTotalItem = (item) => {
  const precio = Number(item?.precio) || 0;

  if (esPorRango(item?.tipo_servicio)) {
    return precio * calcularNoches(
      item?.reserva?.fecha_entrada,
      item?.reserva?.fecha_salida,
    );
  }

  return precio * (Number(item?.quantity) || 1);
};

/** Detalle legible de cómo se llegó al total, para mostrarlo junto al precio. */
export const detalleDelTotal = (item) => {
  const precio = Number(item?.precio) || 0;
  const formateado = `$${precio.toLocaleString()}`;

  if (esPorRango(item?.tipo_servicio)) {
    const noches = calcularNoches(
      item?.reserva?.fecha_entrada,
      item?.reserva?.fecha_salida,
    );
    return `${formateado} × ${noches} ${noches === 1 ? "noche" : "noches"}`;
  }

  const personas = Number(item?.quantity) || 1;
  return `${formateado} × ${personas} ${personas === 1 ? "persona" : "personas"}`;
};
