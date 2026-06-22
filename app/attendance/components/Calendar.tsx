"use client"

import { useState } from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CalendarProps {
  selectedDate: string | null
  onDateSelect: (date: string) => void
  attendanceSummary: Record<string, { present: number; total: number }>
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

export default function Calendar({ selectedDate, onDateSelect, attendanceSummary }: CalendarProps) {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())

  const firstDay = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1) }
    else setCurrentMonth(currentMonth - 1)
  }
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1) }
    else setCurrentMonth(currentMonth + 1)
  }

  const fmt = (day: number) => `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  const isToday = (d: number) => d === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()

  const getHeatColor = (day: number) => {
    const s = attendanceSummary[fmt(day)]
    if (!s || s.total === 0) return ""
    const ratio = s.present / s.total
    if (ratio === 1) return "bg-green-500/15 text-green-700 font-semibold"
    if (ratio >= 0.5) return "bg-amber-500/15 text-amber-700 font-semibold"
    if (ratio > 0) return "bg-orange-500/15 text-orange-700 font-semibold"
    return "bg-red-500/15 text-red-700 font-semibold"
  }

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      {/* Month nav */}
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-slate-50 to-white border-b">
        <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8 rounded-full">
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
        <span className="text-base font-semibold tracking-tight">
          {MONTHS[currentMonth]} {currentYear}
        </span>
        <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8 rounded-full">
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 px-4 pt-3 pb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[11px] font-medium text-muted-foreground uppercase tracking-wider py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1 px-4 pb-4">
        {cells.map((day, idx) => {
          if (day === null) return <div key={`e-${idx}`} className="h-9" />
          const heat = getHeatColor(day)
          const selected = selectedDate === fmt(day)
          const todayRing = isToday(day) && !selected ? "ring-2 ring-primary/40" : ""

          return (
            <button
              key={fmt(day)}
              onClick={() => onDateSelect(fmt(day))}
              className={`h-9 rounded-lg text-sm flex items-center justify-center transition-all
                ${selected ? "bg-primary text-primary-foreground shadow-sm" : heat || "hover:bg-muted/60"}
                ${todayRing}
              `}
            >
              {day}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 px-5 py-3 bg-muted/30 border-t text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-green-500/40" />Full</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-amber-500/40" />Partial</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-red-500/40" />None</span>
      </div>
    </div>
  )
}
