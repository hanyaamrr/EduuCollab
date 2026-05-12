import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { User, BookOpen, ArrowLeft } from 'lucide-react'; // <-- Added ArrowLeft

const schema = yup.object().shape({
  username: yup.string().required('Username is required').min(3, 'Too short'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required').min(6, 'Min 6 characters'),
  role: yup.number().required('Please select a role'),
});

const Signup = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting }, setError } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { role: 1 }
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    try {
      await api.post('/register', data);
      navigate('/login');
    } catch (err) {
      setError('root', { message: err.response?.data || 'Registration failed.' });
    }
  };

  return (
      <div className="flex justify-center items-center min-h-[80vh] px-4">
        <div className="w-full max-w-lg bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.04)] border border-white/50">

          {/* --- NEW BACK BUTTON --- */}
          <Link
              to="/"
              className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-blue-600 transition-colors mb-6"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Groups
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Create Account</h1>
            <p className="text-slate-500">Join EduCollab today.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Role Selection Toggle */}
            <div className="flex gap-4 mb-6">
              <button
                  type="button"
                  onClick={() => setValue('role', 1)}
                  className={`flex-1 flex flex-col items-center p-4 rounded-3xl border-2 transition-all duration-300 ${
                      selectedRole === 1 ? 'border-blue-500 bg-blue-50/50 text-blue-700 shadow-md' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                  }`}
              >
                <BookOpen size={28} className="mb-2" />
                <span className="font-semibold text-sm">Student</span>
              </button>
              <button
                  type="button"
                  onClick={() => setValue('role', 2)}
                  className={`flex-1 flex flex-col items-center p-4 rounded-3xl border-2 transition-all duration-300 ${
                      selectedRole === 2 ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700 shadow-md' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                  }`}
              >
                <User size={28} className="mb-2" />
                <span className="font-semibold text-sm">Group Creator</span>
              </button>
            </div>

            <div>
              <input {...register('username')} placeholder="Username" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none" />
              {errors.username && <p className="text-red-500 text-sm mt-1 ml-1">{errors.username.message}</p>}
            </div>

            <div>
              <input {...register('email')} type="email" placeholder="Email Address" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-all" />
              {errors.email && <p className="text-red-500 text-sm mt-1 ml-1">{errors.email.message}</p>}
            </div>

            <div>
              <input {...register('password')} type="password" placeholder="Password" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-all" />
              {errors.password && <p className="text-red-500 text-sm mt-1 ml-1">{errors.password.message}</p>}
            </div>

            {errors.root && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm text-center">{errors.root.message}</div>}

            <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-2xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 mt-4">
              {isSubmitting ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-slate-500">
            Already have an account? <Link to="/login" className="text-blue-600 font-semibold hover:underline">Log in</Link>
          </p>
        </div>
      </div>
  );
};

export default Signup;