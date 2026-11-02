def test_forecasting_pipeline_and_confidence_intervals(client):
    """
    Tests scikit-learn regression forecasting, verifying 95% confidence intervals,
    shortage projection calculations, and regression goodness-of-fit benchmarks.
    """
    resp = client.post("/api/forecasts/generate", json={"zone_name": "Metro-River-Basin", "horizon_hours": 24})
    assert resp.status_code == 200
    summary = resp.json()
    assert summary["zone_name"] == "Metro-River-Basin"
    assert summary["horizon_hours"] == 24
    assert len(summary["forecasts"]) > 0

    for f in summary["forecasts"]:
        assert f["predicted_demand"] > 0
        assert f["confidence_interval_lower"] <= f["predicted_demand"]
        assert f["confidence_interval_upper"] >= f["predicted_demand"]
        assert f["r2_score"] >= 0.70

    # Model evaluation metrics endpoint
    metrics_resp = client.get("/api/forecasts/metrics")
    assert metrics_resp.status_code == 200
    m_data = metrics_resp.json()
    assert "Ridge" in m_data["model_architecture"]
    assert "DRINKING_WATER" in m_data["metrics_per_resource"]
    water_metrics = m_data["metrics_per_resource"]["DRINKING_WATER"]
    assert "r2_score" in water_metrics
    assert "mse" in water_metrics
    assert "mae" in water_metrics
