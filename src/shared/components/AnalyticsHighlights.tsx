import { useCallback, useEffect, useMemo, useState } from "react";
import type { KeyboardEvent } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { LegendPayload, TooltipContentProps } from "recharts";
import type {
  Payload as TooltipItemPayload,
} from "recharts/types/component/DefaultTooltipContent";
import type { DashboardMetrics } from "@/shared/api/types.ts";
import { useLanguage } from "@/core/context/LanguageContext.tsx";

type AnalyticsHighlightsProps = {
  metrics: DashboardMetrics;
};


const statusPalette = [
  "#60a5fa",
  "#34d399",
  "#f97316",
  "#f87171",
  "#c084fc",
];

const timelineSeriesKeys = ["bookings", "users", "confirmed"] as const;
type TimelineSeriesKey = (typeof timelineSeriesKeys)[number];
const timelineSeriesColors: Record<TimelineSeriesKey, string> = {
  bookings: "#60a5fa",
  users: "#c084fc",
  confirmed: "#34d399",
};

function formatPercent(value?: number | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "0%";
  }

  if (value > 1) {
    return `${Math.round(value)}%`;
  }

  return `${Math.round(value * 100)}%`;
}

type ChartTooltipProps = Partial<TooltipContentProps<number, string>>;

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const items = payload as ReadonlyArray<
    TooltipItemPayload<number, string>
  >;

  return (
    <div className="analytics-tooltip">
      {label && <strong>{label}</strong>}
      <ul>
        {items.map((entry, index) => {
          if (!entry) return null;

          const fallbackFill =
            typeof entry.payload === "object" && entry.payload !== null
              ? (entry.payload as { fill?: string }).fill
              : undefined;
          const color = entry.color ?? fallbackFill ?? "#38bdf8";
          const valueRaw =
            typeof entry.value === "number"
              ? entry.value
              : Number(entry.value ?? 0);
          const dataKey =
            typeof entry.dataKey === "string" || typeof entry.dataKey === "number"
              ? entry.dataKey
              : undefined;
          const rawName = entry.name ?? dataKey ?? `serie-${index}`;
          const name =
            typeof rawName === "string" || typeof rawName === "number"
              ? String(rawName)
              : `serie-${index}`;

          return (
            <li key={`${name}-${index}`}>
              <span className="dot" style={{ backgroundColor: color }} />
              {name}: <strong>{valueRaw.toLocaleString("pt-BR")}</strong>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

type ChartLegendProps = {
  payload?: ReadonlyArray<LegendPayload>;
  activeKeys?: Set<string>;
  onLegendToggle?: (key: string) => void;
  className?: string;
  layout?: "horizontal" | "vertical";
  align?: "left" | "center" | "right";
};

function ChartLegend({
  payload,
  layout,
  align,
  activeKeys,
  onLegendToggle,
  className,
}: ChartLegendProps) {
  if (!payload || payload.length === 0) {
    return null;
  }

  const legendClassNames = [
    "chart-legend",
    layout === "vertical" ? "chart-legend-vertical" : "",
    align === "center" ? "chart-legend-center" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <ul className={legendClassNames}>
      {payload.map((entry, index) => {
        if (!entry) return null;
        const dataKey =
          typeof entry.dataKey === "string"
            ? entry.dataKey
            : typeof entry.dataKey === "number"
              ? String(entry.dataKey)
              : undefined;
        const fallbackLabel =
          typeof entry.value === "string" || typeof entry.value === "number"
            ? String(entry.value)
            : undefined;
        const resolvedKey = dataKey ?? fallbackLabel ?? `item-${index}`;
        const key = `${resolvedKey}-${index}`;
        const label = fallbackLabel ?? dataKey ?? "";
        const color = entry.color ?? "#38bdf8";
        const payloadData =
          (entry.payload as { value?: number; percent?: number }) ?? undefined;
        const numericValue =
          payloadData && typeof payloadData.value === "number"
            ? payloadData.value
            : undefined;
        const percentValue =
          payloadData && typeof payloadData.percent === "number"
            ? Math.round(payloadData.percent * 100)
            : undefined;
        const isActive =
          activeKeys === undefined || activeKeys.has(resolvedKey);
        const isInactive = !isActive;
        const isInteractive = typeof onLegendToggle === "function";
        const listItemClassName = [
          "chart-legend-item",
          isInactive ? "chart-legend-item-inactive" : "",
          isInteractive ? "chart-legend-item-interactive" : "",
        ]
          .filter(Boolean)
          .join(" ");

        const handleClick = () => {
          if (onLegendToggle) {
            onLegendToggle(resolvedKey);
          }
        };
        const handleKeyDown = (event: KeyboardEvent<HTMLLIElement>) => {
          if (!onLegendToggle) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onLegendToggle(resolvedKey);
          }
        };

        return (
          <li
            key={key}
            className={listItemClassName}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            role={isInteractive ? "button" : undefined}
            tabIndex={isInteractive ? 0 : undefined}
            aria-pressed={
              isInteractive ? (isActive ? "true" : "false") : undefined
            }
          >
            <span className="dot" style={{ backgroundColor: color }} />
            <span className="chart-legend-text">
              {label}
              {percentValue !== undefined ? (
                <span className="chart-legend-value">{percentValue}%</span>
              ) : numericValue !== undefined ? (
                <span className="chart-legend-value">
                  {numericValue.toLocaleString("pt-BR")}
                </span>
              ) : null}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function AnalyticsHighlights({ metrics }: AnalyticsHighlightsProps) {
  const { translate, t } = useLanguage();

  const timelineData = useMemo(() => {
    return metrics.growthTimeline.map((item) => ({
      period: item.period,
      bookings: item.bookingCount,
      confirmed: item.confirmedBookingCount,
      users: item.userCount,
    }));
  }, [metrics.growthTimeline]);

  const statusData = useMemo(() => {
    const entries = Object.entries(
      metrics.bookingMetrics.bookingsByStatus ?? {}
    )
      .filter(([, total]) => total > 0)
      .map(([status, total]) => ({
        status,
        label: translate(status),
        value: total,
      }));

    return entries.length > 0 ? entries : null;
  }, [metrics.bookingMetrics.bookingsByStatus, translate]);

  const dayOfWeekData = useMemo(() => {
    return Object.entries(metrics.bookingsByDayOfWeek ?? {}).map(
      ([day, total]) => ({
        day: translate(day),
        total,
      })
    );
  }, [metrics.bookingsByDayOfWeek, translate]);

  const ageData = metrics.ageDistribution.map((item) => ({
    range: item.ageRange,
    Pessoas: item.count,
  }));

  const timelinePeriodRange = useMemo(() => {
    if (timelineData.length === 0) {
      return null;
    }
    return {
      start: timelineData[0].period,
      end: timelineData[timelineData.length - 1].period,
    };
  }, [timelineData]);

  const timelineRangeLabel = useMemo(() => {
    if (!timelinePeriodRange) {
      return null;
    }
    if (timelinePeriodRange.start === timelinePeriodRange.end) {
      return timelinePeriodRange.start;
    }
    return `${timelinePeriodRange.start} – ${timelinePeriodRange.end}`;
  }, [timelinePeriodRange]);

  const summaryChips = useMemo(
    () => [
      {
        label: t("totalReservations"),
        value: metrics.bookingMetrics.totalBookings.toLocaleString("pt-BR"),
      },
      {
        label: t("confirmationRate"),
        value: formatPercent(metrics.bookingMetrics.confirmationRate),
      },
      {
        label: t("activeUsers"),
        value: metrics.generalMetrics.totalUsers.toLocaleString("pt-BR"),
      },
    ],
    [
      metrics.bookingMetrics.confirmationRate,
      metrics.bookingMetrics.totalBookings,
      metrics.generalMetrics.totalUsers,
      t,
    ]
  );

  const [timelineSelection, setTimelineSelection] =
    useState<TimelineSeriesKey | null>(null);
  const [statusSelection, setStatusSelection] = useState<string | null>(null);

  const timelineLegendPayload = useMemo<LegendPayload[]>(() => {
    return timelineSeriesKeys.map((key) => ({
      value: t(key),
      dataKey: key,
      type: "line",
      color: timelineSeriesColors[key],
    }));
  }, [t]);

  const timelineActiveKeys = useMemo(() => {
    const activeKeys = timelineSelection
      ? [timelineSelection]
      : timelineSeriesKeys;
    return new Set<string>(activeKeys);
  }, [timelineSelection]);

  const handleTimelineLegendToggle = useCallback((key: string) => {
    if (!timelineSeriesKeys.includes(key as TimelineSeriesKey)) {
      return;
    }
    setTimelineSelection((previous) =>
      previous === key ? null : (key as TimelineSeriesKey)
    );
  }, []);

  const totalStatusValue = useMemo(() => {
    if (!statusData) {
      return 0;
    }
    return statusData.reduce((sum, item) => sum + item.value, 0);
  }, [statusData]);

  const statusLegendPayload = useMemo<LegendPayload[]>(() => {
    if (!statusData) {
      return [];
    }

    return statusData.map((item, index) => ({
      value: item.label,
      dataKey: item.status,
      type: "circle",
      color: statusPalette[index % statusPalette.length],
      payload: {
        value: item.value,
        percent:
          totalStatusValue > 0
            ? Number((item.value / totalStatusValue).toFixed(4))
            : undefined,
      },
    }));
  }, [statusData, totalStatusValue]);

  const statusColorMap = useMemo(() => {
    const entries = statusLegendPayload
      .map((entry) => {
        if (typeof entry.dataKey !== "string") {
          return null;
        }
        return [entry.dataKey, entry.color ?? "#38bdf8"] as const;
      })
      .filter(
        (value): value is readonly [string, string] => value !== null
      );

    return new Map<string, string>(entries);
  }, [statusLegendPayload]);

  const statusActiveKeys = useMemo(() => {
    if (!statusLegendPayload.length) {
      return new Set<string>();
    }

    if (statusSelection) {
      return new Set<string>([statusSelection]);
    }

    return new Set<string>(
      statusLegendPayload
        .map((entry) =>
          typeof entry.dataKey === "string" ? entry.dataKey : undefined
        )
        .filter((key): key is string => Boolean(key))
    );
  }, [statusLegendPayload, statusSelection]);

  const filteredStatusData = useMemo(() => {
    if (!statusData) {
      return [];
    }

    if (!statusSelection) {
      return statusData;
    }

    return statusData.filter((item) => item.status === statusSelection);
  }, [statusData, statusSelection]);

  const handleStatusLegendToggle = useCallback((key: string) => {
    setStatusSelection((previous) => (previous === key ? null : key));
  }, []);

  const statusTotalLabel = useMemo(() => {
    if (totalStatusValue === 0) {
      return t("noBookingsInCurrentPeriod");
    }
    return `${totalStatusValue.toLocaleString("pt-BR")} ${t("bookingsPlural")}`;
  }, [totalStatusValue, t]);

  const peakDay = useMemo(() => {
    if (dayOfWeekData.length === 0) {
      return null;
    }
    return dayOfWeekData.reduce((highest, current) =>
      current.total > highest.total ? current : highest
    );
  }, [dayOfWeekData]);

  const peakDayLabel = useMemo(() => {
    if (!peakDay) {
      return null;
    }
    return `${peakDay.day}: ${peakDay.total.toLocaleString("pt-BR")}`;
  }, [peakDay]);

  const topAgeGroup = useMemo(() => {
    if (ageData.length === 0) {
      return null;
    }
    return ageData.reduce((highest, current) =>
      current.Pessoas > highest.Pessoas ? current : highest
    );
  }, [ageData]);

  const ageHighlight = useMemo(() => {
    if (!topAgeGroup) {
      return null;
    }
    return `${topAgeGroup.range} ${t("highlighted")}`;
  }, [topAgeGroup, t]);

  useEffect(() => {
    if (!statusSelection) {
      return;
    }

    const stillExists = statusLegendPayload.some(
      (entry) =>
        typeof entry.dataKey === "string" && entry.dataKey === statusSelection
    );

    if (!stillExists) {
      setStatusSelection(null);
    }
  }, [statusLegendPayload, statusSelection]);

  return (
    <section className="analytics-section">
      <div className="analytics-header">
        <div className="analytics-headline">
          <h2>{t("realtimeInsights")}</h2>
          <p>
            {t("realtimeInsightsDesc")}
          </p>
        </div>
        <div className="analytics-chip-row">
          {summaryChips.map((chip) => (
            <div key={chip.label} className="analytics-chip">
              <span>{chip.label}</span>
              <strong>{chip.value}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="analytics-grid">
        <article className="analytics-card analytics-card-lg">
          <header className="analytics-card-header">
            <div className="analytics-card-title">
              <h3>{t("growthTrend")}</h3>
              <span>{t("usersVsReservations")}</span>
            </div>
            {timelineRangeLabel ? (
              <div className="analytics-chip analytics-chip--muted">
                <span>{timelineRangeLabel}</span>
              </div>
            ) : null}
          </header>
          <div className="chart-wrapper">
            {timelineLegendPayload.length > 0 ? (
              <ChartLegend
                payload={timelineLegendPayload}
                activeKeys={timelineActiveKeys}
                onLegendToggle={handleTimelineLegendToggle}
                layout="horizontal"
                align="left"
                className="chart-legend-floating"
              />
            ) : null}
            {timelineData.length > 0 ? (
              <div className="chart-surface">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={timelineData}
                    margin={{ top: 12, right: 20, bottom: 6, left: 4 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorBookings"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#c084fc" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#c084fc" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      stroke="rgba(148, 163, 184, 0.15)"
                      vertical={false}
                      strokeDasharray="4 4"
                    />
                    <XAxis
                      dataKey="period"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      tick={{
                        fill: "rgba(226, 232, 240, 0.85)",
                        fontSize: 12,
                      }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickCount={5}
                      tick={{
                        fill: "rgba(148, 163, 184, 0.85)",
                        fontSize: 12,
                      }}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="bookings"
                      name={t("bookings")}
                      stroke="#60a5fa"
                      fill="url(#colorBookings)"
                      strokeWidth={2.2}
                      activeDot={{ r: 5 }}
                      hide={
                        Boolean(
                          timelineSelection && timelineSelection !== "bookings"
                        )
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="users"
                      name={t("users")}
                      stroke="#c084fc"
                      fill="url(#colorUsers)"
                      strokeWidth={2.2}
                      hide={
                        Boolean(
                          timelineSelection && timelineSelection !== "users"
                        )
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="confirmed"
                      name={t("confirmed")}
                      stroke="#34d399"
                      fill="rgba(52, 211, 153, 0.16)"
                      strokeDasharray="6 4"
                      strokeWidth={2}
                      hide={
                        Boolean(
                          timelineSelection && timelineSelection !== "confirmed"
                        )
                      }
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="analytics-empty">{t("noDataYet")}</p>
            )}
          </div>
        </article>

        <article className="analytics-card">
          <header className="analytics-card-header">
            <div className="analytics-card-title">
              <h3>{t("reservationsByStatus")}</h3>
              <span>{t("currentDistribution")}</span>
            </div>
            <div className="analytics-chip analytics-chip--muted">
              <span>{statusTotalLabel}</span>
            </div>
          </header>
          <div className="chart-wrapper chart-wrapper-sm">
            {statusLegendPayload.length > 0 ? (
              <ChartLegend
                payload={statusLegendPayload}
                activeKeys={statusActiveKeys}
                onLegendToggle={handleStatusLegendToggle}
                layout="horizontal"
                align="center"
                className="chart-legend-floating chart-legend-centered"
              />
            ) : null}
            {statusData ? (
              <div className="chart-surface chart-surface--compact">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={filteredStatusData}
                      innerRadius="55%"
                      outerRadius="80%"
                      paddingAngle={6}
                      dataKey="value"
                      nameKey="label"
                    >
                      {filteredStatusData.map((item) => {
                        const fill =
                          statusColorMap.get(item.status) ?? statusPalette[0];
                        return <Cell key={item.status} fill={fill} />;
                      })}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="analytics-empty">
                {t("noBookingsForChart")}
              </p>
            )}
          </div>
        </article>

        <article className="analytics-card">
          <header className="analytics-card-header">
            <div className="analytics-card-title">
              <h3>{t("weekPeaks")}</h3>
              <span>{t("reservationsByDay")}</span>
            </div>
            {peakDayLabel ? (
              <div className="analytics-chip analytics-chip--muted">
                <span>{peakDayLabel}</span>
              </div>
            ) : null}
          </header>
          <div className="chart-wrapper chart-wrapper-sm">
            {dayOfWeekData.length > 0 ? (
              <div className="chart-surface chart-surface--compact">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dayOfWeekData}
                    margin={{ top: 8, right: 16, bottom: 6, left: 0 }}
                  >
                    <CartesianGrid
                      stroke="rgba(148, 163, 184, 0.12)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tick={{
                        fill: "rgba(226, 232, 240, 0.85)",
                        fontSize: 11,
                      }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      width={48}
                      tick={{
                        fill: "rgba(148, 163, 184, 0.8)",
                        fontSize: 11,
                      }}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar
                      dataKey="total"
                      name={t("bookings")}
                      radius={[10, 10, 0, 0]}
                      fill="#38bdf8"
                      maxBarSize={48}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="analytics-empty">
                {t("notEnoughData")}
              </p>
            )}
          </div>
        </article>

        <article className="analytics-card">
          <header className="analytics-card-header">
            <div className="analytics-card-title">
              <h3>{t("studentAgeRange")}</h3>
              <span>{t("participationByGroup")}</span>
            </div>
            {ageHighlight ? (
              <div className="analytics-chip analytics-chip--muted">
                <span>{ageHighlight}</span>
              </div>
            ) : null}
          </header>
          <div className="chart-wrapper chart-wrapper-sm">
            {ageData.length > 0 ? (
              <div className="chart-surface chart-surface--compact">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={ageData}
                    layout="vertical"
                    barSize={20}
                    margin={{ top: 8, right: 12, bottom: 8, left: 0 }}
                  >
                    <CartesianGrid
                      stroke="rgba(148, 163, 184, 0.12)"
                      horizontal={false}
                    />
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="range"
                      type="category"
                      width={88}
                      tickLine={false}
                      axisLine={false}
                      tick={{
                        fill: "rgba(226, 232, 240, 0.9)",
                        fontSize: 11,
                      }}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="Pessoas" name={t("people")} radius={10}>
                      {ageData.map((_, index) => (
                        <Cell
                          key={index}
                          fill={statusPalette[(index + 2) % statusPalette.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="analytics-empty">
                {t("demographicDataNotAvailable")}
              </p>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
