import { useState, useEffect, useCallback } from 'react';
import { CartItem } from './useCart';
import { CustomerInfo } from './useCustomer';
import { 
    getTransactionsAction, 
    saveTransactionAction,
    deleteTransactionAction,
} from '@/services/data-transaksi/data-transaksi';

export interface Transaction {
    invoiceNumber: string;
    date: string;
    customer: CustomerInfo;
    items: CartItem[];
    total: number;
    savedAt: string;
}

export function useTransaction() {
    const [invoiceNumber, setInvoiceNumber] = useState('INV-LOADING');
    const [date] = useState(() => new Date().toISOString().split('T')[0]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const rand : number = Math.floor((Math.random() * 1000) + 1);

    const loadTransactions = useCallback(async () => {
        console.log('useTransaction: Starting loadTransactions');
        setLoading(true);
        setError(null);
        try {
            const data = await getTransactionsAction();
            console.log('useTransaction: Transactions loaded successfully:', data.length, 'items');
            setTransactions(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Gagal memuat data transaksi.";
            console.error('useTransaction: Load error:', errorMessage);
            setError(errorMessage);
            setTransactions([]);
        } finally {
            console.log('useTransaction: Setting loading to false');
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const date = new Date();
        const newInvoiceNumber = `INV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${String(rand).padStart(3, '0')}`;
        setInvoiceNumber(newInvoiceNumber);
        
        loadTransactions();
    }, [loadTransactions]);

    const saveInvoice = async (customer: CustomerInfo, items: CartItem[], total: number) => {
        const invoiceData: Transaction = {
            invoiceNumber,
            date,
            customer,
            items,
            total,
            savedAt: new Date().toISOString()
        };

        try {
            const savedTransaction = await saveTransactionAction(invoiceData);
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

    return {
        invoiceNumber,
        date,
        saveInvoice,
        transactions,
        loading,
        error,
        deleteTransaction,
        reload: loadTransactions,
    };
}
