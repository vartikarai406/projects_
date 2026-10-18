import uuid
import pandas as pd
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend
import matplotlib.pyplot as plt
from typing import Dict, Any, List, Optional
from app.core.config import settings
from app.core.sandbox import resolve_safe_path

def analyze_csv_tool(file_path: str, target_column: Optional[str] = None) -> Dict[str, Any]:
    """
    Analyzes a CSV/Excel dataset using pandas.
    Computes summary metrics, distributions, and aggregates.
    """
    safe_path = resolve_safe_path(file_path, must_exist=True)
    
    if safe_path.suffix.lower() in [".xlsx", ".xls"]:
        df = pd.read_excel(safe_path)
    else:
        df = pd.read_csv(safe_path)
        
    num_rows, num_cols = df.shape
    columns = list(df.columns)
    
    # Analyze numerical columns
    numeric_stats = {}
    for col in df.select_dtypes(include=["number"]).columns:
        numeric_stats[col] = {
            "mean": round(float(df[col].mean()), 2) if not df[col].empty else 0,
            "min": round(float(df[col].min()), 2) if not df[col].empty else 0,
            "max": round(float(df[col].max()), 2) if not df[col].empty else 0,
            "sum": round(float(df[col].sum()), 2) if not df[col].empty else 0,
            "median": round(float(df[col].median()), 2) if not df[col].empty else 0,
        }
        
    # Analyze categorical columns
    categorical_stats = {}
    for col in df.select_dtypes(include=["object", "string", "category"]).columns[:5]:
        top_counts = df[col].value_counts().head(5).to_dict()
        categorical_stats[col] = {str(k): int(v) for k, v in top_counts.items()}
        
    # Preview sample records (first 5)
    sample_records = df.head(5).fillna("").to_dict(orient="records")
    
    return {
        "file_name": safe_path.name,
        "row_count": num_rows,
        "column_count": num_cols,
        "columns": columns,
        "numeric_summary": numeric_stats,
        "categorical_summary": categorical_stats,
        "sample_preview": sample_records,
        "missing_values": {col: int(count) for col, count in df.isnull().sum().items() if count > 0}
    }

def generate_chart_tool(
    file_path: str,
    x_column: str,
    y_column: str,
    chart_type: str = "bar",
    title: Optional[str] = None
) -> Dict[str, Any]:
    """
    Generates a high-resolution visual chart from CSV data and persists it in the workspace.
    Supported types: bar, line, scatter, pie.
    """
    safe_path = resolve_safe_path(file_path, must_exist=True)
    df = pd.read_csv(safe_path)
    
    if x_column not in df.columns:
        raise ValueError(f"Column '{x_column}' not found in dataset. Available: {list(df.columns)}")
    if y_column not in df.columns and chart_type != "pie":
        raise ValueError(f"Column '{y_column}' not found in dataset. Available: {list(df.columns)}")
        
    # Set modern dark styling
    plt.style.use("dark_background")
    fig, ax = plt.subplots(figsize=(10, 5.5), dpi=150)
    
    # Palette
    bar_color = "#6366F1"  # Indigo
    accent_color = "#10B981"  # Emerald
    
    # Aggregate data if needed
    if chart_type == "bar":
        agg_df = df.groupby(x_column)[y_column].sum().reset_index().head(10)
        ax.bar(agg_df[x_column].astype(str), agg_df[y_column], color=bar_color, edgecolor="#818CF8", width=0.6)
        ax.set_ylabel(y_column.replace("_", " ").title(), color="#E0E7FF", fontsize=11)
        ax.set_xlabel(x_column.replace("_", " ").title(), color="#E0E7FF", fontsize=11)
        plt.xticks(rotation=30, ha="right", color="#94A3B8")
        plt.yticks(color="#94A3B8")
    elif chart_type == "line":
        agg_df = df.groupby(x_column)[y_column].mean().reset_index()
        ax.plot(agg_df[x_column].astype(str), agg_df[y_column], color=accent_color, marker="o", linewidth=2.5)
        ax.set_ylabel(y_column.replace("_", " ").title(), color="#E0E7FF", fontsize=11)
        ax.set_xlabel(x_column.replace("_", " ").title(), color="#E0E7FF", fontsize=11)
        plt.xticks(rotation=30, ha="right", color="#94A3B8")
        plt.yticks(color="#94A3B8")
    elif chart_type == "pie":
        agg_df = df[x_column].value_counts().head(6)
        colors = ["#6366F1", "#8B5CF6", "#EC4899", "#3B82F6", "#10B981", "#F59E0B"]
        ax.pie(agg_df.values, labels=agg_df.index, colors=colors[:len(agg_df)], autopct="%1.1f%%", startangle=140)
    else:
        # Fallback to scatter
        ax.scatter(df[x_column], df[y_column], color=bar_color, alpha=0.7)
        ax.set_ylabel(y_column, color="#E0E7FF")
        ax.set_xlabel(x_column, color="#E0E7FF")

    chart_title = title or f"{chart_type.title()} Chart: {y_column} by {x_column}"
    ax.set_title(chart_title, color="#FFFFFF", fontsize=14, weight="bold", pad=15)
    ax.grid(True, linestyle="--", alpha=0.2)
    fig.patch.set_facecolor("#0F172A")
    ax.set_facecolor("#1E293B")
    
    # Save chart artifact
    output_filename = f"chart_{uuid.uuid4().hex[:8]}.png"
    output_path = settings.DATA_PATH / output_filename
    fig.tight_layout()
    fig.savefig(output_path, facecolor=fig.get_facecolor(), edgecolor="none")
    plt.close(fig)
    
    rel_path = f"workspace/data/{output_filename}"
    
    return {
        "artifact_name": output_filename,
        "artifact_path": rel_path,
        "file_size": output_path.stat().st_size,
        "chart_type": chart_type,
        "x_column": x_column,
        "y_column": y_column,
        "title": chart_title,
        "status": "generated"
    }
