"use server";

import { serverSupabase as supabase } from '@/lib/supabase-simple';

export interface MechanicPerformance {
    id: string;
    mechanic_id: string;
    transaction_id: string;
    transaction_date: string;
    service_type: 'service' | 'part';
    service_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    commission_rate: number;
    commission_amount: number;
    performance_score: number;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface MechanicPerformanceSummary {
    mechanic_id: string;
    mechanic_name: string;
    total_transactions: number;
    total_revenue: number;
    total_commission: number;
    avg_performance_score: number;
    last_transaction_date: string;
    activity_status: 'Active' | 'Recent' | 'Inactive';
}

// Mechanic Performance functions
export async function getMechanicPerformanceAction(mechanicId?: string): Promise<MechanicPerformance[]> {
    try {
        let query = supabase
            .from('mechanic_performance')
            .select(`
                *,
                data_mekanik(name)
            `)
            .order('transaction_date', { ascending: false });

        if (mechanicId) {
            query = query.eq('mechanic_id', mechanicId);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching mechanic performance:', error);
        throw new Error('Gagal mengambil data performa mekanik');
    }
}

export async function getMechanicPerformanceSummaryAction(): Promise<MechanicPerformanceSummary[]> {
    try {
        console.log('[getMechanicPerformanceSummaryAction] Starting...');

        // First, check if there's any data at all (without join)
        const { data: countCheck, error: countError } = await supabase
            .from('mechanic_performance')
            .select('id', { count: 'exact', head: true });

        console.log('[getMechanicPerformanceSummaryAction] Table count check:', { count: countCheck, error: countError });

        // Get detailed performance data with shop cut calculations
        const { data: performanceData, error: performanceError } = await supabase
            .from('mechanic_performance')
            .select(`
                *,
                data_mekanik(name)
            `)
            .order('transaction_date', { ascending: false });

        console.log('[getMechanicPerformanceSummaryAction] Query result:', {
            recordCount: performanceData?.length || 0,
            error: performanceError,
            firstRecord: performanceData?.[0]
        });

        if (performanceError) {
            console.error('[getMechanicPerformanceSummaryAction] Query error:', performanceError);
            throw performanceError;
        }

        if (!performanceData || performanceData.length === 0) {
            console.log('[getMechanicPerformanceSummaryAction] No data found');
            return [];
        }

        // Group by mechanic and calculate summaries
        const mechanicMap = new Map<string, any>();

        for (const record of performanceData) {
            const mechanicId = record.mechanic_id;
            const mechanicName = record.data_mekanik?.name || 'Unknown';

            if (!mechanicMap.has(mechanicId)) {
                mechanicMap.set(mechanicId, {
                    mechanic_id: mechanicId,
                    mechanic_name: mechanicName,
                    total_transactions: 0,
                    total_revenue: 0,
                    total_commission: 0,
                    performance_scores: [],
                    last_transaction_date: record.transaction_date
                });
            }

            const mechanic = mechanicMap.get(mechanicId);
            mechanic.total_transactions += 1;
            mechanic.total_revenue += record.total_price;
            mechanic.total_commission += record.commission_amount;
            mechanic.performance_scores.push(record.performance_score);

            // Update last transaction date if newer
            if (new Date(record.transaction_date) > new Date(mechanic.last_transaction_date)) {
                mechanic.last_transaction_date = record.transaction_date;
            }
        }

        // Calculate activity status and avg performance score
        const summaries: MechanicPerformanceSummary[] = [];
        const now = new Date();

        for (const [mechanicId, data] of mechanicMap.entries()) {
            const avgPerformanceScore = data.performance_scores.length > 0
                ? data.performance_scores.reduce((sum: number, score: number) => sum + score, 0) / data.performance_scores.length
                : 0;

            const lastTransactionDate = new Date(data.last_transaction_date);
            const daysSinceLastTransaction = Math.floor((now.getTime() - lastTransactionDate.getTime()) / (1000 * 60 * 60 * 24));

            let activityStatus: 'Active' | 'Recent' | 'Inactive';
            if (daysSinceLastTransaction <= 7) {
                activityStatus = 'Active';
            } else if (daysSinceLastTransaction <= 30) {
                activityStatus = 'Recent';
            } else {
                activityStatus = 'Inactive';
            }

            summaries.push({
                mechanic_id: mechanicId,
                mechanic_name: data.mechanic_name,
                total_transactions: data.total_transactions,
                total_revenue: data.total_revenue,
                total_commission: data.total_commission,
                avg_performance_score: avgPerformanceScore,
                last_transaction_date: data.last_transaction_date,
                activity_status: activityStatus
            });
        }

        // Sort by total revenue
        summaries.sort((a, b) => b.total_revenue - a.total_revenue);

        return summaries;
    } catch (error) {
        console.error('Error fetching mechanic performance summary:', error);
        throw new Error('Gagal mengambil ringkasan performa mekanik');
    }
}

export async function createMechanicPerformanceAction(performance: Omit<MechanicPerformance, 'id' | 'created_at' | 'updated_at'>): Promise<MechanicPerformance> {
    try {

        const { data, error } = await supabase
            .from('mechanic_performance')
            .insert(performance)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating mechanic performance:', error);
        throw new Error('Gagal menambah data performa mekanik');
    }
}

export async function updateMechanicPerformanceAction(id: string, performance: Partial<Omit<MechanicPerformance, 'id' | 'created_at' | 'updated_at'>>): Promise<MechanicPerformance> {
    try {

        const { data, error } = await supabase
            .from('mechanic_performance')
            .update({ ...performance, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating mechanic performance:', error);
        throw new Error('Gagal mengupdate data performa mekanik');
    }
}

export async function deleteMechanicPerformanceAction(id: string): Promise<void> {
    try {

        const { error } = await supabase
            .from('mechanic_performance')
            .delete()
            .eq('id', id);

        if (error) throw error;
    } catch (error) {
        console.error('Error deleting mechanic performance:', error);
        throw new Error('Gagal menghapus data performa mekanik');
    }
}

export async function getTopPerformersAction(limit: number = 10): Promise<MechanicPerformanceSummary[]> {
    try {

        const { data, error } = await supabase
            .from('mechanic_performance_summary')
            .select('*')
            .eq('activity_status', 'Active')
            .order('total_revenue', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching top performers:', error);
        throw new Error('Gagal mengambil data mekanik terbaik');
    }
}

export async function getPerformanceByDateRangeAction(startDate: string, endDate: string): Promise<MechanicPerformance[]> {
    try {


        // Ensure endDate includes the entire day
        const effectiveEndDate = endDate.length === 10 ? `${endDate}T23:59:59` : endDate;

        const { data, error } = await supabase
            .from('mechanic_performance')
            .select(`
                *,
                data_mekanik(name)
            `)
            .gte('transaction_date', startDate)
            .lte('transaction_date', effectiveEndDate)
            .order('transaction_date', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching performance by date range:', error);
        throw new Error('Gagal mengambil data performa berdasarkan tanggal');
    }
}

export async function getPerformanceTrendAction(months: number = 6): Promise<{ month: string; avg_score: number }[]> {
    try {

        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(endDate.getMonth() - months + 1);

        const { data, error } = await supabase
            .from('mechanic_performance')
            .select('performance_score, transaction_date, commission_amount, total_price')
            .gte('transaction_date', startDate.toISOString().split('T')[0])
            .lte('transaction_date', endDate.toISOString()) // Use full ISO string to include time
            .order('transaction_date', { ascending: true });

        if (error) throw error;

        if (!data || data.length === 0) {
            // Return empty trend if no data
            return [];
        }

        // Group by month and calculate average
        const monthlyData: { [key: string]: { scores: number[], commissions: number[] } } = {};

        data.forEach(item => {
            const date = new Date(item.transaction_date);
            const monthKey = date.toLocaleDateString('id-ID', { year: 'numeric', month: 'short' });

            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { scores: [], commissions: [] };
            }
            monthlyData[monthKey].scores.push(item.performance_score);
            monthlyData[monthKey].commissions.push(item.commission_amount);
        });

        // Calculate average for each month
        const trendData = Object.entries(monthlyData).map(([month, data]) => ({
            month,
            avg_score: data.scores.length > 0
                ? data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length
                : 0,
            avg_commission: data.commissions.length > 0
                ? data.commissions.reduce((sum, commission) => sum + commission, 0) / data.commissions.length
                : 0
        }));

        return trendData;
    } catch (error) {
        console.error('Error fetching performance trend:', error);
        throw new Error('Gagal mengambil data trend performa');
    }
}
