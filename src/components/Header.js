import React, { useState } from "react";
import { ShoppingCart, User, LogIn, LogOut, Menu, X } from "lucide-react";
import { useApp } from "../context/AppContext";
import Cart from "./Cart";
import ReservationsModal from "./ReservationsModal";
import LoginModal from "./LoginModal";

const Header = () => {
  const {
    user,
    isAuthenticated,
    logout,
    getCartItemsCount,
    currentCategory,
    setCategory,
  } = useApp();

  const [showCart, setShowCart] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showReservations, setShowReservations] = useState(false);

  const categories = [
    { id: "all", name: "Todos", label: "Todos los servicios" },
    { id: "transportes", name: "Transporte", label: "Transportes" },
    { id: "restaurantes", name: "Restaurantes", label: "Restaurantes" },
    { id: "hoteles", name: "Hoteles", label: "Hoteles" },
    { id: "experiencias", name: "Experiencias", label: "Experiencias/Tour" },
    {
      id: "perfilamiento",
      name: "Perfilamiento",
      label: "✨ Perfilamiento del viajero",
    },
  ];

  const handleCategoryChange = (categoryId) => {
    setCategory(categoryId);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <>
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100/50 sticky top-0 z-40 transition-all duration-300">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center">
              <div className="text-2xl md:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-reservat-primary to-reservat-orange tracking-tighter hover:opacity-80 transition-opacity cursor-pointer">
                ReservaT
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center p-1.5 bg-gray-50/80 backdrop-blur-sm rounded-2xl border border-gray-100/80 shadow-[inset_0_1px_4px_rgba(0,0,0,0.02)]">
              {categories.map((category) => {
                const isSpecial = category.id === "perfilamiento";
                const isActive = currentCategory === category.id;

                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`relative px-4 py-2 font-semibold text-sm rounded-xl transition-all duration-300 ease-out overflow-hidden group ${
                      isSpecial
                        ? isActive
                          ? "text-white shadow-md shadow-reservat-primary/25"
                          : "text-reservat-primary hover:text-reservat-primary"
                        : isActive
                          ? "text-reservat-primary bg-white shadow-sm ring-1 ring-black/5"
                          : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {isSpecial && (
                      <div
                        className={`absolute inset-0 transition-all duration-300 -z-10 ${
                          isActive
                            ? "bg-gradient-to-r from-reservat-primary to-reservat-primary/90"
                            : "bg-reservat-primary/5 group-hover:bg-reservat-primary/10"
                        }`}
                      />
                    )}
                    <span className="relative z-10">{category.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Cart */}
              <button
                onClick={() => setShowCart(true)}
                className="relative p-2.5 text-gray-500 hover:text-reservat-primary hover:bg-reservat-primary/5 rounded-full transition-all duration-300"
              >
                <ShoppingCart className="h-5 w-5" />
                {getCartItemsCount() > 0 && (
                  <span className="absolute top-0 right-0 bg-reservat-orange text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold shadow-sm">
                    {getCartItemsCount()}
                  </span>
                )}
              </button>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-2.5 text-gray-600 hover:text-reservat-primary hover:bg-reservat-primary/5 rounded-full transition-all duration-300 ring-1 ring-transparent focus:ring-reservat-primary/20"
                  >
                    <User className="h-5 w-5" />
                    <span className="hidden sm:block text-sm font-semibold tracking-tight">
                      {user?.nombre || user?.email}
                    </span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 py-2 z-50 overflow-hidden">
                      <div className="px-5 py-3 border-b border-gray-100/60 bg-gray-50/50">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {user?.nombre || "Usuario"}
                        </p>
                        <p className="text-xs text-gray-500 font-medium truncate mt-0.5">
                          {user?.email}
                        </p>
                      </div>
                      <div className="p-1">
                        <button
                          onClick={() => {
                            setShowReservations(true);
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:text-reservat-primary hover:bg-reservat-primary/5 rounded-lg flex items-center space-x-2 transition-colors duration-200"
                        >
                          <span>Ver reservas</span>
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 mt-1 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg flex items-center space-x-2 transition-colors duration-200"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Cerrar sesión</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-reservat-primary to-reservat-primary/90 hover:from-reservat-primary/90 hover:to-reservat-primary text-white px-6 py-2.5 rounded-2xl font-bold transition-all duration-300 shadow-[0_4px_14px_rgba(37,99,235,0.25)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)] hover:-translate-y-0.5"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Iniciar sesión</span>
                </button>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="xl:hidden p-2.5 text-gray-600 hover:text-reservat-primary hover:bg-reservat-primary/5 rounded-full transition-colors duration-200"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="xl:hidden border-t border-gray-100/50 py-4 animate-slide-up">
              <nav className="space-y-1">
                {categories.map((category) => {
                  const isSpecial = category.id === "perfilamiento";
                  const isActive = currentCategory === category.id;

                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        isActive
                          ? "bg-reservat-primary/10 text-reservat-primary"
                          : isSpecial
                            ? "text-reservat-primary bg-reservat-primary/5 hover:bg-reservat-primary/10"
                            : "text-gray-600 hover:text-reservat-primary hover:bg-gray-50"
                      }`}
                    >
                      {category.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Modals */}
      <Cart isOpen={showCart} onClose={() => setShowCart(false)} />
      <ReservationsModal
        isOpen={showReservations}
        onClose={() => setShowReservations(false)}
      />
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />

      {/* Overlay for user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </>
  );
};

export default Header;
