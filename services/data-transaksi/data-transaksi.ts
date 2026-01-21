'use server'

import { createClient } from '@/lib/supabase-server';
import { Transaction } from '@/hooks/useTransaction';
import { calculateCommissionForMechanicsAction, CommissionCalculation } from '@/services/mechanic-settings/mechanic-settings';

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
    payment_type_id: string | null;
    payment_type_name: string | null;
    saved_at: string;
    payment_status: string;
    paid_amount: number;
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

export async function getNextInvoiceNumberAction(): Promise<string> {
    try {
        const supabase = await createClient();

        // Get the last invoice number from the database
        const { data, error } = await supabase
            .from('data_transaksi')
            .select('invoice_number')
            .order('id', { ascending: false })
            .limit(1);

        if (error) {
            console.error('Error fetching last invoice number:', error);
            // If there's an error, start from 100
            return 'INV-00100';
        }

        // If no invoices exist, start from 100
        if (!data || data.length === 0) {
            return 'INV-00100';
        }

        // Extract the number from the last invoice
        const lastInvoice = data[0].invoice_number;

        // Try to extract number from various formats
        // Handle formats like: INV-00100, INV-100, INV-20250119-100, etc.
        const numberMatch = lastInvoice.match(/(\d+)$/);

        if (numberMatch) {
            const lastNumber = parseInt(numberMatch[1], 10);
            const nextNumber = lastNumber + 1;
            // Format with 5-digit zero padding
            return `INV-${String(nextNumber).padStart(5, '0')}`;
        }

        // If we can't parse the last invoice, start from 100
        return 'INV-00100';
    } catch (error) {
        console.error('Error getting next invoice number:', error);
        // If there's any error, start from 100
        return 'INV-00100';
    }
}

export async function getTransactionsAction(): Promise<Transaction[]> {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('data_transaksi')
            .select('*')
            .order('saved_at', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching transactions from Supabase:', error);
            throw new Error(`Gagal mengambil data transaksi dari database: ${error.message}`);
        }

        const transactions: any = (data as TransactionRow[]).map((row) => {
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
                keterangan: row.keterangan || undefined,
                paymentTypeId: row.payment_type_id || undefined,
                paymentTypeName: row.payment_type_name || undefined,
                payment_status: row.payment_status || 'paid',
                paid_amount: Number(row.paid_amount) || 0
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
        const supabase = await createClient();
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

        // Calculate mechanic commissions with shop cut
        let mechanicCommissions: CommissionCalculation[] = [];
        if (transaction.customer.mekaniks && transaction.customer.mekaniks.length > 0) {
            try {
                const mechanicIds = transaction.customer.mekaniks.map((m: any) => Number(m.id));
                const mechanicPercentages = transaction.customer.mekaniks.map((m: any) => ({
                    mechanic_id: Number(m.id),
                    percentage: Number(m.percentage)
                }));

                mechanicCommissions = await calculateCommissionForMechanicsAction(
                    mechanicIds,
                    transaction.total,
                    mechanicPercentages
                );
            } catch (commissionError) {
                console.error('Error calculating commissions:', commissionError);
                // Continue with transaction even if commission calculation fails
            }
        }

        // Insert transaction with commission data
        // Note: mechanic_commissions is tracked in the mechanic_performance table instead

        // Validate customer_tipe - must be 'umum' or 'perusahaan'
        const validCustomerTipes = ['umum', 'perusahaan'];
        const customerTipe = validCustomerTipes.includes(transaction.customer.tipe)
            ? transaction.customer.tipe
            : 'umum';

        const { data: savedTransaction, error: insertError } = await supabase
            .from('data_transaksi')
            .insert({
                invoice_number: transaction.invoiceNumber,
                date: transaction.date,
                customer_name: transaction.customer.name,
                customer_phone: transaction.customer.phone,
                customer_km_masuk: transaction.customer.kmMasuk,
                customer_mobil: transaction.customer.mobil,
                customer_plat_nomor: transaction.customer.platNomor,
                customer_tipe: customerTipe,
                customer_mekanik: transaction.customer.mekanik || '',
                customer_mekaniks: transaction.customer.mekaniks || [],
                items: transaction.items,
                total: transaction.total,
                keterangan: transaction.keterangan || null,
                payment_type_id: transaction.paymentTypeId || null,
                payment_type_name: transaction.paymentTypeName || null,
                saved_at: transaction.savedAt || new Date().toISOString()
            })
            .select()
            .single();

        if (insertError) {
            console.error('Error saving transaction:', insertError);
            throw new Error(`Gagal menyimpan transaksi: ${insertError.message}`);
        }

        // Also save to mechanic_performance table for tracking
        if (mechanicCommissions.length > 0 && savedTransaction) {
            try {
                console.log('[saveTransactionAction] Saving mechanic performance for transaction:', savedTransaction.id);
                console.log('[saveTransactionAction] Mechanic commissions:', mechanicCommissions);

                const performanceRecords = mechanicCommissions.map(commission => ({
                    mechanic_id: commission.mechanic_id,
                    transaction_id: savedTransaction.id, // Use the actual ID from the saved transaction
                    transaction_date: transaction.date,
                    service_type: 'service',
                    service_name: 'Transaction Commission',
                    quantity: 1,
                    unit_price: commission.final_commission_amount,
                    total_price: commission.final_commission_amount,
                    commission_rate: commission.mechanic_commission_percentage,
                    commission_amount: commission.final_commission_amount,
                    performance_score: Math.min(100, Math.max(0, commission.mechanic_commission_percentage * 1.5)), // Simple performance score calculation
                    notes: `Shop cut: ${commission.shop_cut_percentage}%, Final commission: ${commission.final_commission_amount}`
                }));

                console.log('[saveTransactionAction] Performance records to insert:', performanceRecords);

                const { data: insertedPerformance, error: performanceError } = await supabase
                    .from('mechanic_performance')
                    .insert(performanceRecords)
                    .select();

                if (performanceError) {
                    console.error('[saveTransactionAction] Error saving mechanic performance:', performanceError);
                    // Don't fail the transaction if performance tracking fails
                } else {
                    console.log('[saveTransactionAction] Successfully saved mechanic performance:', insertedPerformance);
                }
            } catch (performanceError) {
                console.error('[saveTransactionAction] Exception while saving mechanic performance:', performanceError);
                // Don't fail the transaction if performance tracking fails
            }
        } else {
            console.log('[saveTransactionAction] Skipping mechanic performance save:', {
                hasCommissions: mechanicCommissions.length > 0,
                hasSavedTransaction: !!savedTransaction
            });
        }

        return transaction;
    } catch (error) {
        console.error('Error saving transaction:', error);
        throw new Error(`Gagal menyimpan transaksi: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function updateTransactionAction(invoiceNumber: string, transaction: Transaction): Promise<Transaction> {
    try {
        const supabase = await createClient();
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
                payment_type_id: transaction.paymentTypeId || null,
                payment_type_name: transaction.paymentTypeName || null,
                payment_status: transaction.payment_status || 'paid',
                paid_amount: transaction.paid_amount || 0,
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
        const supabase = await createClient();
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
