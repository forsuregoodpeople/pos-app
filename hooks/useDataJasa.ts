import { useState, useEffect } from 'react';

export interface DataJasa {
    id: string;
    name: string;
    price: number;
}

export function useDataJasa() {
    const [items, setItems] = useState<DataJasa[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const saved = localStorage.getItem("services");
        if (saved) {
            setItems(JSON.parse(saved));
        }
        setLoading(false);
    };

    const addItem = (item: Omit<DataJasa, 'id'>) => {
        const newItem: DataJasa = {
            id: Date.now().toString(),
            ...item
        };
        const updated = [...items, newItem];
        setItems(updated);
        localStorage.setItem("services", JSON.stringify(updated));
        return newItem;
    };

    const updateItem = (id: string, item: Omit<DataJasa, 'id'>) => {
        const updated = items.map(i => i.id === id ? { id, ...item } : i);
        setItems(updated);
        localStorage.setItem("services", JSON.stringify(updated));
    };

    const deleteItem = (id: string) => {
        const updated = items.filter(i => i.id !== id);
        setItems(updated);
        localStorage.setItem("services", JSON.stringify(updated));
    };

    return {
        items,
        loading,
        addItem,
        updateItem,
        deleteItem,
    };
}
