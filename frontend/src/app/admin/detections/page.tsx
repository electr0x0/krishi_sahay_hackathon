'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Eye, MapPin } from 'lucide-react';
import Image from 'next/image';

interface Detection {
  id: number;
  user_id: number;
  user_name: string;
  crop_type: string;
  disease_name: string;
  confidence: number;
  severity: string;
  image_path: string;
  location: string;
  detected_at: string;
  status: string;
}

export default function DetectionsMonitoring() {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetections();
  }, []);

  const fetchDetections = async () => {
    try {
      // Import the API service
      const apiModule = await import('@/lib/api.js');
      const api = apiModule.default;
      const token = api.getToken();
      
      if (!token) {
        console.error('No token found - user not authenticated');
        setLoading(false);
        return;
      }
      
      const response = await fetch('http://localhost:8000/api/admin/detections', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setDetections(data);
      } else {
        console.error('Failed to fetch detections:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch detections:', error);
    } finally {
      setLoading(false);
    }
  };

  const todayDetections = detections.filter(d => {
    const today = new Date().toDateString();
    return new Date(d.detected_at).toDateString() === today;
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Disease Detection Log</h1>
        <p className="text-gray-600 mt-1">Monitor all disease detections across the platform</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Detections</p>
              <p className="text-2xl font-bold">{detections.length}</p>
            </div>
            <Eye className="w-8 h-8 text-blue-400" />
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today</p>
              <p className="text-2xl font-bold text-orange-600">{todayDetections}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Confidence</p>
              <p className="text-2xl font-bold">92.3%</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">High Severity</p>
              <p className="text-2xl font-bold text-red-600">
                {detections.filter(d => d.severity === 'high').length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </Card>
      </div>

      {/* Detection List */}
      <Card>
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading detections...</div>
          ) : detections.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No detections found</div>
          ) : (
            detections.map((detection) => (
              <div key={detection.id} className="p-5 hover:bg-gray-50 transition-colors">
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden">
                      {detection.image_path ? (
                        <img
                          src={detection.image_path}
                          alt={detection.disease_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Eye className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {detection.disease_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {detection.crop_type} • Detected by {detection.user_name}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge 
                          variant="secondary"
                          className={
                            detection.severity === 'high'
                              ? 'bg-red-100 text-red-800'
                              : detection.severity === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }
                        >
                          {detection.severity} severity
                        </Badge>
                        <Badge variant="outline">
                          {Math.round(detection.confidence)}% confidence
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{detection.location}</span>
                      </div>
                      <span>•</span>
                      <span>{new Date(detection.detected_at).toLocaleString()}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Detection Confidence</span>
                        <span>{Math.round(detection.confidence)}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            detection.confidence >= 90
                              ? 'bg-green-500'
                              : detection.confidence >= 70
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${detection.confidence}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
