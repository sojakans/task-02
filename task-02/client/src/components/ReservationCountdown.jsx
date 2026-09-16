import React from 'react';
import { useCountdown } from '../hooks/useCountdown';

export const ReservationCountdown = ({ expiresAt, onExpire }) => {
  const { formattedTime, secondsLeft, isExpired } = useCountdown(expiresAt, onExpire);

  const isWarning = secondsLeft <= 60 && !isExpired;

  if (isExpired) {
    return (
      <div
        style={{
          background: 'var(--stock-out-bg)',
          border: '1.5px solid var(--stock-out-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.25rem 1.5rem',
          textAlign: 'center',
          color: 'var(--stock-out-text)',
          marginBottom: '1.5rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: '#fee2e2',
          color: 'var(--stock-out)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '0.5rem',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
            timer_off
          </span>
        </div>
        <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.125rem', fontWeight: 800 }}>
          Reservation Expired
        </h3>
        <p style={{ fontSize: '0.8125rem', marginTop: '0.25rem', opacity: 0.9 }}>
          Your stock reservation has expired. Components have been released back to available stock.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: isWarning ? '#fffbeb' : '#ffffff',
        border: `2px solid ${isWarning ? 'var(--stock-warning)' : '#bfdbfe'}`,
        borderRadius: 'var(--radius-xl)',
        padding: '1.5rem 1.25rem',
        textAlign: 'center',
        marginBottom: '1.5rem',
        boxShadow: isWarning
          ? '0 4px 16px rgba(245, 158, 11, 0.18)'
          : '0 4px 16px rgba(37, 99, 235, 0.08)',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Title & Badge */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <span
          className="pulse-dot"
          style={{ background: isWarning ? 'var(--stock-warning)' : 'var(--stock-in)' }}
        />
        <h3 style={{
          fontFamily: 'var(--font-headline)',
          fontSize: '1.125rem',
          fontWeight: 800,
          color: isWarning ? '#92400e' : 'var(--slate-dark)',
          letterSpacing: '-0.01em',
        }}>
          Stock Reserved
        </h3>
      </div>

      {/* Instructional Message */}
      <p style={{
        fontSize: '0.875rem',
        color: isWarning ? '#b45309' : 'var(--text-muted)',
        marginBottom: '1rem',
      }}>
        Complete payment within the reservation period.
      </p>

      {/* Timer Display Box */}
      <div style={{
        display: 'inline-block',
        padding: '0.5rem 1.5rem',
        borderRadius: 'var(--radius-lg)',
        background: isWarning ? '#fef3c7' : '#eff6ff',
        border: `1px solid ${isWarning ? '#fde68a' : '#dbeafe'}`,
      }}>
        <span style={{
          display: 'block',
          fontSize: '0.6875rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: isWarning ? '#92400e' : 'var(--secondary)',
          marginBottom: '0.125rem',
        }}>
          Expires in
        </span>
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: '2.25rem',
            fontWeight: 800,
            lineHeight: 1.1,
            color: isWarning ? '#b45309' : 'var(--primary)',
            letterSpacing: '0.05em',
          }}
        >
          {formattedTime}
        </div>
      </div>

      {isWarning && (
        <div style={{
          marginTop: '0.75rem',
          fontSize: '0.75rem',
          fontWeight: 700,
          color: 'var(--stock-warning-text)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.375rem',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
            warning
          </span>
          <span>Hurry! Stock releases in less than a minute.</span>
        </div>
      )}
    </div>
  );
};
