import { useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { getEloStock } from "../services/api";

const RANGE_OPTIONS = [
  { label: "1W", value: "7d" },
  { label: "1M", value: "30d" },
  { label: "3M", value: "90d" },
  { label: "6M", value: "180d" },
  { label: "1Y", value: "365d" },
];

const MAX_POINTS = 500;

function normalizePoints(points = []) {
  return points
    .filter((point) => point)
    .slice(-MAX_POINTS)
    .map((point) => {
      const timeInput =
        point.time || point.timestamp || point.date || point.created_at;
      const value =
        point.value ?? point.elo ?? point.rating ?? point.score ?? point.y;
      const parsedTime =
        typeof timeInput === "number"
          ? timeInput > 9999999999
            ? Math.floor(timeInput / 1000)
            : Math.floor(timeInput)
          : Math.floor(Date.parse(timeInput || new Date()) / 1000);
      return {
        time: parsedTime,
        value: Number(value),
      };
    })
    .filter((point) => Number.isFinite(point.time) && Number.isFinite(point.value));
}

function formatValue(value) {
  if (value === null || value === undefined) return "--";
  return Math.round(value);
}

function formatDateLabel(timeInSeconds) {
  if (!timeInSeconds) return "";
  const date = new Date(timeInSeconds * 1000);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

class SimpleAreaChart {
  constructor(container) {
    this.container = container;
    this.canvas = document.createElement("canvas");
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this.canvas.style.display = "block";
    container.innerHTML = "";
    container.appendChild(this.canvas);

    this.ctx = this.canvas.getContext("2d");
    this.seriesData = [];
    this.pixelPoints = [];
    this.crosshairListeners = new Set();

    this.handleResize = this.handleResize.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerLeave = this.handlePointerLeave.bind(this);

    this.resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(this.handleResize)
        : null;
    if (this.resizeObserver) {
      this.resizeObserver.observe(container);
    } else {
      window.addEventListener("resize", this.handleResize);
    }

    this.canvas.addEventListener("pointermove", this.handlePointerMove);
    this.canvas.addEventListener("pointerleave", this.handlePointerLeave);
    this.canvas.addEventListener("touchstart", this.handlePointerMove);
    this.canvas.addEventListener("touchmove", this.handlePointerMove);

    this.handleResize();
  }

  setSize() {
    const { width, height } = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.canvas.width = Math.max(1, Math.floor(width * dpr));
    this.canvas.height = Math.max(1, Math.floor(height * dpr));
    this.ctx.scale(dpr, dpr);
  }

  addAreaSeries() {
    const series = {
      setData: (data) => {
        this.seriesData = data || [];
        this.draw();
      },
    };
    this.seriesRef = series;
    return series;
  }

  timeScale() {
    return {
      fitContent: () => {
        // No-op for the lightweight implementation.
      },
    };
  }

  subscribeCrosshairMove(callback) {
    this.crosshairListeners.add(callback);
  }

  unsubscribeCrosshairMove(callback) {
    this.crosshairListeners.delete(callback);
  }

  handleResize() {
    this.setSize();
    this.draw();
  }

  handlePointerMove(event) {
    if (!this.pixelPoints.length) {
      return;
    }
    const rect = this.canvas.getBoundingClientRect();
    const clientX = event.clientX || (event.touches && event.touches[0]?.clientX);
    if (clientX === undefined) return;

    const x = clientX - rect.left;
    let nearest = null;
    let minDistance = Infinity;
    this.pixelPoints.forEach((point) => {
      const distance = Math.abs(point.x - x);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = point;
      }
    });

    if (nearest) {
      const payload = {
        time: nearest.time,
        point: { x: nearest.x, y: nearest.y },
        seriesPrices: new Map([[this.seriesRef, nearest.value]]),
      };
      this.crosshairListeners.forEach((listener) => listener(payload));
    }
  }

  handlePointerLeave() {
    this.crosshairListeners.forEach((listener) => listener({}));
  }

  draw() {
    if (!this.ctx) return;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    const { width, height } = this.canvas.getBoundingClientRect();
    this.ctx.clearRect(0, 0, width, height);

    if (!this.seriesData.length) return;

    const values = this.seriesData.map((p) => p.value);
    const times = this.seriesData.map((p) => p.time);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const yRange = maxValue - minValue || 1;
    const xRange = maxTime - minTime || 1;

    this.pixelPoints = this.seriesData.map((point) => {
      const x = ((point.time - minTime) / xRange) * width;
      const y = height - ((point.value - minValue) / yRange) * height;
      return { x, y, time: point.time, value: point.value };
    });

    const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "rgba(25, 118, 210, 0.3)");
    gradient.addColorStop(1, "rgba(25, 118, 210, 0.05)");

    this.ctx.beginPath();
    this.pixelPoints.forEach((point, index) => {
      if (index === 0) {
        this.ctx.moveTo(point.x, point.y);
      } else {
        this.ctx.lineTo(point.x, point.y);
      }
    });
    this.ctx.lineTo(this.pixelPoints[this.pixelPoints.length - 1].x, height);
    this.ctx.lineTo(this.pixelPoints[0].x, height);
    this.ctx.closePath();
    this.ctx.fillStyle = gradient;
    this.ctx.fill();

    this.ctx.beginPath();
    this.pixelPoints.forEach((point, index) => {
      if (index === 0) {
        this.ctx.moveTo(point.x, point.y);
      } else {
        this.ctx.lineTo(point.x, point.y);
      }
    });
    this.ctx.strokeStyle = "#1976d2";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  remove() {
    this.resizeObserver?.disconnect();
    if (!this.resizeObserver) {
      window.removeEventListener("resize", this.handleResize);
    }
    this.canvas.removeEventListener("pointermove", this.handlePointerMove);
    this.canvas.removeEventListener("pointerleave", this.handlePointerLeave);
    this.canvas.removeEventListener("touchstart", this.handlePointerMove);
    this.canvas.removeEventListener("touchmove", this.handlePointerMove);
    if (this.canvas.parentNode === this.container) {
      this.container.removeChild(this.canvas);
    }
  }
}

function EloStockChart({ token, onRecordMatch }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const [range, setRange] = useState(RANGE_OPTIONS[2].value);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [eloData, setEloData] = useState({ points: [], summary: null });
  const [hoverPoint, setHoverPoint] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = new SimpleAreaChart(containerRef.current);
    const series = chart.addAreaSeries();
    chartRef.current = chart;
    seriesRef.current = series;

    const handleCrosshairMove = (param) => {
      if (!param || !param.time || !param.seriesPrices) {
        setHoverPoint(null);
        return;
      }
      const price =
        param.seriesPrices.get(seriesRef.current) ??
        param.seriesPrices.values().next()?.value;
      setHoverPoint({ time: param.time, value: price });
    };

    chart.subscribeCrosshairMove(handleCrosshairMove);

    return () => {
      chart.unsubscribeCrosshairMove(handleCrosshairMove);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    async function loadData() {
      if (!token) return;
      try {
        setLoading(true);
        setError(null);
        const response = await getEloStock(range, token);
        const points = normalizePoints(response?.points || response?.data || []);
        setEloData({
          points,
          summary: response?.summary || response?.meta || null,
        });
      } catch (err) {
        setError(err.message || "Failed to load Elo history");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [range, token]);

  useEffect(() => {
    if (!seriesRef.current) return;
    if (eloData.points?.length) {
      seriesRef.current.setData(eloData.points);
      chartRef.current?.timeScale()?.fitContent?.();
    } else {
      seriesRef.current.setData([]);
    }
  }, [eloData.points]);

  const latestPoint = useMemo(() => {
    if (!eloData.points?.length) return null;
    return eloData.points[eloData.points.length - 1];
  }, [eloData.points]);

  const summary = useMemo(() => {
    if (eloData.summary) return eloData.summary;
    if (!eloData.points?.length) return null;
    const start = eloData.points[0];
    const end = eloData.points[eloData.points.length - 1];
    const change = end.value - start.value;
    return {
      start_value: start.value,
      end_value: end.value,
      delta: change,
    };
  }, [eloData]);

  const displayedPoint = hoverPoint || latestPoint;

  return (
    <Card variant="outlined" sx={{ width: "100%" }}>
      <CardContent>
        <Stack spacing={2} alignItems="stretch">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Elo Performance
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Record a match to start tracking your Elo over time.
              </Typography>
            </Box>
            {onRecordMatch && (
              <Button size="small" variant="outlined" onClick={onRecordMatch}>
                Record Match
              </Button>
            )}
          </Stack>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <ToggleButtonGroup
              size="small"
              value={range}
              exclusive
              onChange={(event, value) => value && setRange(value)}
            >
              {RANGE_OPTIONS.map((option) => (
                <ToggleButton key={option.value} value={option.value}>
                  {option.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <Chip
              label={
                displayedPoint
                  ? `${formatValue(displayedPoint.value)} Elo`
                  : "No data"
              }
              size="small"
              color="primary"
              variant="outlined"
            />
          </Stack>

          {summary && (
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Stack spacing={0.5}>
                <Typography variant="body2" color="text.secondary">
                  Current Elo
                </Typography>
                <Typography variant="subtitle1" fontWeight={700}>
                  {formatValue(summary.end_value || summary.current || summary.latest)}
                </Typography>
              </Stack>
              <Stack spacing={0.5}>
                <Typography variant="body2" color="text.secondary">
                  Change
                </Typography>
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  color={(summary.delta ?? 0) >= 0 ? "success.main" : "error.main"}
                >
                  {(summary.delta ?? summary.change ?? 0) >= 0 ? "+" : ""}
                  {formatValue(summary.delta ?? summary.change ?? 0)}
                </Typography>
              </Stack>
              <Stack spacing={0.5}>
                <Typography variant="body2" color="text.secondary">
                  Range
                </Typography>
                <Typography variant="subtitle1" fontWeight={700}>
                  {formatValue(summary.start_value ?? summary.start ?? summary.base)} →
                  {" "}
                  {formatValue(summary.end_value || summary.current || summary.latest)}
                </Typography>
              </Stack>
            </Stack>
          )}

          <Box
            ref={containerRef}
            sx={{
              height: 240,
              width: "100%",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
              background: (theme) => theme.palette.background.paper,
            }}
          />

          {error && (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          )}

          {!error && !loading && !eloData.points?.length && (
            <Typography variant="body2" color="text.secondary">
              No Elo matches yet. Record a match to start your chart.
            </Typography>
          )}

          {loading && (
            <Typography variant="body2" color="text.secondary">
              Loading Elo history...
            </Typography>
          )}

          {displayedPoint && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" fontWeight={700}>
                {formatValue(displayedPoint.value)} Elo
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatDateLabel(displayedPoint.time)}
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default EloStockChart;
