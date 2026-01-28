import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, GraduationCap, Users, ArrowRight, ChevronLeft, Heart, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import createTestParent from '../utils/createTestParent';
import createTestStaff from '../utils/createTestStaff';
import { getDocs, collection, limit, query } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

const LoginScreen = () => {
  const { login } = useAuth();
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
      color: 'from-blue-500 to-indigo-600',
      bg: 'bg-indigo-50',
      icon: <GraduationCap className="h-8 w-8 text-white" />,
      shadow: 'shadow-indigo-200'
    },
    {
      id: 'Staff',
      title: 'Staff / Faculty',
      description: 'Manage students, exams & attendance',
      color: 'from-purple-500 to-pink-600',
      bg: 'bg-purple-50',
      icon: <Users className="h-8 w-8 text-white" />,
      shadow: 'shadow-purple-200'
    },
    {
      id: 'Office',
      title: 'Office / Admin',
      description: 'Administrative & fee controls',
      color: 'from-cyan-500 to-teal-600',
      bg: 'bg-cyan-50',
      icon: <Shield className="h-8 w-8 text-white" />,
      shadow: 'shadow-cyan-200'
    },
    {
      id: 'Parent',
      title: 'Parent / Guardian',
      description: 'Monitor student progress & attendance',
      color: 'from-emerald-500 to-teal-600',
      bg: 'bg-emerald-50',
      icon: <Heart className="h-8 w-8 text-white" />,
      shadow: 'shadow-emerald-200'
    },
    {
      id: 'cr',
      title: 'Class Rep',
      description: 'Manage class attendance & updates',
      color: 'from-orange-500 to-amber-600',
      bg: 'bg-orange-50',
      icon: <Crown className="h-8 w-8 text-white" />,
      shadow: 'shadow-orange-200'
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
      let errorMessage = error.message;
      if (error.code === 'auth/invalid-credential' || error.message.includes('invalid-credential')) {
        errorMessage = "Invalid credentials. Please check your email and password.";
      } else if (error.message.includes('No user record found in Firestore')) {
        errorMessage = "Access Denied: Your account is not authorized in the department database.";
      }
      alert('Login Failed: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 1. Role Selection View
  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-slate-50 relative flex flex-col justify-center items-center p-4 overflow-hidden selection:bg-indigo-100 selection:text-indigo-900 font-sans">

        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-grid-pattern z-0 opacity-50"></div>

        {/* Floating Blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-[90rem] w-full z-10 space-y-12 animate-in fade-in zoom-in duration-700 relative">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center p-4 bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl shadow-indigo-100 mb-6 border border-white animate-float">
              <GraduationCap className="h-12 w-12 text-indigo-600" />
            </div>
            <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 tracking-tighter drop-shadow-sm">
              PUDoCS
            </h1>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.3em] bg-white/50 inline-block px-4 py-1 rounded-full backdrop-blur-sm">
              Department of Computer Science
            </p>
            <h2 className="text-2xl font-medium text-slate-600 mt-8">
              Select your portal to continue
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 px-4">
            {roles.map((role, idx) => (
              <div
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className="group relative bg-white/70 backdrop-blur-lg rounded-[2.5rem] p-2 hover:-translate-y-3 transition-all duration-300 cursor-pointer shadow-xl hover:shadow-2xl hover:shadow-indigo-200/50 border border-white/60"
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${role.color} rounded-[2.5rem] opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

                <div className="relative p-6 pt-12 space-y-6 text-center z-10">
                  <div className={`mx-auto w-24 h-24 bg-gradient-to-br ${role.color} rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-100 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                    {role.icon}
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight group-hover:text-indigo-900 transition-colors">{role.title}</h3>
                    <p className="text-sm text-slate-500 font-medium mt-3 leading-relaxed px-2">
                      {role.description}
                    </p>
                  </div>

                  <div className="pt-4 pb-2">
                    <span className={`inline-flex items-center text-xs font-extra-bold uppercase tracking-wider py-3 px-6 rounded-xl bg-white shadow-sm border border-slate-100 group-hover:bg-slate-50 text-slate-600 transition-colors`}>
                      Login <ArrowRight className="ml-2 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-12">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest hover:text-indigo-500 transition-colors cursor-default">
              © 2026 Pondicherry University
            </p>

          </div>
        </div>
      </div>
    );
  }

  // 2. Login Form View
  const activeRole = roles.find(r => r.id === selectedRole);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-grid-pattern z-0 opacity-50"></div>

      {/* Animated Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className={`absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br ${activeRole?.color} opacity-20 blur-[100px] animate-blob`}></div>
        <div className={`absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tl ${activeRole?.color} opacity-20 blur-[100px] animate-blob animation-delay-2000`}></div>
      </div>

      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-indigo-100/50 overflow-hidden border border-white z-10 animate-in slide-in-from-bottom-10 fade-in duration-500 relative">
        {/* Decorative top bar */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${activeRole?.color}`}></div>

        <div className="px-8 pt-8 pb-10">
          <button
            onClick={() => setSelectedRole(null)}
            className="group flex items-center text-xs font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-wider mb-8 transition-colors"
          >
            <div className="p-1.5 rounded-full bg-slate-50 border border-slate-100 mr-2 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
              <ChevronLeft className="w-3 h-3" />
            </div>
            Choose Role
          </button>

          <div className="mb-10 text-center">
            <div className={`inline-flex mb-6 p-4 rounded-3xl bg-gradient-to-br ${activeRole?.color} shadow-lg shadow-indigo-200 transform hover:scale-105 transition-transform`}>
              {React.cloneElement(activeRole?.icon, { className: "h-10 w-10 text-white" })}
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
            <p className="text-slate-500 font-medium text-sm mt-3 px-4 leading-relaxed">
              Please sign in to access your <span className={`text-transparent bg-clip-text bg-gradient-to-r ${activeRole?.color} font-bold`}>{activeRole?.title}</span> dashboard
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">University Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50/50 border-2 border-slate-100 text-slate-900 font-bold rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-300 placeholder:font-medium"
                placeholder="user@pondiuni.ac.in"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50/50 border-2 border-slate-100 text-slate-900 font-bold rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-300 placeholder:font-medium"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 text-white font-bold text-lg rounded-2xl shadow-xl shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-1 active:scale-[0.98] transition-all bg-gradient-to-r ${activeRole?.color} disabled:opacity-50 disabled:cursor-not-allowed mt-6`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
