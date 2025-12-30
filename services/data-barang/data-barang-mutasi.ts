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
    mode: 'add' | 'subtract' | 'set' = 'add',
    customUpdates?: Record<string, { quantity: number, itemName?: string }>
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

        // 2. Update Transaction Items
        for (const item of items) {
            // Get update data for this item (keyed by original item name)
            const updateData = customUpdates?.[item.item_name];
            
            // Determine new quantity using the 'set' logic or fallback to current
            const currentQty = item.quantity ?? 0;
            let newQty = currentQty;

            // If we have an explicit update quantity, use it based on mode
            if (updateData?.quantity !== undefined) {
                if (mode === 'set') {
                    newQty = updateData.quantity;
                } else {
                    const delta = mode === 'add' ? updateData.quantity : -updateData.quantity;
                    newQty = Math.max(0, currentQty + delta);
                }
            }
            
            // Determine new name (or keep existing)
            const newItemName = updateData?.itemName?.trim() || item.item_name;

            console.log(`[SYNC] Updating Mutation Item ${item.item_name}: Qty=${currentQty}->${newQty}, Name=${item.item_name}->${newItemName}`);

            const { error: updateError } = await supabase
                .from('transaction_mutation_items')
                .update({ 
                    quantity: newQty,
                    item_name: newItemName 
                })
                .eq('transaction_code', transactionCode)
                .eq('item_name', item.item_name);

            if (updateError) {
                console.error(`Error updating mutation item ${item.item_name}:`, updateError);
                continue;
            }

            updatedCount++;
        }

        return { success: true, count: updatedCount };

    } catch (error) {
        console.error('Error syncing stock:', error);
        throw new Error(`Gagal menyinkronkan stok: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

// Update not implemented yet as UI might only support Add/Read/Delete for now, 
// but easy to add if needed.
