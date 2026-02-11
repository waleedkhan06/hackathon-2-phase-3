'use client';

import Link from 'next/link';
import Footer from '@/components/layout/footer';
import { Mail, MessageCircle, FileQuestion } from 'lucide-react';
import { motion } from 'framer-motion';

type SupportChannel = {
  icon: React.ElementType;
  title: string;
  description: string;
} & (
  | { isLink: true; action: '/faqs'; isEmail?: false; isAnchor?: false }
  | { isEmail: true; action: string; isLink?: false; isAnchor?: false }
  | { isAnchor: true; action: string; isLink?: false; isEmail?: false }
);

const supportChannels: SupportChannel[] = [
  {
    icon: Mail,
    title: 'Email Support',
    description: 'Send us an email and we will get back to you within 24 hours.',
    action: 'support@primetask.com',
    isEmail: true,
  },
  {
    icon: FileQuestion,
    title: 'FAQs',
    description: 'Browse our frequently asked questions for quick answers.',
    action: '/faqs',
    isLink: true,
  },
  {
    icon: MessageCircle,
    title: 'Community',
    description: 'Join our community to share tips and get help from other users.',
    action: '#',
    isAnchor: true,
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/20 dark:border-white/10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 md:px-8">
          <Link
            href="/"
            className="text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent flex-shrink-0"
          >
            PrimeTask
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-4 md:px-8 py-16 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4 text-balance">
            Help & Support
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl text-balance">
            We're here to help. Choose the support channel that works best for you.
          </p>
        </motion.div>

        {/* Support Channels Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          {supportChannels.map((channel, index) => {
            const Icon = channel.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1), duration: 0.5 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="group relative overflow-hidden bg-white dark:bg-slate-800/80 rounded-2xl border border-gray-200/60 dark:border-slate-700/60 p-8 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* Background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-blue-600/5 dark:from-indigo-900/10 dark:to-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30 flex items-center justify-center shadow-md"
                  >
                    <Icon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                  </motion.div>
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-3 text-balance">
                    {channel.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed text-sm md:text-base">
                    {channel.description}
                  </p>
                  {channel.isLink ? (
                    <Link
                      href={channel.action}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium text-sm hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                    >
                      View FAQs
                      <span>→</span>
                    </Link>
                  ) : channel.isEmail ? (
                    <a
                      href={`mailto:${channel.action}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium text-sm hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                    >
                      Contact Us
                      <span>→</span>
                    </a>
                  ) : (
                    <span className="inline-block px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 font-medium text-sm">
                      Coming Soon
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl border border-blue-200/50 dark:border-blue-800/30 p-8 text-center"
        >
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Response Time
          </h3>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-xl mx-auto text-balance">
            We typically respond to support requests within 24 hours during business hours. For urgent matters, please reach out through our community channels.
          </p>
        </motion.div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
