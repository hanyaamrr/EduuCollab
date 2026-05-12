import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Navigate, Link } from 'react-router-dom'; // Notice we don't even need useNavigate anymore!
import useAuth from '../../hooks/useAuth';
import { ArrowLeft } from 'lucide-react';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().required('Password is required'),
});

const Login = () => {
  const { login, user } = useAuth();
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  if (user) {
    if (user.role === 'Admin') return <Navigate to="/admin" replace />;
    if (user.role === 'GroupCreator') return <Navigate to="/creator" replace />;
    if (user.role === 'Student') return <Navigate to="/student" replace />;

    return <Navigate to="/" replace />;
  }

  const onSubmit = async (data) => {
    setApiError(''); // Clear old errors
    try {
      // 1. Send the data to the backend
      // 2. AuthContext saves the token and updates the 'user' state
      // 3. This page re-renders, hits the Master Router above, and navigates flawlessly!
      await login(data);

    } catch (err) {
      // Handle the API error securely
      const errorMsg = typeof err.response?.data === 'string'
          ? err.response.data
          : 'Invalid email or password. Please try again.';
      setApiError(errorMsg);
    }
  };

  return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.04)] border border-white/50">

          <Link
              to="/"
              className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-blue-600 transition-colors mb-6"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Groups
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome Back</h1>
            <p className="text-slate-500">Sign in to continue to EduCollab</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 ml-1">Email</label>
              <input
                  {...register('email')}
                  type="email"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  placeholder="student@university.edu"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1 ml-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 ml-1">Password</label>
              <input
                  {...register('password')}
                  type="password"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  placeholder="••••••••"
              />
              {errors.password && <p className="text-red-500 text-sm mt-1 ml-1">{errors.password.message}</p>}
            </div>

            {/* Dedicated API Error Box */}
            {apiError && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm text-center font-medium shadow-sm">
                  {apiError}
                </div>
            )}

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
  );
};

export default Login;