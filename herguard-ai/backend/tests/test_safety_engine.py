import pytest
from app.engine.safety_engine import SafetyEngine, haversine_distance, interpolate_waypoints
from app.models.schemas import SafetyFactorBreakdown

def test_haversine_distance():
    # Central Metro to Tech Park is roughly 4-6 km
    metro = [12.9716, 77.5946]
    tech = [12.9352, 77.6245]
    dist = haversine_distance(metro, tech)
    assert 4000 < dist < 7000, f"Unexpected distance: {dist}"

def test_interpolate_waypoints():
    start = [12.9716, 77.5946]
    end = [12.9352, 77.6245]
    pts = interpolate_waypoints(start, end, count=5)
    assert len(pts) == 6
    assert pts[0] == start
    assert pts[-1] == end

def test_composite_safety_score_standard_vs_night():
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
    
    # At night, low/medium lighting & isolation are penalized more heavily
    assert score_night <= score_day
    assert 0 <= score_day <= 100
    assert 0 <= score_night <= 100

def test_analyze_routes_produces_three_options():
    engine = SafetyEngine()
    metro = [12.9716, 77.5946]
    tech = [12.9352, 77.6245]
    
    res = engine.analyze_routes(
        origin_name="Central Metro",
        origin_coords=metro,
        destination_name="Tech Park",
        destination_coords=tech,
        is_night_walk=False
    )
    
    assert len(res.routes) == 3
    types = [r.route_type for r in res.routes]
    assert "safest" in types
    assert "balanced" in types
    assert "fastest" in types
    
    safest = next(r for r in res.routes if r.route_type == "safest")
    fastest = next(r for r in res.routes if r.route_type == "fastest")
    
    assert safest.safety_score >= fastest.safety_score
    assert len(safest.key_advantages) > 0
    assert len(res.comparison_table) == 3
    assert "AI risk estimates" in res.disclaimer

def test_nightwalk_mode_enhancement():
    engine = SafetyEngine()
    metro = [12.9716, 77.5946]
    tech = [12.9352, 77.6245]
    
    res_day = engine.analyze_routes("Start", metro, "End", tech, is_night_walk=False)
    res_night = engine.analyze_routes("Start", metro, "End", tech, is_night_walk=True)
    
    safest_night = next(r for r in res_night.routes if r.route_type == "safest")
    fastest_night = next(r for r in res_night.routes if r.route_type == "fastest")
    
    # In NightWalk mode, difference between safest and fastest route should be significant
    assert safest_night.safety_points_delta >= 15
    assert "NightWalk Mode" in safest_night.explanation
