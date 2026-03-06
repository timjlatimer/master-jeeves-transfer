import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import BingoCityWelcome from "./pages/bingo-city/BingoCityWelcome";
import BingoCityBrowse from "./pages/bingo-city/BingoCityBrowse";
import BingoCityCard from "./pages/bingo-city/BingoCityCard";
import BingoCityView3D from "./pages/bingo-city/BingoCityView3D";

function Router() {
  return (
    <Switch>
      {/* Redirect root to Bingo City welcome */}
      <Route path="/">
        <Redirect to="/bingo-city" />
      </Route>

      {/* Bingo City Routes */}
      <Route path="/bingo-city" component={BingoCityWelcome} />
      <Route path="/bingo-city/browse" component={BingoCityBrowse} />
      <Route path="/bingo-city/card/:id" component={BingoCityCard} />
      <Route path="/bingo-city/city" component={BingoCityView3D} />

      {/* Dashboard placeholder — in production this is Jeeves's existing route */}
      <Route path="/dashboard">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-white/50 text-sm font-mono">
              Mission Control Dashboard
            </p>
            <p className="text-white/30 text-xs mt-2">
              (This route is handled by Jeeves's existing app)
            </p>
            <a
              href="/bingo-city"
              className="text-[#ff8833] text-xs mt-4 inline-block hover:underline"
            >
              ← Back to Bingo City
            </a>
          </div>
        </div>
      </Route>

      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
