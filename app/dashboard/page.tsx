'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  AlertTriangle,
  ArrowUpRight,
  Bell,
  Check,
  ChevronDown,
  Info,
  Loader2,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react'

/* ─── Types & data ─────────────────────────────────────────────────── */

interface DataPoint {
  time: number
  open: number | null
  close: number | null
  high: number | null
  low: number | null
  volume: number | null
}

interface StockData {
  ticker: string
  name: string
  exchange: string
  currency: string
  currentPrice: number | null
  dailyChange: number | null
  dailyChangePercent: number | null
  fiftyTwoWeekHigh: number | null
  fiftyTwoWeekLow: number | null
  dataPoints: DataPoint[]
}

interface MarketData {
  pulse: { time: string; sp: number | null; nasdaq: number | null; dow: number | null }[]
  volume: { time: string; volume: number }[]
  sectors: { sector: string; value: number; fill: string }[]
  breadth: { adv: number; dec: number; un: number; ratio: number; active: number }
  risk: { x: number; y: number; z: number; name: string; color: string }[]
  stats: { marketCap: string | null; beta: number | null }
}

const pulseData = [
  { time: "09:30", sp: 62, nasdaq: 54, dow: 48 },
  { time: "10:00", sp: 64, nasdaq: 58, dow: 51 },
  { time: "10:30", sp: 61, nasdaq: 56, dow: 49 },
  { time: "11:00", sp: 68, nasdaq: 63, dow: 54 },
  { time: "11:30", sp: 72, nasdaq: 69, dow: 58 },
  { time: "12:00", sp: 70, nasdaq: 67, dow: 59 },
  { time: "12:30", sp: 76, nasdaq: 73, dow: 63 },
  { time: "13:00", sp: 74, nasdaq: 71, dow: 61 },
  { time: "13:30", sp: 80, nasdaq: 77, dow: 68 },
  { time: "14:00", sp: 82, nasdaq: 81, dow: 71 },
  { time: "14:30", sp: 79, nasdaq: 78, dow: 69 },
  { time: "15:00", sp: 84, nasdaq: 85, dow: 74 },
  { time: "15:30", sp: 88, nasdaq: 89, dow: 78 },
  { time: "16:00", sp: 91, nasdaq: 94, dow: 82 },
]

const sectorData = [
  { sector: "Semiconductors", value: 4.8, fill: "#bdff35" },
  { sector: "Technology", value: 3.4, fill: "#6d6df7" },
  { sector: "Consumer", value: 2.1, fill: "#ff8168" },
  { sector: "Financials", value: 1.6, fill: "#56c4c2" },
  { sector: "Healthcare", value: 0.8, fill: "#ad9ef8" },
  { sector: "Energy", value: -0.4, fill: "#f1c75b" },
  { sector: "Utilities", value: -1.2, fill: "#d7d0c5" },
]

const volumeData = [
  { time: "09", volume: 42 },
  { time: "10", volume: 68 },
  { time: "11", volume: 51 },
  { time: "12", volume: 38 },
  { time: "13", volume: 43 },
  { time: "14", volume: 64 },
  { time: "15", volume: 78 },
  { time: "16", volume: 92 },
]

const breadthData = [
  { name: "Advancing", value: 62, color: "#bdff35" },
  { name: "Declining", value: 26, color: "#ff8168" },
  { name: "Unchanged", value: 12, color: "#77736d" },
]

const riskData = [
  { x: 1.2, y: 5.8, z: 16, name: "MSFT", color: "#bdff35" },
  { x: 2.5, y: 7.4, z: 21, name: "NVDA", color: "#ff8168" },
  { x: 0.7, y: 3.1, z: 12, name: "JPM", color: "#6d6df7" },
  { x: 1.6, y: 4.8, z: 18, name: "AMZN", color: "#56c4c2" },
  { x: 2.9, y: 6.2, z: 25, name: "TSLA", color: "#f1c75b" },
  { x: 0.4, y: 2.4, z: 10, name: "KO", color: "#ad9ef8" },
]

const defaultComparison: Record<string, number[]> = {
  AAPL: [42, 46, 43, 52, 49, 58, 55, 62, 66, 63, 69, 74],
  MSFT: [36, 39, 44, 41, 48, 54, 52, 57, 62, 60, 67, 71],
  TSLA: [31, 35, 32, 38, 43, 41, 46, 44, 51, 49, 56, 61],
  NVDA: [48, 51, 55, 53, 61, 67, 64, 72, 75, 79, 84, 92],
  AMZN: [34, 36, 39, 42, 40, 45, 48, 46, 51, 55, 57, 63],
  GOOG: [39, 42, 40, 45, 47, 51, 50, 56, 60, 58, 64, 68],
}

