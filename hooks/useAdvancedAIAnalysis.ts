import { useMemo } from "react";
import { Transaction } from "./useTransaction";
import { AIInsightData, AIAnalysisResponse, ServicePerformance, PredictionData, AIRecommendation } from "@/types/ai-analysis";

export const useAdvancedAIAnalysis = (transactions: Transaction[]): AIAnalysisResponse => {
  return useMemo(() => {
    const startTime = performance.now();
    
    if (transactions.length === 0) {
      return {
        success: false,
        data: {} as AIInsightData,
        error: "No transaction data available",
        processingTime: 0
      };
    }

    // Basic metrics calculation
    const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);
    const avgTransactionValue = totalRevenue / transactions.length;
    const totalTransactions = transactions.length;

    // Customer type analysis
    const customerTypeStats = transactions.reduce((acc, transaction) => {
      const type = transaction.customer.tipe === "perusahaan" ? "perusahaan" : "umum";
      if (!acc[type]) {
        acc[type] = { count: 0, revenue: 0 };
      }
      acc[type].count += 1;
      acc[type].revenue += transaction.total;
      return acc;
    }, {} as Record<string, { count: number; revenue: number }>);

    const umumData = customerTypeStats.umum || { count: 0, revenue: 0 };
    const perusahaanData = customerTypeStats.perusahaan || { count: 0, revenue: 0 };
    const umumPercentage = (umumData.count / totalTransactions) * 100;
    const perusahaanPercentage = (perusahaanData.count / totalTransactions) * 100;

    // Monthly revenue analysis
    const monthlyData = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.savedAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthName,
          umum: 0,
          perusahaan: 0,
          total: 0,
          count: 0
        };
      }
      
      const isUmum = !transaction.customer.tipe || transaction.customer.tipe === "umum";
      const isPerusahaan = transaction.customer.tipe === "perusahaan";
      
      acc[monthKey].umum += isUmum ? transaction.total : 0;
      acc[monthKey].perusahaan += isPerusahaan ? transaction.total : 0;
      acc[monthKey].total += transaction.total;
      acc[monthKey].count += 1;
      
      return acc;
    }, {} as Record<string, any>);

    const monthlyRevenue = Object.values(monthlyData)
      .sort((a: any, b: any) => a.month.localeCompare(b.month))
      .slice(-6);

    // Growth rate calculation
    const lastTwoMonths = monthlyRevenue.slice(-2);
    const growthRate = lastTwoMonths.length === 2 ? 
      ((lastTwoMonths[1].total - lastTwoMonths[0].total) / lastTwoMonths[0].total) * 100 : 0;

    // Prediction using linear regression
    const predictNextMonth = () => {
      if (monthlyRevenue.length < 2) return 0;
      
      const revenues = monthlyRevenue.map((m: any) => m.total);
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

    // Service performance analysis
    const serviceStats = transactions.reduce((acc, t) => {
      t.items.forEach(item => {
        if (item.type === 'service') {
          if (!acc[item.name]) {
            acc[item.name] = { count: 0, revenue: 0, totalQty: 0 };
          }
          acc[item.name].count += 1;
          acc[item.name].revenue += item.price * item.qty;
          acc[item.name].totalQty += item.qty;
        }
      });
      return acc;
    }, {} as Record<string, { count: number; revenue: number; totalQty: number }>);

    const topServices: ServicePerformance[] = Object.entries(serviceStats)
      .map(([serviceName, data]) => ({
        serviceName,
        count: data.count,
        revenue: data.revenue,
        avgPrice: data.revenue / data.totalQty,
        growthPotential: (data.revenue > 1000000 ? 'high' : data.revenue > 500000 ? 'medium' : 'low') as 'high' | 'medium' | 'low'
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Seasonal trends
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
    const currentPerformance = currentMonthData.revenue > avgMonthlyRevenue * 1.2 ? 'above_average' as const :
                              currentMonthData.revenue < avgMonthlyRevenue * 0.8 ? 'below_average' as const : 'normal' as const;
    const trendDirection = growthRate > 5 ? 'increasing' as const : growthRate < -5 ? 'decreasing' as const : 'stable' as const;

    // Generate predictions
    const lastMonth = new Date(monthlyRevenue[monthlyRevenue.length - 1]?.month || new Date());
    const nextMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 1);
    const nextMonthName = nextMonth.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
    
    const umumRatio = umumData.revenue / totalRevenue;
    const perusahaanRatio = perusahaanData.revenue / totalRevenue;
    
    const nextMonthData: PredictionData = {
      month: nextMonthName,
      umum: Math.round(nextMonthPrediction * umumRatio),
      perusahaan: Math.round(nextMonthPrediction * perusahaanRatio),
      total: Math.round(nextMonthPrediction),
      confidence: Math.min(95, 60 + (monthlyRevenue.length * 5)),
      isPrediction: true
    };

    // Generate recommendations
    const recommendations: AIRecommendation[] = [];
    
    if (growthRate > 10) {
      recommendations.push({
        type: 'growth',
        title: 'Positive Growth Trend',
        description: 'Business is growing rapidly. Consider expanding services and optimizing operations.',
        priority: 'high',
        actionable: true,
        estimatedImpact: '+15-25% revenue increase'
      });
    }
    
    if (perusahaanPercentage > 60) {
      recommendations.push({
        type: 'strategy',
        title: 'Corporate Focus Opportunity',
        description: 'High corporate customer concentration. Develop B2B retention programs.',
        priority: 'medium',
        actionable: true,
        estimatedImpact: '+10% customer retention'
      });
    }
    
    if (avgTransactionValue < 500000) {
      recommendations.push({
        type: 'opportunity',
        title: 'Upsell Potential',
        description: 'Average transaction value is low. Implement bundling strategies.',
        priority: 'medium',
        actionable: true,
        estimatedImpact: '+20% avg transaction value'
      });
    }

    // Determine dominant segment
    const dominantSegment = perusahaanPercentage > 60 ? 'perusahaan' as const :
                           umumPercentage > 60 ? 'umum' as const : 'balanced' as const;

    // Generate insights
    const keyFindings = [
      `Total revenue: Rp ${totalRevenue.toLocaleString('id-ID')}`,
      `Average transaction: Rp ${Math.round(avgTransactionValue).toLocaleString('id-ID')}`,
      `Growth rate: ${growthRate.toFixed(1)}%`,
      `Top performing segment: ${dominantSegment}`
    ];

    const businessOpportunities = [
      perusahaanPercentage > 40 ? 'Expand corporate services' : 'Focus on retail customers',
      topServices.length > 0 ? `Promote ${topServices[0].serviceName} more aggressively` : 'Identify popular services',
      growthRate > 0 ? 'Leverage positive growth momentum' : 'Implement recovery strategies'
    ];

    const riskFactors = [
      perusahaanPercentage > 70 ? 'High dependency on corporate clients' : '',
      growthRate < -5 ? 'Declining revenue trend' : '',
      avgTransactionValue < 300000 ? 'Low average transaction value' : ''
    ].filter(Boolean);

    const strategicRecommendations = [
      dominantSegment === 'perusahaan' ? 'Develop corporate retention programs' : 'Enhance retail customer experience',
      growthRate > 10 ? 'Scale operations strategically' : 'Focus on revenue stabilization',
      topServices.length > 0 ? `Optimize ${topServices[0].serviceName} delivery` : 'Identify and promote best services'
    ];

    // Construct unified AI data
    const aiData: AIInsightData = {
      metadata: {
        generatedAt: new Date().toISOString(),
        dataPoints: transactions.length,
        lastUpdated: new Date().toISOString(),
        confidence: Math.min(95, 60 + (monthlyRevenue.length * 5))
      },
      
      metrics: {
        totalRevenue,
        avgTransactionValue,
        growthRate,
        totalTransactions,
        nextMonthPrediction
      },
      
      customerBehavior: {
        umumPercentage,
        perusahaanPercentage,
        behaviorInsight: dominantSegment === 'perusahaan' ? 'Strong corporate focus' :
                        dominantSegment === 'umum' ? 'Retail-dominated market' : 'Balanced customer mix',
        dominantSegment,
        recommendation: dominantSegment === 'perusahaan' ? 'Develop B2B programs' :
                       dominantSegment === 'umum' ? 'Focus on mass marketing' : 'Maintain balanced approach'
      },
      
      seasonalTrends: {
        currentMonthData,
        avgMonthlyRevenue,
        seasonalInsight: currentPerformance === 'above_average' ? 'Current month performing well' :
                         currentPerformance === 'below_average' ? 'Current month underperforming' : 'Normal performance',
        currentPerformance,
        trendDirection
      },
      
      topServices,
      
      predictions: {
        nextMonth: nextMonthData,
        quarterly: [nextMonthData], // Simplified for now
        yearly: nextMonthData // Simplified for now
      },
      
      recommendations,
      
      charts: {
        customerTypeDistribution: {
          umum: { 
            count: umumData.count, 
            revenue: umumData.revenue, 
            percentage: umumPercentage 
          },
          perusahaan: { 
            count: perusahaanData.count, 
            revenue: perusahaanData.revenue, 
            percentage: perusahaanPercentage 
          }
        },
        monthlyRevenue: monthlyRevenue.map(m => ({
          month: m.month,
          umum: m.umum,
          perusahaan: m.perusahaan,
          total: m.total
        })),
        predictionChart: [...monthlyRevenue.map(m => ({
          month: m.month,
          umum: m.umum,
          perusahaan: m.perusahaan,
          total: m.total,
          confidence: 100
        })), nextMonthData]
      },
      
      insights: {
        keyFindings,
        businessOpportunities,
        riskFactors,
        strategicRecommendations
      }
    };

    const processingTime = performance.now() - startTime;

    return {
      success: true,
      data: aiData,
      processingTime
    };
  }, [transactions]);
};