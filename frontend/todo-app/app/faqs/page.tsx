import Link from 'next/link';
import Footer from '@/components/layout/footer';
import { motion } from 'framer-motion';

const faqs = [
  {
    question: 'What is PrimeTask?',
    answer:
      'PrimeTask is a modern task management application designed to help you organize, prioritize, and track your tasks with a beautiful, intuitive interface.',
  },
  {
    question: 'Is PrimeTask free to use?',
    answer:
      'Yes! PrimeTask is completely free to use. Simply create an account and start managing your tasks right away.',
  },
  {
    question: 'How do I create a new task?',
    answer:
      'After signing in, navigate to your dashboard and click the "Add New Task" button. Fill in the title and an optional description, then click "Create Task".',
  },
  {
    question: 'Can I use PrimeTask on my phone?',
    answer:
      'Absolutely. PrimeTask is fully responsive and works seamlessly on desktop, tablet, and mobile devices.',
  },
  {
    question: 'How do I switch between light and dark mode?',
    answer:
      'Use the theme toggle button in the navigation bar (the sun/moon icon). You can switch between light, dark, and system-based themes.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Yes. All data is transmitted over encrypted connections, and your account is protected with secure authentication.',
  },
];

export default function FAQsPage() {
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
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
            Find answers to the most common questions about PrimeTask.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {faqs.map((faq, index) => (
            <motion.details
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * (index + 1), duration: 0.4 }}
              className="group bg-white dark:bg-slate-800/80 rounded-2xl border border-gray-200/60 dark:border-slate-700/60 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
            >
              <motion.summary
                className="flex items-center justify-between cursor-pointer p-6 list-none hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                whileHover={{ paddingLeft: 24 }}
              >
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white pr-4 text-balance">
                  {faq.question}
                </h2>
                <motion.div
                  initial={false}
                  animate={{ rotate: 0 }}
                  className="group-open:rotate-180 transition-transform duration-300 flex-shrink-0"
                >
                  <svg
                    className="w-6 h-6 text-indigo-600 dark:text-indigo-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </motion.div>
              </motion.summary>
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden border-t border-gray-100 dark:border-slate-700"
              >
                <p className="px-6 py-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                  {faq.answer}
                </p>
              </motion.div>
            </motion.details>
          ))}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
