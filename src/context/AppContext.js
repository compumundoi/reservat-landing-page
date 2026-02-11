import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
  useState,
} from "react";
import Cookies from "js-cookie";
import jwtDecode from "jwt-decode";

const AppContext = createContext();

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api/v1";

// Función para cargar el carrito desde localStorage
const loadCartFromStorage = () => {
  try {
    // Verificar si localStorage está disponible
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      return [];
    }
    const savedCart = localStorage.getItem("reservat_cart");
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    console.error("Error loading cart from localStorage:", error);
    return [];
  }
};

// Función para guardar el carrito en localStorage
const saveCartToStorage = (cart) => {
  try {
    // Verificar si localStorage está disponible
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      return;
    }
    localStorage.setItem("reservat_cart", JSON.stringify(cart));
  } catch (error) {
    console.error("Error saving cart to localStorage:", error);
  }
};

const initialState = {
  user: null,
  isAuthenticated: false,
  cart: [], // Inicializar como array vacío temporalmente
  services: [],
  servicePhotos: {}, // Almacenar fotos por servicio ID
  loading: false,
  error: null,
  currentCategory: "all",
  searchFilters: {
    ciudad: "",
    relevancia: "",
    tipo_servicio: "",
    query: "",
  },
};

function appReducer(state, action) {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };

    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        loading: false,
      };

    case "LOGOUT":
      Cookies.remove("access_token");
      return {
        ...state,
        user: null,
        isAuthenticated: false,
      };

    case "SET_SERVICES":
      return { ...state, services: action.payload, loading: false };

    case "SET_SERVICE_PHOTOS":
      return {
        ...state,
        servicePhotos: {
          ...state.servicePhotos,
          [action.payload.serviceId]: action.payload.photos,
        },
      };

    case "ADD_TO_CART":
      const existingItem = state.cart.find(
        (item) => item.id_servicio === action.payload.id_servicio,
      );
      const addQty = Math.max(1, Number(action.payload.quantity || 1));
      let newCart;
      if (existingItem) {
        newCart = state.cart.map((item) =>
          item.id_servicio === action.payload.id_servicio
            ? {
                ...item,
                quantity: item.quantity + addQty,
                // Guardar/actualizar datos de reserva si vienen en el payload
                reserva: action.payload.reserva
                  ? { ...item.reserva, ...action.payload.reserva }
                  : item.reserva,
              }
            : item,
        );
      } else {
        // Crear nuevo item con cantidad personalizada y datos de reserva opcionales
        const newItem = { ...action.payload };
        newItem.quantity = addQty;
        if (action.payload.reserva) newItem.reserva = action.payload.reserva;
        newCart = [...state.cart, newItem];
      }
      // Guardar en localStorage
      saveCartToStorage(newCart);
      return {
        ...state,
        cart: newCart,
      };

    case "REMOVE_FROM_CART":
      const filteredCart = state.cart.filter(
        (item) => item.id_servicio !== action.payload,
      );
      // Guardar en localStorage
      saveCartToStorage(filteredCart);
      return {
        ...state,
        cart: filteredCart,
      };

    case "UPDATE_CART_QUANTITY":
      const updatedCart = state.cart
        .map((item) =>
          item.id_servicio === action.payload.id
            ? { ...item, quantity: Math.max(0, action.payload.quantity) }
            : item,
        )
        .filter((item) => item.quantity > 0);
      // Guardar en localStorage
      saveCartToStorage(updatedCart);
      return {
        ...state,
        cart: updatedCart,
      };

    case "CLEAR_CART":
      // Limpiar localStorage
      saveCartToStorage([]);
      return { ...state, cart: [] };

    case "SET_CART":
      return { ...state, cart: action.payload };

    case "SET_CATEGORY":
      return { ...state, currentCategory: action.payload };

    case "SET_SEARCH_FILTERS":
      return {
        ...state,
        searchFilters: { ...state.searchFilters, ...action.payload },
      };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [cartLoaded, setCartLoaded] = useState(false);
  const photosCache = useRef(new Map());
  const photosRequestsInProgress = useRef(new Set());

  // Check for existing token on app load
  useEffect(() => {
    const token = Cookies.get("access_token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          dispatch({ type: "SET_USER", payload: decoded });
        } else {
          Cookies.remove("access_token");
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        Cookies.remove("access_token");
      }
    }
  }, []);

  // Cargar carrito desde localStorage después del montaje
  useEffect(() => {
    if (!cartLoaded) {
      const savedCart = loadCartFromStorage();
      if (savedCart.length > 0) {
        dispatch({ type: "SET_CART", payload: savedCart });
      }
      setCartLoaded(true);
    }
  }, [cartLoaded]);

  const fetchUserData = async (userId) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await fetch(
        `${API_BASE_URL}/mayorista/consultar/${userId}`,
      );

      if (response.ok) {
        const userData = await response.json();
        dispatch({ type: "SET_USER", payload: userData });
      } else {
        throw new Error("Failed to fetch user data");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Error al cargar datos del usuario",
      });
      dispatch({ type: "LOGOUT" });
    }
  };

  const login = async (email, password) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      const response = await fetch(`${API_BASE_URL}/usuarios/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          contraseña: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const decoded = jwtDecode(data.access_token);

        // Set cookie with expiration
        Cookies.set("access_token", data.access_token, {
          expires: new Date(decoded.exp * 1000),
          secure: true,
          sameSite: "strict",
        });

        await fetchUserData(decoded.id);
        return { success: true };
      } else {
        let errorMessage = "Error de autenticación";
        switch (response.status) {
          case 404:
            errorMessage = "El usuario no existe";
            break;
          case 401:
            errorMessage = "Credenciales incorrectas";
            break;
          case 403:
            errorMessage =
              "El usuario no está activo, comunícate con el administrador";
            break;
          case 500:
            errorMessage = "Error interno del servidor";
            break;
          default:
            errorMessage = data.detail || "Error de autenticación";
        }
        dispatch({ type: "SET_ERROR", payload: errorMessage });
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = "Error de conexión";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const fetchServices = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await fetch(`${API_BASE_URL}/servicios/listar/`);

      if (response.ok) {
        const data = await response.json();
        dispatch({ type: "SET_SERVICES", payload: data.servicios || [] });
      } else {
        throw new Error("Failed to fetch services");
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      dispatch({ type: "SET_ERROR", payload: "Error al cargar servicios" });
    }
  }, [dispatch]);

  // Control robusto de peticiones de fotos para evitar bucles infinitos
  // Las variables photosCache y photosRequestsInProgress ya están declaradas arriba

  const fetchServicePhotos = useCallback(
    async (serviceId) => {
      try {
        // Si ya tenemos las fotos en caché, devolverlas inmediatamente
        if (photosCache.current.has(serviceId)) {
          return photosCache.current.get(serviceId);
        }

        // Si ya hay una petición en progreso para este servicio, no hacer otra
        if (photosRequestsInProgress.current.has(serviceId)) {
          return [];
        }

        // Marcar que estamos haciendo una petición para este servicio
        photosRequestsInProgress.current.add(serviceId);

        const response = await fetch(
          `${API_BASE_URL}/fotos/servicios/${serviceId}`,
        );

        if (response.ok) {
          const data = await response.json();
          // Extraer solo las URLs de las fotos como solicitaste
          const photoUrls = data.fotos.map((foto) => foto.url);

          // Guardar en caché local para evitar peticiones duplicadas
          photosCache.current.set(serviceId, photoUrls);

          // También guardar en el estado global para sincronización
          dispatch({
            type: "SET_SERVICE_PHOTOS",
            payload: { serviceId, photos: photoUrls },
          });

          return photoUrls;
        } else {
          console.warn(
            `No se pudieron cargar las fotos para el servicio ${serviceId}`,
          );
          return [];
        }
      } catch (error) {
        console.error(`Error fetching photos for service ${serviceId}:`, error);
        return [];
      } finally {
        // Remover de las peticiones en progreso
        photosRequestsInProgress.current.delete(serviceId);
      }
    },
    [dispatch],
  );

  const getCartTotal = () => {
    return state.cart.reduce(
      (total, item) => total + item.precio * item.quantity,
      0,
    );
  };

  const getCartItemsCount = () => {
    return state.cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getFilteredServices = () => {
    let filtered = state.services;

    // Filter by category
    if (state.currentCategory !== "all") {
      const categoryMap = {
        transportes: "transporte",
        hoteles: "alojamiento",
        restaurantes: "restaurante",
        experiencias: "experiencias",
      };
      filtered = filtered.filter(
        (service) =>
          service.tipo_servicio === categoryMap[state.currentCategory],
      );
    }

    // Apply search filters
    if (state.searchFilters.query) {
      filtered = filtered.filter(
        (service) =>
          service.nombre
            .toLowerCase()
            .includes(state.searchFilters.query.toLowerCase()) ||
          service.descripcion
            .toLowerCase()
            .includes(state.searchFilters.query.toLowerCase()),
      );
    }

    if (state.searchFilters.ciudad) {
      filtered = filtered.filter((service) =>
        service.ciudad
          .toLowerCase()
          .includes(state.searchFilters.ciudad.toLowerCase()),
      );
    }

    if (state.searchFilters.tipo_servicio) {
      filtered = filtered.filter(
        (service) =>
          service.tipo_servicio === state.searchFilters.tipo_servicio,
      );
    }

    return filtered;
  };

  const value = {
    API_BASE_URL,
    ...state,
    dispatch,
    login,
    fetchServices,
    fetchServicePhotos,
    getCartTotal,
    getCartItemsCount,
    getFilteredServices,
    logout: () => dispatch({ type: "LOGOUT" }),
    // addToCart ahora acepta (service, options)
    // options: { quantity?: number, reserva?: { fecha_entrada, fecha_salida?, hora? } }
    addToCart: (service, options = {}) =>
      dispatch({ type: "ADD_TO_CART", payload: { ...service, ...options } }),
    removeFromCart: (serviceId) =>
      dispatch({ type: "REMOVE_FROM_CART", payload: serviceId }),
    updateCartQuantity: (id, quantity) =>
      dispatch({ type: "UPDATE_CART_QUANTITY", payload: { id, quantity } }),
    clearCart: () => dispatch({ type: "CLEAR_CART" }),
    setCategory: (category) =>
      dispatch({ type: "SET_CATEGORY", payload: category }),
    setSearchFilters: (filters) =>
      dispatch({ type: "SET_SEARCH_FILTERS", payload: filters }),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
