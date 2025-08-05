// Utility functions for crop analytics and farm management

export interface CropData {
  id: string
  name: string
  variety: string
  area: number
  plantedDate: Date
  expectedHarvest: Date
  status: 'healthy' | 'warning' | 'critical' | 'harvested'
  health: number
  growthStage: 'seed' | 'sprout' | 'vegetative' | 'flowering' | 'fruiting' | 'mature'
  location: {
    field: string
    coordinates: { lat: number; lng: number }
  }
  sensors: {
    soilMoisture: number
    temperature: number
    humidity: number
    ph: number
  }
  yieldData: {
    expected: number
    actual?: number
    unit: string
  }
  treatments: Array<{
    id: string
    type: 'fertilizer' | 'pesticide' | 'irrigation' | 'other'
    description: string
    date: Date
    cost: number
  }>
  images: string[]
}

export interface AnalyticsMetrics {
  farmProductivity: number
  resourceEfficiency: number
  profitability: number
  sustainability: number
}

export function generateCropData(): CropData[] {
  const crops = [
    { name: "ধান", variety: "BR11", baseHealth: 92 },
    { name: "গম", variety: "BARI Gom-26", baseHealth: 85 },
    { name: "পেঁয়াজ", variety: "লাল পেঁয়াজ", baseHealth: 78 },
    { name: "টমেটো", variety: "BARI Tomato-14", baseHealth: 88 },
    { name: "আলু", variety: "Diamond", baseHealth: 90 },
    { name: "ভুট্টা", variety: "Pacific-984", baseHealth: 83 },
    { name: "মুগ ডাল", variety: "BARI Mug-6", baseHealth: 95 },
    { name: "সরিষা", variety: "BARI Sharisha-17", baseHealth: 86 },
  ]

  return crops.map((crop, index) => ({
    id: `crop-${index + 1}`,
    name: crop.name,
    variety: crop.variety,
    area: Math.round((Math.random() * 3 + 0.5) * 10) / 10,
    plantedDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
    expectedHarvest: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
    status: getRandomStatus(),
    health: Math.max(60, Math.min(100, crop.baseHealth + (Math.random() - 0.5) * 20)),
    growthStage: getRandomGrowthStage(),
    location: {
      field: `জমি ${index + 1}`,
      coordinates: {
        lat: 23.8103 + (Math.random() - 0.5) * 0.1,
        lng: 90.4125 + (Math.random() - 0.5) * 0.1,
      },
    },
    sensors: {
      soilMoisture: Math.round(45 + Math.random() * 40),
      temperature: Math.round(20 + Math.random() * 15),
      humidity: Math.round(50 + Math.random() * 30),
      ph: Math.round((6.0 + Math.random() * 2) * 10) / 10,
    },
    yieldData: {
      expected: Math.round(8 + Math.random() * 12),
      unit: getYieldUnit(crop.name),
    },
    treatments: generateTreatments(),
    images: [
      `/crop-images/${crop.name.toLowerCase()}-1.jpg`,
      `/crop-images/${crop.name.toLowerCase()}-2.jpg`,
      `/crop-images/${crop.name.toLowerCase()}-3.jpg`,
    ],
  }))
}

function getRandomStatus(): CropData['status'] {
  const statuses: CropData['status'][] = ['healthy', 'warning', 'critical', 'harvested']
  const weights = [0.6, 0.25, 0.1, 0.05] // Higher probability for healthy crops
  
  const random = Math.random()
  let cumulative = 0
  
  for (let i = 0; i < statuses.length; i++) {
    cumulative += weights[i]
    if (random < cumulative) {
      return statuses[i]
    }
  }
  
  return 'healthy'
}

function getRandomGrowthStage(): CropData['growthStage'] {
  const stages: CropData['growthStage'][] = ['seed', 'sprout', 'vegetative', 'flowering', 'fruiting', 'mature']
  return stages[Math.floor(Math.random() * stages.length)]
}

function getYieldUnit(cropName: string): string {
  const grainCrops = ['ধান', 'গম', 'ভুট্টা', 'মুগ ডাল']
  const oilCrops = ['সরিষা']
  
  if (grainCrops.includes(cropName)) {
    return 'মণ/বিঘা'
  } else if (oilCrops.includes(cropName)) {
    return 'কেজি/বিঘা'
  } else {
    return 'কেজি/বিঘা'
  }
}

function generateTreatments(): CropData['treatments'] {
  const treatments = []
  const treatmentTypes = [
    { type: 'fertilizer' as const, desc: 'ইউরিয়া সার প্রয়োগ', cost: 1200 },
    { type: 'pesticide' as const, desc: 'পোকামাকড় দমন', cost: 800 },
    { type: 'irrigation' as const, desc: 'সেচ প্রদান', cost: 500 },
    { type: 'fertilizer' as const, desc: 'জৈব সার প্রয়োগ', cost: 1500 },
  ]

  const numTreatments = Math.floor(Math.random() * 4) + 1
  
  for (let i = 0; i < numTreatments; i++) {
    const treatment = treatmentTypes[Math.floor(Math.random() * treatmentTypes.length)]
    treatments.push({
      id: `treatment-${i + 1}`,
      type: treatment.type,
      description: treatment.desc,
      date: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      cost: treatment.cost + (Math.random() - 0.5) * 200,
    })
  }

  return treatments
}

