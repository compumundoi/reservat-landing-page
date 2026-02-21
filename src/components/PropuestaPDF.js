import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Register custom font for more professional look if desired, or use default standard fonts
Font.register({
  family: "Roboto",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
});
Font.register({
  family: "Roboto-Medium",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf",
});

const primaryColor = "#2563EB"; // Blue-600
const orangeAccent = "#F97316";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 40,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 2,
    borderBottomColor: primaryColor,
    paddingBottom: 20,
    marginBottom: 20,
  },
  logoText: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: primaryColor,
    letterSpacing: 1,
  },
  titleContainer: {
    alignItems: "flex-end",
  },
  title: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 10,
    color: "#666",
    marginTop: 4,
  },
  note: {
    fontSize: 9,
    fontStyle: "italic",
    color: "#888",
    marginTop: 4,
    maxWidth: 250,
    textAlign: "right",
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: primaryColor,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 4,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    marginBottom: 4,
  },
  col2: {
    width: "50%",
    paddingRight: 10,
  },
  col3: {
    width: "33.33%",
    paddingRight: 10,
  },
  label: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#6B7280",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  value: {
    fontSize: 11,
    color: "#111827",
    marginBottom: 8,
  },
  pillContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  pill: {
    backgroundColor: "#EFF6FF",
    color: primaryColor,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 9,
    marginRight: 4,
    marginBottom: 4,
  },
  pillOrange: {
    backgroundColor: "#FFF7ED",
    color: orangeAccent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 9,
    marginRight: 4,
    marginBottom: 4,
  },
  itineraryCard: {
    backgroundColor: "#F9FAFB",
    borderLeftWidth: 3,
    borderLeftColor: primaryColor,
    padding: 10,
    marginBottom: 8,
  },
  itineraryDay: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  itineraryDesc: {
    fontSize: 10,
    color: "#4B5563",
    lineHeight: 1.4,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 9,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  bulletList: {
    marginLeft: 10,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 4,
  },
  bulletPoint: {
    width: 10,
    fontSize: 10,
    color: primaryColor,
  },
  bulletText: {
    fontSize: 10,
    color: "#374151",
  },
});

// Helper component
const DataField = ({ label, value }) => (
  <View style={{ marginBottom: 6 }}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value || "No especificado"}</Text>
  </View>
);

const PillList = ({ items, useOrange = false }) => {
  if (!items || items.length === 0)
    return <Text style={styles.value}>Ninguno seleccionado</Text>;
  return (
    <View style={styles.pillContainer}>
      {items.map((item, i) => (
        <Text key={i} style={useOrange ? styles.pillOrange : styles.pill}>
          {item}
        </Text>
      ))}
    </View>
  );
};

