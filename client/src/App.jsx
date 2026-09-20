import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import MainLayout from './layouts/MainLayout';
import { useAuth } from './context/AuthContext';

import Home from './pages/Home';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import MyRegistrations from './pages/MyRegistrations';
import AdminDashboard from './pages/AdminDashboard';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';

const RouteLoading = () => (
  <div className="route-loading-screen" role="status" aria-live="polite">
    <div className="route-loading-mark">E</div>
    <div className="route-loading-line" />
    <p>Loading EventHub…</p>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { loading, isAuthenticated } = useAuth();

  if (loading) return <RouteLoading />;

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { loading, user } = useAuth();

  if (loading) return <RouteLoading />;

  if (!user) return <Navigate to="/login" replace />;

  return user.role === 'admin'
    ? children
    : <Navigate to="/" replace />;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:eventId" element={<EventDetails />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/my-registrations"
          element={(
            <ProtectedRoute>
              <MyRegistrations />
            </ProtectedRoute>
          )}
        />

        <Route
          path="/admin-dashboard"
          element={(
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          )}
        />

        <Route
          path="/create-event"
          element={(
            <AdminRoute>
              <CreateEvent />
            </AdminRoute>
          )}
        />

        <Route
          path="/edit-event/:eventId"
          element={(
            <AdminRoute>
              <EditEvent />
            </AdminRoute>
          )}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
    </BrowserRouter>
  );
};

export default App;
