import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Pages
import AgentProfileRoute from "./pages/AgentProfile";
import LandingPage from "./features/landing/LandingPage";
import RegisterPage from "./features/registration/RegisterPage";
import DashboardShell from "./features/dashboard/DashboardShell";

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={LandingPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/agents/:slug" component={AgentProfileRoute} />

      {/* Dashboard (agent-only, auth via localStorage for now) */}
      <Route path="/dashboard/:rest*" component={DashboardShell} />
      <Route path="/dashboard" component={DashboardShell} />

      {/* 404 */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
