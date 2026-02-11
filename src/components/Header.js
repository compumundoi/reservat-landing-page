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
      <header className="bg-white shadow-soft border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="text-2xl font-bold text-reservat-primary">
                ReservaT
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentCategory === category.id
                      ? "bg-reservat-primary text-white"
                      : "text-gray-600 hover:text-reservat-primary hover:bg-gray-50"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Cart */}
              <button
                onClick={() => setShowCart(true)}
                className="relative p-2 text-gray-600 hover:text-reservat-primary transition-colors duration-200"
              >
                <ShoppingCart className="h-6 w-6" />
                {getCartItemsCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-reservat-orange text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {getCartItemsCount()}
                  </span>
                )}
              </button>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-2 text-gray-600 hover:text-reservat-primary transition-colors duration-200"
                  >
                    <User className="h-6 w-6" />
                    <span className="hidden sm:block text-sm font-medium">
                      {user?.nombre || user?.email}
                    </span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-medium border border-gray-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.nombre || "Usuario"}
                        </p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          setShowReservations(true);
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <span>Ver reservas</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Cerrar sesión</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className="flex items-center space-x-2 btn-primary"
                >
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:block">Iniciar sesión</span>
                </button>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-reservat-primary transition-colors duration-200"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-100 py-4 animate-slide-up">
              <nav className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      currentCategory === category.id
                        ? "bg-reservat-primary text-white"
                        : "text-gray-600 hover:text-reservat-primary hover:bg-gray-50"
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
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
