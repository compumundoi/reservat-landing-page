import React, { useEffect, useState } from "react";
import { X, Plus, Minus, Trash2, ShoppingBag, LogIn } from "lucide-react";
import { useApp } from "../context/AppContext";
import Swal from "sweetalert2";
import Cookies from "js-cookie";

const Cart = ({ isOpen, onClose }) => {
  const {
    API_BASE_URL,
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

    // Una solicitud de reserva por cada servicio del carrito. El estado lo
    // fija el backend en "pendiente": aca no se decide nada, se solicita.
    const idMayorista = user?.id_mayorista || user?.id || "";
    if (!idMayorista) {
      Swal.fire({
        icon: "error",
        title: "No pudimos identificar tu cuenta",
        text: "Volve a iniciar sesion e intenta nuevamente.",
        confirmButtonColor: "#263DBF",
      });
      return;
    }

    // Sin proveedor la reserva no se puede atribuir a nadie, y el backend la
    // rechaza con un 422 que no le dice nada al usuario.
    const sinProveedor = cart.filter(
      (item) => !(item.id_proveedor || item.proveedor_id),
    );
    if (sinProveedor.length > 0) {
      Swal.fire({
        icon: "error",
        title: "Servicios sin proveedor asociado",
        html: `No podemos reservar: <b>${sinProveedor
          .map((item) => item.nombre)
          .join(", ")}</b>. Quitalos del carrito o contactanos.`,
        confirmButtonColor: "#263DBF",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const endpoint = `${API_BASE_URL}/reservas/crear`;
      const token = Cookies.get("access_token");

      const todayStr = new Date().toISOString().slice(0, 10);

      const requests = cart.map((item) => {
        const fechaEntrada = item?.reserva?.fecha_entrada || todayStr;
        const fechaSalida =
          item?.reserva?.fecha_salida ||
          item?.reserva?.fecha_entrada ||
          todayStr;

        const payload = {
          id_proveedor: item.id_proveedor || item.proveedor_id,
          id_servicio: item.id_servicio,
          id_mayorista: idMayorista,
          nombre_servicio: item.nombre || "",
          descripcion: item.descripcion || "",
          tipo_servicio: String(item.tipo_servicio || "").toLowerCase(),
          precio: String(item.precio ?? ""),
          ciudad: item.ciudad || "",
          activo: true,
          observaciones:
            "pendiente de confirmacion para disponibilidad de fechas",
          fecha_creacion: todayStr,
          cantidad: item.quantity || 1,
          fecha_inicio: fechaEntrada,
          fecha_fin: fechaSalida,
        };

        return fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        })
          .then(async (res) => {
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
              throw new Error(data?.detail || data?.message || `Error ${res.status}`);
            }
            return { ok: true, item, data };
          })
          .catch((err) => ({ ok: false, item, error: err.message }));
      });

      const resultados = await Promise.all(requests);
      const exitosas = resultados.filter((r) => r.ok);
      const fallidas = resultados.filter((r) => !r.ok);

      // Sacar del carrito solo lo que ya quedo registrado: si el usuario
      // reintenta, no se duplican las reservas que si se crearon.
      exitosas.forEach((r) => removeFromCart(r.item.id_servicio));

      if (fallidas.length === 0) {
        Swal.fire({
          icon: "success",
          title: "Solicitud enviada",
          html:
            `Registramos <b>${exitosas.length}</b> solicitud(es) de reserva.<br/>` +
            "Quedan <b>pendientes de aprobacion</b>: un administrador las revisa " +
            "y te avisamos con la respuesta.",
          confirmButtonColor: "#263DBF",
        });
      } else if (exitosas.length > 0) {
        Swal.fire({
          icon: "warning",
          title: "Solicitud parcialmente enviada",
          html:
            `Registradas: <b>${exitosas.length}</b><br/>` +
            `Fallidas: <b>${fallidas.length}</b><br/><br/>` +
            "Las fallidas siguen en tu carrito, podes reintentar.",
          confirmButtonColor: "#263DBF",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "No pudimos enviar tu solicitud",
          text: fallidas[0]?.error || "Intenta nuevamente mas tarde.",
          confirmButtonColor: "#263DBF",
        });
      }
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "Error inesperado",
        text: e.message || "Intenta nuevamente mas tarde.",
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

            <p className="text-xs text-gray-500">
              Tu solicitud queda pendiente de aprobación por un administrador.
              Te avisamos apenas haya respuesta.
            </p>

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
                      ? "Enviando solicitud..."
                      : "Solicitar reserva"
                    : "Inicia sesión para reservar"}
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

    </div>
  );
};

export default Cart;
