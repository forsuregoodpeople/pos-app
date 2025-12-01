import { useMemo } from "react";
import { Transaction } from "./useTransaction";

interface CustomerTypeStats {
  type: string;
  count: number;
  total: number;
}

interface MonthlyRevenue {
  month: string;
  umum: number;
  perusahaan: number;
}

export const useTransactionFilters = (
  transactions: Transaction[],
  searchQuery: string,
  customerTypeFilter: string,
  dateFilter: string,
  startDate: string,
  endDate: string
) => {
  return useMemo(() => {
    return transactions
      .filter(transaction => {
        const matchesSearch = 
          transaction.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          transaction.customer.platNomor.toLowerCase().includes(searchQuery.toLowerCase()) ||
          transaction.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesCustomerType = 
          customerTypeFilter === "all" || 
          (customerTypeFilter === "umum" && (!transaction.customer.tipe || transaction.customer.tipe === "umum")) ||
          (customerTypeFilter === "perusahaan" && transaction.customer.tipe === "perusahaan");
        
        const matchesDateFilter = () => {
          const transactionDate = new Date(transaction.savedAt);
          
          // Custom date range filter
          if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // Include end date fully
            return transactionDate >= start && transactionDate <= end;
          }
          
          // Preset date filters
          if (dateFilter === "all") return true;
          
          const now = new Date();
          
          switch (dateFilter) {
            case "today":
              return transactionDate.toDateString() === now.toDateString();
            case "week":
              const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              return transactionDate >= weekAgo;
            case "month":
              return transactionDate.getMonth() === now.getMonth() && 
                     transactionDate.getFullYear() === now.getFullYear();
            case "year":
              return transactionDate.getFullYear() === now.getFullYear();
            default:
              return true;
          }
        };
        
        return matchesSearch && matchesCustomerType && matchesDateFilter();
      })
      .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()); // Sort by latest first (descending)
  }, [transactions, searchQuery, customerTypeFilter, dateFilter, startDate, endDate]);
};

export const useTransactionStats = (transactions: Transaction[]) => {
  return useMemo(() => {
    // Customer type statistics
    const customerTypeStats = transactions.reduce((acc, transaction) => {
      const type = transaction.customer.tipe === "perusahaan" ? "Perusahaan" : "Umum";
      const existing = acc.find(item => item.type === type);
      if (existing) {
        existing.count += 1;
        existing.total += transaction.total;
      } else {
        acc.push({ type, count: 1, total: transaction.total });
      }
      return acc;
    }, [] as CustomerTypeStats[]);

    // Monthly revenue data
    const monthlyRevenue = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.savedAt);
      const monthName = date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
      
      const existing = acc.find(item => item.month === monthName);
      if (existing) {
        existing.umum += (!transaction.customer.tipe || transaction.customer.tipe === "umum") ? transaction.total : 0;
        existing.perusahaan += transaction.customer.tipe === "perusahaan" ? transaction.total : 0;
      } else {
        acc.push({
          month: monthName,
          umum: (!transaction.customer.tipe || transaction.customer.tipe === "umum") ? transaction.total : 0,
          perusahaan: transaction.customer.tipe === "perusahaan" ? transaction.total : 0
        });
      }
      return acc;
    }, [] as MonthlyRevenue[])
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6);

    // Calculate growth rate
    const calculateGrowthRate = () => {
      if (monthlyRevenue.length < 2) return 0;
      
      const currentMonth = monthlyRevenue[monthlyRevenue.length - 1];
      const previousMonth = monthlyRevenue[monthlyRevenue.length - 2];
      
      const currentTotal = currentMonth.umum + currentMonth.perusahaan;
      const previousTotal = previousMonth.umum + previousMonth.perusahaan;
      
      if (previousTotal === 0) return 0;
      
      return ((currentTotal - previousTotal) / previousTotal) * 100;
    };

    // Generate prediction data
    const generatePredictionData = (aiAnalysis: any) => {
      if (monthlyRevenue.length === 0) return [];
      
      const data = [...monthlyRevenue];
      const lastMonth = new Date(data[data.length - 1].month);
      const nextMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 1);
      const nextMonthName = nextMonth.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
      
      if (aiAnalysis) {
        const lastTotal = data[data.length - 1].umum + data[data.length - 1].perusahaan;
        const umumRatio = data[data.length - 1].umum / lastTotal;
        const perusahaanRatio = data[data.length - 1].perusahaan / lastTotal;
        
        data.push({
          month: nextMonthName,
          umum: Math.round(aiAnalysis.nextMonthPrediction * umumRatio),
          perusahaan: Math.round(aiAnalysis.nextMonthPrediction * perusahaanRatio)
        });
      }
      
      return data;
    };

    return {
      customerTypeStats,
      monthlyRevenue,
      generatePredictionData,
      growthRate: calculateGrowthRate()
    };
  }, [transactions]);
};