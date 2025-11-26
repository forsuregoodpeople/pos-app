import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, FlaskConical } from "lucide-react";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Users,
  Calendar,
  BarChart3,
  ArrowRight,
  Star,
  Zap,
  MessageCircle,
  Send,
  Bot
} from "lucide-react";
import { AIInsightData } from "@/types/ai-analysis";
import { useState } from "react";
import React from "react";

interface HumanInsightsProps {
  aiData: AIInsightData;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export const HumanInsightsAnalysis = ({ aiData }: HumanInsightsProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: `Halo! Saya adalah asisten AI untuk menganalisis data bisnis Anda. Berdasarkan data transaksi Anda, saya melihat pertumbuhan sebesar ${aiData.metrics.growthRate.toFixed(1)}% dengan total revenue Rp ${aiData.metrics.totalRevenue.toLocaleString('id-ID')}. Ada yang bisa saya bantu analisis lebih lanjut?`,
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const generateBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    // Revenue related queries
    if (lowerMessage.includes('revenue') || lowerMessage.includes('pendapatan')) {
      return `Total revenue Anda adalah Rp ${aiData.metrics.totalRevenue.toLocaleString('id-ID')} dengan pertumbuhan ${aiData.metrics.growthRate > 0 ? '+' : ''}${aiData.metrics.growthRate.toFixed(1)}%. ${aiData.metrics.growthRate > 10 ? 'Performa sangat baik!' :
          aiData.metrics.growthRate > 0 ? 'Performa positif, bisa ditingkatkan lagi.' : 'Perlu perhatian khusus untuk meningkatkan revenue.'
        }`;
    }

    // Customer related queries
    if (lowerMessage.includes('pelanggan') || lowerMessage.includes('customer')) {
      const dominant = aiData.customerBehavior.dominantSegment;
      return `Segmen pelanggan dominan Anda adalah ${dominant === 'umum' ? 'Pelanggan Umum' : dominant === 'perusahaan' ? 'Pelanggan Perusahaan' : 'Seimbang'} dengan persentase ${dominant === 'umum' ? aiData.customerBehavior.umumPercentage : aiData.customerBehavior.perusahaanPercentage
        }%. ${aiData.customerBehavior.umumPercentage > 70 ? 'Pertimbangkan diversifikasi ke pelanggan perusahaan.' :
          aiData.customerBehavior.perusahaanPercentage > 70 ? 'Pertimbangkan meningkatkan pelanggan umum.' :
            'Portofolio pelanggan Anda sudah seimbang.'
        }`;
    }

    // Service related queries
    if (lowerMessage.includes('layanan') || lowerMessage.includes('jasa')) {
      if (aiData.topServices.length > 0) {
        const topService = aiData.topServices[0];
        return `Layanan terbaik Anda adalah ${topService.serviceName} dengan ${topService.count} transaksi dan revenue Rp ${topService.revenue.toLocaleString('id-ID')}. Potensi pertumbuhannya ${topService.growthPotential}.`;
      }
      return 'Data layanan belum tersedia untuk dianalisis.';
    }

    // Growth related queries
    if (lowerMessage.includes('pertumbuhan') || lowerMessage.includes('growth')) {
      return `Pertumbuhan bisnis Anda ${aiData.metrics.growthRate > 0 ? 'positif' : 'negatif'} sebesar ${Math.abs(aiData.metrics.growthRate).toFixed(1)}%. ${aiData.seasonalTrends.trendDirection === 'increasing' ? 'Tren sedang naik, pertahankan momentum!' :
          aiData.seasonalTrends.trendDirection === 'decreasing' ? 'Tren sedang turun, perlu strategi recovery.' :
            'Tren stabil, fokus pada inovasi.'
        }`;
    }

    // Recommendation queries
    if (lowerMessage.includes('rekomendasi') || lowerMessage.includes('saran')) {
      if (aiData.recommendations.length > 0) {
        const topRec = aiData.recommendations[0];
        return `Rekomendasi utama saya: ${topRec.title}. ${topRec.description} Prioritas: ${topRec.priority}.`;
      }
      return 'Fokus pada peningkatan nilai transaksi dan diversifikasi pelanggan.';
    }

    // Default response
    return `Berdasarkan data Anda, saya bisa membantu analisis tentang revenue, pelanggan, layanan, pertumbuhan, atau memberikan rekomendasi. Topik mana yang ingin Anda bahas lebih lanjut?`;
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot response delay
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const getExperimentalAlerts = () => {
    const alerts = [];

    // Growth alert
    if (aiData.metrics.growthRate > 15 && !dismissedAlerts.has('high-growth')) {
      alerts.push({
        id: 'high-growth',
        type: 'success' as const,
        title: '🚀 Pertumbuhan Sangat Tinggi!',
        message: `Bisnis Anda tumbuh ${aiData.metrics.growthRate.toFixed(1)}% ini bulan. Ini adalah momentum yang tepat untuk ekspansi.`,
        experimental: true
      });
    }

    // Revenue milestone
    if (aiData.metrics.totalRevenue > 10000000 && !dismissedAlerts.has('revenue-milestone')) {
      alerts.push({
        id: 'revenue-milestone',
        type: 'warning' as const,
        title: '🎆 Milestone Revenue!',
        message: `Selamat! Revenue Anda melebihi 10 juta. Pertimbangkan untuk reinvestasi ke infrastruktur.`,
        experimental: true
      });
    }

    // Customer concentration risk
    if (aiData.customerBehavior.perusahaanPercentage > 80 && !dismissedAlerts.has('customer-concentration')) {
      alerts.push({
        id: 'customer-concentration',
        type: 'destructive' as const,
        title: '⚠️ Risiko Konsentrasi Pelanggan',
        message: `${aiData.customerBehavior.perusahaanPercentage.toFixed(1)}% pelanggan Anda adalah perusahaan. Pertimbangkan diversifikasi.`,
        experimental: true
      });
    }

    // Low transaction value
    if (aiData.metrics.avgTransactionValue < 300000 && !dismissedAlerts.has('low-transaction')) {
      alerts.push({
        id: 'low-transaction',
        type: 'default' as const,
        title: '💰 Peluang Upselling',
        message: `Nilai transaksi rata-rata Rp ${(aiData.metrics.avgTransactionValue / 1000).toFixed(0)}K. Ada peluang besar untuk meningkatkan revenue per transaksi.`,
        experimental: true
      });
    }

    return alerts;
  };

  const handleDismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  const experimentalAlerts = getExperimentalAlerts();

  const getPerformanceLevel = () => {
    const growth = aiData.metrics.growthRate;
    if (growth > 15) return { level: "Excellent", color: "text-green-600", bg: "bg-green-50", icon: TrendingUp };
    if (growth > 5) return { level: "Good", color: "text-blue-600", bg: "bg-blue-50", icon: TrendingUp };
    if (growth > -5) return { level: "Stable", color: "text-yellow-600", bg: "bg-yellow-50", icon: BarChart3 };
    return { level: "Needs Attention", color: "text-red-600", bg: "bg-red-50", icon: TrendingDown };
  };

  const getBusinessHealth = () => {
    const revenue = aiData.metrics.totalRevenue;
    const avgTransaction = aiData.metrics.avgTransactionValue;
    const transactionCount = aiData.metrics.totalTransactions;

    let healthScore = 0;
    let insights = [];

    // Revenue health
    if (revenue > 10000000) {
      healthScore += 25;
      insights.push("Revenue sangat sehat - di atas 10 juta");
    } else if (revenue > 5000000) {
      healthScore += 15;
      insights.push("Revenue cukup baik - di atas 5 juta");
    } else {
      insights.push("Revenue perlu ditingkatkan - di bawah 5 juta");
    }

    // Transaction value health
    if (avgTransaction > 1000000) {
      healthScore += 25;
      insights.push("Nilai transaksi rata-rata sangat baik");
    } else if (avgTransaction > 500000) {
      healthScore += 15;
      insights.push("Nilai transaksi rata-rata cukup baik");
    } else {
      insights.push("Perlu tingkatkan nilai transaksi dengan upselling");
    }

    // Volume health
    if (transactionCount > 100) {
      healthScore += 25;
      insights.push("Volume transaksi sangat tinggi");
    } else if (transactionCount > 50) {
      healthScore += 15;
      insights.push("Volume transaksi cukup baik");
    } else {
      insights.push("Perlu tingkatkan volume transaksi");
    }

    // Customer diversity
    const diversity = Math.min(aiData.customerBehavior.umumPercentage, aiData.customerBehavior.perusahaanPercentage);
    if (diversity > 30) {
      healthScore += 25;
      insights.push("Portofolio pelanggan seimbang");
    } else {
      insights.push("Perlu diversifikasi jenis pelanggan");
    }

    const healthLevel = healthScore > 75 ? "Sangat Sehat" :
      healthScore > 50 ? "Sehat" :
        healthScore > 25 ? "Cukup Sehat" : "Perlu Perhatian";

    return { healthLevel, healthScore, insights };
  };

  const getStrategicRecommendations = () => {
    const recommendations = [];
    const { metrics, customerBehavior, topServices, seasonalTrends } = aiData;

    // Growth strategies
    if (metrics.growthRate > 10) {
      recommendations.push({
        type: "expansion",
        title: "Waktu Ekspansi Bisnis",
        description: "Dengan pertumbuhan >10%, ini saat yang tepat untuk mempertimbangkan ekspansi layanan atau lokasi.",
        priority: "high",
        action: "Analisis potensi pasar baru dan persiapkan rencana ekspansi 3-6 bulan ke depan.",
        icon: Zap,
        color: "text-purple-600"
      });
    }

    // Customer focus
    if (customerBehavior.dominantSegment === 'perusahaan') {
      recommendations.push({
        type: "b2b",
        title: "Optimasi Layanan Korporat",
        description: "Fokus pada pelanggan perusahaan dengan program loyalitas dan kontrak jangka panjang.",
        priority: "high",
        action: "Buat paket khusus B2B dengan diskon volume dan layanan prioritas.",
        icon: Users,
        color: "text-blue-600"
      });
    } else if (customerBehavior.dominantSegment === 'umum') {
      recommendations.push({
        type: "retail",
        title: "Penguatan Pasar Retail",
        description: "Manfaatkan dominasi pelanggan umum dengan promosi massal dan program referral.",
        priority: "medium",
        action: "Luncurkan program membership dan promosi bundling untuk menarik lebih banyak pelanggan.",
        icon: Users,
        color: "text-green-600"
      });
    }

    // Service optimization
    if (topServices.length > 0) {
      const topService = topServices[0];
      recommendations.push({
        type: "service",
        title: `Maksimalkan Layanan Unggulan`,
        description: `${topService.serviceName} adalah layanan terbaik dengan pendapatan Rp ${topService.revenue.toLocaleString('id-ID')}.`,
        priority: "high",
        action: "Tingkatkan kapasitas dan promosi layanan ini, pertimbangkan paket premium untuk meningkatkan margin.",
        icon: Star,
        color: "text-yellow-600"
      });
    }

    // Pricing strategy
    if (metrics.avgTransactionValue < 500000) {
      recommendations.push({
        type: "pricing",
        title: "Strategi Harga dan Upselling",
        description: "Nilai transaksi rata-rata rendah, ada peluang besar untuk meningkatkan revenue per transaksi.",
        priority: "medium",
        action: "Implementasi tiered pricing, paket bundling, dan training staff untuk upselling.",
        icon: DollarSign,
        color: "text-orange-600"
      });
    }

    // Seasonal opportunities
    if (seasonalTrends.currentPerformance === 'above_average') {
      recommendations.push({
        type: "seasonal",
        title: "Manfaatkan Momentum Musim Puncak",
        description: "Performa bulan ini di atas rata-rata, manfaatkan momentum ini.",
        priority: "medium",
        action: "Tingkatkan promosi dan stok selama periode puncak, siapkan untuk periode rendah.",
        icon: Calendar,
        color: "text-red-600"
      });
    }

    return recommendations;
  };

  const getQuickActions = () => {
    const actions = [];
    const { metrics, customerBehavior } = aiData;

    if (metrics.growthRate < 0) {
      actions.push({
        title: "Analisis Penurunan Revenue",
        description: "Revenue sedang turun, segera identifikasi penyebabnya",
        urgency: "high",
        steps: ["Review harga kompetitor", "Survey kepuasan pelanggan", "Analisis kompetitor"]
      });
    }

    if (customerBehavior.perusahaanPercentage > 70) {
      actions.push({
        title: "Diversifikasi Pelanggan",
        description: "Terlalu bergantung pada pelanggan perusahaan",
        urgency: "medium",
        steps: ["Target pelanggan retail", "Promosi khusus umum", "Program referral"]
      });
    }

    if (metrics.avgTransactionValue < 300000) {
      actions.push({
        title: "Tingkatkan Nilai Transaksi",
        description: "Average transaction terlalu rendah",
        urgency: "medium",
        steps: ["Training upselling", "Buat paket bundling", "Review harga jasa"]
      });
    }

    return actions;
  };

  const performance = getPerformanceLevel();
  const businessHealth = getBusinessHealth();
  const recommendations = getStrategicRecommendations();
  const quickActions = getQuickActions();

  const PerformanceIcon = performance.icon;

  return (
    <div className="space-y-6">

      {experimentalAlerts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FlaskConical className="w-4 h-4" />
            <span>Hanya Mengolah Data / Tidak Akan Mempengaruhi Data Sama Sekali</span>
            <Badge variant="outline" className="text-xs bg-red-500 text-white">Experimental Alert</Badge>
          </div>
        </div>
      )}

      {/* AI Chatbot - Priority */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-600" />
            AI Business Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col h-[350px]">
            {/* Chat Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 ${message.sender === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                        }`}
                    >
                      <div className="flex items-start gap-2">
                        {message.sender === 'bot' && (
                          <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm">{message.text}</p>
                          <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                            {message.timestamp.toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        {message.sender === 'user' && (
                          <MessageCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4" />
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Chat Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Tanyakan tentang bisnismu..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              {/* Quick Questions */}
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInputMessage('Bagaimana performa revenue saya?')}
                  className="text-xs"
                >
                  Revenue Analysis
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInputMessage('Siapa pelanggan dominan saya?')}
                  className="text-xs"
                >
                  Customer Insights
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInputMessage('Layanan apa yang paling laku?')}
                  className="text-xs"
                >
                  Top Services
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInputMessage('Berikan rekomendasi bisnis')}
                  className="text-xs"
                >
                  Recommendations
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid Layout for Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Performance Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              Analisis Performa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`p-2 ${performance.bg} rounded-lg`}>
                  <PerformanceIcon className={`w-6 h-6 ${performance.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tingkat Performa</p>
                  <p className={`text-lg font-bold ${performance.color}`}>{performance.level}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Pertumbuhan</p>
                <p className={`text-lg font-bold ${performance.color}`}>
                  {performance.icon === TrendingUp ? '+' : ''}{aiData.metrics.growthRate.toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-1">Total Revenue</p>
                <p className="text-xl font-bold text-blue-600">
                  Rp {(aiData.metrics.totalRevenue / 1000000).toFixed(1)}M
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-900 mb-1">Transaksi Rata-rata</p>
                <p className="text-xl font-bold text-green-600">
                  Rp {(aiData.metrics.avgTransactionValue / 1000).toFixed(0)}K
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Kesehatan Bisnis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Skor Kesehatan</span>
              <Badge variant={businessHealth.healthScore > 50 ? "default" : "secondary"}>
                {businessHealth.healthLevel} ({businessHealth.healthScore}/100)
              </Badge>
            </div>

            <div className="space-y-3">
              {businessHealth.insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Customer Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Segment Pelanggan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Pelanggan Umum</span>
                <Badge variant="outline">{aiData.customerBehavior.umumPercentage.toFixed(1)}%</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Pelanggan Perusahaan</span>
                <Badge variant="outline">{aiData.customerBehavior.perusahaanPercentage.toFixed(1)}%</Badge>
              </div>
            </div>

            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-sm font-medium text-purple-900">Dominant Segment</p>
              <Badge variant={aiData.customerBehavior.dominantSegment === 'perusahaan' ? 'default' : 'secondary'} className="mt-1">
                {aiData.customerBehavior.dominantSegment === 'perusahaan' ? 'Perusahaan' :
                  aiData.customerBehavior.dominantSegment === 'umum' ? 'Umum' : 'Balanced'}
              </Badge>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">Total Transaksi: <strong>{aiData.metrics.totalTransactions}</strong></p>
            </div>
          </CardContent>
        </Card>

        {/* Top Service */}
        {aiData.topServices.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-600" />
                Layanan Terbaik
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="font-bold text-gray-900 mb-2">{aiData.topServices[0].serviceName}</p>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">{aiData.topServices[0].count} transaksi</p>
                  <p className="text-lg font-bold text-yellow-600">
                    Rp {(aiData.topServices[0].revenue / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-sm text-gray-600">Avg: Rp {(aiData.topServices[0].avgPrice / 1000).toFixed(0)}K</p>
                </div>
              </div>

              <div className="text-center">
                <Badge variant={aiData.topServices[0].growthPotential === 'high' ? 'default' : 'secondary'}>
                  Potensi: {aiData.topServices[0].growthPotential}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Strategic Recommendation */}
        {recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-600" />
                Rekomendasi Utama
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 bg-gray-50 rounded-lg`}>
                    {React.createElement(recommendations[0].icon, { className: `w-5 h-5 ${recommendations[0].color}` })}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{recommendations[0].title}</h4>
                      <Badge variant={recommendations[0].priority === 'high' ? 'destructive' : 'secondary'}>
                        {recommendations[0].priority === 'high' ? 'Prioritas Tinggi' : 'Prioritas Sedang'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{recommendations[0].description}</p>
                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                      <ArrowRight className="w-4 h-4 text-blue-600" />
                      <p className="text-sm font-medium text-blue-900">{recommendations[0].action}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        {quickActions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Tindakan Cepat
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant={quickActions[0].urgency === 'high' ? 'destructive' : 'default'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div>
                      <strong>{quickActions[0].title}</strong>
                      <p className="text-sm mt-1">{quickActions[0].description}</p>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs font-medium mb-1">Langkah-langkah:</p>
                      <ul className="text-xs space-y-1">
                        {quickActions[0].steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="flex items-center gap-2">
                            <span className="w-1 h-1 bg-current rounded-full"></span>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};