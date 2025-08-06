// AI-powered analytics and insights for smart farming

import api from './api'

export interface AIInsight {
  id: string
  type: 'recommendation' | 'warning' | 'prediction' | 'optimization'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  actionRequired: boolean
  estimatedImpact: string
  confidence: number
  category: 'crop' | 'weather' | 'market' | 'resource' | 'sustainability'
  timestamp: Date
}

export interface AIAnalysisResult {
  insights: AIInsight[]
  summary: string
  recommendations: string[]
  predictedOutcomes: {
    yield: { current: number; potential: number; improvement: number }
    profit: { current: number; potential: number; improvement: number }
    efficiency: { current: number; potential: number; improvement: number }
  }
}

export class AIInsightEngine {
  private static instance: AIInsightEngine
  private lastAnalysis: AIAnalysisResult | null = null
  private analysisTimestamp: Date | null = null

  static getInstance(): AIInsightEngine {
    if (!AIInsightEngine.instance) {
      AIInsightEngine.instance = new AIInsightEngine()
    }
    return AIInsightEngine.instance
  }

  async generateInsights(farmData: any): Promise<AIAnalysisResult> {
    // Check if we have recent analysis (within 1 hour)
    if (this.lastAnalysis && this.analysisTimestamp) {
      const hoursSinceLastAnalysis = (Date.now() - this.analysisTimestamp.getTime()) / (1000 * 60 * 60)
      if (hoursSinceLastAnalysis < 1) {
        return this.lastAnalysis
      }
    }

    try {
      // Try to get AI insights from backend
      const aiResponse = await api.askAgent(
        "আমার খামারের বর্তমান অবস্থা বিশ্লেষণ করে পরামর্শ দিন।",
        {
          language: 'bn',
          user_context: farmData
        }
      )

      const insights = this.parseAIResponse(aiResponse.response || '')
      const analysis = this.buildAnalysisResult(insights, farmData)
      
      this.lastAnalysis = analysis
      this.analysisTimestamp = new Date()
      
      return analysis
    } catch (error) {
      console.error('AI analysis failed, using fallback insights:', error)
      return this.generateFallbackInsights(farmData)
    }
  }

  private parseAIResponse(response: string): AIInsight[] {
    const insights: AIInsight[] = []
    
    // Simple parsing logic - in production, this would be more sophisticated
    const sentences = response.split(/[।!]/).filter(s => s.trim().length > 10)
    
    sentences.forEach((sentence, index) => {
      if (sentence.includes('সেচ') || sentence.includes('পানি')) {
        insights.push({
          id: `ai-insight-${index}`,
          type: 'recommendation',
          priority: 'medium',
          title: 'সেচ ব্যবস্থাপনা',
          description: sentence.trim(),
          actionRequired: true,
          estimatedImpact: '১৫-২০% ফলন বৃদ্ধি',
          confidence: 0.85,
          category: 'resource',
          timestamp: new Date()
        })
      } else if (sentence.includes('দাম') || sentence.includes('বাজার')) {
        insights.push({
          id: `ai-insight-${index}`,
          type: 'prediction',
          priority: 'medium',
          title: 'বাজার পূর্বাভাস',
          description: sentence.trim(),
          actionRequired: false,
          estimatedImpact: '১০-১৫% মূল্য বৃদ্ধি',
          confidence: 0.75,
          category: 'market',
          timestamp: new Date()
        })
      } else if (sentence.includes('স্বাস্থ্য') || sentence.includes('রোগ')) {
        insights.push({
          id: `ai-insight-${index}`,
          type: 'warning',
          priority: 'high',
          title: 'ফসলের স্বাস্থ্য',
          description: sentence.trim(),
          actionRequired: true,
          estimatedImpact: 'রোগ প্রতিরোধ',
          confidence: 0.90,
          category: 'crop',
          timestamp: new Date()
        })
      }
    })

    return insights
  }

