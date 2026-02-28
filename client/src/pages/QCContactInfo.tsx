import React, { useState, useEffect } from "react";
import { useAuthContext } from "../context/AuthContext";
import { API_URL } from "../config/api";
import { Users, Phone, Mail, MapPin, Search, Warehouse } from "lucide-react";

interface ManagerInfo {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  location?: string | null;
  warehouse_name?: string | null;
  warehouse_location?: string | null;
}

const ROLE_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  owner: { label: "Owner", bg: "#F0FDF4", text: "#15803D" },
  manager: { label: "Manager", bg: "#EFF6FF", text: "#1D4ED8" },
  qc_rep: { label: "QC Rep", bg: "#FFF7ED", text: "#C2410C" },
};

export const QCContactInfo: React.FC = () => {
  const { session } = useAuthContext();
  const token = session?.access_token;

  const [managers, setManagers] = useState<ManagerInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchManagers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/api/contacts/managers`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) throw new Error((await res.json()).error ?? `HTTP ${res.status}`);
        setManagers(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load contacts");
      } finally {
        setIsLoading(false);
      }
    };
    fetchManagers();
  }, [token]);

  const filtered = search.trim()
    ? managers.filter((m) => {
        const q = search.toLowerCase();
        return (
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          (m.role ?? "").toLowerCase().includes(q) ||
          (m.warehouse_name ?? "").toLowerCase().includes(q)
        );
      })
    : managers;

  return (
    <div className="space-y-5 pb-6">
      {/* ── Header ── */}
      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "#25671E" }}>Staff Contacts</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Owners and managers you can reach out to
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, role or warehouse…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-80 pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="rounded-xl p-4 border text-sm bg-red-50 border-red-200 text-red-700">{error}</div>
      )}

      {/* ── Loading ── */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div
            className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: "#48A111", borderTopColor: "transparent" }}
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            {search ? "No contacts match your search." : "No staff contacts found."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m) => {
            const roleStyle = ROLE_LABELS[m.role] ?? { label: m.role, bg: "#F9FAFB", text: "#374151" };
            return (
              <div
                key={m.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow"
              >
                {/* Avatar + name */}
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
                    style={{ backgroundColor: roleStyle.bg, color: roleStyle.text }}
                  >
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{m.name}</h3>
                    <span
                      className="inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-0.5"
                      style={{ backgroundColor: roleStyle.bg, color: roleStyle.text }}
                    >
                      {roleStyle.label}
                    </span>
                  </div>
                </div>

                {/* Contact details */}
                <div className="space-y-2">
                  <a
                    href={`mailto:${m.email}`}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition-colors group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center group-hover:bg-green-50 group-hover:border-green-200 transition-colors">
                      <Mail className="w-3.5 h-3.5 text-gray-400 group-hover:text-green-500" />
                    </div>
                    <span className="truncate">{m.email}</span>
                  </a>

                  {m.phone && (
                    <a
                      href={`tel:${m.phone}`}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition-colors group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center group-hover:bg-green-50 group-hover:border-green-200 transition-colors">
                        <Phone className="w-3.5 h-3.5 text-gray-400 group-hover:text-green-500" />
                      </div>
                      <span>{m.phone}</span>
                    </a>
                  )}

                  {m.warehouse_name && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center">
                        <Warehouse className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                      <span className="truncate">
                        {m.warehouse_name}
                        {m.warehouse_location ? `, ${m.warehouse_location}` : ""}
                      </span>
                    </div>
                  )}

                  {m.location && !m.warehouse_name && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                      <span>{m.location}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
