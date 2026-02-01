import React, { useState, useEffect } from 'react';
import { PersistenceService, type SyncStatus } from '../services/PersistenceService';

/**
 * Sync Status Indicator
 * Shows real-time synchronization status with Firebase
 * Displays: Online/Offline, Pending operations, Last sync time
 */

interface SyncStatusIndicatorProps {
  compact?: boolean;
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({ compact = false }) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    lastSyncTime: null,
    pendingOperations: 0,
    syncInProgress: false,
    status: 'IDLE',
  });

  useEffect(() => {
    const persistence = PersistenceService.getInstance();
    const unsubscribe = persistence.onSyncStatusChange((status) => {
      setSyncStatus(status);
    });

    // Set initial status
    setSyncStatus(persistence.getSyncStatus());

    return () => {
      unsubscribe();
    };
  }, []);

  const getStatusIcon = (): string => {
    if (syncStatus.syncInProgress) return '🔄';
    if (!syncStatus.isOnline) return '🔌';
    if (syncStatus.status === 'ERROR') return '⚠️';
    if (syncStatus.pendingOperations > 0) return '📤';
    return '✅';
  };

  const getStatusColor = (): string => {
    if (syncStatus.syncInProgress) return '#4338ca';
    if (!syncStatus.isOnline) return '#ea580c';
    if (syncStatus.status === 'ERROR') return '#dc2626';
    if (syncStatus.pendingOperations > 0) return '#b45309';
    return '#059669';
  };

  const getStatusText = (): string => {
    if (syncStatus.syncInProgress) return 'Syncing...';
    if (!syncStatus.isOnline) return 'Offline Mode';
    if (syncStatus.status === 'ERROR') return 'Sync Error';
    if (syncStatus.pendingOperations > 0) return `${syncStatus.pendingOperations} Pending`;
    return 'Vault Online';
  };

  const getLastSyncText = (): string => {
    if (!syncStatus.lastSyncTime) return 'Never synced';
    const lastSync = new Date(syncStatus.lastSyncTime);
    const now = new Date();
    const diffMs = now.getTime() - lastSync.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (compact) {
    return (
      <div
        className="sync-status-compact"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 0.75rem',
          borderRadius: '8px',
          backgroundColor: '#f5f5f5',
          fontSize: '0.75rem',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: getStatusColor(),
        }}
        title={`${getStatusText()} • ${getLastSyncText()}`}
      >
        <span>{getStatusIcon()}</span>
        <span>{getStatusText()}</span>
        {syncStatus.pendingOperations > 0 && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '1.2rem',
              height: '1.2rem',
              backgroundColor: getStatusColor(),
              color: 'white',
              borderRadius: '50%',
              fontSize: '0.6rem',
              fontWeight: '700',
              marginLeft: '0.25rem',
            }}
          >
            {syncStatus.pendingOperations}
          </span>
        )}
      </div>
    );
  }

  // Full status panel
  return (
    <div
      className="sync-status-panel"
      style={{
        padding: '1.5rem',
        backgroundColor: 'white',
        borderRadius: '12px',
        border: `1px solid #e5e7eb`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <div
          style={{
            fontSize: '2rem',
            animation: syncStatus.syncInProgress ? 'spin 1s linear infinite' : 'none',
          }}
        >
          {getStatusIcon()}
        </div>
        <div style={{ flex: 1 }}>
          <h3
            style={{
              margin: 0,
              fontSize: '1rem',
              fontWeight: '600',
              color: '#1f2937',
            }}
          >
            {getStatusText()}
          </h3>
          <p
            style={{
              margin: '0.25rem 0 0 0',
              fontSize: '0.875rem',
              color: '#6b7280',
            }}
          >
            {!syncStatus.isOnline
              ? 'Operating in offline mode. Changes will sync when online.'
              : syncStatus.pendingOperations > 0
                ? `${syncStatus.pendingOperations} operation${syncStatus.pendingOperations !== 1 ? 's' : ''} waiting to sync.`
                : 'All changes synced to vault.'}
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid #e5e7eb',
        }}
      >
        <div>
          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase' }}>
            Last Sync
          </p>
          <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '500', color: '#1f2937' }}>
            {getLastSyncText()}
          </p>
        </div>
        <div>
          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase' }}>
            Network
          </p>
          <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '500', color: getStatusColor() }}>
            {syncStatus.isOnline ? '🌐 Online' : '🔌 Offline'}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SyncStatusIndicator;
