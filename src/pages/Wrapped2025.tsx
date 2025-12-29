import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Bar, BarChart } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ExportableCard, ShareModal } from "@/components/story-export";
import {
  StoryHero,
  StoryBookends,
  StoryTopContacts,
  StoryMonthlyVolume,
  StorySignatureWords,
  StoryTopEmojis,
  StoryTapbacks,
  StoryConnections,
  StoryMemories,
  StoryReactionMemories,
  StoryMeaningfulTexts,
  StoryPlans,
  StoryPersonality,
  StoryContactEmojis,
  StoryEmojiLanguages,
} from "@/components/story-cards";

import monthlyVolume from "@/lib/data/monthly-volume.json";
import topContacts from "@/lib/data/top-contacts.json";
import tapbackTrends from "@/lib/data/tapback-trends.json";
import topEmojis from "@/lib/data/top-emojis.json";
import contactEmojis from "@/lib/data/contact-emojis.json";
import topWords from "@/lib/data/top-words.json";
import milestones from "@/lib/data/milestones.json";
import reactionMemories from "@/lib/data/reaction-memories.json";
import meaningfulTexts from "@/lib/data/meaningful-texts.json";
import plans from "@/lib/data/plans.json";
import stats from "@/lib/data/stats.json";
import connections from "@/lib/data/connections.json";
import personalityEvaluation from "@/lib/data/personality-evaluation.json";
import yearlyTop5 from "@/lib/data/yearly-top5.json";

const monthlyConfig = {
  count: { label: "Messages", color: "var(--chart-1)" },
} satisfies ChartConfig;

const contactConfig = {
  sent: { label: "Sent", color: "var(--chart-2)" },
  received: { label: "Received", color: "var(--chart-3)" },
} satisfies ChartConfig;

const wordConfig = {
  count: { label: "Times Used", color: "var(--chart-4)" },
} satisfies ChartConfig;

const monthLabels: Record<string, string> = {
  "2025-01-01": "Jan", "2025-02-01": "Feb", "2025-03-01": "Mar",
  "2025-04-01": "Apr", "2025-05-01": "May", "2025-06-01": "Jun",
  "2025-07-01": "Jul", "2025-08-01": "Aug", "2025-09-01": "Sep",
  "2025-10-01": "Oct", "2025-11-01": "Nov", "2025-12-01": "Dec",
};

const tapbackEmojis: Record<string, string> = {
  "Love": "❤️",
  "Like": "👍",
  "Dislike": "👎",
  "Laugh": "😂",
  "Emphasis": "‼️",
  "Question": "❓",
};

const formatMonth = (val: string) => monthLabels[val] || val;

type ViewMode = "vibes" | "messages" | "personality" | "history";

interface CardInfo {
  id: string;
  title: string;
  category: "vibes" | "messages" | "personality";
  storyContent?: React.ReactNode;
}

