import uuid
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from app.core.config import settings

def generate_report_tool(
    title: str,
    executive_summary: str,
    sections: List[Dict[str, Any]],
    chart_artifact_path: Optional[str] = None
) -> Dict[str, Any]:
    """
    Synthesizes workflow findings into a verifiable Markdown report and a formatted PDF document.
    Saves artifacts directly in workspace/data.
    """
    timestamp_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    report_id = uuid.uuid4().hex[:8]
    
    # 1. Generate Markdown Report
    md_lines = [
        f"# {title}",
        f"*AutoPilot AI Executive Report | Generated at {timestamp_str} | Report ID: {report_id}*",
        "\n---\n",
        "## Executive Summary",
        f"{executive_summary}\n",
    ]
    
    for sec in sections:
        sec_title = sec.get("title", "Key Section")
        sec_content = sec.get("content", "")
        md_lines.append(f"### {sec_title}")
        md_lines.append(f"{sec_content}\n")
        
        if "table_headers" in sec and "table_rows" in sec:
            headers = sec["table_headers"]
            md_lines.append("| " + " | ".join(str(h) for h in headers) + " |")
            md_lines.append("| " + " | ".join(["---"] * len(headers)) + " |")
            for row in sec["table_rows"]:
                md_lines.append("| " + " | ".join(str(cell) for cell in row) + " |")
            md_lines.append("\n")
            
    if chart_artifact_path:
        md_lines.append(f"### Visual Analytics\n![Analytics Chart]({chart_artifact_path})\n")
        
    md_content = "\n".join(md_lines)
    
    md_filename = f"report_{report_id}.md"
    md_path = settings.DATA_PATH / md_filename
    with open(md_path, "w", encoding="utf-8") as f:
        f.write(md_content)
        
    # 2. Generate PDF Report using reportlab
    pdf_filename = f"report_{report_id}.pdf"
    pdf_path = settings.DATA_PATH / pdf_filename
    
    try:
        doc = SimpleDocTemplate(str(pdf_path), pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'ReportTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=20,
            leading=24,
            textColor=colors.HexColor('#0F172A'),
            spaceAfter=6
        )
        sub_style = ParagraphStyle(
            'ReportSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica-Oblique',
            fontSize=10,
            leading=13,
            textColor=colors.HexColor('#64748B'),
            spaceAfter=15
        )
        h2_style = ParagraphStyle(
            'Heading2',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=14,
            leading=18,
            textColor=colors.HexColor('#4338CA'),
            spaceBefore=12,
            spaceAfter=6
        )
        body_style = ParagraphStyle(
            'Body',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#334155'),
            spaceAfter=8
        )
        
        story = [
            Paragraph(title, title_style),
            Paragraph(f"AutoPilot AI Executive Report | Generated: {timestamp_str} | ID: {report_id}", sub_style),
            Spacer(1, 10),
            Paragraph("Executive Summary", h2_style),
            Paragraph(executive_summary, body_style),
            Spacer(1, 10)
        ]
        
        for sec in sections:
            story.append(Paragraph(sec.get("title", "Section"), h2_style))
            story.append(Paragraph(sec.get("content", ""), body_style))
            
            if "table_headers" in sec and "table_rows" in sec:
                table_data = [sec["table_headers"]] + sec["table_rows"][:10]
                t = Table(table_data)
                t.setStyle(TableStyle([
                    ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#E2E8F0')),
                    ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor('#1E293B')),
                    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0,0), (-1,-1), 8),
                    ('BOTTOMPADDING', (0,0), (-1,-1), 4),
                    ('TOPPADDING', (0,0), (-1,-1), 4),
                    ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
                ]))
                story.append(t)
                story.append(Spacer(1, 10))
                
        doc.build(story)
        pdf_generated = True
    except Exception as e:
        pdf_generated = False
        print(f"PDF build warning: {e}")
        
    return {
        "report_id": report_id,
        "title": title,
        "markdown_artifact": f"workspace/data/{md_filename}",
        "markdown_size": md_path.stat().st_size,
        "pdf_artifact": f"workspace/data/{pdf_filename}" if pdf_generated else None,
        "pdf_size": pdf_path.stat().st_size if pdf_generated and pdf_path.exists() else 0,
        "generated_at": timestamp_str,
        "summary": executive_summary
    }
