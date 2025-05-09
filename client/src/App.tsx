import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import PackagesPage from "@/pages/packages";
import PackageDetailPage from "@/pages/package-detail";
import DocumentationPage from "@/pages/documentation";
import PlaygroundPage from "@/pages/playground";
import PublishPackagePage from "@/pages/publish-package";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/playground" component={PlaygroundPage} />
      <Route path="/packages" component={PackagesPage} />
      <Route path="/packages/:id" component={PackageDetailPage} />
      <Route path="/documentation" component={DocumentationPage} />
      <Route path="/publish" component={PublishPackagePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
