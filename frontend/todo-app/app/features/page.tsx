'use client';

import Link from 'next/link';
import Footer from '@/components/layout/footer';
import { motion } from 'framer-motion';
import { CheckCircle2, Zap, Shield, Palette, Smartphone, BarChart3, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: CheckCircle2,
    title: 'Smart Task Management',
    description: 'Organize, prioritize, and track your tasks with an intuitive interface. Create tasks, set deadlines, and manage your workload efficiently with our powerful task management system.',
    color: 'from-blue-500 to-blue-600',
    details: [
      'Create and organize unlimited tasks',
      'Set priorities and deadlines',
      'Mark tasks as complete',
      'Filter and sort by status'
    ]
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Experience blazing-fast performance with optimized interactions. Our application is built with performance in mind to ensure you can work without delays.',
    color: 'from-yellow-500 to-yellow-600',
    details: [
      'Instant task creation and updates',
      'Real-time synchronization',
      'Optimized for all devices',
      'Smooth animations and transitions'
    ]
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your data is encrypted and stored securely with authentication. We take your privacy seriously and ensure all your information is protected.',
    color: 'from-green-500 to-green-600',
    details: [
      'Military-grade encryption',
      'Secure authentication',
      'Private data storage',
      'GDPR compliant'
    ]
  },
  {
    icon: Palette,
    title: 'Dark & Light Themes',
    description: 'Switch between beautiful light and dark modes effortlessly. Customize your experience with our theme options to suit your preferences.',
    color: 'from-purple-500 to-purple-600',
    details: [
      'Light and dark themes',
      'System preference detection',
      'Smooth theme transitions',
      'Reduced eye strain options'
    ]
  },
  {
    icon: Smartphone,
    title: 'Fully Responsive',
    description: 'Works flawlessly on desktop, tablet, and mobile devices. Access your tasks from anywhere with our fully responsive design.',
    color: 'from-pink-500 to-pink-600',
    details: [
      'Mobile-optimized interface',
      'Touch-friendly interactions',
      'Responsive layouts',
      'Cross-device synchronization'
    ]
  },
  {
    icon: BarChart3,
    title: 'Real-time Stats',
    description: 'Track your productivity with detailed task analytics. Get insights into your task completion rates and productivity trends.',
    color: 'from-indigo-500 to-indigo-600',
    details: [
      'Task completion analytics',
      'Productivity insights',
      'Progress tracking',
      'Performance metrics'
    ]
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
  hover: {
    y: -8,
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    transition: { duration: 0.3 },
  },
};

export default function FeaturesPage() {
  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950 min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/20 dark:border-white/10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent">
              PrimeTask
            </Link>
          </motion.div>
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost">
              <Link href="/">Home</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white">
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24 w-full">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 text-balance">
            Powerful Features for Task Management
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-pretty">
            Discover everything PrimeTask offers to help you manage your tasks efficiently and stay productive
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover="hover"
                className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/80 p-8 border-2 border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* Icon Container */}
                <div className={`mb-6 inline-flex rounded-xl bg-gradient-to-br ${feature.color} p-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-balance">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
                  {feature.description}
                </p>

                {/* Feature Details */}
                <ul className="space-y-2">
                  {feature.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-green-500 font-bold mt-0.5">✓</span>
                      {detail}
                    </li>
                  ))}
                </ul>

                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl pointer-events-none`} />
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center py-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 text-balance">
            Ready to supercharge your productivity?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Start using PrimeTask today and experience the difference these features can make in your daily workflow
          </p>
          <Button asChild size="lg" className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white">
            <Link href="/sign-up" className="gap-2">
              Get Started Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </motion.div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
