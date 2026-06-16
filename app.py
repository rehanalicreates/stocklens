import dash
from dash import dcc, html, Input, Output, State, ctx
import dash_bootstrap_components as dbc
import plotly.graph_objects as go

from data import fetch_stock, fetch_info, compare_stocks

app = dash.Dash(__name__, external_stylesheets=[dbc.themes.CYBORG], title="StockLens")

DARK  = "#0d1117"
CARD  = "#161b22"
GREEN = "#3fb950"
RED   = "#f85149"
WHITE = "#e6edf3"
MUTED = "#8b949e"

PERIODS = ["1W", "1M", "3M", "6M", "1Y", "5Y"]

def empty_fig():
    return go.Figure().update_layout(
        paper_bgcolor=DARK, plot_bgcolor=DARK,
        font_color=WHITE, margin=dict(l=10,r=10,t=40,b=10),
        xaxis=dict(visible=False), yaxis=dict(visible=False)
    )

def kpi_card(label, value_id):
    return dbc.Col(dbc.Card([
        html.P(label, className="text-muted mb-1",
               style={"fontSize": "0.72rem", "letterSpacing": "0.08em"}),
        html.H5(id=value_id, children="—", style={"color": WHITE, "fontWeight": 700}),
    ], body=True, style={"background": CARD, "border": "1px solid #21262d"}), xs=6, md=2)


app.layout = dbc.Container(fluid=True,
    style={"background": DARK, "minHeight": "100vh", "padding": "1.5rem"},
    children=[

    dbc.Row(dbc.Col(html.Div([
        html.H2("📈 StockLens", style={"color": WHITE, "fontWeight": 800,
                                        "display": "inline", "marginRight": "1rem"}),
        html.Span("Real-Time Stock Dashboard", style={"color": MUTED, "fontSize": "0.95rem"}),
    ])), className="mb-3"),

    dbc.Row([
        dbc.Col(dbc.Input(id="ticker-input",
                          placeholder="Enter ticker — e.g. AAPL, TSLA, GOOGL",
                          debounce=True,
                          style={"background": CARD, "color": WHITE, "border": "1px solid #30363d"}),
                md=5),
        dbc.Col(dbc.ButtonGroup([
            dbc.Button(p, id=f"btn-{p}", size="sm", outline=True, color="light",
                       n_clicks=0, style={"fontSize": "0.78rem"}) for p in PERIODS
        ]), md=5),
        dbc.Col(dbc.Input(id="alert-input", placeholder="Alert price (USD)",
                          type="number",
                          style={"background": CARD, "color": WHITE, "border": "1px solid #30363d"}),
                md=2),
    ], className="mb-3 g-2"),

    dbc.Row(dbc.Col(html.Div(id="alert-banner"), width=12), className="mb-2"),

    dbc.Row([
        kpi_card("COMPANY",      "kpi-name"),
        kpi_card("LATEST PRICE", "kpi-price"),
        kpi_card("DAY CHANGE",   "kpi-change"),
        kpi_card("MARKET CAP",   "kpi-mcap"),
        kpi_card("52W HIGH",     "kpi-52h"),
        kpi_card("52W LOW",      "kpi-52l"),
    ], className="mb-3 g-2"),

    dbc.Row([
        dbc.Col(dcc.Graph(id="candle-chart", config={"displayModeBar": False},
                          style={"height": "420px"}), md=8),
        dbc.Col(dcc.Graph(id="return-chart", config={"displayModeBar": False},
                          style={"height": "420px"}), md=4),
    ], className="mb-3"),

    dbc.Row(dbc.Col([
        dbc.Input(id="compare-input",
                  placeholder="Compare tickers (comma-separated): AAPL, MSFT, TSLA",
                  debounce=True,
                  style={"background": CARD, "color": WHITE,
                         "border": "1px solid #30363d", "marginBottom": "0.75rem"}),
        dcc.Graph(id="compare-chart", config={"displayModeBar": False},
                  style={"height": "340px"}),
    ], width=12)),

    dcc.Store(id="period-store", data="1M"),
    dcc.Interval(id="refresh", interval=60_000, n_intervals=0),
])


@app.callback(
    Output("period-store", "data"),
    [Input(f"btn-{p}", "n_clicks") for p in PERIODS],
    prevent_initial_call=True,
)
def set_period(*_):
    if not ctx.triggered_id:
        return "1M"
    return ctx.triggered_id.replace("btn-", "")


@app.callback(
    Output("candle-chart", "figure"),
    Output("return-chart", "figure"),
    Output("kpi-name",     "children"),
    Output("kpi-price",    "children"),
    Output("kpi-change",   "children"),
    Output("kpi-change",   "style"),
    Output("kpi-mcap",     "children"),
    Output("kpi-52h",      "children"),
    Output("kpi-52l",      "children"),
    Output("alert-banner", "children"),
    Input("ticker-input",  "value"),
    Input("period-store",  "data"),
    Input("refresh",       "n_intervals"),
    State("alert-input",   "value"),
)
def update_main(ticker, period, _, alert_price):
    from charts import candlestick_chart, returns_chart

    if not ticker:
        return empty_fig(), empty_fig(), "—","—","—",{},"—","—","—",""

    ticker = ticker.strip().upper()
    df = fetch_stock(ticker, period)

    if df.empty:
        msg = dbc.Alert(f"❌ '{ticker}' not found or no data.", color="danger", dismissable=True)
        return empty_fig(), empty_fig(), "—","—","—",{},"—","—","—", msg

    info   = fetch_info(ticker)
    latest = float(df["Close"].iloc[-1])
    prev   = float(df["Close"].iloc[-2]) if len(df) > 1 else latest
    change = latest - prev
    pct    = (change / prev) * 100
    arrow  = "▲" if change >= 0 else "▼"
    chg_str   = f"{arrow} ${abs(change):.2f} ({abs(pct):.2f}%)"
    chg_style = {"color": GREEN if change >= 0 else RED, "fontWeight": 700}

    mcap = info.get("market")
    mcap_str = f"${mcap/1e9:.1f}B" if mcap else "—"

    banner = ""
    if alert_price:
        if latest >= float(alert_price):
            banner = dbc.Alert(f"🔔 {ticker} hit ${latest:.2f} — above your alert of ${alert_price}!",
                               color="success", dismissable=True)
        else:
            banner = dbc.Alert(f"⏳ {ticker} at ${latest:.2f} — alert set at ${alert_price}",
                               color="secondary", dismissable=True)

    return (
        candlestick_chart(df, ticker),
        returns_chart(df, ticker),
        info.get("name", ticker),
        f"${latest:.2f}",
        chg_str, chg_style,
        mcap_str,
        f"${info.get('week52h', 0):.2f}" if info.get("week52h") else "—",
        f"${info.get('week52l', 0):.2f}" if info.get("week52l") else "—",
        banner,
    )


@app.callback(
    Output("compare-chart", "figure"),
    Input("compare-input",  "value"),
    Input("period-store",   "data"),
)
def update_comparison(tickers_str, period):
    from charts import comparison_chart
    if not tickers_str:
        return empty_fig()
    tickers = [t.strip().upper() for t in tickers_str.split(",") if t.strip()]
    if len(tickers) < 2:
        return empty_fig()
    df = compare_stocks(tickers, period)
    return comparison_chart(df) if not df.empty else empty_fig()


if __name__ == "__main__":
    app.run(debug=True)
