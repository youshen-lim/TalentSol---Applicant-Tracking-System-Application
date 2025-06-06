import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ABTestProvider } from "@/hooks/useABTest";
import ABTestPanel from "@/components/admin/ABTestPanel";
import { StoreProvider } from "@/store/StoreProvider";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Candidates from "./pages/Candidates";
import Interviews from "./pages/Interviews";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import JobEdit from "./pages/JobEdit";
import ApplicationManagement from "./pages/ApplicationManagement";
import ApplicationFormPreview from "./pages/ApplicationFormPreview";
import PublicApplicationPage from "./pages/PublicApplicationPage";
import ProfileManagement from "./pages/ProfileManagement";
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
import TestApplicationSources from './pages/TestApplicationSources';



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
    <StoreProvider>
      <ABTestProvider>
        <TooltipProvider>
          <Toaster variant="ats-blue" />
          <Sonner />
          <BrowserRouter>
          <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/apply/:formSlug" element={<PublicApplicationPage />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/candidates" element={<Candidates />} />
            <Route path="/interviews" element={<Interviews />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/jobs/:id/edit" element={<JobEdit />} />
            <Route path="/applications" element={<ApplicationManagement />} />
            <Route path="/applications/preview" element={<ApplicationFormPreview />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/analytics/reports/hires-current-quarter" element={<HiresCurrentQuarter />} />
            <Route path="/analytics/reports/pipeline-metrics" element={<PipelineMetrics />} />
            <Route path="/analytics/reports/time-to-hire" element={<TimeToHire />} />
            <Route path="/analytics/reports/source-effectiveness" element={<SourceEffectiveness />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<ProfileEnhanced />} />
            <Route path="/profile/management" element={<ProfileManagement />} />
            <Route path="/help" element={<Help />} />
          </Route>
          <Route path="/examples" element={<ExamplesPage />} />
          <Route path="/test-sources" element={<TestApplicationSources />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
          <ABTestPanel />
        </BrowserRouter>
      </TooltipProvider>
    </ABTestProvider>
    <ReactQueryDevtools initialIsOpen={false} />
  </StoreProvider>
  </QueryClientProvider>
);

export default App;
