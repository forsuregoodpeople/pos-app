"use server";

import { createClient } from '@/lib/supabase-server';

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
        const supabase = await createClient();
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
        const supabase = await createClient();
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
        const supabase = await createClient();
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
        const supabase = await createClient();
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
        const supabase = await createClient();
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
        const supabase = await createClient();
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

        // Ensure endDate includes the full day (23:59:59) if it's just a date string
        const effectiveEndDate = endDate.length === 10 ? `${endDate}T23:59:59` : endDate;

        // 1. Calculate Revenue from Real Transactions (Source of Truth)
        const { data: transactions } = await supabase
            .from('data_transaksi')
            .select('id, items, total, invoice_number, created_at, saved_at')
            .gte('saved_at', startDate)
            .lte('saved_at', effectiveEndDate);

        if (transactions && transactions.length > 0) {
            for (const transaction of transactions) {
                // Handle both string and already-parsed object
                const items = typeof transaction.items === 'string'
                    ? JSON.parse(transaction.items)
                    : (transaction.items || []);

                for (const item of items) {
                    if (item.type === 'service') {
                        profitLoss.revenue.service_revenue += (item.price * item.qty);
                    } else if (item.type === 'part') {
                        profitLoss.revenue.product_revenue += (item.price * item.qty);
                    }
                }
            }
        }

        // 2. Calculate COGS from Purchases (Source of Truth)
        const { data: purchases } = await supabase
            .from('purchases')
            .select('final_amount')
            .gte('purchase_date', startDate)
            .lte('purchase_date', effectiveEndDate);

        if (purchases && purchases.length > 0) {
            profitLoss.expenses.cost_of_goods_sold +=
                purchases.reduce((sum, p) => sum + (p.final_amount || 0), 0);
        }

        // 3. Deduct Returns from COGS
        const { data: returns } = await supabase
            .from('purchase_returns')
            .select('total_amount')
            .gte('return_date', startDate)
            .lte('return_date', effectiveEndDate);

        if (returns && returns.length > 0) {
            profitLoss.expenses.cost_of_goods_sold -=
                returns.reduce((sum, r) => sum + (r.total_amount || 0), 0);
        }

        // 4. Calculate Operating Expenses from NEW Expenses Table
        const { data: expensesData } = await supabase
            .from('expenses')
            .select('amount, category')
            .gte('date', startDate)
            .lte('date', effectiveEndDate);

        if (expensesData && expensesData.length > 0) {
            for (const expense of expensesData) {
                const category = expense.category.toLowerCase();
                if (category.includes('gaji') || category.includes('komisi') || category.includes('mechanic')) {
                    profitLoss.expenses.mechanic_commissions += Number(expense.amount);
                } else if (category.includes('admin')) {
                    profitLoss.expenses.administrative_expenses += Number(expense.amount);
                } else if (category.includes('penyusutan') || category.includes('depreciation')) {
                    profitLoss.expenses.depreciation_expenses += Number(expense.amount);
                } else {
                    profitLoss.expenses.operating_expenses += Number(expense.amount);
                }
            }
        }

        // 5. Calculate Mechanic Commissions from mechanic_performance LINKED to these transactions
        // We use the transaction IDs to ensure we get exactly the commissions for the revenue shown above.
        if (transactions && transactions.length > 0) {
            const transactionIds = transactions.map(t => t.id);

            // Chunk the IDs if there are too many (Supabase might have limit on 'in' clause)
            // But usually 100-1000 is fine. limit is passed to getFinancialReports but not this func.
            // calculateProfitLossAction handles full ranges? No, usually bounded.

            const { data: mechanicPerformance } = await supabase
                .from('mechanic_performance')
                .select('commission_amount')
                .in('transaction_id', transactionIds);

            if (mechanicPerformance && mechanicPerformance.length > 0) {
                const totalCommissions = mechanicPerformance.reduce((sum, mp) => sum + (Number(mp.commission_amount) || 0), 0);
                profitLoss.expenses.mechanic_commissions += totalCommissions;
            }
        }

        // 5. Fallback/Supplement with Journal Entries ONLY for things NOT covered above
        // We strictly filter for "Other Revenue" or specific adjustments not in the main flow.
        const journalEntries = await getJournalEntriesAction(startDate, endDate);

        for (const entry of journalEntries) {
            if (entry.journal_entry_lines) {
                for (const line of entry.journal_entry_lines) {
                    const { chart_of_accounts: account } = line;
                    if (!account) continue;

                    // Only look for "Other Revenue" (420)
                    if (account.account_code.startsWith('420')) {
                        profitLoss.revenue.other_revenue += line.credit_amount;
                    }

                    // We DO NOT add other expenses here to avoid confusion. 
                    // We assume the 'expenses' table is now the SSOT for operating expenses.
                    // Unless the user explicitly uses Journal Entries for adjustments.
                    // For now, let's keep it simple: Real Ops Data + Expenses Table.
                }
            }
        }

        // Calculate Totals
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
            profitLoss.expenses.administrative_expenses -
            profitLoss.expenses.mechanic_commissions;

        profitLoss.profit.net_profit =
            profitLoss.profit.operating_profit -
            profitLoss.expenses.depreciation_expenses;

        return profitLoss;
    } catch (error) {
        console.error('Error calculating profit and loss:', error);
        throw new Error('Gagal menghitung laba rugi');
    }
}

