'use client';

import { useAuth } from '@/hooks/use-auth';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import AuthGuard from '@/components/auth/auth-guard';
import { motion } from 'framer-motion';
import { LogOut, Moon, Sun, Palette } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      router.replace('/');
    } catch (error) {
      console.error('Logout failed:', error);
      router.replace('/');
    }
  };

  return (
    <AuthGuard requireAuth={true} redirectTo="/sign-in">
      <div className="min-h-full flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="px-4 md:px-8 py-8"
        >
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 text-balance">
              Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-base">
              Customize your experience and account preferences
            </p>
          </div>
        </motion.div>

        {/* Content */}
        <div className="flex-1 px-4 md:px-8 py-8">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Theme Settings */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white dark:bg-slate-900/80 rounded-2xl border border-gray-200/60 dark:border-slate-800/60 shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-8"
            >
              <div className="flex items-start gap-4 mb-8">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex-shrink-0">
                  <Palette className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    Appearance
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Choose your preferred color scheme
                  </p>
                </div>
              </div>

              {mounted && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Light Theme */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setTheme('light')}
                    className={`relative flex flex-col items-center justify-center p-5 rounded-xl border-2 transition-all duration-200 ${
                      theme === 'light'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 shadow-lg shadow-amber-500/20'
                        : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 hover:shadow-md'
                    }`}
                  >
                    <Sun className={`w-8 h-8 mb-3 transition-colors ${theme === 'light' ? 'text-amber-600' : 'text-gray-400 dark:text-gray-500'}`} />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Light</span>
                    {theme === 'light' && (
                      <motion.div 
                        layoutId="themeIndicator"
                        className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-amber-500" 
                      />
                    )}
                  </motion.button>

                  {/* Dark Theme */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setTheme('dark')}
                    className={`relative flex flex-col items-center justify-center p-5 rounded-xl border-2 transition-all duration-200 ${
                      theme === 'dark'
                        ? 'border-slate-700 bg-slate-900/20 shadow-lg shadow-slate-500/20'
                        : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 hover:shadow-md'
                    }`}
                  >
                    <Moon className={`w-8 h-8 mb-3 transition-colors ${theme === 'dark' ? 'text-slate-400' : 'text-gray-400 dark:text-gray-500'}`} />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark</span>
                    {theme === 'dark' && (
                      <motion.div 
                        layoutId="themeIndicator"
                        className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-slate-400" 
                      />
                    )}
                  </motion.button>

                  {/* System Theme */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setTheme('system')}
                    className={`relative col-span-2 md:col-span-1 flex flex-col items-center justify-center p-5 rounded-xl border-2 transition-all duration-200 ${
                      theme === 'system'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-lg shadow-indigo-500/20'
                        : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 hover:shadow-md'
                    }`}
                  >
                    <div className="flex gap-2 mb-3">
                      <Sun className={`w-4 h-4 transition-colors ${theme === 'system' ? 'text-indigo-600' : 'text-gray-400 dark:text-gray-500'}`} />
                      <Moon className={`w-4 h-4 transition-colors ${theme === 'system' ? 'text-indigo-600' : 'text-gray-400 dark:text-gray-500'}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">System</span>
                    {theme === 'system' && (
                      <motion.div 
                        layoutId="themeIndicator"
                        className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-indigo-500" 
                      />
                    )}
                  </motion.button>
                </div>
              )}
            </motion.div>

            {/* Danger Zone */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white dark:bg-slate-900/80 rounded-2xl border border-red-200/50 dark:border-red-900/30 shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-8"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 flex-shrink-0">
                  <LogOut className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Sign Out
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                    Sign out of your account. You&apos;ll need to sign in again to access your tasks.
                  </p>
                  <Button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-2.5 px-6 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg shadow-red-600/25 hover:shadow-xl hover:shadow-red-600/35 disabled:shadow-md"
                  >
                    <LogOut className="w-4 h-4" />
                    {isLoggingOut ? 'Signing out...' : 'Sign Out'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