export function calculateCropValue(crop: CropData, pricePerUnit: number): number {
  const expectedYield = crop.yieldData.expected
  const healthFactor = crop.health / 100
  const adjustedYield = expectedYield * healthFactor
  return Math.round(adjustedYield * pricePerUnit * crop.area)
}

export function getCropStatusColor(status: CropData['status']): string {
  switch (status) {
    case 'healthy':
      return 'text-green-600 border-green-200 bg-green-50'
    case 'warning':
      return 'text-yellow-600 border-yellow-200 bg-yellow-50'
    case 'critical':
      return 'text-red-600 border-red-200 bg-red-50'
    case 'harvested':
      return 'text-blue-600 border-blue-200 bg-blue-50'
    default:
      return 'text-gray-600 border-gray-200 bg-gray-50'
  }
}

export function getGrowthStageText(stage: CropData['growthStage']): string {
  const stageTexts = {
    seed: 'বীজ',
    sprout: 'অঙ্কুর',
    vegetative: 'পাতা বৃদ্ধি',
    flowering: 'ফুল',
    fruiting: 'ফল ধরা',
    mature: 'পরিপক্ব',
  }
  return stageTexts[stage]
}

export function calculateAnalyticsMetrics(crops: CropData[]): AnalyticsMetrics {
  const totalCrops = crops.length
  const healthyCrops = crops.filter(crop => crop.status === 'healthy').length
  const avgHealth = crops.reduce((sum, crop) => sum + crop.health, 0) / totalCrops
  
  const totalCosts = crops.reduce((sum, crop) => 
    sum + crop.treatments.reduce((treatmentSum, treatment) => treatmentSum + treatment.cost, 0), 0
  )
  
  const totalRevenue = crops.reduce((sum, crop) => sum + calculateCropValue(crop, 35), 0)
  
  return {
    farmProductivity: Math.round(avgHealth),
    resourceEfficiency: Math.round(Math.min(100, (healthyCrops / totalCrops) * 100)),
    profitability: Math.round(Math.min(100, ((totalRevenue - totalCosts) / totalRevenue) * 100)),
    sustainability: Math.round((avgHealth + (healthyCrops / totalCrops) * 100) / 2),
  }
}

export function generatePredictiveInsights(crops: CropData[], weatherData: any, marketData: any): string[] {
  const insights: string[] = []
  
  // Health-based insights
  const lowHealthCrops = crops.filter(crop => crop.health < 70)
  if (lowHealthCrops.length > 0) {
    insights.push(`${lowHealthCrops.length}টি ফসলের স্বাস্থ্য দুর্বল। তাৎক্ষণিক পরিচর্যা প্রয়োজন।`)
  }
  
  // Sensor-based insights
  const lowMoistureCrops = crops.filter(crop => crop.sensors.soilMoisture < 50)
  if (lowMoistureCrops.length > 0) {
    insights.push(`${lowMoistureCrops.length}টি ক্ষেতে মাটির আর্দ্রতা কম। সেচ দেওয়ার পরামর্শ।`)
  }
  
  // Growth stage insights
  const matureCrops = crops.filter(crop => crop.growthStage === 'mature')
  if (matureCrops.length > 0) {
    insights.push(`${matureCrops.length}টি ফসল কাটার জন্য প্রস্তুত। শীঘ্র ফসল সংগ্রহ করুন।`)
  }
  
  // Cost optimization
  const highCostCrops = crops.filter(crop => 
    crop.treatments.reduce((sum, t) => sum + t.cost, 0) > 5000
  )
  if (highCostCrops.length > 0) {
    insights.push(`${highCostCrops.length}টি ফসলে খরচ বেশি। খরচ কমানোর উপায় খুঁজুন।`)
  }
  
  // Seasonal insights
  const currentMonth = new Date().getMonth()
  if (currentMonth >= 10 || currentMonth <= 2) { // Winter months
    insights.push("শীতকালীন ফসলের জন্য উপযুক্ত সময়। সবজি চাষ বিবেচনা করুন।")
  }
  
  return insights.slice(0, 5) // Return top 5 insights
}

export function formatBanglaNumber(num: number): string {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']
  return num.toString().split('').map(digit => {
    if (/\d/.test(digit)) {
      return banglaDigits[parseInt(digit)]
    }
    return digit
  }).join('')
}

export function formatBanglaDate(date: Date): string {
  const banglaMonths = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ]
  
  const day = formatBanglaNumber(date.getDate())
  const month = banglaMonths[date.getMonth()]
  const year = formatBanglaNumber(date.getFullYear())
  
  return `${day} ${month} ${year}`
}
