"""
Multi-dialect and multi-language configuration system
Supports regional Bangla variations (Sylheti, Chittagonian, Noakhailla) and extensible to any language
"""

from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum


class LanguageCode(str, Enum):
    """Supported language codes"""
    BENGALI_STANDARD = "bn"
    BENGALI_SYLHETI = "bn-syl"
    BENGALI_CHITTAGONIAN = "bn-ctg"
    BENGALI_NOAKHAILLA = "bn-noa"
    BENGALI_RANGPURI = "bn-ran"
    ENGLISH = "en"
    HINDI = "hi"
    URDU = "ur"
    AUTO = "auto"


class RegionCode(str, Enum):
    """Bangladesh regions with dialect associations"""
    SYLHET = "sylhet"
    CHITTAGONG = "chittagong"
    NOAKHALI = "noakhali"
    RANGPUR = "rangpur"
    DHAKA = "dhaka"
    KHULNA = "khulna"
    RAJSHAHI = "rajshahi"
    BARISAL = "barisal"
    MYMENSINGH = "mymensingh"


@dataclass
class DialectInfo:
    """Information about a specific dialect"""
    code: str
    name: str
    native_name: str
    base_language: str
    region: Optional[str] = None
    iso_code: Optional[str] = None
    writing_system: str = "bengali_script"
    tts_supported: bool = False
    stt_supported: bool = False


