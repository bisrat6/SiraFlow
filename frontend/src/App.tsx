import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Features from "./pages/public/Features";
import Pricing from "./pages/public/Pricing";
import About from "./pages/public/About";
import Contact from "./pages/public/Contact";
import HelpCenter from "./pages/public/HelpCenter";
import Privacy from "./pages/public/Privacy";
import Terms from "./pages/public/Terms";
import ApiDocs from "./pages/public/ApiDocs";
import EmployerDashboard from "./pages/employer/EmployerDashboard";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import CompanyManagement from "./pages/employer/CompanyManagement";
import EmployeesManagement from "./pages/employer/EmployeesManagement";
import EmployeeDetail from "./pages/employer/EmployeeDetail";
import TimeLogsManagement from "./pages/employer/TimeLogsManagement";
import PaymentsManagement from "./pages/employer/PaymentsManagement";
import PaymentDetails from "./pages/employer/PaymentDetails";
import PayrollSummary from "./pages/employer/PayrollSummary";
import Analytics from "./pages/employer/Analytics";
import Subscription from "./pages/employer/Subscription";
import Support from "./pages/employer/Support";
import TimeLogs from "./pages/employee/TimeLogs";
import Payments from "./pages/employee/Payments";
import EmployeeSupport from "./pages/employee/Support";
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import SACompaniesManagement from "./pages/superadmin/CompaniesManagement";
import SAUsersManagement from "./pages/superadmin/UsersManagement";
import SASubscriptionsManagement from "./pages/superadmin/SubscriptionsManagement";
import SAAnalytics from "./pages/superadmin/SuperAdminAnalytics";
import SAContactsManagement from "./pages/superadmin/ContactsManagement";
import Me from "./pages/Me";
import ProtectedRoute from "./components/ProtectedRoute";
import { isAuthenticated, getCurrentUser } from "./lib/auth";

const queryClient = new QueryClient();

const App = () => {
  const user = getCurrentUser();
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={
              isAuthenticated() 
                ? <Navigate to={
                    user?.role === 'super_admin' ? '/super-admin' :
                    user?.role === 'employer' ? '/employer' : '/employee'
                  } replace />
                : <Index />
            } />
            
            {/* Auth Routes */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            
            {/* Public Pages */}
            <Route path="/features" element={<Features />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/api-docs" element={<ApiDocs />} />
            
            {/* Employer Routes */}
            <Route path="/employer" element={
              <ProtectedRoute requiredRole="employer">
                <EmployerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/employer/company" element={
              <ProtectedRoute requiredRole="employer">
                <CompanyManagement />
              </ProtectedRoute>
            } />
            <Route path="/employer/employees" element={
              <ProtectedRoute requiredRole="employer">
                <EmployeesManagement />
              </ProtectedRoute>
            } />
            <Route path="/employer/employees/:id" element={
              <ProtectedRoute requiredRole="employer">
                <EmployeeDetail />
              </ProtectedRoute>
            } />
            <Route path="/employer/timelogs" element={
              <ProtectedRoute requiredRole="employer">
                <TimeLogsManagement />
              </ProtectedRoute>
            } />
            <Route path="/employer/payments" element={
              <ProtectedRoute requiredRole="employer">
                <PaymentsManagement />
              </ProtectedRoute>
            } />
            <Route path="/employer/payments/:id" element={
              <ProtectedRoute requiredRole="employer">
                <PaymentDetails />
              </ProtectedRoute>
            } />
            <Route path="/employer/payroll-summary" element={
              <ProtectedRoute requiredRole="employer">
                <PayrollSummary />
              </ProtectedRoute>
            } />
            <Route path="/employer/analytics" element={
              <ProtectedRoute requiredRole="employer">
                <Analytics />
              </ProtectedRoute>
            } />
            <Route path="/employer/subscription" element={
              <ProtectedRoute requiredRole="employer">
                <Subscription />
              </ProtectedRoute>
            } />
            <Route path="/employer/support" element={
              <ProtectedRoute requiredRole="employer">
                <Support />
              </ProtectedRoute>
            } />
            
            {/* Super Admin Routes */}
            <Route path="/super-admin" element={
              <ProtectedRoute requiredRole="super_admin">
                <SuperAdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/super-admin/companies" element={
              <ProtectedRoute requiredRole="super_admin">
                <SACompaniesManagement />
              </ProtectedRoute>
            } />
            <Route path="/super-admin/users" element={
              <ProtectedRoute requiredRole="super_admin">
                <SAUsersManagement />
              </ProtectedRoute>
            } />
            <Route path="/super-admin/subscriptions" element={
              <ProtectedRoute requiredRole="super_admin">
                <SASubscriptionsManagement />
              </ProtectedRoute>
            } />
            <Route path="/super-admin/analytics" element={
              <ProtectedRoute requiredRole="super_admin">
                <SAAnalytics />
              </ProtectedRoute>
            } />
            <Route path="/super-admin/contacts" element={
              <ProtectedRoute requiredRole="super_admin">
                <SAContactsManagement />
              </ProtectedRoute>
            } />
            
            {/* Employee Routes */}
            <Route path="/employee" element={
              <ProtectedRoute requiredRole="employee">
                <EmployeeDashboard />
              </ProtectedRoute>
            } />
            <Route path="/employee/logs" element={
              <ProtectedRoute requiredRole="employee">
                <TimeLogs />
              </ProtectedRoute>
            } />
            <Route path="/employee/payments" element={
              <ProtectedRoute requiredRole="employee">
                <Payments />
              </ProtectedRoute>
            } />
            <Route path="/employee/support" element={
              <ProtectedRoute requiredRole="employee">
                <EmployeeSupport />
              </ProtectedRoute>
            } />
            
            {/* Profile Routes */}
            <Route path="/me" element={
              <ProtectedRoute>
                <Me />
              </ProtectedRoute>
            } />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
