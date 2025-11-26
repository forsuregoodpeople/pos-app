import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area } from "recharts";
import { BarChart3, Brain, TrendingUp, DollarSign, ShoppingCart, Users, Activity, Target, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AIInsightData } from "@/types/ai-analysis";

interface AdvancedChartComponentsProps {
  aiData: AIInsightData;
  chartConfig: any;
  pieColors: string[];
}

export const AdvancedCustomerTypeChart = ({ aiData, chartConfig, pieColors }: AdvancedChartComponentsProps) => {
  const distribution = [
    { type: "Umum", count: aiData.charts.customerTypeDistribution.umum.count, total: aiData.charts.customerTypeDistribution.umum.revenue },
    { type: "Perusahaan", count: aiData.charts.customerTypeDistribution.perusahaan.count, total: aiData.charts.customerTypeDistribution.perusahaan.revenue }
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Distribusi Tipe Pelanggan</CardTitle>
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px]">
          <PieChart>
            <Pie
              data={distribution}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {distribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
          </PieChart>
        </ChartContainer>
        <div className="mt-4 space-y-2">
          {distribution.map((stat, index) => (
            <div key={stat.type} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: pieColors[index] }} />
                <span>{stat.type}</span>
              </div>
              <div className="text-right">
                <div className="font-medium">{stat.count} transaksi</div>
                <div className="text-xs text-muted-foreground">
                  Rp {stat.total.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const AdvancedMonthlyRevenueChart = ({ aiData, chartConfig }: AdvancedChartComponentsProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Pendapatan Bulanan (6 Bulan Terakhir)</CardTitle>
      <BarChart3 className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <ChartContainer config={chartConfig} className="h-[200px]">
        <BarChart data={aiData.charts.monthlyRevenue}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="umum" fill={chartConfig.umum.color} />
          <Bar dataKey="perusahaan" fill={chartConfig.perusahaan.color} />
        </BarChart>
      </ChartContainer>
      <div className="mt-4 flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: chartConfig.umum.color }} />
          <span>Umum</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: chartConfig.perusahaan.color }} />
          <span>Perusahaan</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const AdvancedKeyMetrics = ({ aiData }: { aiData: AIInsightData }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-green-600" />
          <div>
            <p className="text-xs text-muted-foreground">Total Revenue</p>
            <p className="text-lg font-bold">
              Rp {aiData.metrics.totalRevenue.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-blue-600" />
          <div>
            <p className="text-xs text-muted-foreground">Avg Transaction</p>
            <p className="text-lg font-bold">
              Rp {Math.round(aiData.metrics.avgTransactionValue).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-purple-600" />
          <div>
            <p className="text-xs text-muted-foreground">Growth Rate</p>
            <p className="text-lg font-bold">
              {aiData.metrics.growthRate > 0 ? '+' : ''}{aiData.metrics.growthRate.toFixed(1)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-orange-600" />
          <div>
            <p className="text-xs text-muted-foreground">Total Transactions</p>
            <p className="text-lg font-bold">{aiData.metrics.totalTransactions}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export const AdvancedCustomerBehaviorAnalysis = ({ aiData }: { aiData: AIInsightData }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Brain className="w-5 h-5 text-blue-600" />
        Customer Behavior Analysis
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm">Pelanggan Umum</span>
        <Badge variant="outline">{aiData.customerBehavior.umumPercentage.toFixed(1)}%</Badge>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm">Pelanggan Perusahaan</span>
        <Badge variant="outline">{aiData.customerBehavior.perusahaanPercentage.toFixed(1)}%</Badge>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm">Dominant Segment</span>
        <Badge variant={aiData.customerBehavior.dominantSegment === 'perusahaan' ? 'default' : 'secondary'}>
          {aiData.customerBehavior.dominantSegment === 'perusahaan' ? 'Perusahaan' : 
           aiData.customerBehavior.dominantSegment === 'umum' ? 'Umum' : 'Balanced'}
        </Badge>
      </div>
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          {aiData.customerBehavior.behaviorInsight}
        </AlertDescription>
      </Alert>
      <div className="p-3 bg-blue-50 rounded-lg">
        <p className="text-sm font-medium text-blue-900">Recommendation:</p>
        <p className="text-xs text-blue-800 mt-1">{aiData.customerBehavior.recommendation}</p>
      </div>
    </CardContent>
  </Card>
);

export const AdvancedSeasonalTrendsAnalysis = ({ aiData }: { aiData: AIInsightData }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Activity className="w-5 h-5 text-green-600" />
        Seasonal Trends
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm">Current Performance</span>
        <Badge variant={aiData.seasonalTrends.currentPerformance === 'above_average' ? "default" : 
                        aiData.seasonalTrends.currentPerformance === 'below_average' ? "destructive" : "secondary"}>
          {aiData.seasonalTrends.currentPerformance.replace('_', ' ').toUpperCase()}
        </Badge>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm">Trend Direction</span>
        <Badge variant={aiData.seasonalTrends.trendDirection === 'increasing' ? 'default' : 
                        aiData.seasonalTrends.trendDirection === 'decreasing' ? 'destructive' : 'secondary'}>
          {aiData.seasonalTrends.trendDirection.toUpperCase()}
        </Badge>
      </div>
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          {aiData.seasonalTrends.seasonalInsight}
        </AlertDescription>
      </Alert>
    </CardContent>
  </Card>
);

export const AdvancedTopServicesAnalysis = ({ aiData }: { aiData: AIInsightData }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Target className="w-5 h-5 text-purple-600" />
        Top Performing Services
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {aiData.topServices.map((service, index) => (
          <div key={service.serviceName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-purple-600">#{index + 1}</span>
              </div>
              <div>
                <p className="font-medium">{service.serviceName}</p>
                <p className="text-xs text-muted-foreground">{service.count} transaksi • Avg: Rp {Math.round(service.avgPrice).toLocaleString('id-ID')}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-purple-600">
                Rp {service.revenue.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
              <Badge variant={service.growthPotential === 'high' ? 'default' : 
                           service.growthPotential === 'medium' ? 'secondary' : 'outline'} 
                      className="text-xs mt-1">
                {service.growthPotential}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export const AdvancedSalesPredictionChart = ({ aiData, chartConfig }: AdvancedChartComponentsProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-green-600" />
        Sales Prediction
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ChartContainer config={chartConfig} className="h-[300px]">
        <AreaChart data={aiData.charts.predictionChart}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area type="monotone" dataKey="umum" stackId="1" stroke={chartConfig.umum.color} fill={chartConfig.umum.color} fillOpacity={0.6} />
          <Area type="monotone" dataKey="perusahaan" stackId="1" stroke={chartConfig.perusahaan.color} fill={chartConfig.perusahaan.color} fillOpacity={0.6} />
        </AreaChart>
      </ChartContainer>
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-blue-900">AI Prediction</span>
          <Badge variant="outline">{aiData.metadata.confidence.toFixed(0)}% confidence</Badge>
        </div>
        <p className="text-sm text-blue-800">
          Prediksi pendapatan bulan depan:{" "}
          <strong>
            Rp {Math.round(aiData.predictions.nextMonth.total).toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </strong>
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Berdasarkan tren historis dan pola musiman
        </p>
      </div>
    </CardContent>
  </Card>
);

export const AdvancedAIRecommendations = ({ aiData }: { aiData: AIInsightData }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Target className="w-5 h-5 text-orange-600" />
        AI Recommendations
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {aiData.recommendations.map((rec, index) => (
          <Alert key={index}>
            <Target className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <strong className={rec.type === 'warning' ? 'text-red-600' : 
                                   rec.type === 'growth' ? 'text-green-600' : 'text-blue-600'}>
                    {rec.title}
                  </strong>
                  <p className="text-sm mt-1">{rec.description}</p>
                  {rec.estimatedImpact && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Estimated Impact: {rec.estimatedImpact}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 ml-4">
                  <Badge variant={rec.priority === 'high' ? 'destructive' : 
                                 rec.priority === 'medium' ? 'default' : 'secondary'} 
                          className="text-xs">
                    {rec.priority}
                  </Badge>
                  {rec.actionable && (
                    <Badge variant="outline" className="text-xs">
                      Actionable
                    </Badge>
                  )}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        ))}
      </div>
      
      {/* Key Insights */}
      <div className="mt-6 space-y-4">
        <div>
          <h4 className="font-medium text-sm mb-2">Key Findings</h4>
          <ul className="text-xs space-y-1">
            {aiData.insights.keyFindings.map((finding, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="w-1 h-1 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></span>
                {finding}
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium text-sm mb-2">Business Opportunities</h4>
          <ul className="text-xs space-y-1">
            {aiData.insights.businessOpportunities.map((opportunity, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="w-1 h-1 bg-green-600 rounded-full mt-1.5 flex-shrink-0"></span>
                {opportunity}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </CardContent>
  </Card>
);