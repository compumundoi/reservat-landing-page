// Formateo de fechas que llegan del backend.

/**
 * Muestra una fecha "YYYY-MM-DD" en formato local.
 *
 * Sin hora, el navegador la interpreta como medianoche UTC y en Colombia
 * (UTC-5) la mostraría un día antes. Por eso se construye con sus
 * componentes, que `Date` toma como hora local.
 */
export const formatearFecha = (fecha) => {
  if (!fecha) return "—";

  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha);
  const valor = partes
    ? new Date(Number(partes[1]), Number(partes[2]) - 1, Number(partes[3]))
    : new Date(fecha);

  return isNaN(valor.getTime()) ? fecha : valor.toLocaleDateString("es-CO");
};
