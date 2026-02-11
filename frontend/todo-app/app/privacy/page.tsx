import Link from 'next/link';
import Footer from '@/components/layout/footer';
import { motion } from 'framer-motion';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950">
      <header className="sticky top-0 z-50 w-full border-b border-white/20 dark:border-white/10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex h-16 items-center px-4 md:px-8">
          <Link
            href="/"
            className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent"
          >
            PrimeTask
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 md:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {[
            {
              title: 'Information We Collect',
              content: 'We collect information you provide directly when you create an account, such as your name and email address. We also collect data about the tasks you create and manage within the application.',
            },
            {
              title: 'How We Use Your Information',
              content: 'Your information is used to provide and improve the PrimeTask service, authenticate your identity, and deliver a personalised experience. We do not sell your personal data to third parties.',
            },
            {
              title: 'Data Security',
              content: 'We implement industry-standard security measures to protect your data. All communications are encrypted in transit, and we regularly review our security practices.',
            },
            {
              title: 'Contact Us',
              content: 'If you have questions about this Privacy Policy, please contact us at support@primetask.com.',
            },
          ].map((section, index) => (
            <motion.section
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * (index + 1), duration: 0.5 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group relative bg-white dark:bg-slate-800/80 rounded-2xl border border-gray-200/60 dark:border-slate-700/60 p-8 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              {/* Background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/0 to-blue-50/0 dark:from-indigo-950/0 dark:to-blue-950/0 group-hover:from-indigo-50 group-hover:to-blue-50/50 dark:group-hover:from-indigo-950/10 dark:group-hover:to-blue-950/10 transition-all duration-300" />
              
              <div className="relative">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                  {section.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                  {section.content}
                </p>
              </div>
            </motion.section>
          ))}
        </motion.div>

        {/* Additional info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-8 bg-blue-50 dark:bg-blue-950/20 rounded-2xl border border-blue-200 dark:border-blue-800 text-center"
        >
          <p className="text-sm text-blue-700 dark:text-blue-300">
            We are committed to protecting your privacy and being transparent about how we use your data.
          </p>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
