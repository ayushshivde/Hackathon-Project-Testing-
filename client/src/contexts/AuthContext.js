import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from '../utils/axios';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  LOGOUT: 'LOGOUT',
  LOAD_USER_START: 'LOAD_USER_START',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_FAILURE: 'LOAD_USER_FAILURE',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
    case AUTH_ACTIONS.LOAD_USER_START:
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    
    case AUTH_ACTIONS.LOAD_USER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    
    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
    case AUTH_ACTIONS.LOAD_USER_FAILURE:
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    
    case AUTH_ACTIONS.LOGOUT:
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set up axios interceptor for token
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [state.token]);

  // Load user on app start
  useEffect(() => {
    if (state.token && !state.user) {
      loadUser();
    } else if (!state.token) {
      dispatch({ type: AUTH_ACTIONS.LOAD_USER_FAILURE, payload: null });
    }
  }, [state.token]);

  // Load user function
  const loadUser = async () => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOAD_USER_START });
      
      const response = await axios.get('/api/auth/me');
      
      if (response.data.success) {
        dispatch({
          type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
          payload: { user: response.data.data.user }
        });
        
        // Setup notifications after successful login
        if (window.setupNotifications) {
          setTimeout(() => {
            window.setupNotifications();
          }, 1000);
        }
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Load user error:', error);
      dispatch({
        type: AUTH_ACTIONS.LOAD_USER_FAILURE,
        payload: error.response?.data?.message || 'Failed to load user'
      });
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });
      
      const response = await axios.post('/api/auth/login', {
        email,
        password
      });
      
      if (response.data.success) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: response.data.data.user,
            token: response.data.data.token
          }
        });
        
        // Setup notifications after successful login
        if (window.setupNotifications) {
          setTimeout(() => {
            window.setupNotifications();
          }, 1000);
        }
        
        toast.success('Login successful!');
        return { success: true };
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage
      });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.REGISTER_START });
      
      let payload = userData;
      let headers = {};
      if (userData && userData.avatar instanceof File) {
        const formData = new FormData();
        Object.keys(userData).forEach((key) => {
          if (key === 'avatar') {
            formData.append('avatar', userData.avatar);
          } else {
            formData.append(key, userData[key]);
          }
        });
        payload = formData;
        headers['Content-Type'] = 'multipart/form-data';
      }

      const response = await axios.post('/api/auth/register', payload, { headers });
      
      if (response.data.success) {
        dispatch({
          type: AUTH_ACTIONS.REGISTER_SUCCESS,
          payload: {
            user: response.data.data.user,
            token: response.data.data.token
          }
        });
        toast.success('Registration successful!');
        return { success: true };
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: errorMessage
      });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      if (state.token) {
        await axios.post('/api/auth/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      toast.success('Logged out successfully');
    }
  };

  // Update user function
  const updateUser = async (userData) => {
    try {
      let payload = userData;
      let headers = {};
      if (userData && userData.avatar instanceof File) {
        const formData = new FormData();
        Object.keys(userData).forEach((key) => {
          if (key === 'avatar') {
            formData.append('avatar', userData.avatar);
          } else if (key === 'emergencySettings') {
            formData.append('emergencySettings', JSON.stringify(userData.emergencySettings));
          } else {
            formData.append(key, userData[key]);
          }
        });
        payload = formData;
        headers['Content-Type'] = 'multipart/form-data';
      }

      const response = await axios.put('/api/auth/profile', payload, { headers });
      
      if (response.data.success) {
        dispatch({
          type: AUTH_ACTIONS.UPDATE_USER,
          payload: response.data.data.user
        });
        toast.success('Profile updated successfully!');
        return { success: true };
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Update failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Change password function
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await axios.post('/api/auth/change-password', {
        currentPassword,
        newPassword
      });
      
      if (response.data.success) {
        toast.success('Password changed successfully!');
        return { success: true };
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password change failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    changePassword,
    clearError,
    loadUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
