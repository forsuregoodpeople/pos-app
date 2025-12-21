'use client'

import { useState, useEffect, useCallback } from 'react';
import {
    getPartsAction,
    deletePartAction,
    updatePartAction,
} from '@/services/data-barang/data-barang';

export interface DataBarang {
    id: string;
    code: string;
    name: string;
    quantity: number;
    price: number;
    type?: 'mutasi' | 'bengkel';
}

export function useDataBarang() {
    const [items, setItems] = useState<DataBarang[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getPartsAction();
            setItems(
                data.map((part) => ({
                    id: part.id,
                    code: part.code,
                    name: part.name,
                    quantity: part.quantity || 0,
                    price: part.price,
                    type: part.type as 'mutasi' | 'bengkel',
                }))
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal memuat data barang.');
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const updateItem = async (id: string, item: Omit<DataBarang, 'id'>) => {
        setError(null);
        const oldItem = items.find((i) => i.id === id);
        if (!oldItem) return;

        const updatedItem: DataBarang = {
            id,
            code: item.code || oldItem.code,
            name: item.name || oldItem.name,
            quantity: item.quantity,
            price: item.price ?? oldItem.price,
            type: item.type ?? oldItem.type,
        };

        setItems((prev) => prev.map((i) => (i.id === id ? updatedItem : i)));

        try {
            const updates: { name?: string; price?: number; code?: string } = {}; // Added code here just in case, though usually code update is sensitive
             // Original logic:
            if (item.name && item.name !== oldItem.name) updates.name = item.name;
            if (item.price !== undefined && item.price !== oldItem.price) updates.price = item.price;
            // Support code update if needed
            if (item.code && item.code !== oldItem.code) updates.code = item.code;

            if (Object.keys(updates).length) {
                await updatePartAction(oldItem.code, updates);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal update barang.');
            setItems((prev) => prev.map((i) => (i.id === id ? oldItem : i)));
            throw err;
        }
    };

    const deleteItem = async (id: string) => {
        setError(null);
        const itemToDelete = items.find((i) => i.id === id);
        if (!itemToDelete) return;

        setItems((prev) => prev.filter((i) => i.id !== id));

        try {
            await deletePartAction(id);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal menghapus barang.');
            setItems((prev) => [...prev, itemToDelete]);
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
