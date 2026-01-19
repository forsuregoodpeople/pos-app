"use client";

import { useState, useMemo } from "react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { usePembelian } from "@/hooks/usePembelian";
import { useSuppliers } from "@/hooks/usePembelian";
import { Calendar, DollarSign, AlertCircle, TrendingUp, Building, CheckCircle, Clock, FileText, Plus, Eye, Edit, Trash2, CreditCard, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function HutangPembelianPage() {
    const { purchases, loading, updatePurchase } = usePembelian();
    const { suppliers } = useSuppliers();
    const [dateFilter, setDateFilter] = useState<string>("all");
    const [supplierFilter, setSupplierFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
    const [paymentAmount, setPaymentAmount] = useState<string>("");
    const [paymentMethod, setPaymentMethod] = useState<string>("cash");
    const [paymentNote, setPaymentNote] = useState<string>("");

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

    // Calculate debt metrics
    const calculateDebtMetrics = (purchaseList: any[]) => {
        const unpaidPurchases = purchaseList.filter(p => p.payment_status !== 'paid');
        const totalDebt = unpaidPurchases.reduce((sum, p) => sum + (p.final_amount - (p.paid_amount || 0)), 0);
        const overduePurchases = unpaidPurchases.filter(p => {
            if (!p.due_date) return false;
            return new Date(p.due_date) < new Date();
        });
        const overdueAmount = overduePurchases.reduce((sum, p) => sum + (p.final_amount - (p.paid_amount || 0)), 0);

        // Group by supplier
        const supplierDebts: Record<string, { count: number; amount: number; overdue: number }> = {};
        unpaidPurchases.forEach(purchase => {
            if (purchase.supplier) {
                const supplierName = purchase.supplier.name;
                if (!supplierDebts[supplierName]) {
                    supplierDebts[supplierName] = { count: 0, amount: 0, overdue: 0 };
                }
                const remainingAmount = purchase.final_amount - (purchase.paid_amount || 0);
                supplierDebts[supplierName].count += 1;
                supplierDebts[supplierName].amount += remainingAmount;

                if (purchase.due_date && new Date(purchase.due_date) < new Date()) {
                    supplierDebts[supplierName].overdue += remainingAmount;
                }
            }
        });

        const topSupplierDebts = Object.entries(supplierDebts)
            .sort(([, a], [, b]) => b.amount - a.amount)
            .slice(0, 5)
            .map(([name, data]) => ({ name, ...data }));

        return {
            totalDebt,
            totalUnpaid: unpaidPurchases.length,
            overdueCount: overduePurchases.length,
            overdueAmount,
            topSupplierDebts
        };
    };

    const filteredPurchases = useMemo(() => {
        if (!purchases.length) return [];

        let filtered = [...purchases].filter(p => p.payment_status !== 'paid');

        // Date filter
        if (dateFilter === "week") {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            filtered = filtered.filter(p => new Date(p.purchase_date) >= weekAgo);
        } else if (dateFilter === "month") {
            const thisMonth = new Date().getMonth();
            const thisYear = new Date().getFullYear();
            filtered = filtered.filter(p => {
                const date = new Date(p.purchase_date);
                return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
            });
        } else if (dateFilter === "quarter") {
            const thisQuarter = Math.floor(new Date().getMonth() / 3);
            const thisYear = new Date().getFullYear();
            filtered = filtered.filter(p => {
                const date = new Date(p.purchase_date);
                return Math.floor(date.getMonth() / 3) === thisQuarter && date.getFullYear() === thisYear;
            });
        }

        // Supplier filter
        if (supplierFilter !== "all") {
            filtered = filtered.filter(p => p.supplier?.name === supplierFilter);
        }

        // Status filter
        if (statusFilter !== "all") {
            if (statusFilter === "overdue") {
                filtered = filtered.filter(p => {
                    if (!p.due_date) return false;
                    return new Date(p.due_date) < new Date();
                });
            } else {
                filtered = filtered.filter(p => p.payment_status === statusFilter);
            }
        }

        return filtered.sort((a, b) => new Date(a.purchase_date).getTime() - new Date(b.purchase_date).getTime());
    }, [purchases, dateFilter, supplierFilter, statusFilter]);

    const debtMetrics = useMemo(() => calculateDebtMetrics(filteredPurchases), [filteredPurchases]);

    // Get payment status badge
    const getPaymentStatusBadge = (status: string, dueDate?: string) => {
        const isOverdue = dueDate && new Date(dueDate) < new Date();

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
            partial: { label: "Sebagian", color: "bg-blue-100 text-blue-800" }
        };
        const item = config[status as keyof typeof config] || config.pending;
        return (
            <Badge variant="secondary" className={`text-xs font-medium ${item.color} border-0`}>
                {item.label}
            </Badge>
        );
    };

    // Handle payment
    const handlePayment = async () => {
        if (!selectedPurchase || !paymentAmount || parseFloat(paymentAmount) <= 0) {
            toast.error("Masukkan jumlah pembayaran yang valid", { position: "top-right" });
            return;
        }

        try {
            const amount = parseFloat(paymentAmount);
            const currentPaid = selectedPurchase.paid_amount || 0;
            const newPaidAmount = currentPaid + amount;
            const finalAmount = selectedPurchase.final_amount;

            let newStatus = selectedPurchase.payment_status;
            if (newPaidAmount >= finalAmount) {
                newStatus = 'paid';
            } else if (newPaidAmount > 0) {
                newStatus = 'partial';
            }

            await updatePurchase(selectedPurchase.id, {
                paid_amount: newPaidAmount,
                payment_status: newStatus,
                payment_method: paymentMethod,
                notes: paymentNote
            });

            toast.success("Pembayaran berhasil dicatat!", { position: "bottom-right" });
            setPaymentDialogOpen(false);
            setSelectedPurchase(null);
            setPaymentAmount("");
            setPaymentMethod("cash");
            setPaymentNote("");
        } catch (error) {
            console.error('Payment error:', error);
            toast.error("Gagal mencatat pembayaran", { position: "top-right" });
        }
    };

    // Open payment dialog
    const openPaymentDialog = (purchase: any) => {
        setSelectedPurchase(purchase);
        setPaymentAmount("");
        setPaymentMethod("cash");
        setPaymentNote("");
        setPaymentDialogOpen(true);
    };

    return (
        <SidebarInset className="font-sans">
            <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background px-4">
                <SidebarTrigger className="md:hidden" />
                <h1 className="text-lg font-semibold">Manajemen Hutang Pembelian</h1>
            </header>

            <div className="p-4 md:p-6">
                {/* Filter Section */}
                <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <div className="flex items-center gap-2">
                        <Calculator className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">Filter:</span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Select value={dateFilter} onValueChange={setDateFilter}>
                            <SelectTrigger className="w-full sm:w-48 text-sm h-10">
                                <SelectValue placeholder="Filter Tanggal" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" className="text-sm">Semua Waktu</SelectItem>
                                <SelectItem value="week" className="text-sm">7 Hari Terakhir</SelectItem>
                                <SelectItem value="month" className="text-sm">Bulan Ini</SelectItem>
                                <SelectItem value="quarter" className="text-sm">Kuartal Ini</SelectItem>
                            </SelectContent>
                        </Select>

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
                                <SelectItem value="overdue" className="text-sm">Terlambat</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-gray-500">Memuat data hutang pembelian...</div>
                    </div>
                ) : (
                    <>
                        {/* Debts Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Detail Hutang Pembelian</CardTitle>
                                <CardDescription>
                                    Menampilkan {filteredPurchases.length} transaksi belum lunas
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {filteredPurchases.length === 0 ? (
                                    <div className="flex items-center justify-center py-12 text-gray-500">
                                        <div className="text-center">
                                            <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                            <p className="text-sm font-medium">Tidak ada hutang pembelian</p>
                                            <p className="text-xs mt-1">Semua transaksi telah dilunasi</p>
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
                                                    <th className="text-left p-3 font-medium text-sm">Sisa Hutang</th>
                                                    <th className="text-left p-3 font-medium text-sm">Jatuh Tempo</th>
                                                    <th className="text-left p-3 font-medium text-sm">Status</th>
                                                    <th className="text-left p-3 font-medium text-sm">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredPurchases.map((purchase, index) => {
                                                    const remainingAmount = purchase.final_amount - (purchase.paid_amount || 0);
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
                                                                {formatCurrency(remainingAmount)}
                                                            </td>
                                                            <td className="p-3 text-sm">
                                                                {purchase.due_date ? (
                                                                    <div className={new Date(purchase.due_date) < new Date() ? "text-red-600 font-medium" : ""}>
                                                                        {formatDate(purchase.due_date)}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-gray-400">-</span>
                                                                )}
                                                            </td>
                                                            <td className="p-3 text-sm">
                                                                {getPaymentStatusBadge(purchase.payment_status, purchase.due_date)}
                                                            </td>
                                                            <td className="p-3 text-sm">
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => openPaymentDialog(purchase)}
                                                                    className="bg-blue-600 hover:bg-blue-700"
                                                                >
                                                                    <CreditCard className="w-3 h-3 mr-1" />
                                                                    Bayar
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                            <tfoot className="bg-gray-50 font-bold">
                                                <tr>
                                                    <td colSpan={5} className="p-3 text-right text-sm">
                                                        Total Hutang:
                                                    </td>
                                                    <td className="p-3 text-right text-lg font-bold text-red-600">
                                                        {formatCurrency(debtMetrics.totalDebt)}
                                                    </td>
                                                    <td className="p-3 text-sm"></td>
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

                {/* Payment Dialog */}
                <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Pembayaran Hutang</DialogTitle>
                            <DialogDescription>
                                Catat pembayaran untuk invoice {selectedPurchase?.invoice_number}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label>Supplier</Label>
                                <div className="text-sm font-medium mt-1">
                                    {selectedPurchase?.supplier?.name || '-'}
                                </div>
                            </div>
                            <div>
                                <Label>Total Pembelian</Label>
                                <div className="text-sm font-medium mt-1">
                                    {formatCurrency(selectedPurchase?.final_amount || 0)}
                                </div>
                            </div>
                            <div>
                                <Label>Sudah Dibayar</Label>
                                <div className="text-sm font-medium mt-1 text-green-600">
                                    {formatCurrency(selectedPurchase?.paid_amount || 0)}
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="paymentAmount">Jumlah Pembayaran</Label>
                                <Input
                                    id="paymentAmount"
                                    type="number"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    placeholder="0"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="paymentMethod">Metode Pembayaran</Label>
                                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Pilih metode pembayaran" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">Tunai</SelectItem>
                                        <SelectItem value="transfer">Transfer Bank</SelectItem>
                                        <SelectItem value="check">Cek/Giro</SelectItem>
                                        <SelectItem value="other">Lainnya</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="paymentNote">Catatan (Opsional)</Label>
                                <Textarea
                                    id="paymentNote"
                                    value={paymentNote}
                                    onChange={(e) => setPaymentNote(e.target.value)}
                                    placeholder="Tambahkan catatan pembayaran..."
                                    className="mt-1"
                                    rows={3}
                                />
                            </div>
                            {paymentAmount && parseFloat(paymentAmount) > 0 && (
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <div className="text-sm font-medium text-blue-800">
                                        Sisa Hutang Setelah Pembayaran:
                                    </div>
                                    <div className="text-lg font-bold text-blue-600">
                                        {formatCurrency(
                                            Math.max(0, (selectedPurchase?.final_amount || 0) - (selectedPurchase?.paid_amount || 0) - parseFloat(paymentAmount))
                                        )}
                                    </div>
                                </div>
                            )}
                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setPaymentDialogOpen(false)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    onClick={handlePayment}
                                    disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                                >
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    Proses Pembayaran
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </SidebarInset>
    );
}