export const PropuestaPDF = ({ data }) => {
  const date = new Date().toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Calculate N days for fake itinerary based on duration string
  // Formato ej: "5 días / 4 noches"
  let numDays = 3; // default
  if (data.viaje.duracionEstimada) {
    const match = data.viaje.duracionEstimada.match(/(\d+)\s*días/);
    if (match) numDays = parseInt(match[1], 10);
  }

  // Generación de itinerario simulado
  const itinerario = Array.from({ length: Math.min(numDays, 14) }).map(
    (_, i) => {
      let dayTitle = `Día ${i + 1} – Exploración en ${data.viaje.destinos || "Destino"}`;
      let desc = `Actividades programadas basadas en el estilo ${data.experiencia.estiloViaje.join(", ") || "elegido"} y ritmo ${data.experiencia.ritmoViaje || "de viaje"}.`;

      if (i === 0) {
        dayTitle = `Día 1 – Llegada y Bienvenida`;
        desc = `Recepción en el punto de llegada (${data.transporte.puntoLlegada || "destino"}), entrega de indicaciones y tiempo libre para aclimatación.`;
      } else if (i === numDays - 1) {
        dayTitle = `Día ${numDays} – Despedida y Retorno`;
        desc = `Check-out de alojamiento y traslado hacia el punto de salida (${data.transporte.puntoSalida || "origen"}). Fin de nuestros servicios.`;
      }

      if (data.viaje.motivoViaje === "Luna de miel") {
        desc = `Experiencia romántica especialmente diseñada para parejas, combinando intimidad y descubrimientos memorables.`;
      }

      return { dayTitle, desc };
    },
  );

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* 1. Header */}
        <View style={styles.header}>
          <Text style={styles.logoText}>ReservaT</Text>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Propuesta de Paquete Turístico</Text>
            <Text style={styles.subtitle}>
              Emitido para: {data.contacto.nombre}
            </Text>
            <Text style={styles.subtitle}>Fecha: {date}</Text>
            <Text style={styles.note}>
              Este documento es informativo. Los precios y disponibilidad están
              sujetos a confirmación por parte de la agencia.
            </Text>
          </View>
        </View>

        {/* 2. Resumen del Viajero */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen del Viaje</Text>
          <View style={styles.row}>
            <View style={styles.col2}>
              <DataField label="Destino(s)" value={data.viaje.destinos} />
              <DataField
                label="Fechas de Viaje"
                value={`${data.viaje.fechaSalida} al ${data.viaje.fechaRegreso}`}
              />
              <DataField
                label="Duración Estimada"
                value={data.viaje.duracionEstimada}
              />
            </View>
            <View style={styles.col2}>
              <DataField
                label="Ciudad de Origen"
                value={data.contacto.ciudadOrigen}
              />
              <DataField
                label="Motivo del Viaje"
                value={data.viaje.motivoViaje}
              />
              <DataField
                label="Composición del Grupo"
                value={`${data.grupoViajero.tipoGrupo}: ${data.grupoViajero.adultos} adultos, ${data.grupoViajero.ninos || "0"} niños`}
              />
            </View>
          </View>
        </View>

        {/* 3. Perfil de Preferencias */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Perfil y Preferencias</Text>
          <View style={styles.row}>
            <View style={styles.col3}>
              <Text style={styles.label}>Nivel de Comodidad</Text>
              <Text style={styles.value}>
                {data.experiencia.nivelComodidad || "No especificado"}
              </Text>
            </View>
            <View style={styles.col3}>
              <Text style={styles.label}>Ritmo de Viaje</Text>
              <Text style={styles.value}>
                {data.experiencia.ritmoViaje || "No especificado"}
              </Text>
            </View>
            <View style={styles.col3}>
              <Text style={styles.label}>Estilo de Viaje</Text>
              <PillList items={data.experiencia.estiloViaje} />
            </View>
          </View>
          {data.experiencia.amenidades.length > 0 && (
            <View style={{ marginTop: 4 }}>
              <Text style={styles.label}>Amenidades Deseadas</Text>
              <PillList items={data.experiencia.amenidades} useOrange={true} />
            </View>
          )}
        </View>

        {/* 4. Alojamiento */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Propuesta de Alojamiento</Text>
          <View style={styles.row}>
            <View style={styles.col3}>
              <Text style={styles.label}>Tipos Preferidos</Text>
              <PillList items={data.alojamiento.tipoAlojamiento} />
            </View>
            <View style={styles.col3}>
              <DataField label="Categoría" value={data.alojamiento.categoria} />
              <DataField
                label="Tipo de Habitación"
                value={data.alojamiento.tipoHabitacion}
              />
            </View>
            <View style={styles.col3}>
              <DataField
                label="Total Habitaciones"
                value={data.alojamiento.numeroHabitaciones}
              />
            </View>
          </View>
          {data.alojamiento.preferenciasAdicionales.length > 0 && (
            <View style={{ marginTop: 4 }}>
              <Text style={styles.label}>Extras de Alojamiento</Text>
              <Text style={styles.value}>
                {data.alojamiento.preferenciasAdicionales.join(" • ")}
              </Text>
            </View>
          )}
        </View>

        {/* 5. Transporte */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transporte y Logística</Text>
          <View style={styles.row}>
            <View style={styles.col2}>
              <DataField
                label="Ruta Principal"
                value={`${data.transporte.puntoSalida} ➔ ${data.transporte.puntoLlegada}`}
              />
              <DataField
                label="Medio de Transporte"
                value={data.transporte.tipoTransporte}
              />
            </View>
            <View style={styles.col2}>
              <DataField
                label="Preferencia Horario"
                value={data.transporte.preferenciaHorario}
              />
              <DataField
                label="Traslados Internos"
                value={
                  data.transporte.trasladosInternos === true
                    ? "Requeridos"
                    : data.transporte.trasladosInternos === false
                      ? "No requeridos"
                      : "No especificado"
                }
              />
            </View>
          </View>
        </View>

        {/* 6. Itinerario (Salto a nueva página de ser necesario, React PDF lo maneja pero aseguramos) */}
        <View style={styles.section} break={false}>
          <Text style={styles.sectionTitle}>Itinerario Sugerido</Text>
          {itinerario.map((day, idx) => (
            <View key={idx} style={styles.itineraryCard} wrap={false}>
              <Text style={styles.itineraryDay}>{day.dayTitle}</Text>
              <Text style={styles.itineraryDesc}>{day.desc}</Text>
            </View>
          ))}
        </View>

        {/* 7. Servicios & 8. Condiciones */}
        <View style={styles.section} break={false}>
          <Text style={styles.sectionTitle}>Condiciones de la Oferta</Text>
          <View style={styles.row}>
            <View style={styles.col2}>
              <Text style={styles.label}>
                Servicios Adicionales Seleccionados
              </Text>
              <View style={styles.bulletList}>
                {data.condicionesOperativas.serviciosIncluir.length > 0 ? (
                  data.condicionesOperativas.serviciosIncluir.map((s, i) => (
                    <View key={i} style={styles.bulletItem}>
                      <Text style={styles.bulletPoint}>•</Text>
                      <Text style={styles.bulletText}>{s}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.value}>Ninguno seleccionado</Text>
                )}
              </View>
            </View>
            <View style={styles.col2}>
              <DataField
                label="Nivel de Prioridad del Cliente"
                value={data.condicionesOperativas.nivelPrioridad}
              />
              <DataField
                label="Formato Deseado"
                value={data.entregable.tipoPropuesta}
              />
            </View>
          </View>

          <Text
            style={{
              maxWidth: "100%",
              textAlign: "left",
              marginTop: 15,
              color: primaryColor,
              fontFamily: "Helvetica-Bold",
              fontSize: 10,
            }}
          >
            Un asesor de Reservat se pondrá en contacto contigo muy pronto con
            tu número celular registrado ({data.contacto.telefono}) para
            conversar sobre estas alternativas y confirmar disponibilidad y
            tarifas vigentes.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Reservat Agencia de Viajes</Text>
          <Text>www.reservat.com • WhatsApp: +57 321 000 0000</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Página ${pageNumber} de ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
};
