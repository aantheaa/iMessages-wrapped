import React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

const monthLabels: Record<string, string> = {
  "2025-01-01": "Jan",
  "2025-02-01": "Feb",
  "2025-03-01": "Mar",
  "2025-04-01": "Apr",
  "2025-05-01": "May",
  "2025-06-01": "Jun",
  "2025-07-01": "Jul",
  "2025-08-01": "Aug",
  "2025-09-01": "Sep",
  "2025-10-01": "Oct",
  "2025-11-01": "Nov",
  "2025-12-01": "Dec",
};

// Fixed dimensions
const FRAME_WIDTH = 1080;
const FRAME_HEIGHT = 1920;
const CARD_MARGIN = 40; // margin around the card
const CARD_WIDTH = FRAME_WIDTH - CARD_MARGIN * 2; // 1000px
const CARD_HEIGHT = FRAME_HEIGHT - CARD_MARGIN * 2; // 1840px
const CARD_PADDING = 60; // padding inside the card
const CONTENT_WIDTH = CARD_WIDTH - CARD_PADDING * 2; // 880px

interface StoryFrameProps {
  category: string;
  children: React.ReactNode;
}

function StoryFrame({ category, children }: StoryFrameProps) {
  return (
    <div
      style={{
        width: FRAME_WIDTH,
        height: FRAME_HEIGHT,
        background: "#0a0a0f",
        fontFamily: "system-ui, -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* The card with border - centered with absolute positioning to be robust */}
      <div
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          background: "linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 30%, #16213e 70%, #0f0f1a 100%)",
          borderRadius: 32,
          border: "1px solid rgba(255,255,255,0.12)",
          display: "flex",
          flexDirection: "column",
          padding: CARD_PADDING,
          boxSizing: "border-box",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle gradient orbs for depth - contained within the card */}
        <div
          style={{
            position: "absolute",
            top: "5%",
            left: "-10%",
            width: 400,
            height: 400,
            background: "radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            right: "-10%",
            width: 500,
            height: 500,
            background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />

        {/* Header - Fixed layout */}
        <div
          style={{
            textAlign: "center",
            marginBottom: 40,
            flexShrink: 0,
            position: "relative",
            zIndex: 1,
          }}
        >
          <div style={{ fontSize: 24, fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: 12 }}>
            2 0 2 5
          </div>
          <h1
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: "white",
              margin: 0,
              lineHeight: 0.9,
              letterSpacing: "-0.04em",
            }}
          >
            iMessage
          </h1>
          <h1
            style={{
              fontSize: 92,
              fontWeight: 900,
              color: "#a855f7",
              margin: 0,
              lineHeight: 1,
              letterSpacing: "-0.04em",
            }}
          >
            Wrapped
          </h1>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: "rgba(255,255,255,0.08)",
              borderRadius: 100,
              padding: "8px 24px",
              marginTop: 24,
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <span style={{ fontSize: 24, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>{category}</span>
          </div>
        </div>

        {/* Content area - Center vertically */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: CONTENT_WIDTH,
            position: "relative",
            zIndex: 1,
            overflow: "hidden",
          }}
        >
          {children}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 60,
            flexShrink: 0,
            position: "relative",
            zIndex: 1,
            width: "100%",
          }}
        >
          <span style={{ fontSize: 22, color: "rgba(255,255,255,0.4)" }}>@fairy</span>
          <span style={{ fontSize: 22, color: "rgba(255,255,255,0.4)" }}>✨ zo.computer</span>
        </div>
      </div>
    </div>
  );
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + "…";
}

export function StoryHero({
  totalMessages,
  uniqueConversations,
}: {
  totalMessages: number;
  uniqueConversations: number;
}) {
  return (
    <StoryFrame category="📊 Your Year">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 48 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 120, fontWeight: 700, color: "white", lineHeight: 1 }}>
            {totalMessages.toLocaleString()}
          </div>
          <div style={{ fontSize: 28, color: "rgba(255,255,255,0.6)", marginTop: 12 }}>
            messages sent & received
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 80, fontWeight: 700, color: "#a855f7", lineHeight: 1 }}>
            {uniqueConversations}
          </div>
          <div style={{ fontSize: 28, color: "rgba(255,255,255,0.6)", marginTop: 12 }}>
            conversations
          </div>
        </div>
      </div>
    </StoryFrame>
  );
}

