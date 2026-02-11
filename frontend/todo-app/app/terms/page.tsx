'use client';

import Link from 'next/link';
import Footer from '@/components/layout/footer';
import { motion } from 'framer-motion';

export default function TermsPage() {
  const sections = [
    {
      title: 'Use License',
      content: 'Permission is granted to temporarily download one copy of the materials (information or software) on PrimeTask for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:',
      list: [
        'Modifying or copying the materials',
        'Using the materials for any commercial purpose or for any public display',
        'Attempting to decompile or reverse engineer any software contained on PrimeTask',
        'Removing any copyright or other proprietary notations from the materials',
      ]
    },
    {
      title: 'Disclaimer',
      content: 'The materials on PrimeTask are provided on an \'as is\' basis. PrimeTask makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.',
    },
    {
      title: 'Limitations',
      content: 'In no event shall PrimeTask or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on PrimeTask, even if PrimeTask or an authorized representative has been notified orally or in writing of the possibility of such damage.',
    },
    {
      title: 'Accuracy of Materials',
      content: 'The materials appearing on PrimeTask could include technical, typographical, or photographic errors. PrimeTask does not warrant that any of the materials on the site are accurate, complete, or current. PrimeTask may make changes to the materials contained on its website at any time without notice.',
    },
    {
      title: 'Links',
      content: 'PrimeTask has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by PrimeTask of the site. Use of any such linked website is at the user\'s own risk.',
    },
    {
      title: 'Modifications',
      content: 'PrimeTask may revise these terms of service for our website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.',
    },
  ];

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

      <main className="flex-1 max-w-5xl mx-auto px-4 md:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
            Terms & Conditions
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
          {sections.map((section, index) => (
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
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  {section.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  {section.content}
                </p>
                {section.list && (
                  <ul className="space-y-3 ml-4">
                    {section.list.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-gray-600 dark:text-gray-400"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-2 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.section>
          ))}
        </motion.div>

        {/* Contact section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-8 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-800"
        >
          <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-2">
            Questions?
          </h3>
          <p className="text-sm text-amber-700 dark:text-amber-200">
            If you have any questions about these Terms & Conditions, please contact us at support@primetask.com
          </p>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
