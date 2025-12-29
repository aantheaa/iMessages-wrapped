import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import yearlyTop5 from "@/lib/data/yearly-top5.json";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)", 
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const RANK_COLORS: Record<number, string> = {
  1: "#FFD700", // Gold
  2: "#C0C0C0", // Silver
  3: "#CD7F32", // Bronze
  4: "var(--chart-4)",
  5: "var(--chart-5)",
};

// Get unique people across all years
const allPeople = [...new Set(yearlyTop5.map(d => d.contact))];

// Transform data for grouped bar chart by year
const years = [2021, 2022, 2023, 2024, 2025];
const dataByYear = years.map(year => {
  const yearData = yearlyTop5.filter(d => d.year === year);
  const entry: Record<string, any> = { year: year.toString() };
  yearData.forEach(d => {
    entry[d.contact] = d.msg_count;
    entry[`${d.contact}_rank`] = d.rank;
  });
  return entry;
});

// Transform for bump chart style - rank over time
const bumpData = years.map(year => {
  const yearData = yearlyTop5.filter(d => d.year === year);
  const entry: Record<string, any> = { year };
  yearData.forEach(d => {
    entry[d.contact] = 6 - d.rank; // Invert so #1 is at top
  });
  return entry;
});

export default function YearlyTop5() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-bold">📊 Your Besties Through The Years</h1>
          <p className="text-muted-foreground text-lg">Top 5 people you texted each year (2021-2025)</p>
        </header>

        {/* Year by Year Cards */}
        <div className="grid gap-6">
          {years.map(year => {
            const yearData = yearlyTop5.filter(d => d.year === year).sort((a, b) => a.rank - b.rank);
            const maxCount = Math.max(...yearData.map(d => d.msg_count));
            return (
              <Card key={year} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl">{year}</CardTitle>
                  <CardDescription>
                    {yearData.reduce((sum, d) => sum + d.msg_count, 0).toLocaleString()} messages with your top 5
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {yearData.map((d, i) => (
                      <div key={d.contact} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                          style={{ 
                            backgroundColor: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'var(--muted)',
                            color: i < 3 ? '#000' : 'inherit'
                          }}>
                          {d.rank}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium truncate max-w-[200px]">{d.contact}</span>
                            <span className="text-sm text-muted-foreground">{d.msg_count.toLocaleString()}</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all"
                              style={{ 
                                width: `${(d.msg_count / maxCount) * 100}%`,
                                backgroundColor: COLORS[i % COLORS.length]
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* The Story */}
        <Card>
          <CardHeader>
            <CardTitle>📖 The Story of Your Friendships</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p><strong>🌟 Gabi Era (2021-2023):</strong> Your #1 for three years straight, peaking at 3,372 messages in 2023. A constant in your early 20s.</p>
            <p><strong>💜 The Consistent Ones:</strong> Melanie appears in 4 out of 5 years. Cloe shows up every year from 2022 onwards. Mom has been in your top 5 for 3 years.</p>
            <p><strong>🚀 Rob's Rise:</strong> Entered your top 5 at #4 in 2022, climbed to #2 in 2023, then claimed #1 in both 2024 and 2025 — with a massive 7,158 messages this year alone.</p>
            <p><strong>✨ Jackie's Arrival:</strong> Appeared in 2024 at #2 and held strong in 2025. A newer but intense friendship.</p>
            <p><strong>🌊 2025's Explosion:</strong> Your messaging volume nearly tripled compared to 2021. Rob alone this year = more than your entire top 5 combined in 2021.</p>
          </CardContent>
        </Card>

        <footer className="text-center py-8 opacity-50">
          <p>Made with 🩵 by Zoda</p>
        </footer>
      </div>
    </div>
  );
}
