import { Navigate, Route, Routes } from "react-router";
import SignIn from "./pages/SignIn";
import DashboardShell from "./layout/DashboardShell";
import GymsPage from "./pages/management/gyms";
import CoachesPage from "./pages/management/coachesPage";
import SubscriptionsPage from "./pages/management/subscriptionsPage";
import InvitationsPage from "./pages/management/invitationsPage";
import ActivityPage from "./pages/management/ActivityPage";
import ManagementOverviewPage from "./pages/management/ManagementOverviewPage";
import AdminDashboard from "./pages/admin";
import AdminMembersPage from "./pages/admin/MembersPage";
import CoachDashboard from "./pages/coach";
import CoachExercisesPage from "./pages/coach/ExercisesPage";
import Placeholder from "./pages/Placeholder";

export default function App() {
  return (
    <Routes>
      <Route index element={<SignIn />} />
      <Route path="sign-in" element={<SignIn />} />

      {/* Platform admin (super admin only — roles=[] means isSuperAdmin gate) */}
      <Route
        path="management"
        element={
          <DashboardShell section="management" />
        }
      >
        <Route index element={<ManagementOverviewPage />} />
        <Route path="gyms" element={<GymsPage />} />
        <Route path="coaches" element={<CoachesPage />} />
        <Route path="subscriptions" element={<SubscriptionsPage />} />
        <Route path="invitations" element={<InvitationsPage />} />
        <Route path="activity" element={<ActivityPage />} />
        <Route path="quotas" element={<Placeholder title="Quotas" />} />
      </Route>

      {/* Role homes — ported incrementally */}
      <Route
        path="admin"
        element={
          <DashboardShell section="admin" />
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="members" element={<AdminMembersPage />} />
      </Route>
      <Route
        path="coach"
        element={
          <DashboardShell section="coach" />
        }
      >
        <Route index element={<CoachDashboard />} />
        <Route path="exercises" element={<CoachExercisesPage />} />
      </Route>
      <Route
        path="member/*"
        element={
          <DashboardShell section="management" />
        }
      />
      <Route
        path="client/*"
        element={
          <DashboardShell section="management" />
        }
      />

      <Route path="*" element={<Navigate to="/sign-in" replace />} />
    </Routes>
  );
}
