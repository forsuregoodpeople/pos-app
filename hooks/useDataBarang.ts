import { useState, useEffect } from 'react';

export interface DataBarang {
    id: string;
    name: string;
    price: number;
}

export function useDataBarang() {
    const [items, setItems] = useState<DataBarang[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const saved = localStorage.getItem("barang");
        if (saved) {
            setItems(JSON.parse(saved));
        }
        setLoading(false);
    };

    const addItem = (item: Omit<DataBarang, 'id'>) => {
        const newItem: DataBarang = {
            id: Date.now().toString(),
            ...item
        };
        const updated = [...items, newItem];
        setItems(updated);
        localStorage.setItem("barang", JSON.stringify(updated));
        return newItem;
    };

    const updateItem = (id: string, item: Omit<DataBarang, 'id'>) => {
        const updated = items.map(i => i.id === id ? { id, ...item } : i);
        setItems(updated);
        localStorage.setItem("barang", JSON.stringify(updated));
    };

    const deleteItem = (id: string) => {
        const updated = items.filter(i => i.id !== id);
        setItems(updated);
        localStorage.setItem("barang", JSON.stringify(updated));
    };

    return {
        items,
        loading,
        addItem,
        updateItem,
        deleteItem,
    };
}
