import React from "react";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import { PropuestaPDF } from "./PropuestaPDF";
import { Download, RefreshCw, FileCheck } from "lucide-react";

export const VisorResultado = ({ data, onNewQuery }) => {
  return (
    <div className="max-w-6xl mx-auto my-8 px-4 animate-fade-in">
      {/* Barra de Acciones */}
      <div className="bg-white rounded-t-xl shadow-medium p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <FileCheck className="h-6 w-6 text-green-500" />
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">
            Tu propuesta está lista
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <PDFDownloadLink
            document={<PropuestaPDF data={data} />}
            fileName={`Propuesta_Reservat_${data.contacto.nombre.replace(/\s+/g, "_")}.pdf`}
            className="w-full sm:w-auto"
          >
            {({ loading }) => (
              <button
                disabled={loading}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow hover:shadow-md ${
                  loading
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-reservat-primary text-white hover:bg-blue-700"
                }`}
              >
                <Download className="h-4 w-4" />
                {loading ? "Generando PDF..." : "Descargar PDF"}
              </button>
            )}
          </PDFDownloadLink>

          <button
            onClick={onNewQuery}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200"
          >
            <RefreshCw className="h-4 w-4" />
            Nueva consulta
          </button>
        </div>
      </div>

      {/* Visor PDF */}
      <div className="bg-gray-100 rounded-b-xl shadow-medium overflow-hidden border border-gray-200">
        <PDFViewer
          width="100%"
          height="850px"
          className="border-none min-h-[85vh]"
        >
          <PropuestaPDF data={data} />
        </PDFViewer>
      </div>
    </div>
  );
};

export default VisorResultado;
