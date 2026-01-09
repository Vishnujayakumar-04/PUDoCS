import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, GraduationCap, Users, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginScreen = () => {
  const { login, register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const roles = [
    {
      id: 'Student',
      title: 'Student',
      description: 'Access profile, timetable & results',
      color: 'bg-indigo-50 border-indigo-500',
      icon: <GraduationCap className="h-6 w-6 text-indigo-600" />,
      hover: 'hover:border-indigo-600 hover:shadow-md'
    },
    {
      id: 'Staff',
      title: 'Staff / Faculty',
      description: 'Manage students, exams & attendance',
      color: 'bg-purple-50 border-purple-500',
      icon: <Users className="h-6 w-6 text-purple-600" />,
      hover: 'hover:border-purple-600 hover:shadow-md'
    },
    {
      id: 'Office',
      title: 'Office / Admin',
      description: 'Administrative & fee controls',
      color: 'bg-cyan-50 border-cyan-500',
      icon: <Shield className="h-6 w-6 text-cyan-600" />,
      hover: 'hover:border-cyan-600 hover:shadow-md'
    },
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password, selectedRole);
      navigate('/dashboard');
    } catch (error) {
      console.log("Login error:", error);

      const isDefaultAccount = (selectedRole === 'Staff' && email === 'staff@pondiuni.ac.in') ||
        (selectedRole === 'Office' && email === 'office@pondiuni.ac.in');

      // Check for common firebase error codes for non-existent users
      const isUserNotFound = error.code === 'auth/user-not-found' ||
        error.code === 'auth/invalid-credential' ||
        error.message.includes('invalid-credential');

      if (isDefaultAccount && isUserNotFound) {
        try {
          if (window.confirm("Account not found. Create this default account now?")) {
            await register(email, password, selectedRole);
            alert("Account created! Logging you in...");
            navigate('/dashboard');
            return;
          }
        } catch (regError) {
          alert("Registration failed: " + regError.message);
        }
      } else {
        alert('Login Failed: ' + (error.code || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  // 1. Role Selection View
  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col justify-center items-center p-4">
        <div className="max-w-5xl w-full space-y-8">
          <div className="text-center">
            <h1 className="text-5xl font-extrabold text-blue-900 tracking-tight">PUDoCS</h1>
            <p className="mt-2 text-sm text-gray-600 uppercase tracking-widest font-semibold">
              Department of Computer Science
            </p>
            <h2 className="mt-8 text-2xl font-medium text-gray-700">
              Select your role to continue
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {roles.map((role) => (
              <div
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-2"
              >
                <div className="relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
                  <img
                    src={`/assets/roles/${role.id.toLowerCase()}.png`}
                    alt={role.title}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                    <div className="text-center text-white">
                      <p className="text-sm font-medium">{role.description}</p>
                      <div className="mt-2 flex items-center justify-center space-x-2">
                        <span className="text-xs">Click to continue</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <h3 className="text-xl font-bold text-gray-800">{role.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{role.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-xs text-gray-400">© 2026 Pondicherry University</p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Login Form View
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-8 pt-8 pb-6">
          <button
            onClick={() => setSelectedRole(null)}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center mb-6 transition-colors"
          >
            ← Back to Role Selection
          </button>

          <div className="mb-8">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-2 ${selectedRole === 'Student' ? 'bg-indigo-100 text-indigo-700' : selectedRole === 'Staff' ? 'bg-purple-100 text-purple-700' : 'bg-cyan-100 text-cyan-700'}`}>
              {selectedRole}
            </span>
            <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-gray-500 text-sm mt-1">Enter your credentials to access the portal.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">University Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="e.g. user@pondiuni.ac.in"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Authenticating...' : 'Login'}
            </button>
          </form>
        </div>

        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
          <p className="text-xs text-center text-gray-500">
            Use your official University ID & Password
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
