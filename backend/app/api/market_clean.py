from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random
import json
import httpx
import re

from app.database import get_db
from app.auth.dependencies import get_current_active_user
from app.models.user import User
from app.models.market import MarketPrice, MarketAlert
from app.schemas.market import MarketPrice as MarketPriceSchema, MarketPriceCreate, MarketAlert as MarketAlertSchema
from app.tools.pricing_tool import get_item_price, get_price_trend

# IMPORTANT: These market endpoints are for WEB UI only - NOT for chat tools or AI agents
# Do not expose these endpoints to automated systems or chat interfaces
EXCLUDE_FROM_CHAT_TOOLS = True

def get_comprehensive_chaldal_data():
    """Fetch comprehensive market data from Chaldal API"""
    
    # List of agricultural products to fetch
    agricultural_products = [
        {"bn": "ধান", "en": "rice", "category": "grain"},
        {"bn": "আলু", "en": "potato", "category": "vegetable"},
        {"bn": "পেঁয়াজ", "en": "onion", "category": "spice"},
        {"bn": "চাল", "en": "rice", "category": "grain"},
        {"bn": "টমেটো", "en": "tomato", "category": "vegetable"},
        {"bn": "বেগুন", "en": "eggplant", "category": "vegetable"},
        {"bn": "গাজর", "en": "carrot", "category": "vegetable"},
        {"bn": "শসা", "en": "cucumber", "category": "vegetable"},
        {"bn": "রসুন", "en": "garlic", "category": "spice"},
        {"bn": "মরিচ", "en": "chili", "category": "spice"},
        {"bn": "আদা", "en": "ginger", "category": "spice"},
        {"bn": "কলা", "en": "banana", "category": "fruit"},
        {"bn": "আম", "en": "mango", "category": "fruit"},
        {"bn": "লেবু", "en": "lemon", "category": "fruit"},
        {"bn": "পেঁপে", "en": "papaya", "category": "fruit"},
        {"bn": "ডাল", "en": "lentil", "category": "grain"},
        {"bn": "কাঁচা মরিচ", "en": "green chili", "category": "vegetable"},
        {"bn": "পালং শাক", "en": "spinach", "category": "vegetable"},
        {"bn": "ধনিয়া", "en": "cilantro", "category": "spice"}
    ]
    
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
    
    market_names = ["কারওয়ান বাজার", "শ্যামবাজার", "নিউ মার্কেট", "কাঁচা বাজার", "মৌলভীবাজার", "রায়ের বাজার"]
    comprehensive_prices = []
    
    for idx, product in enumerate(agricultural_products):
        try:
            body = {
                "apiKey": "e964fc2d51064efa97e94db7c64bf3d044279d4ed0ad4bdd9dce89fecc9156f0",
                "storeId": 1,
                "warehouseId": 8,
                "pageSize": 3,
                "currentPageIndex": 0,
                "metropolitanAreaId": 1,
                "query": product["en"],
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

            with httpx.Client() as client:
                response = client.post(url, headers=headers, json=body, timeout=10)
                response.raise_for_status()
                data = response.json()
                
                hits = data.get("hits", [])
                if hits:
                    # Take the first relevant product
                    item = hits[0]
                    
                    # Extract price and unit information
                    price = float(item.get('price', 0))
                    unit_text = item.get('unit', '').lower()
                    
                    # Calculate per kg price if the unit contains weight information
                    per_kg_price = price
                    if 'kg' in unit_text:
                        # Extract number from unit (e.g., "5 kg" -> 5, "10kg" -> 10)
                        weight_match = re.search(r'(\d+(?:\.\d+)?)\s*kg', unit_text)
                        if weight_match:
                            weight = float(weight_match.group(1))
                            if weight > 0:
                                per_kg_price = price / weight
                    elif 'gm' in unit_text or 'gram' in unit_text:
                        # Convert grams to kg
                        weight_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:gm|gram)', unit_text)
                        if weight_match:
                            weight_grams = float(weight_match.group(1))
                            if weight_grams > 0:
                                per_kg_price = price / (weight_grams / 1000)
                    
                    # Generate mock trend data
                    trends = ["up", "down", "stable"]
                    trend = random.choice(trends)
                    change_percentage = round(random.uniform(-15, 15), 1)
                    
                    # Choose random market name
                    market_name = random.choice(market_names)
                    
                    price_data = {
                        "id": idx + 1,
                        "product_name_bn": product["bn"],
                        "product_name_en": product["en"].title(),
                        "category": product["category"],
                        "unit": "kg",
                        "market_name": market_name,
                        "district": "ঢাকা",
                        "division": "ঢাকা",
                        "market_type": "retail",
                        "current_price": round(per_kg_price, 2),
                        "previous_price": round(per_kg_price * (1 - change_percentage/100), 2),
                        "price_change": round(per_kg_price * change_percentage/100, 2),
                        "price_change_percentage": change_percentage,
                        "trend": trend,
                        "data_source": "chaldal",
                        "reliability_score": 0.9,
                        "price_date": datetime.now(),
                        "created_at": datetime.now()
                    }
                    
                    comprehensive_prices.append(price_data)
                    
        except Exception as e:
            # If Chaldal API fails for a product, continue with others
            print(f"Failed to fetch {product['bn']}: {str(e)}")
            continue
    
    return comprehensive_prices

