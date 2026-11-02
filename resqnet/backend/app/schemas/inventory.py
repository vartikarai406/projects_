from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.inventory import ResourceType

class InventoryItemBase(BaseModel):
    resource_type: ResourceType
    unit: str
    quantity_available: int = Field(0, ge=0)
    quantity_reserved: int = Field(0, ge=0)
    minimum_threshold: int = Field(50, ge=0)

class InventoryItemCreate(InventoryItemBase):
    depot_id: int

class InventoryItemOut(InventoryItemBase):
    id: int
    depot_id: int
    last_restocked_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DepotBase(BaseModel):
    name: str
    code: str
    latitude: float
    longitude: float
    address: str
    contact_person: str
    phone: str
    capacity_sqm: float = 1000.0
    is_active: bool = True

class DepotCreate(DepotBase):
    pass

class DepotOut(DepotBase):
    id: int
    created_at: datetime
    inventory_items: List[InventoryItemOut] = []

    class Config:
        from_attributes = True

class InventoryRestockRequest(BaseModel):
    resource_type: ResourceType
    quantity_to_add: int = Field(..., gt=0)
    reason: Optional[str] = "Emergency Resupply"
