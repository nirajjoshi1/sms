import { useState, useCallback } from 'react';
import api from '../lib/api';

export const useStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0 });

  const fetchStudents = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const response = await api.get('/students', { params: filters });
      if (response.data.success) {
        setStudents(response.data.data);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      }
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { students, loading, pagination, fetchStudents };
};
