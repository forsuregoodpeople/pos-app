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

interface ServicePerformance {
  [serviceName: string]: {
    count: number;
    revenue: number;
  };
}

interface CustomerBehavior {
  umumPercentage: number;
  perusahaanPercentage: number;
  behaviorInsight: string;
}

interface SeasonalTrends {
  currentMonthData: { count: number; revenue: number };
  avgMonthlyRevenue: number;
  seasonalInsight: string;
}

interface AIAnalysis {
  totalRevenue: number;
  avgTransactionValue: number;
  growthRate: number;
  nextMonthPrediction: number;
  customerBehavior: CustomerBehavior;
  topServices: [string, { count: number; revenue: number }][];
  seasonalTrends: SeasonalTrends;
  totalTransactions: number;
}

export const useAIAnalysis = (transactions: Transaction[]): AIAnalysis | null => {
  return useMemo(() => {
    if (transactions.length === 0) return null;

    const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);
    const avgTransactionValue = totalRevenue / transactions.length;
    
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
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
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
    const lastTwoMonths = monthlyRevenue.slice(-2);
    const growthRate = lastTwoMonths.length === 2 ? 
      ((lastTwoMonths[1].umum + lastTwoMonths[1].perusahaan) - 
       (lastTwoMonths[0].umum + lastTwoMonths[0].perusahaan)) / 
      (lastTwoMonths[0].umum + lastTwoMonths[0].perusahaan) * 100 : 0;

    // Predict next month sales using simple linear regression
    const predictNextMonth = () => {
      if (monthlyRevenue.length < 2) return 0;
      
      const revenues = monthlyRevenue.map(m => m.umum + m.perusahaan);
      const n = revenues.length;
      const x = Array.from({length: n}, (_, i) => i);
      const sumX = x.reduce((a, b) => a + b, 0);
      const sumY = revenues.reduce((a, b) => a + b, 0);
      const sumXY = x.reduce((sum, xi, i) => sum + xi * revenues[i], 0);
      const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
      
      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;
      
      return Math.max(0, slope * n + intercept);
    };

    const nextMonthPrediction = predictNextMonth();
    
    // Customer behavior analysis
    const analyzeCustomerBehavior = (): CustomerBehavior => {
      const umumCustomers = customerTypeStats.find(c => c.type === "Umum");
      const perusahaanCustomers = customerTypeStats.find(c => c.type === "Perusahaan");
      
      const umumPercentage = umumCustomers ? (umumCustomers.count / transactions.length) * 100 : 0;
      const perusahaanPercentage = perusahaanCustomers ? (perusahaanCustomers.count / transactions.length) * 100 : 0;
      
      let behaviorInsight = "";
      if (perusahaanPercentage > 60) {
        behaviorInsight = "Bisnis sangat bergantung pada pelanggan perusahaan. Pertimbangkan program loyalitas khusus.";
      } else if (umumPercentage > 60) {
        behaviorInsight = "Pasar dominan pelanggan umum. Fokus pada promosi massal dan peningkatan frekuensi kunjungan.";
      } else {
        behaviorInsight = "Pasar seimbang antara pelanggan umum dan perusahaan. Strategi hybrid bisa efektif.";
      }
      
      return { umumPercentage, perusahaanPercentage, behaviorInsight };
    };

    const customerBehavior = analyzeCustomerBehavior();

    // Service performance analysis
    const analyzeServicePerformance = () => {
      const serviceStats = transactions.reduce((acc, t) => {
        t.items.forEach(item => {
          if (item.type === 'service') {
            if (!acc[item.name]) {
              acc[item.name] = { count: 0, revenue: 0 };
            }
            acc[item.name].count += item.qty;
            acc[item.name].revenue += item.price * item.qty;
          }
        });
        return acc;
      }, {} as ServicePerformance);

      const topServices = Object.entries(serviceStats)
        .sort(([,a], [,b]) => b.revenue - a.revenue)
        .slice(0, 5);

      return topServices;
    };

    const topServices = analyzeServicePerformance();

    // Seasonal trends
    const analyzeSeasonalTrends = (): SeasonalTrends => {
      const currentMonth = new Date().getMonth();
      const seasonalData = transactions.reduce((acc, t) => {
        const month = new Date(t.savedAt).getMonth();
        if (!acc[month]) acc[month] = { count: 0, revenue: 0 };
        acc[month].count++;
        acc[month].revenue += t.total;
        return acc;
      }, {} as Record<number, { count: number; revenue: number }>);

      const currentMonthData = seasonalData[currentMonth] || { count: 0, revenue: 0 };
      const avgMonthlyRevenue = totalRevenue / 12;
      
      let seasonalInsight = "";
      if (currentMonthData.revenue > avgMonthlyRevenue * 1.2) {
        seasonalInsight = "Bulan ini adalah musim puncak. Manfaatkan momentum dengan promosi tambahan.";
      } else if (currentMonthData.revenue < avgMonthlyRevenue * 0.8) {
        seasonalInsight = "Bulan ini adalah musim rendah. Pertimbangkan diskon atau penawaran khusus.";
      } else {
        seasonalInsight = "Performa bulan ini normal. Fokus pada konsistensi layanan.";
      }

      return { currentMonthData, avgMonthlyRevenue, seasonalInsight };
    };

    const seasonalTrends = analyzeSeasonalTrends();

    return {
      totalRevenue,
      avgTransactionValue,
      growthRate,
      nextMonthPrediction,
      customerBehavior,
      topServices,
      seasonalTrends,
      totalTransactions: transactions.length
    };
  }, [transactions]);
};