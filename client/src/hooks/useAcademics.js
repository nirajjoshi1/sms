import { useState, useEffect } from 'react';
import api from '../lib/api';
import { useCache } from '../context/CacheContext';

export const useAcademics = () => {
  const cache = useCache();
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchClasses = async (skipCache = false) => {
    const cacheKey = 'academics-classes';

    if (!skipCache) {
      const cached = cache.getItem(cacheKey);
      if (cached) {
        setClasses(cached);
        return;
      }
    }

    setLoading(true);
    try {
      const response = await api.get('/academics/classes');
      if (response.data.success) {
        setClasses(response.data.data);
        cache.setItem(cacheKey, response.data.data, 10 * 60 * 1000); // Cache for 10 minutes
      }
    } catch (err) {
      console.error('Failed to fetch classes:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async (skipCache = false) => {
    const cacheKey = 'academics-sections';

    if (!skipCache) {
      const cached = cache.getItem(cacheKey);
      if (cached) {
        setSections(cached);
        return;
      }
    }

    try {
      const response = await api.get('/academics/sections');
      if (response.data.success) {
        setSections(response.data.data);
        cache.setItem(cacheKey, response.data.data, 10 * 60 * 1000); // Cache for 10 minutes
      }
    } catch (err) {
      console.error('Failed to fetch sections:', err);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchSections();
  }, []);

  return {
    classes,
    sections,
    loading,
    refreshClasses: () => fetchClasses(true),
    refreshSections: () => fetchSections(true)
  };
};
