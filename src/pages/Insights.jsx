import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import { useWorkspaceAuthorization } from "../context/WorkspaceAuthorizationContext";
import { ChevronDown } from "lucide-react";
import {
  Users,
  Image,
  Play,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Eye,
  Activity,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
export default function Insights() {
  const { igUserId } = useParams();
  const { token } = useAuth();
  const {hasPermission}=useWorkspaceAuthorization();const canViewAutoDm=hasPermission("AUTO_DM_VIEW"),canEditAutoDm=hasPermission("AUTO_DM_EDIT");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Navigation state
  const [activeTab, setActiveTab] = useState("insights");

  // Auto-DM Rules state
  const [rules, setRules] = useState([]);
  const [loadingRules, setLoadingRules] = useState(false);
  const [rulesError, setRulesError] = useState(null);

  // Toast message state
  const [toast, setToast] = useState(null);

  // "Create Rule" modal form state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedReelId, setSelectedReelId] = useState("");
  const [keyword, setKeyword] = useState("");
  const [dmMessage, setDmMessage] = useState("");
  const [publicReplyMessage, setPublicReplyMessage] = useState("");
  const [submittingRule, setSubmittingRule] = useState(false);
  const [formError, setFormError] = useState(null);
  const [historyData, setHistoryData] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [historyDays, setHistoryDays] = useState(30);

  // Audience quality state
  const [audienceQuality, setAudienceQuality] = useState(null);
  const [qualityLoading, setQualityLoading] = useState(false);
  const [qualityError, setQualityError] = useState(null);

  // "Logs" modal state
  const [selectedRuleForLogs, setSelectedRuleForLogs] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logsError, setLogsError] = useState(null);

  const [expandedReel, setExpandedReel] = useState(null);
  // Toast trigger utility
  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  }, []);

  // Rules fetch utility
  const loadRules = useCallback(async () => {
    setLoadingRules(true);
    setRulesError(null);
    try {
      const result = await api.fetchRules(igUserId, token);
      setRules(result || []);
    } catch (err) {
      setRulesError(err.message);
    } finally {
      setLoadingRules(false);
    }
  }, [igUserId, token]);

  // Initial loading
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    // Load Insights (with limit of 20 reels as per spec)
    api
      .getInsights(igUserId, token, 20)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // Load Rules
    loadRules();

    return () => {
      cancelled = true;
    };
  }, [igUserId, token, loadRules]);

  // Logs fetch utility
  const loadLogs = useCallback(
    async (ruleId) => {
      setLoadingLogs(true);
      setLogsError(null);
      try {
        const result = await api.getRuleLogs(igUserId, ruleId, token);
        setLogs(result || []);
      } catch (err) {
        setLogsError(err.message);
      } finally {
        setLoadingLogs(false);
      }
    },
    [igUserId, token]
  );

  const loadInsightHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError(null);

    try {
      const result = await api.getInsightHistory(igUserId, token, historyDays);

      setHistoryData(result);
    } catch (err) {
      setHistoryError(err.message);
    } finally {
      setHistoryLoading(false);
    }
  }, [igUserId, token, historyDays]);

  const handleOpenLogs = (rule) => {
    setSelectedRuleForLogs(rule);
    setLogs([]);
    loadLogs(rule.id);
  };

  // Delete rule action
  async function handleDeleteRule(ruleId) {
    if(!canEditAutoDm)return;
    if (
      !window.confirm("Are you sure you want to delete this automation rule?")
    )
      return;
    try {
      await api.deleteRule(igUserId, ruleId, token);
      showToast("Automation rule deleted successfully!");
      setRules((prev) => prev.filter((r) => r.id !== ruleId));
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  // Create rule action
  async function handleCreateRule(e) {
    e.preventDefault();
    if(!canEditAutoDm)return;
    setFormError(null);

    if (!selectedReelId) {
      setFormError("Please select a Reel.");
      return;
    }
    if (!keyword.trim()) {
      setFormError("Please enter a trigger keyword.");
      return;
    }
    if (!dmMessage.trim()) {
      setFormError("Please enter a direct message reply.");
      return;
    }

    setSubmittingRule(true);
    try {
      await api.createRule(
        igUserId,
        {
          mediaId: selectedReelId,
          keyword: keyword.trim(),
          dmMessage: dmMessage.trim(),
          publicReplyMessage: publicReplyMessage.trim() || undefined,
        },
        token
      );

      showToast("Automation rule created successfully!");
      setIsCreateModalOpen(false);
      setSelectedReelId("");
      setKeyword("");
      setDmMessage("");
      setPublicReplyMessage("");
      loadRules();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmittingRule(false);
    }
  }

  // Helper to calculate custom engagement rate for reels
  function getEngagementRate(reel) {
    if (!reel.viewCount) return "0.0%";
    const interactions =
      reel.totalInteractions ??
      (reel.likeCount || 0) + (reel.commentCount || 0) + (reel.savedCount || 0);

    const engagement =
      reel.viewCount > 0
        ? ((interactions / reel.viewCount) * 100).toFixed(1)
        : "0.0";
    return `${engagement}%`;
  }

  // Format large numbers for dashboard readability
  function formatNumber(num) {
    const value = Number(num ?? 0);
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toLocaleString();
  }

  function formatWatchTime(ms) {
    if (!ms) return "-";

    const seconds = ms / 1000;

    if (seconds < 60) {
      return `${seconds.toFixed(1)} sec`;
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);

    return `${minutes}m ${remainingSeconds}s`;
  }

  function formatTotalWatchTime(ms) {
    if (!ms) return "-";

    const totalSeconds = Math.floor(ms / 1000);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }

    return `${seconds}s`;
  }

  function MetricItem({ label, value }) {
    return (
      <div className="rounded-lg border border-gray-700 bg-[#16161d] p-4">
        <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>

        <p className="mt-2 text-xl font-semibold text-white">{value}</p>
      </div>
    );
  }

  function formatGrowth(value) {
    const numericValue = Number(value || 0);
    if (numericValue > 0) return `+${formatNumber(numericValue)}`;
    return formatNumber(numericValue);
  }

  function formatGrowthPercentage(value) {
    const numericValue = Number(value || 0);
    const prefix = numericValue > 0 ? "+" : "";
    return `${prefix}${numericValue.toFixed(2)}%`;
  }

  function GrowthCard({
    label,
    currentValue,
    growth,
    growthPercentage,
    description,
  }) {
    const numericGrowth = Number(growth || 0);
    const trendClass =
      numericGrowth > 0
        ? "text-emerald-400"
        : numericGrowth < 0
        ? "text-red-400"
        : "text-text-secondary";

    return (
      <div className="p-5 rounded-2xl bg-bg-deep/40 border border-panel-border">
        <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
          {label}
        </p>

        <div className="mt-3 flex items-end justify-between gap-3">
          <p className="text-2xl font-extrabold text-text-primary">
            {formatNumber(Number(currentValue || 0))}
          </p>

          <div className={`text-right ${trendClass}`}>
            <p className="text-sm font-bold">
              {formatGrowthPercentage(growthPercentage)}
            </p>
            <p className="text-[10px] font-semibold">
              {formatGrowth(numericGrowth)}
            </p>
          </div>
        </div>

        <p className="mt-2 text-[10px] text-text-secondary">{description}</p>
      </div>
    );
  }

  const historyChartData = (historyData?.history || []).map((point) => ({
    ...point,
    date: new Date(point.timestamp).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    }),
  }));

  const hasMultipleHistoryPoints = historyChartData.length >= 2;

  const loadAudienceQuality = useCallback(async () => {
    if (!igUserId) return;

    setQualityLoading(true);
    setQualityError(null);

    try {
      const response = await api.getAudienceQuality(
        igUserId,
        token,
        historyDays
      );

      setAudienceQuality(response);
    } catch (err) {
      setQualityError(err.message);
    } finally {
      setQualityLoading(false);
    }
  }, [igUserId, token, historyDays]);

  useEffect(() => {
    loadInsightHistory();
    loadAudienceQuality();
  }, [loadInsightHistory, loadAudienceQuality]);

  const getAudienceScoreColor = (score) => {
    if (score >= 75) return "#22c55e"; // green
    if (score >= 50) return "#eab308"; // yellow
    return "#ef4444"; // red
  };

  const getRiskBadgeClass = (risk) => {
    switch (risk) {
      case "LOW":
        return "bg-green-500/10 text-green-400";
      case "MEDIUM":
        return "bg-yellow-500/10 text-yellow-400";
      default:
        return "bg-red-500/10 text-red-400";
    }
  };

  const getConfidenceBadgeClass = (confidence) => {
    switch (confidence) {
      case "HIGH":
        return "bg-green-500/10 text-green-400";
      case "MEDIUM":
        return "bg-yellow-500/10 text-yellow-400";
      default:
        return "bg-red-500/10 text-red-400";
    }
  };

  function AudienceScoreCircle({ score }) {
    const [displayScore, setDisplayScore] = useState(0);

    useEffect(() => {
      let current = 0;

      const duration = 900;

      const interval = 20;

      const increment = score / (duration / interval);

      const timer = setInterval(() => {
        current += increment;

        if (current >= score) {
          current = score;

          clearInterval(timer);
        }

        setDisplayScore(Math.round(current));
      }, interval);

      return () => clearInterval(timer);
    }, [score]);

    const radius = 75;

    const circumference = 2 * Math.PI * radius;

    const progress = circumference - (displayScore / 100) * circumference;

    const color = getAudienceScoreColor(displayScore);

    return (
      <div className="relative w-[180px] h-[180px]">
        <svg width="180" height="180">
          <defs>
            <linearGradient
              id="scoreGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#8b5cf6" />

              <stop offset="100%" stopColor={color} />
            </linearGradient>

            <filter id="glow">
              <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />

              <feMerge>
                <feMergeNode in="coloredBlur" />

                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <circle
            cx="90"
            cy="90"
            r={radius}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="12"
            fill="transparent"
          />

          <circle
            cx="90"
            cy="90"
            r={radius}
            filter="url(#glow)"
            stroke="url(#scoreGradient)"
            strokeWidth="12"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={progress}
            style={{
              transition: "stroke-dashoffset .25s linear, stroke .3s",
            }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div
            className="text-5xl font-extrabold transition-all duration-300"
            style={{
              color,
              transition: "color .3s",
            }}
          >
            {displayScore}
          </div>

          <div className="text-xs mt-2 text-text-secondary">Audience Score</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-deep text-text-primary px-4 py-8 md:py-12 relative overflow-hidden">
      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-panel/90 backdrop-blur-xl border border-panel-border shadow-2xl flex items-center gap-3 animate-slideIn max-w-sm">
          {toast.type === "success" ? (
            <div className="h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          ) : (
            <div className="h-6 w-6 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          )}
          <span className="text-xs font-semibold text-text-primary flex-1">
            {toast.message}
          </span>
          <button
            onClick={() => setToast(null)}
            className="text-text-secondary hover:text-text-primary ml-2 shrink-0 cursor-pointer"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Background Decorative Blur Blobs */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-accent-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-accent-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-6xl mx-auto space-y-6 relative z-10">
        {/* Navigation / Loading & Errors */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2.5 animate-fadeIn mb-6">
            <svg
              className="w-5 h-5 shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span className="flex-1">{error}</span>
            <Link
              to="/dashboard"
              className="text-xs font-semibold underline underline-offset-4 text-red-400 hover:text-red-300"
            >
              Back
            </Link>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <svg
              className="animate-spin h-10 w-10 text-accent-primary"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-sm text-text-secondary">
              Analyzing Instagram insights & reels metrics...
            </span>
          </div>
        ) : (
          data && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Profile Info Bento Cell (col-span-3) */}
              <div className="md:col-span-3 p-6 md:p-8 rounded-3xl bg-panel/50 backdrop-blur-xl border border-panel-border shadow-xl flex items-center gap-5">
                <div className="h-16 w-16 md:h-20 md:w-20 rounded-3xl bg-gradient-to-tr from-accent-primary to-accent-secondary flex items-center justify-center font-bold text-white text-2xl md:text-3xl shadow-lg shadow-accent-primary/20">
                  {data.username ? data.username[0].toUpperCase() : "@"}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-text-primary">
                      @{data.username || data.igUserId}
                    </h1>
                    <span className="px-2 py-0.5 rounded bg-accent-primary/10 border border-accent-primary/25 text-[10px] font-bold text-accent-primary uppercase tracking-wider">
                      Creator Profile
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-text-secondary">
                    Detailed analytics snapshot based on the last{" "}
                    <strong className="text-text-primary font-semibold">
                      {data.reelsAnalyzed}
                    </strong>{" "}
                    reels published.
                  </p>
                </div>
              </div>

              {/* Back Button Bento Cell (col-span-1) */}
              <Link
                to="/dashboard"
                className="p-6 md:p-8 rounded-3xl bg-panel/30 border border-panel-border hover:border-panel-border/80 transition-all duration-300 shadow-xl flex flex-col justify-between group min-h-[120px] md:min-h-0"
              >
                <div className="h-8 w-8 rounded-xl bg-panel-light flex items-center justify-center text-text-secondary group-hover:text-accent-primary transition-colors">
                  <svg
                    className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-text-primary tracking-wide uppercase">
                    Workspace
                  </h3>
                  <p className="text-[11px] text-text-secondary mt-0.5">
                    Return to dashboard
                  </p>
                </div>
              </Link>

              {/* Tab Swapping Header */}
              <div className="md:col-span-4 flex items-center border-b border-panel-border/30 gap-6 pb-0 mb-2">
                <button
                  onClick={() => setActiveTab("insights")}
                  className={`pb-4 text-sm font-semibold relative transition-colors cursor-pointer ${
                    activeTab === "insights"
                      ? "text-accent-primary"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Metrics Overview
                  {activeTab === "insights" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-primary rounded-full" />
                  )}
                </button>
                {canViewAutoDm&&<button
                  onClick={() => setActiveTab("automations")}
                  className={`pb-4 text-sm font-semibold relative transition-colors cursor-pointer ${
                    activeTab === "automations"
                      ? "text-accent-primary"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Auto-DM Automations
                  {activeTab === "automations" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-primary rounded-full" />
                  )}
                </button>}
              </div>

              {activeTab === "insights" ? (
                <>
                  {/* Stat Card A: Followers */}
                  <div className="p-6 rounded-2xl bg-panel/50 border border-panel-border shadow-md hover:border-panel-border/80 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-text-secondary font-semibold uppercase tracking-wider">
                        Followers
                      </span>
                      <div className="h-7 w-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div
                      className="text-3xl font-extrabold text-text-primary tracking-tight"
                      title={data.followersCount.toLocaleString()}
                    >
                      {formatNumber(data.followersCount)}
                    </div>
                    <p className="text-[11px] text-text-secondary mt-1.5">
                      Audience reach capacity
                    </p>
                  </div>

                  {/* Stat Card B: Media Count */}
                  <div className="p-6 rounded-2xl bg-panel/50 border border-panel-border shadow-md hover:border-panel-border/80 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-text-secondary font-semibold uppercase tracking-wider">
                        Total Posts
                      </span>
                      <div className="h-7 w-7 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="text-3xl font-extrabold text-text-primary tracking-tight">
                      {data.mediaCount.toLocaleString()}
                    </div>
                    <p className="text-[11px] text-text-secondary mt-1.5">
                      Published files count
                    </p>
                  </div>

                  {/* Stat Card C: Reels Views */}
                  <div className="p-6 rounded-2xl bg-panel/50 border border-panel-border shadow-md hover:border-panel-border/80 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-text-secondary font-semibold uppercase tracking-wider">
                        Reel Views
                      </span>
                      <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div
                      className="text-3xl font-extrabold text-text-primary tracking-tight"
                      title={data.totalReelViews.toLocaleString()}
                    >
                      {formatNumber(data.totalReelViews)}
                    </div>
                    <p className="text-[11px] text-text-secondary mt-1.5">
                      Aggregate reels view traffic
                    </p>
                  </div>

                  {/* Stat Card D: Reels Likes */}
                  <div className="p-6 rounded-2xl bg-panel/50 border border-panel-border shadow-md hover:border-panel-border/80 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-text-secondary font-semibold uppercase tracking-wider">
                        Reel Likes
                      </span>
                      <div className="h-7 w-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div
                      className="text-3xl font-extrabold text-text-primary tracking-tight"
                      title={data.totalReelLikes.toLocaleString()}
                    >
                      {formatNumber(data.totalReelLikes)}
                    </div>
                    <p className="text-[11px] text-text-secondary mt-1.5">
                      Total positive signals
                    </p>
                  </div>

                  {/* Total Comments */}
                  <div className="p-6 rounded-2xl bg-panel/50 border border-panel-border shadow-md hover:border-panel-border/80 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-text-secondary font-semibold uppercase tracking-wider">
                        Reel Comments
                      </span>

                      <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                    </div>

                    <div
                      className="text-3xl font-extrabold text-text-primary tracking-tight"
                      title={data.totalReelComments.toLocaleString()}
                    >
                      {formatNumber(data.totalReelComments)}
                    </div>

                    <p className="text-[11px] text-text-secondary mt-1.5">
                      Total audience conversations
                    </p>
                  </div>

                  {/* Total Saves */}
                  <div className="p-6 rounded-2xl bg-panel/50 border border-panel-border shadow-md hover:border-panel-border/80 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-text-secondary font-semibold uppercase tracking-wider">
                        Reel Saves
                      </span>

                      <div className="h-7 w-7 rounded-lg bg-yellow-500/10 text-yellow-400 flex items-center justify-center">
                        <Bookmark className="w-4 h-4" />
                      </div>
                    </div>

                    <div
                      className="text-3xl font-extrabold text-text-primary tracking-tight"
                      title={data.totalReelSaves.toLocaleString()}
                    >
                      {formatNumber(data.totalReelSaves)}
                    </div>

                    <p className="text-[11px] text-text-secondary mt-1.5">
                      Users saved your reels
                    </p>
                  </div>

                  {/* Total Shares */}
                  <div className="p-6 rounded-2xl bg-panel/50 border border-panel-border shadow-md hover:border-panel-border/80 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-text-secondary font-semibold uppercase tracking-wider">
                        Reel Shares
                      </span>

                      <div className="h-7 w-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                        <Share2 className="w-4 h-4" />
                      </div>
                    </div>

                    <div
                      className="text-3xl font-extrabold text-text-primary tracking-tight"
                      title={data.totalReelShares.toLocaleString()}
                    >
                      {formatNumber(data.totalReelShares)}
                    </div>

                    <p className="text-[11px] text-text-secondary mt-1.5">
                      Viral distribution signal
                    </p>
                  </div>

                  {/* Total Reach */}
                  <div className="p-6 rounded-2xl bg-panel/50 border border-panel-border shadow-md hover:border-panel-border/80 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-text-secondary font-semibold uppercase tracking-wider">
                        Reel Reach
                      </span>

                      <div className="h-7 w-7 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center">
                        <Eye className="w-4 h-4" />
                      </div>
                    </div>

                    <div
                      className="text-3xl font-extrabold text-text-primary tracking-tight"
                      title={data.totalReelReach.toLocaleString()}
                    >
                      {formatNumber(data.totalReelReach)}
                    </div>

                    <p className="text-[11px] text-text-secondary mt-1.5">
                      Unique accounts reached
                    </p>
                  </div>

                  {/* Total Interactions */}
                  <div className="p-6 rounded-2xl bg-panel/50 border border-panel-border shadow-md hover:border-panel-border/80 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-text-secondary font-semibold uppercase tracking-wider">
                        Total Interactions
                      </span>

                      <div className="h-7 w-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                        <Activity className="w-4 h-4" />
                      </div>
                    </div>

                    <div
                      className="text-3xl font-extrabold text-text-primary tracking-tight"
                      title={data.totalReelInteractions.toLocaleString()}
                    >
                      {formatNumber(data.totalReelInteractions)}
                    </div>

                    <p className="text-[11px] text-text-secondary mt-1.5">
                      Likes + comments + saves + shares
                    </p>
                  </div>

                  {/* Account Reach */}
                  <div className="p-6 rounded-2xl bg-panel/50 border border-panel-border shadow-md hover:border-panel-border/80 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-text-secondary font-semibold uppercase tracking-wider">
                        Account Reach
                      </span>

                      <div className="h-7 w-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                        <Eye className="w-4 h-4" />
                      </div>
                    </div>

                    <div
                      className="text-3xl font-extrabold text-text-primary tracking-tight"
                      title={data.accountReach.toLocaleString()}
                    >
                      {formatNumber(data.accountReach)}
                    </div>

                    <p className="text-[11px] text-text-secondary mt-1.5">
                      Overall account audience reached
                    </p>
                  </div>

                  {/* ================= Audience Quality ================= */}

                  <div className="md:col-span-4 p-6 md:p-8 rounded-3xl bg-panel/50 backdrop-blur-xl border border-panel-border shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-lg font-bold text-text-primary">
                          Audience Quality
                        </h2>

                        <p className="text-xs text-text-secondary mt-1">
                          Estimate of audience authenticity and engagement
                          quality based on historical Instagram insights.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            audienceQuality?.riskLevel === "LOW"
                              ? "bg-green-500/10 text-green-400"
                              : audienceQuality?.riskLevel === "MEDIUM"
                              ? "bg-yellow-500/10 text-yellow-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {audienceQuality?.riskLevel ?? "-"} Risk
                        </span>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            audienceQuality?.confidence === "HIGH"
                              ? "bg-green-500/10 text-green-400"
                              : audienceQuality?.confidence === "MEDIUM"
                              ? "bg-yellow-500/10 text-yellow-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {audienceQuality?.confidence ?? "-"} Confidence
                        </span>
                      </div>
                    </div>

                    {qualityLoading ? (
                      <div className="py-16 text-center text-text-secondary">
                        Calculating audience quality...
                      </div>
                    ) : qualityError ? (
                      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                        <p className="text-red-400 text-sm font-semibold">
                          Failed to load audience quality
                        </p>

                        <p className="text-xs text-red-300 mt-2">
                          {qualityError}
                        </p>
                      </div>
                    ) : (
                      audienceQuality && (
                        <>
                          {/* Score */}

                          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            <div className="rounded-2xl border border-panel-border bg-bg-deep/30 p-6 flex flex-col items-center justify-center">
                              <AudienceScoreCircle
                                score={audienceQuality.score}
                              />

                              <div className="mt-6 flex gap-2">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskBadgeClass(
                                    audienceQuality.riskLevel
                                  )}`}
                                >
                                  {audienceQuality.riskLevel} Risk
                                </span>

                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getConfidenceBadgeClass(
                                    audienceQuality.confidence
                                  )}`}
                                >
                                  {audienceQuality.confidence} Confidence
                                </span>
                              </div>
                            </div>
                            {/* Signals */}

                            <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                              <MetricItem
                                label="Reach / Followers"
                                value={` ${audienceQuality.signals.reachToFollowerRate.toFixed(
                                  1
                                )}%`}
                              />

                              <MetricItem
                                label="Engagement / Reach"
                                value={`${audienceQuality.signals.engagementByReachRate.toFixed(
                                  1
                                )}%`}
                              />

                              <MetricItem
                                label="Views / Followers"
                                value={`${audienceQuality.signals.viewsToFollowerRate.toFixed(
                                  1
                                )}%`}
                              />

                              <MetricItem
                                label="Growth"
                                value={`${audienceQuality.signals.growthConsistencyScore.toFixed(
                                  0
                                )}/100`}
                              />

                              <MetricItem
                                label="Interactions"
                                value={`${audienceQuality.signals.meaningfulInteractionScore.toFixed(
                                  0
                                )}/100`}
                              />
                            </div>
                          </div>

                          {/* Analysis */}

                          <div className="mt-8 grid md:grid-cols-2 gap-6">
                            {/* Observations */}

                            <div>
                              <h3 className="text-sm font-semibold text-text-primary mb-4">
                                Analysis
                              </h3>

                              <div className="space-y-3">
                                {audienceQuality.observations.map(
                                  (item, index) => (
                                    <div
                                      key={index}
                                      className="flex items-start gap-3 rounded-xl border border-panel-border bg-bg-deep/20 p-3"
                                    >
                                      <div
                                        className={`mt-1 flex h-6 w-6 items-center justify-center rounded-full ${
                                          item.includes("Only")
                                            ? "bg-yellow-500/10 text-yellow-400"
                                            : item.includes("low")
                                            ? "bg-red-500/10 text-red-400"
                                            : "bg-green-500/10 text-green-400"
                                        }`}
                                      >
                                        {item.includes("Only")
                                          ? "!"
                                          : item.includes("low")
                                          ? "✕"
                                          : "✓"}
                                      </div>

                                      <p className="text-sm text-text-secondary">
                                        {item}
                                      </p>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>

                            {/* Metadata */}

                            <div>
                              <h3 className="text-sm font-semibold text-text-primary mb-4">
                                Analysis Summary
                              </h3>

                              <div className="grid grid-cols-2 gap-4">
                                <MetricItem
                                  label="Days Requested"
                                  value={audienceQuality.daysRequested}
                                />

                                <MetricItem
                                  label="Days Available"
                                  value={audienceQuality.daysAnalyzed}
                                />

                                <MetricItem
                                  label="Snapshots"
                                  value={audienceQuality.snapshotsAnalyzed}
                                />

                                <MetricItem
                                  label="Coverage"
                                  value={
                                    audienceQuality.fullPeriodAvailable
                                      ? "Complete"
                                      : "Partial"
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </>
                      )
                    )}
                  </div>

                  {/* Historical Growth Panel */}
                  <div className="md:col-span-4 p-6 md:p-8 rounded-3xl bg-panel/50 backdrop-blur-xl border border-panel-border shadow-xl">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="text-lg font-bold tracking-tight text-text-primary mb-1">
                          Historical Growth
                        </h2>
                        <p className="text-xs text-text-secondary">
                          Account and reel performance changes from stored daily
                          snapshots.
                        </p>
                      </div>

                      <div className="inline-flex self-start rounded-xl border border-panel-border bg-bg-deep/50 p-1">
                        {[7, 30, 90].map((days) => (
                          <button
                            key={days}
                            type="button"
                            onClick={() => setHistoryDays(days)}
                            className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                              historyDays === days
                                ? "bg-accent-primary text-white shadow"
                                : "text-text-secondary hover:text-text-primary"
                            }`}
                          >
                            {days}D
                          </button>
                        ))}
                      </div>
                    </div>

                    {historyLoading ? (
                      <div className="flex min-h-[260px] flex-col items-center justify-center gap-3">
                        <svg
                          className="h-8 w-8 animate-spin text-accent-primary"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <p className="text-xs text-text-secondary">
                          Loading {historyDays}-day history...
                        </p>
                      </div>
                    ) : historyError ? (
                      <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                        <p className="text-xs font-semibold text-red-400">
                          Could not load historical insights
                        </p>
                        <p className="mt-1 text-[11px] text-red-300/80">
                          {historyError}
                        </p>
                        <button
                          type="button"
                          onClick={loadInsightHistory}
                          className="mt-3 rounded-lg border border-red-500/25 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/10 cursor-pointer"
                        >
                          Retry
                        </button>
                      </div>
                    ) : !historyData || historyData.snapshots === 0 ? (
                      <div className="mt-6 rounded-2xl border border-dashed border-panel-border bg-bg-deep/20 px-6 py-12 text-center">
                        <h3 className="text-sm font-semibold text-text-primary">
                          No historical snapshots yet
                        </h3>
                        <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-text-secondary">
                          The first daily snapshot will appear after the
                          scheduler runs or after a successful insights refresh
                          saves today&apos;s data.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="mt-6 flex flex-wrap items-center gap-2 text-[11px] text-text-secondary">
                          <span className="rounded-full border border-panel-border bg-bg-deep/30 px-3 py-1.5">
                            {historyData.snapshots} snapshot
                            {historyData.snapshots === 1 ? "" : "s"}
                          </span>
                          <span className="rounded-full border border-panel-border bg-bg-deep/30 px-3 py-1.5">
                            {historyData.daysAvailable} of{" "}
                            {historyData.daysRequested} days available
                          </span>
                          <span
                            className={`rounded-full border px-3 py-1.5 ${
                              historyData.fullPeriodAvailable
                                ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
                                : "border-amber-500/25 bg-amber-500/10 text-amber-300"
                            }`}
                          >
                            {historyData.fullPeriodAvailable
                              ? "Full period available"
                              : "Partial history"}
                          </span>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                          <GrowthCard
                            label="Followers"
                            currentValue={historyData.summary?.currentFollowers}
                            growth={historyData.summary?.followersGrowth}
                            growthPercentage={
                              historyData.summary?.followersGrowthPercentage
                            }
                            description={`Change across available ${historyDays}-day history`}
                          />

                          <GrowthCard
                            label="Reel Views"
                            currentValue={historyData.summary?.currentViews}
                            growth={historyData.summary?.viewsGrowth}
                            growthPercentage={
                              historyData.summary?.viewsGrowthPercentage
                            }
                            description="Change in cumulative analyzed reel views"
                          />

                          <GrowthCard
                            label="Reel Likes"
                            currentValue={historyData.summary?.currentLikes}
                            growth={historyData.summary?.likesGrowth}
                            growthPercentage={
                              historyData.summary?.likesGrowthPercentage
                            }
                            description="Change in cumulative analyzed reel likes"
                          />

                          <GrowthCard
                            label="Comments"
                            currentValue={historyData.summary?.currentComments}
                            growth={historyData.summary?.commentsGrowth}
                            growthPercentage={
                              historyData.summary?.commentsGrowthPercentage
                            }
                            description="Change in audience conversations"
                          />

                          <GrowthCard
                            label="Reel Reach"
                            currentValue={historyData.summary?.currentReach}
                            growth={historyData.summary?.reachGrowth}
                            growthPercentage={
                              historyData.summary?.reachGrowthPercentage
                            }
                            description="Change in combined analyzed reel reach"
                          />
                        </div>

                        {!hasMultipleHistoryPoints ? (
                          <div className="mt-6 rounded-2xl border border-dashed border-panel-border bg-bg-deep/20 px-6 py-10 text-center">
                            <h3 className="text-sm font-semibold text-text-primary">
                              One snapshot collected
                            </h3>
                            <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-text-secondary">
                              Growth charts need at least two daily snapshots.
                              The next scheduled collection will create the
                              first comparison point.
                            </p>
                          </div>
                        ) : (
                          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
                            <div className="rounded-2xl border border-panel-border bg-bg-deep/30 p-4">
                              <div className="mb-4">
                                <h3 className="text-sm font-semibold text-text-primary">
                                  Followers Trend
                                </h3>
                                <p className="text-[10px] text-text-secondary">
                                  Daily follower-count snapshots
                                </p>
                              </div>

                              <div className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart
                                    data={historyChartData}
                                    margin={{
                                      top: 10,
                                      right: 12,
                                      left: -12,
                                      bottom: 0,
                                    }}
                                  >
                                    <CartesianGrid
                                      strokeDasharray="3 3"
                                      stroke="rgba(148, 163, 184, 0.12)"
                                    />
                                    <XAxis
                                      dataKey="date"
                                      tick={{ fill: "#94a3b8", fontSize: 10 }}
                                      axisLine={false}
                                      tickLine={false}
                                    />
                                    <YAxis
                                      allowDecimals={false}
                                      tick={{ fill: "#94a3b8", fontSize: 10 }}
                                      axisLine={false}
                                      tickLine={false}
                                      tickFormatter={formatNumber}
                                    />
                                    <Tooltip
                                      contentStyle={{
                                        background: "#16161d",
                                        border:
                                          "1px solid rgba(148, 163, 184, 0.2)",
                                        borderRadius: "12px",
                                      }}
                                      labelStyle={{ color: "#e2e8f0" }}
                                      itemStyle={{ color: "#cbd5e1" }}
                                      formatter={(value) => [
                                        Number(value).toLocaleString(),
                                        "Followers",
                                      ]}
                                    />
                                    <Line
                                      type="monotone"
                                      dataKey="followersCount"
                                      name="Followers"
                                      stroke="currentColor"
                                      strokeWidth={3}
                                      dot={{ r: 3 }}
                                      activeDot={{ r: 5 }}
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                            </div>

                            <div className="rounded-2xl border border-panel-border bg-bg-deep/30 p-4">
                              <div className="mb-4">
                                <h3 className="text-sm font-semibold text-text-primary">
                                  Reel Performance Trend
                                </h3>
                                <p className="text-[10px] text-text-secondary">
                                  Views and reach from the analyzed reel set
                                </p>
                              </div>

                              <div className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart
                                    data={historyChartData}
                                    margin={{
                                      top: 10,
                                      right: 12,
                                      left: -12,
                                      bottom: 0,
                                    }}
                                  >
                                    <CartesianGrid
                                      strokeDasharray="3 3"
                                      stroke="rgba(148, 163, 184, 0.12)"
                                    />
                                    <XAxis
                                      dataKey="date"
                                      tick={{ fill: "#94a3b8", fontSize: 10 }}
                                      axisLine={false}
                                      tickLine={false}
                                    />
                                    <YAxis
                                      allowDecimals={false}
                                      tick={{ fill: "#94a3b8", fontSize: 10 }}
                                      axisLine={false}
                                      tickLine={false}
                                      tickFormatter={formatNumber}
                                    />
                                    <Tooltip
                                      contentStyle={{
                                        background: "#16161d",
                                        border:
                                          "1px solid rgba(148, 163, 184, 0.2)",
                                        borderRadius: "12px",
                                      }}
                                      labelStyle={{ color: "#e2e8f0" }}
                                      itemStyle={{ color: "#cbd5e1" }}
                                      formatter={(value, name) => [
                                        Number(value).toLocaleString(),
                                        name,
                                      ]}
                                    />
                                    <Line
                                      type="monotone"
                                      dataKey="totalReelViews"
                                      name="Views"
                                      stroke="currentColor"
                                      strokeWidth={3}
                                      dot={{ r: 3 }}
                                      activeDot={{ r: 5 }}
                                    />
                                    <Line
                                      type="monotone"
                                      dataKey="totalReelReach"
                                      name="Reach"
                                      stroke="currentColor"
                                      strokeWidth={2}
                                      strokeDasharray="6 4"
                                      dot={{ r: 2 }}
                                      activeDot={{ r: 4 }}
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Reels Gallery Panel (col-span-4) */}
                  <div className="md:col-span-4 p-6 md:p-8 rounded-3xl bg-panel/50 backdrop-blur-xl border border-panel-border shadow-xl">
                    <h2 className="text-lg font-bold tracking-tight text-text-primary mb-1">
                      Recent Reels Performance
                    </h2>
                    <p className="text-xs text-text-secondary mb-6">
                      Specific posts performance and computed engagement
                      metrics.
                    </p>

                    {data.reels.length === 0 ? (
                      <div className="py-12 text-center text-xs text-text-secondary border border-dashed border-panel-border rounded-xl">
                        No video reels detected on this creator profile.
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {data.reels.map((reel, index) => {
                          const interactions =
                            reel.totalInteractions ??
                            (reel.likeCount || 0) +
                              (reel.commentCount || 0) +
                              (reel.savedCount || 0);

                          const engagement =
                            reel.viewCount > 0
                              ? ((interactions / reel.viewCount) * 100).toFixed(
                                  1
                                )
                              : "0.0";
                          const expanded = expandedReel === reel.mediaId;
                          return (
                            <div
                              key={reel.mediaId}
                              className="rounded-2xl border border-panel-border bg-panel/50 overflow-hidden"
                            >
                              {/* Header */}
                              <button
                                onClick={() =>
                                  setExpandedReel(
                                    expanded ? null : reel.mediaId
                                  )
                                }
                                className="w-full p-5 flex justify-between items-center hover:bg-panel/40 transition"
                              >
                                <div className="text-left flex-1">
                                  <div className="font-semibold text-text-primary">
                                    {reel.caption?.trim()
                                      ? reel.caption
                                      : `Reel #${index + 1}`}
                                  </div>

                                  <div className="text-xs text-text-secondary mt-1">
                                    {reel.mediaId}
                                  </div>

                                  <div className="text-xs text-text-secondary mt-2">
                                    {new Date(
                                      reel.timestamp
                                    ).toLocaleDateString()}
                                  </div>
                                </div>

                                <div className="flex items-center gap-6">
                                  <div className="text-right">
                                    <div className="text-sm text-text-secondary">
                                      Views
                                    </div>

                                    <div className="font-bold text-lg">
                                      {formatNumber(reel.viewCount)}
                                    </div>
                                  </div>

                                  <div className="text-right">
                                    <div className="text-sm text-text-secondary">
                                      Engagement
                                    </div>

                                    <div className="font-bold text-lg">
                                      {(
                                        (reel.totalInteractions /
                                          Math.max(
                                            reel.reach || reel.viewCount,
                                            1
                                          )) *
                                        100
                                      ).toFixed(1)}
                                      %
                                    </div>
                                  </div>

                                  <ChevronDown
                                    className={`h-5 w-5 transition-transform ${
                                      expanded ? "rotate-180" : ""
                                    }`}
                                  />
                                </div>
                              </button>

                              {/* Expanded Body */}
                              {expanded && (
                                <div className="border-t border-panel-border p-5">
                                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
                                    <MetricItem
                                      label="Views"
                                      value={formatNumber(reel.viewCount)}
                                    />

                                    <MetricItem
                                      label="Reach"
                                      value={formatNumber(reel.reach)}
                                    />

                                    <MetricItem
                                      label="Likes"
                                      value={formatNumber(reel.likeCount)}
                                    />

                                    <MetricItem
                                      label="Comments"
                                      value={formatNumber(reel.commentCount)}
                                    />

                                    <MetricItem
                                      label="Saves"
                                      value={formatNumber(reel.savedCount)}
                                    />

                                    <MetricItem
                                      label="Shares"
                                      value={formatNumber(reel.shareCount)}
                                    />

                                    <MetricItem
                                      label="Interactions"
                                      value={formatNumber(
                                        reel.totalInteractions
                                      )}
                                    />

                                    <MetricItem
                                      label="Avg Watch Time"
                                      value={formatWatchTime(
                                        reel.averageWatchTime
                                      )}
                                    />

                                    <MetricItem
                                      label="Total Watch Time"
                                      value={formatTotalWatchTime(
                                        reel.totalWatchTime
                                      )}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Auto-DM Automations Dashboard Content */
                <div className="md:col-span-4 p-6 md:p-8 rounded-3xl bg-panel/50 backdrop-blur-xl border border-panel-border shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-lg font-bold tracking-tight text-text-primary mb-1">
                        Auto-DM Automation Rules
                      </h2>
                      <p className="text-xs text-text-secondary">
                        Manage keyword-based automatic direct messages and
                        public comment replies on your reels.
                      </p>
                    </div>
                    {canEditAutoDm&&<button
                      onClick={() => {
                        setFormError(null);
                        setIsCreateModalOpen(true);
                      }}
                      className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary hover:opacity-95 text-white text-xs font-semibold shadow-lg shadow-accent-primary/25 cursor-pointer flex items-center gap-2 self-start sm:self-auto transition-all"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Create Rule
                    </button>}
                  </div>

                  {loadingRules ? (
                    <div className="flex flex-col items-center justify-center py-16 space-y-3">
                      <svg
                        className="animate-spin h-8 w-8 text-accent-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span className="text-xs text-text-secondary">
                        Retrieving active rules...
                      </span>
                    </div>
                  ) : rulesError ? (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                      Failed to load rules: {rulesError}
                    </div>
                  ) : rules.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-panel-border rounded-2xl bg-bg-deep/30">
                      <div className="h-12 w-12 rounded-2xl bg-accent-primary/10 border border-accent-primary/20 text-accent-primary flex items-center justify-center mb-4">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-sm font-semibold text-text-primary mb-1">
                        No Automation Rules Configured
                      </h3>
                      <p className="text-xs text-text-secondary max-w-xs mb-6">
                        Setup keyword-triggered private DMs and public comment
                        replies on your posts to engage your followers.
                      </p>
                      <button
                        onClick={() => {
                          setFormError(null);
                          setIsCreateModalOpen(true);
                        }}
                        className="py-2.5 px-5 rounded-xl bg-accent-primary hover:bg-accent-primary/90 text-white text-xs font-semibold transition-all cursor-pointer"
                      >
                        Configure First Rule
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {rules.map((rule) => {
                        const matchedReel = data?.reels?.find(
                          (r) => r.mediaId === rule.mediaId
                        );
                        return (
                          <div
                            key={rule.id}
                            className="p-5 rounded-2xl bg-bg-deep/40 border border-panel-border hover:border-panel-border/80 transition-all flex flex-col justify-between gap-4 shadow-sm"
                          >
                            <div className="space-y-3">
                              <div className="flex items-start gap-3">
                                <div className="h-10 w-10 shrink-0 rounded-lg bg-panel-light border border-panel-border flex items-center justify-center text-accent-secondary font-bold text-xs">
                                  <svg
                                    className="w-5 h-5 text-accent-secondary"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                    />
                                  </svg>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <span className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider block">
                                    Target Reel
                                  </span>
                                  <p className="text-xs font-semibold text-text-primary line-clamp-1 leading-snug">
                                    {matchedReel?.caption ||
                                      `Reel ID: ${rule.mediaId}`}
                                  </p>
                                  {matchedReel && (
                                    <span className="text-[9px] text-text-secondary/50 block mt-0.5">
                                      {matchedReel.viewCount.toLocaleString()}{" "}
                                      views •{" "}
                                      {matchedReel.commentCount.toLocaleString()}{" "}
                                      comments
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div>
                                <span className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider block">
                                  Keyword Trigger
                                </span>
                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 mt-1 rounded bg-accent-primary/10 border border-accent-primary/20 text-xs font-bold text-accent-primary">
                                  "{rule.keyword}"
                                </div>
                              </div>

                              <div className="space-y-1.5 pt-1">
                                <div>
                                  <span className="text-[10px] text-text-secondary font-semibold block">
                                    DM Message:
                                  </span>
                                  <p className="text-xs text-text-primary line-clamp-2 bg-panel-light/40 border border-panel-border/40 p-2 rounded-lg mt-1 italic">
                                    "{rule.dmMessage}"
                                  </p>
                                </div>
                                {rule.publicReplyMessage && (
                                  <div>
                                    <span className="text-[10px] text-text-secondary font-semibold block">
                                      Comment Reply:
                                    </span>
                                    <p className="text-xs text-text-primary line-clamp-2 bg-panel-light/40 border border-panel-border/40 p-2 rounded-lg mt-1 italic">
                                      "{rule.publicReplyMessage}"
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="border-t border-panel-border/40 pt-4 flex items-center justify-between">
                              <span className="text-[10px] text-text-secondary/50">
                                Created:{" "}
                                {new Date(rule.createdAt).toLocaleDateString()}
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleOpenLogs(rule)}
                                  className="p-2 px-3 rounded-xl bg-panel-light hover:bg-accent-primary/10 text-text-secondary hover:text-accent-primary border border-panel-border cursor-pointer transition-colors flex items-center justify-center gap-1.5 text-xs font-medium"
                                  title="View Logs"
                                >
                                  <svg
                                    className="w-3.5 h-3.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  Logs
                                </button>
                                {canEditAutoDm&&<button
                                  onClick={() => handleDeleteRule(rule.id)}
                                  className="p-2 rounded-xl bg-panel-light hover:bg-red-500/10 text-text-secondary hover:text-red-400 border border-panel-border cursor-pointer transition-colors flex items-center justify-center"
                                  title="Delete Rule"
                                >
                                  <svg
                                    className="w-3.5 h-3.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </button>}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        )}
      </div>

      {/* Create Rule Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-deep/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-panel border border-panel-border shadow-2xl p-6 md:p-8 animate-scaleUp overflow-hidden max-h-[90vh] flex flex-col justify-between">
            <div className="flex items-center justify-between pb-4 border-b border-panel-border/30">
              <h3 className="text-lg font-bold text-text-primary">
                Create Automation Rule
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-text-secondary hover:text-text-primary cursor-pointer p-1 rounded-lg hover:bg-panel-light transition-all"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form
              onSubmit={handleCreateRule}
              className="space-y-4 py-4 flex-1 overflow-y-auto pr-1"
            >
              {formError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
                  <svg
                    className="w-4 h-4 shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <span>{formError}</span>
                </div>
              )}

              {/* Reel Select Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                  Select Reel *
                </label>
                <select
                  value={selectedReelId}
                  onChange={(e) => setSelectedReelId(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl bg-bg-deep/80 border border-panel-border text-text-primary text-xs outline-none focus:border-accent-primary transition-all cursor-pointer"
                >
                  <option value="">-- Choose a recent Reel --</option>
                  {data?.reels?.map((reel) => (
                    <option key={reel.mediaId} value={reel.mediaId}>
                      {reel.caption
                        ? `${reel.caption.substring(0, 50)}${
                            reel.caption.length > 50 ? "..." : ""
                          }`
                        : `Reel (ID: ${reel.mediaId})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Trigger Keyword */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                  Trigger Keyword *
                </label>
                <input
                  type="text"
                  placeholder="e.g. DISCOUNT, LINK"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl bg-bg-deep/80 border border-panel-border text-text-primary placeholder:text-text-secondary/30 text-xs outline-none focus:border-accent-primary transition-all"
                  required
                />
                <span className="text-[10px] text-text-secondary/50 mt-1 block">
                  Case-insensitive trigger word that followers comment.
                </span>
              </div>

              {/* Private DM Message */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                  Private DM Message *
                </label>
                <textarea
                  rows="3"
                  placeholder="Here is the link to purchase! http://..."
                  value={dmMessage}
                  onChange={(e) => setDmMessage(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl bg-bg-deep/80 border border-panel-border text-text-primary placeholder:text-text-secondary/30 text-xs outline-none focus:border-accent-primary transition-all resize-none"
                  required
                />
                <span className="text-[10px] text-text-secondary/50 mt-1 block">
                  Automated message sent directly to commenter's inbox.
                </span>
              </div>

              {/* Public Comment Reply */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                  Public Comment Reply (Optional)
                </label>
                <textarea
                  rows="2"
                  placeholder="Just sent you a DM! Check your inbox 📩"
                  value={publicReplyMessage}
                  onChange={(e) => setPublicReplyMessage(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl bg-bg-deep/80 border border-panel-border text-text-primary placeholder:text-text-secondary/30 text-xs outline-none focus:border-accent-primary transition-all resize-none"
                />
                <span className="text-[10px] text-text-secondary/50 mt-1 block">
                  Optional response comment published on the Reel.
                </span>
              </div>

              <div className="pt-4 border-t border-panel-border/30 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-panel-light hover:bg-panel-light/80 text-text-primary text-xs font-semibold border border-panel-border transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRule}
                  className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary hover:opacity-95 text-white text-xs font-semibold shadow-lg shadow-accent-primary/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {submittingRule ? "Creating..." : "Create Rule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logs Modal */}
      {selectedRuleForLogs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-deep/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl rounded-3xl bg-panel border border-panel-border shadow-2xl p-6 md:p-8 animate-scaleUp overflow-hidden max-h-[90vh] flex flex-col justify-between">
            <div className="flex items-center justify-between pb-4 border-b border-panel-border/30">
              <div>
                <h3 className="text-lg font-bold text-text-primary">
                  Automation Trigger Logs
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Execution history for rule matching keyword{" "}
                  <strong className="text-accent-primary">
                    "{selectedRuleForLogs.keyword}"
                  </strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedRuleForLogs(null)}
                className="text-text-secondary hover:text-text-primary cursor-pointer p-1 rounded-lg hover:bg-panel-light transition-all"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 pr-1 min-h-[250px]">
              {loadingLogs ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-3">
                  <svg
                    className="animate-spin h-8 w-8 text-accent-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span className="text-xs text-text-secondary">
                    Retrieving execution logs...
                  </span>
                </div>
              ) : logsError ? (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
                  <svg
                    className="w-4 h-4 shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <span>Failed to load logs: {logsError}</span>
                </div>
              ) : logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-panel-border rounded-2xl bg-bg-deep/30 h-full">
                  <svg
                    className="w-10 h-10 text-text-secondary/20 mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h4 className="text-xs font-semibold text-text-primary mb-0.5">
                    No Execution Logs Yet
                  </h4>
                  <p className="text-[11px] text-text-secondary max-w-xs leading-relaxed">
                    Once a follower comments the keyword{" "}
                    <strong className="text-text-primary font-semibold">
                      "{selectedRuleForLogs.keyword}"
                    </strong>{" "}
                    on your targeted Reel, trigger outcomes will display here.
                  </p>
                </div>
              ) : (
                <div className="border border-panel-border rounded-xl overflow-hidden bg-bg-deep/20 divide-y divide-panel-border">
                  <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-panel-light text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                    <div className="col-span-3">Time Sent</div>
                    <div className="col-span-2 text-center">Status</div>
                    <div className="col-span-3">Commenter ID</div>
                    <div className="col-span-4">Details</div>
                  </div>
                  {logs.map((log) => (
                    <div
                      key={log.commentId}
                      className="grid grid-cols-12 gap-3 px-4 py-3 text-xs items-center hover:bg-panel-light/30 transition-colors"
                    >
                      <div className="col-span-3 text-text-secondary text-[11px]">
                        {new Date(log.sentAt).toLocaleString()}
                      </div>
                      <div className="col-span-2 flex justify-center">
                        {log.status === "SENT" ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-bold text-emerald-400 uppercase tracking-wide">
                            SENT
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/25 text-[10px] font-bold text-red-400 uppercase tracking-wide">
                            FAILED
                          </span>
                        )}
                      </div>
                      <div
                        className="col-span-3 font-mono text-[11px] text-text-secondary truncate"
                        title={log.commenterIgScopedId}
                      >
                        {log.commenterIgScopedId}
                      </div>
                      <div className="col-span-4 text-[11px]">
                        {log.status === "FAILED" ? (
                          <span className="text-red-400 font-medium leading-relaxed block break-words">
                            {log.errorMessage || "Unknown delivery failure"}
                          </span>
                        ) : (
                          <span className="text-text-secondary/60 italic block">
                            Direct Message Sent
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-panel-border/30 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedRuleForLogs(null)}
                className="py-2.5 px-4 rounded-xl bg-panel-light hover:bg-panel-light/80 text-text-primary text-xs font-semibold border border-panel-border transition-all cursor-pointer"
              >
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