export function StoryBookends({
  firstMessage,
  lastMessage,
}: {
  firstMessage?: { text: string; sent_at: string };
  lastMessage?: { text: string; sent_at: string };
}) {
  return (
    <StoryFrame category="📅 First & Last">
      <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
        {firstMessage && (
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              borderRadius: 20,
              padding: 28,
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ fontSize: 18, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>
              First message of the year
            </div>
            <div style={{ fontSize: 18, color: "#ec4899", marginBottom: 12 }}>
              {firstMessage.sent_at}
            </div>
            <div style={{ fontSize: 24, color: "white", lineHeight: 1.4 }}>
              "{truncate(firstMessage.text, 150)}"
            </div>
          </div>
        )}
        {lastMessage && (
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              borderRadius: 20,
              padding: 28,
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ fontSize: 18, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>
              Last message of the year
            </div>
            <div style={{ fontSize: 18, color: "#6366f1", marginBottom: 12 }}>
              {lastMessage.sent_at}
            </div>
            <div style={{ fontSize: 24, color: "white", lineHeight: 1.4 }}>
              "{truncate(lastMessage.text, 150)}"
            </div>
          </div>
        )}
      </div>
    </StoryFrame>
  );
}

export function StoryTopContacts({
  contacts,
}: {
  contacts: Array<{ contact: string; sent: number; received: number; total: number }>;
}) {
  const maxTotal = Math.max(...contacts.map((c) => c.total));
  const BAR_MAX_WIDTH = CONTENT_WIDTH - 120; // Account for rank + name space

  return (
    <StoryFrame category="👥 Inner Circle">
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {contacts.slice(0, 5).map((c, i) => {
          const barWidth = (c.total / maxTotal) * BAR_MAX_WIDTH;
          return (
            <div key={c.contact} style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
              {/* Rank circle */}
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: i === 0 ? "#ec4899" : i === 1 ? "#a855f7" : "#6366f1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  fontWeight: 700,
                  color: "white",
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
              {/* Name and bar */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 600,
                    color: "white",
                    marginBottom: 8,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {truncate(c.contact, 25)}
                </div>
                <div style={{ position: "relative", height: 12 }}>
                  {/* Background bar */}
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      width: BAR_MAX_WIDTH,
                      height: 12,
                      background: "rgba(255,255,255,0.1)",
                      borderRadius: 6,
                    }}
                  />
                  {/* Filled bar */}
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      width: barWidth,
                      height: 12,
                      background: "linear-gradient(90deg, #ec4899, #a855f7)",
                      borderRadius: 6,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </StoryFrame>
  );
}

export function StoryMonthlyVolume({
  data,
}: {
  data: Array<{ month: string; count: number }>;
}) {
  const chartData = data.map((d) => ({
    month: monthLabels[d.month] || d.month.slice(5, 7),
    total: d.count,
  }));
  const CHART_WIDTH = CONTENT_WIDTH;
  const CHART_HEIGHT = 400;

  return (
    <StoryFrame category="📈 Message Flow">
      <div style={{ display: "flex", justifyContent: "center" }}>
        <AreaChart width={CHART_WIDTH} height={CHART_HEIGHT} data={chartData}>
          <defs>
            <linearGradient id="storyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#a855f7" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="month"
            stroke="rgba(255,255,255,0.5)"
            tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 18 }}
            tickLine={false}
            axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
          />
          <YAxis
            stroke="rgba(255,255,255,0.5)"
            tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 18 }}
            tickLine={false}
            axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
            width={60}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#a855f7"
            strokeWidth={3}
            fill="url(#storyGradient)"
          />
        </AreaChart>
      </div>
    </StoryFrame>
  );
}

export function StoryTopEmojis({
  emojis,
}: {
  emojis: Array<{ emoji: string; count: number }>;
}) {
  return (
    <StoryFrame category="😍 Top Emojis">
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 24,
        }}
      >
        {emojis.slice(0, 8).map((e, i) => (
          <div
            key={e.emoji}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div style={{ fontSize: i < 3 ? 72 : 56 }}>{e.emoji}</div>
            <div style={{ fontSize: 20, color: "rgba(255,255,255,0.6)" }}>
              {e.count}
            </div>
          </div>
        ))}
      </div>
    </StoryFrame>
  );
}

