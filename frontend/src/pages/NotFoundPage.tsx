import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 relative overflow-hidden">
      {/* Animated background blurred circles */}
      <motion.div
        className="absolute w-72 h-72 rounded-full bg-indigo-400/20 dark:bg-indigo-500/15 blur-3xl"
        animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        style={{ top: '10%', left: '15%' }}
      />
      <motion.div
        className="absolute w-64 h-64 rounded-full bg-violet-400/20 dark:bg-violet-500/15 blur-3xl"
        animate={{ x: [0, -35, 25, 0], y: [0, 25, -15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        style={{ bottom: '15%', right: '10%' }}
      />
      <motion.div
        className="absolute w-48 h-48 rounded-full bg-pink-400/20 dark:bg-pink-500/15 blur-3xl"
        animate={{ x: [0, 20, -30, 0], y: [0, -20, 30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        style={{ top: '50%', right: '25%' }}
      />

      <div className="relative z-10 text-center p-8 max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-8xl font-extrabold bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent mb-4">
            404
          </h1>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Page not found
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/25"
            >
              Go Home
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl font-semibold text-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
