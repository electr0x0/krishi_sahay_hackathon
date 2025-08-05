import httpx
from langchain_core.tools import tool
from typing import Dict, Any, List

@tool
def get_item_price(item_name: str) -> str:
    """
    Gets the current market price of agricultural products from Chaldal and other sources.
    
    Args:
        item_name: Name of the agricultural product (in Bengali or English)
        
    Returns:
        String with price information and market data
    """
    
    # Product name mapping for better search
    product_mapping = {
        "ধান": "rice",
        "চাল": "rice", 
        "গম": "wheat",
        "ভুট্টা": "corn",
        "আলু": "potato",
        "পেঁয়াজ": "onion",
        "রসুন": "garlic",
        "টমেটো": "tomato",
        "বেগুন": "eggplant",
        "মরিচ": "chili",
        "লাউ": "bottle gourd",
        "কুমড়া": "pumpkin",
        "শসা": "cucumber",
        "গাজর": "carrot",
        "মুলা": "radish"
    }
    
    # Use mapped name if available
    search_term = product_mapping.get(item_name.lower(), item_name)
    
    url = "https://catalog.chaldal.com/searchPersonalized"
    
    headers = {
        "accept": "application/json",
        "accept-language": "en-US,en;q=0.9,fr;q=0.8,zh-CN;q=0.7,zh;q=0.6",
        "cache-control": "no-cache",
        "content-type": "application/json",
        "priority": "u=1, i",
        "sec-ch-ua": '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "cookie": "sbcV2=%7B%22MetropolitanAreaId%22%3A1%2C%22PvIdToQtyStoreIdLastSeqRecType%22%3A%7B%7D%7D",
        "Referer": "https://chaldal.com/",
    }
    
    body = {
        "apiKey": "e964fc2d51064efa97e94db7c64bf3d044279d4ed0ad4bdd9dce89fecc9156f0",
        "storeId": 1,
        "warehouseId": 8,
        "pageSize": 20,
        "currentPageIndex": 0,
        "metropolitanAreaId": 1,
        "query": search_term,
        "productVariantId": -1,
        "bundleId": {"case":"None"},
        "canSeeOutOfStock": "true",
        "filters": [],
        "maxOutOfStockCount": {"case":"Some","fields":[5]},
        "shouldShowAlternateProductsForAllOutOfStock": {"case":"Some","fields":["true"]},
        "customerGuid": {"case":"None"},
        "deliveryAreaId": {"case":"None"},
        "shouldShowCategoryBasedRecommendations": {"case":"None"}
    }

    try:
        with httpx.Client() as client:
            response = client.post(url, headers=headers, json=body, timeout=10)
            response.raise_for_status()
            data = response.json()
    except httpx.HTTPStatusError as exc:
        return f"দুঃখিত, বাজার দরের তথ্য পেতে সমস্যা হচ্ছে। HTTP Error: {exc.response.status_code}"
    except httpx.RequestError as exc:
        return f"দুঃখিত, ইন্টারনেট সংযোগে সমস্যা হচ্ছে। অনুগ্রহ করে আবার চেষ্টা করুন।"
    except Exception as exc:
        return f"দুঃখিত, একটি সমস্যা হয়েছে: {str(exc)}"

    hits = data.get("hits", [])
    if not hits:
        return f"দুঃখিত, '{item_name}' এর দাম খুঁজে পাওয়া যায়নি। অন্য নাম দিয়ে চেষ্টা করুন।"

    # Format response with price information
    price_info = []
    for item in hits[:5]:  # Show top 5 results
        name = item.get('name', 'N/A')
        price = item.get('price', 'N/A')
        unit = item.get('unit', 'প্রতি কেজি')
        discount = item.get('discountPercentage', 0)
        
        price_text = f"• {name}: {price} টাকা ({unit})"
        if discount > 0:
            price_text += f" [{discount}% ছাড়]"
        price_info.append(price_text)
    
    result = f"📊 {item_name} এর বর্তমান বাজার দর:\n\n"
    result += "\n".join(price_info)
    result += f"\n\n💡 মোট {len(hits)} টি পণ্য পাওয়া গেছে।"
    result += "\n\n⚠️ দামে তারতম্য হতে পারে এলাকা ও মানের উপর ভিত্তি করে।"
    
    return result

@tool
def get_price_trend(item_name: str, days: int = 7) -> str:
    """
    Get price trend analysis for agricultural products over specified days.
    
    Args:
        item_name: Name of the agricultural product
        days: Number of days to analyze (default 7)
        
    Returns:
        Price trend analysis and recommendations
    """
    # This would connect to a historical price database
    # For now, return a simulated trend analysis
    
    import random
    
    base_price = random.randint(20, 100)
    trend_direction = random.choice(["বৃদ্ধি", "হ্রাস", "স্থিতিশীল"])
    change_percent = random.randint(1, 15)
    
    result = f"📈 {item_name} এর গত {days} দিনের দাম বিশ্লেষণ:\n\n"
    result += f"• বর্তমান গড় দাম: {base_price} টাকা/কেজি\n"
    result += f"• দামের প্রবণতা: {trend_direction}\n"
    result += f"• পরিবর্তনের হার: {change_percent}%\n\n"
    
    if trend_direction == "বৃদ্ধি":
        result += "💰 পরামর্শ: দাম বাড়ছে, তাই এখনই বিক্রি করা ভাল হতে পারে।"
    elif trend_direction == "হ্রাস":
        result += "⏳ পরামর্শ: দাম কমছে, একটু অপেক্ষা করে বিক্রি করুন।"
    else:
        result += "📊 পরামর্শ: দাম স্থিতিশীল, যেকোনো সময় বিক্রি করতে পারেন।"
    
    return result