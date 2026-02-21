import React, { useState, useEffect } from "react";
import { CheckCircle, Loader2, Sparkles } from "lucide-react";

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
    <div className="max-w-4xl mx-auto my-8 px-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden min-h-[500px] flex flex-col items-center justify-between p-8 md:p-12 relative border border-gray-100">
        {/* Fondo sutil (Light Mode) */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
          <div className="absolute top-[20%] -left-[10%] w-[50%] h-[50%] bg-orange-50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] bg-indigo-50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>
        </div>

        {/* Logo / Header */}
        <div className="z-10 w-full mb-8 flex items-center justify-center gap-2">
          <Sparkles className="h-6 w-6 text-reservat-primary" />
          <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-reservat-primary to-reservat-orange tracking-tight">
            ReservaT AI
          </h1>
        </div>

        {/* Contenido Principal (Spinner + Texto) */}
        <div className="z-10 flex flex-col items-center justify-center flex-1 w-full max-w-xl">
          <div className="relative w-28 h-28 mb-8 flex items-center justify-center bg-white/50 rounded-full shadow-sm backdrop-blur-sm">
            {currentStageIdx < STAGES.length - 1 ? (
              <>
                <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
                <div className="absolute inset-0 rounded-full border-4 border-reservat-primary border-t-transparent animate-spin"></div>
                <div className="absolute inset-3 rounded-full border-4 border-reservat-orange/30 border-b-transparent animate-spin-reverse delay-150"></div>
                <Loader2 className="h-10 w-10 text-reservat-primary animate-pulse" />
              </>
            ) : (
              <CheckCircle className="h-16 w-16 text-green-500 animate-bounce" />
            )}
          </div>

          <div className="text-center w-full">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3 tracking-tight leading-tight min-h-[4rem] flex justify-center items-center">
              {currentStage.main}
            </h2>
            <p className="text-gray-500 font-medium text-sm md:text-base h-6">
              {currentStage.sub}
            </p>
          </div>
        </div>

        {/* Historial de Progreso */}
        <div className="w-full max-w-xl z-10 mt-8 mb-10 overflow-hidden relative">
          {/* Faded edges para el log */}
          <div className="absolute top-0 w-full h-4 bg-gradient-to-b from-white to-transparent z-10"></div>
          <div className="absolute bottom-0 w-full h-4 bg-gradient-to-t from-white to-transparent z-10"></div>

          <ul className="space-y-3 py-2 px-1 max-h-32 overflow-y-auto hidden-scrollbar">
            {STAGES.slice(0, currentStageIdx).map((stage, idx) => (
              <li
                key={idx}
                className="flex items-center space-x-3 animate-fade-in opacity-80"
              >
                <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                <span className="text-sm font-medium text-gray-600 line-clamp-1">
                  {stage.main}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer Barra de Progreso */}
        <div className="w-full max-w-xl z-10 pt-6 border-t border-gray-100">
          <div className="flex justify-between items-end mb-3">
            <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">
              Procesando Solicitud
            </span>
            <span className="text-sm font-bold text-reservat-primary">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-reservat-primary to-reservat-orange h-full rounded-full transition-all ease-linear shadow-[0_0_10px_rgba(37,99,235,0.4)]"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PantallaSimulacion;
