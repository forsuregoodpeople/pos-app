import { useState, useEffect, useCallback } from 'react';
import {
    getFinancialReportsAction,
    saveFinancialReportAction,
    getChartOfAccountsAction,
    getJournalEntriesAction,
    calculateProfitLossAction,
    generateJournalEntriesFromTransactionsAction,
    getSeasonalityAnalysisAction,
    FinancialReport,
    ChartOfAccount,
    JournalEntry,
    ProfitLossData,
    BalanceSheetData,
    CashFlowData,
    SeasonalityData,
    SeasonalityAnalysis
} from '@/services/financial-reports/financial-reports';

export function useFinancialReports() {
    const [reports, setReports] = useState<FinancialReport[]>([]);
    const [chartOfAccounts, setChartOfAccounts] = useState<ChartOfAccount[]>([]);
    const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'profit-loss' | 'balance-sheet' | 'cash-flow' | 'seasonality'>('overview');

    const loadReports = useCallback(async (reportType?: string, period?: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getFinancialReportsAction(reportType, period);
            setReports(data);
        } catch (err: any) {
            const errorMessage = err?.message || 'Gagal memuat laporan keuangan';
            setError(errorMessage);
            console.error('useFinancialReports: Load error:', errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadChartOfAccounts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getChartOfAccountsAction();
            setChartOfAccounts(data);
        } catch (err: any) {
            const errorMessage = err?.message || 'Gagal memuat daftar akun';
            setError(errorMessage);
            console.error('useFinancialReports: Load chart of accounts error:', errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadJournalEntries = useCallback(async (startDate?: string, endDate?: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getJournalEntriesAction(startDate, endDate);
            setJournalEntries(data);
        } catch (err: any) {
            const errorMessage = err?.message || 'Gagal memuat jurnal transaksi';
            setError(errorMessage);
            console.error('useFinancialReports: Load journal entries error:', errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    const saveReport = useCallback(async (
        reportType: 'profit_loss' | 'balance_sheet' | 'cash_flow',
        reportPeriod: 'monthly' | 'quarterly' | 'yearly',
        periodStartDate: string,
        periodEndDate: string,
        reportData: any
    ) => {
        setLoading(true);
        setError(null);
        try {
            await saveFinancialReportAction(
                reportType,
                reportPeriod,
                periodStartDate,
                periodEndDate,
                reportData
            );
            // Reload reports after saving
            await loadReports(reportType, reportPeriod);
        } catch (err: any) {
            const errorMessage = err?.message || 'Gagal menyimpan laporan';
            setError(errorMessage);
            console.error('useFinancialReports: Save error:', errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [loadReports]);

    const calculateProfitLoss = useCallback(async (
        startDate: string,
        endDate: string
    ): Promise<ProfitLossData> => {
        setLoading(true);
        setError(null);
        try {
            const data = await calculateProfitLossAction(startDate, endDate);
            return data;
        } catch (err: any) {
            const errorMessage = err?.message || 'Gagal menghitung laba rugi';
            setError(errorMessage);
            console.error('useFinancialReports: Calculate profit loss error:', errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const generateJournalEntries = useCallback(async (
        startDate: string,
        endDate: string
    ) => {
        setLoading(true);
        setError(null);
        try {
            await generateJournalEntriesFromTransactionsAction(startDate, endDate);
            // Reload journal entries after generating
            await loadJournalEntries(startDate, endDate);
        } catch (err: any) {
            const errorMessage = err?.message || 'Gagal generate jurnal dari transaksi';
            setError(errorMessage);
            console.error('useFinancialReports: Generate journal entries error:', errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [loadJournalEntries]);

    useEffect(() => {
        loadReports();
        loadChartOfAccounts();
        loadJournalEntries();
    }, [loadReports, loadChartOfAccounts, loadJournalEntries]);

    return {
        reports,
        chartOfAccounts,
        journalEntries,
        loading,
        error,
        activeTab,
        setActiveTab,
        loadReports,
        loadChartOfAccounts,
        loadJournalEntries,
        saveReport,
        calculateProfitLoss,
        generateJournalEntries
    };
}

// Helper hook for profit loss calculations
export function useProfitLoss() {
    const [data, setData] = useState<ProfitLossData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { calculateProfitLoss: calculateProfitLossFn } = useFinancialReports();

    const calculate = useCallback(async (startDate: string, endDate: string) => {
        setLoading(true);
        setError(null);
        try {
            const result = await calculateProfitLossFn(startDate, endDate);
            setData(result);
            return result;
        } catch (err: any) {
            const errorMessage = err?.message || 'Gagal menghitung laba rugi';
            setError(errorMessage);
            console.error('useProfitLoss: Calculate error:', errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [calculateProfitLossFn]);

    return {
        data,
        loading,
        error,
        calculate
    };
}

// Helper hook for balance sheet calculations
export function useBalanceSheet() {
    const [data, setData] = useState<BalanceSheetData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const calculate = useCallback(async (startDate: string, endDate: string) => {
        setLoading(true);
        setError(null);
        try {
            // Get journal entries for the period
            const entries = await getJournalEntriesAction(startDate, endDate);
            
            // Initialize balance sheet data
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

            // Process journal entries to calculate balance sheet
            for (const entry of entries as any) {
                if (entry.journal_entry_lines) {
                    for (const line of entry.journal_entry_lines) {
                        const { chart_of_accounts: account } = line;
                        
                        if (!account) continue;

                        // Assets (100-199)
                        if (account.account_type === 'asset') {
                            if (account.account_code.startsWith('110')) {
                                balanceSheet.assets.current_assets.cash += line.debit_amount - line.credit_amount;
                            } else if (account.account_code.startsWith('120')) {
                                balanceSheet.assets.current_assets.bank += line.debit_amount - line.credit_amount;
                            } else if (account.account_code.startsWith('130')) {
                                balanceSheet.assets.current_assets.accounts_receivable += line.debit_amount - line.credit_amount;
                            } else if (account.account_code.startsWith('140')) {
                                balanceSheet.assets.current_assets.inventory += line.debit_amount - line.credit_amount;
                            } else if (account.account_code.startsWith('150')) {
                                balanceSheet.assets.fixed_assets.equipment += line.debit_amount - line.credit_amount;
                            }
                        }

                        // Liabilities (200-299)
                        if (account.account_type === 'liability') {
                            if (account.account_code.startsWith('200')) {
                                balanceSheet.liabilities.current_liabilities.accounts_payable += line.credit_amount - line.debit_amount;
                            }
                        }

                        // Equity (300-399)
                        if (account.account_type === 'equity') {
                            if (account.account_code.startsWith('300')) {
                                balanceSheet.equity.capital += line.credit_amount - line.debit_amount;
                            } else if (account.account_code.startsWith('330')) {
                                balanceSheet.equity.retained_earnings += line.credit_amount - line.debit_amount;
                            }
                        }
                    }
                }
            }

            // Calculate totals
            balanceSheet.assets.current_assets.total_current_assets = 
                balanceSheet.assets.current_assets.cash + 
                balanceSheet.assets.current_assets.bank + 
                balanceSheet.assets.current_assets.accounts_receivable + 
                balanceSheet.assets.current_assets.inventory;

            balanceSheet.assets.fixed_assets.net_fixed_assets = 
                balanceSheet.assets.fixed_assets.equipment - 
                balanceSheet.assets.fixed_assets.accumulated_depreciation;

            balanceSheet.assets.total_assets = 
                balanceSheet.assets.current_assets.total_current_assets + 
                balanceSheet.assets.fixed_assets.net_fixed_assets;

            balanceSheet.liabilities.current_liabilities.total_current_liabilities = 
                balanceSheet.liabilities.current_liabilities.accounts_payable + 
                balanceSheet.liabilities.current_liabilities.accrued_expenses;

            balanceSheet.liabilities.total_liabilities = 
                balanceSheet.liabilities.current_liabilities.total_current_liabilities;

            balanceSheet.equity.current_year_profit = 
                balanceSheet.assets.total_assets - 
                balanceSheet.liabilities.total_liabilities - 
                balanceSheet.equity.capital - 
                balanceSheet.equity.retained_earnings;

            balanceSheet.equity.total_equity = 
                balanceSheet.equity.capital + 
                balanceSheet.equity.retained_earnings + 
                balanceSheet.equity.current_year_profit;

            setData(balanceSheet);
            return balanceSheet;
        } catch (err: any) {
            const errorMessage = err?.message || 'Gagal menghitung neraca keuangan';
            setError(errorMessage);
            console.error('useBalanceSheet: Calculate error:', errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        data,
        loading,
        error,
        calculate
    };
}

// Helper hook for cash flow calculations
export function useCashFlow() {
    const [data, setData] = useState<CashFlowData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const calculate = useCallback(async (startDate: string, endDate: string) => {
        setLoading(true);
        setError(null);
        try {
            // Get journal entries for the period
            const entries = await getJournalEntriesAction(startDate, endDate);
            
            // Initialize cash flow data
            const cashFlow: CashFlowData = {
                operating_activities: {
                    cash_from_customers: 0,
                    cash_paid_to_suppliers: 0,
                    cash_paid_to_mechanics: 0,
                    cash_paid_for_expenses: 0,
                    net_operating_cash: 0
                },
                investing_activities: {
                    equipment_purchase: 0,
                    equipment_sale: 0,
                    net_investing_cash: 0
                },
                financing_activities: {
                    capital_injection: 0,
                    owner_drawings: 0,
                    net_financing_cash: 0
                },
                net_cash_change: 0,
                cash_beginning: 0,
                cash_ending: 0
            };

            // Process journal entries to calculate cash flow
            for (const entry of entries as any) {
                if (entry.journal_entry_lines && Array.isArray(entry.journal_entry_lines)) {
                    for (const line of entry.journal_entry_lines) {
                        const { chart_of_accounts: account } = line;
                        
                        if (!account) continue;

                        // Operating activities
                        if (account.account_code.startsWith('110')) {
                            cashFlow.operating_activities.cash_from_customers += line.debit_amount - line.credit_amount;
                        } else if (account.account_code.startsWith('200')) {
                            cashFlow.operating_activities.cash_paid_to_suppliers += line.credit_amount - line.debit_amount;
                        } else if (account.account_code.startsWith('520')) {
                            cashFlow.operating_activities.cash_paid_to_mechanics += line.credit_amount - line.debit_amount;
                        } else if (account.account_code.startsWith('530') || account.account_code.startsWith('540')) {
                            cashFlow.operating_activities.cash_paid_for_expenses += line.credit_amount - line.debit_amount;
                        }

                        // Investing activities
                        if (account.account_code.startsWith('150')) {
                            cashFlow.investing_activities.equipment_purchase += line.debit_amount - line.credit_amount;
                        }

                        // Financing activities
                        if (account.account_code.startsWith('300')) {
                            cashFlow.financing_activities.capital_injection += line.credit_amount - line.debit_amount;
                        } else if (account.account_code.startsWith('330')) {
                            cashFlow.financing_activities.owner_drawings += line.debit_amount - line.credit_amount;
                        }
                    }
                }
            }

            // Calculate totals
            cashFlow.operating_activities.net_operating_cash = 
                cashFlow.operating_activities.cash_from_customers - 
                cashFlow.operating_activities.cash_paid_to_suppliers - 
                cashFlow.operating_activities.cash_paid_to_mechanics - 
                cashFlow.operating_activities.cash_paid_for_expenses;

            cashFlow.investing_activities.net_investing_cash = 
                cashFlow.investing_activities.equipment_purchase + 
                cashFlow.investing_activities.equipment_sale;

            cashFlow.financing_activities.net_financing_cash = 
                cashFlow.financing_activities.capital_injection - 
                cashFlow.financing_activities.owner_drawings;

            cashFlow.net_cash_change = 
                cashFlow.operating_activities.net_operating_cash + 
                cashFlow.investing_activities.net_investing_cash + 
                cashFlow.financing_activities.net_financing_cash;

            // For simplicity, assuming cash beginning is 0 (should be calculated from previous period)
            cashFlow.cash_beginning = 0;
            cashFlow.cash_ending = cashFlow.cash_beginning + cashFlow.net_cash_change;

            setData(cashFlow);
            return cashFlow;
        } catch (err: any) {
            const errorMessage = err?.message || 'Gagal menghitung arus kas';
            setError(errorMessage);
            console.error('useCashFlow: Calculate error:', errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        data,
        loading,
        error,
        calculate
    };
}

// Helper hook for seasonality analysis
export function useSeasonalityAnalysis() {
    const [data, setData] = useState<SeasonalityAnalysis | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const analyze = useCallback(async (startDate?: string, endDate?: string) => {
        setLoading(true);
        setError(null);
        try {
            const result = await getSeasonalityAnalysisAction(startDate, endDate);
            setData(result);
            return result;
        } catch (err: any) {
            const errorMessage = err?.message || 'Gagal menganalisis seasonality';
            setError(errorMessage);
            console.error('useSeasonalityAnalysis: Analyze error:', errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        data,
        loading,
        error,
        analyze
    };
}