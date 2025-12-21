import { useState, useEffect, useCallback } from 'react';
import { 
    getPaymentTypesAction, 
    createPaymentTypeAction, 
    updatePaymentTypeAction, 
    deletePaymentTypeAction,
    setDefaultPaymentTypeAction,
    getDefaultPaymentTypeAction,
    PaymentType 
} from '@/services/payment-types/payment-types';

export function usePaymentTypes() {
    const [items, setItems] = useState<PaymentType[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadPaymentTypes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getPaymentTypesAction();
            setItems(data);
            return data;
        } catch (err: any) {
            const errorMessage = err?.message || 'Gagal memuat data tipe pembayaran';
            setError(errorMessage);
            console.error('Load payment types error:', err);
            setItems([]);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const createPaymentType = async (paymentType: Omit<PaymentType, 'id' | 'created_at' | 'updated_at'>) => {
        setLoading(true);
        setError(null);
        try {
            const newPaymentType = await createPaymentTypeAction(paymentType);
            setItems(prev => [...prev, newPaymentType]);
            return newPaymentType;
        } catch (err: any) {
            const errorMessage = err?.message || 'Gagal menambah tipe pembayaran';
            setError(errorMessage);
            console.error('Create payment type error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updatePaymentType = async (id: string, paymentType: Partial<Omit<PaymentType, 'id' | 'created_at' | 'updated_at'>>) => {
        setLoading(true);
        setError(null);
        try {
            const updatedPaymentType = await updatePaymentTypeAction(id, paymentType);
            setItems(prev => prev.map(item => item.id === id ? updatedPaymentType : item));
            return updatedPaymentType;
        } catch (err: any) {
            const errorMessage = err?.message || 'Gagal mengupdate tipe pembayaran';
            setError(errorMessage);
            console.error('Update payment type error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deletePaymentType = async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            await deletePaymentTypeAction(id);
            setItems(prev => prev.filter(item => item.id !== id));
        } catch (err: any) {
            const errorMessage = err?.message || 'Gagal menghapus tipe pembayaran';
            setError(errorMessage);
            console.error('Delete payment type error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const setDefaultPaymentType = async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            await setDefaultPaymentTypeAction(id);
            setItems(prev => prev.map(item => ({
                ...item,
                is_default: item.id === id
            })));
        } catch (err: any) {
            const errorMessage = err?.message || 'Gagal mengatur tipe pembayaran default';
            setError(errorMessage);
            console.error('Set default payment type error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getDefaultPaymentType = async () => {
        try {
            return await getDefaultPaymentTypeAction();
        } catch (err: any) {
            console.error('Get default payment type error:', err);
            return null;
        }
    };

    useEffect(() => {
        loadPaymentTypes();
    }, [loadPaymentTypes]);

    return {
        items,
        loading,
        error,
        loadPaymentTypes,
        createPaymentType,
        updatePaymentType,
        deletePaymentType,
        setDefaultPaymentType,
        getDefaultPaymentType
    };
}