import { useState, useEffect, useCallback } from 'react';
import { 
    getMechaAction, 
    updateMechaAction, 
    deleteMechaAction,
    addMechaAction,
} from '@/services/data-mekanik/data-mekanik'; 

export interface DataMekanik {
    id: string;
    name: string;
}

export function useDataMekanik() {
    const [items, setItems] = useState<DataMekanik[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getMechaAction();
            setItems(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Gagal memuat data mekanik.";
            console.error('useDataMekanik: Load error:', errorMessage);
            setError(errorMessage);
            setItems([]);
        } finally {
            console.log('useDataMekanik: Setting loading to false');
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const addItem = async (item: Omit<DataMekanik, 'id'>) => {
        setError(null);
        const tempId = 'temp-' + Date.now();
        const newItemWithId: DataMekanik = { id: tempId, ...item };

        setItems(prev => [...prev, newItemWithId]);
        
        try {
            const addedItem = await addMechaAction(newItemWithId);
            setItems(prev => prev.map(i => i.id === tempId ? addedItem : i));
            return addedItem;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Gagal menambah mekanik.";
            setError(errorMessage);
            setItems(prev => prev.filter(i => i.id !== tempId)); 
            await loadData(); 
            throw err;
        }
    };

    const updateItem = async (id: string, item: Omit<DataMekanik, 'id'>) => {
        setError(null);
        const oldItem = items.find(i => i.id === id);
        if (!oldItem) return;

        const updatedItem: DataMekanik = { id, ...item };

        setItems(prev => prev.map(i => i.id === id ? updatedItem : i));

        try {
            await updateMechaAction(updatedItem);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Gagal update mekanik.";
            setError(errorMessage);
            setItems(prev => prev.map(i => i.id === id ? oldItem : i));
            console.error('Update mekanik error:', err);
            throw err;
        }
    };

    const deleteItem = async (id: string) => {
        setError(null);
        const oldItems = items;

        setItems(prev => prev.filter(i => i.id !== id));

        try {
            await deleteMechaAction(id);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Gagal menghapus mekanik.";
            setError(errorMessage);
            setItems(oldItems);
            console.error('Delete mekanik error:', err);
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
