#!/usr/bin/env python3
"""
Test script to validate detection alert creation logic
"""

def test_alert_creation_logic():
    """Test the alert creation logic without database dependencies"""
    
    # Sample detection results (similar to what the model would return)
    test_cases = [
        {
            "name": "Single disease detected",
            "detections": [
                {
                    "class_name": "Tomato Late Blight",
                    "confidence": 0.85,
                    "bbox": [100, 100, 200, 200]
                }
            ],
            "expected_alert_type": "severe_disease",
            "expected_severity": "high"
        },
        {
            "name": "High confidence disease",
            "detections": [
                {
                    "class_name": "Potato Early Blight", 
                    "confidence": 0.92,
                    "bbox": [50, 50, 150, 150]
                }
            ],
            "expected_alert_type": "severe_disease",
            "expected_severity": "high"
        },
        {
            "name": "Multiple diseases",
            "detections": [
                {
                    "class_name": "Tomato Late Blight",
                    "confidence": 0.75,
                    "bbox": [100, 100, 200, 200]
                },
                {
                    "class_name": "Tomato Bacterial Spot",
                    "confidence": 0.68,
                    "bbox": [250, 100, 350, 200]
                }
            ],
            "expected_alert_type": "multiple_diseases",
            "expected_severity": "high"
        },
        {
            "name": "Healthy plants (no alert expected)",
            "detections": [
                {
                    "class_name": "Tomato Healthy",
                    "confidence": 0.88,
                    "bbox": [100, 100, 200, 200]
                }
            ],
            "expected_alert_type": None,
            "expected_severity": None
        },
        {
            "name": "Mixed healthy and diseased",
            "detections": [
                {
                    "class_name": "Tomato Healthy",
                    "confidence": 0.88,
                    "bbox": [100, 100, 200, 200]
                },
                {
                    "class_name": "Tomato Late Blight",
                    "confidence": 0.72,
                    "bbox": [250, 100, 350, 200]
                }
            ],
            "expected_alert_type": "disease_detected",
            "expected_severity": "medium"
        },
        {
            "name": "Duplicate diseases (keep highest confidence)",
            "detections": [
                {
                    "class_name": "Tomato Late Blight",
                    "confidence": 0.65,
                    "bbox": [100, 100, 200, 200]
                },
                {
                    "class_name": "Tomato Late Blight", 
                    "confidence": 0.82,
                    "bbox": [250, 100, 350, 200]
                },
                {
                    "class_name": "Tomato Late Blight",
                    "confidence": 0.71,
                    "bbox": [400, 100, 500, 200]
                }
            ],
            "expected_alert_type": "severe_disease",
            "expected_severity": "high"
        }
    ]
    
    def determine_alert_params(detections):
        """Replicate the alert creation logic from the API"""
        if not detections:
            return None, None, [], []
        
        # Extract disease information with deduplication
        disease_dict = {}  # disease_name -> highest_confidence
        
        for detection in detections:
            disease_name = detection.get('class_name', '')
            confidence = detection.get('confidence', 0.0)
            
            # Only include actual diseases (not healthy plants)
            if 'healthy' not in disease_name.lower() and 'normal' not in disease_name.lower():
                # Keep only the highest confidence for each disease
                if disease_name not in disease_dict or confidence > disease_dict[disease_name]:
                    disease_dict[disease_name] = confidence
        
        # Convert dict to lists
        disease_names = list(disease_dict.keys())
        confidence_scores = list(disease_dict.values())
        highest_confidence = max(confidence_scores) if confidence_scores else 0.0
        
        # If no diseases found (all healthy), don't create alert
        if not disease_names:
            return None, None, [], []
        
        # Determine alert type and severity
        disease_count = len(disease_names)
        if disease_count > 1:
            alert_type = "multiple_diseases"
            severity = "high"
        elif highest_confidence > 0.8:
            alert_type = "severe_disease" 
            severity = "high"
        else:
            alert_type = "disease_detected"
            severity = "medium"
        
        return alert_type, severity, disease_names, confidence_scores
    
    print("Testing Detection Alert Creation Logic")
    print("=" * 50)
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\nTest {i}: {test_case['name']}")
        print(f"Input detections: {len(test_case['detections'])} items")
        
        alert_type, severity, disease_names, confidence_scores = determine_alert_params(test_case['detections'])
        
        print(f"Expected: {test_case['expected_alert_type']} / {test_case['expected_severity']}")
        print(f"Actual:   {alert_type} / {severity}")
        
        if test_case['expected_alert_type'] is None:
            success = alert_type is None
        else:
            success = (alert_type == test_case['expected_alert_type'] and 
                      severity == test_case['expected_severity'])
        
        print(f"Result:   {'✅ PASS' if success else '❌ FAIL'}")
        
        if disease_names:
            print(f"Diseases: {', '.join(disease_names)}")
            print(f"Confidences: {[f'{c:.2f}' for c in confidence_scores]}")
    
    print("\n" + "=" * 50)
    print("Alert creation logic test completed!")

if __name__ == "__main__":
    test_alert_creation_logic()
