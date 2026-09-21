import React from 'react';
import { motion } from 'framer-motion';

export function CountdownCircle({
  secondsLeft,
  totalSeconds = 300,
  size = 72,
  strokeWidth = 5,
  className = '',
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, secondsLeft / (totalSeconds || 300)));
  const strokeDashoffset = circumference - progress * circumference;

  // Urgency colors
  let color = '#06b6d4'; // cyan
  let glowColor = 'rgba(6, 182, 212, 0.4)';
  if (secondsLeft < 60) {
    color = '#f43f5e'; // red
    glowColor = 'rgba(244, 63, 94, 0.5)';
  } else if (secondsLeft < 120) {
    color = '#f59e0b'; // amber
    glowColor = 'rgba(245, 158, 11, 0.4)';
  }

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const formattedTime = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Animated progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{
            transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease',
            filter: `drop-shadow(0 0 6px ${glowColor})`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center font-mono font-bold text-xs tracking-tight text-white">
        <span>{formattedTime}</span>
      </div>
    </div>
  );
}
