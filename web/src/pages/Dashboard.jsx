import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (user) {
      // Determine role from user profile or custom claims
      // user.role might be on the user object directly or nested in profile
      const role = user.role || user.profile?.role || 'Student'; // Default to Student if undefined

      console.log('Redirecting based on role:', role);

      switch (role) {
        case 'Staff':
        case 'Faculty':
          navigate('/staff/dashboard', { replace: true });
          break;
        case 'Office':
        case 'Admin':
          navigate('/office/dashboard', { replace: true });
          break;
        case 'Student':
        default:
          navigate('/student/dashboard', { replace: true });
          break;
      }
    } else {
      // If no user, AuthContext might still be loading or they are not logged in
      // App.jsx protection usually handles the "not logged in" case, but just in case:
      // navigate('/login');
    }
    setChecking(false);
  }, [user, navigate]);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
};

export default Dashboard;
