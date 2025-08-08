from ultralytics import YOLO
import cv2
import numpy as np
import os
from typing import Tuple, List, Dict
import logging

logger = logging.getLogger(__name__)

class PlantDiseaseDetector:
    def __init__(self, model_path: str, conf_threshold: float = 0.25):
        """Initialize the plant disease detector with YOLO model."""
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found: {model_path}")
        
        self.model = YOLO(model_path, task='detect')
        self.conf_threshold = conf_threshold
        
        # Disease descriptions mapping in Bengali
        self.disease_descriptions = {
            'Apple Scab Leaf': 'আপেল স্ক্যাব রোগ - ছত্রাকের সংক্রমণে কালো দাগ',
            'Apple leaf': 'সুস্থ আপেল পাতা - কোনো রোগ নেই',
            'Apple rust leaf': 'আপেল মরিচা রোগ - কমলা দাগযুক্ত ছত্রাকের সংক্রমণ',
            'Bell_pepper leaf': 'সুস্থ ক্যাপসিকাম পাতা - কোনো রোগ নেই',
            'Bell_pepper leaf spot': 'ক্যাপসিকাম পাতার দাগ - ব্যাকটেরিয়া বা ছত্রাকের সংক্রমণ',
            'Blueberry leaf': 'সুস্থ ব্লুবেরি পাতা - কোনো রোগ নেই',
            'Cherry leaf': 'সুস্থ চেরি পাতা - কোনো রোগ নেই',
            'Corn Gray leaf spot': 'ভুট্টার ধূসর দাগ - ছত্রাকের রোগ',
            'Corn leaf blight': 'ভুট্টার পাতা পোড়া রোগ - ধ্বংসাত্মক ছত্রাকের রোগ',
            'Corn rust leaf': 'ভুট্টার মরিচা রোগ - কমলা গুটিযুক্ত ছত্রাক',
            'Peach leaf': 'সুস্থ পিচ পাতা - কোনো রোগ নেই',
            'Potato leaf': 'সুস্থ আলুর পাতা - কোনো রোগ নেই',
            'Potato leaf early blight': 'আলুর আগাম পোড়া রোগ - কালো দাগযুক্ত ছত্রাক',
            'Potato leaf late blight': 'আলুর নাবী পোড়া রোগ - ধ্বংসাত্মক ছত্রাকের রোগ',
            'Raspberry leaf': 'সুস্থ রাস্পবেরি পাতা - কোনো রোগ নেই',
            'Soyabean leaf': 'সুস্থ সয়াবিন পাতা - কোনো রোগ নেই',
            'Squash Powdery mildew leaf': 'কুমড়ার পাউডারি মিলডিউ - সাদা ছত্রাকের আবরণ',
            'Strawberry leaf': 'সুস্থ স্ট্রবেরি পাতা - কোনো রোগ নেই',
            'Tomato Early blight leaf': 'টমেটোর আগাম পোড়া রোগ - বৃত্তাকার কালো দাগ',
            'Tomato Septoria leaf spot': 'টমেটোর সেপটোরিয়া দাগ - সাদা কেন্দ্রযুক্ত কালো দাগ',
            'Tomato leaf': 'সুস্থ টমেটো পাতা - কোনো রোগ নেই',
            'Tomato leaf bacterial spot': 'টমেটোর ব্যাকটেরিয়াল দাগ - ছোট দাগযুক্ত ব্যাকটেরিয়া সংক্রমণ',
            'Tomato leaf late blight': 'টমেটোর নাবী পোড়া রোগ - ধ্বংসাত্মক ছত্রাকের রোগ',
            'Tomato leaf mosaic virus': 'টমেটোর মোজাইক ভাইরাস - পাতার রঙ পরিবর্তনকারী ভাইরাস',
            'Tomato leaf yellow virus': 'টমেটোর হলুদ কোঁকড়ানো ভাইরাস - পাতা হলুদ করা ভাইরাস',
            'Tomato mold leaf': 'টমেটোর পাতার ছাতা - পাতা হলুদকারী ছত্রাক',
            'Tomato two spotted spider mites leaf': 'টমেটোর মাকড়সা পোকার ক্ষতি - ছোট দাগযুক্ত পোকার আক্রমণ',
            'grape leaf': 'সুস্থ আঙুরের পাতা - কোনো রোগ নেই',
            'grape leaf black rot': 'আঙুরের কালো পচা রোগ - কালো দাগযুক্ত ছত্রাকের রোগ'
        }

        # English labels for image annotations (OpenCV compatible)
        self.english_labels = {
            'Apple Scab Leaf': 'Apple Scab',
            'Apple leaf': 'Healthy Apple',
            'Apple rust leaf': 'Apple Rust',
            'Bell_pepper leaf': 'Healthy Bell Pepper',
            'Bell_pepper leaf spot': 'Bell Pepper Spot',
            'Blueberry leaf': 'Healthy Blueberry',
            'Cherry leaf': 'Healthy Cherry',
            'Corn Gray leaf spot': 'Corn Gray Spot',
            'Corn leaf blight': 'Corn Blight',
            'Corn rust leaf': 'Corn Rust',
            'Peach leaf': 'Healthy Peach',
            'Potato leaf': 'Healthy Potato',
            'Potato leaf early blight': 'Potato Early Blight',
            'Potato leaf late blight': 'Potato Late Blight',
            'Raspberry leaf': 'Healthy Raspberry',
            'Soyabean leaf': 'Healthy Soybean',
            'Squash Powdery mildew leaf': 'Squash Mildew',
            'Strawberry leaf': 'Healthy Strawberry',
            'Tomato Early blight leaf': 'Tomato Early Blight',
            'Tomato Septoria leaf spot': 'Tomato Septoria',
            'Tomato leaf': 'Healthy Tomato',
            'Tomato leaf bacterial spot': 'Tomato Bacterial',
            'Tomato leaf late blight': 'Tomato Late Blight',
            'Tomato leaf mosaic virus': 'Tomato Mosaic',
            'Tomato leaf yellow virus': 'Tomato Yellow Virus',
            'Tomato mold leaf': 'Tomato Mold',
            'Tomato two spotted spider mites leaf': 'Tomato Mites',
            'grape leaf': 'Healthy Grape',
            'grape leaf black rot': 'Grape Black Rot'
        }

    def _calculate_severity(self, confidence: float) -> str:
        """Calculate disease severity level based on confidence score."""
        if confidence >= 0.8:
            return "গুরুতর"
        elif confidence >= 0.6:
            return "মাঝারি"
        elif confidence >= 0.4:
            return "হালকা"
        else:
            return "কম"

    def _get_detection_results(self, boxes: np.ndarray, scores: np.ndarray, classes: np.ndarray) -> List[Dict]:
        """Convert detection results to structured format."""
        detections = []
        for box, score, cls in zip(boxes, scores, classes):
            class_name = self.model.names[int(cls)]
            detections.append({
                "class_name": self.disease_descriptions.get(class_name, class_name),
                "original_class": class_name,
                "confidence": float(score),
                "bbox": box.tolist(),
                "severity": self._calculate_severity(score)
            })
        return detections

    def predict(self, image_path: str) -> Tuple[np.ndarray, List[Dict]]:
        """Predict plant diseases in the image."""
        try:
            # Read image
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError(f"Could not load image: {image_path}")

            # Run YOLO inference
            results = self.model(image, conf=self.conf_threshold)
            
            detections = []
            
            # Process results
            for r in results:
                if len(r.boxes) > 0:
                    boxes = r.boxes.xyxy.cpu().numpy()
                    scores = r.boxes.conf.cpu().numpy()
                    classes = r.boxes.cls.cpu().numpy()
                    
                    # Get structured detections
                    detections = self._get_detection_results(boxes, scores, classes)
                    
                    # Draw bounding boxes and labels on image
                    for detection in detections:
                        box = detection["bbox"]
                        class_name = detection["original_class"]
                        english_label = self.english_labels.get(class_name, class_name)
                        severity_eng = "Severe" if detection["severity"] == "গুরুতর" else \
                                      "Moderate" if detection["severity"] == "মাঝারি" else \
                                      "Mild" if detection["severity"] == "হালকা" else "Low"
                        
                        label = f'{english_label} ({severity_eng}) {detection["confidence"]:.2f}'
                        
                        # Draw rectangle
                        cv2.rectangle(image,
                                    (int(box[0]), int(box[1])),
                                    (int(box[2]), int(box[3])),
                                    (0, 255, 0), 2)
                        
                        # Calculate text position
                        label_size, baseline = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 2)
                        text_x = int(box[0])
                        text_y = int(box[1]) - 10 if int(box[1]) - 10 > label_size[1] else int(box[1]) + 10 + label_size[1]
                        
                        # Draw background rectangle for text
                        cv2.rectangle(image,
                                    (text_x, text_y - label_size[1] - baseline),
                                    (text_x + label_size[0], text_y + baseline),
                                    (0, 0, 0), cv2.FILLED)
                        
                        # Draw text
                        cv2.putText(image, label,
                                   (text_x, text_y),
                                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)

            return image, detections
            
        except Exception as e:
            logger.error(f"Error during prediction: {str(e)}")
            raise
