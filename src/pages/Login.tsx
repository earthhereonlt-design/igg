import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { fetchAPI } from '../lib/api';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const data = await fetchAPI(endpoint, {
        method: 'POST',
        body: JSON.stringify({ 
          username, 
          password,
          // Auto assign admin if credentials match
          isAdmin: !isLogin && username === 'aadi' && password === 'earth' 
        })
      });
      
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card w-full max-w-md p-8"
      >
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FF6600] to-[#2997FF]" />
        </div>
        
        <h1 className="text-3xl font-bold text-center mb-8 tracking-tight">
          {isLogin ? 'Welcome back' : 'Create account'}
        </h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[var(--border)] border border-transparent focus:border-[#2997FF] focus:bg-transparent rounded-xl p-4 outline-none transition-all"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[var(--border)] border border-transparent focus:border-[#2997FF] focus:bg-transparent rounded-xl p-4 outline-none transition-all"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#2997FF] to-[#0071E3] hover:opacity-90 text-white font-medium rounded-xl p-4 flex justify-center items-center transition-opacity"
          >
            {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-[var(--text-sec)]">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-[#2997FF] font-medium hover:underline"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
