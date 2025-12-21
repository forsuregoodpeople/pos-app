import { supabase } from '@/lib/supabase';

export interface Supplier {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    contact_person?: string;
    created_at: string;
    updated_at: string;
}

export interface PurchaseItem {
    id: string;
    purchase_id: string;
    item_name: string;
    item_type: 'part' | 'service' | 'other';
    quantity: number;
    unit_price: number;
    total_price: number;
    created_at: string;
}

export interface Purchase {
    id: string;
    invoice_number: string;
    supplier_id?: string;
    supplier?: Supplier;
    purchase_date: string;
    total_amount: number;
    discount_amount: number;
    final_amount: number;
    paid_amount?: number;
    payment_status: 'pending' | 'partial' | 'paid' | 'overdue';
    payment_method?: string;
    due_date?: string;
    notes?: string;
    items?: PurchaseItem[];
    created_at: string;
    updated_at: string;
    created_by?: string;
}

export interface PurchaseReturn {
    id: string;
    purchase_id: string;
    return_date: string;
    reason?: string;
    total_amount: number;
    notes?: string;
    created_at: string;
    created_by?: string;
}

export interface PurchaseReturnItem {
    id: string;
    purchase_return_id: string;
    purchase_item_id: string;
    quantity: number;
    amount: number;
    created_at: string;
}

// Supplier functions
export async function getSuppliersAction(): Promise<Supplier[]> {
    try {
        const { data, error } = await supabase
            .from('suppliers')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching suppliers:', error);
        throw new Error('Gagal mengambil data supplier');
    }
}

export async function createSupplierAction(supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>): Promise<Supplier> {
    try {
        const { data, error } = await supabase
            .from('suppliers')
            .insert(supplier)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating supplier:', error);
        throw new Error('Gagal menambah supplier');
    }
}

export async function updateSupplierAction(id: string, supplier: Partial<Omit<Supplier, 'id' | 'created_at' | 'updated_at'>>): Promise<Supplier> {
    try {
        const { data, error } = await supabase
            .from('suppliers')
            .update({ ...supplier, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating supplier:', error);
        throw new Error('Gagal mengupdate supplier');
    }
}

export async function deleteSupplierAction(id: string): Promise<void> {
    try {
        const { error } = await supabase
            .from('suppliers')
            .delete()
            .eq('id', id);

        if (error) throw error;
    } catch (error) {
        console.error('Error deleting supplier:', error);
        throw new Error('Gagal menghapus supplier');
    }
}

// Purchase functions
export async function getPurchasesAction(): Promise<Purchase[]> {
    try {
        const { data, error } = await supabase
            .from('purchases')
            .select(`
                *,
                supplier:suppliers(id, name, phone, email),
                items:purchase_items(*)
            `)
            .order('purchase_date', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching purchases:', error);
        throw new Error('Gagal mengambil data pembelian');
    }
}

export async function createPurchaseAction(purchase: Omit<Purchase, 'id' | 'created_at' | 'updated_at' | 'items'>, items: Omit<PurchaseItem, 'id' | 'purchase_id' | 'created_at'>[]): Promise<Purchase> {
    try {
        // Start a transaction-like operation
        const { data: purchaseData, error: purchaseError } = await supabase
            .from('purchases')
            .insert({
                invoice_number: purchase.invoice_number,
                supplier_id: purchase.supplier_id,
                purchase_date: purchase.purchase_date,
                total_amount: purchase.total_amount,
                discount_amount: purchase.discount_amount,
                final_amount: purchase.final_amount,
                payment_status: purchase.payment_status,
                due_date: purchase.due_date,
                notes: purchase.notes,
                created_by: purchase.created_by
            })
            .select()
            .single();

        if (purchaseError) throw purchaseError;

        // Insert purchase items
        const itemsWithPurchaseId = items.map(item => ({
            ...item,
            purchase_id: purchaseData.id
        }));

        const { error: itemsError } = await supabase
            .from('purchase_items')
            .insert(itemsWithPurchaseId);

        if (itemsError) throw itemsError;

        // Fetch the complete purchase with items
        const { data: completePurchase, error: fetchError } = await supabase
            .from('purchases')
            .select(`
                *,
                supplier:suppliers(id, name, phone, email),
                items:purchase_items(*)
            `)
            .eq('id', purchaseData.id)
            .single();

        if (fetchError) throw fetchError;
        return completePurchase;
    } catch (error) {
        console.error('Error creating purchase:', error);
        throw new Error('Gagal menambah pembelian');
    }
}

export async function updatePurchaseAction(id: string, purchase: Partial<Omit<Purchase, 'id' | 'created_at' | 'updated_at' | 'items'>>): Promise<Purchase> {
    try {
        const { data, error } = await supabase
            .from('purchases')
            .update({ ...purchase, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating purchase:', error);
        throw new Error('Gagal mengupdate pembelian');
    }
}

export async function deletePurchaseAction(id: string): Promise<void> {
    try {
        const { error } = await supabase
            .from('purchases')
            .delete()
            .eq('id', id);

        if (error) throw error;
    } catch (error) {
        console.error('Error deleting purchase:', error);
        throw new Error('Gagal menghapus pembelian');
    }
}

// Purchase return functions
export async function getPurchaseReturnsAction(): Promise<PurchaseReturn[]> {
    try {
        const { data, error } = await supabase
            .from('purchase_returns')
            .select(`
                *,
                purchase:purchases(id, invoice_number, purchase_date),
                items:purchase_return_items(
                    *,
                    purchase_item:purchase_items(id, item_name, item_type)
                )
            `)
            .order('return_date', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching purchase returns:', error);
        throw new Error('Gagal mengambil data retur pembelian');
    }
}

export async function createPurchaseReturnAction(returnData: Omit<PurchaseReturn, 'id' | 'created_at'>, returnItems: Omit<PurchaseReturnItem, 'id' | 'purchase_return_id' | 'created_at'>[]): Promise<PurchaseReturn> {
    try {
        // Start a transaction-like operation
        const { data: returnDataResult, error: returnError } = await supabase
            .from('purchase_returns')
            .insert({
                purchase_id: returnData.purchase_id,
                return_date: returnData.return_date,
                reason: returnData.reason,
                total_amount: returnData.total_amount,
                notes: returnData.notes,
                created_by: returnData.created_by
            })
            .select()
            .single();

        if (returnError) throw returnError;

        // Insert return items
        const itemsWithReturnId = returnItems.map(item => ({
            ...item,
            purchase_return_id: returnDataResult.id
        }));

        const { error: itemsError } = await supabase
            .from('purchase_return_items')
            .insert(itemsWithReturnId);

        if (itemsError) throw itemsError;

        // Fetch the complete return with items
        const { data: completeReturn, error: fetchError } = await supabase
            .from('purchase_returns')
            .select(`
                *,
                purchase:purchases(id, invoice_number, purchase_date),
                items:purchase_return_items(
                    *,
                    purchase_item:purchase_items(id, item_name, item_type)
                )
            `)
            .eq('id', returnDataResult.id)
            .single();

        if (fetchError) throw fetchError;
        return completeReturn;
    } catch (error) {
        console.error('Error creating purchase return:', error);
        throw new Error('Gagal menambah retur pembelian');
    }
}

// Generate purchase invoice number
export function generatePurchaseInvoiceNumber(): string {
    const date = new Date();
    const timestamp = Date.now() % 1000;
    return `PUR-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${String(timestamp).padStart(3, '0')}`;
}