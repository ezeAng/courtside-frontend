import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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

import { alpha, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

import { getEloSeries } from "../../services/eloApi";
import { setEloMode } from "../../features/ui/uiSlice";
import { getEloLabelForMode } from "../../utils/elo";
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

const RANGE_OPTIONS = ["1W", "1M", "3M", "6M", "1Y"];

const formatChange = (v) =>
  v === null || v === undefined ? null : `${v > 0 ? "+" : ""}${Math.round(v)}`;

const formatPercent = (v) =>
  v === null || v === undefined ? null : `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;

function EloStockChart({ onRecordMatch, overallElo }) {
  const token = useSelector((state) => state.auth.accessToken);
  const eloMode = useSelector((state) => state.ui.eloMode || "overall");
  const dispatch = useDispatch();

  const [range, setRange] = useState("1M");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const theme = useTheme();

  const lineColor = theme.palette.primary.main;
  const lineFill = alpha(theme.palette.primary.main, 0.15);
  const gridColor = theme.custom?.colors?.accent.grid || theme.palette.divider;

  /* ---------------- Fetch ---------------- */
  useEffect(() => {
    if (!token) return;

    let mounted = true;
    setLoading(true);
    setError(null);

    getEloSeries(token, range, eloMode)
      .then((res) => mounted && setData(res))
      .catch(() => mounted && setError("Failed to load Elo history"))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [eloMode, range, token, reloadKey]);

  /* ---------------- Chart Data ---------------- */
  const chartData = useMemo(() => {
    if (!data?.points?.length) return null;

    return {
      datasets: [
        {
          label: getEloLabelForMode(eloMode),
          data: data.points.map((p) => ({
            x: p.t,
            y: p.elo,
          })),
          borderColor: lineColor,
          backgroundColor: lineFill,
          fill: true,
          tension: 0.25,
          pointRadius: 3,
          pointHoverRadius: 5,
        },
      ],
    };
  }, [data, lineColor, lineFill, eloMode]);

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
            title: (items) =>
              `${getEloLabelForMode(eloMode)} • ${items[0]?.label || ""}`,
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
          grid: { color: gridColor },
          ticks: {
            callback: (v) => Math.round(v),
          },
          title: {
            display: true,
            text: "Elo Rating",
          },
        },
      },
    }),
    [eloMode, gridColor]
  );

  const summary = data?.summary;
  const isEmpty =
    data && (data.has_data === false || !data.points?.length);
  const isOverallLocked =
    eloMode === "overall" &&
    !loading &&
    (overallElo === null || overallElo === undefined);

  const chartTitle =
    eloMode === "overall"
      ? "Overall Elo Progression"
      : eloMode === "singles"
      ? "Singles Elo Progression"
      : "Doubles Elo Progression";

  /* ---------------- Render ---------------- */
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1} alignItems={{ xs: "flex-start", sm: "center" }}>
            <Stack spacing={0.5}>
              <Typography variant="h6" fontWeight={700}>
                {chartTitle}
              </Typography>
              <ToggleButtonGroup
                value={eloMode}
                exclusive
                size="small"
                onChange={(_, value) => value && dispatch(setEloMode(value))}
              >
                <ToggleButton value="overall">Overall</ToggleButton>
                <ToggleButton value="singles">Singles</ToggleButton>
                <ToggleButton value="doubles">Doubles</ToggleButton>
              </ToggleButtonGroup>
            </Stack>
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

          {isOverallLocked && (
            <Stack spacing={1}>
              <Typography fontWeight={700}>
                Play 5 matches to unlock overall Elo
              </Typography>
            </Stack>
          )}

          {isEmpty && !loading && !isOverallLocked && (
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

          {!isEmpty && chartData && !isOverallLocked && (
            <>
              <Stack direction="row" spacing={3} alignItems="baseline">
                <Box>
                  <Typography color="text.secondary">Current {getEloLabelForMode(eloMode)}</Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {Math.round(summary?.endElo ?? "--")}
                  </Typography>
                </Box>
                {summary &&
                  summary.change !== null &&
                  summary.change !== undefined && (
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