class LanguageConfig:
    """Central configuration for all language and dialect support"""
    
    # Dialect definitions
    DIALECTS: Dict[str, DialectInfo] = {
        "bn": DialectInfo(
            code="bn",
            name="Standard Bengali",
            native_name="প্রমিত বাংলা",
            base_language="bn",
            iso_code="ben",
            tts_supported=True,
            stt_supported=True
        ),
        "bn-syl": DialectInfo(
            code="bn-syl",
            name="Sylheti",
            native_name="ꠍꠤꠟꠐꠤ / সিলেটি",
            base_language="bn",
            region="sylhet",
            iso_code="syl",
            writing_system="sylheti_nagri",
            tts_supported=False,
            stt_supported=False
        ),
        "bn-ctg": DialectInfo(
            code="bn-ctg",
            name="Chittagonian",
            native_name="চাটগাঁইয়া / চট্টগ্রামী",
            base_language="bn",
            region="chittagong",
            iso_code="ctg",
            tts_supported=False,
            stt_supported=False
        ),
        "bn-noa": DialectInfo(
            code="bn-noa",
            name="Noakhailla",
            native_name="নোয়াখাইল্লা",
            base_language="bn",
            region="noakhali",
            tts_supported=False,
            stt_supported=False
        ),
        "bn-ran": DialectInfo(
            code="bn-ran",
            name="Rangpuri",
            native_name="রংপুরী",
            base_language="bn",
            region="rangpur",
            tts_supported=False,
            stt_supported=False
        ),
        "en": DialectInfo(
            code="en",
            name="English",
            native_name="English",
            base_language="en",
            iso_code="eng",
            writing_system="latin",
            tts_supported=True,
            stt_supported=True
        ),
        "hi": DialectInfo(
            code="hi",
            name="Hindi",
            native_name="हिन्दी",
            base_language="hi",
            iso_code="hin",
            writing_system="devanagari",
            tts_supported=True,
            stt_supported=True
        ),
        "ur": DialectInfo(
            code="ur",
            name="Urdu",
            native_name="اردو",
            base_language="ur",
            iso_code="urd",
            writing_system="arabic",
            tts_supported=True,
            stt_supported=False
        ),
    }
    
    # Dialect-specific vocabulary mappings (ENHANCED)
    DIALECT_VOCABULARY: Dict[str, Dict[str, str]] = {
        # Sylheti dialect mappings to Standard Bengali (COMPREHENSIVE)
        "bn-syl": {
            # Pronouns
            "আঁই": "আমি", "মুই": "আমি", "আমি": "আমি",
            "তুঁই": "তুমি", "তুমি": "তুমি", "আপনে": "আপনি",
            "হুনু": "তিনি", "তাঁই": "তিনি", "উনু": "তিনি",
            "আমরা": "আমরা", "তোমরা": "তোমরা",
            "আঁর": "আমার", "মোর": "আমার", "আমার": "আমার",
            "তোর": "তোমার", "তোমার": "তোমার",
            "আন্নে": "আপনি", "আন্নের": "আপনার",
            
            # Common verbs
            "আইন": "আসুন", "আইও": "এসো", "আইছি": "এসেছি", "আইছে": "এসেছে",
            "গেইন": "যান", "গেইও": "যাও", "গইছি": "গেছি", "গইছে": "গেছে",
            "খাইন": "খান", "খাইও": "খাও", "খাইছি": "খেয়েছি", "খাইছে": "খেয়েছে",
            "দিইন": "দিন", "দিও": "দাও", "দিছি": "দিয়েছি", "দিছে": "দিয়েছে",
            "লইন": "নিন", "লও": "নাও", "লইছি": "নিয়েছি", "লইছে": "নিয়েছে",
            "করইন": "করুন", "করো": "করো", "করছি": "করছি", "করছে": "করছে",
            "দেখইন": "দেখুন", "দেখো": "দেখো", "দেখছি": "দেখছি", "দেখছে": "দেখছে",
            "অইল": "হলো", "অইছে": "হয়েছে", "অইবে": "হবে", "অইতেছে": "হচ্ছে",
            "আছইন": "আছেন", "আছো": "আছো", "আছি": "আছি", "আছে": "আছে",
            "যাইন": "যান", "যাও": "যাও", "যাইছি": "গিয়েছি", "যাইবো": "যাবো",
            "বইলছি": "বলেছি", "বইলছে": "বলেছে", "বলইন": "বলুন",
            "কইছি": "বলেছি", "কইছে": "বলেছে", "কও": "বলো",
            "জানইন": "জানুন", "জানো": "জানো", "জানি": "জানি",
            "পারমু": "পারবো", "পারবেন": "পারবেন", "পারে": "পারে",
            "লাইছেন": "লাগিয়েছেন", "লাগাইছেন": "লাগিয়েছেন", "লাইছি": "লাগিয়েছি",
            "লাগাও": "লাগাও", "লাগাইন": "লাগান", "লাগাইবো": "লাগাবো",
            
            # Question words
            "কী": "কী", "কি": "কি", "কেমনে": "কেমন", "কেন": "কেন",
            "কুনো": "কোথায়", "কুন": "কোন", "কার": "কার",
            "কখন": "কখন", "কেনে": "কেন",
            
            # Time & Place
            "আইজ": "আজ", "কাইল": "কাল", "কালকা": "কাল",
            "এখন": "এখন", "হুন": "এখন", "এহন": "এখন",
            "ওইখানে": "ওখানে", "এইখানে": "এখানে",
            "বাইর": "বাইরে", "ভিতর": "ভিতরে",
            
            # Agricultural terms
            "খইত": "ক্ষেত", "ক্ষেত": "ক্ষেত", "জমি": "জমি", "জমিন": "জমি", "জমিনে": "জমিতে",
            "দান": "ধান", "ধান": "ধান", "আউশ": "আউশ ধান",
            "আমন": "আমন", "বোরো": "বোরো",
            "বিয়ান": "বীজ", "বীজ": "বীজ",
            "ফছল": "ফসল", "ফসল": "ফসল", "ফঅল": "ফসল",
            "হাল": "লাঙ্গল", "লাঙ্গল": "লাঙ্গল",
            "গরু": "গরু", "মহিষ": "মহিষ",
            "পানি": "পানি", "ফানি": "পানি",
            "সার": "সার", "কীটনাশক": "কীটনাশক",
            "রোগ": "রোগ", "পোকা": "পোকা",
            "গাছ": "গাছ", "গাছ-পালা": "গাছ",
            
            # Vegetables & Crops
            "আলু": "আলু", "বেগুন": "বেগুন", "টমেটো": "টমেটো",
            "মরিচ": "মরিচ", "পেঁয়াজ": "পেঁয়াজ", "রসুন": "রসুন",
            "লাউ": "লাউ", "কুমড়া": "কুমড়া", "শিম": "শিম",
            
            # Common adjectives
            "ভাল": "ভালো", "ভালা": "ভালো", "নিক": "ভালো",
            "খারাপ": "খারাপ", "বেয়া": "খারাপ",
            "বড়": "বড়", "বড়া": "বড়", "ছোট": "ছোট", "ছোটা": "ছোট",
            "নতুন": "নতুন", "পুরান": "পুরানো",
            
            # Weather
            "বৃষ্টি": "বৃষ্টি", "রোদ": "রোদ", "গরম": "গরম",
            "ঠান্ডা": "ঠান্ডা", "ঠাণ্ডা": "ঠান্ডা",
            
            # Numbers (common)
            "এক্": "এক", "দুই": "দুই", "তিন": "তিন",
            "চাইর": "চার", "পাঁচ": "পাঁচ",
            
            # Common phrases (multi-word expressions)
            "কেমন আছন": "কেমন আছেন",
            "কেমন আছো": "কেমন আছো",
            "কি অবস্থা": "কি অবস্থা",
            "কি অইছে": "কি হয়েছে",
            "কি করমু": "কি করবো",
            "কুনো যামু": "কোথায় যাবো",
            "কুনো আছো": "কোথায় আছো",
            "হুন আছো": "এখন আছো",
            "মোর খইত": "আমার ক্ষেত",
            "তোমার খইত": "তোমার ক্ষেত",
            "দেখমু পারবেন": "দেখবেন পারবেন",
            "কি সমস্যা অছে": "কি সমস্যা আছে",
            "সমস্যা অছে": "সমস্যা আছে",
        },
        
        # Chittagonian dialect mappings (COMPREHENSIVE)
        "bn-ctg": {
            # Pronouns
            "আই": "আমি", "হামু": "আমরা", "আঁই": "আমি",
            "তুই": "তুমি", "তুঁই": "তুমি", "তুয়ারা": "তোমরা",
            "হুনু": "তিনি", "তাঁরা": "তারা", "উনু": "তিনি",
            "আঁর": "আমার", "মোর": "আমার", "হামার": "আমাদের",
            "তোর": "তোমার", "তোয়ার": "তোমার",
            "আন্নে": "আপনি", "আন্নের": "আপনার",
            
            # Common verbs
            "আইয়ের": "এসেছি", "আইছি": "এসেছি", "আসছি": "আসছি",
            "যামু": "যাবো", "যাইয়ের": "গিয়েছি", "গেয়ের": "গিয়েছি",
            "খামু": "খাবো", "খাইয়ের": "খেয়েছি", "খাইছি": "খেয়েছি",
            "করমু": "করবো", "গরছি": "করছি", "গইর্যা": "করে",
            "দিমু": "দেবো", "দিয়ের": "দিয়েছি", "দিছি": "দিয়েছি",
            "লমু": "নেবো", "লইয়ের": "নিয়েছি", "নিছি": "নিয়েছি",
            "দেখমু": "দেখবো", "দেখছি": "দেখছি", "দেহি": "দেখি",
            "অইছে": "হয়েছে", "অয়ের": "হয়েছে", "অইবো": "হবো",
            "আছরে": "আছে", "আছি": "আছি", "আছো": "আছো",
            "বলছি": "বলছি", "গইয়ুম": "বলেছি", "গও": "বলো",
            "জানি": "জানি", "জানো": "জানো", "জানরে": "জানে",
            "পারমু": "পারবো", "পারি": "পারি", "পারে": "পারে",
            "লাইছেন": "লাগিয়েছেন", "লাগাইছেন": "লাগিয়েছেন", "লাইছি": "লাগিয়েছি",
            "লাগামু": "লাগাবো", "লাগাও": "লাগাও",
            
            # Question words
            "কী": "কী", "কি": "কি", "কেমনে": "কেমন", "কিতা": "কেমন",
            "কুনো": "কোথায়", "কুন": "কোন", "হুন": "কোন",
            "কার": "কার", "কেনে": "কেন", "কারণে": "কেন",
            
            # Time & Place
            "আইজ": "আজ", "আজ্জ": "আজ", "আইজকা": "আজকে",
            "কাল": "কাল", "কালকা": "কালকে", "গালকা": "কালকে",
            "এহন": "এখন", "এইহন": "এখন", "অহন": "এখন",
            "ওইগানে": "ওখানে", "এইগানে": "এখানে",
            "বাইরে": "বাইরে", "ভিতরে": "ভিতরে",
            
            # Agricultural terms
            "ক্ষ্যাত": "ক্ষেত", "খ্যাত": "ক্ষেত", "জমি": "জমি", "জমিন": "জমি", "জমিনে": "জমিতে",
            "দান": "ধান", "ধান": "ধান", "আঁউশ": "আউশ ধান",
            "আমন": "আমন", "বুরো": "বোরো",
            "বিয়ান": "বীজ", "বিআন": "বীজ",
            "ফছল": "ফসল", "ফসল": "ফসল", "ফঅল": "ফসল",
            "লাঙ্গল": "লাঙ্গল", "হাল": "লাঙ্গল",
            "গরু": "গরু", "মোষ": "মহিষ",
            "ফানি": "পানি", "পানি": "পানি",
            "শার": "সার", "সার": "সার",
            "রোগ": "রোগ", "পোকা": "পোকা", "ফোকা": "পোকা",
            "গাছ": "গাছ", "গাছ-গাছড়া": "গাছপালা",
            
            # Vegetables & Crops
            "আলু": "আলু", "বেগুন": "বেগুন", "টমেটু": "টমেটো",
            "মরিস": "মরিচ", "মরিচ": "মরিচ", "পিঁয়াজ": "পেঁয়াজ",
            "রহুন": "রসুন", "লাউ": "লাউ", "কুমরা": "কুমড়া",
            
            # Common adjectives
            "ভালা": "ভালো", "বেটার": "ভালো", "নিক": "ভালো",
            "বেয়া": "খারাপ", "খারাপ": "খারাপ",
            "বড়": "বড়", "ছুট": "ছোট", "ছোট": "ছোট",
            "নুয়া": "নতুন", "পুরান": "পুরানো",
            
            # Weather
            "বিরিষ্টি": "বৃষ্টি", "বৃষ্টি": "বৃষ্টি",
            "রোদ": "রোদ", "গরম": "গরম",
            "ঠান্ডা": "ঠান্ডা", "শীত": "শীত",
            
            # Common words
            "বাজার": "বাজার", "টাকা": "টাকা", "পয়সা": "পয়সা",
            "ঘর": "ঘর", "বাড়ি": "বাড়ি",
            
            # Common phrases (multi-word expressions)
            "কেমনে আছ": "কেমন আছো",
            "কি অবস্থা": "কি অবস্থা",
            "কি অইছে": "কি হয়েছে",
            "কি করমু": "কি করবো",
            "কুনো যামু": "কোথায় যাবো",
            "আই কুনো যামু": "আমি কোথায় যাবো",
            "তুই কুনো যাইবি": "তুমি কোথায় যাবে",
            "মোর ক্ষ্যাত": "আমার ক্ষেত",
            "তোর ক্ষ্যাত": "তোমার ক্ষেত",
            "দেখমু পারবা": "দেখবো পারবো",
            "কি সমস্যা আছরে": "কি সমস্যা আছে",
        },
        
        # Noakhailla dialect mappings (COMPREHENSIVE)
        "bn-noa": {
            # Pronouns
            "আই": "আমি", "আঁই": "আমি", "মুই": "আমি",
            "তুই": "তুমি", "তুঁই": "তুমি", "আফনে": "আপনি",
            "হুনু": "তিনি", "উনু": "তিনি", "তিনি": "তিনি",
            "আঁর": "আমার", "মোর": "আমার", "আমার": "আমার",
            "তোর": "তোমার", "তোমার": "তোমার",
            "আন্নে": "আপনি", "আন্নের": "আপনার",
            
            # Common verbs
            "আইন": "আসুন", "আইও": "এসো", "আইছি": "এসেছি",
            "গেইন": "যান", "যাইন": "যান", "গইছি": "গেছি",
            "খাইন": "খান", "খাইও": "খাও", "খাইছি": "খেয়েছি",
            "করইন": "করুন", "করছি": "করছি", "করছো": "করছো",
            "দিইন": "দিন", "দিছি": "দিয়েছি", "দিও": "দাও",
            "লইন": "নিন", "লও": "নাও", "লইছি": "নিয়েছি",
            "দেখইন": "দেখুন", "দেখছি": "দেখছি", "দেখো": "দেখো",
            "অইল": "হলো", "অইছে": "হয়েছে", "অইবে": "হবে",
            "আছইন": "আছেন", "আছি": "আছি", "আছে": "আছে",
            "বইলছি": "বলেছি", "কইলাম": "বললাম", "কও": "বলো",
            "জানি": "জানি", "জানো": "জানো", "জানইন": "জানুন",
            "পারমু": "পারবো", "পারি": "পারি", "পারে": "পারে",
            "লাইছেন": "লাগিয়েছেন", "লাগাইছেন": "লাগিয়েছেন", "লাইছি": "লাগিয়েছি",
            "লাগামু": "লাগাবো", "লাগাও": "লাগাও", "লাগাইন": "লাগান",
            
            # Question words
            "কী": "কী", "কি": "কি", "কেমনে": "কেমন",
            "কুনো": "কোথায়", "কুন": "কোন", "কোন": "কোন",
            "কার": "কার", "কেনে": "কেন", "কেন": "কেন",
            
            # Time & Place
            "আইজ": "আজ", "আজকা": "আজকে", "আজ": "আজ",
            "কাল": "কাল", "কালকা": "কালকে",
            "এহন": "এখন", "এইহন": "এখন", "হুন": "এখন",
            "ওইহানে": "ওখানে", "এইহানে": "এখানে",
            "বাইরে": "বাইরে", "ভিতরে": "ভিতরে",
            
            # Agricultural terms
            "ক্ষেইত": "ক্ষেত", "খেইত": "ক্ষেত", "জমি": "জমি", "জমিন": "জমি", "জমিনে": "জমিতে",
            "দান": "ধান", "ধান": "ধান", "আউশ": "আউশ",
            "আমন": "আমন", "বোরো": "বোরো",
            "বিয়ান": "বীজ", "বীজ": "বীজ",
            "ফসল": "ফসল", "ফছল": "ফসল", "ফঅল": "ফসল",
            "লাঙ্গল": "লাঙ্গল", "হাল": "লাঙ্গল",
            "গরু": "গরু", "মহিষ": "মহিষ",
            "পানি": "পানি", "ফানি": "পানি",
            "সার": "সার", "খাদ": "সার",
            "রোগ": "রোগ", "পোকা": "পোকা",
            "গাছ": "গাছ", "গাছ-পালা": "গাছপালা",
            
            # Vegetables & Crops
            "আলু": "আলু", "বেগুন": "বেগুন", "টমেটো": "টমেটো",
            "মরিচ": "মরিচ", "পেঁয়াজ": "পেঁয়াজ", "রসুন": "রসুন",
            "লাউ": "লাউ", "কুমড়া": "কুমড়া", "শিম": "শিম",
            
            # Common adjectives
            "ভাল": "ভালো", "ভালা": "ভালো", "নিক": "ভালো",
            "খারাপ": "খারাপ", "বেয়া": "খারাপ",
            "বড়": "বড়", "বড়া": "বড়", "ছোট": "ছোট",
            "নতুন": "নতুন", "পুরান": "পুরানো",
            
            # Weather
            "বৃষ্টি": "বৃষ্টি", "বিষ্টি": "বৃষ্টি",
            "রোদ": "রোদ", "গরম": "গরম",
            "ঠান্ডা": "ঠান্ডা", "শীত": "শীত",
            
            # Common words
            "বাজার": "বাজার", "টাকা": "টাকা", "পয়সা": "পয়সা",
            "ঘর": "ঘর", "বাড়ি": "বাড়ি", "গাঁও": "গ্রাম",
            
            # Common phrases (multi-word expressions)
            "কেমন আছো": "কেমন আছো",
            "কেমনে আছো": "কেমন আছো",
            "কি অবস্থা": "কি অবস্থা",
            "কি অইল": "কি হলো",
            "কি অইছে": "কি হয়েছে",
            "কি করমু": "কি করবো",
            "কুনো যামু": "কোথায় যাবো",
            "আই কুনো": "আমি কোথায়",
            "মোর ক্ষেইত": "আমার ক্ষেত",
            "তোর ক্ষেইত": "তোমার ক্ষেত",
            "দেখমু পারবো": "দেখবো পারবো",
            "কি সমস্যা আছে": "কি সমস্যা আছে",
        }
    }
    
    # Region to dialect mapping
    REGION_DIALECT_MAP: Dict[str, str] = {
        RegionCode.SYLHET: "bn-syl",
        RegionCode.CHITTAGONG: "bn-ctg",
        RegionCode.NOAKHALI: "bn-noa",
        RegionCode.RANGPUR: "bn-ran",
        RegionCode.DHAKA: "bn",
        RegionCode.KHULNA: "bn",
        RegionCode.RAJSHAHI: "bn",
        RegionCode.BARISAL: "bn",
        RegionCode.MYMENSINGH: "bn",
    }
    
    # Agricultural terminology across dialects
    AGRICULTURAL_TERMS: Dict[str, Dict[str, str]] = {
        "bn": {
            "rice": "ধান",
            "wheat": "গম",
            "corn": "ভুট্টা",
            "field": "ক্ষেত",
            "seed": "বীজ",
            "fertilizer": "সার",
            "pesticide": "কীটনাশক",
            "irrigation": "সেচ",
            "farmer": "কৃষক",
            "crop": "ফসল",
            "harvest": "ফসল কাটা",
            "plant": "রোপণ",
            "soil": "মাটি",
            "water": "পানি",
            "rain": "বৃষ্টি",
            "drought": "খরা",
            "flood": "বন্যা",
        },
        "bn-syl": {
            "rice": "দান",
            "wheat": "গম",
            "corn": "ভুট্টা",
            "field": "খইত",
            "seed": "বিয়ান",
            "fertilizer": "সার",
            "pesticide": "কীটনাশক",
            "irrigation": "ফানি দেওয়া",
            "farmer": "কৃষক",
            "crop": "ফছল",
        },
        "bn-ctg": {
            "rice": "দান",
            "wheat": "গম",
            "corn": "ভুট্টা",
            "field": "ক্ষ্যাত",
            "seed": "বিয়ান",
            "fertilizer": "সার",
            "farmer": "কিষাণ",
            "crop": "ফছল",
        },
        "en": {
            "rice": "rice",
            "wheat": "wheat",
            "corn": "corn",
            "field": "field",
            "seed": "seed",
            "fertilizer": "fertilizer",
            "pesticide": "pesticide",
            "irrigation": "irrigation",
            "farmer": "farmer",
            "crop": "crop",
        }
    }
    
    # Language detection patterns (ENHANCED for better accuracy)
    DETECTION_PATTERNS: Dict[str, List[str]] = {
        "bn-syl": [
            # Unique Sylheti markers
            "আইন", "আইও", "আইছি", "আইছে",
            "গেইন", "গইছে", "গইছি",
            "খাইন", "খাইও", "খাইছি",
            "অইল", "অইছে", "অইবে",
            "আছইন", "আছো",
            "খইত", "ফছল", "বিয়ান", "ফানি", "ফঅল",
            "দান", "হাল", "জমিন", "জমিনে",
            "আঁই", "মুই", "তুঁই", "হুনু", "আঁর", "মোর", "আন্নে",
            "কুনো", "কুন", "এহন", "হুন",
            "দিইন", "লইন", "করইন",
            "বইলছি", "কইছি",
            "লাইছেন", "লাগাইছেন", "লাইছি",
            "আইজ", "কাইল", "কালকা",
            "ওইখানে", "এইখানে",
        ],
        "bn-ctg": [
            # Unique Chittagonian markers
            "আই", "হামু",
            "তুই", "তুঁই", "তুয়ারা",
            "হুনু", "উনু",
            "আইয়ের", "গেয়ের", "অয়ের",
            "যামু", "খামু", "করমু", "দিমু",
            "আছরে", "দেখমু",
            "ক্ষ্যাত", "খ্যাত",
            "বিয়ান", "বিআন",
            "ফানি", "শার", "মোষ", "ফঅল",
            "আঁর", "মোর", "তোর", "আন্নে", "জমিন", "জমিনে",
            "লাইছেন", "লাগাইছেন", "লাইছি",
            "আইজ", "আজ্জ", "কালকা", "গালকা",
            "এহন", "এইহন", "অহন",
            "ওইগানে", "এইগানে",
            "কুনো", "হুন", "কিতা",
            "গরছি", "গইর্যা",
            "বিরিষ্টি", "টমেটু", "পিঁয়াজ",
            "ভালা", "বেয়া", "নুয়া", "ছুট",
            "গইয়ুম", "গও",
        ],
        "bn-noa": [
            # Unique Noakhailla markers
            "আইন", "আইও", "আইছি",
            "গেইন", "যাইন", "গইছি",
            "খাইন", "খাইও", "খাইছি",
            "করইন", "করছি", "করছো",
            "দিইন", "দিছি", "লইন", "লইছি",
            "অইল", "অইছে", "অইবে",
            "আছইন", "আছি",
            "ক্ষেইত", "খেইত",
            "বিয়ান", "ফানি",
            "আই", "আঁই", "মুই",
            "তুই", "তুঁই", "আফনে",
            "বইলছি", "কইলাম", "কও",
            "আইজ", "আজকা", "কালকা",
            "এহন", "এইহন", "হুন",
            "ওইহানে", "এইহানে",
            "বিষ্টি", "গাঁও",
        ],
        "bn-ran": [
            # Unique Rangpuri markers
            "মুই", "তুই", "উ",
            "করতাছি", "আইতেছি", "যাইতেছি",
            "খাইতেছি", "দেখতেছি",
            "খেত", "বিআন",
        ],
        "bn": [
            # Standard Bengali markers
            "আমি", "তুমি", "আপনি", "তিনি", "সে",
            "আসুন", "যান", "করুন",
            "ক্ষেত", "ধান", "বীজ", "ফসল",
            "এখন", "আজ", "কাল",
            "এখানে", "ওখানে",
        ],
        "en": [
            # English markers
            "i", "you", "we", "they",
            "field", "rice", "crop", "farmer",
            "weather", "rain", "water",
            "today", "now", "here",
        ],
    }
    
    @classmethod
    def get_dialect_info(cls, dialect_code: str) -> Optional[DialectInfo]:
        """Get information about a specific dialect"""
        return cls.DIALECTS.get(dialect_code)
    
    @classmethod
    def get_base_language(cls, dialect_code: str) -> str:
        """Get the base language for a dialect"""
        dialect = cls.DIALECTS.get(dialect_code)
        return dialect.base_language if dialect else "bn"
    
    @classmethod
    def get_dialect_by_region(cls, region: str) -> str:
        """Get the primary dialect for a region"""
        return cls.REGION_DIALECT_MAP.get(region, "bn")
    
    @classmethod
    def normalize_to_standard(cls, text: str, source_dialect: str) -> str:
        """
        Normalize dialect text to standard Bengali
        Uses word-boundary matching for accurate replacement
        """
        if source_dialect not in cls.DIALECT_VOCABULARY:
            return text
        
        normalized = text
        vocabulary = cls.DIALECT_VOCABULARY[source_dialect]
        
        # Sort by length (longest first) to handle multi-word expressions
        sorted_vocab = sorted(vocabulary.items(), key=lambda x: len(x[0]), reverse=True)
        
        # Replace dialect-specific words with standard Bengali using word boundaries
        import re
        for dialect_word, standard_word in sorted_vocab:
            # Use word boundary for better matching
            pattern = r'\b' + re.escape(dialect_word) + r'\b'
            normalized = re.sub(pattern, standard_word, normalized, flags=re.IGNORECASE)
        
        return normalized
    
    @classmethod
    def translate_agricultural_term(
        cls,
        term: str,
        from_dialect: str,
        to_dialect: str
    ) -> str:
        """Translate agricultural terms between dialects"""
        # Get English equivalent first
        from_terms = cls.AGRICULTURAL_TERMS.get(from_dialect, {})
        english_term = None
        
        for eng, local in from_terms.items():
            if local.lower() == term.lower():
                english_term = eng
                break
        
        if not english_term:
            return term
        
        # Translate to target dialect
        to_terms = cls.AGRICULTURAL_TERMS.get(to_dialect, {})
        return to_terms.get(english_term, term)
    
    @classmethod
    def is_dialect_supported(cls, dialect_code: str) -> bool:
        """Check if a dialect is supported"""
        return dialect_code in cls.DIALECTS
    
    @classmethod
    def get_all_bengali_dialects(cls) -> List[str]:
        """Get all Bengali dialect codes"""
        return [
            code for code, info in cls.DIALECTS.items()
            if info.base_language == "bn"
        ]
    
    @classmethod
    def get_supported_languages(cls) -> List[Dict[str, Any]]:
        """Get all supported languages and dialects"""
        return [
            {
                "code": code,
                "name": info.name,
                "native_name": info.native_name,
                "base_language": info.base_language,
                "region": info.region,
                "tts_supported": info.tts_supported,
                "stt_supported": info.stt_supported,
            }
            for code, info in cls.DIALECTS.items()
        ]


# Global configuration instance
language_config = LanguageConfig()
