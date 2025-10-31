import React, { useEffect, useState, useCallback } from 'react';
import styles from './NodeStatusIndicator/NodeConnectionIndicator.module.css';

// Enhanced status type based on TELA's approach
export type NodeConnectionStatus = 
  | 'connected' 
  | 'connecting' 
  | 'disconnected' 
  | 'error' 
  | 'syncing'
  | 'unknown';

export interface NodeConnectionIndicatorProps {
  // Backward compatibility
  isConnected?: boolean | null;
  // Enhanced props
  status?: NodeConnectionStatus;
  showText?: boolean;
  size?: 'compact' | 'normal' | 'large';
  onStatusClick?: () => void;
  checkInterval?: number;
  onStatusCheck?: () => Promise<NodeConnectionStatus>;
  className?: string;
}

const NodeConnectionIndicator: React.FC<NodeConnectionIndicatorProps> = ({
  // Backward compatibility support
  isConnected,
  // Enhanced props
  status,
  showText = true,
  size = 'normal',
  onStatusClick,
  checkInterval,
  onStatusCheck,
  className = ''
}) => {
  // Convert legacy isConnected to new status format
  const getStatusFromLegacy = (connected: boolean | null): NodeConnectionStatus => {
    if (connected === true) return 'connected';
    if (connected === false) return 'disconnected';
    return 'unknown';
  };

  const initialStatus = status || getStatusFromLegacy(isConnected);
  const [currentStatus, setCurrentStatus] = useState<NodeConnectionStatus>(initialStatus);
  const [isChecking, setIsChecking] = useState(false);

  // Update status when props change
  useEffect(() => {
    if (status) {
      setCurrentStatus(status);
    } else if (isConnected !== undefined) {
      setCurrentStatus(getStatusFromLegacy(isConnected));
    }
  }, [status, isConnected]);

  // Manual status checking (only when explicitly called)
  const performStatusCheck = useCallback(async () => {
    if (!onStatusCheck || isChecking) return;
    
    setIsChecking(true);
    try {
      const newStatus = await onStatusCheck();
      setCurrentStatus(newStatus);
    } catch (error) {
      console.error('Status check failed:', error);
      setCurrentStatus('error');
    } finally {
      setIsChecking(false);
    }
  }, [onStatusCheck, isChecking]);

  // Optional: Set up periodic checking only if explicitly requested
  useEffect(() => {
    if (!checkInterval || !onStatusCheck) return;

    const interval = setInterval(performStatusCheck, checkInterval);

    return () => clearInterval(interval);
  }, [checkInterval, onStatusCheck, performStatusCheck]);

  // Status text mapping (like TELA's approach)
  const getStatusText = (status: NodeConnectionStatus): string => {
    switch (status) {
      case 'connected':
        return 'Node Connected';
      case 'connecting':
      case 'syncing':
        return 'Connecting...';
      case 'disconnected':
        return 'Node Disconnected';
      case 'error':
        return 'Connection Error';
      case 'unknown':
      default:
        return 'Checking Node...';
    }
  };

  // Status color mapping for accessibility
  const getStatusColor = (status: NodeConnectionStatus): string => {
    switch (status) {
      case 'connected':
        return '#28a745';
      case 'connecting':
      case 'syncing':
        return '#f0ad4e';
      case 'disconnected':
      case 'error':
        return '#cc3300';
      case 'unknown':
      default:
        return '#6c757d';
    }
  };

  const containerClasses = [
    styles.nodeConnectionIndicator,
    size !== 'normal' ? styles[size] : '',
    className
  ].filter(Boolean).join(' ');

  const dotClasses = [
    styles.statusDot,
    styles[currentStatus]
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={containerClasses}
      onClick={onStatusClick}
      role={onStatusClick ? 'button' : undefined}
      tabIndex={onStatusClick ? 0 : undefined}
      title={`Node Status: ${getStatusText(currentStatus)}`}
      style={{
        cursor: onStatusClick ? 'pointer' : 'default'
      }}
    >
      <div 
        className={dotClasses}
        style={{
          backgroundColor: getStatusColor(currentStatus),
          boxShadow: `0 0 5px ${getStatusColor(currentStatus)}`
        }}
        aria-label={`Status indicator: ${currentStatus}`}
      />
      
      {showText && (
        <span className={styles.statusText}>
          {getStatusText(currentStatus)}
        </span>
      )}
      
      {isChecking && (
        <span className={styles.statusText} style={{ opacity: 0.7 }}>
          ↻
        </span>
      )}
    </div>
  );
};

export default NodeConnectionIndicator; 