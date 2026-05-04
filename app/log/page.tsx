"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { SprayLog } from "@/lib/types";

export default function LogPage() {
  const [logs, setLogs] = useState<SprayLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMaterial, setFilterMaterial] = useState("");
  const [materials, setMaterials] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    loadLogs();
    loadMaterials();
  }, []);

  async function loadMaterials() {
    const { data } = await getSupabase()
      .from("materials")
      .select("id, name")
      .order("name");
    if (data) setMaterials(data);
  }

  async function loadLogs() {
    setLoading(true);
    const { data } = await getSupabase()
      .from("spray_logs")
      .select("*, material:materials(*)")
      .order("date", { ascending: false });
    if (data) setLogs(data);
    setLoading(false);
  }

  async function deleteLog(id: string) {
    if (!confirm("Delete this entry?")) return;
    await getSupabase().from("spray_logs").delete().eq("id", id);
    setLogs(logs.filter((l) => l.id !== id));
  }

  const filteredLogs = filterMaterial
    ? logs.filter((l) => l.material_id === filterMaterial)
    : logs;

  const groupedByYear = filteredLogs.reduce<Record<string, SprayLog[]>>(
    (acc, log) => {
      const year = log.date.substring(0, 4);
      if (!acc[year]) acc[year] = [];
      acc[year].push(log);
      return acc;
    },
    {}
  );

  const years = Object.keys(groupedByYear).sort().reverse();

  if (loading) {
    return <p className="text-center text-slate-500 mt-8">Loading...</p>;
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Spray Log</h1>

      <div className="mb-4">
        <select
          value={filterMaterial}
          onChange={(e) => setFilterMaterial(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="">All materials</option>
          {materials.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      {filteredLogs.length === 0 ? (
        <p className="text-center text-slate-500 mt-8">No entries yet.</p>
      ) : (
        years.map((year) => (
          <div key={year} className="mb-6">
            <h2 className="text-lg font-semibold text-slate-600 mb-2 sticky top-14 bg-slate-50 py-1">
              {year}
            </h2>
            <div className="space-y-2">
              {groupedByYear[year].map((log) => (
                <div
                  key={log.id}
                  className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {formatDate(log.date)}
                        </span>
                        <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium">
                          {log.material?.name || "Unknown"}
                        </span>
                      </div>
                      {log.concentration && (
                        <p className="text-sm text-slate-600 mt-1">
                          {log.concentration}
                        </p>
                      )}
                      {log.comment && (
                        <p className="text-sm text-slate-500 mt-1 italic">
                          {log.comment}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => deleteLog(log.id)}
                      className="text-slate-400 hover:text-red-500 p-1 text-xs"
                    >
                      Del
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("hu-HU", {
    month: "2-digit",
    day: "2-digit",
  });
}
