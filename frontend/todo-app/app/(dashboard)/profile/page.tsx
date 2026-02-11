'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import AuthGuard from '@/components/auth/auth-guard';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Copy, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formattedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A';

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
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Your Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-base">
              View and manage your account information
            </p>
          </div>
        </motion.div>

        {/* Content */}
        <div className="flex-1 px-4 md:px-8 py-8">
          <div className="max-w-5xl mx-auto">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white dark:bg-slate-900/80 rounded-2xl border border-gray-200/60 dark:border-slate-800/60 shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-8 mb-8"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
                {/* Avatar */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/30"
                >
                  <User className="w-12 h-12 text-white" />
                </motion.div>

                {/* User Info */}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {user?.name || 'User'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">
                    Account Member
                  </p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8 border-t border-gray-200/50 dark:border-slate-800/50">
                {/* Email */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-3"
                >
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                    <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Email Address
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700">
                    <p className="text-gray-900 dark:text-gray-100 font-medium text-sm break-all">
                      {user?.email || 'N/A'}
                    </p>
                    <button
                      onClick={() => copyToClipboard(user?.email || '', 'email')}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-700/50 transition-colors flex-shrink-0"
                      title="Copy email"
                    >
                      {copiedField === 'email' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </motion.div>

                {/* Member Since */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="space-y-3"
                >
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                    <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Member Since
                  </label>
                  <p className="text-gray-900 dark:text-gray-100 font-medium p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700 text-sm">
                    {formattedDate}
                  </p>
                </motion.div>
              </div>
            </motion.div>

            {/* Account Settings Section */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                More Options
              </h3>
              <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-gray-200/60 dark:border-slate-800/60 shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-8">
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  For theme preferences, security options, and logout, please visit the Settings page.
                </p>
                <Button className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold py-3 rounded-xl px-8 transition-all duration-200 shadow-lg shadow-indigo-500/25">
                  Go to Settings
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
