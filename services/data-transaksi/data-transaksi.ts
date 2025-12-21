'use server'

import { supabase } from '@/lib/supabase';
import { Transaction } from '@/hooks/useTransaction';

interface TransactionRow {
    id: number;
    invoice_number: string;
    date: string;
    customer_name: string;
    customer_phone: string;
    customer_km_masuk: string;
    customer_mobil: string;
    customer_plat_nomor: string;
    customer_tipe: 'umum' | 'perusahaan';
    customer_mekanik: string;
    customer_mekaniks: any; // JSON object
    items: any; // JSON object
    total: number;
    keterangan: string | null;
    saved_at: string;
    created_at: string;
    updated_at: string;
}

const parseJson = (data: any): any => {
    if (!data) return [];
    if (typeof data === 'object') return data;
    try {
        return JSON.parse(data);
    } catch (e) {
        console.error('Error parsing JSON:', e);
        return [];
    }
};

export async function getTransactionsAction(): Promise<Transaction[]> {
    try {
        const { data, error } = await supabase
            .from('data_transaksi')
            .select('*')
            .order('saved_at', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching transactions from Supabase:', error);
            throw new Error(`Gagal mengambil data transaksi dari database: ${error.message}`);
        }

        const transactions: Transaction[] = (data as TransactionRow[]).map((row) => {
            const items = parseJson(row.items).map((item: any) => ({
                id: item.id || '',
                type: item.type || 'part',
                name: item.name || 'Unknown Item',
                price: Number(item.price) || 0,
                qty: Number(item.qty) || 1,
                discount: Number(item.discount) || 0
            }));

            const mekaniks = parseJson(row.customer_mekaniks);

            return {
                invoiceNumber: row.invoice_number,
                date: row.date,
                customer: {
                    name: row.customer_name,
                    phone: row.customer_phone,
                    kmMasuk: row.customer_km_masuk,
                    mobil: row.customer_mobil,
                    platNomor: row.customer_plat_nomor,
                    tipe: row.customer_tipe || 'umum',
                    mekanik: row.customer_mekanik,
                    mekaniks: mekaniks
                },
                items: items,
                total: Number(row.total),
                savedAt: row.saved_at,
                keterangan: row.keterangan || undefined
            };
        });

        return transactions;
    } catch (error) {
        console.error('Error fetching transactions from Supabase:', error);
        throw new Error(`Gagal mengambil data transaksi dari database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function saveTransactionAction(transaction: Transaction): Promise<Transaction> {
    try {
        // Check if invoice number already exists
        const { data: existingRows, error } = await supabase
            .from('data_transaksi')
            .select('invoice_number')
            .eq('invoice_number', transaction.invoiceNumber);

        if (error) {
            console.error('Error checking existing invoice:', error);
            throw new Error(`Gagal memeriksa invoice: ${error.message}`);
        }

        if (existingRows.length > 0) {
            throw new Error(`Invoice number ${transaction.invoiceNumber} sudah ada.`);
        }

        // Insert transaction
        const { error: insertError } = await supabase
            .from('data_transaksi')
            .insert({
                invoice_number: transaction.invoiceNumber,
                date: transaction.date,
                customer_name: transaction.customer.name,
                customer_phone: transaction.customer.phone,
                customer_km_masuk: transaction.customer.kmMasuk,
                customer_mobil: transaction.customer.mobil,
                customer_plat_nomor: transaction.customer.platNomor,
                customer_tipe: transaction.customer.tipe || 'umum',
                customer_mekanik: transaction.customer.mekanik || '',
                customer_mekaniks: transaction.customer.mekaniks || [],
                items: transaction.items,
                total: transaction.total,
                keterangan: transaction.keterangan || null,
                saved_at: transaction.savedAt || new Date().toISOString()
            });

        if (insertError) {
            console.error('Error saving transaction:', insertError);
            throw new Error(`Gagal menyimpan transaksi: ${insertError.message}`);
        }

        return transaction;
    } catch (error) {
        console.error('Error saving transaction:', error);
        throw new Error(`Gagal menyimpan transaksi: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function updateTransactionAction(invoiceNumber: string, transaction: Transaction): Promise<Transaction> {
    try {
        // Check if transaction exists
        const { data: existingRows, error } = await supabase
            .from('data_transaksi')
            .select('id')
            .eq('invoice_number', invoiceNumber);

        if (error) {
            console.error('Error checking existing transaction:', error);
            throw new Error(`Gagal memeriksa transaksi: ${error.message}`);
        }

        if (existingRows.length === 0) {
            throw new Error(`Transaksi dengan invoice ${invoiceNumber} tidak ditemukan.`);
        }

        // Update transaction
        const { error: updateError } = await supabase
            .from('data_transaksi')
            .update({
                invoice_number: transaction.invoiceNumber,
                date: transaction.date,
                customer_name: transaction.customer.name,
                customer_phone: transaction.customer.phone,
                customer_km_masuk: transaction.customer.kmMasuk,
                customer_mobil: transaction.customer.mobil,
                customer_plat_nomor: transaction.customer.platNomor,
                customer_tipe: transaction.customer.tipe || 'umum',
                customer_mekanik: transaction.customer.mekanik || '',
                customer_mekaniks: transaction.customer.mekaniks || [],
                items: transaction.items,
                total: transaction.total,
                keterangan: transaction.keterangan || null,
                saved_at: transaction.savedAt || new Date().toISOString()
            })
            .eq('invoice_number', invoiceNumber);

        if (updateError) {
            console.error('Error updating transaction:', updateError);
            throw new Error(`Gagal mengupdate transaksi: ${updateError.message}`);
        }

        return transaction;
    } catch (error) {
        console.error('Error updating transaction:', error);
        throw new Error(`Gagal mengupdate transaksi: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function deleteTransactionAction(invoiceNumber: string) {
    try {
        // Check if transaction exists
        const { data: existingRows, error } = await supabase
            .from('data_transaksi')
            .select('id')
            .eq('invoice_number', invoiceNumber);

        if (error) {
            console.error('Error checking existing transaction:', error);
            throw new Error(`Gagal memeriksa transaksi: ${error.message}`);
        }

        if (existingRows.length === 0) {
            throw new Error(`Transaksi dengan invoice ${invoiceNumber} tidak ditemukan.`);
        }

        // Delete transaction
        const { error: deleteError } = await supabase
            .from('data_transaksi')
            .delete()
            .eq('invoice_number', invoiceNumber);

        if (deleteError) {
            console.error('Error deleting transaction:', deleteError);
            throw new Error(`Gagal menghapus transaksi: ${deleteError.message}`);
        }

        return { success: true };
    } catch (error) {
        console.error('Error deleting transaction:', error);
        throw new Error(`Gagal menghapus transaksi: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
