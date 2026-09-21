import React from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../../lib/motion';

export function StaggerGrid({ children, className = '', staggerDelay = 0.06 }) {
  return (
    <motion.div
      variants={staggerContainer(staggerDelay)}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = '' }) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  );
}
