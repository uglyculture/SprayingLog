"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { Material } from "@/lib/types";

export default function NewEntry() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialId, setMaterialId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [concentration, setConcentration] = useState("");
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [suggestedDosage, setSuggestedDosage] = useState("");

  useEffect(() => {
    loadMaterials();
  }, []);

  async function loadMaterials() {
    const { data } = await getSupabase()
      .from("materials")
      .select("*")
      .order("name");
    if (data) setMaterials(data);
  }

  function handleMaterialChange(id: string) {
    setMaterialId(id);
    const mat = materials.find((m) => m.id === id);
    setSuggestedDosage(mat?.suggested_dosage || "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!materialId || !date) return;

    setSaving(true);
    const { error } = await getSupabase().from("spray_logs").insert({
      date,
      material_id: materialId,
      concentration,
      comment,
    });

    setSaving(false);
    if (!error) {
      setSuccess(true);
      setConcentration("");
      setComment("");
      setTimeout(() => setSuccess(false), 2000);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">New Spray Entry</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-3 text-base bg-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Material</label>
          <select
            value={materialId}
            onChange={(e) => handleMaterialChange(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-3 text-base bg-white"
            required
          >
            <option value="">Select material...</option>
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          {suggestedDosage && (
            <p className="text-sm text-green-700 mt-1">
              Suggested: {suggestedDosage}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Concentration</label>
          <input
            type="text"
            value={concentration}
            onChange={(e) => setConcentration(e.target.value)}
            placeholder="e.g. 1.5g/l"
            className="w-full border border-slate-300 rounded-lg px-3 py-3 text-base bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Comment</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Optional notes..."
            rows={3}
            className="w-full border border-slate-300 rounded-lg px-3 py-3 text-base bg-white resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={saving || !materialId}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white font-semibold py-4 rounded-lg text-lg transition-colors"
        >
          {saving ? "Saving..." : "Save Entry"}
        </button>

        {success && (
          <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-lg text-center font-medium">
            Saved!
          </div>
        )}
      </form>
    </div>
  );
}
