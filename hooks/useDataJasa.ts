import { useState, useEffect, useCallback } from 'react';
import { 
    getJasaAction, 
    updateJasaAction, 
    deleteJasaAction,
    addJasaAction,
} from '@/services/data-jasa/data-jasa'; 

export interface DataJasa {
    id: string;
    name: string;
    price: number;
}

export function useDataJasa() {
    const [items, setItems] = useState<DataJasa[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        console.log('useDataJasa: Starting loadData');
        setLoading(true);
        setError(null);
        try {
            const data = await getJasaAction();
            console.log('useDataJasa: Data loaded successfully:', data.length, 'items');
            setItems(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Gagal memuat data jasa.";
            console.error('useDataJasa: Load error:', errorMessage);
            setError(errorMessage);
            setItems([]);
        } finally {
            console.log('useDataJasa: Setting loading to false');
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const addItem = async (item: Omit<DataJasa, 'id'>) => {
        setError(null);
        const tempId = 'temp-' + Date.now();
        const newItemWithId: DataJasa = { id: tempId, ...item };

        setItems(prev => [...prev, newItemWithId]);
        
        try {
            const addedItem = await addJasaAction(newItemWithId);
            setItems(prev => prev.map(i => i.id === tempId ? addedItem : i));
            return addedItem;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Gagal menambah jasa.";
            setError(errorMessage);
            setItems(prev => prev.filter(i => i.id !== tempId)); 
            await loadData(); 
            console.error('Add jasa error:', err);
            throw err;
        }
    };

    const updateItem = async (id: string, item: Omit<DataJasa, 'id'>) => {
        setError(null);
        const oldItem = items.find(i => i.id === id);
        if (!oldItem) return;

        const updatedItem: DataJasa = { id, ...item };

        setItems(prev => prev.map(i => i.id === id ? updatedItem : i));

        try {
            await updateJasaAction(updatedItem);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Gagal update jasa.";
            setError(errorMessage);
            setItems(prev => prev.map(i => i.id === id ? oldItem : i));
            console.error('Update jasa error:', err);
            throw err;
        }
    };

    const deleteItem = async (id: string) => {
        setError(null);
        const oldItems = items;

        setItems(prev => prev.filter(i => i.id !== id));

        try {
            await deleteJasaAction(id);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Gagal menghapus jasa.";
            setError(errorMessage);
            setItems(oldItems);
            console.error('Delete jasa error:', err);
            throw err;
        }
    };

    return {
        items,
        loading,
        error,
        addItem,
        updateItem,
        deleteItem,
        reload: loadData,
    };
}