export function StorySignatureWords({
  words,
}: {
  words: Array<{ word: string; count: number }>;
}) {
  const maxCount = Math.max(...words.map((w) => w.count));
  const BAR_MAX_WIDTH = CONTENT_WIDTH - 180;

  return (
    <StoryFrame category="💬 Signature Words">
      <div style={{ display: "flex", flexDirection: "column", gap: 36, width: "100%" }}>
        {words.slice(0, 8).map((w, i) => {
          const barWidth = (w.count / maxCount) * BAR_MAX_WIDTH;
          return (
            <div key={w.word} style={{ display: "flex", alignItems: "center", gap: 20, width: "100%" }}>
              <div
                style={{
                  width: 140,
                  fontSize: 28,
                  fontWeight: 600,
                  color: "white",
                  textAlign: "right",
                  flexShrink: 0,
                }}
              >
                {w.word}
              </div>
              <div style={{ flex: 1, position: "relative", height: 32 }}>
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: "100%",
                    height: 32,
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: 16,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: barWidth,
                    height: 32,
                    background: "linear-gradient(90deg, #ec4899, #a855f7)",
                    borderRadius: 16,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </StoryFrame>
  );
}

const tapbackEmojis: Record<string, string> = {
  love: "❤️",
  like: "👍",
  dislike: "👎",
  laugh: "😂",
  emphasis: "‼️",
  question: "❓",
};

export function StoryTapbacks({
  tapbacks,
}: {
  tapbacks: Array<{ reaction: string; count: number }>;
}) {
  const maxCount = Math.max(...tapbacks.map((t) => t.count));
  const BAR_MAX_WIDTH = CONTENT_WIDTH - 100;

  return (
    <StoryFrame category="💬 Reactions Given">
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {tapbacks.slice(0, 5).map((t) => {
          const barWidth = (t.count / maxCount) * BAR_MAX_WIDTH;
          const emoji = tapbackEmojis[t.reaction] || "💬";
          return (
            <div key={t.reaction} style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ fontSize: 40, width: 56, textAlign: "center" }}>{emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ position: "relative", height: 24 }}>
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      width: BAR_MAX_WIDTH,
                      height: 24,
                      background: "rgba(255,255,255,0.1)",
                      borderRadius: 12,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      width: barWidth,
                      height: 24,
                      background: "linear-gradient(90deg, #ec4899, #a855f7)",
                      borderRadius: 12,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </StoryFrame>
  );
}

export function StoryContactEmojis({
  contacts,
}: {
  contacts: Array<{ contact: string; emoji: string; count: number }>;
}) {
  return (
    <StoryFrame category="🎭 Emoji Signatures">
      <div style={{ display: "flex", flexDirection: "column", gap: 28, width: "100%" }}>
        {contacts.slice(0, 6).map((c) => (
          <div
            key={c.contact}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              background: "rgba(255,255,255,0.04)",
              borderRadius: 20,
              padding: "20px 28px",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ fontSize: 56 }}>{c.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 28, fontWeight: 600, color: "white" }}>
                {truncate(c.contact, 18)}
              </div>
              <div style={{ fontSize: 20, color: "rgba(255,255,255,0.5)" }}>
                {c.count} times
              </div>
            </div>
          </div>
        ))}
      </div>
    </StoryFrame>
  );
}

export function StoryEmojiLanguages({
  contacts,
}: {
  contacts: Array<{ name: string; emojis: Array<{ emoji: string; count: number }> }>;
}) {
  return (
    <StoryFrame category="🎭 Emoji Language">
      <div style={{ display: "flex", flexDirection: "column", gap: 28, width: "100%" }}>
        {contacts.slice(0, 5).map((c) => (
          <div
            key={c.name}
            style={{
              background: "rgba(255,255,255,0.04)",
              borderRadius: 20,
              padding: "24px 28px",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ fontSize: 26, fontWeight: 600, color: "white", marginBottom: 16 }}>
              {truncate(c.name, 22)}
            </div>
            <div style={{ fontSize: 44, display: "flex", gap: 12, flexWrap: "wrap" }}>
              {c.emojis.slice(0, 8).map((e, i) => (
                <span key={i}>{e.emoji}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </StoryFrame>
  );
}

export function StoryConnections({
  connections,
}: {
  connections: Array<[string, { emoji: string; description: string; vibe: string }]>;
}) {
  return (
    <StoryFrame category="💜 Connection Vibes">
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {connections.slice(0, 4).map(([name, data]) => (
          <div
            key={name}
            style={{
              background: "rgba(255,255,255,0.04)",
              borderRadius: 16,
              padding: 20,
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 28 }}>{data.emoji || "💬"}</span>
              <span style={{ fontSize: 22, fontWeight: 600, color: "white" }}>
                {truncate(name, 20)}
              </span>
            </div>
            <div style={{ fontSize: 18, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>
              {truncate(data.description, 100)}
            </div>
          </div>
        ))}
      </div>
    </StoryFrame>
  );
}

export function StoryMemories({
  memories,
}: {
  memories: Array<{ title: string; snippet: string; date: string; vibe: string }>;
}) {
  return (
    <StoryFrame category="✨ Nice Memories">
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {memories.slice(0, 3).map((m, i) => (
          <div
            key={i}
            style={{
              background: "rgba(255,255,255,0.04)",
              borderRadius: 16,
              padding: 24,
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 24 }}>{m.vibe}</span>
              <span style={{ fontSize: 20, fontWeight: 600, color: "#a855f7" }}>{m.title}</span>
            </div>
            <div style={{ fontSize: 22, color: "white", lineHeight: 1.5 }}>
              "{truncate(m.snippet, 100)}"
            </div>
          </div>
        ))}
      </div>
    </StoryFrame>
  );
}

export function StoryReactionMemories({
  title,
  emoji,
  memories,
}: {
  title: string;
  emoji: string;
  memories: Array<{ text: string; from: string; context?: string }>;
}) {
  return (
    <StoryFrame category={`${emoji} ${title}`}>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {memories.slice(0, 3).map((m, i) => (
          <div
            key={i}
            style={{
              background: "rgba(255,255,255,0.04)",
              borderRadius: 16,
              padding: 24,
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ fontSize: 24, color: "white", lineHeight: 1.5, marginBottom: 12 }}>
              "{truncate(m.text, 100)}"
            </div>
            <div style={{ fontSize: 18, color: "#a855f7", fontWeight: 500 }}>
              — {truncate(m.from, 25)}
            </div>
          </div>
        ))}
      </div>
    </StoryFrame>
  );
}

export function StoryMeaningfulTexts({
  person,
  texts,
}: {
  person: string;
  texts: Array<{ text: string; date: string }>;
}) {
  return (
    <StoryFrame category={`💬 ${truncate(person, 15)}`}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {texts.slice(0, 3).map((t, i) => (
          <div
            key={i}
            style={{
              background: "rgba(255,255,255,0.04)",
              borderRadius: 16,
              padding: 24,
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ fontSize: 22, color: "white", lineHeight: 1.5 }}>
              "{truncate(t.text, 120)}"
            </div>
          </div>
        ))}
      </div>
    </StoryFrame>
  );
}

export function StoryPlans({
  plans,
}: {
  plans: {
    trips?: Array<{ what: string; who: string[]; when: string; vibe: string }>;
    gatherings?: Array<{ what: string; who: string[]; when: string; vibe: string }>;
    connections?: Array<{ what: string; who: string[]; when: string; vibe: string }>;
  };
}) {
  const allPlans = [
    ...(plans.trips || []).map((p) => ({ ...p, type: "✈️" })),
    ...(plans.gatherings || []).map((p) => ({ ...p, type: "🎉" })),
    ...(plans.connections || []).map((p) => ({ ...p, type: "💫" })),
  ].slice(0, 4);

  return (
    <StoryFrame category="🗓️ Plans & Adventures">
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {allPlans.map((p, i) => (
          <div
            key={i}
            style={{
              background: "rgba(255,255,255,0.04)",
              borderRadius: 16,
              padding: 20,
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 24 }}>{p.vibe || p.type}</span>
              <span style={{ fontSize: 22, fontWeight: 600, color: "white" }}>
                {truncate(p.what, 30)}
              </span>
            </div>
            <div style={{ fontSize: 18, color: "rgba(255,255,255,0.6)", lineHeight: 1.4 }}>
              {p.when} • {p.who.slice(0, 3).join(", ")}
            </div>
          </div>
        ))}
      </div>
    </StoryFrame>
  );
}

export function StoryPersonality({
  evaluation,
}: {
  evaluation: {
    type?: string;
    adjectives?: string[];
    strengths?: Array<{ title: string; description: string }>;
  };
}) {
  return (
    <StoryFrame category="🔮 Personality">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>
        {evaluation.type && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#a855f7", marginBottom: 16 }}>
              {evaluation.type}
            </div>
          </div>
        )}
        {evaluation.adjectives && (
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12 }}>
            {evaluation.adjectives.slice(0, 5).map((adj) => (
              <span
                key={adj}
                style={{
                  padding: "10px 20px",
                  borderRadius: 20,
                  background: "rgba(168,85,247,0.2)",
                  border: "1px solid rgba(168,85,247,0.3)",
                  fontSize: 20,
                  color: "white",
                }}
              >
                {adj}
              </span>
            ))}
          </div>
        )}
        {evaluation.strengths && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
            {evaluation.strengths.slice(0, 2).map((s) => (
              <div
                key={s.title}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 16,
                  padding: 20,
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 600, color: "#a855f7", marginBottom: 8 }}>
                  {s.title}
                </div>
                <div style={{ fontSize: 18, color: "rgba(255,255,255,0.7)", lineHeight: 1.4 }}>
                  {truncate(s.description, 100)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StoryFrame>
  );
}

// ============= HISTORY CARDS =============

interface YearlyTop5Entry {
  year: number;
  contact: string;
  msg_count: number;
  rank: number;
}

export function StoryBestiesThroughYears({ data }: { data: YearlyTop5Entry[] }) {
  const years = [2021, 2022, 2023, 2024, 2025];
  
  return (
    <StoryFrame category="history">
      <div style={{ display: "flex", flexDirection: "column", gap: 30, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>📜</div>
          <div style={{ fontSize: 42, fontWeight: 700, color: "white", marginBottom: 8 }}>
            Besties Through The Years
          </div>
          <div style={{ fontSize: 22, color: "rgba(255,255,255,0.6)" }}>
            Your top 5 texted, year by year
          </div>
        </div>
        
        {/* Table */}
        <div style={{ width: "100%" }}>
          {/* Header */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "60px repeat(5, 1fr)",
            gap: 8,
            marginBottom: 16,
            paddingBottom: 12,
            borderBottom: "1px solid rgba(255,255,255,0.1)"
          }}>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>#</div>
            {years.map(year => (
              <div key={year} style={{ 
                fontSize: 20, 
                fontWeight: 700, 
                textAlign: "center",
                background: "linear-gradient(135deg, #ec4899, #8b5cf6, #6366f1)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                {year}
              </div>
            ))}
          </div>
          
          {/* Rows */}
          {[1, 2, 3, 4, 5].map(rank => {
            const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`;
            const rowBg = rank === 1 ? "rgba(245, 158, 11, 0.1)" 
                        : rank === 2 ? "rgba(148, 163, 184, 0.1)" 
                        : rank === 3 ? "rgba(194, 65, 12, 0.1)" 
                        : "transparent";
            return (
              <div key={rank} style={{ 
                display: "grid", 
                gridTemplateColumns: "60px repeat(5, 1fr)",
                gap: 8,
                padding: "12px 0",
                background: rowBg,
                borderRadius: 8,
                marginBottom: 4,
              }}>
                <div style={{ fontSize: 24, textAlign: "center" }}>{medal}</div>
                {years.map(year => {
                  const person = data.find(d => d.year === year && d.rank === rank);
                  return (
                    <div key={year} style={{ textAlign: "center" }}>
                      {person ? (
                        <>
                          <div style={{ fontSize: 16, fontWeight: 500, color: "white" }}>
                            {truncate(person.contact, 10)}
                          </div>
                          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                            {person.msg_count.toLocaleString()}
                          </div>
                        </>
                      ) : (
                        <div style={{ color: "rgba(255,255,255,0.3)" }}>—</div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </StoryFrame>
  );
}

interface HistoryHighlight {
  emoji: string;
  title: string;
  text: string;
  color: string;
}

export function StoryHistoryHighlights({ highlights }: { highlights: HistoryHighlight[] }) {
  return (
    <StoryFrame category="history">
      <div style={{ display: "flex", flexDirection: "column", gap: 30, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>🌟</div>
          <div style={{ fontSize: 42, fontWeight: 700, color: "white", marginBottom: 8 }}>
            History Highlights
          </div>
          <div style={{ fontSize: 22, color: "rgba(255,255,255,0.6)" }}>
            The stories your messages tell
          </div>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {highlights.map((h, i) => (
            <div
              key={i}
              style={{
                background: h.color,
                borderRadius: 16,
                padding: 24,
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <span style={{ fontSize: 28 }}>{h.emoji}</span>
                <span style={{ fontSize: 22, fontWeight: 600, color: "white" }}>{h.title}</span>
              </div>
              <div style={{ fontSize: 18, color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>
                {h.text}
              </div>
            </div>
          ))}
        </div>
      </div>
    </StoryFrame>
  );
}



