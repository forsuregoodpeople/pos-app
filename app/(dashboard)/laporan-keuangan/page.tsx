"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    CreditCard,
    Wallet,
    FileText,
    Download,
    Calendar,
    BarChart3,
    PieChart,
    Activity
} from "lucide-react";
import { useFinancialReports, useProfitLoss, useBalanceSheet, useCashFlow, useSeasonalityAnalysis } from "@/hooks/useFinancialReports";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addExpenseAction } from "@/services/expenses/expenses";
import { toast } from "sonner"; // Try using sonner


export default function LaporanKeuanganPage() {
    const {
        reports,
        chartOfAccounts,
        journalEntries,
        loading,
        error,
        activeTab,
        setActiveTab
    } = useFinancialReports();

    const { data: profitLossData, loading: profitLossLoading, calculate: calculateProfitLoss } = useProfitLoss();
    const { data: balanceSheetData, loading: balanceSheetLoading, calculate: calculateBalanceSheet } = useBalanceSheet();
    const { data: cashFlowData, loading: cashFlowLoading, calculate: calculateCashFlow } = useCashFlow();
    const { data: seasonalityData, loading: seasonalityLoading, analyze: analyzeSeasonality } = useSeasonalityAnalysis();

    const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
    const [startDate, setStartDate] = useState(format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'));

    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    // Expense Modal State
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newExpense, setNewExpense] = useState({
        description: '',
        amount: '',
        category: 'Beban Operasional',
        date: format(new Date(), 'yyyy-MM-dd'),
        notes: ''
    });

    const handleAddExpense = async () => {
        if (!newExpense.description || !newExpense.amount) {
            alert("Mohon isi deskripsi dan jumlah");
            return;
        }

        try {
            setIsSubmitting(true);
            await addExpenseAction({
                description: newExpense.description,
                amount: Number(newExpense.amount),
                category: newExpense.category,
                date: newExpense.date,
                notes: newExpense.notes
            });

            setIsExpenseModalOpen(false);
            setNewExpense({
                description: '',
                amount: '',
                category: 'Beban Operasional',
                date: format(new Date(), 'yyyy-MM-dd'),
                notes: ''
            });

            // Refresh data
            calculateProfitLoss(startDate, endDate);
            calculateBalanceSheet(startDate, endDate);
            calculateCashFlow(startDate, endDate);

            // Basic alert since we aren't sure about toast setup
            alert("Pengeluaran berhasil dicatat!");
        } catch (error) {
            console.error(error);
            alert("Gagal mencatat pengeluaran");
        } finally {
            setIsSubmitting(false);
        }
    };


    useEffect(() => {
        // Load data when component mounts or period changes
        if (startDate && endDate) {
            calculateProfitLoss(startDate, endDate);
            calculateBalanceSheet(startDate, endDate);
            calculateCashFlow(startDate, endDate);
            analyzeSeasonality(startDate, endDate);
        }
    }, [startDate, endDate, calculateProfitLoss, calculateBalanceSheet, calculateCashFlow, analyzeSeasonality]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const handleExportReport = (reportType: string) => {
        // Implementation for export functionality
        console.log(`Exporting ${reportType} report`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 text-red-600">
                            <Activity className="h-5 w-5" />
                            <span>{error}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Laporan Keuangan</h1>
                    <p className="text-muted-foreground">
                        Analisis lengkap kinerja keuangan bisnis Anda
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setIsExpenseModalOpen(true)}>
                        <DollarSign className="h-4 w-4 mr-2" />
                        Catat Pengeluaran
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Pendapatan</p>
                                <p className="text-2xl font-bold">
                                    {formatCurrency((profitLossData?.revenue.service_revenue || 0) + (profitLossData?.revenue.product_revenue || 0))}
                                </p>
                            </div>
                            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                                <TrendingUp className="h-4 w-4 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Beban</p>
                                <p className="text-2xl font-bold">
                                    {formatCurrency(
                                        (profitLossData?.expenses.cost_of_goods_sold || 0) +
                                        (profitLossData?.expenses.mechanic_commissions || 0) +
                                        (profitLossData?.expenses.operating_expenses || 0) +
                                        (profitLossData?.expenses.administrative_expenses || 0) +
                                        (profitLossData?.expenses.depreciation_expenses || 0)
                                    )}
                                </p>
                            </div>
                            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                                <TrendingDown className="h-4 w-4 text-red-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Laba Bersih</p>
                                <p className="text-2xl font-bold">
                                    {formatCurrency(profitLossData?.profit.net_profit || 0)}
                                </p>
                            </div>
                            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <DollarSign className="h-4 w-4 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Kas & Bank</p>
                                <p className="text-2xl font-bold">
                                    {formatCurrency(
                                        (balanceSheetData?.assets.current_assets.cash || 0) +
                                        (balanceSheetData?.assets.current_assets.bank || 0)
                                    )}
                                </p>
                            </div>
                            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                                <Wallet className="h-4 w-4 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div >

            {/* Main Tabs */}
            < Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)
            } className="space-y-4" >
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Ringkasan</TabsTrigger>
                    <TabsTrigger value="profit-loss">Laba Rugi</TabsTrigger>
                    <TabsTrigger value="balance-sheet">Neraca</TabsTrigger>
                    <TabsTrigger value="cash-flow">Arus Kas</TabsTrigger>
                    <TabsTrigger value="seasonality">Seasonality</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5" />
                                    Analisis Pendapatan
                                </CardTitle>
                                <CardDescription>
                                    Breakdown sumber pendapatan bisnis
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Pendapatan Jasa</span>
                                        <span className="font-medium">
                                            {formatCurrency(profitLossData?.revenue.service_revenue || 0)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Pendapatan Parts</span>
                                        <span className="font-medium">
                                            {formatCurrency(profitLossData?.revenue.product_revenue || 0)}
                                        </span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between items-center font-bold">
                                        <span>Total Pendapatan</span>
                                        <span>
                                            {formatCurrency(
                                                (profitLossData?.revenue.service_revenue || 0) +
                                                (profitLossData?.revenue.product_revenue || 0) +
                                                (profitLossData?.revenue.other_revenue || 0)
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PieChart className="h-5 w-5" />
                                    Analisis Beban
                                </CardTitle>
                                <CardDescription>
                                    Breakdown struktur beban operasional
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Harga Pokok Parts</span>
                                        <span className="font-medium">
                                            {formatCurrency(profitLossData?.expenses.cost_of_goods_sold || 0)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Komisi Mekanik</span>
                                        <span className="font-medium">
                                            {formatCurrency(profitLossData?.expenses.mechanic_commissions || 0)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Beban Operasional</span>
                                        <span className="font-medium">
                                            {formatCurrency(profitLossData?.expenses.operating_expenses || 0)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Beban Administrasi</span>
                                        <span className="font-medium">
                                            {formatCurrency(profitLossData?.expenses.administrative_expenses || 0)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Penyusutan</span>
                                        <span className="font-medium">
                                            {formatCurrency(profitLossData?.expenses.depreciation_expenses || 0)}
                                        </span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between items-center font-bold">
                                        <span>Total Beban</span>
                                        <span>
                                            {formatCurrency(profitLossData?.expenses.total_expenses || 0)}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Profit Loss Tab */}
                <TabsContent value="profit-loss" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Laporan Laba Rugi</CardTitle>
                                <CardDescription>
                                    Periode: {format(new Date(startDate), 'dd MMMM yyyy', { locale: id })} - {format(new Date(endDate), 'dd MMMM yyyy', { locale: id })}
                                </CardDescription>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => handleExportReport('profit-loss')}>
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {profitLossLoading ? (
                                <div className="flex items-center justify-center h-32">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                </div>
                            ) : profitLossData ? (
                                <div className="space-y-6">
                                    {/* Pendapatan */}
                                    <div>
                                        <h4 className="font-semibold mb-3">PENDAPATAN</h4>
                                        <div className="space-y-2 pl-4">
                                            <div className="flex justify-between">
                                                <span>Pendapatan Jasa</span>
                                                <span>{formatCurrency(profitLossData?.revenue.service_revenue || 0)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Pendapatan Parts</span>
                                                <span>{formatCurrency(profitLossData?.revenue.product_revenue || 0)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Pendapatan Lainnya</span>
                                                <span>{formatCurrency(profitLossData?.revenue.other_revenue || 0)}</span>
                                            </div>
                                            <div className="flex justify-between font-bold pt-2 border-t">
                                                <span>Total Pendapatan</span>
                                                <span>{formatCurrency(profitLossData?.revenue.total_revenue || 0)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Harga Pokok */}
                                    <div>
                                        <h4 className="font-semibold mb-3">HARGA POKOK PENJUALAN</h4>
                                        <div className="space-y-2 pl-4">
                                            <div className="flex justify-between">
                                                <span>Harga Pokok Parts</span>
                                                <span>{formatCurrency(profitLossData?.expenses.cost_of_goods_sold || 0)}</span>
                                            </div>
                                            <div className="flex justify-between font-bold pt-2 border-t">
                                                <span>Total HPP</span>
                                                <span>{formatCurrency(profitLossData.expenses.cost_of_goods_sold)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Laba Kotor */}
                                    <div>
                                        <div className="flex justify-between font-bold text-lg">
                                            <span>LABA KOTOR</span>
                                            <span>{formatCurrency(profitLossData.profit.gross_profit)}</span>
                                        </div>
                                    </div>

                                    {/* Beban Operasional */}
                                    <div>
                                        <h4 className="font-semibold mb-3">BEBAN OPERASIONAL</h4>
                                        <div className="space-y-2 pl-4">
                                            <div className="flex justify-between">
                                                <span>Komisi Mekanik</span>
                                                <span>{formatCurrency(profitLossData?.expenses.mechanic_commissions || 0)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Beban Operasional</span>
                                                <span>{formatCurrency(profitLossData?.expenses.operating_expenses || 0)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Beban Administrasi</span>
                                                <span>{formatCurrency(profitLossData?.expenses.administrative_expenses || 0)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Penyusutan</span>
                                                <span>{formatCurrency(profitLossData?.expenses.depreciation_expenses || 0)}</span>
                                            </div>
                                            <div className="flex justify-between font-bold pt-2 border-t">
                                                <span>Total Beban Operasional</span>
                                                <span>{formatCurrency(
                                                    (profitLossData.expenses.mechanic_commissions || 0) +
                                                    (profitLossData.expenses.operating_expenses || 0) +
                                                    (profitLossData.expenses.administrative_expenses || 0) +
                                                    (profitLossData.expenses.depreciation_expenses || 0)
                                                )}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Laba Bersih */}
                                    <div className="border-t-2 pt-4">
                                        <div className="flex justify-between font-bold text-xl">
                                            <span>LABA BERSIH</span>
                                            <span className={profitLossData.profit.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                {formatCurrency(profitLossData.profit.net_profit)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground py-8">
                                    Tidak ada data laba rugi untuk periode ini
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Balance Sheet Tab */}
                <TabsContent value="balance-sheet" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Neraca Keuangan</CardTitle>
                                <CardDescription>
                                    Periode: {format(new Date(startDate), 'dd MMMM yyyy', { locale: id })} - {format(new Date(endDate), 'dd MMMM yyyy', { locale: id })}
                                </CardDescription>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => handleExportReport('balance-sheet')}>
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {balanceSheetLoading ? (
                                <div className="flex items-center justify-center h-32">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                </div>
                            ) : balanceSheetData ? (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Assets */}
                                    <div>
                                        <h4 className="font-semibold mb-4">AKTIVA</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <h5 className="font-medium mb-2">Aktiva Lancar</h5>
                                                <div className="space-y-1 pl-4">
                                                    <div className="flex justify-between">
                                                        <span className="text-sm">Kas</span>
                                                        <span className="text-sm">{formatCurrency(balanceSheetData.assets.current_assets.cash)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm">Bank</span>
                                                        <span className="text-sm">{formatCurrency(balanceSheetData.assets.current_assets.bank)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm">Piutang Usaha</span>
                                                        <span className="text-sm">{formatCurrency(balanceSheetData.assets.current_assets.accounts_receivable)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm">Persediaan</span>
                                                        <span className="text-sm">{formatCurrency(balanceSheetData.assets.current_assets.inventory)}</span>
                                                    </div>
                                                    <div className="flex justify-between font-medium pt-2 border-t">
                                                        <span>Total Aktiva Lancar</span>
                                                        <span>{formatCurrency(balanceSheetData.assets.current_assets.total_current_assets)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <h5 className="font-medium mb-2">Aktiva Tetap</h5>
                                                <div className="space-y-1 pl-4">
                                                    <div className="flex justify-between">
                                                        <span className="text-sm">Peralatan</span>
                                                        <span className="text-sm">{formatCurrency(balanceSheetData.assets.fixed_assets.equipment)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm">Akumulasi Penyusutan</span>
                                                        <span className="text-sm">({formatCurrency(balanceSheetData.assets.fixed_assets.accumulated_depreciation)})</span>
                                                    </div>
                                                    <div className="flex justify-between font-medium pt-2 border-t">
                                                        <span>Aktiva Tetap Neto</span>
                                                        <span>{formatCurrency(balanceSheetData.assets.fixed_assets.net_fixed_assets)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-between font-bold text-lg pt-4 border-t-2">
                                                <span>TOTAL AKTIVA</span>
                                                <span>{formatCurrency(balanceSheetData.assets.total_assets)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Liabilities & Equity */}
                                    <div>
                                        <h4 className="font-semibold mb-4">KEWAJIBAN & EKUITAS</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <h5 className="font-medium mb-2">Kewajiban Lancar</h5>
                                                <div className="space-y-1 pl-4">
                                                    <div className="flex justify-between">
                                                        <span className="text-sm">Utang Usaha</span>
                                                        <span className="text-sm">{formatCurrency(balanceSheetData.liabilities.current_liabilities.accounts_payable)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm">Beban Dibayar Dimuka</span>
                                                        <span className="text-sm">{formatCurrency(balanceSheetData.liabilities.current_liabilities.accrued_expenses)}</span>
                                                    </div>
                                                    <div className="flex justify-between font-medium pt-2 border-t">
                                                        <span>Total Kewajiban Lancar</span>
                                                        <span>{formatCurrency(balanceSheetData.liabilities.current_liabilities.total_current_liabilities)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-between font-medium pt-2 border-t">
                                                <span>Total Kewajiban</span>
                                                <span>{formatCurrency(balanceSheetData.liabilities.total_liabilities)}</span>
                                            </div>

                                            <div>
                                                <h5 className="font-medium mb-2">Ekuitas</h5>
                                                <div className="space-y-1 pl-4">
                                                    <div className="flex justify-between">
                                                        <span className="text-sm">Modal</span>
                                                        <span className="text-sm">{formatCurrency(balanceSheetData.equity.capital)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm">Laba Ditahan</span>
                                                        <span className="text-sm">{formatCurrency(balanceSheetData.equity.retained_earnings)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm">Laba Tahun Berjalan</span>
                                                        <span className="text-sm">{formatCurrency(balanceSheetData.equity.current_year_profit)}</span>
                                                    </div>
                                                    <div className="flex justify-between font-medium pt-2 border-t">
                                                        <span>Total Ekuitas</span>
                                                        <span>{formatCurrency(balanceSheetData.equity.total_equity)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-between font-bold text-lg pt-4 border-t-2">
                                                <span>TOTAL KEWAJIBAN & EKUITAS</span>
                                                <span>{formatCurrency(balanceSheetData.liabilities.total_liabilities + balanceSheetData.equity.total_equity)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground py-8">
                                    Tidak ada data neraca untuk periode ini
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Cash Flow Tab */}
                <TabsContent value="cash-flow" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Laporan Arus Kas</CardTitle>
                                <CardDescription>
                                    Periode: {format(new Date(startDate), 'dd MMMM yyyy', { locale: id })} - {format(new Date(endDate), 'dd MMMM yyyy', { locale: id })}
                                </CardDescription>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => handleExportReport('cash-flow')}>
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {cashFlowLoading ? (
                                <div className="flex items-center justify-center h-32">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                </div>
                            ) : cashFlowData ? (
                                <div className="space-y-6">
                                    {/* Operating Activities */}
                                    <div>
                                        <h4 className="font-semibold mb-3">ARUS KAS DARI AKTIVITAS OPERASIONAL</h4>
                                        <div className="space-y-2 pl-4">
                                            <div className="flex justify-between">
                                                <span>Kas diterima dari pelanggan</span>
                                                <span>{formatCurrency(cashFlowData.operating_activities.cash_from_customers)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Kas dibayar ke pemasok</span>
                                                <span>({formatCurrency(cashFlowData.operating_activities.cash_paid_to_suppliers)})</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Kas dibayar ke mekanik</span>
                                                <span>({formatCurrency(cashFlowData.operating_activities.cash_paid_to_mechanics)})</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Kas dibayar untuk beban</span>
                                                <span>({formatCurrency(cashFlowData.operating_activities.cash_paid_for_expenses)})</span>
                                            </div>
                                            <div className="flex justify-between font-medium pt-2 border-t">
                                                <span>Arus Kas Operasional Bersih</span>
                                                <span className={cashFlowData.operating_activities.net_operating_cash >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                    {formatCurrency(cashFlowData.operating_activities.net_operating_cash)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Investing Activities */}
                                    <div>
                                        <h4 className="font-semibold mb-3">ARUS KAS DARI AKTIVITAS INVESTASI</h4>
                                        <div className="space-y-2 pl-4">
                                            <div className="flex justify-between">
                                                <span>Pembelian peralatan</span>
                                                <span>({formatCurrency(cashFlowData.investing_activities.equipment_purchase)})</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Penjualan peralatan</span>
                                                <span>{formatCurrency(cashFlowData.investing_activities.equipment_sale)}</span>
                                            </div>
                                            <div className="flex justify-between font-medium pt-2 border-t">
                                                <span>Arus Kas Investasi Bersih</span>
                                                <span className={cashFlowData.investing_activities.net_investing_cash >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                    {formatCurrency(cashFlowData.investing_activities.net_investing_cash)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Financing Activities */}
                                    <div>
                                        <h4 className="font-semibold mb-3">ARUS KAS DARI AKTIVITAS PEMBIAYAAN</h4>
                                        <div className="space-y-2 pl-4">
                                            <div className="flex justify-between">
                                                <span>Penambahan modal</span>
                                                <span>{formatCurrency(cashFlowData.financing_activities.capital_injection)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Pengambilan prive</span>
                                                <span>({formatCurrency(cashFlowData.financing_activities.owner_drawings)})</span>
                                            </div>
                                            <div className="flex justify-between font-medium pt-2 border-t">
                                                <span>Arus Kas Pembiayaan Bersih</span>
                                                <span className={cashFlowData.financing_activities.net_financing_cash >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                    {formatCurrency(cashFlowData.financing_activities.net_financing_cash)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Net Cash Change */}
                                    <div className="border-t-2 pt-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span>Kas Awal</span>
                                                <span>{formatCurrency(cashFlowData.cash_beginning)}</span>
                                            </div>
                                            <div className="flex justify-between font-bold text-lg">
                                                <span>Perubahan Kas Bersih</span>
                                                <span className={cashFlowData.net_cash_change >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                    {formatCurrency(cashFlowData.net_cash_change)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between font-bold text-xl border-t pt-2">
                                                <span>Kas Akhir</span>
                                                <span>{formatCurrency(cashFlowData.cash_ending)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground py-8">
                                    Tidak ada data arus kas untuk periode ini
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Seasonality Tab */}
                <TabsContent value="seasonality" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Analisis Seasonality (Musiman)</CardTitle>
                                <CardDescription>
                                    Analisis pola musiman pendapatan dan prediksi tren bisnis
                                </CardDescription>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => handleExportReport('seasonality')}>
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {seasonalityLoading ? (
                                <div className="flex items-center justify-center h-32">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                </div>
                            ) : seasonalityData ? (
                                <div className="space-y-6">
                                    {/* Penjelasan tentang Seasonality Analysis */}
                                    <Card className="bg-blue-50 border-blue-200">
                                        <CardHeader>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <BarChart3 className="h-5 w-5" />
                                                Apa itu Analisis Seasonality?
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div>
                                                <h4 className="font-semibold mb-2">Definisi Seasonality</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Seasonality adalah pola berulang yang terjadi pada periode waktu tertentu dalam setahun.
                                                    Dalam konteks bisnis bengkel, ini membantu mengidentifikasi bulan-bulan sibuk
                                                    dan bulan sepi untuk optimasi sumber daya dan strategi pemasaran.
                                                </p>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold mb-2">Mengapa Penting?</h4>
                                                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                                                    <li>• Prediksi permintaan layanan dan persediaan barang</li>
                                                    <li>• Optimasi jadwal mekanik dan jam kerja</li>
                                                    <li>• Perencanaan keuangan dan cash flow yang lebih akurat</li>
                                                    <li>• Strategi promosi yang tepat sasaran waktu</li>
                                                    <li>• Pengelolaan stok sparepart yang efisien</li>
                                                </ul>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold mb-2">Metode Analisis</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Sistem menggunakan data historis transaksi untuk menghitung:
                                                </p>
                                                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside mt-2">
                                                    <li>• <strong>Seasonal Index:</strong> Rasio pendapatan bulanan terhadap rata-rata</li>
                                                    <li>• <strong>Growth Rate:</strong> Persentase pertumbuhan bulan ke bulan</li>
                                                    <li>• <strong>Trend Analysis:</strong> Pola pertumbuhan jangka panjang</li>
                                                    <li>• <strong>Volatility:</strong> Tingkat fluktuasi pendapatan</li>
                                                </ul>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Insights Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm">Tren Pendapatan</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">
                                                    <span className={`${seasonalityData.insights.trend === 'increasing' ? 'text-green-600' :
                                                        seasonalityData.insights.trend === 'decreasing' ? 'text-red-600' :
                                                            'text-yellow-600'
                                                        }`}>
                                                        {seasonalityData.insights.trend === 'increasing' ? '📈 Meningkat' :
                                                            seasonalityData.insights.trend === 'decreasing' ? '📉 Menurun' :
                                                                '📊 Stabil'}
                                                    </span>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm">Volatilitas</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">
                                                    <span className={`${seasonalityData.insights.volatility === 'high' ? 'text-red-600' :
                                                        seasonalityData.insights.volatility === 'low' ? 'text-green-600' :
                                                            'text-yellow-600'
                                                        }`}>
                                                        {seasonalityData.insights.volatility === 'high' ? '🔴 Tinggi' :
                                                            seasonalityData.insights.volatility === 'low' ? '🟢 Rendah' :
                                                                '🟡 Sedang'}
                                                    </span>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm">Prediktabilitas</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">
                                                    <span className={`${seasonalityData.insights.predictability === 'high' ? 'text-green-600' :
                                                        seasonalityData.insights.predictability === 'low' ? 'text-red-600' :
                                                            'text-yellow-600'
                                                        }`}>
                                                        {seasonalityData.insights.predictability === 'high' ? '✅ Tinggi' :
                                                            seasonalityData.insights.predictability === 'low' ? '❌ Rendah' :
                                                                '⚠️ Sedang'}
                                                    </span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Monthly Data Table */}
                                    <div>
                                        <h4 className="font-semibold mb-3">Data Bulanan</h4>
                                        <div className="overflow-x-auto">
                                            <table className="w-full border-collapse border rounded-lg">
                                                <thead>
                                                    <tr className="bg-muted">
                                                        <th className="border p-2 text-left">Bulan</th>
                                                        <th className="border p-2 text-right">Pendapatan</th>
                                                        <th className="border p-2 text-right">Beban</th>
                                                        <th className="border p-2 text-right">Laba</th>
                                                        <th className="border p-2 text-right">Transaksi</th>
                                                        <th className="border p-2 text-right">Rata-rata</th>
                                                        <th className="border p-2 text-right">Growth %</th>
                                                        <th className="border p-2 text-right">Seasonal Index</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {seasonalityData.monthly_data.map((data, index) => (
                                                        <tr key={index} className="hover:bg-muted/50">
                                                            <td className="border p-2 font-medium">{data.month}</td>
                                                            <td className="border p-2 text-right">
                                                                {data.revenue > 0 ? formatCurrency(data.revenue) : '-'}
                                                            </td>
                                                            <td className="border p-2 text-right">
                                                                {data.expenses > 0 ? formatCurrency(data.expenses) : '-'}
                                                            </td>
                                                            <td className={`border p-2 text-right font-medium ${data.profit > 0 ? 'text-green-600' : data.profit < 0 ? 'text-red-600' : 'text-gray-600'
                                                                }`}>
                                                                {data.profit !== 0 ? formatCurrency(data.profit) :
                                                                    data.profit < 0 ? `(${formatCurrency(Math.abs(data.profit))})` : '-'}
                                                            </td>
                                                            <td className="border p-2 text-right">
                                                                {data.transaction_count > 0 ? data.transaction_count : '-'}
                                                            </td>
                                                            <td className="border p-2 text-right">
                                                                {data.average_transaction_value > 0 ? formatCurrency(data.average_transaction_value) : '-'}
                                                            </td>
                                                            <td className={`border p-2 text-right font-medium ${data.growth_rate >= 0 ? 'text-green-600' :
                                                                data.growth_rate < 0 ? 'text-red-600' : 'text-gray-600'
                                                                }`}>
                                                                {data.growth_rate !== 0 ?
                                                                    (data.growth_rate > 0 ? '+' : '') + data.growth_rate.toFixed(1) + '%' :
                                                                    '-'
                                                                }
                                                            </td>
                                                            <td className={`border p-2 text-right font-medium ${data.seasonal_index >= 100 ? 'text-green-600' :
                                                                data.seasonal_index < 100 ? 'text-red-600' : 'text-gray-600'
                                                                }`}>
                                                                {data.seasonal_index > 0 ? data.seasonal_index.toFixed(0) : '-'}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Seasonal Patterns */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Card className="bg-green-50 border-green-200">
                                            <CardHeader>
                                                <CardTitle className="text-sm text-green-800">Bulan Puncak 📈</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-1">
                                                    {seasonalityData.seasonal_patterns.peak_months.length > 0 ? (
                                                        seasonalityData.seasonal_patterns.peak_months.map((month, index) => (
                                                            <div key={index} className="text-sm font-medium text-green-700">
                                                                • {month}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-sm text-muted-foreground">Tidak ada bulan puncak</div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="bg-red-50 border-red-200">
                                            <CardHeader>
                                                <CardTitle className="text-sm text-red-800">Bulan Sepi 📉</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-1">
                                                    {seasonalityData.seasonal_patterns.low_months.length > 0 ? (
                                                        seasonalityData.seasonal_patterns.low_months.map((month, index) => (
                                                            <div key={index} className="text-sm font-medium text-red-700">
                                                                • {month}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-sm text-muted-foreground">Tidak ada bulan sepi</div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="bg-blue-50 border-blue-200">
                                            <CardHeader>
                                                <CardTitle className="text-sm text-blue-800">Bulan Stabil 📊</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-1">
                                                    {seasonalityData.seasonal_patterns.stable_months.length > 0 ? (
                                                        seasonalityData.seasonal_patterns.stable_months.map((month, index) => (
                                                            <div key={index} className="text-sm font-medium text-blue-700">
                                                                • {month}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-sm text-muted-foreground">Tidak ada bulan stabil</div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Yearly Trend */}
                                    <div>
                                        <h4 className="font-semibold mb-3">Tren Tahunan</h4>
                                        <div className="overflow-x-auto">
                                            <table className="w-full border-collapse border rounded-lg">
                                                <thead>
                                                    <tr className="bg-muted">
                                                        <th className="border p-2 text-left">Tahun</th>
                                                        <th className="border p-2 text-right">Total Pendapatan</th>
                                                        <th className="border p-2 text-right">Total Beban</th>
                                                        <th className="border p-2 text-right">Total Laba</th>
                                                        <th className="border p-2 text-right">Pertumbuhan %</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {seasonalityData.yearly_trend.map((data, index) => (
                                                        <tr key={index} className="hover:bg-muted/50">
                                                            <td className="border p-2 font-medium">{data.year}</td>
                                                            <td className="border p-2 text-right">
                                                                {data.total_revenue > 0 ? formatCurrency(data.total_revenue) : '-'}
                                                            </td>
                                                            <td className="border p-2 text-right">
                                                                {data.total_expenses > 0 ? formatCurrency(data.total_expenses) : '-'}
                                                            </td>
                                                            <td className={`border p-2 text-right font-medium ${data.total_profit > 0 ? 'text-green-600' :
                                                                data.total_profit < 0 ? 'text-red-600' : 'text-gray-600'
                                                                }`}>
                                                                {data.total_profit !== 0 ? formatCurrency(data.total_profit) :
                                                                    data.total_profit < 0 ? `(${formatCurrency(Math.abs(data.total_profit))})` : '-'}
                                                            </td>
                                                            <td className={`border p-2 text-right font-medium ${data.growth_rate >= 0 ? 'text-green-600' :
                                                                data.growth_rate < 0 ? 'text-red-600' : 'text-gray-600'
                                                                }`}>
                                                                {data.growth_rate !== 0 ?
                                                                    (data.growth_rate > 0 ? '+' : '') + data.growth_rate.toFixed(1) + '%' :
                                                                    '-'
                                                                }
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground py-8">
                                    Tidak ada data seasonality untuk periode ini
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={isExpenseModalOpen} onOpenChange={setIsExpenseModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Catat Pengeluaran Operasional</DialogTitle>
                        <DialogDescription>
                            Catat biaya operasional seperti listrik, gaji, sewa, dll.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="date">Tanggal</Label>
                            <Input
                                id="date"
                                type="date"
                                value={newExpense.date}
                                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="category">Kategori</Label>
                            <Select
                                value={newExpense.category}
                                onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Gaji & Upah">Gaji & Upah</SelectItem>
                                    <SelectItem value="Komisi Mekanik">Komisi Mekanik</SelectItem>
                                    <SelectItem value="Listrik, Air & Internet">Listrik, Air & Internet</SelectItem>
                                    <SelectItem value="Sewa Gedung">Sewa Gedung</SelectItem>
                                    <SelectItem value="Perlengkapan">Perlengkapan</SelectItem>
                                    <SelectItem value="Pemasaran">Pemasaran</SelectItem>
                                    <SelectItem value="Pemeliharaan">Pemeliharaan</SelectItem>
                                    <SelectItem value="Beban Admin">Beban Admin</SelectItem>
                                    <SelectItem value="Beban Operasional">Lain-lain</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Keterangan</Label>
                            <Input
                                id="description"
                                placeholder="Contoh: Bayar listrik bulan Januari"
                                value={newExpense.description}
                                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="amount">Jumlah (Rp)</Label>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="0"
                                value={newExpense.amount}
                                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="notes">Catatan Tambahan (Opsional)</Label>
                            <Input
                                id="notes"
                                placeholder="Catatan detail..."
                                value={newExpense.notes}
                                onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsExpenseModalOpen(false)}>Batal</Button>
                        <Button onClick={handleAddExpense} disabled={isSubmitting}>
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Pengeluaran'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
