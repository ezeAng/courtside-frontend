import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Filler,
  CategoryScale,
} from "chart.js";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-date-fns";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { getEloSeries } from "../../services/statsService";
import "./EloStockChart.css";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Filler,
  CategoryScale
);

const RANGE_OPTIONS = ["1D", "1W", "1M", "YTD", "ALL"];

const formatChange = (v) =>
  v === null || v === undefined ? null : `${v > 0 ? "+" : ""}${Math.round(v)}`;

const formatPercent = (v) =>
  v === null || v === undefined ? null : `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;

function EloStockChart({ onRecordMatch }) {
  const token = useSelector((state) => state.auth.accessToken);

  const [range, setRange] = useState("1M");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  /* ---------------- Fetch ---------------- */
  useEffect(() => {
    if (!token) return;

    let mounted = true;
    setLoading(true);
    setError(null);

    getEloSeries(range, token)
      .then((res) => mounted && setData(res))
      .catch(() => mounted && setError("Failed to load Elo history"))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [range, token, reloadKey]);

  /* ---------------- Chart Data ---------------- */
  const chartData = useMemo(() => {
    if (!data?.points?.length) return null;

    return {
      datasets: [
        {
          label: "Elo",
          data: data.points.map((p) => ({
            x: new Date(p.t),
            y: p.elo,
          })),
          borderColor: "#1976d2",
          backgroundColor: "rgba(25, 118, 210, 0.15)",
          fill: true,
          tension: 0.25,
          pointRadius: 3,
          pointHoverRadius: 5,
        },
      ],
    };
  }, [data]);

  /* ---------------- Chart Options ---------------- */
  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `Elo: ${Math.round(ctx.parsed.y)}`,
          },
        },
      },
      scales: {
        x: {
          type: "time",
          time: {
            unit: "day",
          },
          grid: { display: false },
        },
        y: {
          beginAtZero: false,
          grid: { color: "#f0f4f8" },
          ticks: {
            callback: (v) => Math.round(v),
          },
        },
      },
    }),
    []
  );

  const summary = data?.summary;
  const isEmpty =
    data && (data.has_data === false || !data.points?.length);

  /* ---------------- Render ---------------- */
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="h6" fontWeight={700}>
              Elo History
            </Typography>
            <Box className="elo-range-selector">
              {RANGE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  className={`elo-range-button ${opt === range ? "active" : ""}`}
                  onClick={() => setRange(opt)}
                  type="button"
                >
                  {opt}
                </button>
              ))}
            </Box>
          </Stack>

          {error && (
            <Stack spacing={1}>
              <Typography color="error">{error}</Typography>
              <Button size="small" onClick={() => setReloadKey((k) => k + 1)}>
                Retry
              </Button>
            </Stack>
          )}

          {loading && !data && (
            <Typography color="text.secondary">Loading Elo…</Typography>
          )}

          {isEmpty && !loading && (
            <Stack spacing={1}>
              <Typography fontWeight={700}>No Elo history yet</Typography>
              <Typography color="text.secondary">
                Record a match to start tracking your Elo.
              </Typography>
              {onRecordMatch && (
                <Button onClick={onRecordMatch}>Record Match</Button>
              )}
            </Stack>
          )}

          {!isEmpty && chartData && (
            <>
              <Stack direction="row" spacing={3} alignItems="baseline">
                <Box>
                  <Typography color="text.secondary">Current Elo</Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {Math.round(summary?.endElo ?? "--")}
                  </Typography>
                </Box>
                {summary?.change !== null && (
                  <Box>
                    <Typography color="text.secondary">
                      Change ({range})
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      color={summary.change >= 0 ? "success.main" : "error.main"}
                    >
                      {formatChange(summary.change)}
                      {summary.changePct &&
                        ` (${formatPercent(summary.changePct)})`}
                    </Typography>
                  </Box>
                )}
              </Stack>

              <Box sx={{ height: 260 }}>
                <Line data={chartData} options={chartOptions} />
              </Box>
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default EloStockChart;
