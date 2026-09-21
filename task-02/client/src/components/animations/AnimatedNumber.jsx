import React, { useEffect, useState } from 'react';

export function AnimatedNumber({ value, duration = 600, format = (v) => v.toFixed(2), className = '' }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let startTimestamp = null;
    const startValue = displayValue;
    const targetValue = typeof value === 'number' ? value : parseFloat(value) || 0;

    if (startValue === targetValue) return;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (targetValue - startValue) * easedProgress;

      setDisplayValue(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(targetValue);
      }
    };

    window.requestAnimationFrame(step);
  }, [value, duration]);

  return <span className={className}>{format(displayValue)}</span>;
}