export default function Wrapped2025() {
  const totalMessages = monthlyVolume.reduce((sum, m) => sum + m.count, 0);
  const [viewMode, setViewMode] = useState<ViewMode>("vibes");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [viewMode]);

  const contactsWithEmojis = contactEmojis.filter(c => c.emojis && c.emojis.length > 0);
  const meaningfulTextsEntries = Object.entries(meaningfulTexts);
  const connectionEntries = Object.entries(connections) as [string, { emoji: string; description: string; vibe: string }][];

  // Build card registry for share modal
  const allCards = [
    // Vibes cards
    { id: "hero", title: "Year Overview", category: "vibes" as const, storyContent: <StoryHero totalMessages={totalMessages} uniqueConversations={stats.uniqueConversations} /> },
    { id: "bookends-vibes", title: "Bookends", category: "vibes" as const, storyContent: <StoryBookends firstMessage={milestones.firstMessage} lastMessage={milestones.lastMessage} /> },
    { id: "inner-circle", title: "Inner Circle", category: "vibes" as const, storyContent: <StoryTopContacts contacts={topContacts} /> },
    { id: "digital-heartbeat", title: "Digital Heartbeat", category: "vibes" as const, storyContent: <StoryMonthlyVolume data={monthlyVolume} /> },
    { id: "signature-words", title: "Signature Words", category: "vibes" as const, storyContent: <StorySignatureWords words={topWords} /> },
    { id: "emoji-vibe", title: "Emoji Vibe", category: "vibes" as const, storyContent: <StoryTopEmojis emojis={topEmojis} /> },
    { id: "tapback-favorites", title: "Tapback Favorites", category: "vibes" as const, storyContent: <StoryTapbacks tapbacks={tapbackTrends} /> },
    ...(contactsWithEmojis.length > 0 ? [{ id: "emoji-languages", title: "Emoji Languages", category: "vibes" as const, storyContent: <StoryEmojiLanguages contacts={contactsWithEmojis} /> }] : []),
    { id: "connection-vibes", title: "Connection Vibes", category: "vibes" as const, storyContent: <StoryConnections connections={connectionEntries} /> },
    { id: "plans", title: "Plans You Made", category: "vibes" as const, storyContent: <StoryPlans plans={plans} /> },
    // Messages cards
    { id: "bookends-messages", title: "Bookends", category: "messages" as const, storyContent: <StoryBookends firstMessage={milestones.firstMessage} lastMessage={milestones.lastMessage} /> },
    { id: "nice-memories", title: "Nice Memories", category: "messages" as const, storyContent: <StoryMemories memories={milestones.memories || []} /> },
    ...meaningfulTextsEntries.map(([person, texts]) => ({
      id: `meaningful-${person.toLowerCase().replace(/\s+/g, "-")}`,
      title: `Messages from ${person}`,
      category: "messages" as const,
      storyContent: <StoryMeaningfulTexts person={person} texts={texts} />,
    })),
    { id: "messages-loved", title: "Messages You Loved", category: "messages" as const, storyContent: <StoryReactionMemories title="Messages You Loved" emoji="❤️" memories={reactionMemories.love} /> },
    { id: "messages-laugh", title: "Messages That Made You Laugh", category: "messages" as const, storyContent: <StoryReactionMemories title="Made You Laugh" emoji="😂" memories={reactionMemories.laugh} /> },
    { id: "messages-emphasis", title: "Messages That Made You Go WHOA", category: "messages" as const, storyContent: <StoryReactionMemories title="Made You Go WHOA" emoji="‼️" memories={reactionMemories.emphasis} /> },
    { id: "messages-dislike", title: "Messages You Disliked", category: "messages" as const, storyContent: <StoryReactionMemories title="Messages You Disliked" emoji="👎" memories={reactionMemories.dislike} /> },
    // Personality cards
    { id: "personality", title: "Personality Evaluation", category: "personality" as const, storyContent: <StoryPersonality evaluation={personalityEvaluation} /> },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-background p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <div className="max-w-3xl mx-auto flex flex-col gap-8">
        
        {/* Hero - Always visible */}
        <ExportableCard
          cardId="hero"
          title="Year Overview"
          storyContent={<StoryHero totalMessages={totalMessages} uniqueConversations={stats.uniqueConversations} />}
        >
          <header className="text-center py-8 flex flex-col gap-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
              Anthea's 2025 iMessage Wrapped
            </h1>
            <p className="text-xl text-muted-foreground">Your year in messages ✨</p>
            <div className="flex justify-center gap-8 pt-2 text-center">
              <div>
                <p className="text-4xl font-bold">{totalMessages.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Messages</p>
              </div>
              <div>
                <p className="text-4xl font-bold">{stats.uniqueConversations}</p>
                <p className="text-sm text-muted-foreground">Conversations</p>
              </div>
            </div>
          </header>
        </ExportableCard>

        {/* View Mode Toggle + Share Button */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sticky top-2 z-50 py-2">
          <div className="flex gap-1 p-1 rounded-full bg-muted/80 backdrop-blur-sm border shadow-lg">
            <button
              onClick={() => setViewMode("vibes")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                viewMode === "vibes" 
                  ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              ✨ Vibes
            </button>
            <button
              onClick={() => setViewMode("messages")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                viewMode === "messages" 
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              💌 Messages
            </button>
            <button
              onClick={() => setViewMode("personality")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                viewMode === "personality" 
                  ? "bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-md" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🔮 Personality
            </button>
            <button
              onClick={() => setViewMode("history")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                viewMode === "history" 
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              📜 History
            </button>
          </div>
          <ShareModal cards={allCards} />
        </div>

        {/* ===================== VIBES VIEW ===================== */}
        {viewMode === "vibes" && (
          <>
            {/* Bookends - First & Last Message */}
            <ExportableCard
              cardId="bookends-vibes"
              title="Bookends"
              storyContent={<StoryBookends firstMessage={milestones.firstMessage} lastMessage={milestones.lastMessage} />}
            >
              <Card>
                <CardHeader>
                  <CardTitle>📅 The Bookends of Your Year</CardTitle>
                  <CardDescription>Your first and most recent messages of 2025</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                  <div className="border-l-4 border-green-500 pl-4">
                    <p className="text-xs text-muted-foreground mb-1">🌅 First Message — {milestones.firstMessage.sent_at}</p>
                    <p className="text-sm whitespace-pre-wrap">{milestones.firstMessage.text}</p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <p className="text-xs text-muted-foreground mb-1">🌙 Most Recent — {milestones.lastMessage.sent_at}</p>
                    <p className="text-sm whitespace-pre-wrap">{milestones.lastMessage.text}</p>
                  </div>
                </CardContent>
              </Card>
            </ExportableCard>

            {/* Inner Circle - Top Contacts */}
            <ExportableCard
              cardId="inner-circle"
              title="Inner Circle"
              storyContent={<StoryTopContacts contacts={topContacts} />}
            >
              <Card>
                <CardHeader>
                  <CardTitle>👥 Your Inner Circle</CardTitle>
                  <CardDescription>The people you connected with most (DMs only, includes images & attachments)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={contactConfig} className="h-[350px] w-full">
                    <BarChart data={topContacts.slice(0, 6)} layout="vertical" margin={{ left: 0, right: 12, top: 12, bottom: 0 }}>
                      <XAxis type="number" hide />
                      <YAxis 
                         dataKey="contact" 
                         type="category" 
                         tickLine={false} 
                         axisLine={false} 
                         fontSize={12}
                         width={100}
                         tickFormatter={(val) => val.length > 12 ? val.slice(0, 12) + '…' : val}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="sent" stackId="a" fill="var(--chart-2)" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="received" stackId="a" fill="var(--chart-3)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </ExportableCard>

            {/* Digital Heartbeat - Monthly Volume */}
            <ExportableCard
              cardId="digital-heartbeat"
              title="Digital Heartbeat"
              storyContent={<StoryMonthlyVolume data={monthlyVolume} />}
            >
              <Card>
                <CardHeader>
                  <CardTitle>📈 Your Digital Heartbeat</CardTitle>
                  <CardDescription>Message volume throughout the year</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={monthlyConfig} className="h-[300px] w-full">
                    <AreaChart data={monthlyVolume} margin={{ left: 0, right: 12, top: 12, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" tickFormatter={formatMonth} tickLine={false} axisLine={false} fontSize={12} />
                      <YAxis tickLine={false} axisLine={false} fontSize={12} width={40} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area type="monotone" dataKey="count" fill="var(--chart-1)" fillOpacity={0.3} stroke="var(--chart-1)" strokeWidth={2} />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </ExportableCard>

            {/* Signature Words */}
            <ExportableCard
              cardId="signature-words"
              title="Signature Words"
              storyContent={<StorySignatureWords words={topWords} />}
            >
              <Card>
                <CardHeader>
                  <CardTitle>💬 Your Signature Words</CardTitle>
                  <CardDescription>The words that defined your 2025 conversations</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={wordConfig} className="h-[300px] w-full">
                    <BarChart data={topWords} layout="vertical" margin={{ left: 0, right: 12, top: 12, bottom: 0 }}>
                      <XAxis type="number" hide />
                      <YAxis 
                         dataKey="word" 
                         type="category" 
                         tickLine={false} 
                         axisLine={false} 
                         fontSize={12}
                         width={80}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" fill="var(--chart-4)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </ExportableCard>

            {/* Emoji Vibe */}
            <ExportableCard
              cardId="emoji-vibe"
              title="Emoji Vibe"
              storyContent={<StoryTopEmojis emojis={topEmojis} />}
            >
              <Card>
                <CardHeader>
                  <CardTitle>😊 Your Emoji Vibe</CardTitle>
                  <CardDescription>The emojis that colored your conversations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4 justify-center">
                    {topEmojis.slice(0, 10).map((e, i) => (
                      <div key={i} className="flex flex-col items-center p-3 rounded-lg bg-muted/50 min-w-[70px]">
                        <span className="text-4xl">{e.emoji}</span>
                        <span className="text-sm font-medium mt-1">{e.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </ExportableCard>

            {/* Tapback Favorites */}
            <ExportableCard
              cardId="tapback-favorites"
              title="Tapback Favorites"
              storyContent={<StoryTapbacks tapbacks={tapbackTrends} />}
            >
              <Card>
                <CardHeader>
                  <CardTitle>👍 Tapback Favorites</CardTitle>
                  <CardDescription>Your go-to reactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4 justify-center">
                    {tapbackTrends.slice(0, 6).map((t, i) => (
                      <div key={i} className="flex flex-col items-center p-3 rounded-lg bg-muted/50 min-w-[80px]">
                        <span className="text-3xl">{tapbackEmojis[t.reaction] || t.reaction}</span>
                        <span className="text-xs text-muted-foreground mt-1">{t.reaction}</span>
                        <span className="text-sm font-medium">{t.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </ExportableCard>

            {/* Emoji Languages */}
            {contactsWithEmojis.length > 0 && (
              <ExportableCard
                cardId="emoji-languages"
                title="Emoji Languages"
                storyContent={<StoryEmojiLanguages contacts={contactsWithEmojis} />}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>💕 Emoji Languages</CardTitle>
                    <CardDescription>The unique emoji dialects you share with your people</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-6">
                      {contactsWithEmojis.slice(0, 6).map((contact, i) => (
                        <div key={i} className="p-4 rounded-lg bg-muted/50">
                          <p className="font-bold text-lg mb-3">{contact.name}</p>
                          <div className="flex gap-3 flex-wrap">
                            {contact.emojis.map((e, j) => (
                              <div key={j} className="flex flex-col items-center">
                                <span className="text-3xl">{e.emoji}</span>
                                <span className="text-xs text-muted-foreground">{e.count}×</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </ExportableCard>
            )}

            {/* Connection Vibes */}
            <ExportableCard
              cardId="connection-vibes"
              title="Connection Vibes"
              storyContent={<StoryConnections connections={connectionEntries} />}
            >
              <Card>
                <CardHeader>
                  <CardTitle>💫 Your Connection Vibes</CardTitle>
                  <CardDescription>The unique energy you share with your favorite humans</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    {connectionEntries.filter(([name]) => name !== "Anthea (Me)").map(([name, conn], i) => (
                      <div key={i} className="p-4 rounded-lg bg-gradient-to-r from-muted/50 to-muted/20 border border-muted">
                        <div className="flex items-start gap-3">
                          <span className="text-3xl">{conn.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-lg">{name}</p>
                            <p className="text-sm text-muted-foreground mt-1">{conn.description}</p>
                            <p className="text-xs mt-2 inline-block px-2 py-1 rounded-full bg-primary/10 text-primary">{conn.vibe}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </ExportableCard>

            {/* Plans Card */}
            <ExportableCard
              cardId="plans"
              title="Plans You Made"
              storyContent={<StoryPlans plans={plans} />}
            >
              <Card>
                <CardHeader>
                  <CardTitle>🗓️ Plans You Made</CardTitle>
                  <CardDescription>Adventures, gatherings, and connections coordinated via text</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-6">
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">✈️ Trips & Adventures</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {plans.trips.map((plan, i) => (
                          <div key={i} className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{plan.vibe}</span>
                              <span className="font-medium">{plan.what}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              with {plan.who.join(", ")} • {plan.when}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">🎉 Gatherings</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {plans.gatherings.map((plan, i) => (
                          <div key={i} className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{plan.vibe}</span>
                              <span className="font-medium">{plan.what}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              with {plan.who.join(", ")} • {plan.when}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">☕ Connections</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {plans.connections.map((plan, i) => (
                          <div key={i} className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{plan.vibe}</span>
                              <span className="font-medium">{plan.what}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              with {plan.who.join(", ")} • {plan.when}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ExportableCard>
          </>
        )}

        {/* ===================== MESSAGES VIEW ===================== */}
        {viewMode === "messages" && (
          <>
            {/* Bookends - First & Last Message */}
            <ExportableCard
              cardId="bookends-messages"
              title="Bookends"
              storyContent={<StoryBookends firstMessage={milestones.firstMessage} lastMessage={milestones.lastMessage} />}
            >
              <Card>
                <CardHeader>
                  <CardTitle>📅 The Bookends of Your Year</CardTitle>
                  <CardDescription>Your first and most recent messages of 2025</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                  <div className="border-l-4 border-green-500 pl-4">
                    <p className="text-xs text-muted-foreground mb-1">🌅 First Message — {milestones.firstMessage.sent_at}</p>
                    <p className="text-sm whitespace-pre-wrap">{milestones.firstMessage.text}</p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <p className="text-xs text-muted-foreground mb-1">🌙 Most Recent — {milestones.lastMessage.sent_at}</p>
                    <p className="text-sm whitespace-pre-wrap">{milestones.lastMessage.text}</p>
                  </div>
                </CardContent>
              </Card>
            </ExportableCard>

            {/* Five Nice Memories */}
            <ExportableCard
              cardId="nice-memories"
              title="Nice Memories"
              storyContent={<StoryMemories memories={milestones.memories} />}
            >
              <Card>
                <CardHeader>
                  <CardTitle>💭 Five Nice Memories</CardTitle>
                  <CardDescription>Little moments that made 2025 special</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    {milestones.memories.map((memory, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <span className="text-2xl">{memory.vibe}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{memory.title}</p>
                          <p className="text-sm text-muted-foreground">{memory.snippet}</p>
                          <p className="text-xs text-muted-foreground mt-1">{memory.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </ExportableCard>

            {/* Meaningful Texts from Each Person */}
            {meaningfulTextsEntries.map(([person, texts]) => (
              <ExportableCard
                key={person}
                cardId={`meaningful-${person.toLowerCase().replace(/\s+/g, "-")}`}
                title={`Messages from ${person}`}
                storyContent={<StoryMeaningfulTexts person={person} texts={texts} />}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>💌 Messages from {person}</CardTitle>
                    <CardDescription>Meaningful words they shared with you</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-3">
                      {texts.map((msg, i) => (
                        <div key={i} className="p-3 rounded-lg bg-muted/50 border-l-4 border-purple-500/50">
                          <p className="text-sm">"{msg.text}"</p>
                          <p className="text-xs text-muted-foreground mt-2">{msg.date}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </ExportableCard>
            ))}

            {/* Reaction Memories - LOVE */}
            <ExportableCard
              cardId="messages-loved"
              title="Messages You Loved"
              storyContent={<StoryReactionMemories title="Messages You Loved" emoji="❤️" memories={reactionMemories.love} />}
            >
              <Card className="border-red-500/30">
                <CardHeader>
                  <CardTitle>❤️ Messages You Loved</CardTitle>
                  <CardDescription>Messages from friends that made your heart react</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    {reactionMemories.love.map((memory, i) => (
                      <div key={i} className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                        <p className="text-sm whitespace-pre-wrap">"{memory.text}"</p>
                        <p className="text-xs text-muted-foreground mt-2">— <span className="font-medium">{memory.from}</span> • {memory.context}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </ExportableCard>

            {/* Reaction Memories - LAUGH */}
            <ExportableCard
              cardId="messages-laugh"
              title="Messages That Made You Laugh"
              storyContent={<StoryReactionMemories title="Made You Laugh" emoji="😂" memories={reactionMemories.laugh} />}
            >
              <Card className="border-yellow-500/30">
                <CardHeader>
                  <CardTitle>😂 Messages That Made You Laugh</CardTitle>
                  <CardDescription>The moments that had you cracking up</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    {reactionMemories.laugh.map((memory, i) => (
                      <div key={i} className="p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                        <p className="text-sm whitespace-pre-wrap">"{memory.text}"</p>
                        <p className="text-xs text-muted-foreground mt-2">— <span className="font-medium">{memory.from}</span> • {memory.context}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </ExportableCard>

            {/* Reaction Memories - EMPHASIS */}
            <ExportableCard
              cardId="messages-emphasis"
              title="Messages That Made You Go WHOA"
              storyContent={<StoryReactionMemories title="Made You Go WHOA" emoji="‼️" memories={reactionMemories.emphasis} />}
            >
              <Card className="border-orange-500/30">
                <CardHeader>
                  <CardTitle>‼️ Messages That Made You Go WHOA</CardTitle>
                  <CardDescription>The moments that needed extra emphasis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    {reactionMemories.emphasis.map((memory, i) => (
                      <div key={i} className="p-4 rounded-lg bg-orange-500/5 border border-orange-500/20">
                        <p className="text-sm whitespace-pre-wrap">"{memory.text}"</p>
                        <p className="text-xs text-muted-foreground mt-2">— <span className="font-medium">{memory.from}</span> • {memory.context}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </ExportableCard>

            {/* Reaction Memories - DISLIKE */}
            <ExportableCard
              cardId="messages-dislike"
              title="Messages You Disliked"
              storyContent={<StoryReactionMemories title="Messages You Disliked" emoji="👎" memories={reactionMemories.dislike} />}
            >
              <Card className="border-gray-500/30">
                <CardHeader>
                  <CardTitle>👎 Messages You Disliked</CardTitle>
                  <CardDescription>The not-so-great news (only {tapbackTrends.find(t => t.reaction === "Dislike")?.count || 3} all year!)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    {reactionMemories.dislike.map((memory, i) => (
                      <div key={i} className="p-4 rounded-lg bg-gray-500/5 border border-gray-500/20">
                        <p className="text-sm whitespace-pre-wrap">"{memory.text}"</p>
                        <p className="text-xs text-muted-foreground mt-2">— <span className="font-medium">{memory.from}</span> • {memory.context}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </ExportableCard>
          </>
        )}

        {/* ===================== PERSONALITY VIEW ===================== */}
        {viewMode === "personality" && (
          <ExportableCard
            cardId="personality"
            title="Personality Evaluation"
            storyContent={<StoryPersonality evaluation={personalityEvaluation} />}
          >
            <Card className="border-violet-500/30">
              <CardHeader>
                <CardTitle>🔮 What's Going On Here, With This Human?</CardTitle>
                <CardDescription>A Graham Duncan-style talent evaluation based on ~300 messages</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* TL;DR */}
                <div className="p-4 rounded-lg bg-violet-500/10 border border-violet-500/20">
                  <p className="text-sm font-semibold text-violet-400 mb-1">TL;DR</p>
                  <p className="text-sm">{personalityEvaluation.tldr}</p>
                </div>

                {/* Game Being Played */}
                <div>
                  <p className="text-sm font-semibold mb-2">🎯 Game Being Played</p>
                  <p className="text-sm text-muted-foreground">{personalityEvaluation.game}</p>
                </div>

                {/* Rider vs Elephant */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs font-semibold text-blue-400 mb-1">🧠 Rider (Conscious Narrative)</p>
                    <p className="text-xs italic">{personalityEvaluation.rider}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs font-semibold text-orange-400 mb-1">🐘 Elephant (Core Drives)</p>
                    <p className="text-xs">{personalityEvaluation.elephant}</p>
                  </div>
                </div>

                {/* OCEAN Big Five */}
                <div>
                  <p className="text-sm font-semibold mb-2">📊 OCEAN Big Five</p>
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(personalityEvaluation.ocean).map(([trait, data]) => (
                      <div key={trait} className="flex items-start gap-2 text-xs">
                        <span className="font-medium capitalize min-w-[110px]">{trait}:</span>
                        <span className="text-muted-foreground">
                          <span className="font-semibold text-foreground">{data.level}</span> — {data.evidence}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* MBTI & Enneagram */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-pink-500/5 border border-pink-500/20">
                    <p className="text-sm font-bold">{personalityEvaluation.mbti.type}</p>
                    <p className="text-xs text-muted-foreground">{personalityEvaluation.mbti.rationale}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                    <p className="text-sm font-bold">Enneagram {personalityEvaluation.enneagram.type}</p>
                    <p className="text-xs text-muted-foreground">{personalityEvaluation.enneagram.rationale}</p>
                  </div>
                </div>

                {/* Strengths & Shadows */}
                <div>
                  <p className="text-sm font-semibold mb-2">⚖️ Strengths ↔ Shadows</p>
                  <div className="space-y-2">
                    {personalityEvaluation.strengths_shadows.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <span className="text-green-500 font-medium min-w-[130px]">✓ {item.strength}</span>
                        <span className="text-red-400">→ {item.shadow}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ecosystem Fit */}
                <div>
                  <p className="text-sm font-semibold mb-2">💧 Ecosystem Fit ('Water')</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                      <p className="text-xs font-semibold text-green-400 mb-1">Compounds</p>
                      <p className="text-xs text-muted-foreground">{personalityEvaluation.water.compounds}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                      <p className="text-xs font-semibold text-red-400 mb-1">Stalls</p>
                      <p className="text-xs text-muted-foreground">{personalityEvaluation.water.stalls}</p>
                    </div>
                  </div>
                </div>

                {/* 10 Adjectives */}
                <div>
                  <p className="text-sm font-semibold mb-2">🏷️ Ten-Adjective Reference</p>
                  <div className="flex flex-wrap gap-2">
                    {personalityEvaluation.adjectives.map((adj, i) => (
                      <span key={i} className="px-2 py-1 rounded-full bg-muted text-xs">{adj}</span>
                    ))}
                  </div>
                </div>

                {/* Letter Grades */}
                <div>
                  <p className="text-sm font-semibold mb-2">📋 Letter-Grade Dashboard</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {Object.entries(personalityEvaluation.grades).map(([key, data]) => (
                      <div key={key} className="p-2 rounded-lg bg-muted/50 text-center">
                        <p className="text-lg font-bold">{data.grade}</p>
                        <p className="text-xs text-muted-foreground capitalize">{key.replace('_', ' ')}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 space-y-1">
                    {Object.entries(personalityEvaluation.grades).map(([key, data]) => (
                      <p key={key} className="text-xs text-muted-foreground">
                        <span className="font-medium capitalize">{key.replace('_', ' ')}:</span> {data.justification}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Questions */}
                <div>
                  <p className="text-sm font-semibold mb-2">❓ Key Questions to Explore</p>
                  <ul className="space-y-1">
                    {personalityEvaluation.questions.map((q, i) => (
                      <li key={i} className="text-xs text-muted-foreground">• {q}</li>
                    ))}
                  </ul>
                </div>

                {/* Optimal Seat */}
                <div className="p-4 rounded-lg bg-gradient-to-r from-violet-500/10 to-pink-500/10 border border-violet-500/20">
                  <p className="text-sm font-semibold mb-2">🪑 Optimal Seat</p>
                  <p className="text-xs text-muted-foreground">{personalityEvaluation.optimal_seat}</p>
                </div>
              </CardContent>
            </Card>
          </ExportableCard>
        )}

        {/* ===================== HISTORY VIEW ===================== */}
        {viewMode === "history" && (
          <>
            {/* Besties Through The Years */}
            <Card>
              <CardHeader>
                <CardTitle>📜 Your Besties Through The Years</CardTitle>
                <CardDescription>Top 5 people you texted most, year by year (2021-2025)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-8">
                  {[2021, 2022, 2023, 2024, 2025].map(year => {
                    const yearData = yearlyTop5.filter((d: any) => d.year === year);
                    if (yearData.length === 0) return null;
                    return (
                      <div key={year} className="space-y-3">
                        <div className="flex items-center justify-center gap-3 py-4 mb-2 rounded-lg bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 border border-purple-500/30">
                          <span className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                            {year}
                          </span>
                        </div>
                        <div className="flex flex-col gap-2">
                          {yearData.map((person: any, i: number) => {
                            const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "";
                            const bgColor = i === 0 ? "bg-amber-500/10 border-amber-500/30" 
                                          : i === 1 ? "bg-slate-400/10 border-slate-400/30" 
                                          : i === 2 ? "bg-orange-700/10 border-orange-700/30" 
                                          : "bg-muted/50 border-muted";
                            return (
                              <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${bgColor}`}>
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl w-8">{medal || `#${i + 1}`}</span>
                                  <span className="font-medium">{person.contact}</span>
                                </div>
                                <span className="text-sm text-muted-foreground">{person.msg_count.toLocaleString()} msgs</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Fun Facts */}
            <Card>
              <CardHeader>
                <CardTitle>🌟 History Highlights</CardTitle>
                <CardDescription>Patterns across the years</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <p className="text-sm"><span className="font-bold">The Constant:</span> Melanie has been in your Top 5 for 4 out of 5 years</p>
                  </div>
                  <div className="p-4 rounded-lg bg-pink-500/10 border border-pink-500/20">
                    <p className="text-sm"><span className="font-bold">The Rise:</span> Rob went from not in your top 5 to #1 in 2024-2025</p>
                  </div>
                  <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <p className="text-sm"><span className="font-bold">Mom's Steady Presence:</span> Your mom has been in your Top 5 for 3 years straight</p>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <p className="text-sm"><span className="font-bold">Cloe Era:</span> Cloe entered your Top 5 in 2022 and stayed every year since</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Footer - Always visible */}
        <footer className="text-center py-12 opacity-50 italic">
          <p>Made with 🩵 and care by Zoda.</p>
        </footer>
      </div>
    </div>
  );
}









