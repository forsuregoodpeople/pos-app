"use client";

import React, { useState, useEffect } from "react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Users, TrendingUp, TrendingDown, Calendar, Award, Search, Filter, Download, Star, Activity, DollarSign, Wrench, Target, BarChart3, PieChart as PieChartIcon, TrendingUp as TrendingUpIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useMechanicPerformance } from "@/hooks/useMechanicPerformance";
import { MechanicPerformanceSummary } from "@/services/mechanic-performance/mechanic-performance";
import { toast } from "sonner";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Area,
    AreaChart
} from "recharts";

export default function LaporanPerformaMekanikPage() {
    const { summaries, topPerformers, trendData, loading, error } = useMechanicPerformance();
    const [searchQuery, setSearchQuery] = useState("");
    const [dateFilter, setDateFilter] = useState<string>("all");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [selectedMechanic, setSelectedMechanic] = useState<MechanicPerformanceSummary | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [performanceFilter, setPerformanceFilter] = useState<string>("all");

    const [isClient, setIsClient] = useState(false);
    const [isTablet, setIsTablet] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        // Detect tablet/iPad
        const checkTablet = () => {
            const width = window.innerWidth;
            const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            const isIPad = /iPad|Macintosh/.test(navigator.userAgent) && 'ontouchend' in document;
            setIsTablet(width >= 768 && width <= 1024 && (isTouchDevice || isIPad));
        };
        
        checkTablet();
        window.addEventListener('resize', checkTablet);
        return () => window.removeEventListener('resize', checkTablet);
    }, []);

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

    const getPerformanceBadge = (score: number) => {
        if (score >= 80) {
            return <Badge className="bg-green-100 text-green-800 border-0">Excellent</Badge>;
        } else if (score >= 60) {
            return <Badge className="bg-blue-100 text-blue-800 border-0">Good</Badge>;
        } else if (score >= 40) {
            return <Badge className="bg-yellow-100 text-yellow-800 border-0">Average</Badge>;
        } else {
            return <Badge className="bg-red-100 text-red-800 border-0">Poor</Badge>;
        }
    };

    const getActivityBadge = (status: string) => {
        const config = {
            Active: { label: "Aktif", color: "bg-green-100 text-green-800" },
            Recent: { label: "Baru", color: "bg-blue-100 text-blue-800" },
            Inactive: { label: "Tidak Aktif", color: "bg-gray-100 text-gray-800" }
        };
        const item = config[status as keyof typeof config] || config.Inactive;
        return <Badge className={`text-xs ${item.color} border-0`}>{item.label}</Badge>;
    };

    const filteredSummaries = summaries.filter(summary => {
        const matchesSearch = summary.mechanic_name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPerformance = performanceFilter === "all" ||
            (performanceFilter === "active" && summary.activity_status === "Active") ||
            (performanceFilter === "recent" && summary.activity_status === "Recent") ||
            (performanceFilter === "inactive" && summary.activity_status === "Inactive");
        return matchesSearch && matchesPerformance;
    });

    // Prepare chart data with memoization to prevent unnecessary re-renders
    const chartData = React.useMemo(() => {
        const statusData = [
            { name: 'Aktif', value: summaries.filter(s => s.activity_status === 'Active').length, color: '#10b981' },
            { name: 'Baru', value: summaries.filter(s => s.activity_status === 'Recent').length, color: '#3b82f6' },
            { name: 'Tidak Aktif', value: summaries.filter(s => s.activity_status === 'Inactive').length, color: '#ef4444' }
        ];
        
        // Use actual trend data from database
        const actualTrendData = trendData.length > 0 ? trendData : [];
        
        return { statusData, trendData: actualTrendData };
    }, [summaries, trendData]);

    // Memoize stats calculations
    const statsData = React.useMemo(() => {
        const totalMechanics = summaries.length;
        const activeMechanics = summaries.filter(s => s.activity_status === "Active").length;
        const totalRevenue = summaries.reduce((sum, s) => sum + s.total_revenue, 0);
        const avgPerformance = summaries.length > 0
            ? summaries.reduce((sum, s) => sum + s.avg_performance_score, 0) / summaries.length
            : 0;
        
        return { totalMechanics, activeMechanics, totalRevenue, avgPerformance };
    }, [summaries]);

    const exportToCSV = () => {
        try {
            const headers = [
                'Nama Mekanik',
                'Total Transaksi',
                'Total Pendapatan',
                'Total Komisi',
                'Skor Performa Rata-rata',
                'Status Aktivitas',
                'Transaksi Terakhir'
            ];

            const rows = filteredSummaries.map(summary => [
                summary.mechanic_name,
                summary.total_transactions.toString(),
                summary.total_revenue.toString(),
                summary.total_commission.toString(),
                summary.avg_performance_score.toString(),
                summary.activity_status,
                formatDate(summary.last_transaction_date)
            ]);

            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `laporan-performa-mekanik-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            toast.success("Laporan performa mekanik berhasil diunduh!", { position: "bottom-right" });
        } catch (error) {
            console.error('Export error:', error);
            toast.error("Gagal mengunduh laporan", { position: "top-right" });
        }
    };

    const openDetailModal = (mechanic: MechanicPerformanceSummary) => {
        setSelectedMechanic(mechanic);
        setShowDetailModal(true);
    };

    if (!isClient) {
        return (
            <SidebarInset className="font-sans">
                <div className="flex items-center justify-center h-screen">
                    <div className="text-gray-500">Loading...</div>
                </div>
            </SidebarInset>
        );
    }

    return (
        <SidebarInset className="font-sans">
            <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background px-4">
                <SidebarTrigger className="md:hidden" />
                <h1 className="text-lg font-semibold">Laporan Performa Mekanik</h1>
            </header>

            <div className="p-2 md:p-4">
                {/* Compact Stats Cards for Tablet */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <Card className="p-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500">Total</p>
                                <p className="text-lg font-bold">{statsData.totalMechanics}</p>
                            </div>
                            <Users className="w-4 h-4 text-blue-600" />
                        </div>
                    </Card>

                    <Card className="p-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500">Aktif</p>
                                <p className="text-lg font-bold text-green-600">
                                    {statsData.activeMechanics}
                                </p>
                            </div>
                            <Activity className="w-4 h-4 text-green-600" />
                        </div>
                    </Card>

                    <Card className="p-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500">Pendapatan</p>
                                <p className="text-lg font-bold text-blue-600">
                                    {formatCurrency(statsData.totalRevenue)}
                                </p>
                            </div>
                            <DollarSign className="w-4 h-4 text-blue-600" />
                        </div>
                    </Card>

                    <Card className="p-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500">Performa</p>
                                <p className="text-lg font-bold text-purple-600">
                                    {statsData.avgPerformance.toFixed(0)}
                                </p>
                            </div>
                            <BarChart3 className="w-4 h-4 text-purple-600" />
                        </div>
                    </Card>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                    {/* Bar Chart - Pendapatan per Mekanik */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <BarChart3 className="w-4 h-4" />
                                Pendapatan per Mekanik
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={isTablet ? 200 : 300}>
                                <BarChart data={filteredSummaries.slice(0, isTablet ? 5 : 8)}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="mechanic_name" tick={{ fontSize: isTablet ? 10 : 12 }} />
                                    <YAxis tick={{ fontSize: isTablet ? 10 : 12 }} />
                                    <Tooltip
                                        formatter={(value: number) => formatCurrency(value)}
                                        contentStyle={{ fontSize: isTablet ? 11 : 12 }}
                                    />
                                    <Bar dataKey="total_revenue" fill="#3b82f6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Pie Chart - Status Mekanik */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <PieChartIcon className="w-4 h-4" />
                                Status Mekanik
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={isTablet ? 200 : 300}>
                                <PieChart>
                                    <Pie
                                        data={chartData.statusData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={isTablet ? 60 : 80}
                                        fill="#8884d8"
                                    >
                                        <Cell fill="#10b981" />
                                        <Cell fill="#3b82f6" />
                                        <Cell fill="#ef4444" />
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ fontSize: isTablet ? 11 : 12 }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Line Chart - Trend Performa */}
                <Card className="mb-6">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <TrendingUpIcon className="w-4 h-4" />
                            Trend Performa (6 Bulan Terakhir)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {chartData.trendData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                <TrendingUpIcon className="w-12 h-12 mb-3 opacity-30" />
                                <p className="text-sm font-medium">Belum ada data trend</p>
                                <p className="text-xs mt-1">Data performa akan muncul setelah ada transaksi</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={isTablet ? 200 : 250}>
                                <LineChart data={chartData.trendData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" tick={{ fontSize: isTablet ? 10 : 12 }} />
                                    <YAxis tick={{ fontSize: isTablet ? 10 : 12 }} />
                                    <Tooltip
                                        formatter={(value: number) => `${value.toFixed(1)}/100`}
                                        contentStyle={{ fontSize: isTablet ? 11 : 12 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="avg_score"
                                        stroke="#8b5cf6"
                                        strokeWidth={2}
                                        dot={{ fill: '#8b5cf6', r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Compact Filter Section */}
                <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">Filter:</span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder="Cari mekanik..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 w-48 text-sm"
                            />
                        </div>

                        <Select value={dateFilter} onValueChange={setDateFilter}>
                            <SelectTrigger className="w-36 text-sm">
                                <SelectValue placeholder="Filter" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua</SelectItem>
                                <SelectItem value="today">Hari Ini</SelectItem>
                                <SelectItem value="week">7 Hari</SelectItem>
                                <SelectItem value="month">Bulan Ini</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={performanceFilter} onValueChange={setPerformanceFilter}>
                            <SelectTrigger className="w-36 text-sm">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua</SelectItem>
                                <SelectItem value="active">Aktif</SelectItem>
                                <SelectItem value="recent">Baru</SelectItem>
                                <SelectItem value="inactive">Tidak Aktif</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            onClick={exportToCSV}
                            className="flex items-center gap-2 text-sm"
                            variant="outline"
                            size="sm"
                        >
                            <Download className="w-3 h-3" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Top Performers Section */}
                <div className="mb-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Award className="w-4 h-4 text-yellow-600" />
                                Top 5 Performer
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {topPerformers.length === 0 ? (
                                    <div className="text-center py-6 text-gray-500">
                                        <Award className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                        <p className="text-sm font-medium">Belum ada data</p>
                                    </div>
                                ) : (
                                    topPerformers.map((performer, index) => (
                                        <div key={performer.mechanic_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full font-bold text-xs">
                                                    #{index + 1}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-sm">{performer.mechanic_name}</div>
                                                    <div className="text-xs text-gray-600">
                                                        {performer.total_transactions} transaksi • {formatCurrency(performer.total_revenue)}
                                                    </div>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        {getPerformanceBadge(performer.avg_performance_score)}
                                                        {getActivityBadge(performer.activity_status)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-blue-600">
                                                    {formatCurrency(performer.total_revenue)}
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openDetailModal(performer)}
                                                    className="ml-2 h-6 px-2 text-xs"
                                                >
                                                    <Target className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Compact Table */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-600" />
                            Data Mekanik ({filteredSummaries.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {filteredSummaries.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Users className="w-12 h-12 mb-3 opacity-30" />
                                <p className="text-sm font-medium">Tidak ada data</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-sm">
                                    <thead>
                                        <tr className="border-b bg-gray-50">
                                            <th className="text-left p-2 font-medium">Nama</th>
                                            <th className="text-center p-2 font-medium">Transaksi</th>
                                            <th className="text-right p-2 font-medium">Pendapatan</th>
                                            <th className="text-right p-2 font-medium">Komisi</th>
                                            <th className="text-center p-2 font-medium">Performa</th>
                                            <th className="text-center p-2 font-medium">Status</th>
                                            <th className="text-center p-2 font-medium">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredSummaries.map((summary) => (
                                            <tr key={summary.mechanic_id} className="border-b hover:bg-gray-50">
                                                <td className="p-2">
                                                    <div className="font-medium text-sm">{summary.mechanic_name}</div>
                                                </td>
                                                <td className="p-2 text-center text-sm">
                                                    {summary.total_transactions}
                                                </td>
                                                <td className="p-2 text-right text-sm font-bold text-blue-600">
                                                    {formatCurrency(summary.total_revenue)}
                                                </td>
                                                <td className="p-2 text-right text-sm font-bold text-green-600">
                                                    {formatCurrency(summary.total_commission)}
                                                </td>
                                                <td className="p-2 text-center">
                                                    {getPerformanceBadge(summary.avg_performance_score)}
                                                </td>
                                                <td className="p-2 text-center">
                                                    {getActivityBadge(summary.activity_status)}
                                                </td>
                                                <td className="p-2 text-center">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openDetailModal(summary)}
                                                        className="h-6 px-2 text-xs"
                                                    >
                                                        <Target className="w-3 h-3" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Detail Modal */}
            <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-600" />
                            Detail Performa Mekanik
                        </DialogTitle>
                        <DialogDescription>
                            Informasi lengkap performa mekanik
                        </DialogDescription>
                    </DialogHeader>
                    {selectedMechanic && (
                        <div className="space-y-6 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Nama Mekanik</Label>
                                    <div className="text-lg font-semibold">{selectedMechanic.mechanic_name}</div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Status Aktivitas</Label>
                                    <div className="mt-1">
                                        {getActivityBadge(selectedMechanic.activity_status)}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Total Transaksi</Label>
                                    <div className="text-2xl font-bold">{selectedMechanic.total_transactions}</div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Total Pendapatan</Label>
                                    <div className="text-2xl font-bold text-blue-600">
                                        {formatCurrency(selectedMechanic.total_revenue)}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Total Komisi (Setelah Potongan Toko)</Label>
                                    <div className="text-2xl font-bold text-green-600">
                                        {formatCurrency(selectedMechanic.total_commission)}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        Komisi yang diterima setelah potongan toko
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Skor Performa Rata-rata</Label>
                                    <div className="text-2xl font-bold text-purple-600">
                                        {selectedMechanic.avg_performance_score.toFixed(1)}/100
                                    </div>
                                    <div className="mt-1">
                                        {getPerformanceBadge(selectedMechanic.avg_performance_score)}
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <Label className="text-sm font-medium text-gray-700">Transaksi Terakhir</Label>
                                <div className="text-lg">
                                    {formatDate(selectedMechanic.last_transaction_date)}
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                            Tutup
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </SidebarInset>
    );
}