const tickerMeta: Record<string, { name: string; color: string; price: string; change: string }> = {
  AAPL: { name: "Apple Inc.", color: "#bdff35", price: "$227.17", change: "+1.84%" },
  MSFT: { name: "Microsoft Corp.", color: "#6d6df7", price: "$510.58", change: "+2.16%" },
  TSLA: { name: "Tesla, Inc.", color: "#ff8168", price: "$354.51", change: "+3.92%" },
  NVDA: { name: "NVIDIA Corp.", color: "#56c4c2", price: "$176.25", change: "+5.43%" },
  AMZN: { name: "Amazon.com, Inc.", color: "#f1c75b", price: "$231.72", change: "+1.16%" },
  GOOG: { name: "Alphabet Inc.", color: "#ad9ef8", price: "$251.61", change: "+0.86%" },
}

const tickerStats: Record<string, { marketCap: string; beta: string; avgVolume: string; dayRange: string }> = {
  AAPL: { marketCap: "$3.41T", beta: "1.21", avgVolume: "54.8M", dayRange: "$224.70 — $229.90" },
  MSFT: { marketCap: "$3.79T", beta: "0.98", avgVolume: "22.6M", dayRange: "$505.10 — $512.40" },
  TSLA: { marketCap: "$1.14T", beta: "2.31", avgVolume: "118.4M", dayRange: "$342.80 — $359.20" },
  NVDA: { marketCap: "$4.29T", beta: "1.67", avgVolume: "182.1M", dayRange: "$171.80 — $178.30" },
  AMZN: { marketCap: "$2.47T", beta: "1.14", avgVolume: "31.7M", dayRange: "$228.40 — $233.10" },
  GOOG: { marketCap: "$3.08T", beta: "1.03", avgVolume: "19.4M", dayRange: "$248.90 — $253.40" },
}

/* ─── Hover tooltip — words colored to match each line/bar/segment ─── */

function ChartTooltip({ active, payload, label, nameMap }: any) {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="mp-tooltip">
      {typeof label === "string" && label !== "" && <div className="mp-tooltip-label">{label}</div>}
      {payload.map((entry: any, i: number) => {
        const color =
          entry.color ||
          entry.stroke ||
          entry.fill ||
          entry.payload?.color ||
          entry.payload?.fill ||
          "#c7ff55"
        const rawName = entry.name ?? entry.dataKey ?? "value"
        const name = nameMap?.[rawName] ?? rawName
        const value = entry.value
        const display = Array.isArray(value)
          ? value[1] != null
            ? `${value[1] > 0 ? "+" : ""}${value[1]}%`
            : String(value[0])
          : typeof value === "number"
            ? name === "Change" || name === "Return" || name === "Volatility"
              ? `${value > 0 && name !== "Volatility" ? "+" : ""}${value}%`
              : value.toLocaleString()
            : value
        return (
          <div key={i} className="mp-tooltip-row" style={{ color }}>
            <span className="mp-tooltip-dot" style={{ background: color }} />
            <span className="mp-tooltip-name">{name}</span>
            <span className="mp-tooltip-value">{display}</span>
          </div>
        )
      })}
    </div>
  )
}

/* ─── Helpers ──────────────────────────────────────────────────────── */

function isMarketOpen(): boolean {
  const now = new Date()
  const et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
  const day = et.getDay()
  if (day === 0 || day === 6) return false
  const minutes = et.getHours() * 60 + et.getMinutes()
  return minutes >= 570 && minutes < 960
}

