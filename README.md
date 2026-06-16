# 📈 StockLens — Real-Time Stock Dashboard

## 📌 Business Problem
Financial data is scattered, raw, and hard to interpret quickly.
This project builds an interactive real-time stock dashboard that pulls
live market data, computes key technical indicators, and visualizes
everything in one place — helping analysts, investors, and finance
enthusiasts make faster, data-driven decisions.

---

## 📁 Data Source
Source: [Yahoo Finance via yfinance](https://pypi.org/project/yfinance/) — 100% Free, No API Key Required

| Data Field     | Description                                      |
|----------------|--------------------------------------------------|
| Open           | Opening price of the stock for the period        |
| High           | Highest price during the period                  |
| Low            | Lowest price during the period                   |
| Close          | Closing price of the stock for the period        |
| Volume         | Number of shares traded                          |
| MA7            | 7-period Moving Average (short-term trend)       |
| MA30           | 30-period Moving Average (long-term trend)       |
| Return %       | Daily percentage change in closing price         |
| Market Cap     | Total market capitalization of the company       |
| 52W High/Low   | 52-week highest and lowest price                 |

---

## ⚙️ Features

### 1. Live Price Tracking
- Fetches real-time stock data using `yfinance`
- Auto-refreshes every 60 seconds
- Supports any valid ticker: AAPL, TSLA, GOOGL, MSFT, etc.

### 2. Technical Indicators
- **MA7** — 7-period Moving Average (short-term momentum)
- **MA30** — 30-period Moving Average (long-term trend)
- **Daily Return %** — percentage change per period

### 3. Time Period Selection
- 1W / 1M / 3M / 6M / 1Y / 5Y
- Auto-adjusts interval (hourly → daily → weekly) per period

### 4. Price Alert System
- Set a target price
- Dashboard shows a live banner when the price crosses your alert

### 5. Multi-Stock Comparison
- Enter multiple tickers (AAPL, MSFT, TSLA)
- Normalizes all to base 100 for fair comparison

### 6. KPI Cards
- Company Name, Latest Price, Day Change
- Market Cap, 52-Week High, 52-Week Low

---

## 📊 Visuals Inside the Dashboard

| Chart                        | Description                                         |
|------------------------------|-----------------------------------------------------|
| Candlestick + MA Chart       | OHLCV candlesticks with MA7 & MA30 overlays         |
| Volume Bar Chart             | Green/red volume bars below the price chart         |
| Daily Returns Chart          | Bar chart of % change per day                       |
| Normalized Comparison Chart  | Multi-stock indexed performance (base = 100)        |

---

## 🚀 Key Insights You Can Get
- See if a stock is in an **uptrend or downtrend** using MA crossovers
- Spot **high volatility days** from the returns chart
- Compare **which stock performed better** over a period
- Get **instant alerts** when a price target is hit
- Analyze **market cap and valuation** from KPI cards

---

## 🛠 Tools Used
- Python 3.12
- `yfinance` — free Yahoo Finance data API
- `pandas` — data wrangling & indicator calculation
- `plotly` — interactive charts
- `dash` + `dash-bootstrap-components` — web dashboard framework

---

## 📁 Project Structure

```
StockLens/
│
├── app.py            # Main Dash app — layout & all callbacks
├── data.py           # Data fetching, processing & indicator logic
├── charts.py         # All Plotly chart figure builders
└── requirements.txt  # Project dependencies
```

---

## ▶️ How to Run

```bash
# 1. Clone the repository
git clone https://github.com/rehanalicreates/stocklens.git
cd stocklens

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run the dashboard
python app.py

# 4. Open in your browser
# http://127.0.0.1:8050
```

---

## 💡 How to Use

1. **Type any stock ticker** in the search box (e.g. `AAPL`)
2. **Click a time period** — 1W, 1M, 3M, 6M, 1Y, or 5Y
3. **Set an alert price** to get notified when the price crosses it
4. **Type multiple tickers** in the comparison box (e.g. `AAPL, MSFT, TSLA`)
5. Dashboard **auto-refreshes every 60 seconds**

---

## 👤 Author
**Rehan Ali Haider** — Data Analyst
[GitHub](https://github.com/rehanalicreates)
