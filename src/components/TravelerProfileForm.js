import React, { useState, useEffect } from "react";
import {
  User,
  Calendar,
  Users,
  Compass,
  Home,
  MapPin,
  Settings,
  FileText,
} from "lucide-react";

import PantallaSimulacion from "./PantallaSimulacion";
import VisorResultado from "./VisorResultado";

const INITIAL_STATE = {
  contacto: {
    nombre: "",
    telefono: "",
    email: "",
    ciudadOrigen: "",
    canalContacto: "",
  },
  viaje: {
    destinos: "",
    fechaSalida: "",
    fechaRegreso: "",
    duracionEstimada: "",
    flexibilidadFechas: null,
    motivoViaje: "",
  },
  grupoViajero: {
    tipoGrupo: "",
    totalViajeros: "",
    adultos: "",
    ninos: "",
    edadesNinos: "",
    adultosMayores: "",
    requerimientosEspeciales: "",
  },
  experiencia: {
    estiloViaje: [],
    nivelComodidad: "",
    ritmoViaje: "",
    amenidades: [],
  },
  alojamiento: {
    tipoAlojamiento: [],
    categoria: "",
    tipoHabitacion: "",
    numeroHabitaciones: "",
    preferenciasAdicionales: [],
  },
  transporte: {
    tipoTransporte: "",
    preferenciaHorario: "",
    trasladosInternos: null,
    puntoSalida: "",
    puntoLlegada: "",
  },
  condicionesOperativas: {
    nivelPrioridad: "",
    serviciosIncluir: [],
  },
  entregable: {
    tipoPropuesta: "",
    comentariosAdicionales: "",
  },
};