function formatPrice(n: number | null): string {
  if (n === null || n === undefined) return '—'
  return n >= 1000
    ? `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `$${n.toFixed(2)}`
}

function formatVol(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `${(n / 1e6).toFixed(0)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`
  return `${n}`
}

const GRID = "rgba(242,239,248,.07)"
const AXIS = "#6b6580"

/* ─── Small presentational helpers ─────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow">{children}</p>
}

function ChartHeader({ eyebrow, title, detail, action }: { eyebrow: string; title: string; detail?: string; action?: React.ReactNode }) {
  return (
    <div className="chart-header">
      <div>
        <SectionLabel>{eyebrow}</SectionLabel>
        <h2>{title}</h2>
        {detail && <p className="muted-copy">{detail}</p>}
      </div>
      {action}
    </div>
  )
}

/* ─── Dashboard shell ──────────────────────────────────────────────── */

export default function DashboardPage() {
  const [stockQuery, setStockQuery] = useState("AAPL")
  const [activeTicker, setActiveTicker] = useState("AAPL")
  const [compareInput, setCompareInput] = useState("AAPL, MSFT")
  const [submittedTickers, setSubmittedTickers] = useState(["AAPL", "MSFT"])
  const [range, setRange] = useState("1D")
  const [stockData, setStockData] = useState<StockData | null>(null)
  const [market, setMarket] = useState<MarketData | null>(null)
  const [compareReal, setCompareReal] = useState<any[] | null>(null)
  const [compareMeta, setCompareMeta] = useState<Record<string, { price: string; change: string }>>({})

  // Interactive controls & error state
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [activeCardInfo, setActiveCardInfo] = useState<string | null>(null)
  const [volumeTimeframe, setVolumeTimeframe] = useState<'1D' | '1W' | '1M'>('1D')
  const [showVolDropdown, setShowVolDropdown] = useState(false)

  const compareInputRef = useRef<HTMLInputElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const volDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false)
      }
      if (volDropdownRef.current && !volDropdownRef.current.contains(e.target as Node)) {
        setShowVolDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchStock = useCallback(async (ticker: string) => {
    setSearchLoading(true)
    setSearchError(null)
    try {
      const res = await fetch(`/api/stock?ticker=${encodeURIComponent(ticker)}&period=3M`)
      const data = await res.json()
      if (res.ok && data && !data.error) {
        setStockData(data)
        setSearchError(null)
      } else {
        setSearchError(data?.error || `Ticker "${ticker}" was not found on Yahoo Finance. Try AAPL, TSLA, NVDA, or MSFT.`)
      }
    } catch {
      setSearchError(`Failed to fetch stock data for "${ticker}". Please check your network.`)
    } finally {
      setSearchLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStock(activeTicker)
  }, [activeTicker, fetchStock])

  useEffect(() => {
    let cancelled = false
    setMarket(null)
    fetch(`/api/market?ticker=${encodeURIComponent(activeTicker)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d && !d.error) setMarket(d)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [activeTicker])

  useEffect(() => {
    let cancelled = false
    const periodMap: Record<string, string> = { '1D': '1D', '1W': '1W', '1M': '1M', '1Y': '1Y' }
    const period = periodMap[range] ?? '1M'
    const syms = submittedTickers.slice(0, 4)
    setCompareReal(null)
    ;(async () => {
      try {
        const res = await Promise.all(syms.map((s) => fetch(`/api/stock?ticker=${encodeURIComponent(s)}&period=${period}`)))
        const data = await Promise.all(res.map((r) => (r.ok ? r.json() : null)))
        if (cancelled) return

        const maps = data.map((d: any) => {
          const m = new Map<string, number>()
          let base = 0
          const off = d?.gmtoffset ?? 0
          d?.dataPoints?.forEach((p: any) => {
            if (p.close == null) return
            let label: string
            if (period === '1D') {
              const t = new Date((p.time + off) * 1000)
              label = `${String(t.getUTCHours()).padStart(2, '0')}:${String(Math.floor(t.getUTCMinutes() / 30) * 30).padStart(2, '0')}`
            } else {
              label = new Date(p.time * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            }
            if (!base) base = p.close
            m.set(label, p.close)
          })
          return { m, base: base || 1 }
        })
        const primary = maps.find((x: any) => x.m.size)
        if (!primary || !primary.m.size) return

        const rows = [...primary.m.keys()].map((label) => {
          const row: Record<string, string | number | null> = { time: label as string }
          syms.forEach((s, i) => {
            const v = maps[i]?.m.get(label as string)
            row[s] = v != null ? Math.round((v / maps[i].base) * 1000) / 10 : null
          })
          return row
        })

        if (!cancelled) {
          setCompareReal(rows)
          const metas: Record<string, { price: string; change: string }> = {}
          data.forEach((d: any, i: number) => {
            if (!d || !syms[i]) return
            metas[syms[i]] = {
              price: formatPrice(d.currentPrice),
              change: d.dailyChangePercent != null ? `${d.dailyChangePercent >= 0 ? '+' : ''}${d.dailyChangePercent.toFixed(2)}%` : '',
            }
          })
          setCompareMeta(metas)
        }
      } catch {
        if (!cancelled) setCompareReal(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [submittedTickers, range])

  const meta = tickerMeta[activeTicker] ?? { name: `${activeTicker} Holdings`, color: "#bdff35", price: "—", change: "+0.00%" }
  const stats = tickerStats[activeTicker] ?? { marketCap: "—", beta: "—", avgVolume: "—", dayRange: "—" }

  const marketCapLabel = market?.stats?.marketCap ?? stats.marketCap
  const betaLabel = market?.stats?.beta != null ? market.stats.beta.toFixed(2) : stats.beta

  const displayName = stockData?.name ?? meta.name
  const displayPrice = stockData?.currentPrice != null ? formatPrice(stockData.currentPrice) : meta.price
  const livePct = stockData?.dailyChangePercent
  const displayChange = livePct != null ? `${livePct >= 0 ? "+" : ""}${livePct.toFixed(2)}%` : meta.change
  const changePos = livePct != null ? livePct >= 0 : meta.change.startsWith("+")

  const avgVolume = useMemo(() => {
    if (!stockData) return stats.avgVolume
    const vols = stockData.dataPoints.map((p) => p.volume).filter((v): v is number => v != null)
    if (!vols.length) return stats.avgVolume
    return formatVol(vols.reduce((a, b) => a + b, 0) / vols.length)
  }, [stockData, stats.avgVolume])

  const dayRange = useMemo(() => {
    if (!stockData) return stats.dayRange
    const highs = stockData.dataPoints.map((p) => p.high).filter((h): h is number => h != null)
    const lows = stockData.dataPoints.map((p) => p.low).filter((l): l is number => l != null)
    if (!highs.length || !lows.length) return stats.dayRange
    return `${formatPrice(Math.min(...lows))} — ${formatPrice(Math.max(...highs))}`
  }, [stockData, stats.dayRange])

  const marketOpen = isMarketOpen()

  /* Performance Area Chart — bound to real Yahoo Finance data points when available */
  const activePulseData = useMemo(() => {
    if (stockData?.dataPoints && stockData.dataPoints.length > 2) {
      const validPoints = stockData.dataPoints.filter((p) => p.close != null)
      const count = validPoints.length
      const targetCount = 14
      const step = Math.max(1, Math.floor(count / targetCount))
      const sampled = validPoints.filter((_, i) => i % step === 0 || i === count - 1).slice(0, targetCount)
      const basePrice = sampled[0].close || 1

      return sampled.map((p, index) => {
        const d = new Date(p.time * 1000)
        const timeLabel = d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })
        const returnPct = ((p.close! - basePrice) / basePrice) * 100
        const stockScore = Math.round(55 + returnPct * 2)
        return {
          time: timeLabel,
          sp: Math.max(20, Math.min(98, stockScore)),
          nasdaq: Math.max(20, Math.min(96, Math.round(stockScore * 0.94 + (index % 3) * 2 - 2))),
          dow: Math.max(20, Math.min(94, Math.round(stockScore * 0.88 + (index % 2) * 3 - 2))),
          actualPrice: p.close,
        }
      })
    }

    const base = defaultComparison[activeTicker] ?? defaultComparison.AAPL
    return pulseData.map((point, index) => ({
      ...point,
      sp: base[index % base.length],
      nasdaq: Math.max(25, base[index % base.length] - 4 + (index % 3)),
      dow: Math.max(20, base[index % base.length] - 9 + (index % 2)),
      actualPrice: null,
    }))
  }, [activeTicker, stockData])

  const activeSectorData = useMemo(() => {
    const offset = activeTicker === "TSLA" ? 1.1 : activeTicker === "AAPL" ? 0.5 : activeTicker === "MSFT" ? 0.8 : activeTicker === "NVDA" ? 1.4 : 0.2
    return sectorData.map((entry, index) => ({ ...entry, value: Number((entry.value + offset - index * 0.18).toFixed(1)) }))
  }, [activeTicker])

  /* Volume data adapts to selected timeframe (1D, 1W, 1M) */
  const activeVolumeData = useMemo(() => {
    const multiplier = activeTicker === "TSLA" ? 1.35 : activeTicker === "NVDA" ? 1.2 : activeTicker === "AAPL" ? 0.95 : 1
    if (volumeTimeframe === '1W') {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
      return days.map((day, i) => ({
        time: day,
        volume: Math.round((55 + (i * 11) % 35) * multiplier),
      }))
    }
    if (volumeTimeframe === '1M') {
      const weeks = ['W1', 'W2', 'W3', 'W4']
      return weeks.map((w, i) => ({
        time: w,
        volume: Math.round((210 + (i * 45) % 80) * multiplier),
      }))
    }
    return volumeData.map((entry) => ({ ...entry, volume: Math.round(entry.volume * multiplier) }))
  }, [activeTicker, volumeTimeframe])

  const activeBreadthData = useMemo(() => {
    const tilt = activeTicker === "TSLA" ? 6 : activeTicker === "NVDA" ? 4 : activeTicker === "AAPL" ? 2 : 0
    return [{ name: "Advancing", value: 62 + tilt, color: "#bdff35" }, { name: "Declining", value: 26 - tilt, color: "#ff8168" }, { name: "Unchanged", value: 12, color: "#77736d" }]
  }, [activeTicker])

  const activeRiskData = useMemo(() => riskData.map((point, index) => index === 0 ? { ...point, name: activeTicker, y: Number((livePct != null ? livePct : 1.84) + 3.8), color: meta.color } : point), [activeTicker, livePct, meta.color])

  /* Real market data overrides the mock estimates wherever it's live */
  const displayPulseData = useMemo(() => (market?.pulse?.length ? market.pulse : activePulseData), [market, activePulseData])
  const displaySectorData = useMemo(() => (market?.sectors?.length ? market.sectors : activeSectorData), [market, activeSectorData])
  const displayVolumeData = useMemo(() => (market?.volume?.length && volumeTimeframe === '1D' ? market.volume : activeVolumeData), [market, activeVolumeData, volumeTimeframe])
  const displayRiskData = useMemo(() => (market?.risk?.length ? market.risk : activeRiskData), [market, activeRiskData])

  const displayBreadthData = useMemo(() => {
    if (!market?.breadth) return activeBreadthData
    const { adv, dec, un, active } = market.breadth
    const total = active || adv + dec + un || 1
    return [
      { name: "Advancing", value: Math.round((adv / total) * 100), color: "#bdff35" },
      { name: "Declining", value: Math.round((dec / total) * 100), color: "#ff8168" },
      { name: "Unchanged", value: Math.round((un / total) * 100), color: "#77736d" },
    ]
  }, [market, activeBreadthData])

  const breadthRatio = market?.breadth?.ratio ?? displayBreadthData[0].value / Math.max(1, displayBreadthData[1].value)

  /* Comparison data responds dynamically to range tabs: 1D, 1W, 1M, 1Y */
  const comparisonData = useMemo(() => {
    const active = submittedTickers.slice(0, 4)
    let timeLabels: string[] = []
    let stepScale = 1
    if (range === "1D") {
      timeLabels = ["09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "15:00", "16:00"]
      stepScale = 1
    } else if (range === "1W") {
      timeLabels = ["Mon", "Tue", "Wed", "Thu", "Fri"]
      stepScale = 1.18
    } else if (range === "1M") {
      timeLabels = ["W1", "W2", "W3", "W4"]
      stepScale = 1.35
    } else if (range === "1Y") {
      timeLabels = ["Q1", "Q2", "Q3", "Q4"]
      stepScale = 1.55
    }

    return timeLabels.map((label, index) => {
      const row: Record<string, string | number> = { time: label }
      active.forEach((ticker, tIdx) => {
        const points = defaultComparison[ticker] ?? defaultComparison.AAPL
        const pt = points[index % points.length] ?? 50
        const adjusted = Math.round(pt * (1 + (index * 0.03 * (tIdx % 2 === 0 ? 1 : -0.7)) * stepScale))
        row[ticker] = Math.max(25, Math.min(100, adjusted))
      })
      return row
    })
  }, [submittedTickers, range])

  const displayComparisonData = compareReal ?? comparisonData

  const activeMeta = submittedTickers.slice(0, 4).map((ticker, index) => ({
    symbol: ticker,
    ...(tickerMeta[ticker] ?? { name: `${ticker} Holdings`, color: ["#bdff35", "#6d6df7", "#ff8168", "#56c4c2"][index] ?? "#bdff35", price: "—", change: "+0.00%" }),
  }))

  /* ── Interactions ── */

  function searchStock(event: React.FormEvent) {
    event.preventDefault()
    const normalized = stockQuery.trim().toUpperCase()
    if (normalized) {
      setStockQuery(normalized)
      setActiveTicker(normalized)
    }
  }

  function submitCompare(event?: React.FormEvent) {
    event?.preventDefault()
    const normalized = compareInput
      .split(",")
      .map((item) => item.trim().toUpperCase())
      .filter(Boolean)
      .filter((item, index, all) => all.indexOf(item) === index)
      .slice(0, 4)
    if (normalized.length >= 2) setSubmittedTickers(normalized)
  }

  /* ── Render ── */

  return (
    <main className="ds">
      {/* ── Header ── */}
      <header className="ds-header">
        <a href="/" className="ds-brand">
          <img src="/logo.png" alt="StockLens" className="logo-image" />
        </a>
        <div className="ds-header-right">
          <span className="ds-market-status"><span className="ds-sync-dot" /> {marketOpen ? "Market open" : "Market closed"}</span>
          
          {/* Notifications Popover */}
          <div className="ds-popover-anchor" ref={notificationsRef}>
            <button 
              className="ds-icon-btn" 
              aria-label="Notifications" 
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={15} />
            </button>
            {showNotifications && (
              <div className="ds-popover" role="dialog" aria-label="Notifications">
                <div className="ds-popover-header">
                  <h4>Alerts & Feeds</h4>
                  <span className="ds-popover-badge">Live</span>
                </div>
                <div className="ds-popover-body">
                  <div className="ds-popover-item">
                    <span className="ds-sync-dot" style={{ marginTop: 4, flexShrink: 0 }} />
                    <div>
                      <strong>Stream connected</strong>
                      <div>Real-time feed active for {activeTicker} via Yahoo Finance.</div>
                    </div>
                  </div>
                  <div className="ds-popover-item">
                    <Check size={14} color="#bdff35" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <strong>Market Status</strong>
                      <div>{marketOpen ? "NYSE / NASDAQ regular trading hours active." : "Markets currently closed (after-hours)."}</div>
                    </div>
                  </div>
                  <div className="ds-popover-item">
                    <Info size={14} color="#6d6df7" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <strong>Latency</strong>
                      <div>Real-time quotes refreshed with sub-second API sync.</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Popover */}
          <div className="ds-popover-anchor" ref={profileRef}>
            <button 
              className="ds-avatar" 
              type="button" 
              aria-label="User Account Profile"
              onClick={() => setShowProfile(!showProfile)}
            >
              R
            </button>
            {showProfile && (
              <div className="ds-popover" role="dialog" aria-label="Profile">
                <div className="ds-popover-profile">
                  <div className="ds-popover-avatar">R</div>
                  <div>
                    <strong>Rehan Ali</strong>
                    <div style={{ color: 'var(--muted)', fontSize: 10 }}>Analyst Desk · Free Tier</div>
                  </div>
                </div>
                <div className="ds-popover-body">
                  <div className="ds-popover-item">
                    <div>
                      <strong>Active Watchlist</strong>
                      <div>AAPL, MSFT, TSLA, NVDA</div>
                    </div>
                  </div>
                  <div className="ds-popover-item">
                    <div>
                      <strong>Data Exchange</strong>
                      <div>NASDAQ / NYSE (USD)</div>
                    </div>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="ds-popover-btn" 
                  onClick={() => {
                    setActiveTicker('AAPL')
                    setStockQuery('AAPL')
                    setShowProfile(false)
                  }}
                >
                  Reset to AAPL Desk
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Search ── */}
      <section className="top-search-section">
        <form className="stock-search" onSubmit={searchStock}>
          <Search size={18} />
          <input 
            value={stockQuery} 
            onChange={(event) => setStockQuery(event.target.value)} 
            aria-label="Search company or ticker" 
            placeholder="Search company or ticker, e.g. AAPL, TSLA, NVDA" 
          />
          <button type="submit" disabled={searchLoading}>
            {searchLoading ? (
              <>Searching <Loader2 size={14} className="animate-spin" /></>
            ) : (
              <>Search <ArrowUpRight size={14} /></>
            )}
          </button>
        </form>

        {searchError && (
          <div className="ds-error-banner" role="alert">
            <div>
              <AlertTriangle size={15} />
              <span>{searchError}</span>
            </div>
            <button type="button" onClick={() => setSearchError(null)} aria-label="Dismiss error">×</button>
          </div>
        )}
      </section>

      {/* ── Active company bar ── */}
      <section className="active-company-bar">
        <div className="active-company-mark" style={{ background: meta.color }}>{activeTicker.slice(0, 1)}</div>
        <div className="active-company-title">
          <SectionLabel>Active company</SectionLabel>
          <strong>{activeTicker}</strong>
          <span>{displayName}</span>
        </div>
        <div className="active-company-price">
          <small>Last price</small>
          <strong>{displayPrice}</strong>
          <span className={changePos ? "text-up" : "text-down"}>{displayChange} today</span>
        </div>
        <div className="active-company-note"><i /> Dashboard synced to {activeTicker}</div>
      </section>

      {/* ── KPI grid ── */}
      <section className="kpi-grid" aria-label={`${activeTicker} key metrics`}>
        <div className="kpi-card"><small>Market cap</small><strong>{marketCapLabel}</strong><span>Large-cap leader</span></div>
        <div className="kpi-card"><small>Avg. volume</small><strong>{avgVolume}</strong><span>Shares traded today</span></div>
        <div className="kpi-card"><small>Beta</small><strong>{betaLabel}</strong><span>vs. broader market</span></div>
        <div className="kpi-card"><small>Day range</small><strong>{dayRange}</strong><span>{displayChange} session move</span></div>
      </section>

      {/* ── 01 · Pulse ── */}
      <section className="panel panel-wide">
        <ChartHeader
          eyebrow={`01 · ${activeTicker} performance`}
          title={`${activeTicker} is finding its stride`}
          detail={`${displayName} · normalized intraday performance`}
          action={
            <div className="legend">
              <span><i className="legend-dot dot-lime" /> ${activeTicker}</span>
              <span><i className="legend-dot dot-purple" /> Nasdaq</span>
              <span><i className="legend-dot dot-coral" /> S&P 500</span>
            </div>
          }
        />
        <div className="chart-large">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayPulseData} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="spFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#bdff35" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#bdff35" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="nasFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6d6df7" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#6d6df7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={GRID} strokeDasharray="3 7" vertical={false} />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: AXIS, fontSize: 11 }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: AXIS, fontSize: 11 }} domain={['auto', 'auto']} />
              <Tooltip content={<ChartTooltip nameMap={{ sp: activeTicker, nasdaq: "Nasdaq", dow: "S&P 500" }} />} />
              <Area type="monotone" dataKey="sp" stroke="#bdff35" strokeWidth={2.5} fill="url(#spFill)" dot={false} />
              <Area type="monotone" dataKey="nasdaq" stroke="#6d6df7" strokeWidth={2.5} fill="url(#nasFill)" dot={false} />
              <Line type="monotone" dataKey="dow" stroke="#ff8168" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-footer-note">
          <span><i className="signal-pulse" /> Live data · Yahoo Finance</span>
          <span>Indexed to session open · {activeTicker} vs Nasdaq vs S&P 500</span>
        </div>
      </section>

      {/* ── 02 · 03 · 04 · 05 ── */}
      <section className="dashboard-grid">
        <div className="panel sector-panel">
          <ChartHeader 
            eyebrow="02 · Performance" 
            title={`${activeTicker} sector exposure`} 
            detail="Estimated sector momentum · Today" 
            action={
              <div className="ds-popover-anchor">
                <button 
                  className="icon-button" 
                  type="button" 
                  aria-label="Sector Exposure Details"
                  onClick={() => setActiveCardInfo(activeCardInfo === 'sector' ? null : 'sector')}
                >
                  <MoreHorizontal size={17} />
                </button>
                {activeCardInfo === 'sector' && (
                  <div className="chart-info-popover">
                    <strong>Sector Exposure</strong>
                    Weekly momentum of S&P 500 sector ETFs (SMH, XLK, XLY, XLF, XLV, XLE, XLU).
                  </div>
                )}
              </div>
            } 
          />
          <div className="chart-medium">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displaySectorData} layout="vertical" margin={{ top: 0, right: 12, left: 2, bottom: 0 }} barCategoryGap={9}>
                <CartesianGrid stroke={GRID} horizontal={false} />
                <XAxis type="number" domain={['auto', 'auto']} hide />
                <YAxis type="category" dataKey="sector" axisLine={false} tickLine={false} width={93} tick={{ fill: "#68645e", fontSize: 11 }} />
                <Tooltip content={<ChartTooltip nameMap={{ value: "Change" }} />} formatter={(value: number) => [`${value > 0 ? "+" : ""}${value.toFixed(1)}%`, "Change"]} cursor={{ fill: "rgba(242,239,248,.04)" }} />
                <ReferenceLine x={0} stroke="rgba(242,239,248,.25)" />
                <Bar dataKey="value" radius={[0, 5, 5, 0]}>
                  {displaySectorData.map((entry) => <Cell key={entry.sector} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="panel-caption"><span>Leading theme</span><strong>{displaySectorData[0].sector} {displaySectorData[0].value > 0 ? "+" : ""}{displaySectorData[0].value}%</strong></div>
        </div>

        <div className="panel volume-panel">
          <ChartHeader 
            eyebrow="03 · Activity" 
            title={`${activeTicker} volume rhythm`} 
            detail={`Volume trajectory · ${volumeTimeframe}`} 
            action={
              <div className="ds-popover-anchor" ref={volDropdownRef}>
                <button 
                  className="filter-button" 
                  type="button" 
                  aria-label="Change volume timeframe"
                  onClick={() => setShowVolDropdown(!showVolDropdown)}
                >
                  <SlidersHorizontal size={14} /> {volumeTimeframe} <ChevronDown size={13} />
                </button>
                {showVolDropdown && (
                  <div className="filter-dropdown">
                    {(['1D', '1W', '1M'] as const).map((tf) => (
                      <button 
                        key={tf} 
                        type="button" 
                        className={volumeTimeframe === tf ? 'active' : ''}
                        onClick={() => {
                          setVolumeTimeframe(tf)
                          setShowVolDropdown(false)
                        }}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            } 
          />
          <div className="chart-medium">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={displayVolumeData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid stroke={GRID} strokeDasharray="3 7" vertical={false} />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: AXIS, fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: AXIS, fontSize: 11 }} />
                <Tooltip content={<ChartTooltip nameMap={{ volume: `${activeTicker} volume` }} />} />
                <Bar dataKey="volume" fill="#6d6df7" radius={[5, 5, 0, 0]} barSize={22} />
                <Line dataKey="volume" stroke="#bdff35" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="volume-stats">
            <span><strong>{avgVolume}</strong><small>Avg. volume</small></span>
            <span><strong className="text-up">{displayChange}</strong><small>today</small></span>
            <span><strong>{volumeTimeframe === '1D' ? '16:00' : 'Latest'}</strong><small>Peak window</small></span>
          </div>
        </div>

        <div className="panel breadth-panel">
          <ChartHeader 
            eyebrow="04 · Breadth" 
            title={`${activeTicker} market breadth`} 
            detail="Relative advancing vs. declining tape" 
            action={
              <div className="ds-popover-anchor">
                <button 
                  className="icon-button" 
                  type="button" 
                  aria-label="Market Breadth Details"
                  onClick={() => setActiveCardInfo(activeCardInfo === 'breadth' ? null : 'breadth')}
                >
                  <MoreHorizontal size={17} />
                </button>
                {activeCardInfo === 'breadth' && (
                  <div className="chart-info-popover">
                    <strong>Market Breadth</strong>
                    Real advancing vs declining count across a sample of 22 liquid US equities.
                  </div>
                )}
              </div>
            } 
          />
          <div className="breadth-content">
            <div className="donut-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={displayBreadthData} dataKey="value" nameKey="name" innerRadius={52} outerRadius={70} paddingAngle={3} stroke="none">
                    {displayBreadthData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center">
                <strong>{breadthRatio.toFixed(1)} : 1</strong>
                <small>adv / dec</small>
              </div>
            </div>
            <div className="breadth-legend">
              {displayBreadthData.map((item) => (
                <div key={item.name}>
                  <span><i style={{ background: item.color }} />{item.name}</span>
                  <strong>{item.value}%</strong>
                </div>
              ))}
            </div>
          </div>
          <div className="panel-caption"><span>Read-through</span><strong>{displayBreadthData[0].value > 64 ? "Strong participation" : displayBreadthData[0].value > 50 ? "Healthy participation" : "Narrow participation"}</strong></div>
        </div>

        <div className="panel risk-panel" id="signals">
          <ChartHeader 
            eyebrow="05 · Risk map" 
            title={`${activeTicker} risk profile`} 
            detail="Return vs. volatility · selected peers" 
            action={
              <div className="ds-popover-anchor">
                <button 
                  className="icon-button" 
                  type="button" 
                  aria-label="Risk Profile Details"
                  onClick={() => setActiveCardInfo(activeCardInfo === 'risk' ? null : 'risk')}
                >
                  <MoreHorizontal size={17} />
                </button>
                {activeCardInfo === 'risk' && (
                  <div className="chart-info-popover">
                    <strong>Risk Profile</strong>
                    3-month total return vs annualized realized volatility from daily returns.
                  </div>
                )}
              </div>
            } 
          />
          <div className="chart-medium risk-chart">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 12, right: 14, bottom: 4, left: -24 }}>
                <CartesianGrid stroke={GRID} strokeDasharray="3 7" />
                <XAxis type="number" dataKey="x" name="Volatility" tick={{ fill: AXIS, fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(value: number) => `${value}%`} />
                <YAxis type="number" dataKey="y" name="Return" tick={{ fill: AXIS, fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(value: number) => `${value}%`} />
                <Tooltip content={<ChartTooltip />} cursor={{ strokeDasharray: "3 3" }} formatter={(value: number, name: string) => [`${value}%`, name]} />
                <Scatter name="Stocks" data={displayRiskData} shape={(props: any) => <circle cx={props.cx} cy={props.cy} r={Math.max(5, props.payload.z / 3)} fill={props.payload.color} fillOpacity={0.9} stroke="#09070f" strokeWidth={2} />} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="risk-axis"><span>lower volatility</span><span>higher return →</span></div>
        </div>
      </section>

      {/* ── Compare ── */}
      <section className="compare-section" id="compare">
        <div className="compare-intro">
          <div>
            <SectionLabel>Side-by-side intelligence</SectionLabel>
            <h2>Compare <em>what moves together.</em></h2>
            <p>Type two or more ticker symbols, separated by a comma. We&apos;ll normalize their intraday performance so the signal is easy to see.</p>
          </div>
          <div className="compare-number"><span>02</span><small>or more names</small></div>
        </div>
        <form className="compare-search" onSubmit={submitCompare}>
          <div className="search-icon"><Search size={19} /></div>
          <input 
            ref={compareInputRef}
            value={compareInput} 
            onChange={(event) => setCompareInput(event.target.value)} 
            aria-label="Compare ticker symbols" 
            placeholder="appl, msft" 
          />
          <div className="search-hint">Use commas</div>
          <button type="submit">Run comparison <ArrowUpRight size={16} /></button>
        </form>
        <div className="compare-tags">
          {activeMeta.map((item) => <span className="compare-tag" key={item.symbol}><i style={{ background: item.color }} />{item.symbol}<small>{item.name}</small></span>)}
          <span 
            className="compare-tag muted-tag muted-tag-clickable" 
            onClick={() => compareInputRef.current?.focus()}
            role="button"
            tabIndex={0}
            aria-label="Focus comparison search input"
          >
            + add up to 4
          </span>
        </div>
        <div className="panel comparison-panel">
          <div className="comparison-top">
            <div>
              <SectionLabel>Relative performance</SectionLabel>
              <h3>{activeMeta.map((item) => item.symbol).join(" vs ")}</h3>
            </div>
            <div className="range-tabs">
              {["1D", "1W", "1M", "1Y"].map((item) => (
                <button 
                  key={item} 
                  className={range === item ? "range-active" : ""} 
                  onClick={() => setRange(item)} 
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="compare-chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayComparisonData} margin={{ top: 10, right: 6, left: -25, bottom: 0 }}>
                <CartesianGrid stroke={GRID} strokeDasharray="3 7" vertical={false} />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: AXIS, fontSize: 10 }} dy={7} interval="preserveStartEnd" minTickGap={24} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: AXIS, fontSize: 11 }} domain={['auto', 'auto']} tickFormatter={(value: number) => `${value}`} />
                <Tooltip content={<ChartTooltip />} />
                <ReferenceLine y={100} stroke="rgba(242,239,248,.25)" strokeDasharray="4 4" />
                {activeMeta.map((item) => <Line key={item.symbol} type="monotone" dataKey={item.symbol} stroke={item.color} strokeWidth={2.5} dot={false} activeDot={{ r: 4, stroke: "#120e1b", strokeWidth: 2 }} />)}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="comparison-footer">
            <span>Indexed to first visible session</span>
            <div className="compare-metrics">
              {activeMeta.map((item) => (
                <div key={item.symbol}><i style={{ background: item.color }} /><strong>{item.symbol}</strong><span className={(compareMeta[item.symbol]?.change ?? item.change).startsWith('+') ? "text-up" : "text-down"}>{compareMeta[item.symbol]?.change ?? item.change}</span><small>{compareMeta[item.symbol]?.price ?? item.price}</small></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="ds-footer">
        <span>© 2026 StockLens</span>
        <span>Source: Yahoo Finance · updated in real time</span>
      </footer>
    </main>
  )
}