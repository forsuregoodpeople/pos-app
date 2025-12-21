import { useState, useEffect, useCallback } from 'react';
import { CartItem } from './useCart';
import { CustomerInfo } from './useCustomer';
import {
    getTransactionsAction,
    saveTransactionAction,
    updateTransactionAction,
    deleteTransactionAction,
} from '@/services/data-transaksi/data-transaksi';
import { updateStockAction } from '@/services/data-barang/data-barang';

export interface Transaction {
    invoiceNumber: string;
    date: string;
    customer: CustomerInfo;
    items: CartItem[];
    total: number;
    savedAt: string;
    keterangan?: string;
}

export function useTransaction() {
    const [invoiceNumber, setInvoiceNumber] = useState('INV-LOADING');
    const [date] = useState(() => new Date().toISOString().split('T')[0]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);

    const loadTransactions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getTransactionsAction();
            setTransactions(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Gagal memuat data transaksi.";
            setError(errorMessage);
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (isClient) {
            const date = new Date();
            const rand = Math.floor((Math.random() * 1000) + 1);
            const newInvoiceNumber = `INV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${String(rand).padStart(3, '0')}`;
            setInvoiceNumber(newInvoiceNumber);
        }
    }, [isClient]);

    useEffect(() => {
        loadTransactions();
    }, [loadTransactions]);

    const saveInvoice = async (customer: CustomerInfo, items: CartItem[], total: number, keterangan?: string) => {
        const invoiceData: Transaction = {
            invoiceNumber,
            date,
            customer,
            items,
            total,
            savedAt: new Date().toISOString(),
            keterangan
        };

        try {
            const savedTransaction = await saveTransactionAction(invoiceData);
            const saveQuantity = await updateStockAction(items);

            if (!saveQuantity.success) {
                throw new Error('Gagal memperbarui stok barang.');
            }
            setTransactions(prev => [...prev, savedTransaction]);
            return savedTransaction;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Gagal menyimpan transaksi.";
            setError(errorMessage);
            console.error('Save transaction error:', err);
            throw err;
        }
    };

    const deleteTransaction = async (invoiceNumber: string) => {
        setError(null);
        const oldTransactions = transactions;

        setTransactions(prev => prev.filter(t => t.invoiceNumber !== invoiceNumber));

        try {
            await deleteTransactionAction(invoiceNumber);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Gagal menghapus transaksi.";
            setError(errorMessage);
            setTransactions(oldTransactions);
            console.error('Delete transaction error:', err);
            throw err;
        }
    };

    const updateTransaction = async (invoiceNumber: string, transaction: Transaction) => {
        setError(null);
        
        try {
            const updatedTransaction = await updateTransactionAction(invoiceNumber, transaction);
            setTransactions(prev =>
                prev.map(t => t.invoiceNumber === invoiceNumber ? updatedTransaction : t)
            );
            return updatedTransaction;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Gagal mengupdate transaksi.";
            setError(errorMessage);
            console.error('Update transaction error:', err);
            throw err;
        }
    };

    return {
        invoiceNumber,
        date,
        saveInvoice,
        transactions,
        loading,
        error,
        deleteTransaction,
        updateTransaction,
        reload: loadTransactions,
    };
}
