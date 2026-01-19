"use server";

import { serverSupabase as supabase } from '@/lib/supabase-simple';
import { calculateCommissionForMechanicsAction } from '@/services/mechanic-settings/mechanic-settings';

/**
 * Backfill mechanic_performance table from existing transactions
 * Run this once to populate performance data for historical transactions
 */
export async function backfillMechanicPerformanceAction() {
    try {
        console.log('[backfillMechanicPerformance] Starting backfill...');

        // Get all transactions that have mechanics assigned
        const { data: transactions, error: transactionsError } = await supabase
            .from('data_transaksi')
            .select('id, invoice_number, date, saved_at, customer_mekaniks, total')
            .not('customer_mekaniks', 'is', null)
            .order('saved_at', { ascending: false });

        if (transactionsError) {
            console.error('[backfillMechanicPerformance] Error fetching transactions:', transactionsError);
            throw transactionsError;
        }

        console.log(`[backfillMechanicPerformance] Found ${transactions?.length || 0} transactions with mechanics`);

        if (!transactions || transactions.length === 0) {
            return { success: true, message: 'No transactions to backfill', count: 0 };
        }

        let successCount = 0;
        let errorCount = 0;
        const errors: any[] = []; // Track specific errors

        for (const transaction of transactions) {
            try {
                // Parse customer_mekaniks (could be string or object)
                let mekaniks = transaction.customer_mekaniks;
                if (typeof mekaniks === 'string') {
                    mekaniks = JSON.parse(mekaniks);
                }

                if (!Array.isArray(mekaniks) || mekaniks.length === 0) {
                    continue;
                }

                // Check if performance records already exist for this transaction
                const { data: existingRecords } = await supabase
                    .from('mechanic_performance')
                    .select('id')
                    .eq('transaction_id', transaction.id)
                    .limit(1);

                if (existingRecords && existingRecords.length > 0) {
                    console.log(`[backfillMechanicPerformance] Skipping transaction ${transaction.invoice_number} - already has performance records`);
                    continue;
                }

                // Calculate commissions
                const mechanicIds = mekaniks.map((m: any) => m.id);
                const mechanicPercentages = mekaniks.map((m: any) => ({
                    mechanic_id: m.id,
                    percentage: m.percentage
                }));

                const commissions = await calculateCommissionForMechanicsAction(
                    mechanicIds,
                    transaction.total,
                    mechanicPercentages
                );

                // Create performance records
                const performanceRecords = commissions.map(commission => ({
                    mechanic_id: commission.mechanic_id,
                    transaction_id: transaction.id,
                    transaction_date: transaction.date || transaction.saved_at.split('T')[0],
                    service_type: 'service',
                    service_name: 'Transaction Commission',
                    quantity: 1,
                    unit_price: commission.final_commission_amount,
                    total_price: commission.final_commission_amount,
                    commission_rate: commission.mechanic_commission_percentage,
                    commission_amount: commission.final_commission_amount,
                    performance_score: Math.min(100, Math.max(0, commission.mechanic_commission_percentage * 1.5)),
                    notes: `Backfilled - Shop cut: ${commission.shop_cut_percentage}%, Final commission: ${commission.final_commission_amount}`
                }));

                console.log(`[backfillMechanicPerformance] Attempting to insert for ${transaction.invoice_number}:`, performanceRecords);

                const { error: insertError } = await supabase
                    .from('mechanic_performance')
                    .insert(performanceRecords);

                if (insertError) {
                    console.error(`[backfillMechanicPerformance] Error inserting performance for ${transaction.invoice_number}:`, insertError);
                    errorCount++;
                    errors.push({
                        invoice: transaction.invoice_number,
                        error: insertError.message,
                        code: insertError.code,
                        details: insertError.details
                    });
                } else {
                    console.log(`[backfillMechanicPerformance] Successfully backfilled ${transaction.invoice_number}`);
                    successCount++;
                }

            } catch (error) {
                console.error(`[backfillMechanicPerformance] Error processing transaction ${transaction.invoice_number}:`, error);
                errorCount++;
                errors.push({
                    invoice: transaction.invoice_number,
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        }

        const result = {
            success: true,
            message: `Backfill complete: ${successCount} successful, ${errorCount} errors`,
            successCount,
            errorCount,
            totalTransactions: transactions.length,
            errors: errors.slice(0, 5) // Return first 5 errors for debugging
        };

        console.log('[backfillMechanicPerformance] Result:', result);
        return result;

    } catch (error) {
        console.error('[backfillMechanicPerformance] Fatal error:', error);
        throw new Error('Failed to backfill mechanic performance data');
    }
}
