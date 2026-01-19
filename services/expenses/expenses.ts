import { supabase } from '@/lib/supabase';

export interface Expense {
    id: number;
    date: string;
    description: string;
    amount: number;
    category: string;
    notes?: string;
    created_at: string;
    created_by: string;
}

export async function addExpenseAction(expense: Omit<Expense, 'id' | 'created_at' | 'created_by'>): Promise<Expense> {
    try {
        const { data, error } = await supabase
            .from('expenses')
            .insert({
                ...expense,
                created_by: (await supabase.auth.getUser()).data.user?.id
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error: any) {
        console.error('Error adding expense:', error);
        throw new Error(error.message || 'Gagal menambahkan pengeluaran');
    }
}

export async function getExpensesAction(startDate?: string, endDate?: string): Promise<Expense[]> {
    try {
        let query = supabase
            .from('expenses')
            .select('*')
            .order('date', { ascending: false });

        if (startDate) {
            query = query.gte('date', startDate);
        }
        if (endDate) {
            query = query.lte('date', endDate);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data || [];
    } catch (error: any) {
        console.error('Error fetching expenses:', error);
        throw new Error(error.message || 'Gagal mengambil data pengeluaran');
    }
}
