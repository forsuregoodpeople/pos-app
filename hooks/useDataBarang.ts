import { useState, useEffect, useCallback } from 'react';
import { 
    getPartsAction, 
    updatePartAction, 
    deletePartAction,
} from '@/services/data-barang/data-barang'; 

export interface DataBarang {
    id: string;
    code: string;
    name: string;
    price: number;
}

export function useDataBarang() {
    const [items, setItems] = useState<DataBarang[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        console.log('useDataBarang: Starting loadData');
        setLoading(true);
        setError(null);
        try {
            const data = await getPartsAction();
            console.log('useDataBarang: Data loaded successfully:', data.length, 'items');
            setItems(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Gagal memuat data barang.";
            console.error('useDataBarang: Load error:', errorMessage);
            setError(errorMessage);
            setItems([]);
        } finally {
            console.log('useDataBarang: Setting loading to false');
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const updateItem = async (id: string, item: Omit<DataBarang, 'id'>) => {
        setError(null);
        const oldItem = items.find(i => i.id === id);
        if (!oldItem) return;

        const updatedItem: DataBarang = { id, ...item, code: item.code || '' };

        setItems(prev => prev.map(i => i.id === id ? updatedItem : i));

        try {
            await updatePartAction(updatedItem);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Gagal update barang.";
            setError(errorMessage);
            setItems(prev => prev.map(i => i.id === id ? oldItem : i));
            console.error('Update barang error:', err);
            throw err;
        }
    };

    const deleteItem = async (id: string) => {
        setError(null);
        const oldItems = items;

        setItems(prev => prev.filter(i => i.id !== id));

        try {
            await deletePartAction(id);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Gagal menghapus barang.";
            setError(errorMessage);
            setItems(oldItems);
            console.error('Delete barang error:', err);
            throw err;
        }
    };

    return {
        items,
        loading,
        error,
        updateItem,
        deleteItem,
        reload: loadData,
    };
}