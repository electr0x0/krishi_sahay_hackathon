from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random
import json

from app.database import get_db
from app.auth.dependencies import get_current_active_user
from app.models.user import User
from app.models.market import MarketPrice, MarketAlert
from app.schemas.market import MarketPrice as MarketPriceSchema, MarketPriceCreate, MarketAlert as MarketAlertSchema
from app.tools.pricing_tool import get_item_price, get_price_trend

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
                "date": (datetime.now().date() + datetime.timedelta(days=i+1)).isoformat(),
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
    """Get market prices for agricultural products"""
    
    query = db.query(MarketPrice)
    
    if category:
        query = query.filter(MarketPrice.category == category)
    
    if district:
        query = query.filter(MarketPrice.district == district)
    
    # Order by most recent first
    query = query.order_by(MarketPrice.price_date.desc())
    
    # Limit results
    prices = query.limit(limit).all()
    
    # If no data in database, return some mock data for now
    if not prices:
        # Create comprehensive sample data for demonstration
        sample_prices = [
            {
                "id": 1,
                "product_name_bn": "ধান",
                "product_name_en": "Rice",
                "category": "grain",
                "unit": "kg",
                "market_name": "শ্যামবাজার",
                "district": "ঢাকা",
                "division": "ঢাকা",
                "market_type": "retail",
                "current_price": 35.0,
                "previous_price": 33.2,
                "price_change": 1.8,
                "price_change_percentage": 5.4,
                "trend": "up",
                "data_source": "manual",
                "reliability_score": 0.8,
                "price_date": datetime.now(),
                "created_at": datetime.now()
            },
            {
                "id": 2,
                "product_name_bn": "আলু",
                "product_name_en": "Potato",
                "category": "vegetable",
                "unit": "kg",
                "market_name": "কারওয়ান বাজার",
                "district": "ঢাকা",
                "division": "ঢাকা",
                "market_type": "wholesale",
                "current_price": 28.0,
                "previous_price": 30.0,
                "price_change": -2.0,
                "price_change_percentage": -6.7,
                "trend": "down",
                "data_source": "manual",
                "reliability_score": 0.9,
                "price_date": datetime.now(),
                "created_at": datetime.now()
            },
            {
                "id": 3,
                "product_name_bn": "পেঁয়াজ",
                "product_name_en": "Onion",
                "category": "vegetable",
                "unit": "kg",
                "market_name": "নিউ মার্কেট",
                "district": "ঢাকা",
                "division": "ঢাকা",
                "market_type": "retail",
                "current_price": 45.0,
                "previous_price": 52.0,
                "price_change": -7.0,
                "price_change_percentage": -13.5,
                "trend": "down",
                "data_source": "manual",
                "reliability_score": 0.7,
                "price_date": datetime.now(),
                "created_at": datetime.now()
            },
            {
                "id": 4,
                "product_name_bn": "চাল",
                "product_name_en": "Rice (Processed)",
                "category": "grain",
                "unit": "kg",
                "market_name": "শ্যামবাজার",
                "district": "ঢাকা",
                "division": "ঢাকা",
                "market_type": "retail",
                "current_price": 60.0,
                "previous_price": 58.0,
                "price_change": 2.0,
                "price_change_percentage": 3.4,
                "trend": "up",
                "data_source": "manual",
                "reliability_score": 0.9,
                "price_date": datetime.now(),
                "created_at": datetime.now()
            },
            {
                "id": 5,
                "product_name_bn": "ডাল (মুগ)",
                "product_name_en": "Mung Dal",
                "category": "grain",
                "unit": "kg",
                "market_name": "কারওয়ান বাজার",
                "district": "ঢাকা",
                "division": "ঢাকা",
                "market_type": "wholesale",
                "current_price": 120.0,
                "previous_price": 125.0,
                "price_change": -5.0,
                "price_change_percentage": -4.0,
                "trend": "down",
                "data_source": "manual",
                "reliability_score": 0.8,
                "price_date": datetime.now(),
                "created_at": datetime.now()
            },
            {
                "id": 6,
                "product_name_bn": "টমেটো",
                "product_name_en": "Tomato",
                "category": "vegetable",
                "unit": "kg",
                "market_name": "কাঁচা বাজার",
                "district": "ঢাকা",
                "division": "ঢাকা",
                "market_type": "retail",
                "current_price": 60.0,
                "previous_price": 45.0,
                "price_change": 15.0,
                "price_change_percentage": 33.3,
                "trend": "up",
                "data_source": "manual",
                "reliability_score": 0.7,
                "price_date": datetime.now(),
                "created_at": datetime.now()
            },
            {
                "id": 7,
                "product_name_bn": "চমেলী",
                "product_name_en": "Aromatic Rice",
                "category": "grain",
                "unit": "kg",
                "market_name": "নিউ মার্কেট",
                "district": "ঢাকা",
                "division": "ঢাকা",
                "market_type": "retail",
                "current_price": 75.0,
                "previous_price": 70.0,
                "price_change": 5.0,
                "price_change_percentage": 7.1,
                "trend": "up",
                "data_source": "manual",
                "reliability_score": 0.8,
                "price_date": datetime.now(),
                "created_at": datetime.now()
            },
            {
                "id": 8,
                "product_name_bn": "গাজর",
                "product_name_en": "Carrot",
                "category": "vegetable",
                "unit": "kg",
                "market_name": "শ্যামবাজার",
                "district": "ঢাকা",
                "division": "ঢাকা",
                "market_type": "retail",
                "current_price": 35.0,
                "previous_price": 40.0,
                "price_change": -5.0,
                "price_change_percentage": -12.5,
                "trend": "down",
                "data_source": "manual",
                "reliability_score": 0.8,
                "price_date": datetime.now(),
                "created_at": datetime.now()
            },
            {
                "id": 9,
                "product_name_bn": "বেগুন",
                "product_name_en": "Eggplant",
                "category": "vegetable",
                "unit": "kg",
                "market_name": "কারওয়ান বাজার",
                "district": "ঢাকা",
                "division": "ঢাকা",
                "market_type": "wholesale",
                "current_price": 25.0,
                "previous_price": 28.0,
                "price_change": -3.0,
                "price_change_percentage": -10.7,
                "trend": "down",
                "data_source": "manual",
                "reliability_score": 0.7,
                "price_date": datetime.now(),
                "created_at": datetime.now()
            },
            {
                "id": 10,
                "product_name_bn": "শসা",
                "product_name_en": "Cucumber",
                "category": "vegetable",
                "unit": "kg",
                "market_name": "নিউ মার্কেট",
                "district": "ঢাকা",
                "division": "ঢাকা",
                "market_type": "retail",
                "current_price": 30.0,
                "previous_price": 25.0,
                "price_change": 5.0,
                "price_change_percentage": 20.0,
                "trend": "up",
                "data_source": "manual",
                "reliability_score": 0.6,
                "price_date": datetime.now(),
                "created_at": datetime.now()
            },
            {
                "id": 11,
                "product_name_bn": "কলা",
                "product_name_en": "Banana",
                "category": "fruit",
                "unit": "dozen",
                "market_name": "ফল বাজার",
                "district": "ঢাকা",
                "division": "ঢাকা",
                "market_type": "retail",
                "current_price": 45.0,
                "previous_price": 40.0,
                "price_change": 5.0,
                "price_change_percentage": 12.5,
                "trend": "up",
                "data_source": "manual",
                "reliability_score": 0.8,
                "price_date": datetime.now(),
                "created_at": datetime.now()
            },
            {
                "id": 12,
                "product_name_bn": "আম",
                "product_name_en": "Mango",
                "category": "fruit",
                "unit": "kg",
                "market_name": "ফল বাজার",
                "district": "ঢাকা",
                "division": "ঢাকা",
                "market_type": "retail",
                "current_price": 80.0,
                "previous_price": 90.0,
                "price_change": -10.0,
                "price_change_percentage": -11.1,
                "trend": "down",
                "data_source": "manual",
                "reliability_score": 0.7,
                "price_date": datetime.now(),
                "created_at": datetime.now()
            }
        ]
        return sample_prices
    
    return prices

@router.get("/market/prices/{item_name}")
def get_item_market_price(
    item_name: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current market price for a specific item using external APIs"""
    
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
    """Get AI-powered price recommendation for a product"""
    
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
    """Get AI-powered market insights and trends"""
    
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
