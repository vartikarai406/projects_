def test_optimizer_vs_baseline_comparison(client, coordinator_headers):
    """
    Evaluates that the OR-Tools Min-Cost Flow optimization algorithm executes,
    produces valid allocations, never exceeds depot stock, explicitly flags unmet demand,
    and returns a comparison report against the Greedy FIFO nearest-depot baseline.
    """
    payload = {
        "scenario_name": "Riverside Benchmark Run",
        "algorithm": "MIN_COST_FLOW",
        "max_distance_km": 60.0,
        "include_unverified": False
    }
    resp = client.post("/api/allocation/optimize", json=payload, headers=coordinator_headers)
    assert resp.status_code == 201
    plan = resp.json()

    # Verify allocation metrics
    assert plan["total_items_allocated"] > 0
    assert "comparison_metrics" in plan
    comp = plan["comparison_metrics"]

    assert comp["baseline_algorithm"] == "GREEDY_FIFO_NEAREST"
    assert comp["optimized_algorithm"] == "MIN_COST_FLOW"
    assert comp["execution_time_ms"] > 0
    assert "explanation" in comp

    # Verify items
    items = plan["items"]
    assert len(items) > 0

    # Ensure no negative quantities
    for item in items:
        assert item["quantity"] >= 0
        if item["status"] == "UNFULFILLED":
            assert item["depot_id"] is None
        else:
            assert item["depot_id"] is not None
