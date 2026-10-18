import pytest
from app.engine.verifier import verifier
from app.tools.registry import registry

def test_verifier_catches_invalid_output():
    # Empty output
    valid, msg = verifier.verify_tool_output("read_file", None)
    assert valid is False

    # Missing required key
    valid, msg = verifier.verify_tool_output("read_file", {"wrong_key": 123})
    assert valid is False

def test_tool_registry_execution():
    # Run CSV analysis tool
    result = registry.execute("analyze_csv", {"file_path": "sample_datasets/sales_q3.csv"})
    assert result["row_count"] > 0
    assert "revenue" in result["numeric_summary"]

    # Verify output passes verifier
    valid, msg = verifier.verify_tool_output("analyze_csv", result)
    assert valid is True
