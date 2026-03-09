import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Candidates } from "./pages/Candidates";
import { Jobs } from "./pages/Jobs";
import { Applications } from "./pages/Applications";
import { Interviews } from "./pages/Interviews";
import { Analytics } from "./pages/Analytics";
import { SourceEffectiveness } from "./pages/analytics/SourceEffectiveness";
import { TimeToHire } from "./pages/analytics/TimeToHire";
import { PipelineMetrics } from "./pages/analytics/PipelineMetrics";
import { ReportBuilder } from "./pages/analytics/ReportBuilder";
import { Messages } from "./pages/Messages";
import { Documents } from "./pages/Documents";
import { Settings } from "./pages/Settings";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "dashboard", Component: Dashboard },
      { path: "candidates", Component: Candidates },
      { path: "jobs", Component: Jobs },
      { path: "applications", Component: Applications },
      { path: "interviews", Component: Interviews },
      { path: "analytics", Component: Analytics },
      { path: "analytics/source-effectiveness", Component: SourceEffectiveness },
      { path: "analytics/time-to-hire", Component: TimeToHire },
      { path: "analytics/pipeline-metrics", Component: PipelineMetrics },
      { path: "analytics/reports", Component: ReportBuilder },
      { path: "messages", Component: Messages },
      { path: "documents", Component: Documents },
      { path: "settings", Component: Settings },
    ],
  },
]);
