import { useState, useEffect, useCallback } from 'react';
import { getPartsAction, updatePartAction, deletePartAction } from '@/services/data-barang/data-barang';

export interface Part {
    id: string;
    code: string;
    name: string;
    price: number;
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
            
            // Set dummy data when API fails
            const dummyParts: Part[] = [
                { id: '1', code: 'OIL-001', name: 'Oli Mesin 5W-30', price: 150000 },
                { id: '2', code: 'FLT-001', name: 'Filter Oli', price: 35000 },
                { id: '3', code: 'BRK-001', name: 'Kampas Rem Depan', price: 120000 },
                { id: '4', code: 'BRK-002', name: 'Kampas Rem Belakang', price: 100000 },
                { id: '5', code: 'AIR-001', name: 'Filter AC', price: 75000 },
            ];
            setParts(dummyParts);
            console.log('Using dummy parts data');
            return dummyParts;
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
            await updatePartAction(part);
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