  private buildAnalysisResult(insights: AIInsight[], farmData: any): AIAnalysisResult {
    const summary = this.generateSummary(insights, farmData)
    const recommendations = this.generateRecommendations(insights)
    const predictedOutcomes = this.calculatePredictedOutcomes(farmData)

    return {
      insights,
      summary,
      recommendations,
      predictedOutcomes
    }
  }

  private generateFallbackInsights(farmData: any): AIAnalysisResult {
    const insights: AIInsight[] = [
      {
        id: 'fallback-1',
        type: 'recommendation',
        priority: 'medium',
        title: 'মাটির আর্দ্রতা পরীক্ষা',
        description: 'নিয়মিত মাটির আর্দ্রতা পরীক্ষা করুন এবং প্রয়োজন অনুযায়ী সেচ দিন।',
        actionRequired: true,
        estimatedImpact: '১০-১৫% ফলন বৃদ্ধি',
        confidence: 0.80,
        category: 'resource',
        timestamp: new Date()
      },
      {
        id: 'fallback-2',
        type: 'prediction',
        priority: 'low',
        title: 'আবহাওয়া পূর্বাভাস',
        description: 'আগামী সপ্তাহে বৃষ্টির সম্ভাবনা রয়েছে। সেচের পরিমাণ কমিয়ে দিন।',
        actionRequired: false,
        estimatedImpact: 'খরচ সাশ্রয়',
        confidence: 0.70,
        category: 'weather',
        timestamp: new Date()
      },
      {
        id: 'fallback-3',
        type: 'optimization',
        priority: 'medium',
        title: 'সার ব্যবহার অপ্টিমাইজেশন',
        description: 'মাটি পরীক্ষার ভিত্তিতে সুষম সার প্রয়োগ করুন।',
        actionRequired: true,
        estimatedImpact: '২০-২৫% খরচ সাশ্রয়',
        confidence: 0.85,
        category: 'resource',
        timestamp: new Date()
      }
    ]

    return this.buildAnalysisResult(insights, farmData)
  }

  private generateSummary(insights: AIInsight[], farmData: any): string {
    const totalCrops = farmData?.farmStats?.totalCrops || 0
    const healthyCrops = farmData?.farmStats?.healthyCrops || 0
    const avgHealth = farmData?.farmStats?.avgHealth || 0

    const highPriorityCount = insights.filter(i => i.priority === 'high' || i.priority === 'critical').length
    const actionRequiredCount = insights.filter(i => i.actionRequired).length

    return `আপনার খামারে মোট ${totalCrops}টি ফসল রয়েছে, যার মধ্যে ${healthyCrops}টি সুস্থ অবস্থায় আছে। গড় স্বাস্থ্য স্কোর ${avgHealth}%। বর্তমানে ${highPriorityCount}টি গুরুত্বপূর্ণ বিষয়ে এবং ${actionRequiredCount}টি বিষয়ে তাৎক্ষণিক পদক্ষেপ প্রয়োজন।`
  }

  private generateRecommendations(insights: AIInsight[]): string[] {
    const recommendations = insights
      .filter(insight => insight.actionRequired)
      .sort((a, b) => {
        const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 }
        return priorityWeight[b.priority] - priorityWeight[a.priority]
      })
      .slice(0, 5)
      .map(insight => insight.description)

    // Add general recommendations if we don't have enough specific ones
    if (recommendations.length < 3) {
      const generalRecs = [
        'নিয়মিত ফসলের স্বাস্থ্য পরীক্ষা করুন',
        'মাটির pH মান ও পুষ্টি উপাদান পরীক্ষা করান',
        'সমন্বিত বালাই ব্যবস্থাপনা অনুসরণ করুন',
        'আবহাওয়ার পূর্বাভাস অনুযায়ী পরিকল্পনা করুন',
        'বাজার দর নিয়মিত পর্যবেক্ষণ করুন'
      ]
      
      recommendations.push(...generalRecs.slice(0, 3 - recommendations.length))
    }

