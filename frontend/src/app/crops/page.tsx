'use client'

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Sprout, 
  Droplets, 
  Sun, 
  Calendar, 
  TrendingUp, 
  AlertTriangle,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';

interface Crop {
  id: string;
  name: string;
  nameBn: string;
  variety: string;
  plantedDate: string;
  expectedHarvest: string;
  currentStage: string;
  progress: number;
  area: number;
  unit: string;
  health: 'excellent' | 'good' | 'fair' | 'poor';
  wateringSchedule: string;
  lastWatered: string;
  fertilizer: string;
  notes: string;
}

const mockCrops: Crop[] = [
  {
    id: '1',
    name: 'Rice',
    nameBn: 'ধান',
    variety: 'BRRI Dhan-29',
    plantedDate: '2024-07-15',
    expectedHarvest: '2024-11-15',
    currentStage: 'ফুল আসার পর্যায়',
    progress: 75,
    area: 2.5,
    unit: 'একর',
    health: 'excellent',
    wateringSchedule: 'প্রতিদিন',
    lastWatered: '2024-08-05',
    fertilizer: 'ইউরিয়া ও TSP',
    notes: 'ভালো বৃদ্ধি হচ্ছে, কোনো পোকামাকড় নেই'
  },
  {
    id: '2',
    name: 'Potato',
    nameBn: 'আলু',
    variety: 'Diamond',
    plantedDate: '2024-06-20',
    expectedHarvest: '2024-09-20',
    currentStage: 'কন্দ গঠনের পর্যায়',
    progress: 60,
    area: 1.2,
    unit: 'একর',
    health: 'good',
    wateringSchedule: 'সপ্তাহে ৩ বার',
    lastWatered: '2024-08-04',
    fertilizer: 'জৈব সার',
    notes: 'পাতায় হালকা দাগ দেখা যাচ্ছে'
  },
  {
    id: '3',
    name: 'Tomato',
    nameBn: 'টমেটো',
    variety: 'Ratan',
    plantedDate: '2024-07-01',
    expectedHarvest: '2024-10-01',
    currentStage: 'ফল ধরার পর্যায়',
    progress: 45,
    area: 0.8,
    unit: 'একর',
    health: 'fair',
    wateringSchedule: 'প্রতিদিন',
    lastWatered: '2024-08-05',
    fertilizer: 'NPK',
    notes: 'কিছু গাছে রোগের লক্ষণ'
  },
  {
    id: '4',
    name: 'Onion',
    nameBn: 'পেঁয়াজ',
    variety: 'Taherpuri',
    plantedDate: '2024-05-15',
    expectedHarvest: '2024-08-15',
    currentStage: 'পরিপক্বতার পর্যায়',
    progress: 90,
    area: 0.5,
    unit: 'একর',
    health: 'excellent',
    wateringSchedule: 'সপ্তাহে ২ বার',
    lastWatered: '2024-08-03',
    fertilizer: 'কমপোস্ট',
    notes: 'শীঘ্রই কাটার জন্য প্রস্তুত'
  }
];

const getHealthBadgeColor = (health: string) => {
  switch (health) {
    case 'excellent':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'good':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    case 'fair':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    case 'poor':
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};

const getHealthText = (health: string) => {
  switch (health) {
    case 'excellent': return 'চমৎকার';
    case 'good': return 'ভালো';
    case 'fair': return 'মোটামুটি';
    case 'poor': return 'খারাপ';
    default: return 'অজানা';
  }
};

const SimpleProgress = ({ value }: { value: number }) => (
  <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
    <div
      className="h-full bg-primary transition-all duration-300 ease-in-out"
      style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
    />
  </div>
);

export default function CropsPage() {
  const [crops] = useState<Crop[]>(mockCrops);

  const totalArea = crops.reduce((sum, crop) => sum + crop.area, 0);
  const healthyCrops = crops.filter(crop => crop.health === 'excellent' || crop.health === 'good').length;
  const nearHarvest = crops.filter(crop => crop.progress >= 80).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">আমার ফসল</h1>
              <p className="text-muted-foreground">ফসলের বিস্তারিত তথ্য ও পরিচর্যা</p>
            </div>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              নতুন ফসল যোগ করুন
            </Button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Sprout className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">মোট ফসল</p>
                    <p className="text-2xl font-bold">{crops.length}টি</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">মোট জমি</p>
                    <p className="text-2xl font-bold">{totalArea} একর</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Sun className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">সুস্থ ফসল</p>
                    <p className="text-2xl font-bold">{healthyCrops}টি</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">কাটার জন্য প্রস্তুত</p>
                    <p className="text-2xl font-bold">{nearHarvest}টি</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Crops Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {crops.map((crop) => (
            <Card key={crop.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{crop.nameBn}</CardTitle>
                    <p className="text-sm text-muted-foreground">{crop.variety}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getHealthBadgeColor(crop.health)}>
                      {getHealthText(crop.health)}
                    </Badge>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">বৃদ্ধির অবস্থা</span>
                    <span className="text-sm text-muted-foreground">{crop.progress}%</span>
                  </div>
                  <SimpleProgress value={crop.progress} />
                  <p className="text-xs text-muted-foreground mt-1">{crop.currentStage}</p>
                </div>

                <Separator />

                {/* Details */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">জমির পরিমাণ:</span>
                    <span className="font-medium">{crop.area} {crop.unit}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">রোপণের তারিখ:</span>
                    <span className="font-medium">
                      {new Date(crop.plantedDate).toLocaleDateString('bn-BD')}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">সম্ভাব্য কাটার সময়:</span>
                    <span className="font-medium">
                      {new Date(crop.expectedHarvest).toLocaleDateString('bn-BD')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <span className="text-muted-foreground">পানি:</span>
                    </div>
                    <span className="font-medium">{crop.wateringSchedule}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">সার:</span>
                    <span className="font-medium">{crop.fertilizer}</span>
                  </div>
                </div>

                {crop.notes && (
                  <>
                    <Separator />
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{crop.notes}</p>
                      </div>
                    </div>
                  </>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    পানি দিন
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    সার দিন
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
