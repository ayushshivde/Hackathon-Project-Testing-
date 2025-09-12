import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from '../utils/axios';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  currentLocation: null,
  locationPermission: null,
  loading: false,
  error: null,
  watchId: null
};

// Action types
const LOCATION_ACTIONS = {
  GET_LOCATION_START: 'GET_LOCATION_START',
  GET_LOCATION_SUCCESS: 'GET_LOCATION_SUCCESS',
  GET_LOCATION_FAILURE: 'GET_LOCATION_FAILURE',
  SET_PERMISSION: 'SET_PERMISSION',
  START_WATCHING: 'START_WATCHING',
  STOP_WATCHING: 'STOP_WATCHING',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
const locationReducer = (state, action) => {
  switch (action.type) {
    case LOCATION_ACTIONS.GET_LOCATION_START:
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case LOCATION_ACTIONS.GET_LOCATION_SUCCESS:
      return {
        ...state,
        currentLocation: action.payload,
        loading: false,
        error: null
      };
    
    case LOCATION_ACTIONS.GET_LOCATION_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    case LOCATION_ACTIONS.SET_PERMISSION:
      return {
        ...state,
        locationPermission: action.payload
      };
    
    case LOCATION_ACTIONS.START_WATCHING:
      return {
        ...state,
        watchId: action.payload
      };
    
    case LOCATION_ACTIONS.STOP_WATCHING:
      return {
        ...state,
        watchId: null
      };
    
    case LOCATION_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    
    default:
      return state;
  }
};

// Create context
const LocationContext = createContext();

// Location provider component
export const LocationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(locationReducer, initialState);

  // Check location permission on mount
  useEffect(() => {
    checkLocationPermission();
  }, []);

  // Check location permission
  const checkLocationPermission = () => {
    if (!navigator.geolocation) {
      dispatch({
        type: LOCATION_ACTIONS.SET_PERMISSION,
        payload: 'denied'
      });
      return;
    }

    navigator.permissions?.query({ name: 'geolocation' }).then((result) => {
      dispatch({
        type: LOCATION_ACTIONS.SET_PERMISSION,
        payload: result.state
      });
    }).catch(() => {
      dispatch({
        type: LOCATION_ACTIONS.SET_PERMISSION,
        payload: 'unknown'
      });
    });
  };

  // Get current location
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const error = 'Geolocation is not supported by this browser';
        dispatch({
          type: LOCATION_ACTIONS.GET_LOCATION_FAILURE,
          payload: error
        });
        reject(new Error(error));
        return;
      }

      dispatch({ type: LOCATION_ACTIONS.GET_LOCATION_START });

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude, accuracy } = position.coords;
            
            // Get address from coordinates
            const address = await getAddressFromCoordinates(latitude, longitude);
            
            const locationData = {
              latitude,
              longitude,
              accuracy,
              address,
              timestamp: new Date()
            };

            dispatch({
              type: LOCATION_ACTIONS.GET_LOCATION_SUCCESS,
              payload: locationData
            });

            resolve(locationData);
          } catch (error) {
            console.error('Error getting address:', error);
            
            // Still resolve with coordinates even if address fails
            const locationData = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              address: 'Location coordinates available',
              timestamp: new Date()
            };

            dispatch({
              type: LOCATION_ACTIONS.GET_LOCATION_SUCCESS,
              payload: locationData
            });

            resolve(locationData);
          }
        },
        (error) => {
          let errorMessage = 'Unable to get your location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location permissions.';
              dispatch({
                type: LOCATION_ACTIONS.SET_PERMISSION,
                payload: 'denied'
              });
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
            default:
              errorMessage = 'An unknown error occurred while retrieving location.';
              break;
          }

          dispatch({
            type: LOCATION_ACTIONS.GET_LOCATION_FAILURE,
            payload: errorMessage
          });

          reject(new Error(errorMessage));
        },
        options
      );
    });
  };

  // Get address from coordinates using Google Maps API
  const getAddressFromCoordinates = async (latitude, longitude) => {
    try {
      const response = await axios.get('/api/maps/geocode', {
        params: { lat: latitude, lng: longitude }
      });

      if (response.data.success) {
        return response.data.data.address;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
  };

  // Request location permission
  const requestLocationPermission = async () => {
    try {
      const location = await getCurrentLocation();
      dispatch({
        type: LOCATION_ACTIONS.SET_PERMISSION,
        payload: 'granted'
      });
      return { success: true, location };
    } catch (error) {
      dispatch({
        type: LOCATION_ACTIONS.SET_PERMISSION,
        payload: 'denied'
      });
      return { success: false, error: error.message };
    }
  };

  // Start watching location
  const startWatchingLocation = (onLocationUpdate) => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported');
      return null;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000 // 1 minute
    };

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        try {
          const { latitude, longitude, accuracy } = position.coords;
          const address = await getAddressFromCoordinates(latitude, longitude);
          
          const locationData = {
            latitude,
            longitude,
            accuracy,
            address,
            timestamp: new Date()
          };

          dispatch({
            type: LOCATION_ACTIONS.GET_LOCATION_SUCCESS,
            payload: locationData
          });

          if (onLocationUpdate) {
            onLocationUpdate(locationData);
          }
        } catch (error) {
          console.error('Error updating location:', error);
        }
      },
      (error) => {
        console.error('Location watch error:', error);
        toast.error('Error watching location');
      },
      options
    );

    dispatch({
      type: LOCATION_ACTIONS.START_WATCHING,
      payload: watchId
    });

    return watchId;
  };

  // Stop watching location
  const stopWatchingLocation = () => {
    if (state.watchId) {
      navigator.geolocation.clearWatch(state.watchId);
      dispatch({ type: LOCATION_ACTIONS.STOP_WATCHING });
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: LOCATION_ACTIONS.CLEAR_ERROR });
  };

  // Check if location is available
  const isLocationAvailable = () => {
    return state.currentLocation !== null && state.locationPermission === 'granted';
  };

  // Get location for SOS
  const getLocationForSOS = async () => {
    try {
      if (state.currentLocation) {
        return state.currentLocation;
      }
      
      const result = await getCurrentLocation();
      return result;
    } catch (error) {
      toast.error('Unable to get location for SOS');
      throw error;
    }
  };

  const value = {
    ...state,
    getCurrentLocation,
    requestLocationPermission,
    startWatchingLocation,
    stopWatchingLocation,
    clearError,
    isLocationAvailable,
    getLocationForSOS
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

// Custom hook to use location context
export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export default LocationContext;
