'use client'

import { useState, useEffect } from 'react';
import { History, Eye, X, MapPin, Clock, Target, AlertTriangle, CheckCircle, ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface DetectionHistoryProps {
  getAuthHeaders: () => Record<string, string>;
}

interface Detection {
  class_name: string;
  confidence: number;
  severity: string;
  original_class?: string;
  bbox?: number[];
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
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [showModal, setShowModal] = useState(false);

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
          setError(`তথ্য নিয়ে আসতে সমস্যা হয়েছে। (${response.status})`);
        }
      } catch (err) {
        console.error('History load error:', err);
        setError('পুরোনো তথ্য দেখাতে সমস্যা হয়েছে।');
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('bn-BD', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'গুরুতর': return 'text-red-600 bg-red-100';
      case 'মাঝারি': return 'text-orange-600 bg-orange-100';
      case 'হালকা': return 'text-yellow-600 bg-yellow-100';
      case 'কম': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const openModal = (item: HistoryItem) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p>পুরোনো তথ্য আনা হচ্ছে...</p>
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
    <>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">আগের পরীক্ষাগুলি</h3>
        
        {history.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <History className="mx-auto h-12 w-12 mb-4" />
            <p>এখনো কোনো পরীক্ষা করা হয়নি</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div key={item.id} className="bg-white rounded-lg p-4 border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-lg">পরীক্ষা নং {item.id}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.success 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.success ? (
                          <><CheckCircle className="w-3 h-3 inline mr-1" />সফল</>
                        ) : (
                          <><AlertTriangle className="w-3 h-3 inline mr-1" />ব্যর্থ</>
                        )}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(item.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        <span>পাওয়া গেছে: {item.detection_count}টি</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>সময় লেগেছে: {item.processing_time?.toFixed(2)}s</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        <span>নিশ্চিততার হার: {(item.confidence_threshold * 100).toFixed(0)}%</span>
                      </div>
                    </div>

                    {item.success && item.detections && item.detections.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">পাওয়া রোগসমূহ:</p>
                        <div className="flex flex-wrap gap-2">
                          {item.detections.slice(0, 3).map((detection, index) => (
                            <span
                              key={index}
                              className={`px-2 py-1 rounded-full text-xs ${getSeverityColor(detection.severity)}`}
                            >
                              {detection.class_name} ({(detection.confidence * 100).toFixed(1)}%)
                            </span>
                          ))}
                          {item.detections.length > 3 && (
                            <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                              +{item.detections.length - 3} আরও
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {!item.success && item.error_message && (
                      <div className="mb-3">
                        <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                          সমস্যা: {item.error_message}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2 ml-4">
                    {item.processed_image_url && (
                      <Image
                        src={`http://127.0.0.1:8000${item.processed_image_url}`}
                        alt="Processed result"
                        width={80}
                        height={80}
                        className="object-cover rounded border"
                      />
                    )}
                    <button
                      onClick={() => openModal(item)}
                      className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      বিস্তারিত
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for detailed view */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">পরীক্ষা নং {selectedItem.id} - সম্পূর্ণ তথ্য</h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">মূল তথ্য</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>তারিখ: {formatDateTime(selectedItem.created_at).date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>সময়: {formatDateTime(selectedItem.created_at).time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-gray-500" />
                      <span>যে সময়ে শেষ হয়েছে: {selectedItem.processing_time?.toFixed(3)} সেকেন্ড</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-gray-500" />
                      <span>নিশ্চিততার হার: {(selectedItem.confidence_threshold * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedItem.success 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedItem.success ? (
                          <><CheckCircle className="w-3 h-3 inline mr-1" />সফল</>
                        ) : (
                          <><AlertTriangle className="w-3 h-3 inline mr-1" />ব্যর্থ</>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">পরীক্ষার ফলাফল</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-gray-500" />
                      <span>মোট পাওয়া রোগ: {selectedItem.detection_count}টি</span>
                    </div>
                    {selectedItem.success && selectedItem.detections.length > 0 && (
                      <>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-gray-500" />
                          <span>সবচেয়ে বেশি নিশ্চিততা: {(Math.max(...selectedItem.detections.map(d => d.confidence)) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-gray-500" />
                          <span>গড় নিশ্চিততা: {((selectedItem.detections.reduce((sum, d) => sum + d.confidence, 0) / selectedItem.detections.length) * 100).toFixed(1)}%</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    মূল ছবি
                  </h3>
                  <Image
                    src={`http://127.0.0.1:8000${selectedItem.original_image_url}`}
                    alt="Original image"
                    width={400}
                    height={300}
                    className="w-full object-cover rounded border"
                  />
                </div>
                {selectedItem.processed_image_url && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" />
                      পরীক্ষা করা ছবি
                    </h3>
                    <Image
                      src={`http://127.0.0.1:8000${selectedItem.processed_image_url}`}
                      alt="Processed image"
                      width={400}
                      height={300}
                      className="w-full object-cover rounded border"
                    />
                  </div>
                )}
              </div>

              {/* Error Message */}
              {!selectedItem.success && selectedItem.error_message && (
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-3 text-red-600">কী সমস্যা হয়েছে</h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">{selectedItem.error_message}</p>
                  </div>
                </div>
              )}

              {/* Detections Details */}
              {selectedItem.success && selectedItem.detections && selectedItem.detections.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-4">পাওয়া রোগের সম্পূর্ণ তথ্য</h3>
                  <div className="space-y-4">
                    {selectedItem.detections.map((detection, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{detection.class_name}</h4>
                            {detection.original_class && (
                              <p className="text-sm text-gray-600 mt-1">ইংরেজি: {detection.original_class}</p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(detection.severity)}`}>
                              {detection.severity}
                            </span>
                            <span className="text-sm font-medium text-blue-600">
                              {(detection.confidence * 100).toFixed(2)}% নিশ্চয়তা
                            </span>
                          </div>
                        </div>
                        
                        {detection.bbox && (
                          <div className="text-xs text-gray-500 space-y-1">
                            <p>ছবিতে রোগের জায়গা:</p>
                            <div className="grid grid-cols-2 gap-2">
                              <span>বাম-ডান: {detection.bbox[0].toFixed(1)} - {detection.bbox[2].toFixed(1)}</span>
                              <span>উপর-নিচ: {detection.bbox[1].toFixed(1)} - {detection.bbox[3].toFixed(1)}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <span>চওড়া: {(detection.bbox[2] - detection.bbox[0]).toFixed(1)}px</span>
                              <span>লম্বা: {(detection.bbox[3] - detection.bbox[1]).toFixed(1)}px</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DetectionHistory;
