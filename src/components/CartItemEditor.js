import React, { useState } from "react";
import { Check, X } from "lucide-react";
import Swal from "sweetalert2";
import { validarReserva, capacidadDelServicio } from "../utils/validarReserva";
import { esPorRango } from "../utils/precios";

/**
 * Edición en línea de un ítem del carrito.
 *
 * Usa la misma validación que la ficha del servicio: lo que no se puede
 * agregar tampoco se puede dejar editando.
 */
const CartItemEditor = ({ item, onCancel, onSave }) => {
  const [personas, setPersonas] = useState(item.quantity || 1);
  const [fechaEntrada, setFechaEntrada] = useState(
    item.reserva?.fecha_entrada || "",
  );
  const [fechaSalida, setFechaSalida] = useState(
    item.reserva?.fecha_salida || "",
  );
  const [hora, setHora] = useState(item.reserva?.hora || "");

  const capacidad = capacidadDelServicio(item.detalles_del_servicio);
  const porRango = esPorRango(item.tipo_servicio);

  const manana = new Date();
  manana.setDate(manana.getDate() + 1);
  const minimaFechaEntrada = manana.toISOString().slice(0, 10);

  const handleGuardar = () => {
    const resultado = validarReserva({
      tipoServicio: item.tipo_servicio,
      personas,
      fechaEntrada,
      fechaSalida,
      hora,
      capacidad,
    });

    if (!resultado.ok) {
      return Swal.fire({
        icon: "warning",
        title: resultado.titulo,
        text: resultado.mensaje,
        confirmButtonColor: "#263DBF",
      });
    }

    onSave(personas, resultado.reserva);
  };

  return (
    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Personas
          {capacidad != null && (
            <span className="text-gray-400 font-normal"> (máx. {capacidad})</span>
          )}
        </label>
        <input
          type="number"
          min={1}
          max={capacidad || undefined}
          value={personas}
          onChange={(e) => setPersonas(parseInt(e.target.value || "1", 10))}
          className="input w-full"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          {porRango ? "Fecha de entrada" : "Fecha"}
        </label>
        <input
          type="date"
          min={minimaFechaEntrada}
          value={fechaEntrada}
          onChange={(e) => setFechaEntrada(e.target.value)}
          className="input w-full"
        />
      </div>

      {porRango ? (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Fecha de salida
          </label>
          <input
            type="date"
            min={fechaEntrada || minimaFechaEntrada}
            value={fechaSalida}
            onChange={(e) => setFechaSalida(e.target.value)}
            className="input w-full"
          />
        </div>
      ) : (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Hora
          </label>
          <input
            type="time"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            className="input w-full"
          />
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 flex items-center gap-1"
        >
          <X className="h-3.5 w-3.5" />
          Cancelar
        </button>
        <button
          onClick={handleGuardar}
          className="px-3 py-1.5 text-sm rounded-lg bg-reservat-primary text-white hover:opacity-90 flex items-center gap-1"
        >
          <Check className="h-3.5 w-3.5" />
          Guardar
        </button>
      </div>
    </div>
  );
};

export default CartItemEditor;
