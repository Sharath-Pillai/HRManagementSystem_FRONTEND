import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute, PublicRoute, RoleRoute } from './ProtectedRoute'
import AuthLayout from '../layouts/AuthLayout'
import MainLayout from '../layouts/MainLayout'

// Auth Pages
import Login from '../pages/auth/Login'
import ForgotPassword from '../pages/auth/ForgotPassword'
import ResetPassword from '../pages/auth/ResetPassword'

// Main Pages
import Dashboard from '../pages/dashboard/Dashboard'
import Employees from '../pages/employees/Employees'
import EmployeeDetail from '../pages/employees/EmployeeDetail'
import AddEditEmployee from '../pages/employees/AddEditEmployee'
import Departments from '../pages/departments/Departments'
import Attendance from '../pages/attendance/Attendance'
import AttendanceReport from '../pages/attendance/AttendanceReport'
import Leaves from '../pages/leaves/Leaves'
import LeaveRequest from '../pages/leaves/LeaveRequest'
import Payroll from '../pages/payroll/Payroll'
import SalarySlip from '../pages/payroll/SalarySlip'
import Recruitment from '../pages/recruitment/Recruitment'
import Performance from '../pages/performance/Performance'
import Documents from '../pages/documents/Documents'
import Profile from '../pages/profile/Profile'
import Settings from '../pages/settings/Settings'
import Notifications from '../pages/notifications/Notifications'

const AppRoutes = () => (
  <Routes>
    {/* Public routes */}
    <Route element={<PublicRoute />}>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>
    </Route>

    {/* Protected routes */}
    <Route element={<ProtectedRoute />}>
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/leaves" element={<Leaves />} />
        <Route path="/leaves/request" element={<LeaveRequest />} />
        <Route path="/payroll" element={<Payroll />} />
        <Route path="/payroll/:id" element={<SalarySlip />} />

        {/* HR / Manager routes */}
        <Route element={<RoleRoute roles={['superadmin', 'hr', 'manager']} />}>
          <Route path="/employees" element={<Employees />} />
          <Route path="/employees/:id" element={<EmployeeDetail />} />
          <Route path="/attendance/report" element={<AttendanceReport />} />
        </Route>

        {/* HR / Super Admin only */}
        <Route element={<RoleRoute roles={['superadmin', 'hr']} />}>
          <Route path="/employees/new" element={<AddEditEmployee />} />
          <Route path="/employees/:id/edit" element={<AddEditEmployee />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/recruitment" element={<Recruitment />} />
          <Route path="/performance" element={<Performance />} />
          <Route path="/documents" element={<Documents />} />
        </Route>
      </Route>
    </Route>

    {/* Fallback */}
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
)

export default AppRoutes
