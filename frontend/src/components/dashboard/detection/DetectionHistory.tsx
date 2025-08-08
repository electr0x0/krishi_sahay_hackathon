'use client'

import { useState, useEffect } from 'react';
import { History } from 'lucide-react';
import Image from 'next/image';

interface DetectionHistoryProps {
  getAuthHeaders: () => Record<string, string>;
}

interface Detection {
  class_name: string;
  confidence: number;
  severity: string;
  original_class?: string;
}

interface HistoryItem {
  id: number;
  original_image_url: string;
  processed_image_url: string;
  detections: Detection[];
  detection_count: number;
  processing_time: number;
  confidence_threshold: number;
  success: boolean;
  error_message?: string;
  created_at: string;
}

const DetectionHistory = ({ getAuthHeaders }: DetectionHistoryProps) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load history on component mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const headers = getAuthHeaders();
        console.log('Auth headers for history:', headers); // Debug log
        
        const response = await fetch('http://localhost:8000/api/detection/history?skip=0&limit=10', {
          method: 'GET',
          headers: headers,
        });
        
        console.log('History API Response status:', response.status); // Debug log
        
        if (response.ok) {
          const data = await response.json();
          console.log('History API Response:', data); // Debug log
          setHistory(data.history || []);
        } else {
          const errorText = await response.text();
          console.error('History API Error:', response.status, errorText);
          setError(`API থেকে ডেটা লোড করতে সমস্যা হয়েছে। (${response.status})`);
        }
      } catch (err) {
        console.error('History load error:', err);
        setError('ইতিহাস লোড করতে সমস্যা হয়েছে।');
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [getAuthHeaders]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p>ইতিহাস লোড করা হচ্ছে...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">পূর্ববর্তী পরীক্ষাসমূহ</h3>
      
      {history.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <History className="mx-auto h-12 w-12 mb-4" />
          <p>কোনো ইতিহাস নেই</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div key={item.id} className="bg-gray-50 rounded-lg p-4 border">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium">পরীক্ষা #{item.id}</p>
                  <p className="text-sm text-gray-600">{formatDate(item.created_at)}</p>
                  <p className="text-sm text-gray-600">
                    শনাক্তকৃত রোগ: {item.detection_count}টি
                  </p>
                  <p className="text-sm text-gray-600">
                    প্রক্রিয়াকরণের সময়: {item.processing_time?.toFixed(2)} সেকেন্ড
                  </p>
                  {item.detections && item.detections.length > 0 && (
                    <p className="text-sm text-green-600 mt-1">
                      প্রধান রোগ: {item.detections[0].class_name}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    item.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {item.success ? 'সফল' : 'ব্যর্থ'}
                  </span>
                  {item.processed_image_url && (
                    <Image
                      src={`http://127.0.0.1:8000${item.processed_image_url}`}
                      alt="Processed result"
                      width={64}
                      height={64}
                      className="object-cover rounded border"
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DetectionHistory;
