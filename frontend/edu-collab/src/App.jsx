import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './routes/ProtectedRoute';

// Pages
import Login from './pages/public/Login';
import Signup from './pages/public/Signup';
import BrowseGroups from './pages/public/BrowseGroups';
import GroupDetails from './pages/shared/GroupDetails';
import CreatorDashboard from './pages/creator/CreatorDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import Unauthorized from './pages/public/Unauthorized'; // <-- Added import

function App() {
  return (
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public & Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/unauthorized" element={<Unauthorized />} /> {/* <-- Added route */}

            {/* Routes wrapped in the MainLayout (Floating Dock) */}
            <Route element={<MainLayout />}>
              <Route element={<ProtectedRoute allowedRoles={['Student']} />}>
                <Route path="/student" element={<StudentDashboard />} /> {/* Make sure to import StudentDashboard! */}
              </Route>
              <Route path="/" element={<BrowseGroups />} />

              {/* Student Routes (Assuming Student is default logged-in view) */}
              <Route element={<ProtectedRoute allowedRoles={['Student', 'GroupCreator']} />}>
                <Route path="/group/:id" element={<GroupDetails />} />
              </Route>

              {/* Group Creator Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={['GroupCreator']} />}>
                <Route path="/creator" element={<CreatorDashboard />} />
              </Route>

              {/* Admin Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
  );
}

export default App;