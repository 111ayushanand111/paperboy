import { useOutletContext, Navigate, useLocation } from 'react-router-dom';

function AdminRoute({ children }) {
  const { user } = useOutletContext();
  const location = useLocation();

  // Show a loading message while user data is being fetched
  if (user === undefined) {
    return <p>Loading user data...</p>;
  }

  // If user is not logged in, or is logged in but not an admin
  if (!user || user.role !== 'admin') {
    // Redirect them to the home page
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If they are an admin, show the page
  return children;
}

export default AdminRoute;