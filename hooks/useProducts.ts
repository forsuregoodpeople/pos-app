import { useState, useEffect, useCallback } from 'react';
import { getPartsAction, deletePartAction } from '@/services/data-barang/data-barang';

export interface Part {
    id: string;
    code: string;
    name: string;
    price: number;
    purchase_price?: number;
    quantity?: number;
    type?: 'mutasi' | 'bengkel';
    category?: string;
    image?: string;
}

export function useProducts() {
    const [parts, setParts] = useState<Part[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const syncPartsFromGoogleSheets = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const remoteParts = await getPartsAction();
            setParts(remoteParts);
            return remoteParts;
        } catch (err: any) {
            const errorMessage = err?.message || 'Gagal sinkronisasi data dari Server.';
            setError(errorMessage);
            console.error('Sync parts error:', err);
            setParts([]);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const loadData = useCallback(async () => {
        await syncPartsFromGoogleSheets();
    }, [syncPartsFromGoogleSheets]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        const interval = setInterval(() => {
            syncPartsFromGoogleSheets().catch(() => { });
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, [syncPartsFromGoogleSheets]);

    const updatePart = async (part: Part) => {
        setLoading(true);
        try {
            setParts(prev => prev.map(p => p.id === part.id ? part : p));
            // Since updatePartAction doesn't exist, just update local state
            console.log('Part updated locally:', part);
        } catch (err: any) {
            const errorMessage = err?.message || 'Gagal update data.';
            setError(errorMessage);
            console.error('Update part error:', err);
            await syncPartsFromGoogleSheets(); 
        } finally {
            setLoading(false);
        }
    };

    const deletePart = async (id: string) => {
        setLoading(true);
        const prevParts = parts; 
        try {
            setParts(prev => prev.filter(p => p.id !== id));
            await deletePartAction(id);
        } catch (err: any) {
            const errorMessage = err?.message || 'Gagal menghapus data.';
            setError(errorMessage);
            console.error('Delete part error:', err);
            setParts(prevParts);
        } finally {
            setLoading(false);
        }
    };

    return {
        parts,
        loading,
        error,
        loadData,
        updatePart,
        deletePart,
        syncPartsFromGoogleSheets,
    };
}