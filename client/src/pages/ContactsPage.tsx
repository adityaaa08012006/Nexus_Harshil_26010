import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuthContext } from "../context/AuthContext";
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Download,
  Upload,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  TrendingDown,
  Minus,
  MessageSquare,
  Clock,
  X,
  DollarSign,
  Wheat,
  ShoppingCart,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Contact {
  id: string;
  type: "farmer" | "buyer" | "both";
  name: string;
  phone: string | null;
  email: string | null;
  location: string | null;
  notes: string | null;
  // farmer fields
  growing_crop: string | null;
  crop_variety: string | null;
  area_acres: number | null;
  expected_harvest_date: string | null;
  expected_quantity: number | null;
  quantity_unit: string | null;
  // buyer fields
  company: string | null;
  purchase_volume: number | null;
  preferred_crops: string[] | null;
  created_at: string;
  updated_at: string;
}

interface ContactLog {
  id: string;
  contact_id: string;
  type: string;
  summary: string;
  logged_at: string;
  logged_by_profile: { name: string; email: string; role: string } | null;
}

interface PriceRef {
  id: string;
  contact_id: string;
  crop: string;
  offered_price: number | null;
  market_price: number | null;
  unit: string;
  notes: string | null;
  recorded_at: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const LOG_TYPES = ["call", "email", "meeting", "order", "negotiation", "note", "visit"] as const;
const LOG_ICONS: Record<string, React.ReactNode> = {
  call: <Phone className="w-3.5 h-3.5" />,
  email: <Mail className="w-3.5 h-3.5" />,
  meeting: <Users className="w-3.5 h-3.5" />,
  order: <ShoppingCart className="w-3.5 h-3.5" />,
  negotiation: <DollarSign className="w-3.5 h-3.5" />,
  note: <MessageSquare className="w-3.5 h-3.5" />,
  visit: <MapPin className="w-3.5 h-3.5" />,
};
const LOG_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  call: { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  email: { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  meeting: { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
  order: { bg: "#F0FDF4", text: "#065F46", border: "#6EE7B7" },
  negotiation: { bg: "#FDF4FF", text: "#7E22CE", border: "#E9D5FF" },
  note: { bg: "#F9FAFB", text: "#374151", border: "#E5E7EB" },
  visit: { bg: "#FEF3C7", text: "#92400E", border: "#FCD34D" },
};

const CROPS = [
  "Tomatoes", "Potatoes", "Onions", "Apples", "Bananas", "Cabbage",
  "Wheat", "Rice", "Grapes", "Cauliflower", "Maize", "Soybean",
  "Sugarcane", "Carrots", "Peas",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const apiBase = "http://localhost:5000/api/contacts";
const authHeaders = (token: string | undefined) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

const fmt = (n: number | null | undefined, decimals = 0) =>
  n != null ? n.toLocaleString("en-IN", { maximumFractionDigits: decimals }) : "—";

const fmtDate = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const priceTrend = (offered: number | null, market: number | null) => {
  if (offered == null || market == null) return "neutral";
  if (offered > market) return "up";
  if (offered < market) return "down";
  return "neutral";
};

// ─── CSV helpers ─────────────────────────────────────────────────────────────

const exportCSV = (contacts: Contact[], tab: "farmer" | "buyer") => {
  const farmerHeaders = ["Name", "Phone", "Email", "Location", "Crop", "Variety", "Area (ac)", "Harvest Date", "Exp. Qty", "Unit", "Notes"];
  const buyerHeaders = ["Name", "Phone", "Email", "Location", "Company", "Purchase Volume", "Preferred Crops", "Notes"];
  const headers = tab === "farmer" ? farmerHeaders : buyerHeaders;

  const rows =
    tab === "farmer"
      ? contacts.map((c) => [
          c.name, c.phone ?? "", c.email ?? "", c.location ?? "",
          c.growing_crop ?? "", c.crop_variety ?? "",
          c.area_acres ?? "", c.expected_harvest_date ?? "",
          c.expected_quantity ?? "", c.quantity_unit ?? "kg", c.notes ?? "",
        ])
      : contacts.map((c) => [
          c.name, c.phone ?? "", c.email ?? "", c.location ?? "",
          c.company ?? "", c.purchase_volume ?? "",
          (c.preferred_crops ?? []).join("; "), c.notes ?? "",
        ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${tab}s_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// ─── Contact Detail Panel ────────────────────────────────────────────────────

interface DetailPanelProps {
  contact: Contact;
  token: string | undefined;
  canEdit: boolean;
}

const DetailPanel: React.FC<DetailPanelProps> = ({ contact, token, canEdit }) => {
  const [logs, setLogs] = useState<ContactLog[]>([]);
  const [prices, setPrices] = useState<PriceRef[]>([]);
  const [activeSection, setActiveSection] = useState<"logs" | "prices">("logs");
  const [logForm, setLogForm] = useState({ type: "call", summary: "", logged_at: "" });
  const [priceForm, setPriceForm] = useState({ crop: "", offered_price: "", market_price: "", unit: "kg", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    const res = await fetch(`${apiBase}/${contact.id}/logs`, { headers: authHeaders(token) });
    if (res.ok) setLogs(await res.json());
  }, [contact.id, token]);

  const fetchPrices = useCallback(async () => {
    const res = await fetch(`${apiBase}/${contact.id}/prices`, { headers: authHeaders(token) });
    if (res.ok) setPrices(await res.json());
  }, [contact.id, token]);

  useEffect(() => { fetchLogs(); fetchPrices(); }, [fetchLogs, fetchPrices]);

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`${apiBase}/${contact.id}/logs`, {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({ type: logForm.type, summary: logForm.summary, logged_at: logForm.logged_at || undefined }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setLogForm({ type: "call", summary: "", logged_at: "" });
      await fetchLogs();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to add log");
    } finally { setSubmitting(false); }
  };

  const handleDeleteLog = async (logId: string) => {
    if (!confirm("Delete this log entry?")) return;
    await fetch(`${apiBase}/${contact.id}/logs/${logId}`, { method: "DELETE", headers: authHeaders(token) });
    await fetchLogs();
  };

  const handleAddPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`${apiBase}/${contact.id}/prices`, {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({
          crop: priceForm.crop,
          offered_price: priceForm.offered_price ? parseFloat(priceForm.offered_price) : null,
          market_price: priceForm.market_price ? parseFloat(priceForm.market_price) : null,
          unit: priceForm.unit,
          notes: priceForm.notes || null,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setPriceForm({ crop: "", offered_price: "", market_price: "", unit: "kg", notes: "" });
      await fetchPrices();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to add price");
    } finally { setSubmitting(false); }
  };

  const handleDeletePrice = async (priceId: string) => {
    if (!confirm("Delete this price record?")) return;
    await fetch(`${apiBase}/${contact.id}/prices/${priceId}`, { method: "DELETE", headers: authHeaders(token) });
    await fetchPrices();
  };

  return (
    <div className="bg-gray-50 border-t border-gray-100 p-4">
      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveSection("logs")}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
            activeSection === "logs" ? "bg-white shadow text-gray-900 border border-gray-200" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Interaction Log ({logs.length})
        </button>
        <button
          onClick={() => setActiveSection("prices")}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
            activeSection === "prices" ? "bg-white shadow text-gray-900 border border-gray-200" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Price References ({prices.length})
        </button>
      </div>

      {formError && (
        <div className="mb-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{formError}</div>
      )}

      {/* ── Interaction Log ── */}
      {activeSection === "logs" && (
        <div className="space-y-3">
          {/* Add form (owner/manager only) */}
          {canEdit && (
            <form onSubmit={handleAddLog} className="bg-white rounded-lg border border-gray-200 p-3 space-y-2">
              <p className="text-xs font-semibold text-gray-600 mb-2">Add Interaction</p>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={logForm.type}
                  onChange={(e) => setLogForm((p) => ({ ...p, type: e.target.value }))}
                  className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  {LOG_TYPES.map((t) => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
                <input
                  type="datetime-local"
                  value={logForm.logged_at}
                  onChange={(e) => setLogForm((p) => ({ ...p, logged_at: e.target.value }))}
                  className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
              <textarea
                value={logForm.summary}
                onChange={(e) => setLogForm((p) => ({ ...p, summary: e.target.value }))}
                placeholder="Summary of interaction…"
                required
                rows={2}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 resize-none"
              />
              <button
                type="submit"
                disabled={submitting}
                className="px-3 py-1.5 text-xs font-medium text-white rounded-lg disabled:opacity-50"
                style={{ backgroundColor: "#48A111" }}
              >
                {submitting ? "Adding…" : "Add Entry"}
              </button>
            </form>
          )}

          {/* Timeline */}
          {logs.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">No interactions logged yet.</p>
          ) : (
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200" />
              <div className="space-y-3">
                {logs.map((log) => {
                  const col = LOG_COLORS[log.type] ?? LOG_COLORS.note;
                  return (
                    <div key={log.id} className="flex gap-3 relative">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border z-10"
                        style={{ backgroundColor: col.bg, borderColor: col.border, color: col.text }}
                      >
                        {LOG_ICONS[log.type]}
                      </div>
                      <div className="flex-1 bg-white rounded-lg border border-gray-200 p-3 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center flex-wrap gap-2 mb-1">
                              <span
                                className="text-xs font-semibold px-2 py-0.5 rounded-full border"
                                style={{ backgroundColor: col.bg, color: col.text, borderColor: col.border }}
                              >
                                {log.type.charAt(0).toUpperCase() + log.type.slice(1)}
                              </span>
                              <span className="text-xs text-gray-400">
                                {fmtDate(log.logged_at)}
                              </span>
                              {log.logged_by_profile?.name && (
                                <span className="text-xs text-gray-400">
                                  by {log.logged_by_profile.name}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-700">{log.summary}</p>
                          </div>
                          {canEdit && (
                            <button
                              onClick={() => handleDeleteLog(log.id)}
                              className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Price References ── */}
      {activeSection === "prices" && (
        <div className="space-y-3">
          {/* Add Price form (owner only) */}
          {canEdit && (
            <form onSubmit={handleAddPrice} className="bg-white rounded-lg border border-gray-200 p-3 space-y-2">
              <p className="text-xs font-semibold text-gray-600 mb-2">Add Price Reference</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <select
                  value={priceForm.crop}
                  onChange={(e) => setPriceForm((p) => ({ ...p, crop: e.target.value }))}
                  required
                  className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="">Select Crop…</option>
                  {CROPS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Offered price"
                  value={priceForm.offered_price}
                  onChange={(e) => setPriceForm((p) => ({ ...p, offered_price: e.target.value }))}
                  className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Market price"
                  value={priceForm.market_price}
                  onChange={(e) => setPriceForm((p) => ({ ...p, market_price: e.target.value }))}
                  className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Unit (kg, tonne…)"
                  value={priceForm.unit}
                  onChange={(e) => setPriceForm((p) => ({ ...p, unit: e.target.value }))}
                  className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                />
                <input
                  type="text"
                  placeholder="Notes (optional)"
                  value={priceForm.notes}
                  onChange={(e) => setPriceForm((p) => ({ ...p, notes: e.target.value }))}
                  className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="px-3 py-1.5 text-xs font-medium text-white rounded-lg disabled:opacity-50"
                style={{ backgroundColor: "#48A111" }}
              >
                {submitting ? "Adding…" : "Add Price"}
              </button>
            </form>
          )}

          {prices.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">No price records yet.</p>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Crop</th>
                    <th className="text-right px-3 py-2 font-medium text-gray-600">Offered</th>
                    <th className="text-right px-3 py-2 font-medium text-gray-600">Market</th>
                    <th className="text-center px-3 py-2 font-medium text-gray-600">Trend</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Date</th>
                    {canEdit && <th className="px-3 py-2" />}
                  </tr>
                </thead>
                <tbody>
                  {prices.map((p) => {
                    const trend = priceTrend(p.offered_price, p.market_price);
                    return (
                      <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium text-gray-900">{p.crop}</td>
                        <td className="px-3 py-2 text-right text-gray-700">
                          {p.offered_price != null ? `₹${fmt(p.offered_price, 2)}/${p.unit}` : "—"}
                        </td>
                        <td className="px-3 py-2 text-right text-gray-700">
                          {p.market_price != null ? `₹${fmt(p.market_price, 2)}/${p.unit}` : "—"}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {trend === "up" && <TrendingUp className="w-4 h-4 text-green-500 mx-auto" />}
                          {trend === "down" && <TrendingDown className="w-4 h-4 text-red-500 mx-auto" />}
                          {trend === "neutral" && <Minus className="w-4 h-4 text-gray-400 mx-auto" />}
                        </td>
                        <td className="px-3 py-2 text-gray-400">{fmtDate(p.recorded_at)}</td>
                        {canEdit && (
                          <td className="px-3 py-2">
                            <button
                              onClick={() => handleDeletePrice(p.id)}
                              className="text-gray-300 hover:text-red-400 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Contact Form Modal ──────────────────────────────────────────────────────

interface ContactModalProps {
  type: "farmer" | "buyer";
  contact: Contact | null;
  onClose: () => void;
  onSave: (data: Partial<Contact>) => Promise<void>;
}

const ContactModal: React.FC<ContactModalProps> = ({ type, contact, onClose, onSave }) => {
  const isFarmer = type === "farmer";
  const [form, setForm] = useState<Record<string, string | number | null | string[]>>({
    name: contact?.name ?? "",
    phone: contact?.phone ?? "",
    email: contact?.email ?? "",
    location: contact?.location ?? "",
    notes: contact?.notes ?? "",
    // farmer
    growing_crop: contact?.growing_crop ?? "",
    crop_variety: contact?.crop_variety ?? "",
    area_acres: contact?.area_acres ?? "",
    expected_harvest_date: contact?.expected_harvest_date?.slice(0, 10) ?? "",
    expected_quantity: contact?.expected_quantity ?? "",
    quantity_unit: contact?.quantity_unit ?? "kg",
    // buyer
    company: contact?.company ?? "",
    purchase_volume: contact?.purchase_volume ?? "",
    preferred_crops: contact?.preferred_crops ?? [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: string, val: string | number | null | string[]) =>
    setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSave({ ...form, type } as unknown as Partial<Contact>);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">
              {contact ? "Edit" : "Add"} {isFarmer ? "Farmer" : "Buyer"}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
                <input value={form.name as string} onChange={(e) => set("name", e.target.value)} required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              {!isFarmer && (
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Company</label>
                  <input value={form.company as string} onChange={(e) => set("company", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" value={form.phone as string} onChange={(e) => set("phone", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={form.email as string} onChange={(e) => set("email", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                <input value={form.location as string} onChange={(e) => set("location", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>

              {isFarmer && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Crop</label>
                    <select value={form.growing_crop as string} onChange={(e) => set("growing_crop", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                      <option value="">Select…</option>
                      {CROPS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Variety</label>
                    <input value={form.crop_variety as string} onChange={(e) => set("crop_variety", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Area (acres)</label>
                    <input type="number" value={form.area_acres as string} onChange={(e) => set("area_acres", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Harvest Date</label>
                    <input type="date" value={form.expected_harvest_date as string} onChange={(e) => set("expected_harvest_date", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Exp. Qty</label>
                    <input type="number" value={form.expected_quantity as string} onChange={(e) => set("expected_quantity", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Unit</label>
                    <select value={form.quantity_unit as string} onChange={(e) => set("quantity_unit", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                      {["kg", "tonnes", "quintal", "boxes"].map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </>
              )}

              {!isFarmer && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Purchase Volume (kg)</label>
                    <input type="number" value={form.purchase_volume as string} onChange={(e) => set("purchase_volume", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                  <div/>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Preferred Crops (comma-separated)</label>
                    <input
                      value={Array.isArray(form.preferred_crops) ? (form.preferred_crops as string[]).join(", ") : ""}
                      onChange={(e) => set("preferred_crops", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                      placeholder="Wheat, Rice, Tomatoes"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                </>
              )}

              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={form.notes as string} onChange={(e) => set("notes", e.target.value)} rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "#48A111" }}>
                {submitting ? "Saving…" : contact ? "Save Changes" : "Add Contact"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ─── CSV Import Modal ────────────────────────────────────────────────────────

interface CSVImportModalProps {
  type: "farmer" | "buyer";
  token: string | undefined;
  onClose: () => void;
  onSuccess: () => void;
}

const CSVImportModal: React.FC<CSVImportModalProps> = ({ type, token, onClose, onSuccess }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string[][]>([]);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<{ success: number; errors: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = text.split("\n").filter(Boolean).map((row) =>
        row.split(",").map((c) => c.replace(/^"|"$/g, "").replace(/""/g, '"').trim())
      );
      setPreview(rows.slice(0, 4));
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setImporting(true);
    setError(null);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text = ev.target?.result as string;
      const rows = text.split("\n").filter(Boolean).map((row) =>
        row.split(",").map((c) => c.replace(/^"|"$/g, "").replace(/""/g, '"').trim())
      );
      const [, ...dataRows] = rows; // skip header
      let success = 0;
      const errors: string[] = [];

      for (const row of dataRows) {
        try {
          const body: Record<string, string | number | null | string[]> = { type };
          if (type === "farmer") {
            const [name, phone, email, location, growing_crop, crop_variety, area_acres, expected_harvest_date, expected_quantity, quantity_unit, notes] = row;
            Object.assign(body, { name, phone, email, location, growing_crop, crop_variety, area_acres: area_acres ? parseFloat(area_acres) : null, expected_harvest_date, expected_quantity: expected_quantity ? parseFloat(expected_quantity) : null, quantity_unit: quantity_unit || "kg", notes });
          } else {
            const [name, phone, email, location, company, purchase_volume, preferred_crops, notes] = row;
            Object.assign(body, { name, phone, email, location, company, purchase_volume: purchase_volume ? parseFloat(purchase_volume) : null, preferred_crops: preferred_crops ? preferred_crops.split(";").map((s) => s.trim()).filter(Boolean) : [], notes });
          }
          if (!body.name) continue;
          const res = await fetch(apiBase, { method: "POST", headers: authHeaders(token), body: JSON.stringify(body) });
          if (res.ok) success++;
          else errors.push(`Row ${success + errors.length + 1}: ${(await res.json()).error}`);
        } catch {
          errors.push(`Row error`);
        }
      }
      setResults({ success, errors });
      setImporting(false);
      if (success > 0) onSuccess();
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Import {type === "farmer" ? "Farmers" : "Buyers"} from CSV</h2>
            <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
          </div>

          <div className="mb-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 border border-gray-200">
            <p className="font-medium mb-1">Expected columns:</p>
            {type === "farmer"
              ? <code>Name, Phone, Email, Location, Crop, Variety, Area(ac), HarvestDate, Qty, Unit, Notes</code>
              : <code>Name, Phone, Email, Location, Company, PurchaseVol, PreferredCrops, Notes</code>
            }
          </div>

          {error && <div className="mb-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{error}</div>}

          {results ? (
            <div className="space-y-2">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                ✓ {results.success} rows imported successfully
              </div>
              {results.errors.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 space-y-1">
                  {results.errors.map((e, i) => <div key={i}>{e}</div>)}
                </div>
              )}
              <button onClick={onClose} className="w-full px-4 py-2.5 text-sm font-medium text-white rounded-lg hover:opacity-90" style={{ backgroundColor: "#48A111" }}>Done</button>
            </div>
          ) : (
            <>
              <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="w-full text-sm border border-gray-300 rounded-lg p-2 mb-3" />
              {preview.length > 0 && (
                <div className="mb-3 overflow-x-auto">
                  <p className="text-xs text-gray-500 mb-1">Preview (first 3 rows):</p>
                  <table className="text-xs border border-gray-200 rounded-lg overflow-hidden w-full">
                    {preview.map((row, i) => (
                      <tr key={i} className={i === 0 ? "bg-gray-50 font-medium" : "border-t border-gray-100"}>
                        {row.slice(0, 5).map((c, j) => <td key={j} className="px-2 py-1 truncate max-w-[80px]">{c}</td>)}
                      </tr>
                    ))}
                  </table>
                </div>
              )}
              <div className="flex gap-3">
                <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
                <button type="button" disabled={!fileRef.current?.files?.[0] || importing} onClick={handleImport}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: "#48A111" }}>
                  {importing ? "Importing…" : "Import"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main ContactsPage ───────────────────────────────────────────────────────

export const ContactsPage: React.FC = () => {
  const { session, isOwner, isManager } = useAuthContext();
  const token = session?.access_token;
  const canEdit = isOwner?.() ?? false;
  const canLog = canEdit || (isManager?.() ?? false);

  const [tab, setTab] = useState<"farmer" | "buyer">("farmer");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [csvImportOpen, setCsvImportOpen] = useState(false);

  const fetchContacts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const endpoint = tab === "farmer" ? `${apiBase}/farmers` : `${apiBase}/buyers`;
      const res = await fetch(endpoint, { headers: authHeaders(token) });
      if (!res.ok) throw new Error((await res.json()).error ?? `HTTP ${res.status}`);
      setContacts(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load contacts");
    } finally {
      setIsLoading(false);
    }
  }, [tab, token]);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const handleSave = async (data: Partial<Contact>) => {
    const url = editingContact ? `${apiBase}/${editingContact.id}` : apiBase;
    const method = editingContact ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: authHeaders(token), body: JSON.stringify({ ...data, type: tab }) });
    if (!res.ok) throw new Error((await res.json()).error ?? "Save failed");
    await fetchContacts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this contact? This cannot be undone.")) return;
    await fetch(`${apiBase}/${id}`, { method: "DELETE", headers: authHeaders(token) });
    await fetchContacts();
  };

  const filtered = search.trim()
    ? contacts.filter((c) => {
        const q = search.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          (c.location ?? "").toLowerCase().includes(q) ||
          (c.growing_crop ?? "").toLowerCase().includes(q) ||
          (c.company ?? "").toLowerCase().includes(q) ||
          (c.phone ?? "").includes(q)
        );
      })
    : contacts;

  const isFarmerTab = tab === "farmer";

  return (
    <div className="space-y-5 pb-6">
      {/* ── Header ── */}
      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "#25671E" }}>Contact Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage farmers, buyers, interaction history, and price references
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => exportCSV(contacts, tab)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
              title="Export CSV"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            {canEdit && (
              <button
                onClick={() => setCsvImportOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
                title="Import CSV"
              >
                <Upload className="w-4 h-4" />
                Import
              </button>
            )}
            {canEdit && (
              <button
                onClick={() => { setEditingContact(null); setModalOpen(true); }}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90"
                style={{ backgroundColor: "#48A111" }}
              >
                <Plus className="w-4 h-4" />
                Add {isFarmerTab ? "Farmer" : "Buyer"}
              </button>
            )}
          </div>
        </div>

        {/* ── Tabs + Search ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => { setTab("farmer"); setExpandedId(null); setSearch(""); }}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md transition-all ${tab === "farmer" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              <Wheat className="w-4 h-4" />
              Farmers ({tab === "farmer" ? contacts.length : "…"})
            </button>
            <button
              onClick={() => { setTab("buyer"); setExpandedId(null); setSearch(""); }}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md transition-all ${tab === "buyer" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              <ShoppingCart className="w-4 h-4" />
              Buyers ({tab === "buyer" ? contacts.length : "…"})
            </button>
          </div>
          <div className="flex-1 relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${isFarmerTab ? "farmers" : "buyers"}…`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="rounded-xl p-4 border text-sm bg-red-50 border-red-200 text-red-700">{error}</div>
      )}

      {/* ── Loading ── */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#48A111", borderTopColor: "transparent" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <span className="text-4xl mb-3 block">{isFarmerTab ? "🌾" : "🛒"}</span>
          <p className="text-gray-500 text-sm">
            {search ? `No ${isFarmerTab ? "farmers" : "buyers"} match your search.` : `No ${isFarmerTab ? "farmers" : "buyers"} registered yet.`}
          </p>
          {!search && canEdit && (
            <button
              onClick={() => { setEditingContact(null); setModalOpen(true); }}
              className="mt-4 px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90"
              style={{ backgroundColor: "#48A111" }}
            >
              Add First {isFarmerTab ? "Farmer" : "Buyer"}
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Summary stats row */}
          {isFarmerTab ? (
            <div className="grid grid-cols-4 divide-x divide-gray-100 border-b">
              {[
                { label: "Total", value: contacts.length },
                { label: "Unique Crops", value: new Set(contacts.map((c) => c.growing_crop).filter(Boolean)).size },
                { label: "Total Area", value: `${contacts.reduce((s, c) => s + (c.area_acres ?? 0), 0).toFixed(0)} ac` },
                { label: "Upcoming Harvests", value: contacts.filter((c) => { if (!c.expected_harvest_date) return false; const d = (new Date(c.expected_harvest_date).getTime() - Date.now()) / 86400000; return d >= 0 && d <= 30; }).length },
              ].map((s) => (
                <div key={s.label} className="p-3 text-center">
                  <p className="text-xs text-gray-500">{s.label}</p>
                  <p className="text-lg font-bold" style={{ color: "#25671E" }}>{s.value}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 divide-x divide-gray-100 border-b">
              {[
                { label: "Total Buyers", value: contacts.length },
                { label: "Companies", value: new Set(contacts.map((c) => c.company).filter(Boolean)).size },
                { label: "Avg Purchase Vol", value: `${Math.round(contacts.filter((c) => c.purchase_volume).reduce((s, c) => s + (c.purchase_volume ?? 0), 0) / Math.max(1, contacts.filter((c) => c.purchase_volume).length)).toLocaleString("en-IN")} kg` },
              ].map((s) => (
                <div key={s.label} className="p-3 text-center">
                  <p className="text-xs text-gray-500">{s.label}</p>
                  <p className="text-lg font-bold" style={{ color: "#25671E" }}>{s.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Table */}
          <div className="divide-y divide-gray-100">
            {filtered.map((c) => {
              const isExpanded = expandedId === c.id;
              return (
                <div key={c.id}>
                  <div
                    className="px-4 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : c.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Left: name + details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-semibold text-gray-900 text-sm">{c.name}</span>
                          {isFarmerTab && c.growing_crop && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                              {c.growing_crop}{c.crop_variety ? ` · ${c.crop_variety}` : ""}
                            </span>
                          )}
                          {!isFarmerTab && c.company && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">{c.company}</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                          {c.phone && (
                            <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</span>
                          )}
                          {c.email && (
                            <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</span>
                          )}
                          {c.location && (
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{c.location}</span>
                          )}
                          {isFarmerTab && c.area_acres != null && (
                            <span>{c.area_acres} acres</span>
                          )}
                          {isFarmerTab && c.expected_harvest_date && (
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Harvest: {fmtDate(c.expected_harvest_date)}</span>
                          )}
                          {!isFarmerTab && c.purchase_volume != null && (
                            <span className="flex items-center gap-1"><ShoppingCart className="w-3 h-3" />{fmt(c.purchase_volume)} kg/cycle</span>
                          )}
                          {!isFarmerTab && c.preferred_crops && c.preferred_crops.length > 0 && (
                            <span>{c.preferred_crops.slice(0, 3).join(", ")}{c.preferred_crops.length > 3 ? ` +${c.preferred_crops.length - 3}` : ""}</span>
                          )}
                        </div>
                      </div>

                      {/* Right: actions */}
                      <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        {canEdit && (
                          <>
                            <button
                              onClick={() => { setEditingContact(c); setModalOpen(true); }}
                              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-500 hover:text-green-600 transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(c.id)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        <div className="w-8 h-8 flex items-center justify-center text-gray-400">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expandable detail */}
                  {isExpanded && (
                    <DetailPanel contact={c} token={token} canEdit={canLog} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      {modalOpen && (
        <ContactModal
          type={tab}
          contact={editingContact}
          onClose={() => { setModalOpen(false); setEditingContact(null); }}
          onSave={handleSave}
        />
      )}
      {csvImportOpen && (
        <CSVImportModal
          type={tab}
          token={token}
          onClose={() => setCsvImportOpen(false)}
          onSuccess={fetchContacts}
        />
      )}
    </div>
  );
};
