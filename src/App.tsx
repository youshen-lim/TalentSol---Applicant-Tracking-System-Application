import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import CandidatePipeline from "./pages/CandidatePipeline";
import Interviews from "./pages/Interviews";
import Jobs from "./pages/Jobs";
import Applications from "./pages/Applications";
import Messages from "./pages/Messages";
import Documents from "./pages/Documents";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import ProfileEnhanced from "./pages/ProfileEnhanced";
import Help from "./pages/Help";
import HiresCurrentQuarter from "./pages/analytics/reports/HiresCurrentQuarter";
import PipelineMetrics from "./pages/analytics/reports/PipelineMetrics";
import TimeToHire from "./pages/analytics/reports/TimeToHire";
import SourceEffectiveness from "./pages/analytics/reports/SourceEffectiveness";

// For example components (keeping these for development/testing purposes)
import { ToastExample } from '@/components/examples/ToastExample';
import { TooltipExample } from '@/components/examples/TooltipExample';
import { ToastImportExample } from '@/components/examples/ToastImportExample';
import { ToggleGroupExample } from '@/components/examples/ToggleGroupExample';
import { MobileDetectionExample } from '@/components/examples/MobileDetectionExample';
import { EnhancedToastExample } from '@/components/examples/EnhancedToastExample';
import { UtilsExample } from '@/components/examples/UtilsExample';



// Create a QueryClient instance
const queryClient = new QueryClient();

// Example components page for development/testing purposes
const ExamplesPage = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold text-primary">TalentSol</h1>
      <p className="mt-2 text-xl text-muted-foreground">The Modern Applicant Tracking System</p>
    </div>

    {/* Component Examples */}
    <div className="w-full max-w-3xl space-y-8">
      <UtilsExample />
      <EnhancedToastExample />
      <ToastExample />
      <TooltipExample />
      <ToastImportExample />
      <ToggleGroupExample />
      <MobileDetectionExample />
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster variant="ats-blue" />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/candidates/pipeline" element={<CandidatePipeline />} />
            <Route path="/candidates/all" element={<CandidatePipeline />} />
            <Route path="/interviews" element={<Interviews />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/analytics/reports/hires-current-quarter" element={<HiresCurrentQuarter />} />
            <Route path="/analytics/reports/pipeline-metrics" element={<PipelineMetrics />} />
            <Route path="/analytics/reports/time-to-hire" element={<TimeToHire />} />
            <Route path="/analytics/reports/source-effectiveness" element={<SourceEffectiveness />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<ProfileEnhanced />} />
            <Route path="/help" element={<Help />} />
          </Route>
          <Route path="/examples" element={<ExamplesPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
