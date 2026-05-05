"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { Material } from "@/lib/types";

interface ItemEntry {
  materialId: string;
  concentration: string;
  unit: string;
  mixMode: boolean;
  amount: string;
  tankVolume: string;
}

const UNITS = ["g/l", "ml/l", "ml/10l", "mg/l"];
const AMOUNT_UNITS: Record<string, string> = {
  "g/l": "g",
  "ml/l": "ml",
  "ml/10l": "ml",
  "mg/l": "mg",
};
const DEFAULT_TANK = "22";

function calcConcentration(amount: string, tankVolume: string, unit: string): string {
  const a = parseFloat(amount);
  const t = parseFloat(tankVolume);
  if (!a || !t) return "";
  if (unit === "ml/10l") {
    return (a / t * 10).toFixed(1).replace(/\.0$/, "");
  }
  return (a / t).toFixed(2).replace(/\.?0+$/, "");
}

function newItem(): ItemEntry {
  return { materialId: "", concentration: "", unit: "", mixMode: false, amount: "", tankVolume: DEFAULT_TANK };
}

export default function NewEntry() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [items, setItems] = useState<ItemEntry[]>([newItem()]);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

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

  function updateItem(index: number, changes: Partial<ItemEntry>) {
    const updated = [...items];
    updated[index] = { ...updated[index], ...changes };

    if ("materialId" in changes) {
      const mat = materials.find((m) => m.id === changes.materialId);
      if (mat?.default_unit && !updated[index].unit) {
        updated[index].unit = mat.default_unit;
      }
    }

    if (updated[index].mixMode && ("amount" in changes || "tankVolume" in changes)) {
      updated[index].concentration = calcConcentration(
        updated[index].amount,
        updated[index].tankVolume,
        updated[index].unit
      );
    }

    setItems(updated);
  }

  function toggleMixMode(index: number) {
    const item = items[index];
    updateItem(index, {
      mixMode: !item.mixMode,
      concentration: !item.mixMode ? calcConcentration(item.amount, item.tankVolume, item.unit) : item.concentration,
    });
  }

  function addItem() {
    setItems([...items, newItem()]);
  }

  function removeItem(index: number) {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  }

  function getSuggestedDosage(materialId: string) {
    const mat = materials.find((m) => m.id === materialId);
    if (!mat?.suggested_dosage) return null;
    return `${mat.suggested_dosage} ${mat.default_unit}`.trim();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validItems = items.filter((item) => item.materialId);
    if (!date || validItems.length === 0) return;

    setSaving(true);
    const db = getSupabase();

    const { data: session, error } = await db
      .from("spray_sessions")
      .insert({ date, comment })
      .select("id")
      .single();

    if (error || !session) {
      setSaving(false);
      return;
    }

    await db.from("spray_session_items").insert(
      validItems.map((item) => ({
        session_id: session.id,
        material_id: item.materialId,
        concentration: item.concentration,
        unit: item.unit,
      }))
    );

    setSaving(false);
    setSuccess(true);
    setItems([newItem()]);
    setComment("");
    setTimeout(() => setSuccess(false), 2000);
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

        <div className="space-y-3">
          <label className="block text-sm font-medium">Materials</label>
          {items.map((item, i) => {
            const amountUnit = AMOUNT_UNITS[item.unit] || "g";
            return (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-lg p-3 space-y-2"
              >
                <div className="flex gap-2 items-center">
                  <select
                    value={item.materialId}
                    onChange={(e) => updateItem(i, { materialId: e.target.value })}
                    className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-base bg-white"
                  >
                    <option value="">Select material...</option>
                    {materials.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      className="text-red-400 hover:text-red-600 px-2 py-1 text-lg"
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="flex gap-2 items-center">
                  <select
                    value={item.unit}
                    onChange={(e) => updateItem(i, { unit: e.target.value })}
                    className="w-28 border border-slate-300 rounded-lg px-2 py-2 text-base bg-white"
                  >
                    <option value="">Unit</option>
                    {UNITS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => toggleMixMode(i)}
                    className={`text-xs px-2 py-1 rounded-md border transition-colors ${
                      item.mixMode
                        ? "bg-blue-100 border-blue-300 text-blue-700"
                        : "border-slate-300 text-slate-500 hover:border-blue-300"
                    }`}
                  >
                    {item.mixMode ? "Tank mix" : "Per liter"}
                  </button>
                </div>

                {item.mixMode ? (
                  <div className="space-y-2">
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        step="any"
                        value={item.amount}
                        onChange={(e) => updateItem(i, { amount: e.target.value })}
                        placeholder="Amount"
                        className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-base bg-white"
                      />
                      <span className="text-sm text-slate-500 w-8">{amountUnit}</span>
                      <span className="text-sm text-slate-400">/</span>
                      <input
                        type="number"
                        step="any"
                        value={item.tankVolume}
                        onChange={(e) => updateItem(i, { tankVolume: e.target.value })}
                        placeholder="Tank"
                        className="w-20 border border-slate-300 rounded-lg px-3 py-2 text-base bg-white"
                      />
                      <span className="text-sm text-slate-500 w-4">l</span>
                    </div>
                    {item.concentration && (
                      <p className="text-sm text-blue-700">
                        = {item.concentration} {item.unit}
                      </p>
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={item.concentration}
                    onChange={(e) => updateItem(i, { concentration: e.target.value })}
                    placeholder="Concentration"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-base bg-white"
                  />
                )}

                {item.materialId && getSuggestedDosage(item.materialId) && (
                  <p className="text-sm text-green-700">
                    Suggested: {getSuggestedDosage(item.materialId)}
                  </p>
                )}
              </div>
            );
          })}
          <button
            type="button"
            onClick={addItem}
            className="w-full border-2 border-dashed border-slate-300 rounded-lg py-2 text-slate-500 hover:border-green-400 hover:text-green-600 transition-colors"
          >
            + Add material
          </button>
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
          disabled={saving || !items.some((i) => i.materialId)}
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
