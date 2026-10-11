"""
Electricity Bill OCR and Heuristic Field Parser for VaaniSahay.
Supports parsing bilingual (Hindi/English) electricity bills like UPPCL & BSES:
- Total Amount Due (देय राशि / Net Payable / Total Due)
- Due Date (अंतिम तिथि / Due Date)
- Consumer Number / CA Number (उपभोक्ता संख्या / Account ID)
- Sanity checking & safe fallback generation
"""

import re
import os
from typing import Dict, Any, List, Optional
from PIL import Image

# Global EasyOCR reader (lazy-loaded so app starts instantly)
_READER = None

def get_reader():
    global _READER
    if _READER is None:
        try:
            import easyocr
            # Load English and Hindi models
            _READER = easyocr.Reader(['en', 'hi'], gpu=False)
        except Exception as e:
            print(f"[BillParser] EasyOCR initialization warning: {e}")
            _READER = None
    return _READER


def parse_bill_text_fields(raw_text: str) -> Dict[str, Any]:
    """
    Extracts consumer ID, due date, and amount from raw OCR text lines.
    Applies rule-based regex and contextual proximity.
    """
    lines = [line.strip() for line in raw_text.split("\n") if line.strip()]
    normalized_full = " ".join(lines)

    result = {
        "consumer_id": None,
        "due_date": None,
        "amount_due": None,
        "confidence": 0.0,
        "raw_text": raw_text,
        "spoken_summary_hi": "",
        "status": "success",
        "warnings": []
    }

    # 1. Search for Consumer / Account Number (8 to 14 digits)
    # Match patterns like: "उपभोक्ता संख्या: 1234567890", "CA No: 100234567", "Account ID: 987654321"
    ca_pattern = r"(?:उपभोक्ता\s*संख्या|खाता\s*संख्या|CA\s*No|Account\s*(?:No|ID)|Consumer\s*(?:No|ID))\s*[:\-\s]*([0-9]{8,14})"
    ca_match = re.search(ca_pattern, normalized_full, re.IGNORECASE)
    if ca_match:
        result["consumer_id"] = ca_match.group(1).strip()
    else:
        # Fallback: find any standalone 9-12 digit sequence that isn't a date
        standalone_ids = re.findall(r"\b([0-9]{9,12})\b", normalized_full)
        if standalone_ids:
            result["consumer_id"] = standalone_ids[0]

    # 2. Search for Due Date
    # Match patterns like: DD/MM/YYYY, DD-MM-YYYY, or DD Month YYYY
    date_patterns = [
        r"(?:अंतिम\s*तिथि|देय\s*तिथि|Due\s*Date|Pay\s*By)\s*[:\-\s]*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})",
        r"\b([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.](?:202[4-9]|203[0-9]))\b",
        r"\b([0-9]{1,2}\s*(?:जनवरी|फ़रवरी|मार्च|अप्रैल|मई|जून|जुलाई|अगस्त|सितंबर|अक्टूबर|नवंबर|दिसंबर|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*(?:202[4-9])?)\b"
    ]
    for pattern in date_patterns:
        date_match = re.search(pattern, normalized_full, re.IGNORECASE)
        if date_match:
            result["due_date"] = date_match.group(1).strip()
            break

    # 3. Search for Amount Due (₹ / Rs / देय राशि / Net Payable / Total Amount)
    amount_patterns = [
        r"(?:कुल\s*देय\s*राशि|देय\s*राशि|Net\s*Payable|Total\s*Amount\s*Due|Amount\s*Payable|Bill\s*Amount)\s*[:\-\s]*(?:Rs\.?|₹|INR)?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]{2,6})",
        r"(?:₹|Rs\.?|INR)\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]{2,6})",
    ]
    for pattern in amount_patterns:
        amt_match = re.search(pattern, normalized_full, re.IGNORECASE)
        if amt_match:
            clean_amt = amt_match.group(1).replace(",", "").strip()
            try:
                val = float(clean_amt)
                # Filter out obvious false positives like dates or tiny numbers
                if 20 <= val <= 100000:
                    int_val = int(val)
                    if val == int_val:
                        result["amount_due"] = f"₹{int_val}"
                    else:
                        result["amount_due"] = f"₹{val:.2f}"
                    break
            except ValueError:
                pass

    # Compute heuristic confidence
    score = 0.0
    if result["amount_due"]:
        score += 0.5
    if result["due_date"]:
        score += 0.3
    if result["consumer_id"]:
        score += 0.2
    result["confidence"] = round(score, 2)

    # 4. Synthesize Safe Spoken Hindi Response
    if result["amount_due"] and result["due_date"]:
        cid_mention = f"उपभोक्ता संख्या {result['consumer_id']} के लिए " if result["consumer_id"] else ""
        spoken = (
            f"आपके बिजली बिल की जानकारी मिल गई है। "
            f"{cid_mention}कुल देय राशि {result['amount_due'].replace('₹', '')} रुपये है, "
            f"और इसे जमा करने की अंतिम तारीख {result['due_date']} है।"
        )
    elif result["amount_due"]:
        spoken = (
            f"आपके बिजली बिल की कुल देय राशि {result['amount_due'].replace('₹', '')} रुपये दिख रही है। "
            f"कृपया अंतिम तारीख की पुष्टि के लिए बिल को दोबारा साफ़ रोशनी में दिखाएं।"
        )
        result["warnings"].append("Due date not confidently identified.")
    else:
        result["status"] = "low_confidence"
        spoken = (
            "माफ़ कीजिये, तस्वीर में बिल की राशि साफ़ नहीं दिख रही है। "
            "कृपया बिल को सीधा रखकर और अच्छी रोशनी में दोबारा फोटो खींचें।"
        )
        result["warnings"].append("Total amount due could not be detected.")

    result["spoken_summary_hi"] = spoken
    return result


def process_bill_image(image_path: str) -> Dict[str, Any]:
    """
    Takes an image file path, runs OCR, and extracts bill details.
    """
    if not os.path.exists(image_path):
        return {
            "status": "error",
            "error": "Image file not found",
            "spoken_summary_hi": "तस्वीर नहीं मिल सकी। कृपया दोबारा कोशिश करें।"
        }

    reader = get_reader()
    raw_lines = []

    if reader:
        try:
            results = reader.readtext(image_path, detail=0)
            raw_lines = results
        except Exception as e:
            print(f"[BillParser] OCR execution error: {e}")

    # Fallback to pytesseract if easyocr yielded empty or failed
    if not raw_lines:
        try:
            import pytesseract
            img = Image.open(image_path)
            ocr_text = pytesseract.image_to_string(img, lang="hin+eng")
            raw_lines = [l for l in ocr_text.splitlines() if l.strip()]
        except Exception as e:
            print(f"[BillParser] Pytesseract fallback: {e}")

    raw_text = "\n".join(raw_lines)
    return parse_bill_text_fields(raw_text)
