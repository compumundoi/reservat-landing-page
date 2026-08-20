import React, { useState } from 'react';
import { X, MapPin, Calendar, Star, ShoppingCart, ChevronLeft, ChevronRight, Users, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Swal from 'sweetalert2';
import { validarReserva, capacidadDelServicio } from '../utils/validarReserva';
import { calcularTotalItem, detalleDelTotal, esPorRango } from '../utils/precios';

const ServiceModal = ({ service, images = [], isOpen, onClose }) => {
  const { addToCart, isAuthenticated, abrirLogin } = useApp();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // Estado de reserva
  const [personas, setPersonas] = useState(1);
  const [fechaEntrada, setFechaEntrada] = useState('');
  const [fechaSalida, setFechaSalida] = useState(''); // solo alojamiento
  const [hora, setHora] = useState(''); // experiencias/restaurante

  // Usar las imágenes reales o una imagen por defecto
  const modalImages = images.length > 0 ? images : [
    'https://via.placeholder.com/600x400/263DBF/FFFFFF?text=Sin+Imagen'
  ];

  if (!isOpen || !service) return null;

  const capacidad = capacidadDelServicio(service.detalles_del_servicio);
  const reservaPorRango = esPorRango(service.tipo_servicio);

  // La reserva es siempre a futuro: el calendario ni siquiera ofrece hoy.
  const manana = new Date();
  manana.setDate(manana.getDate() + 1);
  const minimaFechaEntrada = manana.toISOString().slice(0, 10);

  const itemEstimado = {
    precio: service.precio,
    tipo_servicio: service.tipo_servicio,
    quantity: personas,
    reserva: { fecha_entrada: fechaEntrada, fecha_salida: fechaSalida }
  };
  const totalEstimado = calcularTotalItem(itemEstimado);
  const detalleEstimado = detalleDelTotal(itemEstimado);

  const agregarAlCarrito = (reserva) => {
    addToCart(service, { quantity: personas, reserva });
    Swal.fire({
      title: '¡Agregado al carrito!',
      text: `${service.nombre} ha sido agregado a tu carrito`,
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
    onClose && onClose();
  };

  const handleAddToCart = () => {
    const resultado = validarReserva({
      tipoServicio: service.tipo_servicio,
      personas,
      fechaEntrada,
      fechaSalida,
      hora,
      capacidad
    });

    if (!resultado.ok) {
      return Swal.fire({
        icon: 'warning',
        title: resultado.titulo,
        text: resultado.mensaje,
        confirmButtonColor: '#263DBF'
      });
    }

    // La sesión se pide recién acá, con los datos ya validados: así al
    // volver de iniciar sesión la reserva se agrega sola, sin repetir nada.
    if (!isAuthenticated) {
      return Swal.fire({
        icon: 'info',
        title: 'Necesitas iniciar sesión',
        html:
          'Reservar requiere una cuenta de mayorista.<br/>' +
          'Al iniciar sesión seguimos con esta reserva.',
        showCancelButton: true,
        confirmButtonText: 'Iniciar sesión',
        cancelButtonText: 'Ahora no',
        confirmButtonColor: '#263DBF',
        cancelButtonColor: '#6b7280'
      }).then((decision) => {
        if (decision.isConfirmed) {
          abrirLogin(() => agregarAlCarrito(resultado.reserva));
        }
      });
    }

    agregarAlCarrito(resultado.reserva);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % modalImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + modalImages.length) % modalImages.length);
  };

  const parseServiceDetails = (detailsString) => {
    try {
      return JSON.parse(detailsString || '{}');
    } catch {
      return {};
    }
  };

  const serviceDetails = parseServiceDetails(service.detalles_del_servicio);

  const getServiceTypeColor = (type) => {
    switch (type) {
      case 'alojamiento':
        return 'bg-reservat-primary';
      case 'restaurante':
        return 'bg-reservat-orange';
      case 'Transporte':
        return 'bg-reservat-pink';
      case 'Experiencia':
        return 'bg-success';
      default:
        return 'bg-gray-500';
    }
  };

  // Función para renderizar detalles de experiencias
  const renderExperienceDetails = (details) => {
    return (
      <div className="space-y-4">
        {/* Información básica */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-700">Tipo Tour:</span>
              <span className="text-sm text-gray-600 ml-2">{details.tipo_tour}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Duración:</span>
              <span className="text-sm text-gray-600 ml-2">{details.duracion}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Grupo Objetivo:</span>
              <span className="text-sm text-gray-600 ml-2">{details.grupo_objetivo}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Dificultad:</span>
              <span className="text-sm text-gray-600 ml-2">{details.dificultad}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Grupo Máximo:</span>
              <span className="text-sm text-gray-600 ml-2">{details.grupo_maximo} personas</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Punto de Encuentro:</span>
              <span className="text-sm text-gray-600 ml-2">{details.punto_de_encuentro}</span>
            </div>
          </div>
        </div>

        {/* Incluye */}
        {details.incluye && (
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-900 mb-3">Incluye</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(details.incluye).map(([key, value]) => (
                <div key={key} className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${value ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className="text-sm text-gray-700 capitalize">{key.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Disponibilidad */}
        {details.disponibilidad && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-900 mb-3">Disponibilidad</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-700">Fechas:</span>
                <span className="text-sm text-gray-600 ml-2">{details.disponibilidad.fechas}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Horarios:</span>
                <span className="text-sm text-gray-600 ml-2">{details.disponibilidad.horarios}</span>
              </div>
            </div>
          </div>
        )}

        {/* Idiomas */}
        {details.idiomas && (
          <div className="bg-purple-50 rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-900 mb-3">Idiomas</h4>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(details.idiomas).map(([key, value]) => {
                if (key === 'otros' && value) {
                  return (
                    <div key={key} className="col-span-3">
                      <span className="text-sm font-medium text-gray-700">Otros:</span>
                      <span className="text-sm text-gray-600 ml-2">{value}</span>
                    </div>
                  );
                }
                if (key !== 'otros') {
                  return (
                    <div key={key} className="flex items-center">
                      <span className={`w-2 h-2 rounded-full mr-2 ${value ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span className="text-sm text-gray-700 capitalize">{key}</span>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        )}

        {/* Extras y características adicionales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {details.extras && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h4 className="text-md font-semibold text-gray-900 mb-3">Extras</h4>
              <div className="space-y-2">
                {Object.entries(details.extras).map(([key, value]) => (
                  <div key={key} className="flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${value ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-sm text-gray-700 capitalize">{key.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-900 mb-3">Servicios Adicionales</h4>
            <div className="space-y-2">
              <div className="flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${details.parqueadero ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="text-sm text-gray-700">Parqueadero</span>
              </div>
              <div className="flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${details.pet_friendly ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="text-sm text-gray-700">Pet Friendly</span>
              </div>
            </div>
          </div>
        </div>

        {/* Equipamiento requerido */}
        {details.equipamiento_requerido && (
          <div className="bg-orange-50 rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-900 mb-3">Equipamiento Requerido</h4>
            <p className="text-sm text-gray-700">{details.equipamiento_requerido}</p>
          </div>
        )}
      </div>
    );
  };

  // Función para renderizar detalles de alojamiento
  const renderAccommodationDetails = (details) => {
    return (
      <div className="space-y-4">
        {/* Información básica */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-700">Tipo Alojamiento:</span>
              <span className="text-sm text-gray-600 ml-2">{details.tipo_alojamiento}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Habitación:</span>
              <span className="text-sm text-gray-600 ml-2">{details.habitacion}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Capacidad:</span>
              <span className="text-sm text-gray-600 ml-2">{details.capacidad} personas</span>
            </div>
          </div>
        </div>

        {/* Servicios incluidos */}
        {details.servicios_incluidos && (
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-900 mb-3">Servicios Incluidos</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(details.servicios_incluidos).map(([key, value]) => (
                <div key={key} className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${value ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className="text-sm text-gray-700 capitalize">{key.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Política de reservas */}
        {details.politica_reservas && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-900 mb-3">Política Reservas</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-700">Check-in:</span>
                <span className="text-sm text-gray-600 ml-2">{details.politica_reservas.check_in}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Check-out:</span>
                <span className="text-sm text-gray-600 ml-2">{details.politica_reservas.check_out}</span>
              </div>
              <div className="md:col-span-2">
                <span className="text-sm font-medium text-gray-700">Cancelaciones:</span>
                <span className="text-sm text-gray-600 ml-2">{details.politica_reservas.cancelaciones}</span>
              </div>
            </div>
          </div>
        )}

        {/* Precios */}
        {details.precios && (
          <div className="bg-yellow-50 rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-900 mb-3">Precios</h4>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(details.precios).map(([key, value]) => (
                <div key={key} className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${value ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className="text-sm text-gray-700 capitalize">{key.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Extras */}
        {details.extras && (
          <div className="bg-purple-50 rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-900 mb-3">Extras</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(details.extras).map(([key, value]) => (
                <div key={key} className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${value ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className="text-sm text-gray-700 capitalize">{key.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Función para renderizar detalles de restaurante
  const renderRestaurantDetails = (details) => {
    return (
      <div className="space-y-4">
        {/* Información básica */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-700">Tipo Establecimiento:</span>
              <span className="text-sm text-gray-600 ml-2">{details.tipo_establecimiento}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Estilo Gastronómico:</span>
              <span className="text-sm text-gray-600 ml-2">{details.estilo_gastronomico}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Capacidad:</span>
              <span className="text-sm text-gray-600 ml-2">{details.capacidad} personas</span>
            </div>
          </div>
        </div>

        {/* Servicios */}
        {details.servicios && (
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-900 mb-3">Servicios</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(details.servicios).map(([key, value]) => (
                <div key={key} className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${value ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className="text-sm text-gray-700 capitalize">{key.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Horarios */}
        {details.horarios && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-900 mb-3">Horarios</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(details.horarios).map(([key, value]) => (
                <div key={key} className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${value ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className="text-sm text-gray-700 capitalize">{key.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Extras */}
        {details.extras && (
          <div className="bg-yellow-50 rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-900 mb-3">Extras</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(details.extras).map(([key, value]) => (
                <div key={key} className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${value ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className="text-sm text-gray-700 capitalize">{key.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Promociones */}
        {details.promociones && (
          <div className="bg-orange-50 rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-900 mb-3">Promociones</h4>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(details.promociones).map(([key, value]) => (
                <div key={key} className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${value ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className="text-sm text-gray-700 capitalize">{key.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Servicios adicionales */}
        {details.servicios_adicionales && (
          <div className="bg-purple-50 rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-900 mb-3">Servicios Adicionales</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(details.servicios_adicionales).map(([key, value]) => (
                <div key={key} className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${value ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className="text-sm text-gray-700 capitalize">{key.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Función principal para renderizar detalles según el tipo de servicio
  const renderServiceDetails = (details, serviceType) => {
    switch (serviceType?.toLowerCase()) {
      case 'experiencias':
      case 'experiencia':
        return renderExperienceDetails(details);
      case 'alojamiento':
      case 'hoteles':
        return renderAccommodationDetails(details);
      case 'restaurante':
      case 'restaurantes':
        return renderRestaurantDetails(details);
      default:
        // Fallback para tipos no reconocidos
        return (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(details).map(([key, value]) => (
                <div key={key}>
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {key.replace(/_/g, ' ')}:
                  </span>
                  <span className="text-sm text-gray-600 ml-2">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center rounded-t-xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{service.nombre}</h2>
            <div className="flex items-center space-x-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white ${getServiceTypeColor(service.tipo_servicio)}`}>
                {service.tipo_servicio}
              </span>
              {service.relevancia && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  <Star className="w-4 h-4 mr-1" />
                  {service.relevancia}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Image Gallery */}
          <div className="mb-6">
            <div className="relative h-64 md:h-80 rounded-lg overflow-hidden mb-4">
              <img
                src={modalImages[currentImageIndex]}
                alt={service.nombre}
                className="w-full h-full object-cover"
              />
              
              {/* Navigation Buttons */}
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all duration-200"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all duration-200"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Image Counter */}
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                {currentImageIndex + 1} / {modalImages.length}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {modalImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    index === currentImageIndex 
                      ? 'border-reservat-primary' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Descripción</h3>
                <p className="text-gray-600 leading-relaxed">{service.descripcion}</p>
              </div>

              {/* Location */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Ubicación</h3>
                <div className="flex items-start space-x-2 text-gray-600">
                  <MapPin className="w-5 h-5 mt-0.5 text-reservat-primary" />
                  <div>
                    <p className="font-medium">{service.ciudad}, {service.departamento}</p>
                    {service.ubicacion && (
                      <p className="text-sm text-gray-500">{service.ubicacion}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Service Details */}
              {Object.keys(serviceDetails).length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Detalles del servicio</h3>
                  {renderServiceDetails(serviceDetails, service.tipo_servicio)}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Price Card */}
              <div className="card p-6">
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-reservat-primary mb-1">
                    ${service.precio?.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">{service.moneda}</div>
                </div>
                {/* Formulario de reserva */}
                <div className="space-y-3 mb-4">
                  <div>
                    <label
                      htmlFor="reserva-personas"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Personas
                      {capacidad != null && (
                        <span className="text-gray-400 font-normal">
                          {' '}(máx. {capacidad})
                        </span>
                      )}
                    </label>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <input
                        id="reserva-personas"
                        type="number"
                        min={1}
                        max={capacidad || undefined}
                        value={personas}
                        onChange={(e) => setPersonas(parseInt(e.target.value || '1', 10))}
                        className="input w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="reserva-entrada"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      {reservaPorRango ? 'Fecha de entrada' : 'Fecha'}
                    </label>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <input
                        id="reserva-entrada"
                        type="date"
                        min={minimaFechaEntrada}
                        value={fechaEntrada}
                        onChange={(e) => setFechaEntrada(e.target.value)}
                        className="input w-full"
                      />
                    </div>
                  </div>

                  {reservaPorRango ? (
                    <div>
                      <label
                        htmlFor="reserva-salida"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Fecha de salida
                      </label>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <input
                          id="reserva-salida"
                          type="date"
                          min={fechaEntrada || minimaFechaEntrada}
                          value={fechaSalida}
                          onChange={(e) => setFechaSalida(e.target.value)}
                          className="input w-full"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label
                        htmlFor="reserva-hora"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Hora
                      </label>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <input
                          id="reserva-hora"
                          type="time"
                          value={hora}
                          onChange={(e) => setHora(e.target.value)}
                          className="input w-full"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Total en vivo: el usuario ve lo que va a pagar antes de
                    agregar, no recién en el carrito. */}
                <div className="border-t border-gray-100 pt-4 mb-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-gray-600">Total</span>
                    <span className="text-xl font-bold text-reservat-primary">
                      ${totalEstimado.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 text-right mt-0.5">
                    {detalleEstimado}
                  </p>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Agregar al carrito</span>
                </button>
              </div>

              {/* Service Info */}
              <div className="card p-6">
                <h4 className="font-bold text-gray-900 mb-4">Información del servicio</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Proveedor ID:</span>
                    <span className="font-medium text-gray-900 truncate ml-2">
                      {service.proveedor_id?.slice(0, 8)}...
                    </span>
                  </div>
                  
                  {service.fecha_creacion && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Fecha de creación:</span>
                      <div className="flex items-center text-gray-900">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{new Date(service.fecha_creacion).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Estado:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      service.activo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {service.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceModal;