    return recommendations
  }

  private calculatePredictedOutcomes(farmData: any): AIAnalysisResult['predictedOutcomes'] {
    const baseYield = farmData?.farmStats?.totalArea * 20 || 100 // Default yield estimation
    const baseProfit = farmData?.marketInsights?.totalValue * 0.3 || 50000 // 30% profit margin
    const baseEfficiency = farmData?.farmStats?.avgHealth || 75

    return {
      yield: {
        current: baseYield,
        potential: Math.round(baseYield * 1.25), // 25% improvement potential
        improvement: 25
      },
      profit: {
        current: baseProfit,
        potential: Math.round(baseProfit * 1.35), // 35% improvement potential
        improvement: 35
      },
      efficiency: {
        current: baseEfficiency,
        potential: Math.min(95, Math.round(baseEfficiency * 1.15)), // 15% improvement potential
        improvement: 15
      }
    }
  }

  async getQuickInsights(query: string, context: any): Promise<string> {
    try {
      const response = await api.askAgent(query, {
        language: 'bn',
        user_context: context
      })
      return response.response || 'দুঃখিত, এই মুহূর্তে পরামর্শ দিতে পারছি না।'
    } catch (error) {
      console.error('Quick insight failed:', error)
      return this.getStaticInsight(query)
    }
  }

  private getStaticInsight(query: string): string {
    const queryLower = query.toLowerCase()
    
    if (queryLower.includes('সেচ') || queryLower.includes('পানি')) {
      return 'মাটির আর্দ্রতা ৬০-৭০% রাখার চেষ্টা করুন। সকাল ও সন্ধ্যায় সেচ দেওয়া সবচেয়ে ভালো।'
    } else if (queryLower.includes('সার') || queryLower.includes('খাদ্য')) {
      return 'ইউরিয়া, টিএসপি ও এমওপি সার সুষম অনুপাতে ব্যবহার করুন। জৈব সার ব্যবহারে মাটির গুণমান বাড়ে।'
    } else if (queryLower.includes('রোগ') || queryLower.includes('পোকা')) {
      return 'নিয়মিত ক্ষেত পরিদর্শন করুন। রোগের প্রাথমিক লক্ষণ দেখলেই চিকিৎসা শুরু করুন।'
    } else if (queryLower.includes('বাজার') || queryLower.includes('দাম')) {
      return 'স্থানীয় বাজারের পাশাপাশি অনলাইন প্ল্যাটফর্মেও ফসল বিক্রয়ের চেষ্টা করুন।'
    } else {
      return 'সফল কৃষিকাজের জন্য নিয়মিত পরিচর্যা, সঠিক সময়ে সার প্রয়োগ ও বাজার মূল্য পর্যবেক্ষণ জরুরি।'
    }
  }

  clearCache(): void {
    this.lastAnalysis = null
    this.analysisTimestamp = null
  }
}

// Export singleton instance
export const aiInsightEngine = AIInsightEngine.getInstance()

// Utility functions for AI insights
export function categorizeInsightsByPriority(insights: AIInsight[]): Record<string, AIInsight[]> {
  return insights.reduce((acc, insight) => {
    if (!acc[insight.priority]) {
      acc[insight.priority] = []
    }
    acc[insight.priority].push(insight)
    return acc
  }, {} as Record<string, AIInsight[]>)
}

export function getInsightIcon(type: AIInsight['type']): string {
  const iconMap = {
    recommendation: '💡',
    warning: '⚠️',
    prediction: '🔮',
    optimization: '⚡'
  }
  return iconMap[type] || '📊'
}

export function getInsightColor(priority: AIInsight['priority']): string {
  const colorMap = {
    low: 'text-blue-600 bg-blue-50 border-blue-200',
    medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    high: 'text-orange-600 bg-orange-50 border-orange-200',
    critical: 'text-red-600 bg-red-50 border-red-200'
  }
  return colorMap[priority] || 'text-gray-600 bg-gray-50 border-gray-200'
}
