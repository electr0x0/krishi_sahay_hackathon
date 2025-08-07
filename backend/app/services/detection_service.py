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
        
        # Disease descriptions mapping
        self.disease_descriptions = {
            'Apple Scab Leaf': 'Apple Scab Disease - Fungal infection causing dark lesions',
            'Apple leaf': 'Healthy Apple Leaf - No disease detected',
            'Apple rust leaf': 'Apple Rust Disease - Fungal infection with orange spots',
            'Bell_pepper leaf': 'Healthy Bell Pepper Leaf - No disease detected',
            'Bell_pepper leaf spot': 'Bell Pepper Leaf Spot - Bacterial or fungal infection',
            'Blueberry leaf': 'Healthy Blueberry Leaf - No disease detected',
            'Cherry leaf': 'Healthy Cherry Leaf - No disease detected',
            'Corn Gray leaf spot': 'Corn Gray Leaf Spot - Fungal disease affecting corn',
            'Corn leaf blight': 'Corn Leaf Blight - Destructive fungal disease',
            'Corn rust leaf': 'Corn Rust - Fungal disease with orange pustules',
            'Peach leaf': 'Healthy Peach Leaf - No disease detected',
            'Potato leaf': 'Healthy Potato Leaf - No disease detected',
            'Potato leaf early blight': 'Potato Early Blight - Fungal disease with dark spots',
            'Potato leaf late blight': 'Potato Late Blight - Destructive fungal disease',
            'Raspberry leaf': 'Healthy Raspberry Leaf - No disease detected',
            'Soyabean leaf': 'Healthy Soybean Leaf - No disease detected',
            'Squash Powdery mildew leaf': 'Squash Powdery Mildew - White fungal growth',
            'Strawberry leaf': 'Healthy Strawberry Leaf - No disease detected',
            'Tomato Early blight leaf': 'Tomato Early Blight - Dark spots with concentric rings',
            'Tomato Septoria leaf spot': 'Tomato Septoria Leaf Spot - Small dark spots with light centers',
            'Tomato leaf': 'Healthy Tomato Leaf - No disease detected',
            'Tomato leaf bacterial spot': 'Tomato Bacterial Spot - Bacterial infection with small lesions',
            'Tomato leaf late blight': 'Tomato Late Blight - Destructive fungal disease',
            'Tomato leaf mosaic virus': 'Tomato Mosaic Virus - Viral infection causing mottled leaves',
            'Tomato leaf yellow virus': 'Tomato Yellow Leaf Curl Virus - Viral disease with yellowing',
            'Tomato mold leaf': 'Tomato Leaf Mold - Fungal disease with yellowing',
            'Tomato two spotted spider mites leaf': 'Tomato Spider Mite Damage - Pest damage with stippling',
            'grape leaf': 'Healthy Grape Leaf - No disease detected',
            'grape leaf black rot': 'Grape Black Rot - Fungal disease with dark lesions'
        }

    def _calculate_severity(self, confidence: float) -> str:
        """Calculate disease severity level based on confidence score."""
        if confidence >= 0.8:
            return "Severe"
        elif confidence >= 0.6:
            return "Moderate"
        elif confidence >= 0.4:
            return "Mild"
        else:
            return "Low"

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
                        label = f'{detection["class_name"]} ({detection["severity"]}) {detection["confidence"]:.2f}'
                        
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
