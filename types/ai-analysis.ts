export interface AIMetrics {
  totalRevenue: number;
  avgTransactionValue: number;
  growthRate: number;
  totalTransactions: number;
  nextMonthPrediction: number;
}

export interface CustomerBehavior {
  umumPercentage: number;
  perusahaanPercentage: number;
  behaviorInsight: string;
  dominantSegment: 'umum' | 'perusahaan' | 'balanced';
  recommendation: string;
}

export interface SeasonalTrends {
  currentMonthData: { count: number; revenue: number };
  avgMonthlyRevenue: number;
  seasonalInsight: string;
  currentPerformance: 'above_average' | 'below_average' | 'normal';
  trendDirection: 'increasing' | 'decreasing' | 'stable';
}

export interface ServicePerformance {
  serviceName: string;
  count: number;
  revenue: number;
  avgPrice: number;
  growthPotential: 'high' | 'medium' | 'low';
}

export interface PredictionData {
  month: string;
  umum: number;
  perusahaan: number;
  total: number;
  confidence: number;
  isPrediction?: boolean;
}

export interface AIRecommendation {
  type: 'growth' | 'warning' | 'opportunity' | 'strategy';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  estimatedImpact?: string;
}

export interface AIInsightData {
  metadata: {
    generatedAt: string;
    dataPoints: number;
    lastUpdated: string;
    confidence: number;
  };
  
  metrics: AIMetrics;
  
  customerBehavior: CustomerBehavior;
  
  seasonalTrends: SeasonalTrends;
  
  topServices: ServicePerformance[];
  
  predictions: {
    nextMonth: PredictionData;
    quarterly: PredictionData[];
    yearly: PredictionData;
  };
  
  recommendations: AIRecommendation[];
  
  charts: {
    customerTypeDistribution: {
      umum: { count: number; revenue: number; percentage: number };
      perusahaan: { count: number; revenue: number; percentage: number };
    };
    monthlyRevenue: Array<{
      month: string;
      umum: number;
      perusahaan: number;
      total: number;
    }>;
    predictionChart: PredictionData[];
  };
  
  insights: {
    keyFindings: string[];
    businessOpportunities: string[];
    riskFactors: string[];
    strategicRecommendations: string[];
  };
}

export interface AIAnalysisResponse {
  success: boolean;
  data: AIInsightData;
  error?: string;
  processingTime: number;
}