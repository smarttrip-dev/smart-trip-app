import { useState, useEffect, createContext, useContext } from 'react';

// Context for itinerary items
export const ItineraryContext = createContext();

export const useItineraryItems = (type = null, category = null) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        let url = '/api/config/itinerary-items';
        
        const params = [];
        if (type) params.push(`type=${type}`);
        if (category) params.push(`category=${category}`);
        
        if (params.length > 0) {
          url += '?' + params.join('&');
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch');
        
        const data = await response.json();
        setItems(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching items:', err);
        setError(err.message);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [type, category]);

  return { items, loading, error };
};

export const useItineraryByType = (type) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!type) {
      setItems([]);
      return;
    }

    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/config/itinerary-items/type/${type}`);
        if (!response.ok) throw new Error('Failed to fetch');
        
        const data = await response.json();
        setItems(data);
        setError(null);
      } catch (err) {
        console.error(`Error fetching ${type} items:`, err);
        setError(err.message);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [type]);

  return { items, loading, error };
};

// Hook to fetch all itinerary items grouped by type, with optional location filter
export const useAllItineraryItems = (location = null) => {
  const [grouped, setGrouped] = useState({
    hotels: [],
    transport: [],
    activities: [],
    meals: [],
    services: [],
    room_upgrades: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllItems = async () => {
      try {
        setLoading(true);
        // Build URL with location filter if provided
        let url = '/api/config/itinerary-items';
        if (location) {
          url += `?location=${encodeURIComponent(location)}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch');
        
        const items = await response.json();
        
        const grouped = {
          hotels: items.filter(i => i.type === 'hotel'),
          transport: items.filter(i => i.type === 'transport'),
          activities: items.filter(i => i.type === 'activity'),
          meals: items.filter(i => i.type === 'meal'),
          services: items.filter(i => i.type === 'service'),
          room_upgrades: items.filter(i => i.type === 'room_upgrade')
        };
        
        setGrouped(grouped);
        setError(null);
      } catch (err) {
        console.error('Error fetching items:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllItems();
  }, [location]);

  return { grouped, loading, error };
};

// Provider component (optional, for global state)
export const ItineraryProvider = ({ children }) => {
  const { grouped, loading, error } = useAllItineraryItems();
  
  return (
    <ItineraryContext.Provider value={{ items: grouped, loading, error }}>
      {children}
    </ItineraryContext.Provider>
  );
};

// Hook to use context
export const useItineraryContext = () => {
  const context = useContext(ItineraryContext);
  if (!context) {
    console.warn('useItineraryContext used without ItineraryProvider');
    return { items: {}, loading: false, error: null };
  }
  return context;
};
