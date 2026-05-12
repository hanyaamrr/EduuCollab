import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link, Navigate } from 'react-router-dom'; // <-- Add Navigate here
import useAuth from '../../hooks/useAuth';
import { ArrowLeft } from 'lucide-react';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().required('Password is required'),
});

const Login = () => {
  const { login, user } = useAuth(); // <-- Extract 'user' from useAuth here
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: yupResolver(schema),
  });

  // --- SAFEGUARD: If they are already logged in, bounce them away from the login page! ---
  // --- SAFEGUARD: If they are already logged in, bounce them away! ---
  if (user) {
    if (user.role === 'Admin') return <Navigate to="/admin" replace />;
    if (user.role === 'GroupCreator') return <Navigate to="/creator" replace />;
    if (user.role === 'Student') return <Navigate to="/student" replace />; // <--- ADD THIS LINE!
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (data) => {
    try {
      const userRole = await login(data);

      // THE TRUTH TELLER: Let's see exactly what the backend thinks this user is!
      console.log("THE ROLE FOR THIS USER IS:", userRole);

      // Navigate based on the exact string
      if (userRole === 'Admin') {
        navigate('/admin', { replace: true });
      } else if (userRole === 'GroupCreator') {
        navigate('/creator', { replace: true });
      } else if (userRole === 'Student') {
        navigate('/student', { replace: true });
      } else {
        // If it doesn't match any of the above, it falls back here!
        navigate('/', { replace: true });
      }

    } catch (err) {
      setError('root', {
        message: err.response?.data || 'Invalid username or password!',
      });
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

            {errors.root && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm text-center">
                  {errors.root.message}
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