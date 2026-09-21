import React from 'react';
import {
  Timer,
  CheckCircle2,
  AlertOctagon,
  Clock,
  XCircle,
  Package,
} from 'lucide-react';
import { Badge } from './ui/Badge';

export const StatusBadge = ({ status, type = 'order' }) => {
  if (type === 'stock') {
    const stockCount = Number(status);
    if (stockCount > 5) {
      return (
        <Badge variant="success" size="sm" dot pulse>
          {stockCount} in stock
        </Badge>
      );
    }
    if (stockCount > 0) {
      return (
        <Badge variant="warning" size="sm" dot pulse>
          Only {stockCount} left
        </Badge>
      );
    }
    return (
      <Badge variant="danger" size="sm" dot>
        Out of stock
      </Badge>
    );
  }

  // Order & Payment Status Badge
  const normalizedStatus = (status || 'PENDING').toUpperCase();

  const config = {
    RESERVED: {
      label: 'STOCK RESERVED',
      icon: Timer,
      variant: 'warning',
      pulse: true,
    },
    PAID: {
      label: 'PAYMENT VERIFIED',
      icon: CheckCircle2,
      variant: 'success',
      pulse: false,
    },
    FAILED: {
      label: 'PAYMENT FAILED',
      icon: AlertOctagon,
      variant: 'danger',
      pulse: false,
    },
    EXPIRED: {
      label: 'HOLD EXPIRED',
      icon: Clock,
      variant: 'danger',
      pulse: false,
    },
    CANCELLED: {
      label: 'CANCELLED',
      icon: XCircle,
      variant: 'default',
      pulse: false,
    },
    PENDING: {
      label: 'PROCESSING',
      icon: Package,
      variant: 'info',
      pulse: true,
    },
  };

  const current = config[normalizedStatus] || config.PENDING;
  const Icon = current.icon;

  return (
    <Badge variant={current.variant} size="sm" dot pulse={current.pulse}>
      <Icon className="w-3 h-3 inline-block mr-0.5" />
      <span>{current.label}</span>
    </Badge>
  );
};
