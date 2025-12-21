import { useState, useEffect, useCallback } from 'react';
import {
    getMechanicPerformanceAction,
    getMechanicPerformanceSummaryAction,
    getTopPerformersAction,
    getPerformanceByDateRangeAction,
    getPerformanceTrendAction,
    MechanicPerformance,
    MechanicPerformanceSummary
} from '@/services/mechanic-performance/mechanic-performance';

export function useMechanicPerformance() {
    const [performances, setPerformances] = useState<MechanicPerformance[]>([]);
    const [summaries, setSummaries] = useState<MechanicPerformanceSummary[]>([]);
    const [topPerformers, setTopPerformers] = useState<MechanicPerformanceSummary[]>([]);
    const [trendData, setTrendData] = useState<{ month: string; avg_score: number }[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadPerformances = useCallback(async (mechanicId?: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getMechanicPerformanceAction(mechanicId);
            setPerformances(data);
            return data;
        } catch (err: any) {
            const errorMessage = err?.message || 'Gagal memuat data performa mekanik';
            setError(errorMessage);
            console.error('Load performances error:', err);
            setPerformances([]);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const loadSummaries = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getMechanicPerformanceSummaryAction();
            setSummaries(data);
            return data;
        } catch (err: any) {
            const errorMessage = err?.message || 'Gagal memuat ringkasan performa';
            setError(errorMessage);
            console.error('Load summaries error:', err);
            setSummaries([]);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const loadTopPerformers = useCallback(async (limit: number = 10) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getTopPerformersAction(limit);
            setTopPerformers(data);
            return data;
        } catch (err: any) {
            const errorMessage = err?.message || 'Gagal memuat mekanik terbaik';
            setError(errorMessage);
            console.error('Load top performers error:', err);
            setTopPerformers([]);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const loadPerformanceByDateRange = useCallback(async (startDate: string, endDate: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getPerformanceByDateRangeAction(startDate, endDate);
            setPerformances(data);
            return data;
        } catch (err: any) {
            const errorMessage = err?.message || 'Gagal memuat data performa berdasarkan tanggal';
            setError(errorMessage);
            console.error('Load performance by date range error:', err);
            setPerformances([]);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const loadPerformanceTrend = useCallback(async (months: number = 6) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getPerformanceTrendAction(months);
            setTrendData(data);
            return data;
        } catch (err: any) {
            const errorMessage = err?.message || 'Gagal memuat data trend performa';
            setError(errorMessage);
            console.error('Load performance trend error:', err);
            setTrendData([]);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Load summaries and trend data by default
        loadSummaries();
        loadPerformanceTrend();
    }, [loadSummaries, loadPerformanceTrend]);

    return {
        performances,
        summaries,
        topPerformers,
        trendData,
        loading,
        error,
        loadPerformances,
        loadSummaries,
        loadTopPerformers,
        loadPerformanceByDateRange,
        loadPerformanceTrend
    };
}