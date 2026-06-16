import plotly.graph_objects as go
from plotly.subplots import make_subplots
import pandas as pd

DARK = "#0d1117"
CARD = "#161b22"
GREEN = "#3fb950"
RED   = "#f85149"
BLUE  = "#58a6ff"
GOLD  = "#d29922"
MUTED = "#8b949e"
WHITE = "#e6edf3"

LAYOUT_BASE = dict(
    paper_bgcolor=DARK, plot_bgcolor=DARK,
    font=dict(color=WHITE, family="Inter, sans-serif"),
    margin=dict(l=10, r=10, t=40, b=10),
    legend=dict(bgcolor=CARD, bordercolor=MUTED, borderwidth=1),
    xaxis=dict(gridcolor="#21262d", showgrid=True, zeroline=False),
    yaxis=dict(gridcolor="#21262d", showgrid=True, zeroline=False),
)


def candlestick_chart(df: pd.DataFrame, ticker: str) -> go.Figure:
    fig = make_subplots(rows=2, cols=1, shared_xaxes=True,
                        row_heights=[0.75, 0.25], vertical_spacing=0.02)

    fig.add_trace(go.Candlestick(
        x=df.index, open=df["Open"], high=df["High"],
        low=df["Low"], close=df["Close"], name="Price",
        increasing_line_color=GREEN, decreasing_line_color=RED,
        increasing_fillcolor=GREEN, decreasing_fillcolor=RED,
    ), row=1, col=1)

    for col, color, dash in [("MA7", BLUE, "dot"), ("MA30", GOLD, "dash")]:
        if col in df.columns and df[col].notna().any():
            fig.add_trace(go.Scatter(
                x=df.index, y=df[col], name=col,
                line=dict(color=color, width=1.5, dash=dash), opacity=0.85,
            ), row=1, col=1)

    colors = [GREEN if v >= 0 else RED for v in df["Volume"]]
    fig.add_trace(go.Bar(
        x=df.index, y=df["Volume"], name="Volume",
        marker_color=colors, opacity=0.7,
    ), row=2, col=1)

    fig.update_layout(title=f"{ticker} — Price & Volume", xaxis_rangeslider_visible=False, **LAYOUT_BASE)
    fig.update_yaxes(title_text="Price (USD)", row=1, col=1)
    fig.update_yaxes(title_text="Volume", row=2, col=1)
    return fig


def returns_chart(df: pd.DataFrame, ticker: str) -> go.Figure:
    colors = [GREEN if v >= 0 else RED for v in df["Return"].dropna()]
    fig = go.Figure(go.Bar(
        x=df.index[1:], y=df["Return"].dropna(),
        marker_color=colors, name="Daily Return %",
    ))
    fig.update_layout(title=f"{ticker} — Daily Returns (%)", **LAYOUT_BASE)
    return fig


def comparison_chart(df: pd.DataFrame) -> go.Figure:
    palette = [BLUE, GREEN, GOLD, RED, "#bc8cff", "#79c0ff"]
    fig = go.Figure()
    for i, col in enumerate(df.columns):
        fig.add_trace(go.Scatter(
            x=df.index, y=df[col], name=col,
            line=dict(color=palette[i % len(palette)], width=2),
        ))
    fig.update_layout(
        title="Normalized Performance (base = 100)",
        yaxis_title="Indexed Price", **LAYOUT_BASE,
    )
    return fig
