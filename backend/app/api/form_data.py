from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

# Import models and schemas
from app.models.form_data import FarmData
from app.models.user import User
from app.schemas.form_data import FarmDataCreate, FarmDataUpdate, FarmDataResponse, FormDataSchema
from app.database import get_db
from app.auth.dependencies import get_current_active_user
from app.services.weather_service import weather_service

router = APIRouter()

# --- HELPER FUNCTIONS ---

async def _create_response_data(farm_data: FarmData, current_user: User) -> dict:
    """Create properly formatted response data"""
    return {
        "id": farm_data.id,
        "farmer_name": farm_data.farmer_name,
        "farm_name": farm_data.farm_name,
        "description": farm_data.description,
        "farm_type": farm_data.farm_type,
        "total_area": farm_data.total_area,
        "cultivable_area": farm_data.cultivable_area,
        "division": farm_data.division,
        "district": farm_data.district_new,  # Use new field
        "upazila": farm_data.upazila,
        "union_ward": farm_data.union_ward,
        "village": farm_data.village,
        "detailed_address": farm_data.detailed_address,
        "latitude": farm_data.latitude or current_user.latitude,  # Use farm lat/long or fallback to user profile
        "longitude": farm_data.longitude or current_user.longitude,
        "elevation": farm_data.elevation,
        "soil_type": farm_data.soil_type,
        "irrigation_source": farm_data.irrigation_source,
        "water_source_distance": farm_data.water_source_distance,
        "has_electricity": farm_data.has_electricity,
        "has_storage": farm_data.has_storage,
        "has_processing_unit": farm_data.has_processing_unit,
        "transportation_access": farm_data.transportation_access,
        "farming_experience": farm_data.farming_experience,
        "successful_crops": farm_data.successful_crops,
        "yearly_production": farm_data.yearly_production,
        "monthly_income": farm_data.monthly_income,
        "current_crops": farm_data.current_crops,
        "todays_work": farm_data.todays_work,
        "owner_id": farm_data.owner_id,
        "created_at": None,  # Not available in current model
        "updated_at": farm_data.updated_at.isoformat() if farm_data.updated_at else None
    }

# --- NEW COMPREHENSIVE FARM DATA ENDPOINTS ---

@router.post("/comprehensive", response_model=FarmDataResponse)
async def create_comprehensive_farm_data(
    *,
    db: Session = Depends(get_db),
    farm_data: FarmDataCreate,
    current_user: User = Depends(get_current_active_user)
):
    """Create comprehensive farm data with detailed information"""
    
    # Check if user already has farm data
    existing_farm = db.query(FarmData).filter(FarmData.owner_id == current_user.id).first()
    
    # Prepare the data for creation/update
    create_data = farm_data.model_dump()
    
    # Handle district field mapping
    if 'district' in create_data:
        create_data['district_new'] = create_data['district']
        # Remove the original 'district' key to avoid conflicts
        del create_data['district']
    
    # Auto-populate location data from user profile if not provided
    if not create_data.get('latitude') and current_user.latitude:
        create_data['latitude'] = current_user.latitude
    if not create_data.get('longitude') and current_user.longitude:
        create_data['longitude'] = current_user.longitude
    
    # Fetch weather/elevation data if coordinates are available
    if create_data.get('latitude') and create_data.get('longitude'):
        try:
            weather_data = await weather_service.get_location_data(
                create_data['latitude'], 
                create_data['longitude']
            )
            if weather_data:
                # Update elevation if not provided or if weather service has better data
                if not create_data.get('elevation') and weather_data.get('elevation'):
                    create_data['elevation'] = weather_data['elevation']
                
                # Calculate elevation from pressure if available
                if weather_data.get('pressure') and weather_data.get('sea_level_pressure'):
                    calculated_elevation = await weather_service.calculate_elevation_from_pressure(
                        weather_data['pressure'], 
                        weather_data['sea_level_pressure']
                    )
                    if calculated_elevation and not create_data.get('elevation'):
                        create_data['elevation'] = calculated_elevation
        except Exception as e:
            print(f"Weather service error: {e}")
            # Continue without weather data if service fails
    
    if existing_farm:
        # Update existing record
        for key, value in create_data.items():
            if hasattr(existing_farm, key):
                # Handle district field mapping
                if key == 'district':
                    setattr(existing_farm, 'district_new', value)
                else:
                    setattr(existing_farm, key, value)
        
        db.add(existing_farm)
        db.commit()
        db.refresh(existing_farm)
        return await _create_response_data(existing_farm, current_user)
    else:
        # Create new record
        db_farm = FarmData(**create_data, owner_id=current_user.id)
        db.add(db_farm)
        db.commit()
        db.refresh(db_farm)
        return await _create_response_data(db_farm, current_user)

