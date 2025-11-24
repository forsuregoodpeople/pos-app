import { useState, useEffect } from 'react';

export interface DataMekanik {
    id: string;
    name: string;
    phone: string;
    email?: string;
}

export function useDataMekanik() {
    const [items, setItems] = useState<DataMekanik[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const saved = localStorage.getItem("mekanik");
        if (saved) {
            setItems(JSON.parse(saved));
        }
        setLoading(false);
    };

    const addItem = (item: Omit<DataMekanik, 'id'>) => {
        const newItem: DataMekanik = {
            id: Date.now().toString(),
            ...item
        };
        const updated = [...items, newItem];
        setItems(updated);
        localStorage.setItem("mekanik", JSON.stringify(updated));
        return newItem;
    };

    const updateItem = (id: string, item: Omit<DataMekanik, 'id'>) => {
        const updated = items.map(i => i.id === id ? { id, ...item } : i);
        setItems(updated);
        localStorage.setItem("mekanik", JSON.stringify(updated));
    };

    const deleteItem = (id: string) => {
        const updated = items.filter(i => i.id !== id);
        setItems(updated);
        localStorage.setItem("mekanik", JSON.stringify(updated));
    };

    return {
        items,
        loading,
        addItem,
        updateItem,
        deleteItem,
    };
}
