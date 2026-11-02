from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserRole
from app.models.inventory import Depot, InventoryItem, ResourceType
from app.schemas.inventory import DepotCreate, DepotOut, InventoryItemCreate, InventoryItemOut, InventoryRestockRequest
from app.services.auth_service import get_current_user, require_roles
from app.services.audit_logger import log_audit_event

router = APIRouter(prefix="/inventory", tags=["Resource Inventory & Depots"])

@router.get("/depots", response_model=List[DepotOut])
def list_depots(db: Session = Depends(get_db)):
    depots = db.query(Depot).all()
    return depots

@router.post("/depots", response_model=DepotOut, status_code=status.HTTP_201_CREATED)
def create_depot(
    depot_in: DepotCreate,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.RESOURCE_MANAGER])),
    db: Session = Depends(get_db)
):
    existing = db.query(Depot).filter(Depot.code == depot_in.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Depot code already exists.")

    depot = Depot(**depot_in.model_dump())
    db.add(depot)
    db.commit()
    db.refresh(depot)

    # Initialize default stock rows for this depot
    default_units = {
        ResourceType.DRINKING_WATER: ("Liters", 1500),
        ResourceType.FOOD_PACKETS: ("Ration Packs", 1000),
        ResourceType.FIRST_AID_KITS: ("Kits", 200),
        ResourceType.MEDICINES: ("Doses", 400),
        ResourceType.RESCUE_EQUIPMENT: ("Units", 50),
        ResourceType.TRANSPORT_VEHICLES: ("Vehicles", 10),
        ResourceType.TEMPORARY_SHELTER: ("Tents", 80),
    }
    for res_type, (unit, qty) in default_units.items():
        item = InventoryItem(
            depot_id=depot.id,
            resource_type=res_type,
            unit=unit,
            quantity_available=qty,
            quantity_reserved=0,
            minimum_threshold=50
        )
        db.add(item)
    db.commit()
    db.refresh(depot)

    log_audit_event(db, action="DEPOT_CREATED", resource_type="DEPOT", resource_id=depot.code, user=current_user)
    return depot

@router.get("/items", response_model=List[InventoryItemOut])
def list_inventory_items(depot_id: int = None, db: Session = Depends(get_db)):
    query = db.query(InventoryItem)
    if depot_id:
        query = query.filter(InventoryItem.depot_id == depot_id)
    return query.all()

@router.post("/restock")
def restock_item(
    depot_id: int,
    restock_req: InventoryRestockRequest,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.RESOURCE_MANAGER])),
    db: Session = Depends(get_db)
):
    item = db.query(InventoryItem).filter(
        InventoryItem.depot_id == depot_id,
        InventoryItem.resource_type == restock_req.resource_type
    ).first()

    if not item:
        # Create item if not present
        item = InventoryItem(
            depot_id=depot_id,
            resource_type=restock_req.resource_type,
            unit="Units",
            quantity_available=restock_req.quantity_to_add,
            quantity_reserved=0,
            minimum_threshold=50
        )
        db.add(item)
    else:
        item.quantity_available += restock_req.quantity_to_add
        item.last_restocked_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(item)

    log_audit_event(
        db,
        action="INVENTORY_RESTOCKED",
        resource_type="INVENTORY",
        resource_id=f"DEPOT-{depot_id}-{restock_req.resource_type.value}",
        user=current_user,
        details={"added": restock_req.quantity_to_add, "new_total": item.quantity_available, "reason": restock_req.reason}
    )

    return {"message": "Inventory successfully restocked.", "resource_type": item.resource_type.value, "quantity_available": item.quantity_available}

@router.get("/summary")
def get_inventory_summary(db: Session = Depends(get_db)):
    """Summary of stock levels across all active depots"""
    items = db.query(InventoryItem).all()
    depots = db.query(Depot).filter(Depot.is_active == True).all()

    by_type = {}
    total_available = 0
    total_reserved = 0
    low_stock_alerts = []

    for item in items:
        rtype = item.resource_type.value
        if rtype not in by_type:
            by_type[rtype] = {
                "resource_type": rtype,
                "unit": item.unit,
                "quantity_available": 0,
                "quantity_reserved": 0,
                "total": 0
            }
        by_type[rtype]["quantity_available"] += item.quantity_available
        by_type[rtype]["quantity_reserved"] += item.quantity_reserved
        by_type[rtype]["total"] += (item.quantity_available + item.quantity_reserved)

        total_available += item.quantity_available
        total_reserved += item.quantity_reserved

        if item.quantity_available <= item.minimum_threshold:
            depot = next((d for d in depots if d.id == item.depot_id), None)
            depot_name = depot.name if depot else f"Depot #{item.depot_id}"
            low_stock_alerts.append({
                "depot_name": depot_name,
                "resource_type": rtype,
                "quantity_available": item.quantity_available,
                "minimum_threshold": item.minimum_threshold,
                "unit": item.unit
            })

    return {
        "active_depots_count": len(depots),
        "total_items_available": total_available,
        "total_items_reserved": total_reserved,
        "resources_breakdown": list(by_type.values()),
        "low_stock_alerts": low_stock_alerts
    }
