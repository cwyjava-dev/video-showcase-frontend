import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import VideoDetail from "./pages/VideoDetail";
import AdminDashboard from "./pages/AdminDashboard";
import AdminVideos from "./pages/AdminVideos";
import AdminCategories from "./pages/AdminCategories";
import AdminTags from "./pages/AdminTags";
import AdminUsers from "./pages/AdminUsers";
import Login from "./pages/Login";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/video/:id"} component={VideoDetail} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/admin/videos"} component={AdminVideos} />
      <Route path={"/admin/categories"} component={AdminCategories} />
      <Route path={"/admin/tags"} component={AdminTags} />
      <Route path={"/admin/users"} component={AdminUsers} />
      <Route path={"/admin/:section"} component={AdminDashboard} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable={true}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
