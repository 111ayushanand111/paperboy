import { useOutletContext, Navigate, useLocation } from 'react-router-dom';

function AdminRoute({ children }) {
  const { user } = useOutletContext();
  const location = useLocation();

  if (user === undefined) {
    return <p>Loading user data...</p>;
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}

export default AdminRoute;