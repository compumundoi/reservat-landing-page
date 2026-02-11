import React, { useState, useEffect } from "react";
import { Eye, MapPin, Star, Calendar } from "lucide-react";
import { useApp } from "../context/AppContext";
import ServiceModal from "./ServiceModal";
// import Swal from 'sweetalert2';

const defaultServiceImages = {
  alojamiento:
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800",
  restaurante:
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800",
  transporte:
    "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=800",
  experiencia:
    "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=800",
  default:
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=800",
};

const getDefaultImage = (type) => {
  const t = String(type || "").toLowerCase();
  if (t.includes("aloj")) return defaultServiceImages.alojamiento;
  if (t.includes("rest")) return defaultServiceImages.restaurante;
  if (t.includes("trans")) return defaultServiceImages.transporte;
  if (t.includes("exper")) return defaultServiceImages.experiencia;
  return defaultServiceImages.default;
};

const ServiceCard = ({ service }) => {
  const { fetchServicePhotos, servicePhotos } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [photosLoaded, setPhotosLoaded] = useState(false);

  // Cargar fotos reales del servicio de manera segura
  useEffect(() => {
    const loadPhotos = async () => {
      const serviceId = service.id_servicio;

      if (!serviceId || photosLoaded) return;

      // Verificar si ya tenemos las fotos en el contexto
      if (servicePhotos[serviceId]) {
        setImages(servicePhotos[serviceId]);
        setPhotosLoaded(true);
        return;
      }

      // Cargar fotos desde la API
      setLoadingPhotos(true);
      try {
        const photos = await fetchServicePhotos(serviceId);
        if (photos && photos.length > 0) {
          setImages(photos);
        } else {
          // Usar imagen temática si no hay fotos
          setImages([getDefaultImage(service.tipo_servicio)]);
        }
        setPhotosLoaded(true);
      } catch (error) {
        console.error("Error loading photos:", error);
        setImages([getDefaultImage(service.tipo_servicio)]);
        setPhotosLoaded(true);
      } finally {
        setLoadingPhotos(false);
      }
    };

    loadPhotos();
  }, [
    service.id_servicio,
    service.tipo_servicio,
    fetchServicePhotos,
    servicePhotos,
    photosLoaded,
  ]);

  // El agregado al carrito se realiza únicamente desde el modal de detalles
  // para capturar información adicional (personas, fechas, horario).

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const getServiceTypeIcon = (type) => {
    switch (type) {
      case "alojamiento":
        return "🏨";
      case "restaurante":
        return "🍽️";
      case "Transporte":
        return "🚗";
      case "Experiencia":
        return "🎯";
      default:
        return "📍";
    }
  };

  const getServiceTypeColor = (type) => {
    switch (type) {
      case "alojamiento":
        return "bg-reservat-primary";
      case "restaurante":
        return "bg-reservat-orange";
      case "Transporte":
        return "bg-reservat-pink";
      case "Experiencia":
        return "bg-success";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <>
      <div className="card overflow-hidden group">
        {/* Image Carousel */}
        <div className="relative h-48 overflow-hidden">
          {loadingPhotos ? (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-reservat-primary"></div>
              <span className="ml-2 text-sm text-gray-600">
                Cargando fotos...
              </span>
            </div>
          ) : (
            <img
              src={
                images[currentImageIndex] ||
                getDefaultImage(service.tipo_servicio)
              }
              alt={service.nombre}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                // Prevenir bucle infinito: solo cambiar la imagen una vez
                if (!e.target.dataset.errorHandled) {
                  e.target.dataset.errorHandled = "true";
                  e.target.src = getDefaultImage(service.tipo_servicio);
                }
              }}
            />
          )}

          {/* Image Navigation */}
          {images.length > 1 && (
            <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={prevImage}
                className="bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 transition-all duration-200"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={nextImage}
                className="bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 transition-all duration-200"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Image Indicators */}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentImageIndex
                      ? "bg-white"
                      : "bg-white bg-opacity-50"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Service Type Badge */}
          <div className="absolute top-2 left-2">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getServiceTypeColor(service.tipo_servicio)}`}
            >
              <span className="mr-1">
                {getServiceTypeIcon(service.tipo_servicio)}
              </span>
              {service.tipo_servicio}
            </span>
          </div>

          {/* Relevance Badge */}
          {service.relevancia && (
            <div className="absolute top-2 right-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <Star className="w-3 h-3 mr-1" />
                {service.relevancia}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Header */}
          <div className="mb-3">
            <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
              {service.nombre}
            </h3>
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              <span>
                {service.ciudad}, {service.departamento}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-4 line-clamp-3">
            {service.descripcion}
          </p>

          {/* Price */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold text-reservat-primary">
                  ${service.precio?.toLocaleString()}
                </span>
                <span className="text-sm text-gray-500 ml-1">
                  {service.moneda}
                </span>
              </div>
              {service.fecha_creacion && (
                <div className="flex items-center text-xs text-gray-400">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>
                    {new Date(service.fecha_creacion).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex">
            <button
              onClick={() => setShowModal(true)}
              className="w-full btn-secondary flex items-center justify-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>Ver más detalles</span>
            </button>
          </div>
        </div>
      </div>

      {/* Service Modal */}
      {showModal && (
        <ServiceModal
          service={service}
          images={images}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default ServiceCard;
