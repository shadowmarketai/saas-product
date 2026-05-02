import { motion } from 'framer-motion';
import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type SafeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onAnimationStart' | 'onDragStart' | 'onDrag' | 'onDragEnd'
>;

interface Props extends SafeButtonProps {
  variant?: 'primary' | 'accent';
}

export function GradientButton({ children, className, variant = 'primary', ...props }: Props) {
  const gradients = {
    primary: 'from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600',
    accent: 'from-accent-400 to-accent-500 hover:from-accent-300 hover:to-accent-400',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'px-6 py-3 rounded-full font-semibold text-white bg-gradient-to-r shadow-lg transition-shadow hover:shadow-xl',
        gradients[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
