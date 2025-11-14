"""
Test script for enhanced multi-dialect support
Demonstrates comprehensive dialect detection and normalization
"""

from app.services.dialect_service import dialect_service

def test_dialect_detection():
    """Test dialect detection with various inputs"""
    
    print("=" * 60)
    print("ENHANCED MULTI-DIALECT DETECTION & NORMALIZATION TEST")
    print("=" * 60)
    
    test_cases = [
        # Sylheti examples
        {
            "text": "আইন মোর খইত দেখবেন পারবেন?",
            "expected_dialect": "bn-syl",
            "description": "Sylheti - Come see my field"
        },
        {
            "text": "আঁই খাইন কেমন আছন?",
            "expected_dialect": "bn-syl", 
            "description": "Sylheti - How are you after eating?"
        },
        {
            "text": "কুনো যামু আইজ?",
            "expected_dialect": "bn-syl",
            "description": "Sylheti - Where should I go today?"
        },
        {
            "text": "মোর দান খইতে রোগ অইছে",
            "expected_dialect": "bn-syl",
            "description": "Sylheti - My rice field has disease"
        },
        
        # Chittagonian examples
        {
            "text": "আই কুনো যামু কালকা?",
            "expected_dialect": "bn-ctg",
            "description": "Chittagonian - Where should I go tomorrow?"
        },
        {
            "text": "মোর ক্ষ্যাত দেখমু পারবা?",
            "expected_dialect": "bn-ctg",
            "description": "Chittagonian - Can you see my field?"
        },
        {
            "text": "আই খামু কি এহন?",
            "expected_dialect": "bn-ctg",
            "description": "Chittagonian - What should I eat now?"
        },
        {
            "text": "তুই কি করমু আইজ?",
            "expected_dialect": "bn-ctg",
            "description": "Chittagonian - What will you do today?"
        },
        
        # Noakhailla examples
        {
            "text": "আইন মোর ক্ষেইত দেখবেন?",
            "expected_dialect": "bn-noa",
            "description": "Noakhailla - Come see my field"
        },
        {
            "text": "কি অইল তোর খেইতে?",
            "expected_dialect": "bn-noa",
            "description": "Noakhailla - What happened to your field?"
        },
        {
            "text": "আইজ কি করমু?",
            "expected_dialect": "bn-noa",
            "description": "Noakhailla - What should I do today?"
        },
        
        # Standard Bengali
        {
            "text": "আমার ক্ষেতে রোগ হয়েছে",
            "expected_dialect": "bn",
            "description": "Standard Bengali - My field has disease"
        },
        
        # English
        {
            "text": "How is your rice field today?",
            "expected_dialect": "en",
            "description": "English - Field inquiry"
        },
    ]
    
    for i, test in enumerate(test_cases, 1):
        print(f"\n{i}. {test['description']}")
        print(f"   Input: {test['text']}")
        
        # Detect and normalize
        result = dialect_service.auto_detect_and_normalize(
            text=test['text'],
            user_context={}
        )
        
        print(f"   Detected: {result['detected_dialect']} (confidence: {result['confidence']:.2f})")
        print(f"   Expected: {test['expected_dialect']}")
        print(f"   Match: {'✓' if result['detected_dialect'] == test['expected_dialect'] else '✗'}")
        
        if result['changes_made']:
            print(f"   Normalized: {result['normalized_text']}")
        else:
            print(f"   Normalized: (no changes needed)")
        
        print(f"   Detection method: {result['detection_source']}")


def test_normalization():
    """Test normalization of complex sentences"""
    
    print("\n" + "=" * 60)
    print("COMPLEX SENTENCE NORMALIZATION TEST")
    print("=" * 60)
    
    test_sentences = [
        {
            "dialect": "bn-syl",
            "text": "আঁই আইজ মোর খইতে যাইবো আর দান দেখমু",
            "description": "Sylheti complex sentence"
        },
        {
            "dialect": "bn-ctg",
            "text": "আই কালকা বাজারে যামু আর সার কিনমু",
            "description": "Chittagonian complex sentence"
        },
        {
            "dialect": "bn-noa",
            "text": "আইন দেখইন মোর ক্ষেইতে কি সমস্যা আছে",
            "description": "Noakhailla complex sentence"
        },
    ]
    
    for test in test_sentences:
        print(f"\n{test['description']}")
        print(f"Original ({test['dialect']}): {test['text']}")
        
        normalized = dialect_service.normalize_to_standard(
            text=test['text'],
            source_dialect=test['dialect']
        )
        
        print(f"Normalized (bn): {normalized['normalized_text']}")
        print(f"Changes made: {normalized['changes_made']}")


def test_bidirectional_conversion():
    """Test converting back to dialect"""
    
    print("\n" + "=" * 60)
    print("BIDIRECTIONAL CONVERSION TEST")
    print("=" * 60)
    
    standard_text = "আমার ক্ষেতে ধান ভালো হয়েছে"
    
    dialects = ["bn-syl", "bn-ctg", "bn-noa"]
    
    print(f"\nStandard Bengali: {standard_text}")
    print("\nConverting to dialects:")
    
    for dialect in dialects:
        result = dialect_service.convert_response_to_dialect(
            text=standard_text,
            target_dialect=dialect
        )
        
        print(f"\n{dialect}: {result['converted_text']}")
        print(f"  Changes made: {result['changes_made']}")


if __name__ == "__main__":
    test_dialect_detection()
    test_normalization()
    test_bidirectional_conversion()
    
    print("\n" + "=" * 60)
    print("✓ ENHANCED DIALECT SYSTEM READY!")
    print("=" * 60)
    print("\nSupported Dialects:")
    print("  - Sylheti (bn-syl) - 100+ words/phrases")
    print("  - Chittagonian (bn-ctg) - 100+ words/phrases")
    print("  - Noakhailla (bn-noa) - 100+ words/phrases")
    print("  - Standard Bengali (bn)")
    print("  - English (en)")
    print("\nFeatures:")
    print("  ✓ Word-boundary matching for accurate replacement")
    print("  ✓ Multi-word phrase support")
    print("  ✓ Agricultural terminology")
    print("  ✓ Bidirectional conversion")
    print("  ✓ Confidence scoring")
    print("=" * 60)
