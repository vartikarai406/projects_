import sys
import os

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, backend_dir)

from app.engine.safety_engine import SafetyEngine, haversine_distance, interpolate_waypoints
from app.models.schemas import SafetyFactorBreakdown

def run_all_tests():
    print("=======================================")
    print(" Running HERGUARD AI Core Engine Tests ")
    print("=======================================")
    
    # Test 1: Distance calculation
    metro = [12.9716, 77.5946]
    tech = [12.9352, 77.6245]
    dist = haversine_distance(metro, tech)
    assert 4000 < dist < 7000, f"Distance out of range: {dist}"
    print(f"[PASS] Test 1: Haversine distance calculation verified ({dist:.1f}m).")
    
    # Test 2: Waypoints interpolation
    pts = interpolate_waypoints(metro, tech, count=5)
    assert len(pts) == 6
    assert pts[0] == metro
    assert pts[-1] == tech
    print("[PASS] Test 2: Curved Waypoint interpolation verified.")
    
    # Test 3: Composite safety score & night mode weighting
    engine = SafetyEngine()
    factors = SafetyFactorBreakdown(
        street_lighting=50,
        crowd_activity=50,
        emergency_proximity=50,
        incident_history_penalty=10,
        isolation_factor=50,
        transit_access=50
    )
    score_day, risk_day, _ = engine.compute_composite_safety_score(factors, is_night_walk=False)
    score_night, risk_night, _ = engine.compute_composite_safety_score(factors, is_night_walk=True)
    assert score_night <= score_day
    assert 0 <= score_day <= 100
    assert 0 <= score_night <= 100
    print(f"[PASS] Test 3: Composite score calculated (Day: {score_day}, Night: {score_night}).")
    
    # Test 4: Route analysis generation (Safest, Balanced, Fastest)
    res = engine.analyze_routes("Metro Interchange", metro, "Innovation Park", tech, is_night_walk=False)
    assert len(res.routes) == 3
    safest = next(r for r in res.routes if r.route_type == "safest")
    fastest = next(r for r in res.routes if r.route_type == "fastest")
    assert safest.safety_score >= fastest.safety_score
    assert len(res.comparison_table) == 3
    print("[PASS] Test 4: Multi-route generator (Safest, Balanced, Fastest) verified.")
    
    # Test 5: NightWalk Mode bonus/delta logic
    res_night = engine.analyze_routes("Metro Interchange", metro, "Innovation Park", tech, is_night_walk=True)
    safest_night = next(r for r in res_night.routes if r.route_type == "safest")
    assert safest_night.safety_points_delta >= 15
    print(f"[PASS] Test 5: NightWalk Mode logic verified (+{safest_night.safety_points_delta} delta score).")
    
    print("\n>>> ALL 5 TESTS PASSED SUCCESSFULLY! <<<\n")

if __name__ == "__main__":
    run_all_tests()