// Generate journal entries from transactions
export async function generateJournalEntriesFromTransactionsAction(
    startDate: string,
    endDate: string
): Promise<void> {
    try {
        const supabase = await createClient();
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

// Generate journal entries from purchases
export async function generateJournalEntriesFromPurchasesAction(
    startDate: string,
    endDate: string
): Promise<void> {
    try {
        const supabase = await createClient();
        // Get purchases for period
        const { data: purchases, error } = await supabase
            .from('purchases')
            .select(`
                *,
                items:purchase_items(*)
            `)
            .gte('purchase_date', startDate)
            .lte('purchase_date', endDate);

        if (error) throw error;
        if (!purchases || purchases.length === 0) return;

        // Get chart of accounts
        const accounts = await getChartOfAccountsAction();
        const accountMap = new Map(
            accounts.map(acc => [acc.account_code, acc])
        );

        for (const purchase of purchases) {
            const entryNumber = `PUR-${purchase.invoice_number}`;
            const entryDate = purchase.purchase_date;
            const description = `Pembelian ${purchase.invoice_number}${purchase.supplier_id ? ' - Supplier' : ''}`;

            const lines = [];

            // Debit: Inventory or COGS (140 or 500)
            // Using Inventory (140) since we're tracking stock
            const inventoryAccount = accountMap.get('140');
            if (inventoryAccount) {
                lines.push({
                    account_id: inventoryAccount.id,
                    description: `Pembelian barang`,
                    debit_amount: purchase.final_amount,
                    credit_amount: 0
                });
            }

            // Credit: Accounts Payable (200) if pending, or Cash/Bank if paid
            if (purchase.payment_status === 'paid') {
                // Determine payment account based on payment method
                const paymentAccount = purchase.payment_method?.toLowerCase().includes('transfer') ||
                    purchase.payment_method?.toLowerCase().includes('bank')
                    ? accountMap.get('120') // Bank
                    : accountMap.get('110'); // Cash

                if (paymentAccount) {
                    lines.push({
                        account_id: paymentAccount.id,
                        description: `Pembayaran ${purchase.payment_method || 'tunai'}`,
                        debit_amount: 0,
                        credit_amount: purchase.paid_amount || purchase.final_amount
                    });
                }
            } else {
                // Credit Accounts Payable for pending purchases
                const payableAccount = accountMap.get('200');
                if (payableAccount) {
                    lines.push({
                        account_id: payableAccount.id,
                        description: `Hutang pembelian`,
                        debit_amount: 0,
                        credit_amount: purchase.final_amount
                    });
                }
            }

            // Only create entry if we have valid lines
            if (lines.length >= 2) {
                await createJournalEntryAction(
                    entryNumber,
                    entryDate,
                    description,
                    'purchase',
                    purchase.id,
                    lines
                );
            }
        }
    } catch (error) {
        console.error('Error generating journal entries from purchases:', error);
        throw new Error('Gagal generate jurnal dari pembelian');
    }
}

// Generate journal entries from purchase returns
export async function generateJournalEntriesFromReturnsAction(
    startDate: string,
    endDate: string
): Promise<void> {
    try {
        const supabase = await createClient();
        // Get purchase returns for period
        const { data: returns, error } = await supabase
            .from('purchase_returns')
            .select(`
                *,
                purchase:purchases(invoice_number),
                items:purchase_return_items(*)
            `)
            .gte('return_date', startDate)
            .lte('return_date', endDate);

        if (error) throw error;
        if (!returns || returns.length === 0) return;

        // Get chart of accounts
        const accounts = await getChartOfAccountsAction();
        const accountMap = new Map(
            accounts.map(acc => [acc.account_code, acc])
        );

        for (const returnData of returns) {
            const entryNumber = `RTN-${(returnData as any).purchase?.invoice_number || returnData.id}`;
            const entryDate = returnData.return_date;
            const description = `Retur Pembelian - ${returnData.reason || 'No reason'}`;

            const lines = [];

            // Debit: Accounts Payable (200) - reducing the liability
            const payableAccount = accountMap.get('200');
            if (payableAccount) {
                lines.push({
                    account_id: payableAccount.id,
                    description: `Pengurangan hutang`,
                    debit_amount: returnData.total_amount,
                    credit_amount: 0
                });
            }

            // Credit: Inventory (140) - reducing inventory
            const inventoryAccount = accountMap.get('140');
            if (inventoryAccount) {
                lines.push({
                    account_id: inventoryAccount.id,
                    description: `Retur barang`,
                    debit_amount: 0,
                    credit_amount: returnData.total_amount
                });
            }

            // Only create entry if we have valid lines
            if (lines.length >= 2) {
                await createJournalEntryAction(
                    entryNumber,
                    entryDate,
                    description,
                    'purchase_return',
                    returnData.id,
                    lines
                );
            }
        }
    } catch (error) {
        console.error('Error generating journal entries from returns:', error);
        throw new Error('Gagal generate jurnal dari retur pembelian');
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
        const supabase = await createClient();
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

        // Get purchases for period and add to expenses
        const { data: purchases } = await supabase
            .from('purchases')
            .select('final_amount, purchase_date')
            .gte('purchase_date', defaultStartDate)
            .lte('purchase_date', defaultEndDate)
            .order('purchase_date', { ascending: true });

        // Process purchases by month
        if (purchases && purchases.length > 0) {
            for (const purchase of purchases) {
                const date = new Date(purchase.purchase_date);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                const monthName = date.toLocaleDateString('id-ID', { month: 'long' });
                const year = date.getFullYear();

                // Create month entry if it doesn't exist
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
                monthData.expenses += purchase.final_amount || 0;
            }
        }

        // Get purchase returns for period and subtract from expenses
        const { data: returns } = await supabase
            .from('purchase_returns')
            .select('total_amount, return_date')
            .gte('return_date', defaultStartDate)
            .lte('return_date', defaultEndDate);

        // Process returns by month
        if (returns && returns.length > 0) {
            for (const returnData of returns) {
                const date = new Date(returnData.return_date);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

                if (monthlyMap.has(monthKey)) {
                    const monthData = monthlyMap.get(monthKey)!;
                    monthData.expenses -= returnData.total_amount || 0; // Reduce expenses
                }
            }
        }


        // Calculate expenses and profit for each month
        const monthlyData = Array.from(monthlyMap.values());

        // Calculate profit = revenue - expenses
        monthlyData.forEach(data => {
            data.profit = data.revenue - data.expenses;
        });

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
export async function calculateBalanceSheetAction(
    startDate: string,
    endDate: string
): Promise<BalanceSheetData> {
    try {
        const supabase = await createClient();
        const balanceSheet: BalanceSheetData = {
            assets: {
                current_assets: {
                    cash: 0,
                    bank: 0,
                    accounts_receivable: 0,
                    inventory: 0,
                    total_current_assets: 0
                },
                fixed_assets: {
                    equipment: 0,
                    accumulated_depreciation: 0,
                    net_fixed_assets: 0
                },
                total_assets: 0
            },
            liabilities: {
                current_liabilities: {
                    accounts_payable: 0,
                    accrued_expenses: 0,
                    total_current_liabilities: 0
                },
                total_liabilities: 0
            },
            equity: {
                capital: 0,
                retained_earnings: 0,
                current_year_profit: 0,
                total_equity: 0
            }
        };

        // 1. Calculate Current Assets: Receivables (Piutang)
        // Get all unpaid or partial transactions
        const { data: unpaidTransactions } = await supabase
            .from('data_transaksi')
            .select('remaining_balance, status_pembayaran')
            .neq('status_pembayaran', 'Lunas');

        if (unpaidTransactions) {
            balanceSheet.assets.current_assets.accounts_receivable = unpaidTransactions.reduce(
                (sum, t) => sum + (t.remaining_balance || 0), 0
            );
        }

        // 2. Calculate Current Assets: Inventory (Persediaan)
        // Get all products and sum (stock * buy_price)
        const { data: products } = await supabase
            .from('data_barang')
            .select('stok, harga_beli');

        if (products) {
            balanceSheet.assets.current_assets.inventory = products.reduce(
                (sum, p) => sum + ((p.stok || 0) * (p.harga_beli || 0)), 0
            );
        }

        // 3. Calculate Liabilities: Payables (Hutang)
        // Get all unpaid purchases
        const { data: unpaidPurchases } = await supabase
            .from('purchases')
            .select('remaining_balance')
            .neq('payment_status', 'Lunas');

        if (unpaidPurchases) {
            balanceSheet.liabilities.current_liabilities.accounts_payable = unpaidPurchases.reduce(
                (sum, p) => sum + (p.remaining_balance || 0), 0
            );
        }

        // 4. Calculate Cash & Bank
        // This is tricky without a ledger. We will do a rough calculation:
        // Cash Flow = (Total Paid Income) - (Total Paid Expenses) - (Total Paid Purchases) relative to a baseline?
        // For now, let's treat "Kas" as a catch-all for liquid assets derived from Profit.
        // Actually, let's look at the Cash Flow implementation or just sum up all "paid" transactions.

        // Sum all payments received (Revenue)
        const { data: allTransactions } = await supabase
            .from('data_transaksi')
            .select('total, remaining_balance')
            .lte('saved_at', endDate);

        let totalCashIn = 0;
        if (allTransactions) {
            totalCashIn = allTransactions.reduce((sum, t) => sum + (t.total - (t.remaining_balance || 0)), 0);
        }

        // Sum all payments made (Purchases)
        const { data: allPurchases } = await supabase
            .from('purchases')
            .select('grand_total, remaining_balance')
            .lte('purchase_date', endDate);

        let totalCashOutPurchases = 0;
        if (allPurchases) {
            totalCashOutPurchases = allPurchases.reduce((sum, p) => sum + (p.grand_total - (p.remaining_balance || 0)), 0);
        }

        // Sum all expenses
        const { data: allExpenses } = await supabase
            .from('expenses')
            .select('amount')
            .lte('date', endDate);

        let totalCashOutExpenses = 0;
        if (allExpenses) {
            totalCashOutExpenses = allExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
        }

        const estimatedCashBalance = totalCashIn - totalCashOutPurchases - totalCashOutExpenses;

        // Put it all in Cash for simplicity, as we don't distinguish Bank vs Cash yet in the data source cleanly
        if (estimatedCashBalance > 0) {
            balanceSheet.assets.current_assets.cash = estimatedCashBalance;
        } else {
            // If negative, it might mean we started with capital, but for now show as is or 0
            balanceSheet.assets.current_assets.cash = estimatedCashBalance;
        }

        // 5. Equity
        // Retained Earnings = Assets - Liabilities
        balanceSheet.assets.current_assets.total_current_assets =
            balanceSheet.assets.current_assets.cash +
            balanceSheet.assets.current_assets.bank +
            balanceSheet.assets.current_assets.accounts_receivable +
            balanceSheet.assets.current_assets.inventory;

        balanceSheet.assets.total_assets =
            balanceSheet.assets.current_assets.total_current_assets +
            balanceSheet.assets.fixed_assets.net_fixed_assets;

        balanceSheet.liabilities.current_liabilities.total_current_liabilities =
            balanceSheet.liabilities.current_liabilities.accounts_payable +
            balanceSheet.liabilities.current_liabilities.accrued_expenses;

        balanceSheet.liabilities.total_liabilities =
            balanceSheet.liabilities.current_liabilities.total_current_liabilities;

        balanceSheet.equity.retained_earnings =
            balanceSheet.assets.total_assets - balanceSheet.liabilities.total_liabilities;

        balanceSheet.equity.total_equity =
            balanceSheet.equity.retained_earnings +
            balanceSheet.equity.capital +
            balanceSheet.equity.current_year_profit;

        return balanceSheet;
    } catch (error) {
        console.error('Error calculating balance sheet:', error);
        throw new Error('Gagal menghitung neraca');
    }
}
