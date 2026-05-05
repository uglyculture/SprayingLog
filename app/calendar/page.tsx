"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { SpraySession } from "@/lib/types";

const DAY_NAMES = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function CalendarPage() {
  const [sessions, setSessions] = useState<SpraySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    setLoading(true);
    const { data } = await getSupabase()
      .from("spray_sessions")
      .select("*, items:spray_session_items(*, material:materials(*))")
      .order("date", { ascending: false });
    if (data) setSessions(data);
    setLoading(false);
  }

  const sessionsByDate = sessions.reduce<Record<string, SpraySession[]>>(
    (acc, s) => {
      if (!acc[s.date]) acc[s.date] = [];
      acc[s.date].push(s);
      return acc;
    },
    {}
  );

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
    setSelectedDate(null);
  }

  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
    setSelectedDate(null);
  }

  function goToday() {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth());
    setSelectedDate(null);
  }

  function getDaysInMonth(y: number, m: number) {
    return new Date(y, m + 1, 0).getDate();
  }

  function getStartDayOfWeek(y: number, m: number) {
    const day = new Date(y, m, 1).getDay();
    return day === 0 ? 6 : day - 1;
  }

  const daysInMonth = getDaysInMonth(year, month);
  const startDay = getStartDayOfWeek(year, month);
  const today = new Date().toISOString().split("T")[0];

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const selectedSessions = selectedDate ? sessionsByDate[selectedDate] || [] : [];

  if (loading) {
    return <p className="text-center text-slate-500 mt-8">Loading...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg text-lg"
        >
          &lt;
        </button>
        <div className="text-center">
          <h1 className="text-lg font-bold">
            {MONTH_NAMES[month]} {year}
          </h1>
          <button
            onClick={goToday}
            className="text-xs text-green-700 hover:underline"
          >
            Today
          </button>
        </div>
        <button
          onClick={nextMonth}
          className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg text-lg"
        >
          &gt;
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-lg overflow-hidden">
        {DAY_NAMES.map((d) => (
          <div
            key={d}
            className="bg-slate-100 text-center text-xs font-medium text-slate-500 py-1"
          >
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={i} className="bg-white min-h-14" />;
          }
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const daySessions = sessionsByDate[dateStr] || [];
          const materialNames = daySessions.flatMap(
            (s) => s.items?.map((item) => item.material?.name || "") || []
          ).filter(Boolean);
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;

          return (
            <button
              key={i}
              onClick={() => setSelectedDate(isSelected ? null : dateStr)}
              className={`min-h-14 flex flex-col items-center pt-1 text-sm transition-colors ${
                isSelected
                  ? "bg-green-600 text-white"
                  : isToday
                    ? "bg-green-50 text-green-800 font-bold"
                    : materialNames.length > 0
                      ? "bg-green-50 hover:bg-green-100"
                      : "bg-white hover:bg-slate-50"
              }`}
            >
              <span className="text-xs">{day}</span>
              {materialNames.length > 0 && (
                <div className="flex flex-col items-center gap-px mt-0.5 w-full px-px">
                  {materialNames.map((name, j) => (
                    <span
                      key={j}
                      className={`text-[7px] leading-tight truncate max-w-full ${
                        isSelected ? "text-green-100" : "text-green-700"
                      }`}
                    >
                      {name}
                    </span>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <div className="mt-4">
          <h2 className="text-sm font-semibold text-slate-600 mb-2">
            {new Date(selectedDate + "T00:00:00").toLocaleDateString("hu-HU", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h2>
          {selectedSessions.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No spraying this day.</p>
          ) : (
            <div className="space-y-2">
              {selectedSessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm"
                >
                  <div className="flex flex-wrap gap-1.5">
                    {session.items?.map((item) => (
                      <span
                        key={item.id}
                        className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium"
                      >
                        {item.material?.name || "?"}
                        {item.concentration &&
                          ` ${item.concentration}${item.unit}`}
                      </span>
                    ))}
                  </div>
                  {session.comment && (
                    <p className="text-sm text-slate-500 mt-1.5 italic">
                      {session.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
