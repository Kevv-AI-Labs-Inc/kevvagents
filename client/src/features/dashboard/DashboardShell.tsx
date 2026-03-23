import { useState, useEffect } from "react";
import { useLocation, Route, Switch } from "wouter";
import { Button } from "@/components/ui/button";
import { BarChart3, ExternalLink, LayoutDashboard, LogOut, PanelLeft, User, Users } from "lucide-react";
import DashboardPage from "./DashboardPage";
import LeadsPage from "./LeadsPage";
import ProfileEditor from "./ProfileEditor";

const MENU_ITEMS = [
  { icon: LayoutDashboard, label: "Overview", path: "/dashboard" },
  { icon: Users, label: "Leads", path: "/dashboard/leads" },
  { icon: User, label: "Profile", path: "/dashboard/profile" },
];

export default function DashboardShell() {
  const [location, navigate] = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // Get agent slug from localStorage (set during registration)
  const [agentSlug, setAgentSlug] = useState<string | null>(null);

  useEffect(() => {
    const slug = localStorage.getItem("kevv-agent-slug");
    setAgentSlug(slug);
  }, []);

  // No agent slug — redirect to register
  if (agentSlug === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-foreground">
        <h1 className="text-2xl font-heading font-bold">Loading Dashboard...</h1>
      </div>
    );
  }

  if (!agentSlug) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-background text-foreground p-8">
        <h1 className="text-3xl font-heading font-bold">No Agent Profile Found</h1>
        <p className="text-muted-foreground text-center max-w-md">
          Please create an agent page first to access the dashboard.
        </p>
        <Button onClick={() => navigate("/register")} size="lg" className="font-bold">
          Create Agent Page
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Sidebar */}
      <aside className={`${collapsed ? "w-16" : "w-64"} border-r bg-card transition-all duration-300 flex flex-col`}>
        {/* Header */}
        <div className="h-16 flex items-center px-4 border-b">
          <button onClick={() => setCollapsed(!collapsed)} className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded-lg">
            <PanelLeft className="h-4 w-4" />
          </button>
          {!collapsed && (
            <span className="ml-3 font-heading font-bold text-sm tracking-widest">KEVV</span>
          )}
        </div>

        {/* Menu */}
        <nav className="flex-1 p-2 space-y-1">
          {MENU_ITEMS.map((item) => {
            const isActive = location === item.path || (item.path !== "/dashboard" && location.startsWith(item.path));
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : ""}`} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-2 border-t space-y-1">
          <a
            href={`/agents/${agentSlug}`}
            target="_blank"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
          >
            <ExternalLink className="h-4 w-4 shrink-0" />
            {!collapsed && <span>View My Page</span>}
          </a>
          <button
            onClick={() => {
              localStorage.removeItem("kevv-agent-slug");
              localStorage.removeItem("kevv-agent-email");
              navigate("/");
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <Switch>
          <Route path="/dashboard" component={() => <DashboardPage agentSlug={agentSlug} />} />
          <Route path="/dashboard/leads" component={() => <LeadsPage agentSlug={agentSlug} />} />
          <Route path="/dashboard/profile" component={() => <ProfileEditor agentSlug={agentSlug} />} />
        </Switch>
      </main>
    </div>
  );
}
