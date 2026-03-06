import { useState, useEffect, useCallback, useContext, createContext } from 'react';

/**
 * Custom React hook for fetching configuration data from API
 * Usage:
 *   const { cities, loading, error } = useConfig('cities');
 *   const { destinations } = useConfig('destinations');
 *   const { preferences } = useConfig('preferences/travelStyle');
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const useConfig = (endpoint) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/config/${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${endpoint}`);
      }

      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const refetch = useCallback(() => {
    fetchConfig();
  }, [fetchConfig]);

  return { data, loading, error, refetch };
};

/**
 * Custom hook to fetch all configuration at once (for initial setup)
 */
export const useAllConfig = () => {
  const [config, setConfig] = useState({
    cities: [],
    provinces: [],
    services: [],
    destinations: [],
    preferences: [],
    banks: [],
    workflows: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const endpoints = ['cities', 'provinces', 'services', 'destinations', 'preferences', 'banks', 'workflows'];
        const results = await Promise.all(
          endpoints.map(ep => fetch(`${API_BASE}/config/${ep}`).then(r => r.json()))
        );

        setConfig({
          cities: results[0],
          provinces: results[1],
          services: results[2],
          destinations: results[3],
          preferences: results[4],
          banks: results[5],
          workflows: results[6],
        });
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  return { config, loading, error };
};

/**
 * Context to share config data across app without re-fetching
 */

export const ConfigContext = createContext();

export const ConfigProvider = ({ children }) => {
  const { config, loading, error } = useAllConfig();

  return (
    <ConfigContext.Provider value={{ config, loading, error }}>
      {children}
    </ConfigContext.Provider>
  );
};

/**
 * Hook to use config context
 */
export const useAppConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useAppConfig must be used within ConfigProvider');
  }
  return context;
};
