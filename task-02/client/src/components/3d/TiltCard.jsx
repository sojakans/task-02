import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export function TiltCard({
  children,
  className = '',
  maxTilt = 10,
  glare = true,
  onClick,
  ...props
}) {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50, opacity: 0 });

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({
      rotateX,
      rotateY,
      glareX,
      glareY,
      opacity: 1,
    });
  };

  const handleMouseLeave = () => {
    setTilt({
      rotateX: 0,
      rotateY: 0,
      glareX: 50,
      glareY: 50,
      opacity: 0,
    });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      animate={{
        rotateX: tilt.rotateX,
        rotateY: tilt.rotateY,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20, mass: 0.2 }}
      style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      {children}
      {glare && (
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300 rounded-[inherit]"
          style={{
            opacity: tilt.opacity * 0.15,
            background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.8), transparent 60%)`,
          }}
        />
      )}
    </motion.div>
  );
}
