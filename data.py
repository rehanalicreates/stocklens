import yfinance as yf
import pandas as pd


PERIODS = {"1W": "7d", "1M": "1mo", "3M": "3mo", "6M": "6mo", "1Y": "1y", "5Y": "5y"}
INTERVALS = {"1W": "1h", "1M": "1d", "3M": "1d", "6M": "1d", "1Y": "1wk", "5Y": "1wk"}


def fetch_stock(ticker: str, period_label: str = "1M") -> pd.DataFrame:
    period = PERIODS.get(period_label, "1mo")
    interval = INTERVALS.get(period_label, "1d")
    df = yf.download(ticker, period=period, interval=interval, progress=False, auto_adjust=True)
    if df.empty:
        return df
    df.columns = [c[0] if isinstance(c, tuple) else c for c in df.columns]
    df = df[["Open", "High", "Low", "Close", "Volume"]].dropna()
    df["MA7"]  = df["Close"].rolling(7).mean()
    df["MA30"] = df["Close"].rolling(30).mean()
    df["Return"] = df["Close"].pct_change() * 100
    return df


def fetch_info(ticker: str) -> dict:
    try:
        info = yf.Ticker(ticker).info
        return {
            "name":    info.get("longName", ticker),
            "sector":  info.get("sector", "—"),
            "market":  info.get("marketCap"),
            "pe":      info.get("trailingPE"),
            "week52h": info.get("fiftyTwoWeekHigh"),
            "week52l": info.get("fiftyTwoWeekLow"),
        }
    except Exception:
        return {}


def compare_stocks(tickers: list[str], period_label: str = "1M") -> pd.DataFrame:
    frames = []
    for t in tickers:
        df = fetch_stock(t.strip().upper(), period_label)
        if not df.empty:
            base = df["Close"].iloc[0]
            frames.append((df["Close"] / base * 100).rename(t.upper()))
    return pd.concat(frames, axis=1).dropna() if frames else pd.DataFrame()
