"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import type { TrendPoint } from "@/lib/types";

export function TrendChart({ data }: { data: TrendPoint[] }) {
  return (
    // ResponsiveContainer makes the chart adapt to its parent's width, which
    // is how the whole dashboard stays responsive down to mobile.
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={(d) => d.slice(5)} />
        <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="newHires" name="New hires" stroke="#2646c2" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="departures" name="Departures" stroke="#dc2626" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
