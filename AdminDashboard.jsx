import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, Users, Trophy, Globe, Zap, TrendingUp, 
  Building2, DollarSign, Shield, Eye, Check, X, ArrowUpRight
} from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area
} from "recharts";
import { PLATFORM_STATS, REGIONAL_STATS, TIER_CONFIG, buildLeaderboard } from "@/lib/talentData";

const MOCK_GROWTH = [
  { month: "Jan", talents: 800, rewards: 12000 },
  { month: "Feb", talents: 1400, rewards: 21000 },
  { month: "Mar", talents: 2100, rewards: 33000 },
  { month: "Apr", talents: 3400, rewards: 52000 },
  { month: "May", talents: 5800, rewards: 89000 },
  { month: "Jun", talents: 8200, rewards: 134000 },
  { month: "Jul", talents: 11400, rewards: 187000 },
  { month: "Aug", talents: 14800, rewards: 231000 },
  { month: "Sep", talents: 17221, rewards: 284500 },
];

function AdminStatCard({ label, value, icon: Icon, color = "text-primary" }) {
  // Icon is passed as prop
  return (
    <div className="bg-card rounded-2xl border border-border/50 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className={`font-heading text-2xl font-bold mt-1 ${color}`}>{value}</p>
        </div>
        <Icon className={`w-6 h-6 ${color} opacity-60`} />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: talentProfiles } = useQuery({
    queryKey: ["talent-profiles"],
    queryFn: () => base44.entities.TalentProfile.list("-brain_score"),
    initialData: [],
  });

  const { data: sponsorLeads } = useQuery({
    queryKey: ["sponsor-leads"],
    queryFn: () => base44.entities.SponsorLead.list("-created_date"),
    initialData: [],
  });

  const { data: challengeResults } = useQuery({
    queryKey: ["challenge-results"],
    queryFn: () => base44.entities.ChallengeResult.list("-created_date"),
    initialData: [],
  });

  const updateLeadMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.SponsorLead.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sponsor-leads"] }),
  });

  const updateTalentMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TalentProfile.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["talent-profiles"] }),
  });

  const leaderboard = buildLeaderboard(talentProfiles);
  const tierDistribution = Object.keys(TIER_CONFIG).map(tier => ({
    tier,
    count: talentProfiles.filter(p => p.tier === tier).length,
  }));

  const newLeads = sponsorLeads.filter(l => l.status === "new");
  const avgScore = talentProfiles.length
    ? Math.round(talentProfiles.reduce((a, b) => a + (b.brain_score || 0), 0) / talentProfiles.length)
    : 0;

  const TABS = [
    { id: "overview", label: "Overview" },
    { id: "leaderboard", label: "Leaderboard" },
    { id: "sponsors", label: "Sponsors" },
    { id: "talent", label: "Talent Pool" },
  ];

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Admin Only</span>
            </div>
            <h1 className="font-heading text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">UniPath Talent Economy — Operations Console</p>
          </div>
          {newLeads.length > 0 && (
            <Badge variant="destructive" className="gap-1">
              {newLeads.length} new sponsor leads
            </Badge>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-secondary/50 rounded-xl p-1 w-fit">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <AdminStatCard label="Total Talents" value={talentProfiles.length || PLATFORM_STATS.total_talents} icon={Users} />
              <AdminStatCard label="Avg Brain Score" value={avgScore || PLATFORM_STATS.average_brain_score} icon={Zap} color="text-violet-600" />
              <AdminStatCard label="Sponsor Leads" value={sponsorLeads.length} icon={Building2} color="text-blue-600" />
              <AdminStatCard label="Challenges Done" value={challengeResults.length} icon={Trophy} color="text-yellow-600" />
            </div>

            {/* Growth chart */}
            <div className="bg-card rounded-2xl border border-border/50 p-6">
              <h3 className="font-heading font-semibold mb-4">Platform Growth</h3>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={MOCK_GROWTH}>
                  <defs>
                    <linearGradient id="colorTalents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="talents" stroke="hsl(var(--primary))" fill="url(#colorTalents)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Tier distribution */}
            <div className="grid md:grid-cols-5 gap-3">
              {tierDistribution.map(({ tier, count }) => {
                const conf = TIER_CONFIG[tier];
                return (
                  <div key={tier} className={`rounded-xl border ${conf.border} ${conf.bg} p-4 text-center`}>
                    <p className={`font-heading text-xl font-bold ${conf.color}`}>{count}</p>
                    <p className={`text-xs mt-1 ${conf.color} font-medium`}>{conf.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Regional overview */}
            <div className="bg-card rounded-2xl border border-border/50 p-6">
              <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" /> Regional Summary
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {REGIONAL_STATS.map(r => (
                  <div key={r.region} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{r.region}</p>
                      <p className="text-xs text-muted-foreground">{r.talents.toLocaleString()} talents</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono font-bold">{r.avg_score}</p>
                      <p className="text-xs text-green-600">+{r.growth}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* LEADERBOARD */}
        {activeTab === "leaderboard" && (
          <div className="space-y-4">
            <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
              <div className="p-5 border-b border-border/50">
                <h3 className="font-heading font-semibold">Global Talent Leaderboard</h3>
                <p className="text-xs text-muted-foreground mt-1">Anonymized — no personal data exposed</p>
              </div>
              {leaderboard.length === 0 ? (
                <div className="p-10 text-center text-muted-foreground">
                  No talent profiles yet. Students need to complete brain challenges first.
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {leaderboard.slice(0, 20).map((t, i) => {
                    const tier = TIER_CONFIG[t.tier] || TIER_CONFIG.bronze;
                    return (
                      <motion.div
                        key={t.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center gap-4 p-4 hover:bg-muted/20 transition-colors"
                      >
                        <span className="w-8 text-center font-mono text-sm font-bold text-muted-foreground">
                          #{i + 1}
                        </span>
                        <div className={`w-8 h-8 rounded-lg ${tier.bg} flex items-center justify-center`}>
                          <span className={`text-xs font-bold ${tier.color}`}>{tier.label[0]}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{t.displayName}</p>
                          <p className="text-xs text-muted-foreground">{t.region}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-sm">{t.brain_score}</p>
                          <p className="text-xs text-muted-foreground">Top {t.percentile}%</p>
                        </div>
                        <Badge className={`${tier.badge} text-white text-[10px]`}>{tier.label}</Badge>
                        <Badge variant={t.marketplace_visible ? "default" : "secondary"} className="text-[10px]">
                          {t.marketplace_visible ? <Eye className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                        </Badge>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SPONSORS */}
        {activeTab === "sponsors" && (
          <div className="space-y-4">
            <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
              <div className="p-5 border-b border-border/50">
                <h3 className="font-heading font-semibold">Sponsor Pipeline</h3>
              </div>
              {sponsorLeads.length === 0 ? (
                <div className="p-10 text-center text-muted-foreground">No sponsor leads yet.</div>
              ) : (
                <div className="divide-y divide-border/30">
                  {sponsorLeads.map((lead, i) => (
                    <div key={lead.id} className="flex items-center gap-4 p-4">
                      <Building2 className="w-8 h-8 text-primary/50" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{lead.company_name}</p>
                        <p className="text-xs text-muted-foreground">{lead.contact_email}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="secondary" className="text-[10px] capitalize">{lead.sponsor_type}</Badge>
                          <Badge variant="secondary" className="text-[10px]">{lead.budget_range?.replace(/_/g, " ")}</Badge>
                          {lead.region_interest && <Badge variant="secondary" className="text-[10px]">{lead.region_interest}</Badge>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          lead.status === "converted" ? "default" :
                          lead.status === "qualified" ? "secondary" :
                          lead.status === "contacted" ? "outline" : "destructive"
                        } className="text-[10px] capitalize">
                          {lead.status}
                        </Badge>
                        {lead.status === "new" && (
                          <Button size="sm" variant="outline" onClick={() => updateLeadMutation.mutate({ id: lead.id, status: "contacted" })}>
                            Contact
                          </Button>
                        )}
                        {lead.status === "contacted" && (
                          <Button size="sm" variant="outline" onClick={() => updateLeadMutation.mutate({ id: lead.id, status: "qualified" })}>
                            Qualify
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TALENT POOL */}
        {activeTab === "talent" && (
          <div className="space-y-4">
            <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
              <div className="p-5 border-b border-border/50">
                <h3 className="font-heading font-semibold">All Talent Profiles</h3>
                <p className="text-xs text-muted-foreground mt-1">Admin view — full details visible</p>
              </div>
              {talentProfiles.length === 0 ? (
                <div className="p-10 text-center text-muted-foreground">No talent profiles in system.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/30 border-b border-border/50">
                        {["Alias", "Region", "Score", "Tier", "Status", "Marketplace", "Actions"].map(h => (
                          <th key={h} className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {talentProfiles.map(t => {
                        const tier = TIER_CONFIG[t.tier] || TIER_CONFIG.bronze;
                        return (
                          <tr key={t.id} className="border-b border-border/20 hover:bg-muted/10">
                            <td className="p-3 font-mono text-xs">{t.alias}</td>
                            <td className="p-3 text-xs">{t.region}</td>
                            <td className="p-3 font-bold">{t.brain_score}</td>
                            <td className="p-3">
                              <Badge className={`${tier.badge} text-white text-[10px]`}>{tier.label}</Badge>
                            </td>
                            <td className="p-3">
                              <Badge variant="secondary" className="text-[10px] capitalize">{t.status}</Badge>
                            </td>
                            <td className="p-3">
                              {t.marketplace_visible ? (
                                <Eye className="w-4 h-4 text-green-500" />
                              ) : (
                                <Shield className="w-4 h-4 text-muted-foreground" />
                              )}
                            </td>
                            <td className="p-3">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-xs h-7"
                                onClick={() => updateTalentMutation.mutate({
                                  id: t.id,
                                  data: { marketplace_visible: !t.marketplace_visible }
                                })}
                              >
                                {t.marketplace_visible ? "Hide" : "Publish"}
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}