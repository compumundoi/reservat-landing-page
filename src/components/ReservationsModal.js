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

const typeIcon = (tipo) => {
  const t = String(tipo || "").toLowerCase();
  if (t.includes("aloj")) return <Hotel className="h-4 w-4" />;
  if (t.includes("rest")) return <Utensils className="h-4 w-4" />;
  return <Clock className="h-4 w-4" />;
};

const stateBadge = (estado) => {
  const e = String(estado || "").toLowerCase();
  if (e === "confirmada" || e === "confirmado") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
        <CheckCircle2 className="h-3 w-3 mr-1" /> {estado}
      </span>
    );
  }
  if (e === "cancelada" || e === "cancelado") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
        <AlertCircle className="h-3 w-3 mr-1" /> {estado}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
      <Clock className="h-3 w-3 mr-1" /> {estado || "pendiente"}
    </span>
  );
};

const ReservationsModal = ({ isOpen, onClose }) => {
  const { user, isAuthenticated } = useApp();
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
        const url = `http://localhost:8018/api/v1/reservas/listar/mayorista/${idMayorista}`;
        const res = await fetch(url);
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
  }, [isOpen, isAuthenticated, user]);

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
                        ${Number(r.precio).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        Cant: {r.cantidad}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-gray-500">
                      Creada: {r.fecha_creacion}
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
