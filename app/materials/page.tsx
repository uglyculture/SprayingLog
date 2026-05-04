"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { Material } from "@/lib/types";

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [suggestedDosage, setSuggestedDosage] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMaterials();
  }, []);

  async function loadMaterials() {
    setLoading(true);
    const { data } = await getSupabase()
      .from("materials")
      .select("*")
      .order("name");
    if (data) setMaterials(data);
    setLoading(false);
  }

  function startEdit(material: Material) {
    setEditingId(material.id);
    setName(material.name);
    setSuggestedDosage(material.suggested_dosage);
    setNotes(material.notes);
    setShowForm(true);
  }

  function startNew() {
    setEditingId(null);
    setName("");
    setSuggestedDosage("");
    setNotes("");
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    if (editingId) {
      await getSupabase()
        .from("materials")
        .update({ name: name.trim(), suggested_dosage: suggestedDosage, notes })
        .eq("id", editingId);
    } else {
      await getSupabase()
        .from("materials")
        .insert({ name: name.trim(), suggested_dosage: suggestedDosage, notes });
    }
    setSaving(false);
    setShowForm(false);
    setEditingId(null);
    loadMaterials();
  }

  async function deleteMaterial(id: string) {
    if (!confirm("Delete this material? Only works if no log entries use it.")) return;
    const { error } = await getSupabase().from("materials").delete().eq("id", id);
    if (error) {
      alert("Cannot delete: this material is used in log entries.");
    } else {
      setMaterials(materials.filter((m) => m.id !== id));
    }
  }

  if (loading) {
    return <p className="text-center text-slate-500 mt-8">Loading...</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Materials</h1>
        {!showForm && (
          <button
            onClick={startNew}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + Add
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-lg p-4 mb-4 shadow-sm space-y-3"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-base bg-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Suggested Dosage
            </label>
            <input
              type="text"
              value={suggestedDosage}
              onChange={(e) => setSuggestedDosage(e.target.value)}
              placeholder="e.g. 1.5g/l"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-base bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Usage info, active ingredient, etc."
              rows={2}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-base bg-white resize-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium"
            >
              {saving ? "Saving..." : editingId ? "Update" : "Add Material"}
            </button>
            <button
              type="button"
              onClick={cancelForm}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {materials.map((m) => (
          <div
            key={m.id}
            className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold">{m.name}</h3>
                {m.suggested_dosage && (
                  <p className="text-sm text-green-700">
                    Dosage: {m.suggested_dosage}
                  </p>
                )}
                {m.notes && (
                  <p className="text-sm text-slate-500 mt-1">{m.notes}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(m)}
                  className="text-slate-500 hover:text-blue-600 text-xs"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteMaterial(m.id)}
                  className="text-slate-400 hover:text-red-500 text-xs"
                >
                  Del
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
