import { supabase } from '@/lib/supabase';

export interface FinancialReport {
    id: number;
    report_type: 'profit_loss' | 'balance_sheet' | 'cash_flow';
    report_period: 'monthly' | 'quarterly' | 'yearly';
    period_start_date: string;
    period_end_date: string;
    report_data: any;
    created_at: string;
    updated_at: string;
    created_by: number;
}

export interface ChartOfAccount {
    id: number;
    account_code: string;
    account_name: string;
    account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
    parent_account_id?: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface JournalEntry {
    id: number;
    entry_number: string;
    entry_date: string;
    description?: string;
    reference_type?: string;
    reference_id?: string;
    total_amount: number;
    created_at: string;
    created_by: number;
    journal_entry_lines?: Array<{
        id: number;
        account_id: number;
        description?: string;
        debit_amount: number;
        credit_amount: number;
        created_at: string;
        chart_of_accounts?: {
            account_code: string;
            account_name: string;
            account_type: string;
        };
    }>;
}

export interface JournalEntryLine {
    id: number;
    journal_entry_id: number;
    account_id: number;
    description?: string;
    debit_amount: number;
    credit_amount: number;
    created_at: string;
}

export interface ProfitLossData {
    revenue: {
        service_revenue: number;
        product_revenue: number;
        other_revenue: number;
        total_revenue: number;
    };
    expenses: {
        cost_of_goods_sold: number;
        mechanic_commissions: number;
        operating_expenses: number;
        administrative_expenses: number;
        depreciation_expenses: number;
        total_expenses: number;
    };
    profit: {
        gross_profit: number;
        operating_profit: number;
        net_profit: number;
    };
}

export interface BalanceSheetData {
    assets: {
        current_assets: {
            cash: number;
            bank: number;
            accounts_receivable: number;
            inventory: number;
            total_current_assets: number;
        };
        fixed_assets: {
            equipment: number;
            accumulated_depreciation: number;
            net_fixed_assets: number;
        };
        total_assets: number;
    };
    liabilities: {
        current_liabilities: {
            accounts_payable: number;
            accrued_expenses: number;
            total_current_liabilities: number;
        };
        total_liabilities: number;
    };
    equity: {
        capital: number;
        retained_earnings: number;
        current_year_profit: number;
        total_equity: number;
    };
}

export interface CashFlowData {
    operating_activities: {
        cash_from_customers: number;
        cash_paid_to_suppliers: number;
        cash_paid_to_mechanics: number;
        cash_paid_for_expenses: number;
        net_operating_cash: number;
    };
    investing_activities: {
        equipment_purchase: number;
        equipment_sale: number;
        net_investing_cash: number;
    };
    financing_activities: {
        capital_injection: number;
        owner_drawings: number;
        net_financing_cash: number;
    };
    net_cash_change: number;
    cash_beginning: number;
    cash_ending: number;
}

// Financial Reports functions
export async function getFinancialReportsAction(
    reportType?: string,
    period?: string,
    limit: number = 50
): Promise<FinancialReport[]> {
    try {
        let query = supabase
            .from('financial_reports')
            .select('*')
            .order('created_at', { ascending: false });

        if (reportType) {
            query = query.eq('report_type', reportType);
        }

        if (period) {
            query = query.eq('report_period', period);
        }

        query = query.limit(limit);

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching financial reports:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error fetching financial reports:', error);
        return [];
    }
}

export async function saveFinancialReportAction(
    reportType: 'profit_loss' | 'balance_sheet' | 'cash_flow',
    reportPeriod: 'monthly' | 'quarterly' | 'yearly',
    periodStartDate: string,
    periodEndDate: string,
    reportData: any
): Promise<FinancialReport> {
    try {
        const { data, error } = await supabase
            .from('financial_reports')
            .insert({
                report_type: reportType,
                report_period: reportPeriod,
                period_start_date: periodStartDate,
                period_end_date: periodEndDate,
                report_data: reportData,
                created_by: null // Will be set by RLS
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error saving financial report:', error);
        throw new Error('Gagal menyimpan laporan keuangan');
    }
}

// Chart of Accounts functions
export async function getChartOfAccountsAction(): Promise<ChartOfAccount[]> {
    try {
        const { data, error } = await supabase
            .from('chart_of_accounts')
            .select('*')
            .eq('is_active', true)
            .order('account_code', { ascending: true });

        if (error) {
            console.error('Error fetching chart of accounts:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error fetching chart of accounts:', error);
        return [];
    }
}

// Journal Entries functions
export async function getJournalEntriesAction(
    startDate?: string,
    endDate?: string,
    limit: number = 100
): Promise<JournalEntry[]> {
    try {
        let query = supabase
            .from('journal_entries')
            .select(`
                *,
                journal_entry_lines(
                    id,
                    account_id,
                    description,
                    debit_amount,
                    credit_amount,
                    chart_of_accounts(
                        account_code,
                        account_name,
                        account_type
                    )
                )
            `)
            .order('entry_date', { ascending: false });

        if (startDate) {
            query = query.gte('entry_date', startDate);
        }

        if (endDate) {
            query = query.lte('entry_date', endDate);
        }

        query = query.limit(limit);

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching journal entries:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error fetching journal entries:', error);
        return [];
    }
}

export async function createJournalEntryAction(
    entryNumber: string,
    entryDate: string,
    description: string,
    referenceType: string = '',
    referenceId: string = '',
    lines: Array<{
        account_id: number;
        description?: string;
        debit_amount: number;
        credit_amount: number;
    }>
): Promise<JournalEntry> {
    try {
        // Validate that debits equal credits
        const totalDebits = lines.reduce((sum, line) => sum + line.debit_amount, 0);
        const totalCredits = lines.reduce((sum, line) => sum + line.credit_amount, 0);

        if (Math.abs(totalDebits - totalCredits) > 0.01) {
            throw new Error('Total debits must equal total credits');
        }

        const { data, error } = await supabase
            .from('journal_entries')
            .insert({
                entry_number: entryNumber,
                entry_date: entryDate,
                description,
                reference_type: referenceType,
                reference_id: referenceId,
                total_amount: totalDebits,
                created_by: null // Will be set by RLS
            })
            .select()
            .single();

        if (error) throw error;

        // Insert journal entry lines
        const { error: linesError } = await supabase
            .from('journal_entry_lines')
            .insert(
                lines.map(line => ({
                    journal_entry_id: data.id,
                    account_id: line.account_id,
                    description: line.description,
                    debit_amount: line.debit_amount,
                    credit_amount: line.credit_amount
                }))
            );

        if (linesError) throw linesError;

        return data;
    } catch (error) {
        console.error('Error creating journal entry:', error);
        throw new Error('Gagal membuat jurnal transaksi');
    }
}

// Helper functions for calculating financial reports
export async function calculateProfitLossAction(
    startDate: string,
    endDate: string
): Promise<ProfitLossData> {
    try {
        // Get all journal entries for period
        const journalEntries = await getJournalEntriesAction(startDate, endDate);

        // Initialize data structure
        const profitLoss: ProfitLossData = {
            revenue: {
                service_revenue: 0,
                product_revenue: 0,
                other_revenue: 0,
                total_revenue: 0
            },
            expenses: {
                cost_of_goods_sold: 0,
                mechanic_commissions: 0,
                operating_expenses: 0,
                administrative_expenses: 0,
                depreciation_expenses: 0,
                total_expenses: 0
            },
            profit: {
                gross_profit: 0,
                operating_profit: 0,
                net_profit: 0
            }
        };

        // Process journal entries
        for (const entry of journalEntries) {
            if (entry.journal_entry_lines) {
                for (const line of entry.journal_entry_lines) {
                    const { chart_of_accounts: account } = line;

                    if (!account) continue;

                    // Revenue accounts (400-499)
                    if (account.account_type === 'revenue') {
                        if (account.account_code.startsWith('400')) {
                            profitLoss.revenue.service_revenue += line.credit_amount;
                        } else if (account.account_code.startsWith('410')) {
                            profitLoss.revenue.product_revenue += line.credit_amount;
                        } else if (account.account_code.startsWith('420')) {
                            profitLoss.revenue.other_revenue += line.credit_amount;
                        }
                    }

                    // Expense accounts (500-599)
                    if (account.account_type === 'expense') {
                        if (account.account_code.startsWith('500')) {
                            profitLoss.expenses.cost_of_goods_sold += line.debit_amount;
                        } else if (account.account_code.startsWith('520')) {
                            profitLoss.expenses.mechanic_commissions += line.debit_amount;
                        } else if (account.account_code.startsWith('530')) {
                            profitLoss.expenses.operating_expenses += line.debit_amount;
                        } else if (account.account_code.startsWith('540')) {
                            profitLoss.expenses.administrative_expenses += line.debit_amount;
                        } else if (account.account_code.startsWith('550')) {
                            profitLoss.expenses.depreciation_expenses += line.debit_amount;
                        }
                    }
                }
            }
        }

        // Calculate totals
        profitLoss.revenue.total_revenue =
            profitLoss.revenue.service_revenue +
            profitLoss.revenue.product_revenue +
            profitLoss.revenue.other_revenue;

        profitLoss.expenses.total_expenses =
            profitLoss.expenses.cost_of_goods_sold +
            profitLoss.expenses.mechanic_commissions +
            profitLoss.expenses.operating_expenses +
            profitLoss.expenses.administrative_expenses +
            profitLoss.expenses.depreciation_expenses;

        profitLoss.profit.gross_profit =
            profitLoss.revenue.total_revenue - profitLoss.expenses.cost_of_goods_sold;

        profitLoss.profit.operating_profit =
            profitLoss.profit.gross_profit -
            profitLoss.expenses.operating_expenses -
            profitLoss.expenses.administrative_expenses;

        profitLoss.profit.net_profit =
            profitLoss.profit.operating_profit -
            profitLoss.expenses.depreciation_expenses;

        return profitLoss;
    } catch (error) {
        console.error('Error calculating profit and loss:', error);
        throw new Error('Gagal menghitung laba rugi');
    }
}

export async function generateJournalEntriesFromTransactionsAction(
    startDate: string,
    endDate: string
): Promise<void> {
    try {
        // Get transactions for period
        const { data: transactions, error } = await supabase
            .from('data_transaksi')
            .select('*')
            .gte('saved_at', startDate)
            .lte('saved_at', endDate);

        if (error) throw error;

        if (!transactions || transactions.length === 0) return;

        // Get chart of accounts
        const accounts = await getChartOfAccountsAction();
        const accountMap = new Map(
            accounts.map(acc => [acc.account_code, acc])
        );

        for (const transaction of transactions) {
            const entryNumber = `TRX-${transaction.invoice_number}`;
            const entryDate = transaction.saved_at.split('T')[0];
            const description = `Transaksi ${transaction.invoice_number} - ${transaction.customer_name}`;

            const lines = [];

            // Debit: Accounts Receivable (130)
            const arAccount = accountMap.get('130');
            if (arAccount) {
                lines.push({
                    account_id: arAccount.id,
                    description: `Piutang - ${transaction.customer_name}`,
                    debit_amount: transaction.total,
                    credit_amount: 0
                });
            }

            // Credit: Revenue accounts
            const items = transaction.items ? JSON.parse(transaction.items) : [];
            for (const item of items) {
                if (item.type === 'service') {
                    const serviceRevenueAccount = accountMap.get('400');
                    if (serviceRevenueAccount) {
                        lines.push({
                            account_id: serviceRevenueAccount.id,
                            description: `Pendapatan Jasa - ${item.name}`,
                            debit_amount: 0,
                            credit_amount: item.price * item.qty
                        });
                    }
                } else if (item.type === 'part') {
                    const productRevenueAccount = accountMap.get('410');
                    if (productRevenueAccount) {
                        lines.push({
                            account_id: productRevenueAccount.id,
                            description: `Pendapatan Barang - ${item.name}`,
                            debit_amount: 0,
                            credit_amount: item.price * item.qty
                        });
                    }
                }
            }

            // Create journal entry
            await createJournalEntryAction(
                entryNumber,
                entryDate,
                description,
                'transaction',
                transaction.invoice_number,
                lines
            );
        }
    } catch (error) {
        console.error('Error generating journal entries from transactions:', error);
        throw new Error('Gagal generate jurnal dari transaksi');
    }
}

export interface SeasonalityData {
    month: string;
    year: number;
    revenue: number;
    expenses: number;
    profit: number;
    transaction_count: number;
    average_transaction_value: number;
    growth_rate: number;
    seasonal_index: number;
}

export interface SeasonalityAnalysis {
    monthly_data: SeasonalityData[];
    quarterly_data: SeasonalityData[];
    yearly_trend: {
        year: number;
        total_revenue: number;
        total_expenses: number;
        total_profit: number;
        growth_rate: number;
    }[];
    seasonal_patterns: {
        peak_months: string[];
        low_months: string[];
        stable_months: string[];
    };
    insights: {
        trend: 'increasing' | 'decreasing' | 'stable';
        volatility: 'high' | 'medium' | 'low';
        predictability: 'high' | 'medium' | 'low';
    };
}

// Seasonality Analysis functions
export async function getSeasonalityAnalysisAction(
    startDate?: string,
    endDate?: string
): Promise<SeasonalityAnalysis> {
    try {
        // Get transactions for period (default to last 2 years)
        const defaultStartDate = startDate || new Date(new Date().getFullYear() - 2, 0, 1).toISOString().split('T')[0];
        const defaultEndDate = endDate || new Date().toISOString().split('T')[0];

        const { data: transactions, error } = await supabase
            .from('data_transaksi')
            .select('*')
            .gte('saved_at', defaultStartDate)
            .lte('saved_at', defaultEndDate)
            .order('saved_at', { ascending: true });

        if (error) throw error;
        if (!transactions || transactions.length === 0) {
            throw new Error('Tidak ada data transaksi untuk analisis seasonality');
        }

        // Process transactions by month
        const monthlyMap = new Map<string, SeasonalityData>();

        for (const transaction of transactions) {
            const date = new Date(transaction.saved_at);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthName = date.toLocaleDateString('id-ID', { month: 'long' });
            const year = date.getFullYear();

            if (!monthlyMap.has(monthKey)) {
                monthlyMap.set(monthKey, {
                    month: monthName,
                    year,
                    revenue: 0,
                    expenses: 0,
                    profit: 0,
                    transaction_count: 0,
                    average_transaction_value: 0,
                    growth_rate: 0,
                    seasonal_index: 0
                });
            }

            const monthData = monthlyMap.get(monthKey)!;
            monthData.revenue += transaction.total || 0;
            monthData.transaction_count += 1;
        }

        // Calculate expenses and profit for each month
        const monthlyData = Array.from(monthlyMap.values());

        // Calculate average transaction value
        monthlyData.forEach(data => {
            data.average_transaction_value = data.transaction_count > 0 ? data.revenue / data.transaction_count : 0;
        });

        // Calculate seasonal index (relative to average)
        const avgMonthlyRevenue = monthlyData.reduce((sum, data) => sum + data.revenue, 0) / monthlyData.length;
        monthlyData.forEach(data => {
            data.seasonal_index = avgMonthlyRevenue > 0 ? (data.revenue / avgMonthlyRevenue) * 100 : 0;
        });

        // Calculate growth rates
        monthlyData.sort((a, b) => a.year - b.year ||
            new Date(`${a.year}-${new Date().getMonth() + 1}`).getMonth() - new Date(`${b.year}-${new Date().getMonth() + 1}`).getMonth());

        for (let i = 1; i < monthlyData.length; i++) {
            const current = monthlyData[i];
            const previous = monthlyData[i - 1];
            current.growth_rate = previous.revenue > 0 ? ((current.revenue - previous.revenue) / previous.revenue) * 100 : 0;
        }

        // Group by quarter
        const quarterlyData: SeasonalityData[] = [];
        for (let q = 0; q < 4; q++) {
            const quarterMonths = monthlyData.filter((_, index) => Math.floor(index % 12 / 3) === q);
            if (quarterMonths.length > 0) {
                quarterlyData.push({
                    month: `Q${q + 1}`,
                    year: quarterMonths[0].year,
                    revenue: quarterMonths.reduce((sum, m) => sum + m.revenue, 0),
                    expenses: quarterMonths.reduce((sum, m) => sum + m.expenses, 0),
                    profit: quarterMonths.reduce((sum, m) => sum + m.profit, 0),
                    transaction_count: quarterMonths.reduce((sum, m) => sum + m.transaction_count, 0),
                    average_transaction_value: quarterMonths.reduce((sum, m) => sum + m.average_transaction_value, 0) / quarterMonths.length,
                    growth_rate: 0,
                    seasonal_index: 0
                });
            }
        }

        // Calculate yearly trends
        const yearlyMap = new Map<number, { revenue: number; expenses: number; profit: number }>();
        monthlyData.forEach(data => {
            if (!yearlyMap.has(data.year)) {
                yearlyMap.set(data.year, { revenue: 0, expenses: 0, profit: 0 });
            }
            const yearData = yearlyMap.get(data.year)!;
            yearData.revenue += data.revenue;
            yearData.expenses += data.expenses;
            yearData.profit += data.profit;
        });

        const yearlyTrend = Array.from(yearlyMap.entries()).map(([year, data], index) => ({
            year,
            total_revenue: data.revenue,
            total_expenses: data.expenses,
            total_profit: data.profit,
            growth_rate: index > 0 ? ((data.revenue - Array.from(yearlyMap.values())[index - 1].revenue) / Array.from(yearlyMap.values())[index - 1].revenue) * 100 : 0
        })).sort((a, b) => a.year - b.year);

        // Identify seasonal patterns
        const seasonalIndices = monthlyData.map(d => d.seasonal_index);
        const avgIndex = seasonalIndices.reduce((sum, idx) => sum + idx, 0) / seasonalIndices.length;
        const stdDev = Math.sqrt(seasonalIndices.reduce((sum, idx) => sum + Math.pow(idx - avgIndex, 2), 0) / seasonalIndices.length);

        const peakMonths = monthlyData
            .filter(d => d.seasonal_index > avgIndex + stdDev)
            .map(d => d.month);

        const lowMonths = monthlyData
            .filter(d => d.seasonal_index < avgIndex - stdDev)
            .map(d => d.month);

        const stableMonths = monthlyData
            .filter(d => Math.abs(d.seasonal_index - avgIndex) <= stdDev)
            .map(d => d.month);

        // Determine insights
        const recentGrowthRates = yearlyTrend.slice(-3).map(y => y.growth_rate);
        const avgGrowthRate = recentGrowthRates.reduce((sum, rate) => sum + rate, 0) / recentGrowthRates.length;

        let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
        if (avgGrowthRate > 5) trend = 'increasing';
        else if (avgGrowthRate < -5) trend = 'decreasing';
        const HIGH_VOL = 0.3;
        const LOW_VOL = 0.15;

        let volatility: 'high' | 'medium' | 'low' = 'medium';
        const volatilityScore = stdDev / avgIndex;

        if (volatilityScore > HIGH_VOL) volatility = 'high';
        else if (volatilityScore < LOW_VOL) volatility = 'low';

        let predictability: 'high' | 'medium' | 'low' = 'medium';

        const isStableGrowth = recentGrowthRates.every(
            r => Math.abs(r - avgGrowthRate) < 10
        );

        const isChaoticGrowth = recentGrowthRates.some(
            r => Math.abs(r - avgGrowthRate) > 20
        );

        if (volatility === 'low' && isStableGrowth) {
            predictability = 'high';
        } else if (volatility === 'high' || isChaoticGrowth) {
            predictability = 'low';
        }

        return {
            monthly_data: monthlyData,
            quarterly_data: quarterlyData,
            yearly_trend: yearlyTrend,
            seasonal_patterns: {
                peak_months: peakMonths,
                low_months: lowMonths,
                stable_months: stableMonths
            },
            insights: {
                trend,
                volatility,
                predictability
            }
        };
    } catch (error) {
        console.error('Error calculating seasonality analysis:', error);
        throw new Error('Gagal menghitung analisis seasonality');
    }
}