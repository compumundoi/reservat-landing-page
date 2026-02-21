import React, { useState, useEffect } from "react";
import { CheckCircle, Loader2 } from "lucide-react";

const STAGES = [
  {
    duration: 1500,
    main: "Analizando perfil del viajero...",
    sub: "Procesando preferencias, grupo y fechas del viaje",
  },
  {
    duration: 1500,
    main: "Explorando destinos disponibles...",
    sub: "Cruzando destino de interés con temporada y duración",
  },
  {
    duration: 1500,
    main: "Seleccionando opciones de alojamiento...",
    sub: "Filtrando por categoría, tipo y preferencias del grupo",
  },
  {
    duration: 1500,
    main: "Estructurando itinerario personalizado...",
    sub: "Organizando actividades según estilo y ritmo de viaje",
  },
  {
    duration: 1500,
    main: "Armando propuesta final...",
    sub: "Preparando el entregable con los mejores resultados",
  },
  {
    duration: 1000,
    main: "¡Propuesta lista!",
    sub: "Tu paquete turístico personalizado ha sido generado",
  },
];

const TOTAL_DURATION = STAGES.reduce((acc, stage) => acc + stage.duration, 0);

const PantallaSimulacion = ({ onComplete }) => {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Manejar el progreso de la barra y el porcentaje del 0 al 100%
    const updateInterval = 50; // actualizar cada 50ms
    const totalSteps = TOTAL_DURATION / updateInterval;
    let currentStep = 0;

    const progressTimer = setInterval(() => {
      currentStep++;
      const newProgress = Math.min((currentStep / totalSteps) * 100, 100);
      setProgress(newProgress);

      if (currentStep >= totalSteps) {
        clearInterval(progressTimer);
      }
    }, updateInterval);

    return () => clearInterval(progressTimer);
  }, []);

  useEffect(() => {
    // Manejar el avance de etapas secuencial
    if (currentStageIdx >= STAGES.length) {
      // Completado
      setTimeout(() => {
        onComplete();
      }, 500); // Pequeño delay de transición
      return;
    }

    const currentStageDuration = STAGES[currentStageIdx].duration;
    const stageTimer = setTimeout(() => {
      setCurrentStageIdx((prev) => prev + 1);
    }, currentStageDuration);

    return () => clearTimeout(stageTimer);
  }, [currentStageIdx, onComplete]);

  const currentStage = STAGES[currentStageIdx] || STAGES[STAGES.length - 1];

  return (
    <div className="max-w-4xl mx-auto my-8 px-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl p-8 md:p-12 text-white relative overflow-hidden h-[600px] flex flex-col items-center justify-center animate-slide-up">
        {/* Logo / Icono */}
        <div className="mb-8 absolute top-8 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-reservat-primary to-reservat-orange flex items-center gap-2">
          <span>ReservaT AI</span>
        </div>

        {/* Círculo pulsante y Mensaje Actual */}
        <div className="flex flex-col items-center z-10 w-full max-w-lg mb-12">
          <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
            {currentStageIdx < STAGES.length - 1 ? (
              <>
                <div className="absolute inset-0 rounded-full border-4 border-reservat-primary border-t-transparent animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-4 border-reservat-orange border-b-transparent animate-spin-reverse delay-150"></div>
                <Loader2 className="h-8 w-8 text-reservat-primary animate-pulse" />
              </>
            ) : (
              <CheckCircle className="h-16 w-16 text-green-400 animate-bounce" />
            )}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 min-h-[4rem] flex items-center">
            {currentStage.main}
          </h2>
          <p className="text-gray-400 text-center text-sm md:text-base h-6">
            {currentStage.sub}
          </p>
        </div>

        {/* Barra de Progreso */}
        <div className="w-full max-w-lg z-10 mb-8 mt-auto">
          <div className="flex justify-between text-xs font-semibold text-gray-400 mb-2">
            <span>PROCESANDO...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2 shadow-inner overflow-hidden">
            <div
              className="bg-gradient-to-r from-reservat-primary to-reservat-orange h-2 rounded-full transition-all ease-linear"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Log / Historial de etapas completadas */}
        <div className="w-full max-w-lg z-10 opacity-70">
          <ul className="space-y-3">
            {STAGES.slice(0, currentStageIdx).map((stage, idx) => (
              <li
                key={idx}
                className="flex items-center space-x-3 animate-fade-in"
              >
                <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />
                <span className="text-sm text-gray-300 font-medium line-clamp-1">
                  {stage.main}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Elementos decorativos de fondo */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-reservat-primary rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-32 -right-32 w-64 h-64 bg-reservat-orange rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/2 w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
    </div>
  );
};

export default PantallaSimulacion;