# AI Price Recommendation System (Mock implementation)
class AIPricingService:
    @staticmethod
    def get_price_recommendation(product_name: str, current_price: float, market_data: dict = None):
        """Generate AI-powered price recommendations"""
        base_adjustment = random.uniform(-0.15, 0.15)  # -15% to +15% adjustment
        seasonal_factor = random.uniform(0.95, 1.1)    # Seasonal adjustment
        market_sentiment = random.uniform(0.9, 1.15)   # Market sentiment
        
        suggested_price = current_price * (1 + base_adjustment) * seasonal_factor * market_sentiment
        confidence = random.uniform(70, 95)  # 70-95% confidence
        
        # Generate reasoning based on factors
        factors = []
        if base_adjustment > 0.05:
            factors.append("বাজারে চাহিদা বৃদ্ধি")
        elif base_adjustment < -0.05:
            factors.append("সরবরাহ বৃদ্ধি")
            
        if seasonal_factor > 1.05:
            factors.append("মৌসুমী প্রভাব ইতিবাচক")
        elif seasonal_factor < 0.95:
            factors.append("অফ-সিজন প্রভাব")
            
        if market_sentiment > 1.05:
            factors.append("বাজার অনুকূল")
        elif market_sentiment < 0.95:
            factors.append("বাজার চ্যালেঞ্জিং")
        
        reason = ", ".join(factors) if factors else "স্থিতিশীল বাজার অবস্থা"
        
        return {
            "product_name": product_name,
            "current_price": current_price,
            "suggested_price": round(suggested_price, 2),
            "confidence": round(confidence, 1),
            "price_change": round(suggested_price - current_price, 2),
            "price_change_percentage": round(((suggested_price - current_price) / current_price) * 100, 1),
            "reasoning": reason,
            "factors": {
                "demand_supply": base_adjustment,
                "seasonal": seasonal_factor - 1,
                "market_sentiment": market_sentiment - 1
            },
            "recommendation": "বিক্রয়ের জন্য উপযুক্ত" if suggested_price >= current_price else "দাম কমানোর বিবেচনা করুন",
            "updated_at": datetime.now().isoformat()
        }
    
    @staticmethod
    def get_market_forecast(product_name: str, days: int = 7):
        """Generate market forecast for the next few days"""
        forecast = []
        base_price = random.uniform(20, 100)
        
        for i in range(days):
            variation = random.uniform(-0.1, 0.1)  # Daily variation
            price = base_price * (1 + variation * (i + 1) * 0.1)
            
            forecast.append({
                "date": (datetime.now().date() + timedelta(days=i+1)).isoformat(),
                "predicted_price": round(price, 2),
                "confidence": round(random.uniform(60, 85), 1),
                "trend": "up" if variation > 0 else "down" if variation < 0 else "stable"
            })
        
        return forecast

