import { useState, useEffect } from 'react';
import api from '../lib/api';
import { useCache } from '../context/CacheContext';

export const useDashboardStats = (timeFilter = '6months') => {
  const cache = useCache();
  const [statsData, setStatsData] = useState(null);
  const [recentStudents, setRecentStudents] = useState([]);
  const [classDistribution, setClassDistribution] = useState([]);
  const [genderStats, setGenderStats] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async (filter = timeFilter, skipCache = false) => {
    const cacheKey = `dashboard-stats-${filter}`;

    // Check cache first
    if (!skipCache) {
      const cached = cache.getItem(cacheKey);
      if (cached) {
        setStatsData(cached.stats);
        setRecentStudents(cached.recentStudents || []);
        setClassDistribution(cached.classDistribution || []);
        setGenderStats(cached.genderStats || []);
        setChartData(cached.chartData || []);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    try {
      const response = await api.get('/dashboard/stats', {
        params: { timeFilter: filter }
      });
      if (response.data.success) {
        const data = {
          stats: response.data.data.stats,
          recentStudents: response.data.data.recentStudents || [],
          classDistribution: response.data.data.classDistribution || [],
          genderStats: response.data.data.genderStats || [],
          chartData: response.data.data.chartData || []
        };

        setStatsData(data.stats);
        setRecentStudents(data.recentStudents);
        setClassDistribution(data.classDistribution);
        setGenderStats(data.genderStats);
        setChartData(data.chartData);

        // Cache for 3 minutes
        cache.setItem(cacheKey, data, 3 * 60 * 1000);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(timeFilter);
  }, [timeFilter]);

  return {
    statsData,
    recentStudents,
    classDistribution,
    genderStats,
    chartData,
    loading,
    error,
    refetch: (skipCache = true) => fetchStats(timeFilter, skipCache)
  };
};
