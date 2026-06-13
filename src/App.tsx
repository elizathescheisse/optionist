import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import ProjectsRoute from "./routes/ProjectsRoute";
import ProjectRoute from "./routes/ProjectRoute";
import ReviewRoute from "./routes/ReviewRoute";
import HistoryRoute from "./routes/HistoryRoute";
import NotFoundRoute from "./routes/NotFoundRoute";

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<ProjectsRoute />} />
          <Route path="/projects/:projectId" element={<ProjectRoute />} />
          <Route path="/projects/:projectId/review/:decisionId" element={<ReviewRoute />} />
          <Route path="/history" element={<HistoryRoute />} />
          <Route path="*" element={<NotFoundRoute />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
