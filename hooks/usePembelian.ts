import { useState, useEffect, useCallback } from 'react';
import {
    getSuppliersAction,
    createSupplierAction,
    updateSupplierAction,
    deleteSupplierAction,
    getPurchasesAction,
    createPurchaseAction,
    updatePurchaseAction,
    deletePurchaseAction,
    getPurchaseReturnsAction,
    createPurchaseReturnAction,
    updatePurchaseReturnAction,
    deletePurchaseReturnAction,
    Supplier,
    Purchase,
    PurchaseReturn
} from '@/services/pembelian/pembelian';
import { generatePurchaseInvoiceNumber } from '@/lib/utils';

export function useSuppliers() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadSuppliers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getSuppliersAction();
            setSuppliers(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Gagal memuat data supplier";
            setError(errorMessage);
            setSuppliers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const createSupplier = useCallback(async (supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) => {
        try {
            const newSupplier = await createSupplierAction(supplier);
            setSuppliers(prev => [...prev, newSupplier]);
            return newSupplier;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Gagal menambah supplier";
            setError(errorMessage);
            throw err;
        }
    }, []);

    const updateSupplier = useCallback(async (id: string, supplier: Partial<Omit<Supplier, 'id' | 'created_at' | 'updated_at'>>) => {
        try {
            const updatedSupplier = await updateSupplierAction(id, supplier);
            setSuppliers(prev => prev.map(s => s.id === id ? updatedSupplier : s));
            return updatedSupplier;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Gagal mengupdate supplier";
            setError(errorMessage);
            throw err;
        }
    }, []);

    const deleteSupplier = useCallback(async (id: string) => {
        try {
            await deleteSupplierAction(id);
            setSuppliers(prev => prev.filter(s => s.id !== id));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Gagal menghapus supplier";
            setError(errorMessage);
            throw err;
        }
    }, []);

    useEffect(() => {
        loadSuppliers();
    }, [loadSuppliers]);

    return {
        suppliers,
        loading,
        error,
        createSupplier,
        updateSupplier,
        deleteSupplier,
        reload: loadSuppliers,
    };
}

export function usePembelian() {
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadPurchases = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getPurchasesAction();
            setPurchases(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Gagal memuat data pembelian";
            setError(errorMessage);
            setPurchases([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const createPurchase = useCallback(async (purchase: Omit<Purchase, 'id' | 'created_at' | 'updated_at' | 'items'>, items: any[]) => {
        try {
            const newPurchase = await createPurchaseAction(purchase, items);
            setPurchases(prev => [newPurchase, ...prev]);
            return newPurchase;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Gagal menambah pembelian";
            setError(errorMessage);
            throw err;
        }
    }, []);

    const updatePurchase = useCallback(async (id: string, purchase: Partial<Omit<Purchase, 'id' | 'created_at' | 'updated_at' | 'items'>>) => {
        try {
            const updatedPurchase = await updatePurchaseAction(id, purchase);
            setPurchases(prev => prev.map(p => p.id === id ? updatedPurchase : p));
            return updatedPurchase;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Gagal mengupdate pembelian";
            setError(errorMessage);
            throw err;
        }
    }, []);

    const deletePurchase = useCallback(async (id: string) => {
        try {
            await deletePurchaseAction(id);
            setPurchases(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Gagal menghapus pembelian";
            setError(errorMessage);
            throw err;
        }
    }, []);

    const generateInvoiceNumber = useCallback(() => {
        return generatePurchaseInvoiceNumber();
    }, []);

    useEffect(() => {
        loadPurchases();
    }, [loadPurchases]);

    return {
        purchases,
        loading,
        error,
        createPurchase,
        updatePurchase,
        deletePurchase,
        generateInvoiceNumber,
        reload: loadPurchases,
    };
}

export function useReturPembelian() {
    const [returns, setReturns] = useState<PurchaseReturn[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadReturns = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getPurchaseReturnsAction();
            setReturns(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Gagal memuat data retur pembelian";
            setError(errorMessage);
            setReturns([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const createReturn = useCallback(async (returnData: Omit<PurchaseReturn, 'id' | 'created_at'>, returnItems: any[]) => {
        try {
            const newReturn = await createPurchaseReturnAction(returnData, returnItems);
            setReturns(prev => [newReturn, ...prev]);
            return newReturn;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Gagal menambah retur pembelian";
            setError(errorMessage);
            throw err;
        }
    }, []);

    const updateReturn = useCallback(async (id: string, returnData: Partial<Omit<PurchaseReturn, 'id' | 'created_at'>>, returnItems: any[]) => {
        try {
            const updatedReturn = await updatePurchaseReturnAction(id, returnData, returnItems);
            setReturns(prev => prev.map(r => r.id === id ? updatedReturn : r));
            return updatedReturn;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Gagal mengupdate retur pembelian";
            setError(errorMessage);
            throw err;
        }
    }, []);

    const deleteReturn = useCallback(async (id: string) => {
        try {
            await deletePurchaseReturnAction(id);
            setReturns(prev => prev.filter(r => r.id !== id));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Gagal menghapus retur pembelian";
            setError(errorMessage);
            throw err;
        }
    }, []);

    useEffect(() => {
        loadReturns();
    }, [loadReturns]);

    return {
        returns,
        loading,
        error,
        createReturn,
        updateReturn,
        deleteReturn,
        reload: loadReturns,
    };
}