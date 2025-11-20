import { ReactNode } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'fade' | 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right';
}

/**
 * Wrapper component that animates children on scroll
 */
export function AnimatedSection({
  children,
  className = '',
  delay = 0,
  direction = 'fade-up',
}: AnimatedSectionProps) {
  const [ref, isVisible] = useScrollAnimation({ triggerOnce: true });

  const directionClasses = {
    fade: 'opacity-0',
    'fade-up': 'opacity-0 translate-y-8',
    'fade-down': 'opacity-0 -translate-y-8',
    'fade-left': 'opacity-0 translate-x-8',
    'fade-right': 'opacity-0 -translate-x-8',
  };

  const visibleClasses = {
    fade: 'opacity-100',
    'fade-up': 'opacity-100 translate-y-0',
    'fade-down': 'opacity-100 translate-y-0',
    'fade-left': 'opacity-100 translate-x-0',
    'fade-right': 'opacity-100 translate-x-0',
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible ? visibleClasses[direction] : directionClasses[direction]
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

