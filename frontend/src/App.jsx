import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";

// --- Lazy Load Pages for Better Performance ---
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const FieldOfficerDashboard = lazy(() => import("./pages/FieldOfficerDashboard"));
const HomePage = lazy(() => import("./pages/HomePage"));
const WellsList = lazy(() => import("./pages/WellsList"));
const AddWell = lazy(() => import("./pages/AddWell"));
const EditWell = lazy(() => import("./pages/EditWell"));
const WellDetails = lazy(() => import("./pages/WellDetails"));
const MaintenanceList = lazy(() => import('./pages/MaintenanceList'));
const MaintenanceForm = lazy(() => import('./pages/MaintenanceForm'));
const MaintenanceDetails = lazy(() => import('./pages/MaintenanceDetails'));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const AddWellReport = lazy(() => import("./pages/AddWellReport"));
const AddComments = lazy(() => import("./pages/AddComments"));
const WellReportDetails = lazy(() => import("./pages/WellReportDetails"));
const UpdateWellReport = lazy(() => import("./pages/UpdateWellReport"));
const CommentsPage = lazy(() => import("./pages/CommentsPage"));
const MaintenanceMap = lazy(() => import("./pages/MaintenanceMap"));
const LabTesterDashboard = lazy(() => import("./pages/LabTesterDashboard"));
const WaterQuality = lazy(() => import("./pages/WaterQuality"));
const AddWaterTest = lazy(() => import("./pages/AddWaterTest"));
const WaterQualityDetails = lazy(() => import("./pages/WaterQualityDetails"));
const EditWaterTest = lazy(() => import("./pages/EditWaterTest"));


function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* --- Public Landing Page (HomePage) --- */}
        <Route path="/" element={
          !user ? <Login /> : 
            user.role === "admin" ? <Navigate to="/admin" /> :
              user.role === "field_officer" ? <Navigate to="/officer-dashboard" /> :
                user.role === "lab_tester" ? <Navigate to="/lab-dashboard" /> :
                (user.role === "customer" || user.role === "communityUser") ? <Navigate to="/home" /> :
                <Navigate to="/home" />
        } />
        
        {/* Public Routes */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />

        {/* --- Protected Routes --- */}
        
        {/* Admin Section */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        {/* Wells Management */}
        <Route path="/wells" element={<WellsList />} />
        {/* ... remaining routes ... */}
        <Route path="/wells/add" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AddWell />
          </ProtectedRoute>
        } />
        <Route path="/wells/edit/:id" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <EditWell />
          </ProtectedRoute>
        } />
        <Route path="/wells/:id" element={<WellDetails />} />

        {/* Officer Specific */}
        <Route path="/officer-dashboard" element={
          <ProtectedRoute allowedRoles={["field_officer"]}>
            <FieldOfficerDashboard />
          </ProtectedRoute>
        } />
        
        {/* Customer/Home */}
        <Route path="/home" element={
          <ProtectedRoute allowedRoles={["customer", "communityUser"]}>
            <HomePage />
          </ProtectedRoute>
        } />

        {/* Maintenance */}
        <Route path="/maintenance" element={
          <ProtectedRoute allowedRoles={["admin", "field_officer", "customer", "communityUser"]}>
            <MaintenanceList />
          </ProtectedRoute>
        } />
        <Route path="/maintenance/map" element={
          <ProtectedRoute allowedRoles={["admin", "field_officer"]}>
            <MaintenanceMap />
          </ProtectedRoute>
        } />
        <Route path="/maintenance/new" element={
          <ProtectedRoute allowedRoles={["admin", "field_officer", "customer", "communityUser"]}>
            <MaintenanceForm />
          </ProtectedRoute>
        } />
        <Route path="/maintenance/:id" element={
          <ProtectedRoute allowedRoles={["admin", "field_officer", "customer", "communityUser"]}>
            <MaintenanceDetails />
          </ProtectedRoute>
        } />

        {/* Reports & Comments */}
        <Route path="/reports" element={
          <ProtectedRoute allowedRoles={["admin", "field_officer", "customer", "communityUser"]}>
            <ReportsPage />
          </ProtectedRoute>
        } />
        <Route path="/reports/:id" element={
          <ProtectedRoute allowedRoles={["admin", "field_officer", "customer", "communityUser"]}>
            <WellReportDetails />
          </ProtectedRoute>
        } />
        <Route path="/add-report" element={
          <ProtectedRoute allowedRoles={["admin", "field_officer"]}>
            <AddWellReport />
          </ProtectedRoute>
        } />
        <Route path="/update-report/:id" element={
          <ProtectedRoute allowedRoles={["admin", "field_officer"]}>
            <UpdateWellReport />
          </ProtectedRoute>
        } />
        <Route path="/comments" element={
          <ProtectedRoute allowedRoles={["admin", "field_officer", "customer", "communityUser"]}>
            <CommentsPage />
          </ProtectedRoute>
        } />
        <Route path="/add-comment/:id" element={
          <ProtectedRoute allowedRoles={["admin", "field_officer"]}>
            <AddComments />
          </ProtectedRoute>
        } />

        {/* Lab Tester Routes */}
        <Route path="/lab-dashboard" element={
          <ProtectedRoute allowedRoles={["lab_tester"]}>
            <LabTesterDashboard />
          </ProtectedRoute>
        } />
        <Route path="/water-quality" element={
          <ProtectedRoute allowedRoles={["lab_tester"]}>
            <WaterQuality />
          </ProtectedRoute>
        } />
        <Route path="/water-quality/add" element={
          <ProtectedRoute allowedRoles={["lab_tester"]}>
            <AddWaterTest />
          </ProtectedRoute>
        } />
        <Route path="/water-quality/:id" element={
          <ProtectedRoute allowedRoles={["lab_tester", "admin"]}>
            <WaterQualityDetails />
          </ProtectedRoute>
        } />
        <Route path="/water-quality/edit/:id" element={
          <ProtectedRoute allowedRoles={["lab_tester"]}>
            <EditWaterTest />
          </ProtectedRoute>
        } />

        {/* 404 Catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
