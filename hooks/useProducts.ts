import { useState, useEffect, useCallback } from 'react';
import { getPartsAction, deletePartAction } from '@/services/data-barang/data-barang';
import { getDataBarangMutasiAction, DataBarangMutasi } from '@/services/data-barang/data-barang-mutasi';

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
            // Fetch both data sources in parallel
            const [remoteParts, mutations] = await Promise.all([
                getPartsAction(),
                getDataBarangMutasiAction()
            ]);

            // Flatten mutations into parts
            const mutationParts: Part[] = mutations.flatMap(mutation => 
                mutation.items.map((item, index) => ({
                    id: `MUT-${mutation.transactionCode}-${item.id || index}`, // Ensure unique ID
                    code: item.transactionCode, // Use transaction code as item code or keep it distinct
                    name: `${item.itemName} (${mutation.customerName})`, // Valid for POS display
                    price: parseFloat(item.priceCode || '0'), // Assuming priceCode is string number
                    quantity: item.quantity,
                    type: 'mutasi', // Explicitly mark as mutasi
                    category: 'Mutasi',
                    purchase_price: 0 // Optional default
                }))
            );

            // Merge existing parts with mutation parts
            const allParts = [...remoteParts, ...mutationParts];
            
            setParts(allParts);
            return allParts;
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
            // Check if it's a mutation part (starts with MUT-)
            if (id.startsWith('MUT-')) {
                // For now, we arguably can't delete single mutation items easily from here 
                // without a specific action, so we might just warn or skip
                console.warn('Deleting individual mutation items from POS is not fully supported yet in backend.');
            } else {
                await deletePartAction(id);
            }
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