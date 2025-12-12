import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { createChart } from "lightweight-charts";
import { getEloSeries } from "../../services/statsService";
import "./EloStockChart.css";

const RANGE_OPTIONS = ["1D", "1W", "1M", "YTD", "ALL"];

const formatChange = (value) => {
  if (value === null || value === undefined) return null;
  const rounded = Math.round(value);
  if (rounded === 0) return "0";
  return `${rounded > 0 ? "+" : ""}${rounded}`;
};

const formatPercent = (value) => {
  if (value === null || value === undefined) return null;
  const formatted = Number(value).toFixed(2);
  if (Number.isNaN(Number(formatted))) return null;
  return `${Number(value) > 0 ? "+" : ""}${formatted}%`;
};

const formatDate = (date) => {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
};

function EloStockChart({ onRecordMatch }) {
  const token = useSelector((state) => state.auth.accessToken);
  const [range, setRange] = useState("1M");
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hoverInfo, setHoverInfo] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const crosshairHandlerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || chartRef.current) return;

    const chart = createChart(containerRef.current, {
      height: 260,
      layout: {
        background: { color: "#ffffff" },
        textColor: "#374151",
      },
      grid: {
        horzLines: { color: "#f0f4f8" },
        vertLines: { color: "#f0f4f8" },
      },
      crosshair: {
        vertLine: {
          color: "#1976d2",
          width: 1,
          style: 1,
          labelBackgroundColor: "#1976d2",
        },
        horzLine: {
          color: "#1976d2",
          width: 1,
          style: 1,
          labelBackgroundColor: "#1976d2",
        },
      },
      rightPriceScale: {
        borderVisible: false,
      },
      timeScale: {
        borderVisible: false,
      },
    });

    const series = chart.addLineSeries({
      color: "#1976d2",
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      if (chartRef.current && containerRef.current) {
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth });
      }
    };

    resizeObserverRef.current = new ResizeObserver(handleResize);
    resizeObserverRef.current.observe(containerRef.current);

    const handleCrosshairMove = (param) => {
      if (!seriesRef.current) return;

      const time = param?.time;
      const seriesData = param?.seriesData?.get(seriesRef.current);

      if (time && seriesData) {
        const timestamp =
          typeof time === "object" && "timestamp" in time ? time.timestamp : time;
        const date = new Date(Number(timestamp) * 1000);
        const value = Math.round(seriesData.value ?? seriesData);

        setHoverInfo({
          elo: value,
          date: formatDate(date),
        });
        return;
      }

      setHoverInfo(null);
    };

    chart.subscribeCrosshairMove(handleCrosshairMove);
    crosshairHandlerRef.current = handleCrosshairMove;

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      if (crosshairHandlerRef.current) {
        chart.unsubscribeCrosshairMove(crosshairHandlerRef.current);
      }
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    getEloSeries(range, token)
      .then((response) => {
        if (!isMounted) return;
        setData(response);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err?.message || "Failed to load Elo history");
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [range, token, reloadKey]);

  useEffect(() => {
    if (!seriesRef.current) return;

    if (!data || !data.points || !data.points.length || data.has_data === false) {
      seriesRef.current.setData([]);
      return;
    }

    const mapped = data.points
      .map((point) => ({
        time: Math.floor(new Date(point.t).getTime() / 1000),
        value: Number(point.elo),
      }))
      .filter((point) => Number.isFinite(point.time) && Number.isFinite(point.value));

    seriesRef.current.setData(mapped);
    chartRef.current?.timeScale().fitContent();
    setHoverInfo(null);
  }, [data]);

  const isEmpty = useMemo(() => {
    if (!data) return false;
    return data.has_data === false || !data.points || data.points.length === 0;
  }, [data]);

  const summary = data?.summary;
  const displayElo = useMemo(() => {
    if (hoverInfo?.elo !== undefined && hoverInfo?.elo !== null) return hoverInfo.elo;
    if (summary?.endElo !== undefined && summary?.endElo !== null) {
      return Math.round(summary.endElo);
    }
    return "--";
  }, [hoverInfo, summary]);

  const displayDate = hoverInfo?.date || (summary ? "Latest" : "");
  const change = formatChange(summary?.change);
  const changePct = formatPercent(summary?.changePct);

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            gap={1}
          >
            <Typography variant="h6" fontWeight={700}>
              Elo History
            </Typography>
            <Box className="elo-range-selector">
              {RANGE_OPTIONS.map((option) => (
                <button
                  key={option}
                  className={`elo-range-button ${option === range ? "active" : ""}`}
                  onClick={() => setRange(option)}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </Box>
          </Stack>

          {error && (
            <Stack spacing={1} alignItems="flex-start">
              <Typography color="error">Couldn&apos;t load Elo history.</Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setReloadKey((prev) => prev + 1)}
              >
                Retry
              </Button>
            </Stack>
          )}

          {isLoading && !data && (
            <Typography color="text.secondary">Loading Elo…</Typography>
          )}

          {isEmpty && !isLoading && !error && (
            <Box className="elo-empty-state">
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                No Elo history yet
              </Typography>
              <Typography color="text.secondary" mb={2}>
                Record a match to start tracking your Elo over time.
              </Typography>
              {onRecordMatch && (
                <Button variant="contained" onClick={onRecordMatch} size="small">
                  Record Match
                </Button>
              )}
            </Box>
          )}

          {!isEmpty && data && (
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} alignItems="baseline" flexWrap="wrap">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Current Elo
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {displayElo}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    {displayDate}
                  </Typography>
                </Box>
                {change && (
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Change ({range})
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      color={summary?.change >= 0 ? "success.main" : "error.main"}
                    >
                      {change}
                      {changePct ? ` (${changePct})` : ""}
                    </Typography>
                  </Box>
                )}
              </Stack>

              <Box className="elo-chart-container" ref={containerRef} />
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default EloStockChart;
