import React, { useEffect, useState } from "react";
import {
  X,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  Hotel,
  Utensils,
  MapPin,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import Cookies from "js-cookie";
import { calcularTotalReserva, detalleDeReserva } from "../utils/precios";
import { formatearFecha } from "../utils/fechas";

const typeIcon = (tipo) => {
  const t = String(tipo || "").toLowerCase();
  if (t.includes("aloj")) return <Hotel className="h-4 w-4" />;
  if (t.includes("rest")) return <Utensils className="h-4 w-4" />;
  return <Clock className="h-4 w-4" />;
};

// Estados reales de una reserva: nace pendiente y un administrador la
// mueve a aprobada o rechazada.
const stateBadge = (estado) => {
  const e = String(estado || "").toLowerCase();

  if (e === "aprobada") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
        <CheckCircle2 className="h-3 w-3 mr-1" /> Aprobada
      </span>
    );
  }

  if (e === "rechazada") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
        <AlertCircle className="h-3 w-3 mr-1" /> Rechazada
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
      <Clock className="h-3 w-3 mr-1" /> Pendiente de aprobación
    </span>
  );
};

const ReservationsModal = ({ isOpen, onClose }) => {
  const { API_BASE_URL, user, isAuthenticated } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reservas, setReservas] = useState([]);

  useEffect(() => {
    const fetchReservations = async () => {
      if (!isOpen) return;
      if (!isAuthenticated || !user) return;

      setLoading(true);
      setError(null);
      try {
        const idMayorista = user.id_mayorista || user.id;
        const url = `${API_BASE_URL}/reservas/listar/mayorista/${idMayorista}`;
        const token = Cookies.get("access_token");
        const res = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.message || "Error al cargar reservas");
        }
        setReservas(Array.isArray(data.reservas) ? data.reservas : []);
      } catch (e) {
        setError(e.message || "Error de red");
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, [isOpen, isAuthenticated, user, API_BASE_URL]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-xl shadow-medium overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-lg font-bold">Mis reservas</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4">
          {!isAuthenticated ? (
            <div className="text-center text-gray-600">
              Debes iniciar sesión para ver tus reservas.
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Cargando reservas...</span>
            </div>
          ) : error ? (
            <div className="text-center text-red-600">{error}</div>
          ) : reservas.length === 0 ? (
            <div className="text-center text-gray-600">
              No tienes reservas registradas.
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[70vh] pr-1">
              {reservas.map((r) => (
                <div key={r.id} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <div className="text-reservat-primary">
                          {typeIcon(r.tipo_servicio)}
                        </div>
                        <h4 className="font-medium text-gray-900 truncate">
                          {r.nombre_servicio}
                        </h4>
                      </div>
                      <div className="text-sm text-gray-600 mt-1 line-clamp-2 whitespace-pre-line">
                        {r.descripcion}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                        <MapPin className="h-3 w-3" />
                        <span>{r.ciudad}</span>
                      </div>
                    </div>
                    <div className="text-right ml-3">
                      <div className="font-bold text-reservat-primary">
                        ${calcularTotalReserva(r).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {detalleDeReserva(r)}
                      </div>
                    </div>
                  </div>

                  {/* Lo que el mayorista reservó */}
                  <div className="mt-2 text-sm text-gray-600 space-y-0.5">
                    <div>
                      <span className="font-medium">Fechas:</span>{" "}
                      {formatearFecha(r.fecha_inicio)}
                      {r.fecha_fin && r.fecha_fin !== r.fecha_inicio && (
                        <> → {formatearFecha(r.fecha_fin)}</>
                      )}
                      {r.hora && <> · {r.hora}</>}
                    </div>
                    <div>
                      <span className="font-medium">Personas:</span> {r.cantidad}
                    </div>
                    {r.nombre_proveedor && (
                      <div>
                        <span className="font-medium">Proveedor:</span>{" "}
                        {r.nombre_proveedor}
                      </div>
                    )}
                  </div>

                  {/* Estado del cobro. Sólo tiene sentido en una reserva
                      aprobada: antes no hay nada que pagar. */}
                  {String(r.estado).toLowerCase() === "aprobada" &&
                    r.estado_pago !== "no_aplica" && (
                      <div className="mt-2">
                        {r.estado_pago === "aprobado" ? (
                          <div className="p-2.5 bg-green-50 border border-green-100 rounded-lg">
                            <p className="text-sm text-green-700 font-medium">
                              Pago confirmado
                            </p>
                          </div>
                        ) : (
                          <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-lg">
                            <p className="text-sm text-blue-800 mb-2">
                              {r.estado_pago === "rechazado" ||
                              r.estado_pago === "error"
                                ? "El pago anterior no se completó. Puedes intentarlo de nuevo."
                                : "Tu reserva está aprobada. Completa el pago para confirmarla."}
                            </p>
                            {r.pago_link_url && (
                              <a
                                href={r.pago_link_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 bg-reservat-primary text-white text-sm font-medium rounded-lg hover:opacity-90"
                              >
                                Pagar ${calcularTotalReserva(r).toLocaleString()}
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                  {/* El motivo es la respuesta que el mayorista está esperando:
                      sin esto, un rechazo no le dice nada. */}
                  {String(r.estado).toLowerCase() === "rechazada" &&
                    r.motivo_rechazo && (
                      <div className="mt-2 p-2.5 bg-red-50 border border-red-100 rounded-lg">
                        <p className="text-sm text-red-700">
                          <span className="font-medium">Motivo del rechazo:</span>{" "}
                          {r.motivo_rechazo}
                        </p>
                      </div>
                    )}

                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-gray-500">
                      Solicitada: {formatearFecha(r.fecha_creacion)}
                    </div>
                    {stateBadge(r.estado)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservationsModal;
