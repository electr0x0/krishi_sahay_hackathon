'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

const DetectionTest = () => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const testImageDetection = async () => {
    try {
      // Create a simple test image (1x1 pixel black image)
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, 1, 1);
      
      // Convert to blob
      canvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append('file', blob, 'test.jpg');
        formData.append('confidence_threshold', '0.25');

        try {
          const response = await api.post('/api/detection/detect', formData);
          setResult(JSON.stringify(response, null, 2));
          setError(null);
        } catch (err) {
          setError(err.message);
          setResult(null);
        }
      }, 'image/jpeg');
      
    } catch (err) {
      setError(err.message);
      setResult(null);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-bold">Detection API Test</h3>
      
      <Button onClick={testImageDetection}>
        Test Image Detection API
      </Button>
      
      {error && (
        <div className="p-4 bg-red-100 border border-red-300 rounded">
          <h4 className="font-bold text-red-800">Error:</h4>
          <pre className="text-red-700">{error}</pre>
        </div>
      )}
      
      {result && (
        <div className="p-4 bg-green-100 border border-green-300 rounded">
          <h4 className="font-bold text-green-800">Success:</h4>
          <pre className="text-green-700 text-xs">{result}</pre>
        </div>
      )}
    </div>
  );
};

export default DetectionTest;
