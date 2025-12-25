'use server'

import { supabase } from '@/lib/supabase';

// Helper to parse JSON safely if needed, though for this simple structure we might not need complex parsing
// unless we change how items are stored. In FIX.md, items are in a separate table.

export interface DataBarangMutasiItem {
    id?: number;
    transactionCode: string;
    itemName: string;
    supplierCode?: string;
    priceCode?: string | number;
    quantity: number;
}

export interface DataBarangMutasi {
    transactionCode: string;
    customerName: string;
    datePurchase: string;
    items: DataBarangMutasiItem[];
    createdAt?: string;
}

interface TransactionMutationRow {
    transaction_code: string;
    customer_name: string;
    date_purchase: string;
    created_at: string;
}

interface TransactionMutationItemRow {
    id: number;
    transaction_code: string;
    item_name: string;
    supplier_code: string | null;
    price_code: string | null;
    quantity: number;
    created_at: string;
}

export async function getDataBarangMutasiAction(): Promise<DataBarangMutasi[]> {
    try {
        // Fetch headers
        const { data: headers, error: headerError } = await supabase
            .from('transaction_mutation')
            .select('*')
            .order('created_at', { ascending: false });

        if (headerError) {
            console.error('Error fetching mutation headers:', headerError);
            throw new Error(`Gagal mengambil data branding mutasi: ${headerError.message}`);
        }

        if (!headers || headers.length === 0) {
            return [];
        }

        // Fetch all items for these headers
        // Optimization: Fetch items for the fetched transaction codes
        const transactionCodes = headers.map(h => h.transaction_code);
        const { data: items, error: itemError } = await supabase
            .from('transaction_mutation_items')
            .select('*')
            .in('transaction_code', transactionCodes);

        if (itemError) {
            console.error('Error fetching mutation items:', itemError);
            throw new Error(`Gagal mengambil detail barang mutasi: ${itemError.message}`);
        }

        // Group items by transaction_code
        const itemsMap = new Map<string, DataBarangMutasiItem[]>();
        items.forEach((item: TransactionMutationItemRow) => {

            const mappedItem: DataBarangMutasiItem = {
                id: item.id,
                transactionCode: item.transaction_code,
                itemName: item.item_name,
                supplierCode: item.supplier_code || undefined,
                priceCode: item.price_code || undefined,
                quantity: item.quantity
            };
            
            if (!itemsMap.has(item.transaction_code)) {
                itemsMap.set(item.transaction_code, []);
            }
            itemsMap.get(item.transaction_code)?.push(mappedItem);
        });

        // Assemble result
        const results: DataBarangMutasi[] = (headers as TransactionMutationRow[]).map(header => ({
            transactionCode: header.transaction_code,
            customerName: header.customer_name,
            datePurchase: header.date_purchase,
            createdAt: header.created_at,
            items: itemsMap.get(header.transaction_code) || []
        }));

        return results;
    } catch (error) {
        console.error('Error in getDataBarangMutasiAction:', error);
        throw new Error(`Gagal mengambil data barang mutasi: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function updateStock(transactionCode: string, stock : number): Promise<{ success: boolean }> {

    try {
        const { error } = await supabase
            .from('transaction_mutation_items')
            .update({ quantity: stock } as any) // Casting as any for now if column differs, but assuming they meant quantity or stock. Actually, let's keep it minimal change but fix syntax.
            .eq('transaction_code', transactionCode);

        if (error) {
            throw new Error(`Gagal mengupdate stok: ${error.message}`);
        }

        return { success: true };
    } catch (error){
        console.error('Error updating stock:', error);
        throw new Error(`Gagal mengupdate stok: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}


export async function deleteDataBarangMutasiAction(transactionCode: string): Promise<{ success: boolean }> {
    try {
        // Cascading delete should handle items if configured in DB, but explicit is safer or reliant on FK ON DELETE CASCADE
        // FIX.md defines: REFERENCES transaction_mutation(transaction_code) ON DELETE CASCADE
        // So deleting header is enough.

        const { error } = await supabase
            .from('transaction_mutation')
            .delete()
            .eq('transaction_code', transactionCode);

        if (error) {
            throw new Error(`Gagal menghapus transaksi: ${error.message}`);
        }

        return { success: true };
    } catch (error) {
        console.error('Error deleting data barang mutasi:', error);
        throw new Error(`Gagal menghapus data barang mutasi: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function synchronizeStockAction(
    transactionCode: string, 
    mode: 'add' | 'subtract' = 'add',
    customQuantities?: Record<string, number>
): Promise<{ success: boolean; count: number }> {
    try {
        // 1. Fetch items for this transaction
        const { data: items, error: itemsError } = await supabase
            .from('transaction_mutation_items')
            .select('item_name, quantity')
            .eq('transaction_code', transactionCode);

        if (itemsError) {
            throw new Error(`Gagal mengambil data item mutasi: ${itemsError.message}`);
        }

        if (!items || items.length === 0) {
            return { success: true, count: 0 };
        }

        let updatedCount = 0;

        // 2. Update Master Stock (data_barang) for each item
        // We match by name since code might not be available in mutation items or reliable
        for (const item of items) {
            // Use custom quantity if provided, otherwise use mutation quantity
            const quantityToSync = customQuantities?.[item.item_name] ?? item.quantity;
            
            console.log(`[SYNC] Processing: ${item.item_name}, Quantity to sync: ${quantityToSync}, Mode: ${mode}`);
            
            // Skip if custom quantity is 0 or negative
            if (quantityToSync <= 0) {
                console.log(`[SYNC] Skipping ${item.item_name} - quantity is ${quantityToSync}`);
                continue;
            }

            // Get current quantity from transaction_mutation_items
            const currentQty = item.quantity ?? 0;
            const delta = mode === 'add' ? quantityToSync : -quantityToSync;
            const newQty = Math.max(0, currentQty + delta);

            console.log(`[SYNC] ${item.item_name}: Current=${currentQty}, Delta=${delta}, New=${newQty}`);

            // First, let's see what's actually in the database
            const { data: checkData, error: checkError } = await supabase
                .from('transaction_mutation_items')
                .select('*')
                .eq('transaction_code', transactionCode);

            console.log(`[SYNC DEBUG] Database check for transaction ${transactionCode}:`, {
                error: checkError,
                totalRows: checkData?.length || 0,
                items: checkData?.map(d => ({
                    item_name: d.item_name,
                    item_name_length: d.item_name?.length,
                    item_name_bytes: JSON.stringify(d.item_name),
                    quantity: d.quantity
                }))
            });

            // Update quantity in transaction_mutation_items table
            console.log(`[SYNC DEBUG] About to update:`, {
                table: 'transaction_mutation_items',
                transaction_code: transactionCode,
                item_name: item.item_name,
                item_name_length: item.item_name.length,
                item_name_bytes: JSON.stringify(item.item_name),
                old_quantity: currentQty,
                new_quantity: newQty
            });

            const { data: updateResult, error: updateError } = await supabase
                .from('transaction_mutation_items')
                .update({ quantity: newQty })
                .eq('transaction_code', transactionCode)
                .eq('item_name', item.item_name)
                .select(); // Add select to see what was updated

            console.log(`[SYNC DEBUG] Update result:`, {
                success: !updateError,
                rowsAffected: updateResult?.length || 0,
                error: updateError,
                data: updateResult
            });

            if (updateError) {
                console.error(`[SYNC ERROR] Error updating quantity for ${item.item_name}:`, updateError);
                continue;
            } else if (!updateResult || updateResult.length === 0) {
                console.error(`[SYNC ERROR] No rows updated for ${item.item_name} - item might not exist or WHERE clause didn't match`);
                continue;
            } else {
                console.log(`[SYNC SUCCESS] Updated ${item.item_name} from ${currentQty} to ${newQty} in transaction_mutation_items`);
                updatedCount++;
            }
        }

        return { success: true, count: updatedCount };

    } catch (error) {
        console.error('Error syncing stock:', error);
        throw new Error(`Gagal menyinkronkan stok: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

// Update not implemented yet as UI might only support Add/Read/Delete for now, 
// but easy to add if needed.
