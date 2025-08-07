'use client'

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History, Eye, Trash2, Download, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import api from '@/lib/api';

const DetectionHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async (loadMore = false) => {
    try {
      setLoading(true);
      const currentPage = loadMore ? page + 1 : 0;
      const response = await api.getDetectionHistory(currentPage * 20, 20);
      
      if (response.success) {
        if (loadMore) {
          setHistory(prev => [...prev, ...response.history]);
          setPage(currentPage);
        } else {
          setHistory(response.history);
          setPage(0);
        }
        setHasMore(response.history.length === 20);
      }
    } catch (err) {
      setError('ইতিহাস লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const deleteDetection = async (detectionId) => {
    try {
      await api.deleteDetection(detectionId);
      setHistory(prev => prev.filter(item => item.id !== detectionId));
    } catch (err) {
      setError('ডিলিট করতে সমস্যা হয়েছে।');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('bn-BD', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'severe':
      case 'গুরুতর': 
        return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate':
      case 'মাঝারি': 
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'mild':
      case 'হালকা': 
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
      case 'কম':
      default: 
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getSeverityText = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'severe': return 'গুরুতর';
      case 'moderate': return 'মাঝারি';
      case 'mild': return 'হালকা';
      case 'low': return 'কম';
      case 'গুরুতর': return 'গুরুতর';
      case 'মাঝারি': return 'মাঝারি';
      case 'হালকা': return 'হালকা';
      case 'কম': return 'কম';
      default: return severity || 'কম';
    }
  };

  if (loading && history.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p>ইতিহাস লোড করা হচ্ছে...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-red-800">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-gray-500">
            <History className="mx-auto h-12 w-12 mb-4" />
            <p className="text-lg font-medium">কোনো ইতিহাস নেই</p>
            <p className="text-sm">আপনি এখনো কোনো ছবি পরীক্ষা করেননি।</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>শনাক্তকরণের ইতিহাস</CardTitle>
          <CardDescription>
            আপনার আগের সব পরীক্ষার ফলাফল দেখুন
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {history.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-center space-x-3">
                      {item.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      )}
                      <div>
                        <p className="font-medium">
                          {item.success ? 'সফল পরীক্ষা' : 'ব্যর্থ পরীক্ষা'}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(item.created_at)}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatTime(item.created_at)}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Results Summary */}
                    {item.success && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <strong>শনাক্তকৃত রোগ:</strong> {item.detection_count}টি
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>প্রক্রিয়াকরণের সময়:</strong> {item.processing_time?.toFixed(2)} সেকেন্ড
                        </p>
                        {item.detections && item.detections.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {item.detections.slice(0, 3).map((detection, index) => (
                              <Badge
                                key={index}
                                className={getSeverityColor(detection.severity)}
                              >
                                {getSeverityText(detection.severity)}
                              </Badge>
                            ))}
                            {item.detections.length > 3 && (
                              <Badge variant="outline">
                                +{item.detections.length - 3} আরো
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {!item.success && item.error_message && (
                      <p className="text-sm text-red-600">
                        <strong>ত্রুটি:</strong> {item.error_message}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedDetection(item)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>পরীক্ষার বিস্তারিত</DialogTitle>
                          <DialogDescription>
                            {formatDate(item.created_at)} - {formatTime(item.created_at)}
                          </DialogDescription>
                        </DialogHeader>
                        {selectedDetection && (
                          <div className="space-y-6">
                            {/* Images */}
                            {selectedDetection.success && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {selectedDetection.original_image_url && (
                                  <div>
                                    <h4 className="font-medium mb-2">মূল ছবি</h4>
                                    <img
                                      src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${selectedDetection.original_image_url}`}
                                      alt="Original"
                                      className="w-full rounded-lg shadow-md"
                                    />
                                  </div>
                                )}
                                {selectedDetection.processed_image_url && (
                                  <div>
                                    <h4 className="font-medium mb-2">প্রক্রিয়াকৃত ছবি</h4>
                                    <img
                                      src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${selectedDetection.processed_image_url}`}
                                      alt="Processed"
                                      className="w-full rounded-lg shadow-md"
                                    />
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Detection Results */}
                            {selectedDetection.detections && selectedDetection.detections.length > 0 && (
                              <div>
                                <h4 className="font-medium mb-3">শনাক্তকৃত রোগসমূহ</h4>
                                <div className="space-y-3">
                                  {selectedDetection.detections.map((detection, index) => (
                                    <div key={index} className="border rounded-lg p-3">
                                      <div className="flex items-start justify-between">
                                        <div>
                                          <h5 className="font-medium">{detection.class_name}</h5>
                                          <p className="text-sm text-gray-600">
                                            আত্মবিশ্বাস: {Math.round(detection.confidence * 100)}%
                                          </p>
                                        </div>
                                        <Badge className={getSeverityColor(detection.severity)}>
                                          {getSeverityText(detection.severity)}
                                        </Badge>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    {item.success && item.processed_image_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${item.processed_image_url}`}
                          download
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteDetection(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="mt-6 text-center">
              <Button
                variant="outline"
                onClick={() => loadHistory(true)}
                disabled={loading}
              >
                {loading ? 'লোড করা হচ্ছে...' : 'আরো দেখুন'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DetectionHistory;
