'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    getDataBarangMutasiAction,
    deleteDataBarangMutasiAction,
    synchronizeStockAction,
    DataBarangMutasi
} from '@/services/data-barang/data-barang-mutasi';

export function useDataBarangMutasi() {
    const [mutations, setMutations] = useState<DataBarangMutasi[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getDataBarangMutasiAction();
            setMutations(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal memuat data barang mutasi.');
            setMutations([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const deleteMutation = async (transactionCode: string) => {
        setError(null);
        // Optimistic update
        const previousData = [...mutations];
        setMutations((prev) => prev.filter((m) => m.transactionCode !== transactionCode));

        try {
            await deleteDataBarangMutasiAction(transactionCode);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal menghapus data mutasi.');
            // Revert on error
            setMutations(previousData);
            throw err;
        }
    };

    const syncMutation = async (
        transactionCode: string, 
        mode: 'add' | 'subtract' = 'add',
        customQuantities?: Record<string, number>
    ) => {
        setError(null);
        try {
            await synchronizeStockAction(transactionCode, mode, customQuantities);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal menyinkronkan stok.');
            throw err;
        }
    };

    return {
        mutations,
        loading,
        error,
        deleteMutation,
        syncMutation,
        reload: loadData,
    };
}
