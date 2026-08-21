import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, LogIn, Loader, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Swal from 'sweetalert2';

const LoginModal = ({ isOpen, onClose }) => {
  const { login, loading, authError, limpiarAuthError, ejecutarIntencionPendiente } = useApp();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  // Errores de validación del propio formulario, antes de llamar a la API.
  const [errorLocal, setErrorLocal] = useState('');

  // Un error de sesión pertenece al intento que lo produjo: al abrir el modal
  // otra vez se empieza limpio.
  useEffect(() => {
    if (isOpen) {
      setErrorLocal('');
      limpiarAuthError();
    }
    // limpiarAuthError es estable (viene del dispatch del contexto).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Corregir lo que se escribió mal borra el aviso: dejarlo ahí mientras el
    // usuario reescribe el correo sólo suma ruido.
    if (errorLocal) setErrorLocal('');
    if (authError) limpiarAuthError();
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setErrorLocal('Completa tu correo y tu contraseña');
      return;
    }

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      await Swal.fire({
        icon: 'success',
        title: '¡Bienvenido!',
        text: 'Has iniciado sesión correctamente',
        confirmButtonColor: '#263DBF',
        timer: 2000,
        showConfirmButton: false
      });
      setFormData({ email: '', password: '' });
      // Retomar lo que el usuario estaba haciendo cuando le pedimos la
      // sesión, antes de cerrar (cerrar descarta la intención pendiente).
      ejecutarIntencionPendiente();
      onClose();
    }
    // El fallo se muestra dentro del formulario (authError), no en otro modal
    // encima de éste.
  };

  if (!isOpen) return null;

  return (
    // z-[60]: el login siempre se abre por encima de otro modal (la ficha de
    // un servicio, el carrito), que usan z-50.
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60] animate-fade-in">
      <div className="bg-white rounded-xl max-w-md w-full p-6 animate-slide-up">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Iniciar Sesión</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Aviso de error: junto a los campos que hay que corregir */}
          {(errorLocal || authError) && (
            <div
              role="alert"
              className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-100"
            >
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">{errorLocal || authError}</p>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Correo electrónico
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="tu@email.com"
              className="input-field"
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="input-field pr-10"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full btn-primary group flex items-center justify-center space-x-2 transition-all duration-200 ${
              loading 
                ? 'opacity-75 cursor-not-allowed transform scale-[0.98]' 
                : 'hover:transform hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {loading ? (
              <>
                <div className="relative">
                  <Loader className="h-4 w-4 animate-spin" />
                  <div className="absolute inset-0 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
                <span className="animate-pulse">Iniciando sesión...</span>
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                <span>Iniciar Sesión</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
