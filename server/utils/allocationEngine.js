/**
 * Smart Allocation Engine
 *
 * Scores and ranks batches for allocation matching based on:
 *   1. Risk priority   — high-risk batches (>70%) get dispatched first (40%)
 *   2. Freshness match — map freshness tier to demand-type (25%)
 *   3. Deadline proximity — urgent requests bump score (20%)
 *   4. Batch utilization — prefer batches closest to requested qty (15%)
 */

// ── Freshness-to-demand-type mapping ────────────────────────────────────────
// "demand_type" can be inferred from keyword in location/notes, or passed in
const DEMAND_MAP = {
  retail:     "fresh",      // Fresh (≤30%) → Retail / Supermarkets
  supermarket:"fresh",
  hotel:      "moderate",   // Moderate (31-70%) → Hotels / Restaurants
  restaurant: "moderate",
  catering:   "moderate",
  processing: "high",       // High (>70%) → Processing plants / B2B
  factory:    "high",
  industrial: "high",
  export:     "fresh",
  wholesale:  "moderate",
};

/**
 * Infer demand type from request location / notes text.
 * Returns "fresh" | "moderate" | "high" | null
 */
const inferDemandType = (request) => {
  const text = `${request.location ?? ""} ${request.notes ?? ""}`.toLowerCase();
  for (const [keyword, tier] of Object.entries(DEMAND_MAP)) {
    if (text.includes(keyword)) return tier;
  }
  return null; // unknown — don't penalize
};

/**
 * Convert risk_score to freshness tier.
 */
const riskTier = (score) => {
  if (score <= 30) return "fresh";
  if (score <= 70) return "moderate";
  return "high";
};

/**
 * Score a single batch against a request.
 *
 * @param {Object}  batch   — row from `batches` table
 * @param {Object}  request — row from `allocation_requests` table
 * @returns {number} 0-100 composite score (higher = better match)
 */
export const scoreBatch = (batch, request) => {
  const risk = Number(batch.risk_score) || 0;
  const tier = riskTier(risk);

  // ── 1. Risk Priority (40%) ────────────────────────────────────────────────
  // We WANT to dispatch high-risk batches first to minimise spoilage.
  // >70% → score 100, 50-70 → 70, 30-50 → 40, <30 → 20
  let riskPriority;
  if (risk > 70) riskPriority = 100;
  else if (risk > 50) riskPriority = 70;
  else if (risk > 30) riskPriority = 40;
  else riskPriority = 20;

  // ── 2. Freshness-to-demand match (25%) ────────────────────────────────────
  const demandType = inferDemandType(request);
  let freshnessMatch = 50; // neutral when unknown
  if (demandType) {
    if (tier === demandType) freshnessMatch = 100;       // perfect fit
    else if (
      (tier === "moderate" && demandType === "fresh") ||
      (tier === "fresh" && demandType === "moderate")
    ) {
      freshnessMatch = 40; // one tier off
    } else {
      freshnessMatch = 10; // mismatch
    }
  }

  // ── 3. Deadline proximity (20%) ───────────────────────────────────────────
  let deadlineScore = 50; // neutral if no deadline
  if (request.deadline) {
    const daysLeft = (new Date(request.deadline) - Date.now()) / 86_400_000;
    if (daysLeft <= 1) deadlineScore = 100;      // extremely urgent
    else if (daysLeft <= 3) deadlineScore = 85;
    else if (daysLeft <= 7) deadlineScore = 60;
    else deadlineScore = 30;                      // plenty of time
  }

  // ── 4. Batch utilization (15%) ────────────────────────────────────────────
  // Prefer batches whose quantity is closest to the requested amount
  // (reduces leftover fragmentation).
  const reqQty = Number(request.quantity) || 1;
  const batchQty = Number(batch.quantity) || 1;
  const ratio = Math.min(reqQty / batchQty, 1);  // 0..1
  const utilizationScore = ratio * 100;           // 100 = perfect match

  // ── Composite ─────────────────────────────────────────────────────────────
  const composite =
    riskPriority * 0.40 +
    freshnessMatch * 0.25 +
    deadlineScore * 0.20 +
    utilizationScore * 0.15;

  return Math.round(Math.min(100, Math.max(0, composite)));
};

/**
 * Rank a list of batches for a given allocation request.
 *
 * @param {Object[]} batches  — array of batch rows (active, matching crop)
 * @param {Object}   request  — allocation request row
 * @returns {Object[]} batches sorted descending by score, each with `.matchScore`
 */
export const rankBatches = (batches, request) => {
  return batches
    .map((batch) => ({
      ...batch,
      matchScore: scoreBatch(batch, request),
      riskTier: riskTier(Number(batch.risk_score) || 0),
    }))
    .sort((a, b) => b.matchScore - a.matchScore);
};

export default { scoreBatch, rankBatches };
