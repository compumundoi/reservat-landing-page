import React, { useEffect, useState } from "react";
import { X, Plus, Minus, Trash2, ShoppingBag, LogIn } from "lucide-react";
import { useApp } from "../context/AppContext";
import Swal from "sweetalert2";

const Cart = ({ isOpen, onClose }) => {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getCartTotal,
    isAuthenticated,
    user,
    servicePhotos,
    fetchServicePhotos,
  } = useApp();

  // Estado modal de resumen
  const [showSummary, setShowSummary] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar fotos de los servicios en el carrito
  useEffect(() => {
    cart.forEach((item) => {
      // Solo cargar si no tenemos ya las fotos para este servicio
      if (!servicePhotos[item.id_servicio]) {
        fetchServicePhotos(item.id_servicio);
      }
    });
  }, [cart, servicePhotos, fetchServicePhotos]);

  const handleQuantityChange = (serviceId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(serviceId);
    } else {
      updateCartQuantity(serviceId, newQuantity);
    }
  };

  const handleRemoveItem = (serviceId, serviceName) => {
    Swal.fire({
      title: "¿Eliminar servicio?",
      text: `¿Estás seguro de que quieres eliminar "${serviceName}" del carrito?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        removeFromCart(serviceId);
        Swal.fire({
          title: "Eliminado",
          text: "El servicio ha sido eliminado del carrito",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  const handleClearCart = () => {
    if (cart.length === 0) return;

    Swal.fire({
      title: "¿Vaciar carrito?",
      text: "¿Estás seguro de que quieres eliminar todos los servicios del carrito?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, vaciar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        clearCart();
        Swal.fire({
          title: "Carrito vaciado",
          text: "Todos los servicios han sido eliminados",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      Swal.fire({
        title: "Inicia sesión requerida",
        text: "Debes iniciar sesión antes de realizar una compra",
        icon: "info",
        confirmButtonColor: "#263DBF",
        confirmButtonText: "Entendido",
      });
      return;
    }

    if (cart.length === 0) {
      Swal.fire({
        title: "Carrito vacío",
        text: "Agrega algunos servicios antes de proceder con la compra",
        icon: "warning",
        confirmButtonColor: "#263DBF",
      });
      return;
    }

    // Enviar reservas: una por cada servicio en el carrito
    try {
      setIsSubmitting(true);
      const endpoint = "http://localhost:8018/api/v1/reservas/crear";

      const todayStr = new Date().toISOString().slice(0, 10);

      const requests = cart.map((item) => {
        const fechaEntrada = item?.reserva?.fecha_entrada || todayStr;
        const fechaSalida =
          item?.reserva?.fecha_salida ||
          item?.reserva?.fecha_entrada ||
          todayStr;

        const payload = {
          id_proveedor: item.id_proveedor || item.proveedor_id || "",
          id_servicio: item.id_servicio,
          id_mayorista: (user && (user.id_mayorista || user.id)) || "",
          nombre_servicio: item.nombre || "",
          descripcion: item.descripcion || "",
          tipo_servicio: String(item.tipo_servicio || "").toLowerCase(),
          precio: String(item.precio ?? ""),
          ciudad: item.ciudad || "",
          activo: true,
          estado: "pendiente",
          observaciones:
            "pendiente de confirmacion para disponibilidad de fechas ",
          fecha_creacion: todayStr,
          cantidad: item.quantity || 1,
          fecha_inicio: fechaEntrada,
          fecha_fin: fechaSalida,
        };

        return fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })
          .then(async (res) => {
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
              throw new Error(data?.message || `Error ${res.status}`);
            }
            return { ok: true, item, data };
          })
          .catch((err) => ({ ok: false, item, error: err.message }));
      });

      const results = await Promise.allSettled(requests);
      const flattened = results.map((r) => r.value || r.reason);
      const success = flattened.filter((r) => r?.ok);
      const failed = flattened.filter((r) => !r?.ok);

      if (success.length > 0 && failed.length === 0) {
        Swal.fire({
          icon: "success",
          title: "Reservas registradas",
          text: `Se registraron ${success.length} reserva(s) correctamente.`,
          confirmButtonColor: "#263DBF",
        });
        // Vaciar carrito tras éxito total
        clearCart();
      } else if (success.length > 0 && failed.length > 0) {
        Swal.fire({
          icon: "warning",
          title: "Reservas parcialmente registradas",
          html: `Exitosas: <b>${success.length}</b><br/>Fallidas: <b>${failed.length}</b>`,
          confirmButtonColor: "#263DBF",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "No se pudieron registrar las reservas",
          text: "Intenta nuevamente más tarde.",
          confirmButtonColor: "#263DBF",
        });
      }
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "Error inesperado",
        text: e.message || "Intenta nuevamente más tarde.",
        confirmButtonColor: "#263DBF",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end p-4 z-50 animate-fade-in">
      <div className="bg-white h-full max-h-screen w-full max-w-md rounded-l-xl flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="h-5 w-5 text-reservat-primary" />
            <h2 className="text-xl font-bold text-gray-900">
              Carrito ({cart.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">
                Tu carrito está vacío
              </p>
              <p className="text-gray-400 text-sm">
                Agrega algunos servicios para comenzar
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id_servicio} className="card p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                      {servicePhotos[item.id_servicio] &&
                      servicePhotos[item.id_servicio].length > 0 ? (
                        <img
                          src={servicePhotos[item.id_servicio][0]}
                          alt={item.nombre}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback a placeholder si la imagen falla
                            if (!e.target.dataset.errorHandled) {
                              e.target.dataset.errorHandled = "true";
                              e.target.src =
                                "https://via.placeholder.com/64x64/E5E7EB/9CA3AF?text=IMG";
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-xs text-gray-500">IMG</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {item.nombre}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {item.ciudad}
                      </p>
                      <p className="text-lg font-bold text-reservat-primary">
                        ${item.precio?.toLocaleString()} {item.moneda}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        handleRemoveItem(item.id_servicio, item.nombre)
                      }
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.id_servicio,
                            item.quantity - 1,
                          )
                        }
                        className="p-1 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.id_servicio,
                            item.quantity + 1,
                          )
                        }
                        className="p-1 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <p className="font-bold text-gray-900">
                      ${(item.precio * item.quantity).toLocaleString()}
                    </p>
                  </div>

                  {/* Detalles de reserva */}
                  {item.reserva && (
                    <div className="mt-3 text-sm text-gray-600 space-y-1">
                      <div>
                        <span className="font-medium">Personas:</span>{" "}
                        {item.quantity}
                      </div>
                      <div>
                        <span className="font-medium">Fecha entrada:</span>{" "}
                        {item.reserva.fecha_entrada}
                      </div>
                      {item.reserva.fecha_salida && (
                        <div>
                          <span className="font-medium">Fecha salida:</span>{" "}
                          {item.reserva.fecha_salida}
                        </div>
                      )}
                      {item.reserva.hora && (
                        <div>
                          <span className="font-medium">Hora:</span>{" "}
                          {item.reserva.hora}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-gray-100 p-6 space-y-4">
            {/* Total */}
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Total:</span>
              <span className="text-reservat-primary">
                ${getCartTotal().toLocaleString()}
              </span>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={handleCheckout}
                className={`w-full btn-primary flex items-center justify-center space-x-2 ${isSubmitting ? "opacity-75 cursor-not-allowed" : ""}`}
                disabled={isSubmitting}
              >
                {!isAuthenticated && <LogIn className="h-4 w-4" />}
                <span>
                  {isAuthenticated
                    ? isSubmitting
                      ? "Enviando reservas..."
                      : "Proceder al pago"
                    : "Inicia sesión para comprar"}
                </span>
              </button>

              <button
                onClick={handleClearCart}
                className="w-full btn-secondary"
              >
                Vaciar carrito
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Resumen de Compra */}
      {showSummary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60] animate-fade-in">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold">Resumen de compra</h3>
              <button
                onClick={() => setShowSummary(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {cart.map((item) => (
                <div key={item.id_servicio} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-900">
                        {item.nombre}
                      </div>
                      <div className="text-sm text-gray-500">{item.ciudad}</div>
                    </div>
                    <div className="font-bold text-reservat-primary">
                      ${(item.precio * item.quantity).toLocaleString()}
                    </div>
                  </div>
                  {item.reserva && (
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-gray-700">
                      <div>
                        <span className="font-medium">Personas:</span>{" "}
                        {item.quantity}
                      </div>
                      <div>
                        <span className="font-medium">Entrada:</span>{" "}
                        {item.reserva.fecha_entrada}
                      </div>
                      {item.reserva.fecha_salida && (
                        <div>
                          <span className="font-medium">Salida:</span>{" "}
                          {item.reserva.fecha_salida}
                        </div>
                      )}
                      {item.reserva.hora && (
                        <div>
                          <span className="font-medium">Hora:</span>{" "}
                          {item.reserva.hora}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              <div className="flex justify-between items-center pt-3 border-t font-bold text-lg">
                <span>Total</span>
                <span className="text-reservat-primary">
                  ${getCartTotal().toLocaleString()}
                </span>
              </div>
            </div>
            <div className="p-4 border-t flex space-x-2">
              <button
                onClick={() => setShowSummary(false)}
                className="btn-secondary w-1/2"
              >
                Volver
              </button>
              <button
                onClick={() => {
                  setShowSummary(false);
                  Swal.fire({
                    title: "Funcionalidad en desarrollo",
                    text: "La integración con la API de reservas está en desarrollo",
                    icon: "info",
                    confirmButtonColor: "#263DBF",
                  });
                }}
                className="btn-primary w-1/2"
              >
                Confirmar y pagar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
