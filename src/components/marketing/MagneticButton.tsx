import { type ReactNode, useState } from 'react';
import { motion, useReducedMotion, type HTMLMotionProps } from 'motion/react';
import { cn } from '../../utils/cn';

interface MagneticButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
}

export function MagneticButton({ children, className = '', variant = 'primary', onPointerMove, onPointerLeave, ...props }: MagneticButtonProps) {
  const [pull, setPull] = useState({ x: 0, y: 0 });
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      {...props}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        if (reduceMotion) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        setPull({ x: (event.clientX - bounds.left - bounds.width / 2) * 0.12, y: (event.clientY - bounds.top - bounds.height / 2) * 0.12 });
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        setPull({ x: 0, y: 0 });
      }}
      animate={reduceMotion ? undefined : { x: pull.x, y: pull.y }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 240, damping: 16, mass: 0.35 }}
      className={cn('marketing-button', `marketing-button-${variant}`, className)}
    >
      {children}
    </motion.button>
  );
}
