import { useEffect, useState } from "react";
import { apiClient } from "../../api.js";

const CHART_COLORS = {
  bar: "#4F6E5C",
  line: "#C9683D",
  grid: "#E5E7EB",
  text: "#6B7280",
};

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function MiniBarChart({ data, height = 120 }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.count), 1);
  const barWidth = 100 / data.length;
  const gap = Math.max(barWidth * 0.2, 4);

  return (
    <svg viewBox={`0 0 100 ${height}`} className="w-full" preserveAspectRatio="none">
      {data.map((d, i) => {
        const barH = (d.count / max) * (height - 20);
        const x = i * barWidth + gap / 2;
        const w = barWidth - gap;
        const y = height - barH - 10;
        return (
          <rect
            key={d.date}
            x={x}
            y={y}
            width={w}
            height={barH}
            fill={CHART_COLORS.bar}
            rx="1"
          />
        );
      })}
      {data.map((d, i) => {
        const x = i * barWidth + barWidth / 2;
        return (
          <text
            key={d.date + "-label"}
            x={x}
            y={height - 1}
            textAnchor="middle"
            fontSize="3"
            fill={CHART_COLORS.text}
          >
            {new Date(d.date + "T00:00:00").getDate()}
          </text>
        );
      })}
    </svg>
  );
}

function MiniLineChart({ data, height = 120 }) {
  if (!data || data.length === 0) return null;
  const values = data.map((d) => d.avgWordCount);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const stepX = 100 / (data.length - 1 || 1);

  const points = data.map((d, i) => {
    const x = i * stepX;
    const y = height - 10 - ((d.avgWordCount - min) / range) * (height - 20);
    return { x, y };
  });

  const pathD = points.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(" ");

  return (
    <svg viewBox={`0 0 100 ${height}`} className="w-full" preserveAspectRatio="none">
      <path d={pathD} fill="none" stroke={CHART_COLORS.line} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.5" fill={CHART_COLORS.line} />
      ))}
      {data.map((d, i) => {
        const x = i * stepX;
        return (
          <text key={d.date + "-label"} x={x} y={height - 1} textAnchor="middle" fontSize="3" fill={CHART_COLORS.text}>
            {new Date(d.date + "T00:00:00").getDate()}
          </text>
        );
      })}
    </svg>
  );
}

export default function WeeklyReport({ elderId }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!elderId) return;
    setLoading(true);
    apiClient
      .get(`/reports/${elderId}/weekly`)
      .then((res) => setReport(res.data))
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setLoading(false));
  }, [elderId]);

  if (!elderId) {
    return (
      <div className="w-full rounded-3xl bg-white p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-companion-ink mb-4">Communication Report</h2>
        <p className="text-gray-500">Link an elder to view their report.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full rounded-3xl bg-white p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-companion-ink mb-4">Communication Report</h2>
        <p className="text-gray-500">Loading report…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full rounded-3xl bg-white p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-companion-ink mb-4">Communication Report</h2>
        <p className="text-companion-alert">{error}</p>
      </div>
    );
  }

  if (!report) return null;

  const flagColors = {
    good: "bg-green-50 border-green-200 text-green-800",
    notice: "bg-yellow-50 border-yellow-200 text-yellow-800",
    attention: "bg-red-50 border-red-200 text-red-800",
  };

  const flagBadgeColors = {
    good: "bg-green-100 text-green-700",
    notice: "bg-yellow-100 text-yellow-700",
    attention: "bg-red-100 text-red-700",
  };

  return (
    <div className="w-full rounded-3xl bg-white p-6 shadow-lg">
      <h2 className="text-xl font-semibold text-companion-ink mb-1">Communication Report</h2>
      <p className="text-xs text-gray-500 mb-4">
        {formatDate(report.period.start)} — {formatDate(report.period.end)}
      </p>

      {report.flags?.length > 0 && (
        <div className="space-y-2 mb-6">
          {report.flags.map((flag, idx) => (
            <div key={idx} className={`rounded-xl border px-4 py-3 ${flagColors[flag.level] || flagColors.good}`}>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${flagBadgeColors[flag.level] || flagBadgeColors.good}`}>
                  {flag.level}
                </span>
                <span className="text-sm font-medium">{flag.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="border border-gray-200 rounded-xl p-3">
          <p className="text-xs text-gray-500">Sessions this week</p>
          <p className="text-2xl font-semibold text-companion-ink">{report.totalSessions}</p>
        </div>
        <div className="border border-gray-200 rounded-xl p-3">
          <p className="text-xs text-gray-500">Avg words per session</p>
          <p className="text-2xl font-semibold text-companion-ink">{report.avgWordCount}</p>
        </div>
        <div className="border border-gray-200 rounded-xl p-3">
          <p className="text-xs text-gray-500">Avg sentence length</p>
          <p className="text-2xl font-semibold text-companion-ink">{report.avgSentenceComplexity}</p>
          <p className="text-xs text-gray-400 mt-1">
            Trend: {report.complexityTrend === "up" ? "▲ slightly longer" : report.complexityTrend === "down" ? "▼ slightly shorter" : "— stable"} vs last week
          </p>
        </div>
        <div className="border border-gray-200 rounded-xl p-3">
          <p className="text-xs text-gray-500">Days with no conversation</p>
          <p className="text-2xl font-semibold text-companion-ink">{report.daysWithNoConversation.length}</p>
          {report.daysWithNoConversation.length > 0 && (
            <p className="text-xs text-gray-400 mt-1">{report.daysWithNoConversation.join(", ")}</p>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-companion-ink mb-2">Sessions per day</h3>
        <MiniBarChart data={report.dailySessions} height={100} />
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-companion-ink mb-2">Average words per session</h3>
        <MiniLineChart data={report.dailyWordCount} height={100} />
      </div>

      {report.repeatedWords.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-companion-ink mb-2">Common topics</h3>
          <div className="flex flex-wrap gap-2">
            {report.repeatedWords.map((w) => (
              <span key={w.word} className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-700">
                {w.word} <span className="text-gray-400">({w.count})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-gray-100 pt-4">
        <h3 className="text-sm font-semibold text-companion-ink mb-2">Summary</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{report.plainLanguageSummary}</p>
      </div>
    </div>
  );
}
