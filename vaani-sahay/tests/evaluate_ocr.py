"""
Automated benchmark and evaluation test suite for VaaniSahay Electricity Bill OCR.
Evaluates:
- Field extraction accuracy: Consumer ID, Due Date, Net Amount
- Safe confidence thresholding
- Hindi spoken summary correctness
"""

import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.bill_parser import parse_bill_text_fields, process_bill_image

def test_raw_text_heuristic_parser():
    """Tests regex and parsing logic on simulated OCR text outputs."""
    sample_ocr_output_uppcl = """
    UP POWER CORPORATION LTD (UPPCL)
    ELECTRICITY BILL CUM NOTICE
    उपभोक्ता विवरण
    उपभोक्ता संख्या: 1084920482
    नाम: Sunita Devi
    METER DETAILS
    Sanctioned Load: 2.00 kW
    देय राशि एवं भुगतान विवरण
    कुल देय राशि: Rs. 640
    अंतिम तिथि: 15/11/2026
    नियत तिथि पश्चात देय राशि: Rs. 690
    """

    res = parse_bill_text_fields(sample_ocr_output_uppcl)
    assert res["consumer_id"] == "1084920482", f"Expected 1084920482, got {res['consumer_id']}"
    assert res["amount_due"] == "₹640", f"Expected ₹640, got {res['amount_due']}"
    assert res["due_date"] == "15/11/2026", f"Expected 15/11/2026, got {res['due_date']}"
    assert res["confidence"] >= 0.8, f"Expected high confidence, got {res['confidence']}"
    assert "640 रुपये" in res["spoken_summary_hi"], "Spoken summary should contain amount"
    assert "15/11/2026" in res["spoken_summary_hi"], "Spoken summary should contain due date"
    print("PASS: Heuristic parser on UPPCL text sample (Amount: Rs 640, Date: 15/11/2026)")

    sample_ocr_output_bses = """
    BSES YAMUNA POWER LIMITED
    CA No: 1004829104
    Consumer Name: Ramesh Kumar
    Net Payable: Rs. 1,250
    Due Date: 28/11/2026
    """

    res_bses = parse_bill_text_fields(sample_ocr_output_bses)
    assert res_bses["consumer_id"] == "1004829104", f"Expected 1004829104, got {res_bses['consumer_id']}"
    assert res_bses["amount_due"] == "₹1250", f"Expected ₹1250, got {res_bses['amount_due']}"
    assert res_bses["due_date"] == "28/11/2026", f"Expected 28/11/2026, got {res_bses['due_date']}"
    print("PASS: Heuristic parser on BSES text sample (Amount: Rs 1250, Date: 28/11/2026)")


def test_safe_failure_on_unclear_text():
    """Tests safe fallback when amount is unreadable or absent."""
    blurry_ocr_text = """
    SOME BLURRY UNREADABLE TEXT
    PHOTO TAKEN IN DARK ROOM
    NO BILL FOUND
    """
    res = parse_bill_text_fields(blurry_ocr_text)
    assert res["status"] == "low_confidence"
    assert res["amount_due"] is None
    assert "तस्वीर में बिल की राशि साफ़ नहीं दिख रही है" in res["spoken_summary_hi"]
    print("PASS: Safe fallback triggered on low confidence / unreadable bill")


if __name__ == "__main__":
    print("\n--- Running VaaniSahay Bill Parser & OCR Benchmarks ---")
    test_raw_text_heuristic_parser()
    test_safe_failure_on_unclear_text()
    print("--- All Bill Parser Benchmarks Passed! ---\n")
