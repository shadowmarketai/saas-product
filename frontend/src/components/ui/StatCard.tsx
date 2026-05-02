import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Props {
  label: string;
  value: string | number;
  icon: string;
  trend?: string;
  className?: string;
}

export function StatCard({ label, value, icon, trend, className }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03, y: -3 }}
      className={cn(
        'bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow',
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-3xl">{icon}</span>
        {trend && (
          <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <p className="text-3xl font-bold font-heading text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </motion.div>
  );
}
