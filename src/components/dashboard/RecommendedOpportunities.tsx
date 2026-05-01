"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Building2, ExternalLink, MapPin, RefreshCcw, Search, Sparkles } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import SectionHeader from "@/components/ui/SectionHeader";
import { fetchJobs } from "@/lib/api";
import type { CareerPath, JobSearchType } from "@/types/analysis";

interface RecommendedOpportunitiesProps {
  careerPaths: CareerPath[];
  marketQuery?: string;
  jobType: JobSearchType;
  marketRegion?: string;
  targetRole?: string;
}

function formatLocation(path: CareerPath) {
  if (path.job_location) return path.job_location;

  const parts = [path.job_city, path.job_state, path.job_country].filter(Boolean);
  if (parts.length > 0) return parts.join(", ");

  return path.job_is_remote ? "Remote" : "Location unavailable";
}

function getInitials(input: string) {
  return input
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function buildSuggestedQueries(
  careerPaths: CareerPath[],
  targetRole?: string
) {
  const seen = new Set<string>();
  const suggestions: string[] = [];

  const push = (value?: string) => {
    const normalized = value?.trim();
    if (!normalized) return;
    const key = normalized.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    suggestions.push(normalized);
  };

  push(targetRole);
  careerPaths.slice(0, 6).forEach((path) => push(path.role));

  const lowered = (targetRole || "").toLowerCase();
  if (lowered.includes("backend")) {
    push("Platform Engineer");
    push("Full Stack Developer");
  } else if (lowered.includes("frontend")) {
    push("UI Engineer");
    push("Full Stack Developer");
  } else if (lowered.includes("data")) {
    push("Business Analyst");
    push("Machine Learning Engineer");
  } else if (lowered.includes("product")) {
    push("Product Analyst");
    push("Business Analyst");
  } else {
    push("Backend Engineer");
    push("Frontend Engineer");
    push("Full Stack Developer");
    push("Data Analyst");
  }

  return suggestions.slice(0, 7);
}

export default function RecommendedOpportunities({
  careerPaths,
  marketQuery,
  jobType,
  marketRegion,
  targetRole,
}: RecommendedOpportunitiesProps) {
  const [draftSearch, setDraftSearch] = useState(marketQuery || "");
  const [searchResults, setSearchResults] = useState<CareerPath[] | null>(null);
  const [activeSearch, setActiveSearch] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const suggestedQueries = useMemo(
    () => buildSuggestedQueries(careerPaths, targetRole),
    [careerPaths, targetRole]
  );

  useEffect(() => {
    setDraftSearch(marketQuery || "");
    setSearchResults(null);
    setActiveSearch("");
    setSearchError(null);
  }, [jobType, marketQuery]);

  const displayedPaths = useMemo(() => {
    if (searchResults) {
      return searchResults;
    }
    return careerPaths;
  }, [careerPaths, searchResults]);

  const runSearch = async (rawQuery: string) => {
    const query = rawQuery.trim();
    if (!query) {
      setSearchResults(null);
      setActiveSearch("");
      setSearchError(null);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const results = await fetchJobs(query, jobType);
      setSearchResults(results);
      setActiveSearch(query);
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : "Unable to fetch more roles.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await runSearch(draftSearch);
  };

  const handleReset = () => {
    setSearchResults(null);
    setActiveSearch("");
    setSearchError(null);
    setDraftSearch(marketQuery || "");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.55 }}
    >
      <SectionHeader
        label="JSearch Explorer"
        title="Recommended opportunities and other roles"
        subtitle={
          activeSearch
            ? `Showing fresh JSearch ${jobType} results for: ${activeSearch}`
            : marketQuery
              ? `Current ${marketRegion || "India"} market query: ${marketQuery}. Search any other role below.`
              : "Role matches generated from the live JSearch feed."
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {displayedPaths.map((path) => {
          const topSkills = path.relevantSkills
            .slice(0, 3)
            .map((skill) => (typeof skill === "string" ? skill : skill.name));

          return (
            <motion.div
              key={`${path.role}-${path.employer_name}`}
              whileHover={{ y: -8, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
            >
              <GlassCard
                padding="md"
                hover
                className="dashboard-surface rounded-[26px]"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-ev-text-muted">
                      {path.employer_name || "Opportunity"}
                    </p>
                    <h3 className="mt-2 line-clamp-2 text-lg font-semibold text-ev-text">
                      {path.role}
                    </h3>
                  </div>
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-right">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-emerald-300">Match</p>
                    <p className="text-lg font-display font-bold text-emerald-300">{path.matchPercentage}%</p>
                  </div>
                </div>

                <div className="mb-4 flex items-center gap-2 text-sm text-ev-text-secondary">
                  <div className="dashboard-surface-soft flex h-9 w-9 items-center justify-center rounded-xl">
                    <span className="text-xs font-semibold text-ev-text">
                      {getInitials(path.employer_name || path.role)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 text-ev-text-muted" />
                      <span className="truncate">{path.employer_name || "Confidential employer"}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-ev-text-muted">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="truncate">{formatLocation(path)}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-violet-400"
                    style={{ width: `${path.matchPercentage}%` }}
                  />
                </div>

                <p className="line-clamp-3 text-sm leading-relaxed text-ev-text-secondary">
                  {path.description}
                </p>

                {topSkills.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {topSkills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-[11px] text-cyan-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-5 flex items-center justify-between gap-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-ev-text-muted">
                    {path.job_employment_type || (path.job_is_remote ? "Remote" : "Role")}
                  </p>
                  <a
                    href={path.job_link || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="dashboard-pill inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs text-ev-text transition-colors hover:border-ev-gold/30 hover:text-ev-gold-soft"
                  >
                    Open role
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {displayedPaths.length === 0 && (
        <GlassCard
          padding="md"
          className="dashboard-surface mt-4 rounded-[24px]"
        >
          <p className="text-sm text-ev-text-secondary">
            {activeSearch
              ? `No live roles matched "${activeSearch}". Try a broader role, skill, or company.`
              : "No opportunity cards are available for this track yet."}
          </p>
        </GlassCard>
      )}

      <GlassCard
        padding="lg"
        className="dashboard-surface mt-6 rounded-[30px]"
      >
        <div className="mx-auto max-w-2xl text-center">
          <p className="section-label mb-2">Find More Roles</p>
          <h3 className="text-2xl font-display font-bold text-ev-text">Search JSearch for other roles</h3>
          <p className="mt-2 text-sm text-ev-text-secondary">
            Pull fresh {jobType} openings from the {marketRegion || "India"} market and replace these cards with a new JSearch query.
          </p>
        </div>

        {suggestedQueries.length > 0 && (
          <div className="mx-auto mt-5 flex max-w-3xl flex-wrap justify-center gap-2">
            {suggestedQueries.map((query) => (
              <button
                key={query}
                type="button"
                onClick={() => {
                  setDraftSearch(query);
                  void runSearch(query);
                }}
                disabled={isSearching}
                className="dashboard-pill rounded-full px-3 py-2 text-xs text-ev-text-secondary transition-colors hover:border-ev-gold/30 hover:text-ev-text disabled:cursor-not-allowed disabled:opacity-60"
              >
                {query}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={handleSearch}
          className="mx-auto mt-6 flex max-w-2xl flex-col gap-3 sm:flex-row"
        >
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ev-text-muted" />
            <input
              value={draftSearch}
              onChange={(event) => setDraftSearch(event.target.value)}
              placeholder={`Search another role on JSearch${marketRegion ? ` in ${marketRegion}` : ""}`}
              className="dashboard-pill w-full rounded-full py-3 pl-11 pr-4 text-sm text-ev-text outline-none transition-colors focus:border-ev-gold/35"
            />
          </label>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSearching}
              className="dashboard-pill inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm text-ev-text transition-colors hover:border-ev-gold/30 hover:bg-ev-gold/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Sparkles className="h-4 w-4 text-ev-gold" />
              {isSearching ? "Searching..." : "Search"}
            </button>
            {searchResults && (
              <button
                type="button"
                onClick={handleReset}
                className="dashboard-pill inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm text-ev-text-secondary transition-colors hover:border-ev-gold/30 hover:text-ev-text"
              >
                <RefreshCcw className="h-4 w-4" />
                Reset
              </button>
            )}
          </div>
        </form>

        {searchError && (
          <p className="mx-auto mt-4 max-w-2xl text-sm text-rose-300">
            {searchError}
          </p>
        )}

        {!searchError && (
          <p className="mx-auto mt-4 max-w-2xl text-center text-xs text-ev-text-muted">
            Try role-first searches like `Backend Engineer`, `Product Analyst`, or `Data Analyst`.
          </p>
        )}
      </GlassCard>
    </motion.div>
  );
}