router = APIRouter()

@router.get("/market/prices", response_model=List[MarketPriceSchema])
def get_market_prices(
    category: Optional[str] = Query(None, description="Product category filter"),
    district: Optional[str] = Query(None, description="District filter"),
    limit: int = Query(50, description="Maximum number of results"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get market prices for agricultural products - WEB UI ONLY - NOT FOR CHAT TOOLS"""
    
    query = db.query(MarketPrice)
    
    if category:
        query = query.filter(MarketPrice.category == category)
    
    if district:
        query = query.filter(MarketPrice.district == district)
    
    # Order by most recent first
    query = query.order_by(MarketPrice.price_date.desc())
    
    # Limit results
    prices = query.limit(limit).all()
    
    # If no data in database, fetch real data from Chaldal
    if not prices:
        try:
            # Try to get real data from Chaldal
            chaldal_data = get_comprehensive_chaldal_data()
            if chaldal_data:
                return chaldal_data[:limit]  # Return limited results
        except Exception as e:
            print(f"Failed to fetch from Chaldal: {str(e)}")
        
        # Fallback to empty if Chaldal completely fails
        return []
    
    return prices

@router.get("/market/prices/{item_name}")
def get_item_market_price(
    item_name: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current market price for a specific item - WEB UI ONLY - NOT FOR CHAT TOOLS"""
    
    try:
        price_data = get_item_price(item_name)
        
        return {
            "item_name": item_name,
            "price_info": price_data,
            "timestamp": datetime.now(),
            "source": "chaldal_api"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch price data: {str(e)}")

@router.get("/market/prices/{item_name}/trend")
def get_item_price_trend(
    item_name: str,
    days: int = Query(7, description="Number of days for trend analysis"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get price trend analysis for a specific item"""
    
    try:
        trend_data = get_price_trend(item_name, days)
        
        return {
            "item_name": item_name,
            "trend_analysis": trend_data,
            "days": days,
            "timestamp": datetime.now()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch trend data: {str(e)}")

@router.post("/market/prices", response_model=MarketPriceSchema)
def create_market_price(
    price_data: MarketPriceCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new market price entry (for admin users or data collection)"""
    
    # In a real implementation, you might want to check if user has admin privileges
    
    db_price = MarketPrice(
        product_name_bn=price_data.product_name_bn,
        product_name_en=price_data.product_name_en,
        category=price_data.category,
        unit=price_data.unit,
        market_name=price_data.market_name,
        district=price_data.district,
        division=price_data.division,
        market_type=price_data.market_type,
        current_price=price_data.current_price,
        price_date=price_data.price_date,
        data_source="user_input",
        reliability_score=0.6,
        created_at=datetime.now()
    )
    
    db.add(db_price)
    db.commit()
    db.refresh(db_price)
    
    return db_price

@router.get("/market/categories")
def get_market_categories(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get available product categories"""
    
    categories = [
        {"id": "grain", "name_bn": "খাদ্যশস্য", "name_en": "Grains"},
        {"id": "vegetable", "name_bn": "সবজি", "name_en": "Vegetables"},
        {"id": "fruit", "name_bn": "ফল", "name_en": "Fruits"},
        {"id": "spice", "name_bn": "মসলা", "name_en": "Spices"},
        {"id": "dairy", "name_bn": "দুগ্ধজাত", "name_en": "Dairy"},
        {"id": "fish", "name_bn": "মাছ", "name_en": "Fish"}
    ]
    
    return categories

@router.get("/market/districts")
def get_market_districts(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get available market districts"""
    
    districts = [
        {"id": "dhaka", "name_bn": "ঢাকা", "name_en": "Dhaka"},
        {"id": "chittagong", "name_bn": "চট্টগ্রাম", "name_en": "Chittagong"},
        {"id": "sylhet", "name_bn": "সিলেট", "name_en": "Sylhet"},
        {"id": "rajshahi", "name_bn": "রাজশাহী", "name_en": "Rajshahi"},
        {"id": "khulna", "name_bn": "খুলনা", "name_en": "Khulna"},
        {"id": "barishal", "name_bn": "বরিশাল", "name_en": "Barishal"},
        {"id": "rangpur", "name_bn": "রংপুর", "name_en": "Rangpur"},
        {"id": "mymensingh", "name_bn": "ময়মনসিংহ", "name_en": "Mymensingh"}
    ]
    
    return districts

@router.post("/market/ai-recommendation")
def get_ai_price_recommendation(
    product_name: str,
    current_price: float,
    unit: str = "kg",
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get AI-powered price recommendation - MANUAL USE ONLY - NOT FOR AUTOMATED TOOLS"""
    
    if current_price <= 0:
        raise HTTPException(status_code=400, detail="Price must be greater than 0")
    
    # Get market data for context
    market_data = {}
    try:
        similar_products = db.query(MarketPrice).filter(
            MarketPrice.product_name_bn.contains(product_name)
        ).limit(5).all()
        
        if similar_products:
            market_data = {
                "similar_products": [
                    {
                        "name": p.product_name_bn,
                        "price": p.current_price,
                        "trend": p.trend
                    } for p in similar_products
                ],
                "average_price": sum(p.current_price for p in similar_products) / len(similar_products)
            }
    except Exception as e:
        # Continue without market context if database query fails
        pass
    
    recommendation = AIPricingService.get_price_recommendation(
        product_name, current_price, market_data
    )
    
    return recommendation

@router.get("/market/ai-forecast/{product_name}")
def get_market_forecast(
    product_name: str,
    days: int = Query(7, ge=1, le=30, description="Number of days to forecast"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get AI-powered market forecast for a product"""
    
    forecast = AIPricingService.get_market_forecast(product_name, days)
    
    return {
        "product_name": product_name,
        "forecast_days": days,
        "forecast": forecast,
        "generated_at": datetime.now().isoformat()
    }

@router.get("/market/ai-insights")
def get_market_insights(
    category: Optional[str] = Query(None, description="Product category filter"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get AI-powered market insights - DASHBOARD ONLY - NOT FOR CHAT SYSTEM"""
    
    # Mock AI insights - in production, this would analyze real market data
    insights = {
        "market_sentiment": {
            "overall": random.choice(["bullish", "bearish", "neutral"]),
            "confidence": round(random.uniform(70, 90), 1),
            "description": "বর্তমান বাজার অবস্থা " + random.choice(["অনুকূল", "চ্যালেঞ্জিং", "স্থিতিশীল"])
        },
        "trending_products": [
            {
                "name": "ধান",
                "trend": "up",
                "change_percentage": round(random.uniform(5, 15), 1),
                "reason": "কাটাই মৌসুম শেষে চাহিদা বৃদ্ধি"
            },
            {
                "name": "টমেটো", 
                "trend": "down",
                "change_percentage": round(random.uniform(-15, -5), 1),
                "reason": "শীতকালীন সরবরাহ বৃদ্ধি"
            },
            {
                "name": "পেঁয়াজ",
                "trend": "up", 
                "change_percentage": round(random.uniform(8, 20), 1),
                "reason": "আমদানি হ্রাস ও স্থানীয় চাহিদা"
            }
        ],
        "price_predictions": {
            "next_week": {
                "direction": random.choice(["increase", "decrease", "stable"]),
                "confidence": round(random.uniform(65, 85), 1),
                "expected_change": round(random.uniform(-10, 10), 1)
            },
            "next_month": {
                "direction": random.choice(["increase", "decrease", "stable"]),
                "confidence": round(random.uniform(55, 75), 1),
                "expected_change": round(random.uniform(-20, 20), 1)
            }
        },
        "recommendations": [
            "শীতকালীন সবজির দাম কমার সম্ভাবনা রয়েছে",
            "খাদ্যশস্যের দাম আগামী মাসে স্থিতিশীল থাকতে পারে",
            "মসলার দাম বৃদ্ধির প্রবণতা দেখা যাচ্ছে"
        ],
        "risk_factors": [
            "আবহাওয়ার পরিবর্তন",
            "পরিবহন খরচ বৃদ্ধি",
            "আন্তর্জাতিক বাজারের প্রভাব"
        ],
        "generated_at": datetime.now().isoformat()
    }
    
    return insights

@router.post("/market/ai-compare")
def compare_with_market(
    product_name: str,
    user_price: float,
    unit: str = "kg",
    location: str = "dhaka",
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Compare user's price with current market prices using AI analysis"""
    
    if user_price <= 0:
        raise HTTPException(status_code=400, detail="Price must be greater than 0")
        
    # Get market prices for comparison
    market_prices = db.query(MarketPrice).filter(
        MarketPrice.product_name_bn.contains(product_name)
    ).limit(10).all()
    
    if not market_prices:
        # Return mock comparison if no real data
        market_avg = user_price * random.uniform(0.8, 1.2)
        comparison_data = [
            {"market": "কারওয়ান বাজার", "price": user_price * random.uniform(0.9, 1.1)},
            {"market": "শ্যামবাজার", "price": user_price * random.uniform(0.85, 1.15)},
            {"market": "নিউ মার্কেট", "price": user_price * random.uniform(0.8, 1.2)}
        ]
    else:
        market_avg = sum(p.current_price for p in market_prices) / len(market_prices)
        comparison_data = [
            {"market": p.market_name, "price": p.current_price} 
            for p in market_prices[:5]
        ]
    
    price_difference = user_price - market_avg
    percentage_difference = (price_difference / market_avg) * 100
    
    # AI analysis
    if percentage_difference > 10:
        analysis = "আপনার দাম বাজারের চেয়ে বেশি - দাম কমানোর বিবেচনা করুন"
        recommendation = "competitive"
    elif percentage_difference < -10:
        analysis = "আপনার দাম বাজারের চেয়ে কম - দাম বাড়ানোর সুযোগ রয়েছে"
        recommendation = "increase"
    else:
        analysis = "আপনার দাম বাজারের সাথে সামঞ্জস্যপূর্ণ"
        recommendation = "maintain"
    
    return {
        "product_name": product_name,
        "user_price": user_price,
        "market_average": round(market_avg, 2),
        "price_difference": round(price_difference, 2),
        "percentage_difference": round(percentage_difference, 1),
        "analysis": analysis,
        "recommendation": recommendation,
        "market_comparison": comparison_data,
        "confidence": round(random.uniform(75, 90), 1),
        "generated_at": datetime.now().isoformat()
    }

@router.delete("/market/prices/{price_id}")
def delete_market_price(
    price_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a market price entry (admin only - not for chat tools)"""
    
    # Check if the price entry exists
    price_entry = db.query(MarketPrice).filter(MarketPrice.id == price_id).first()
    
    if not price_entry:
        raise HTTPException(status_code=404, detail="Market price entry not found")
    
    # In production, add admin role check here
    # if not current_user.is_admin:
    #     raise HTTPException(status_code=403, detail="Admin access required")
    
    # Delete the entry
    db.delete(price_entry)
    db.commit()
    
    return {"message": f"Market price entry {price_id} deleted successfully", "deleted_id": price_id}

@router.put("/market/prices/{price_id}")
def update_market_price(
    price_id: int,
    price_data: MarketPriceCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a market price entry (admin only - not for chat tools)"""
    
    # Check if the price entry exists
    price_entry = db.query(MarketPrice).filter(MarketPrice.id == price_id).first()
    
    if not price_entry:
        raise HTTPException(status_code=404, detail="Market price entry not found")
    
    # Update the entry
    price_entry.product_name_bn = price_data.product_name_bn
    price_entry.product_name_en = price_data.product_name_en
    price_entry.category = price_data.category
    price_entry.unit = price_data.unit
    price_entry.market_name = price_data.market_name
    price_entry.district = price_data.district
    price_entry.division = price_data.division
    price_entry.market_type = price_data.market_type
    price_entry.current_price = price_data.current_price
    price_entry.price_date = price_data.price_date
    
    db.commit()
    db.refresh(price_entry)
    
    return price_entry