@router.get("/comprehensive", response_model=FarmDataResponse)
async def get_comprehensive_farm_data(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get comprehensive farm data for the current user"""
    farm_data = db.query(FarmData).filter(FarmData.owner_id == current_user.id).first()
    
    if not farm_data:
        raise HTTPException(status_code=404, detail="Farm data not found")
    
    return await _create_response_data(farm_data, current_user)

@router.put("/comprehensive", response_model=FarmDataResponse)
async def update_comprehensive_farm_data(
    *,
    db: Session = Depends(get_db),
    farm_data: FarmDataUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """Update comprehensive farm data"""
    existing_farm = db.query(FarmData).filter(FarmData.owner_id == current_user.id).first()
    
    if not existing_farm:
        raise HTTPException(status_code=404, detail="Farm data not found")
    
    update_data = farm_data.model_dump(exclude_unset=True)
    
    # Handle location updates and weather data
    lat_changed = 'latitude' in update_data
    lon_changed = 'longitude' in update_data
    
    for key, value in update_data.items():
        if hasattr(existing_farm, key) and value is not None:
            # Handle district field mapping
            if key == 'district':
                setattr(existing_farm, 'district_new', value)
            else:
                setattr(existing_farm, key, value)
    
    # Fetch updated weather data if coordinates changed
    if lat_changed or lon_changed:
        try:
            lat = existing_farm.latitude or current_user.latitude
            lon = existing_farm.longitude or current_user.longitude
            
            if lat and lon:
                weather_data = await weather_service.get_location_data(lat, lon)
                if weather_data:
                    # Update elevation if weather service has better data
                    if weather_data.get('elevation'):
                        existing_farm.elevation = weather_data['elevation']
                    
                    # Calculate elevation from pressure if available
                    if weather_data.get('pressure') and weather_data.get('sea_level_pressure'):
                        calculated_elevation = await weather_service.calculate_elevation_from_pressure(
                            weather_data['pressure'], 
                            weather_data['sea_level_pressure']
                        )
                        if calculated_elevation and not existing_farm.elevation:
                            existing_farm.elevation = calculated_elevation
        except Exception as e:
            print(f"Weather service error during update: {e}")
    
    db.add(existing_farm)
    db.commit()
    db.refresh(existing_farm)
    
    return await _create_response_data(existing_farm, current_user)

# --- LEGACY ENDPOINTS FOR BACKWARD COMPATIBILITY ---

@router.post("/", response_model=FormDataSchema)
def create_or_update_farm_data(
    *,
    db: Session = Depends(get_db),
    form_data: FormDataSchema,
    current_user: User = Depends(get_current_active_user)
):
    """Legacy endpoint for simple farm data (backward compatibility)"""
    
    existing_farm = db.query(FarmData).filter(FarmData.owner_id == current_user.id).first()

    if existing_farm:
        # Update existing record with legacy data
        existing_farm.farmer_name = form_data.farmer_name
        existing_farm.farm_name = form_data.farmer_name + " Farm"  # Generate farm name
        existing_farm.farm_type = "crop"  # Default type
        existing_farm.division = "Unknown"  # Default values
        existing_farm.district_new = form_data.location  # Use correct field name
        existing_farm.upazila = "Unknown"
        existing_farm.total_area = float(form_data.total_amount.replace('বিঘা', '').replace('একর', '').strip()) if form_data.total_amount else 1.0
        existing_farm.farming_experience = form_data.farming_experience
        existing_farm.successful_crops = form_data.successful_result
        existing_farm.todays_work = form_data.todays_work
        existing_farm.monthly_income = form_data.monthly_income
        existing_farm.current_crops = form_data.crop_type
        
        db.add(existing_farm)
        db.commit()
        db.refresh(existing_farm)
        return form_data
    else:
        # Create new record from legacy data
        db_farm = FarmData(
            farmer_name=form_data.farmer_name,
            farm_name=form_data.farmer_name + " Farm",
            farm_type="crop",
            division="Unknown",
            district_new=form_data.location,  # Use correct field name
            upazila="Unknown", 
            total_area=float(form_data.total_amount.replace('বিঘা', '').replace('একর', '').strip()) if form_data.total_amount else 1.0,
            farming_experience=form_data.farming_experience,
            successful_crops=form_data.successful_result,
            todays_work=form_data.todays_work,
            monthly_income=form_data.monthly_income,
            current_crops=form_data.crop_type,
            owner_id=current_user.id
        )
        db.add(db_farm)
        db.commit()
        db.refresh(db_farm)
        return form_data

@router.get("/", response_model=List[FormDataSchema])
def get_user_farm_data(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Legacy endpoint to get farm data as simple format"""
    farm_data = db.query(FarmData).filter(FarmData.owner_id == current_user.id).first()
    
    if not farm_data:
        return []
    
    # Convert comprehensive data back to legacy format
    legacy_data = FormDataSchema(
        farmerName=farm_data.farmer_name,
        location=farm_data.district_new or farm_data.district or "Unknown",  # Use correct field name with fallback
        cropType=farm_data.current_crops or "ধান",
        farmingExperience=farm_data.farming_experience,
        totalAmount=f"{farm_data.total_area} একর",
        successfulResult=farm_data.successful_crops or 0,
        todaysWork=farm_data.todays_work,
        monthlyIncome=farm_data.monthly_income
    )
    
    return [legacy_data]