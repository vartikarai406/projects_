from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Enum as SQLEnum, CheckConstraint
from sqlalchemy.orm import relationship
import enum
from app.database import Base

class ResourceType(str, enum.Enum):
    DRINKING_WATER = "DRINKING_WATER"
    FOOD_PACKETS = "FOOD_PACKETS"
    FIRST_AID_KITS = "FIRST_AID_KITS"
    MEDICINES = "MEDICINES"
    RESCUE_EQUIPMENT = "RESCUE_EQUIPMENT"
    TRANSPORT_VEHICLES = "TRANSPORT_VEHICLES"
    TEMPORARY_SHELTER = "TEMPORARY_SHELTER"

class Depot(Base):
    __tablename__ = "depots"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    code = Column(String(50), unique=True, index=True, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(String(255), nullable=False)
    contact_person = Column(String(100), nullable=False)
    phone = Column(String(50), nullable=False)
    capacity_sqm = Column(Float, default=1000.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    inventory_items = relationship("InventoryItem", back_populates="depot", cascade="all, delete-orphan")
    allocation_items = relationship("AllocationItem", back_populates="depot")

class InventoryItem(Base):
    __tablename__ = "inventory_items"
    __table_args__ = (
        CheckConstraint("quantity_available >= 0", name="check_positive_available"),
        CheckConstraint("quantity_reserved >= 0", name="check_positive_reserved"),
    )

    id = Column(Integer, primary_key=True, index=True)
    depot_id = Column(Integer, ForeignKey("depots.id", ondelete="CASCADE"), nullable=False)
    resource_type = Column(SQLEnum(ResourceType), nullable=False, index=True)
    unit = Column(String(50), nullable=False) # Liters, Kits, Ration Boxes, Doses, Units, Tents
    quantity_available = Column(Integer, default=0, nullable=False)
    quantity_reserved = Column(Integer, default=0, nullable=False)
    minimum_threshold = Column(Integer, default=50, nullable=False)
    last_restocked_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    depot = relationship("Depot", back_populates="inventory_items")