const TravelerProfileForm = () => {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState({});
  const [viewState, setViewState] = useState("formulario"); // 'formulario' | 'simulacion' | 'resultado'

  // Calcula la duración en días y noches
  useEffect(() => {
    const { fechaSalida, fechaRegreso } = formData.viaje;
    if (fechaSalida && fechaRegreso) {
      const start = new Date(fechaSalida);
      const end = new Date(fechaRegreso);

      if (end < start) {
        setErrors((prev) => ({
          ...prev,
          "viaje.fechaRegreso":
            "La fecha de regreso no puede ser anterior a la salida",
        }));
        setFormData((prev) => ({
          ...prev,
          viaje: { ...prev.viaje, duracionEstimada: "" },
        }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors["viaje.fechaRegreso"];
          return newErrors;
        });
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const noches = diffDays;
        const dias = diffDays + 1;
        setFormData((prev) => ({
          ...prev,
          viaje: {
            ...prev.viaje,
            duracionEstimada: `${dias} días / ${noches} noches`,
          },
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.viaje.fechaSalida, formData.viaje.fechaRegreso]);

  const handleChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
    // Limpiar error al editar
    if (errors[`${section}.${field}`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`${section}.${field}`];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (section, field, value) => {
    setFormData((prev) => {
      const currentList = prev[section][field];
      const newList = currentList.includes(value)
        ? currentList.filter((item) => item !== value)
        : [...currentList, value];
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: newList,
        },
      };
    });
    if (errors[`${section}.${field}`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`${section}.${field}`];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Helper para verificar campos requeridos
    const checkRequired = (section, fields) => {
      fields.forEach((f) => {
        const value = formData[section][f];
        if (
          value === "" ||
          value === null ||
          (Array.isArray(value) && value.length === 0)
        ) {
          newErrors[`${section}.${f}`] = "Este campo es requerido";
        }
      });
    };

    checkRequired("contacto", [
      "nombre",
      "telefono",
      "email",
      "ciudadOrigen",
      "canalContacto",
    ]);
    checkRequired("viaje", [
      "destinos",
      "fechaSalida",
      "fechaRegreso",
      "flexibilidadFechas",
      "motivoViaje",
    ]);

    checkRequired("grupoViajero", ["tipoGrupo", "totalViajeros", "adultos"]);

    const numNinos = parseInt(formData.grupoViajero.ninos || "0", 10);
    if (numNinos > 0 && !formData.grupoViajero.edadesNinos) {
      newErrors["grupoViajero.edadesNinos"] =
        "Debe indicar las edades de los niños";
    }

    checkRequired("experiencia", [
      "estiloViaje",
      "nivelComodidad",
      "ritmoViaje",
    ]);
    checkRequired("alojamiento", [
      "tipoAlojamiento",
      "categoria",
      "tipoHabitacion",
      "numeroHabitaciones",
    ]);
    checkRequired("transporte", [
      "tipoTransporte",
      "trasladosInternos",
      "puntoSalida",
      "puntoLlegada",
    ]);
    checkRequired("condicionesOperativas", ["nivelPrioridad"]);
    checkRequired("entregable", ["tipoPropuesta"]);

    // Validación extra: fecha regreso < salida ya se maneja en el useEffect,
    // pero agreguemos la verificación final
    if (formData.viaje.fechaSalida && formData.viaje.fechaRegreso) {
      if (
        new Date(formData.viaje.fechaRegreso) <
        new Date(formData.viaje.fechaSalida)
      ) {
        newErrors["viaje.fechaRegreso"] = "La fecha de regreso es inválida";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Cambio de estado a simulación en lugar de mensaje de éxito
      setViewState("simulacion");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Scroll to first error
      const firstError = document.querySelector(".error-text");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const SectionTitle = ({ title, icon: Icon }) => (
    <div className="flex items-center space-x-2 border-b border-gray-200 pb-2 mb-4 mt-6">
      {Icon && <Icon className="h-5 w-5 text-reservat-primary" />}
      <h2 className="text-lg font-bold text-gray-800">{title}</h2>
    </div>
  );

  const ErrorMsg = ({ section, field }) => {
    return errors[`${section}.${field}`] ? (
      <span className="text-red-500 text-xs mt-1 block error-text">
        {errors[`${section}.${field}`]}
      </span>
    ) : null;
  };

  if (viewState === "simulacion") {
    return (
      <PantallaSimulacion
        onComplete={() => {
          setViewState("resultado");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    );
  }

  if (viewState === "resultado") {
    return (
      <VisorResultado
        data={formData}
        onNewQuery={() => {
          setFormData(INITIAL_STATE);
          setViewState("formulario");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-8 px-4">
      <div className="bg-white rounded-xl shadow-medium p-6 md:p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-reservat-primary mb-2">
            Perfilamiento del Viajero
          </h1>
          <p className="text-sm text-gray-500">
            Diligencia el siguiente formulario para que podamos diseñar la mejor
            experiencia de viaje para ti.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">
          {/* SECCIÓN 1 */}
          <section>
            <SectionTitle title="1. Datos del Cliente y Contacto" icon={User} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo o razón social *
                </label>
                <input
                  type="text"
                  className={`input-field py-1.5 ${errors["contacto.nombre"] ? "border-red-500" : ""}`}
                  value={formData.contacto.nombre}
                  onChange={(e) =>
                    handleChange("contacto", "nombre", e.target.value)
                  }
                />
                <ErrorMsg section="contacto" field="nombre" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono (WhatsApp) *
                </label>
                <input
                  type="tel"
                  className={`input-field py-1.5 ${errors["contacto.telefono"] ? "border-red-500" : ""}`}
                  value={formData.contacto.telefono}
                  onChange={(e) =>
                    handleChange("contacto", "telefono", e.target.value)
                  }
                />
                <ErrorMsg section="contacto" field="telefono" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico *
                </label>
                <input
                  type="email"
                  className={`input-field py-1.5 ${errors["contacto.email"] ? "border-red-500" : ""}`}
                  value={formData.contacto.email}
                  onChange={(e) =>
                    handleChange("contacto", "email", e.target.value)
                  }
                />
                <ErrorMsg section="contacto" field="email" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ciudad de origen *
                </label>
                <input
                  type="text"
                  className={`input-field py-1.5 ${errors["contacto.ciudadOrigen"] ? "border-red-500" : ""}`}
                  value={formData.contacto.ciudadOrigen}
                  onChange={(e) =>
                    handleChange("contacto", "ciudadOrigen", e.target.value)
                  }
                />
                <ErrorMsg section="contacto" field="ciudadOrigen" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Canal de contacto *
                </label>
                <select
                  className={`input-field py-1.5 ${errors["contacto.canalContacto"] ? "border-red-500" : ""}`}
                  value={formData.contacto.canalContacto}
                  onChange={(e) =>
                    handleChange("contacto", "canalContacto", e.target.value)
                  }
                >
                  <option value="">Seleccione...</option>
                  <option value="Oficina">Oficina</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Web">Web</option>
                  <option value="Referido">Referido</option>
                </select>
                <ErrorMsg section="contacto" field="canalContacto" />
              </div>
            </div>
          </section>

          {/* SECCIÓN 2 */}
          <section>
            <SectionTitle title="2. Información del Viaje" icon={Calendar} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Destino(s) de interés *
                </label>
                <input
                  type="text"
                  className={`input-field py-1.5 ${errors["viaje.destinos"] ? "border-red-500" : ""}`}
                  value={formData.viaje.destinos}
                  onChange={(e) =>
                    handleChange("viaje", "destinos", e.target.value)
                  }
                />
                <ErrorMsg section="viaje" field="destinos" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de salida *
                </label>
                <input
                  type="date"
                  className={`input-field py-1.5 ${errors["viaje.fechaSalida"] ? "border-red-500" : ""}`}
                  value={formData.viaje.fechaSalida}
                  onChange={(e) =>
                    handleChange("viaje", "fechaSalida", e.target.value)
                  }
                />
                <ErrorMsg section="viaje" field="fechaSalida" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de regreso *
                </label>
                <input
                  type="date"
                  min={formData.viaje.fechaSalida || undefined}
                  className={`input-field py-1.5 ${errors["viaje.fechaRegreso"] ? "border-red-500" : ""}`}
                  value={formData.viaje.fechaRegreso}
                  onChange={(e) =>
                    handleChange("viaje", "fechaRegreso", e.target.value)
                  }
                />
                <ErrorMsg section="viaje" field="fechaRegreso" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duración estimada
                </label>
                <input
                  type="text"
                  className="input-field py-1.5 bg-gray-50 text-gray-500 cursor-not-allowed"
                  value={formData.viaje.duracionEstimada}
                  readOnly
                  placeholder="Se calcula automáticamente"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo del viaje *
                </label>
                <select
                  className={`input-field py-1.5 ${errors["viaje.motivoViaje"] ? "border-red-500" : ""}`}
                  value={formData.viaje.motivoViaje}
                  onChange={(e) =>
                    handleChange("viaje", "motivoViaje", e.target.value)
                  }
                >
                  <option value="">Seleccione...</option>
                  <option value="Vacaciones">Vacaciones</option>
                  <option value="Descanso">Descanso</option>
                  <option value="Cumpleaños">Cumpleaños</option>
                  <option value="Luna de miel">Luna de miel</option>
                  <option value="Empresarial">Empresarial</option>
                  <option value="Otro">Otro</option>
                </select>
                <ErrorMsg section="viaje" field="motivoViaje" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ¿Tiene flexibilidad de fechas? *
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-1 cursor-pointer">
                    <input
                      type="radio"
                      name="flexibilidad"
                      checked={formData.viaje.flexibilidadFechas === true}
                      onChange={() =>
                        handleChange("viaje", "flexibilidadFechas", true)
                      }
                      className="text-reservat-primary focus:ring-reservat-primary"
                    />
                    <span className="text-sm">Sí</span>
                  </label>
                  <label className="flex items-center space-x-1 cursor-pointer">
                    <input
                      type="radio"
                      name="flexibilidad"
                      checked={formData.viaje.flexibilidadFechas === false}
                      onChange={() =>
                        handleChange("viaje", "flexibilidadFechas", false)
                      }
                      className="text-reservat-primary focus:ring-reservat-primary"
                    />
                    <span className="text-sm">No</span>
                  </label>
                </div>
                <ErrorMsg section="viaje" field="flexibilidadFechas" />
              </div>
            </div>
          </section>

          {/* SECCIÓN 3 */}
          <section>
            <SectionTitle title="3. Perfil del Grupo Viajero" icon={Users} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de grupo *
                </label>
                <select
                  className={`input-field py-1.5 ${errors["grupoViajero.tipoGrupo"] ? "border-red-500" : ""}`}
                  value={formData.grupoViajero.tipoGrupo}
                  onChange={(e) =>
                    handleChange("grupoViajero", "tipoGrupo", e.target.value)
                  }
                >
                  <option value="">Seleccione...</option>
                  <option value="Individual">Individual</option>
                  <option value="Pareja">Pareja</option>
                  <option value="Familia">Familia</option>
                  <option value="Grupo">Grupo</option>
                  <option value="Corporativo">Corporativo</option>
                </select>
                <ErrorMsg section="grupoViajero" field="tipoGrupo" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total de viajeros *
                </label>
                <input
                  type="number"
                  min="1"
                  className={`input-field py-1.5 ${errors["grupoViajero.totalViajeros"] ? "border-red-500" : ""}`}
                  value={formData.grupoViajero.totalViajeros}
                  onChange={(e) =>
                    handleChange(
                      "grupoViajero",
                      "totalViajeros",
                      e.target.value,
                    )
                  }
                />
                <ErrorMsg section="grupoViajero" field="totalViajeros" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  N° Adultos *
                </label>
                <input
                  type="number"
                  min="0"
                  className={`input-field py-1.5 ${errors["grupoViajero.adultos"] ? "border-red-500" : ""}`}
                  value={formData.grupoViajero.adultos}
                  onChange={(e) =>
                    handleChange("grupoViajero", "adultos", e.target.value)
                  }
                />
                <ErrorMsg section="grupoViajero" field="adultos" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  N° Niños
                </label>
                <input
                  type="number"
                  min="0"
                  className="input-field py-1.5"
                  value={formData.grupoViajero.ninos}
                  onChange={(e) =>
                    handleChange("grupoViajero", "ninos", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  N° Adultos mayores
                </label>
                <input
                  type="number"
                  min="0"
                  className="input-field py-1.5"
                  value={formData.grupoViajero.adultosMayores}
                  onChange={(e) =>
                    handleChange(
                      "grupoViajero",
                      "adultosMayores",
                      e.target.value,
                    )
                  }
                />
              </div>
              {parseInt(formData.grupoViajero.ninos || "0", 10) > 0 && (
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Edades de los niños *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. 5, 8 y 12 años"
                    className={`input-field py-1.5 ${errors["grupoViajero.edadesNinos"] ? "border-red-500" : ""}`}
                    value={formData.grupoViajero.edadesNinos}
                    onChange={(e) =>
                      handleChange(
                        "grupoViajero",
                        "edadesNinos",
                        e.target.value,
                      )
                    }
                  />
                  <ErrorMsg section="grupoViajero" field="edadesNinos" />
                </div>
              )}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requerimientos especiales
                </label>
                <textarea
                  className="input-field py-1.5 resize-none h-16"
                  placeholder="Alergias, movilidad reducida, dietas, etc."
                  value={formData.grupoViajero.requerimientosEspeciales}
                  onChange={(e) =>
                    handleChange(
                      "grupoViajero",
                      "requerimientosEspeciales",
                      e.target.value,
                    )
                  }
                />
              </div>
            </div>
          </section>

          {/* SECCIÓN 4 */}
          <section>
            <SectionTitle
              title="4. Preferencias de Experiencia"
              icon={Compass}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estilo de viaje *
                </label>
                <div className="space-y-1">
                  {[
                    "Descanso",
                    "Aventura",
                    "Cultural",
                    "Naturaleza",
                    "Playa",
                    "Mixto",
                  ].map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center space-x-2 text-sm cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.experiencia.estiloViaje.includes(opt)}
                        onChange={() =>
                          handleCheckboxChange(
                            "experiencia",
                            "estiloViaje",
                            opt,
                          )
                        }
                        className="rounded text-reservat-primary focus:ring-reservat-primary"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
                <ErrorMsg section="experiencia" field="estiloViaje" />
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nivel de comodidad *
                  </label>
                  <div className="flex space-x-4">
                    {["Básico", "Medio", "Alto"].map((opt) => (
                      <label
                        key={opt}
                        className="flex items-center space-x-1 text-sm cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="comodidad"
                          checked={formData.experiencia.nivelComodidad === opt}
                          onChange={() =>
                            handleChange("experiencia", "nivelComodidad", opt)
                          }
                          className="text-reservat-primary focus:ring-reservat-primary"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                  <ErrorMsg section="experiencia" field="nivelComodidad" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ritmo del viaje *
                  </label>
                  <div className="flex space-x-4">
                    {["Tranquilo", "Equilibrado", "Intenso"].map((opt) => (
                      <label
                        key={opt}
                        className="flex items-center space-x-1 text-sm cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="ritmo"
                          checked={formData.experiencia.ritmoViaje === opt}
                          onChange={() =>
                            handleChange("experiencia", "ritmoViaje", opt)
                          }
                          className="text-reservat-primary focus:ring-reservat-primary"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                  <ErrorMsg section="experiencia" field="ritmoViaje" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amenidades de interés
                </label>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                  {[
                    "Spa",
                    "Piscina",
                    "Gastronomía",
                    "Vida nocturna",
                    "Actividades al aire libre",
                  ].map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center space-x-2 text-sm cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.experiencia.amenidades.includes(opt)}
                        onChange={() =>
                          handleCheckboxChange("experiencia", "amenidades", opt)
                        }
                        className="rounded text-reservat-primary focus:ring-reservat-primary"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* SECCIÓN 5 */}
          <section>
            <SectionTitle title="5. Preferencias de Alojamiento" icon={Home} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de alojamiento *
                </label>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    "Hotel",
                    "Cabaña",
                    "Finca",
                    "Glamping",
                    "Apartamento",
                    "Hostal",
                  ].map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center space-x-2 text-sm cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.alojamiento.tipoAlojamiento.includes(
                          opt,
                        )}
                        onChange={() =>
                          handleCheckboxChange(
                            "alojamiento",
                            "tipoAlojamiento",
                            opt,
                          )
                        }
                        className="rounded text-reservat-primary focus:ring-reservat-primary"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
                <ErrorMsg section="alojamiento" field="tipoAlojamiento" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría *
                </label>
                <div className="space-y-1">
                  {["Económica", "Estándar", "Premium"].map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center space-x-2 text-sm cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="categoria"
                        checked={formData.alojamiento.categoria === opt}
                        onChange={() =>
                          handleChange("alojamiento", "categoria", opt)
                        }
                        className="text-reservat-primary focus:ring-reservat-primary"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
                <ErrorMsg section="alojamiento" field="categoria" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de habitación *
                </label>
                <select
                  className={`input-field py-1.5 ${errors["alojamiento.tipoHabitacion"] ? "border-red-500" : ""}`}
                  value={formData.alojamiento.tipoHabitacion}
                  onChange={(e) =>
                    handleChange(
                      "alojamiento",
                      "tipoHabitacion",
                      e.target.value,
                    )
                  }
                >
                  <option value="">Seleccione...</option>
                  <option value="Sencilla">Sencilla</option>
                  <option value="Doble">Doble</option>
                  <option value="Múltiple">Múltiple</option>
                </select>
                <ErrorMsg section="alojamiento" field="tipoHabitacion" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  N° de habitaciones *
                </label>
                <input
                  type="number"
                  min="1"
                  className={`input-field py-1.5 ${errors["alojamiento.numeroHabitaciones"] ? "border-red-500" : ""}`}
                  value={formData.alojamiento.numeroHabitaciones}
                  onChange={(e) =>
                    handleChange(
                      "alojamiento",
                      "numeroHabitaciones",
                      e.target.value,
                    )
                  }
                />
                <ErrorMsg section="alojamiento" field="numeroHabitaciones" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferencias adicionales
                </label>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                  {[
                    "Ubicación central",
                    "Piscina",
                    "Desayuno incluido",
                    "Accesibilidad",
                    "Parqueadero",
                  ].map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center space-x-2 text-sm cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.alojamiento.preferenciasAdicionales.includes(
                          opt,
                        )}
                        onChange={() =>
                          handleCheckboxChange(
                            "alojamiento",
                            "preferenciasAdicionales",
                            opt,
                          )
                        }
                        className="rounded text-reservat-primary focus:ring-reservat-primary"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* SECCIÓN 6 */}
          <section>
            <SectionTitle title="6. Transporte y Logística" icon={MapPin} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de transporte principal *
                </label>
                <div className="flex space-x-4">
                  {["Terrestre", "Aéreo", "Mixto"].map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center space-x-1 text-sm cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="tipoTransporte"
                        checked={formData.transporte.tipoTransporte === opt}
                        onChange={() =>
                          handleChange("transporte", "tipoTransporte", opt)
                        }
                        className="text-reservat-primary focus:ring-reservat-primary"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
                <ErrorMsg section="transporte" field="tipoTransporte" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Traslados internos requeridos *
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-1 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="trasladosInternos"
                      checked={formData.transporte.trasladosInternos === true}
                      onChange={() =>
                        handleChange("transporte", "trasladosInternos", true)
                      }
                      className="text-reservat-primary focus:ring-reservat-primary"
                    />
                    <span>Sí</span>
                  </label>
                  <label className="flex items-center space-x-1 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="trasladosInternos"
                      checked={formData.transporte.trasladosInternos === false}
                      onChange={() =>
                        handleChange("transporte", "trasladosInternos", false)
                      }
                      className="text-reservat-primary focus:ring-reservat-primary"
                    />
                    <span>No</span>
                  </label>
                </div>
                <ErrorMsg section="transporte" field="trasladosInternos" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Punto de salida *
                </label>
                <input
                  type="text"
                  className={`input-field py-1.5 ${errors["transporte.puntoSalida"] ? "border-red-500" : ""}`}
                  value={formData.transporte.puntoSalida}
                  onChange={(e) =>
                    handleChange("transporte", "puntoSalida", e.target.value)
                  }
                />
                <ErrorMsg section="transporte" field="puntoSalida" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Punto de llegada *
                </label>
                <input
                  type="text"
                  className={`input-field py-1.5 ${errors["transporte.puntoLlegada"] ? "border-red-500" : ""}`}
                  value={formData.transporte.puntoLlegada}
                  onChange={(e) =>
                    handleChange("transporte", "puntoLlegada", e.target.value)
                  }
                />
                <ErrorMsg section="transporte" field="puntoLlegada" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferencia de horario
                </label>
                <div className="flex flex-wrap gap-4">
                  {["Mañana", "Tarde", "Noche", "Sin preferencia"].map(
                    (opt) => (
                      <label
                        key={opt}
                        className="flex items-center space-x-1 text-sm cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="preferenciaHorario"
                          checked={
                            formData.transporte.preferenciaHorario === opt
                          }
                          onChange={() =>
                            handleChange(
                              "transporte",
                              "preferenciaHorario",
                              opt,
                            )
                          }
                          className="text-reservat-primary focus:ring-reservat-primary"
                        />
                        <span>{opt}</span>
                      </label>
                    ),
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* SECCIÓN 7 */}
          <section>
            <SectionTitle title="7. Condiciones Operativas" icon={Settings} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nivel de prioridad *
                </label>
                <div className="space-y-1">
                  {["Lo más económico", "Equilibrado", "Mejor experiencia"].map(
                    (opt) => (
                      <label
                        key={opt}
                        className="flex items-center space-x-2 text-sm cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="nivelPrioridad"
                          checked={
                            formData.condicionesOperativas.nivelPrioridad ===
                            opt
                          }
                          onChange={() =>
                            handleChange(
                              "condicionesOperativas",
                              "nivelPrioridad",
                              opt,
                            )
                          }
                          className="text-reservat-primary focus:ring-reservat-primary"
                        />
                        <span>{opt}</span>
                      </label>
                    ),
                  )}
                </div>
                <ErrorMsg
                  section="condicionesOperativas"
                  field="nivelPrioridad"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Servicios a incluir
                </label>
                <div className="grid grid-cols-1 gap-1">
                  {[
                    "Guianza",
                    "Entradas a atracciones",
                    "Seguro de viaje",
                    "Asistencia médica",
                    "Sesión de fotos",
                    "Otro",
                  ].map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center space-x-2 text-sm cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.condicionesOperativas.serviciosIncluir.includes(
                          opt,
                        )}
                        onChange={() =>
                          handleCheckboxChange(
                            "condicionesOperativas",
                            "serviciosIncluir",
                            opt,
                          )
                        }
                        className="rounded text-reservat-primary focus:ring-reservat-primary"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* SECCIÓN 8 */}
          <section>
            <SectionTitle
              title="8. Formato del Entregable Esperado"
              icon={FileText}
            />
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de propuesta deseada *
                </label>
                <div className="space-y-1">
                  {[
                    "1 paquete recomendado",
                    "2–3 alternativas: Eco–Estándar–Premium",
                  ].map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center space-x-2 text-sm cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="tipoPropuesta"
                        checked={formData.entregable.tipoPropuesta === opt}
                        onChange={() =>
                          handleChange("entregable", "tipoPropuesta", opt)
                        }
                        className="text-reservat-primary focus:ring-reservat-primary"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
                <ErrorMsg section="entregable" field="tipoPropuesta" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comentarios adicionales
                </label>
                <textarea
                  className="input-field py-1.5 resize-none h-20"
                  placeholder="Escriba aquí cualquier información adicional..."
                  value={formData.entregable.comentariosAdicionales}
                  onChange={(e) =>
                    handleChange(
                      "entregable",
                      "comentariosAdicionales",
                      e.target.value,
                    )
                  }
                />
              </div>
            </div>
          </section>

          <div className="mt-8 pt-4 border-t border-gray-100 text-center">
            {Object.keys(errors).length > 0 && (
              <p className="text-red-500 font-medium mb-3 text-sm">
                Por favor, complete todos los campos requeridos correctamente.
              </p>
            )}
            <button
              type="submit"
              className="btn-primary w-full md:w-1/2 py-3 text-lg font-bold"
            >
              Enviar Solicitud
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TravelerProfileForm;
