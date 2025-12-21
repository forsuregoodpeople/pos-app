import { supabase } from '@/lib/supabase';

export interface PaymentType {
    id: string;
    name: string;
    description?: string;
    is_active: boolean;
    is_default: boolean;
    created_at: string;
    updated_at: string;
}

// Payment Type functions
export async function getPaymentTypesAction(): Promise<PaymentType[]> {
    try {
        const { data, error } = await supabase
            .from('payment_types')
            .select('*')
            .order('is_default', { ascending: false })
            .order('name', { ascending: true });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching payment types:', error);
        throw new Error('Gagal mengambil data tipe pembayaran');
    }
}

export async function createPaymentTypeAction(paymentType: Omit<PaymentType, 'id' | 'created_at' | 'updated_at'>): Promise<PaymentType> {
    try {
        const { data, error } = await supabase
            .from('payment_types')
            .insert(paymentType)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating payment type:', error);
        throw new Error('Gagal menambah tipe pembayaran');
    }
}

export async function updatePaymentTypeAction(id: string, paymentType: Partial<Omit<PaymentType, 'id' | 'created_at' | 'updated_at'>>): Promise<PaymentType> {
    try {
        const { data, error } = await supabase
            .from('payment_types')
            .update({ ...paymentType, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating payment type:', error);
        throw new Error('Gagal mengupdate tipe pembayaran');
    }
}

export async function deletePaymentTypeAction(id: string): Promise<void> {
    try {
        const { error } = await supabase
            .from('payment_types')
            .delete()
            .eq('id', id);

        if (error) throw error;
    } catch (error) {
        console.error('Error deleting payment type:', error);
        throw new Error('Gagal menghapus tipe pembayaran');
    }
}

export async function setDefaultPaymentTypeAction(id: string): Promise<void> {
    try {
        // First, unset all default payment types
        const { error: unsetError } = await supabase
            .from('payment_types')
            .update({ is_default: false })
            .neq('id', id);

        if (unsetError) throw unsetError;

        // Then set the new default
        const { error: setDefaultError } = await supabase
            .from('payment_types')
            .update({ is_default: true })
            .eq('id', id);

        if (setDefaultError) throw setDefaultError;
    } catch (error) {
        console.error('Error setting default payment type:', error);
        throw new Error('Gagal mengatur tipe pembayaran default');
    }
}

export async function getDefaultPaymentTypeAction(): Promise<PaymentType | null> {
    try {
        const { data, error } = await supabase
            .from('payment_types')
            .select('*')
            .eq('is_default', true)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            throw error;
        }
        return data;
    } catch (error) {
        console.error('Error fetching default payment type:', error);
        throw new Error('Gagal mengambil tipe pembayaran default');
    }
}