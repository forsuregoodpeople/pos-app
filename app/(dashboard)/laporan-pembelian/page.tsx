"use client";

import { useState, useMemo } from "react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { usePembelian } from "@/hooks/usePembelian";
import { useSuppliers } from "@/hooks/usePembelian";
import { Calendar, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Download, Filter, FileText, Users, Building, AlertCircle, ArrowUpRight, ArrowDownRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function LaporanPembelianPage() {
    const { purchases, loading } = usePembelian();
    const { suppliers } = useSuppliers();
    const [dateFilter, setDateFilter] = useState<string>("month");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [supplierFilter, setSupplierFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            return date.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Calculate financial metrics for filtered purchases
    const calculateMetrics = (purchaseList: any[]) => {
        const totalPurchases = purchaseList.length;
        const totalAmount = purchaseList.reduce((sum, p) => sum + p.final_amount, 0);
        const avgPurchaseValue = totalPurchases > 0 ? totalAmount / totalPurchases : 0;

        // Separate by payment status
        let pendingAmount = 0;
        let paidAmount = 0;
        let overdueAmount = 0;

        purchaseList.forEach(purchase => {
            if (purchase.payment_status === 'pending') {
                pendingAmount += purchase.final_amount - (purchase.paid_amount || 0);
            } else if (purchase.payment_status === 'paid') {
                paidAmount += purchase.final_amount;
            } else if (purchase.payment_status === 'overdue') {
                overdueAmount += purchase.final_amount - (purchase.paid_amount || 0);
            }
        });

        // Top suppliers
        const supplierTotals: Record<string, { count: number; amount: number }> = {};
        purchaseList.forEach(purchase => {
            if (purchase.supplier) {
                const supplierName = purchase.supplier.name;
                if (!supplierTotals[supplierName]) {
                    supplierTotals[supplierName] = { count: 0, amount: 0 };
                }
                supplierTotals[supplierName].count += 1;
                supplierTotals[supplierName].amount += purchase.final_amount;
            }
        });

        const topSuppliers = Object.entries(supplierTotals)
            .sort(([, a], [, b]) => b.amount - a.amount)
            .slice(0, 5)
            .map(([name, data]) => ({ name, ...data }));

        return {
            totalPurchases,
            totalAmount,
            avgPurchaseValue,
            pendingAmount,
            paidAmount,
            overdueAmount,
            topSuppliers
        };
    };

    const filteredPurchases = useMemo(() => {
        if (!purchases.length) return [];

        const now = new Date();
        let filtered = [...purchases];

        // Date filter
        if (dateFilter === "today") {
            const today = now.toDateString();
            filtered = filtered.filter(p => new Date(p.purchase_date).toDateString() === today);
        } else if (dateFilter === "week") {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            filtered = filtered.filter(p => new Date(p.purchase_date) >= weekAgo);
        } else if (dateFilter === "month") {
            const thisMonth = now.getMonth();
            const thisYear = now.getFullYear();
            filtered = filtered.filter(p => {
                const date = new Date(p.purchase_date);
                return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
            });
        } else if (dateFilter === "year") {
            const thisYear = now.getFullYear();
            filtered = filtered.filter(p => new Date(p.purchase_date).getFullYear() === thisYear);
        } else if (dateFilter === "custom" && startDate && endDate) {
            filtered = filtered.filter(p => {
                const date = new Date(p.purchase_date);
                return date >= new Date(startDate) && date <= new Date(endDate);
            });
        }

        // Supplier filter
        if (supplierFilter !== "all") {
            filtered = filtered.filter(p => p.supplier?.name === supplierFilter);
        }

        // Status filter
        if (statusFilter !== "all") {
            filtered = filtered.filter(p => p.payment_status === statusFilter);
        }

        return filtered.sort((a, b) => new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime());
    }, [purchases, dateFilter, startDate, endDate, supplierFilter, statusFilter]);

    const filteredMetrics = useMemo(() => calculateMetrics(filteredPurchases), [filteredPurchases]);

    // Export to CSV
    const exportToCSV = () => {
        try {
            const headers = [
                'No. Invoice',
                'Tanggal',
                'Supplier',
                'Total',
                'Sudah Dibayar',
                'Sisa',
                'Status',
                'Jatuh Tempo'
            ];

            const rows = filteredPurchases.map(p => {
                const remaining = p.final_amount - (p.paid_amount || 0);
                return [
                    p.invoice_number,
                    formatDate(p.purchase_date),
                    p.supplier?.name || '',
                    p.final_amount.toString(),
                    (p.paid_amount || 0).toString(),
                    remaining.toString(),
                    p.payment_status,
                    p.due_date || ''
                ];
            });

            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `laporan-pembelian-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("Laporan pembelian berhasil diunduh!", { position: "bottom-right" });
        } catch (error) {
            console.error('Export error:', error);
            toast.error("Gagal mengunduh laporan", { position: "top-right" });
        }
    };

    // Get payment status badge
    const getPaymentStatusBadge = (status: string, dueDate?: string, paidAmount?: number, finalAmount?: number) => {
        const remaining = (finalAmount || 0) - (paidAmount || 0);
        const isOverdue = dueDate && new Date(dueDate) < new Date() && remaining > 0;

        if (isOverdue) {
            return (
                <Badge variant="destructive" className="text-xs font-medium">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Terlambat
                </Badge>
            );
        }

        const config = {
            pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
            partial: { label: "Sebagian", color: "bg-blue-100 text-blue-800" },
            paid: { label: "Lunas", color: "bg-green-100 text-green-800" }
        };
        const item = config[status as keyof typeof config] || config.pending;
        return (
            <Badge variant="secondary" className={`text-xs font-medium ${item.color} border-0`}>
                {item.label}
            </Badge>
        );
    };

    return (
        <SidebarInset className="font-sans">
            <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background px-4">
                <SidebarTrigger className="md:hidden" />
                <h1 className="text-lg font-semibold">Laporan Pembelian</h1>
            </header>

            <div className="p-4 md:p-6">
                {/* Filter Section */}
                <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">Filter:</span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Select value={dateFilter} onValueChange={(value) => {
                            setDateFilter(value);
                            if (value !== "custom") {
                                setStartDate("");
                                setEndDate("");
                            }
                        }}>
                            <SelectTrigger className="w-full sm:w-48 text-sm h-10">
                                <SelectValue placeholder="Filter Tanggal" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="today" className="text-sm">Hari Ini</SelectItem>
                                <SelectItem value="week" className="text-sm">7 Hari Terakhir</SelectItem>
                                <SelectItem value="month" className="text-sm">Bulan Ini</SelectItem>
                                <SelectItem value="year" className="text-sm">Tahun Ini</SelectItem>
                                <SelectItem value="custom" className="text-sm">Custom Range</SelectItem>
                            </SelectContent>
                        </Select>

                        {dateFilter === "custom" && (
                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md text-sm h-10"
                                    placeholder="Dari"
                                />
                                <span className="text-gray-500 text-sm">s/d</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md text-sm h-10"
                                    placeholder="Sampai"
                                />
                            </div>
                        )}

                        <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                            <SelectTrigger className="w-full sm:w-48 text-sm h-10">
                                <SelectValue placeholder="Filter Supplier" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" className="text-sm">Semua Supplier</SelectItem>
                                {suppliers.map((supplier) => (
                                    <SelectItem key={supplier.id} value={supplier.name}>
                                        {supplier.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-48 text-sm h-10">
                                <SelectValue placeholder="Filter Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" className="text-sm">Semua Status</SelectItem>
                                <SelectItem value="pending" className="text-sm">Pending</SelectItem>
                                <SelectItem value="partial" className="text-sm">Sebagian</SelectItem>
                                <SelectItem value="paid" className="text-sm">Lunas</SelectItem>
                                <SelectItem value="overdue" className="text-sm">Terlambat</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            onClick={exportToCSV}
                            className="flex items-center gap-2"
                            variant="outline"
                        >
                            <Download className="w-4 h-4" />
                            Export CSV
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-gray-500">Memuat data laporan pembelian...</div>
                    </div>
                ) : (
                    <>
                        {/* Purchases Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Detail Pembelian</CardTitle>
                                <CardDescription>
                                    Menampilkan {filteredPurchases.length} transaksi
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {filteredPurchases.length === 0 ? (
                                    <div className="flex items-center justify-center py-12 text-gray-500">
                                        <div className="text-center">
                                            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                            <p className="text-sm font-medium">Tidak ada data pembelian</p>
                                            <p className="text-xs mt-1">Data pembelian akan muncul di sini</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="border-b bg-gray-50">
                                                    <th className="text-left p-3 font-medium text-sm">No. Invoice</th>
                                                    <th className="text-left p-3 font-medium text-sm">Tanggal</th>
                                                    <th className="text-left p-3 font-medium text-sm">Supplier</th>
                                                    <th className="text-left p-3 font-medium text-sm">Total</th>
                                                    <th className="text-left p-3 font-medium text-sm">Sudah Dibayar</th>
                                                    <th className="text-left p-3 font-medium text-sm">Sisa</th>
                                                    <th className="text-left p-3 font-medium text-sm">Status</th>
                                                    <th className="text-left p-3 font-medium text-sm">Jatuh Tempo</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredPurchases.map((purchase, index) => {
                                                    const remaining = purchase.final_amount - (purchase.paid_amount || 0);
                                                    return (
                                                        <tr key={`${purchase.id}-${index}`} className="border-b hover:bg-gray-50">
                                                            <td className="p-3 text-sm font-medium">{purchase.invoice_number}</td>
                                                            <td className="p-3 text-sm">{formatDate(purchase.purchase_date)}</td>
                                                            <td className="p-3 text-sm">
                                                                <div className="font-medium">{purchase.supplier?.name || '-'}</div>
                                                            </td>
                                                            <td className="p-3 text-sm text-right font-bold">
                                                                {formatCurrency(purchase.final_amount)}
                                                            </td>
                                                            <td className="p-3 text-sm text-right font-medium text-green-600">
                                                                {formatCurrency(purchase.paid_amount || 0)}
                                                            </td>
                                                            <td className="p-3 text-sm text-right font-bold text-red-600">
                                                                {formatCurrency(remaining)}
                                                            </td>
                                                            <td className="p-3 text-sm">
                                                                {getPaymentStatusBadge(purchase.payment_status, purchase.due_date, purchase.paid_amount, purchase.final_amount)}
                                                            </td>
                                                            <td className="p-3 text-sm">
                                                                {purchase.due_date ? (
                                                                    <div className={new Date(purchase.due_date) < new Date() && remaining > 0 ? "text-red-600 font-medium" : ""}>
                                                                        {formatDate(purchase.due_date)}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-gray-400">-</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                            <tfoot className="bg-gray-50 font-bold">
                                                <tr>
                                                    <td colSpan={3} className="p-3 text-right text-sm">
                                                        Total:
                                                    </td>
                                                    <td className="p-3 text-right text-lg font-bold text-blue-600">
                                                        {formatCurrency(filteredMetrics.totalAmount)}
                                                    </td>
                                                    <td className="p-3 text-right text-lg font-bold text-green-600">
                                                        {formatCurrency(filteredPurchases.reduce((sum, p) => sum + (p.paid_amount || 0), 0))}
                                                    </td>
                                                    <td className="p-3 text-right text-lg font-bold text-red-600">
                                                        {formatCurrency(filteredMetrics.totalAmount - filteredPurchases.reduce((sum, p) => sum + (p.paid_amount || 0), 0))}
                                                    </td>
                                                    <td className="p-3 text-sm"></td>
                                                    <td className="p-3 text-sm"></td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </SidebarInset>
    );
}