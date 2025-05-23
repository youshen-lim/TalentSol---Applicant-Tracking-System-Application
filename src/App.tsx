import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DragDropContext } from 'react-beautiful-dnd';
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import CandidatePipeline from "./pages/CandidatePipeline";
import Interviews from "./pages/Interviews";
import Jobs from "./pages/Jobs";
import Messages from "./pages/Messages";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";

// For example components (keeping these for development/testing purposes)
import { ToastExample } from '@/components/examples/ToastExample';
import { TooltipExample } from '@/components/examples/TooltipExample';
import { ToastImportExample } from '@/components/examples/ToastImportExample';
import { ToggleGroupExample } from '@/components/examples/ToggleGroupExample';
import { MobileDetectionExample } from '@/components/examples/MobileDetectionExample';
import { EnhancedToastExample } from '@/components/examples/EnhancedToastExample';
import { UtilsExample } from '@/components/examples/UtilsExample';

// Create a wrapper component for DragDropContext
const DragDropContextProvider = ({ children }: { children: React.ReactNode }) => {
  const onDragEnd = () => {
    // This is just a placeholder. The actual implementation will be in the KanbanBoard component
  };

  return <DragDropContext onDragEnd={onDragEnd}>{children}</DragDropContext>;
};

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
      <DragDropContextProvider>
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
              <Route path="/messages" element={<Messages />} />
            </Route>
            <Route path="/examples" element={<ExamplesPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </DragDropContextProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
