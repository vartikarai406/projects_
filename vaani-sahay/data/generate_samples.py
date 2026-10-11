"""
Generates synthetic electricity bills formatted similarly to Indian state utility bills (UPPCL / BSES).
Uses Pillow to draw bill lines, tabular layout, Devanagari text, and clear amounts.
"""

import os
from PIL import Image, ImageDraw, ImageFont

def generate_sample_bill(
    filename: str,
    provider_title: str,
    consumer_no: str,
    consumer_name: str,
    due_date: str,
    bill_amount: str,
    is_hindi: bool = True
):
    # Canvas size: 800 x 950 (standard bill aspect)
    width, height = 800, 950
    image = Image.new("RGB", (width, height), color=(255, 255, 255))
    draw = ImageDraw.Draw(image)

    # Use default font or truetype if present
    try:
        font_large = ImageFont.truetype("arial.ttf", 26)
        font_med = ImageFont.truetype("arial.ttf", 20)
        font_bold = ImageFont.truetype("arialbd.ttf", 22)
        font_huge = ImageFont.truetype("arialbd.ttf", 34)
    except Exception:
        font_large = ImageFont.load_default()
        font_med = ImageFont.load_default()
        font_bold = ImageFont.load_default()
        font_huge = ImageFont.load_default()

    # Outer Border
    draw.rectangle([20, 20, width - 20, height - 20], outline=(40, 40, 40), width=3)

    # Header Banner
    draw.rectangle([25, 25, width - 25, 110], fill=(230, 240, 255), outline=(100, 150, 220), width=2)
    draw.text((40, 40), provider_title, fill=(20, 50, 120), font=font_large)
    sub = "ELECTRICITY BILL CUM NOTICE / विद्युत बीजक एवं नोटिस"
    draw.text((40, 75), sub, fill=(60, 60, 60), font=font_med)

    # Consumer Details Box
    draw.rectangle([35, 130, width - 35, 300], outline=(180, 180, 180), width=1)
    draw.line([35, 175, width - 35, 175], fill=(200, 200, 200), width=1)
    draw.text((50, 142), "CONSUMER PARTICULARS / उपभोक्ता विवरण", fill=(10, 10, 10), font=font_bold)

    draw.text((50, 195), f"Consumer No (उपभोक्ता संख्या): {consumer_no}", fill=(20, 20, 20), font=font_bold)
    draw.text((50, 230), f"Consumer Name (नाम): {consumer_name}", fill=(50, 50, 50), font=font_med)
    draw.text((50, 265), "Address (पता): Village Rampur, Sector 4, Dist. North", fill=(70, 70, 70), font=font_med)

    # Meter Reading Table
    draw.rectangle([35, 320, width - 35, 450], outline=(180, 180, 180), width=1)
    draw.line([35, 360, width - 35, 360], fill=(200, 200, 200), width=1)
    draw.text((50, 330), "METER DETAILS / मीटर पठन", fill=(10, 10, 10), font=font_bold)
    draw.text((50, 380), "Meter No: ND-8472910 | Status: OK | Sanctioned Load: 2.00 kW", fill=(50, 50, 50), font=font_med)
    draw.text((50, 415), "Previous Reading: 1240 kWh | Current Reading: 1390 kWh | Units: 150", fill=(50, 50, 50), font=font_med)

    # Payment Summary Highlight Box (Crucial for OCR extraction)
    draw.rectangle([35, 480, width - 35, 720], fill=(255, 252, 240), outline=(220, 150, 30), width=3)
    draw.text((50, 500), "BILL & PAYMENT DETAILS / देय राशि एवं भुगतान विवरण", fill=(160, 80, 10), font=font_bold)
    draw.line([35, 535, width - 35, 535], fill=(230, 180, 80), width=1)

    # Net Amount Due Row (Large Highlight)
    draw.text((50, 560), "Net Payable / कुल देय राशि:", fill=(20, 20, 20), font=font_large)
    draw.text((450, 555), f"Rs. {bill_amount}", fill=(180, 20, 20), font=font_huge)

    # Due Date Row
    draw.text((50, 620), "Due Date / अंतिम तिथि:", fill=(20, 20, 20), font=font_large)
    draw.text((450, 620), f"{due_date}", fill=(10, 80, 20), font=font_huge)

    # After Due Date surcharge
    try:
        surcharge_val = int(bill_amount.replace(",", "")) + 50
    except Exception:
        surcharge_val = 999
    draw.text((50, 675), f"Amount after due date (नियत तिथि पश्चात देय राशि): Rs. {surcharge_val}", fill=(90, 90, 90), font=font_med)

    # Footer note
    draw.rectangle([35, 750, width - 35, 890], outline=(200, 200, 200), width=1)
    draw.text((50, 770), "महत्वपूर्ण सूचना (Notice):", fill=(40, 40, 40), font=font_bold)
    draw.text((50, 805), "1. अंतिम तिथि के भीतर भुगतान कर छूट का लाभ उठाएं।", fill=(70, 70, 70), font=font_med)
    draw.text((50, 840), "2. डिजिटल भुगतान एवं शिकायत निवारण हेतु टोल-फ्री 1912 पर कॉल करें।", fill=(70, 70, 70), font=font_med)

    os.makedirs(os.path.dirname(filename), exist_ok=True)
    image.save(filename, "JPEG", quality=95)
    print(f"Sample bill saved: {filename}")


if __name__ == "__main__":
    out_dir = os.path.join(os.path.dirname(__file__), "sample_bills")
    # Sample 1: UPPCL style (₹640)
    generate_sample_bill(
        filename=os.path.join(out_dir, "sample_uppcl.jpg"),
        provider_title="UP POWER CORPORATION LTD (UPPCL)",
        consumer_no="1084920482",
        consumer_name="Sunita Devi",
        due_date="15/11/2026",
        bill_amount="640"
    )
    # Sample 2: BSES style (₹1,250)
    generate_sample_bill(
        filename=os.path.join(out_dir, "sample_bses.jpg"),
        provider_title="BSES YAMUNA POWER LIMITED",
        consumer_no="1004829104",
        consumer_name="Ramesh Kumar",
        due_date="28/11/2026",
        bill_amount="1,250"
    )
