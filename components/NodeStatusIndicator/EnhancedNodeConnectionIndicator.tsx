import React, { useEffect, useState, useCallback } from 'react';
import styles from './NodeConnectionIndicator.module.css';

// Enhanced status type based on TELA's approach
export type NodeConnectionStatus = 
  | 'connected' 
  | 'connecting' 
  | 'disconnected' 
  | 'error' 
  | 'syncing'
  | 'unknown';

export interface NodeConnectionIndicatorProps {
  status?: NodeConnectionStatus;
  showText?: boolean;
  size?: 'compact' | 'normal' | 'large';
  onStatusClick?: () => void;
  checkInterval?: number;
  onStatusCheck?: () => Promise<NodeConnectionStatus>;
  className?: string;
}

const NodeConnectionIndicator: React.FC<NodeConnectionIndicatorProps> = ({
  status = 'unknown',
  showText = true,
  size = 'normal',
  onStatusClick,
  checkInterval,
  onStatusCheck,
  className = ''
}) => {
  const [currentStatus, setCurrentStatus] = useState<NodeConnectionStatus>(status);
  const [isChecking, setIsChecking] = useState(false);

  // Update status when prop changes
  useEffect(() => {
    setCurrentStatus(status);
  }, [status]);

  // Periodic status checking (like TELA's approach)
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

  // Set up periodic checking
  useEffect(() => {
    if (!checkInterval || !onStatusCheck) return;

    const interval = setInterval(performStatusCheck, checkInterval);
    
    // Initial check
    performStatusCheck();

    return () => clearInterval(interval);
  }, [checkInterval, onStatusCheck, performStatusCheck]);

  // Status text mapping (like TELA's approach)
  const getStatusText = (status: NodeConnectionStatus): string => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'connecting':
      case 'syncing':
        return 'Connecting...';
      case 'disconnected':
        return 'Disconnected';
      case 'error':
        return 'Error';
      case 'unknown':
      default:
        return 'Checking...';
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
