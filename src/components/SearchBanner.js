import React, { useState } from "react";
import { Search, MapPin, Filter, Star } from "lucide-react";
import { useApp } from "../context/AppContext";
import ServiceMap from "./ServiceMap";

const SearchBanner = () => {
  const { searchFilters, setSearchFilters, services } = useApp();
  const [showMap, setShowMap] = useState(false);

  const handleSearchChange = (field, value) => {
    setSearchFilters({ [field]: value });
  };

  const cities = [
    ...new Set(services.map((service) => service.ciudad).filter(Boolean)),
  ];
  const serviceTypes = [
    ...new Set(
      services.map((service) => service.tipo_servicio).filter(Boolean),
    ),
  ];

  return (
    <div
      className="relative bg-cover bg-center bg-no-repeat py-16 px-4"
      style={{
        backgroundImage: `linear-gradient(rgba(38, 61, 191, 0.8), rgba(46, 60, 140, 0.8)), url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Descubre Experiencias Únicas
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Encuentra los mejores servicios turísticos: hoteles, restaurantes,
            transporte y experiencias inolvidables
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-medium p-6 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Search Query */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                ¿Qué estás buscando?
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar servicios..."
                  value={searchFilters.query}
                  onChange={(e) => handleSearchChange("query", e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* City Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Ciudad
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={searchFilters.ciudad}
                  onChange={(e) => handleSearchChange("ciudad", e.target.value)}
                  className="input-field pl-10 appearance-none"
                >
                  <option value="">Todas las ciudades</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Service Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Tipo de servicio
              </label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={searchFilters.tipo_servicio}
                  onChange={(e) =>
                    handleSearchChange("tipo_servicio", e.target.value)
                  }
                  className="input-field pl-10 appearance-none"
                >
                  <option value="">Todos los servicios</option>
                  {serviceTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Relevance Filter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Relevancia
              </label>
              <div className="relative">
                <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={searchFilters.relevancia}
                  onChange={(e) =>
                    handleSearchChange("relevancia", e.target.value)
                  }
                  className="input-field pl-10 appearance-none"
                >
                  <option value="">Cualquier relevancia</option>
                  <option value="alta">Alta relevancia</option>
                  <option value="media">Media relevancia</option>
                  <option value="baja">Baja relevancia</option>
                </select>
              </div>
            </div>

            {/* Map Toggle */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowMap(!showMap)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  showMap
                    ? "bg-reservat-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <MapPin className="h-4 w-4" />
                <span>{showMap ? "Ocultar mapa" : "Ver en mapa"}</span>
              </button>
            </div>
          </div>

          {/* Map */}
          {showMap && (
            <div className="mt-6 animate-slide-up">
              <ServiceMap services={services} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchBanner;
