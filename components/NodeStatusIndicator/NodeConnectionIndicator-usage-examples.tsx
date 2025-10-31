// Usage Examples for Enhanced Node Connection Indicator
// Showing how to use it in different scenarios

import React, { useState, useEffect } from 'react';
import NodeConnectionIndicator, { NodeConnectionStatus } from './EnhancedNodeConnectionIndicator';

// Example 1: Simple static usage (like your original)
export const SimpleExample: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  
  return (
    <NodeConnectionIndicator 
      status={
        isConnected === true ? 'connected' : 
        isConnected === false ? 'disconnected' : 
        'unknown'
      }
    />
  );
};

// Example 2: DERO Node Connection Checker (like TELA)
export const DeroNodeExample: React.FC = () => {
  const checkDeroNode = async (): Promise<NodeConnectionStatus> => {
    try {
      const response = await fetch('http://127.0.0.1:40402/json_rpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: '1',
          method: 'DERO.GetInfo'
        })
      });
      
      if (!response.ok) throw new Error('Request failed');
      
      const data = await response.json();
      
      // Check if we have valid node info
      if (data.result && data.result.height > 0) {
        // Check if syncing
        const height = data.result.height;
        const stableHeight = data.result.stableheight || 0;
        const heightDiff = height - stableHeight;
        
        if (heightDiff > 10) {
          return 'syncing';
        }
        
        return 'connected';
      }
      
      return 'disconnected';
    } catch (error) {
      console.error('DERO node check failed:', error);
      return 'error';
    }
  };

  return (
    <NodeConnectionIndicator
      onStatusCheck={checkDeroNode}
      checkInterval={5000} // Check every 5 seconds
      onStatusClick={() => window.open('http://127.0.0.1:40402', '_blank')}
      size="normal"
    />
  );
};

// Example 3: Web3/Ethereum Connection (similar pattern)
export const Web3Example: React.FC = () => {
  const checkWeb3Connection = async (): Promise<NodeConnectionStatus> => {
    try {
      if (typeof window.ethereum === 'undefined') {
        return 'disconnected';
      }

      const accounts = await window.ethereum.request({ 
        method: 'eth_accounts' 
      });
      
      if (accounts.length === 0) {
        return 'disconnected';
      }

      // Check if we can get the latest block
      const blockNumber = await window.ethereum.request({
        method: 'eth_blockNumber'
      });
      
      return blockNumber ? 'connected' : 'error';
    } catch (error) {
      return 'error';
    }
  };

  const connectWallet = async () => {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  return (
    <NodeConnectionIndicator
      onStatusCheck={checkWeb3Connection}
      checkInterval={3000}
      onStatusClick={connectWallet}
      showText={true}
    />
  );
};

// Example 4: API Health Check
export const ApiHealthExample: React.FC = () => {
  const checkApiHealth = async (): Promise<NodeConnectionStatus> => {
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.status === 'healthy' ? 'connected' : 'error';
      }
      
      return 'error';
    } catch (error) {
      return 'disconnected';
    }
  };

  return (
    <NodeConnectionIndicator
      onStatusCheck={checkApiHealth}
      checkInterval={10000} // Check every 10 seconds
      size="compact"
      showText={false} // Only show dot for compact version
    />
  );
};

// Example 5: Multiple Status Indicators (like TELA's status bar)
export const StatusBarExample: React.FC = () => {
  const [nodeStatus, setNodeStatus] = useState<NodeConnectionStatus>('unknown');
  const [apiStatus, setApiStatus] = useState<NodeConnectionStatus>('unknown');
  
  const checkNodeStatus = async (): Promise<NodeConnectionStatus> => {
    // Your node checking logic here
    return 'connected';
  };
  
  const checkApiStatus = async (): Promise<NodeConnectionStatus> => {
    // Your API checking logic here
    return 'connected';
  };

  return (
    <div style={{ 
      display: 'flex', 
      gap: '1rem', 
      alignItems: 'center',
      padding: '0.5rem 1rem',
      background: 'rgba(0,0,0,0.1)',
      borderRadius: '8px'
    }}>
      <NodeConnectionIndicator
        onStatusCheck={checkNodeStatus}
        checkInterval={5000}
        size="compact"
      />
      
      <NodeConnectionIndicator
        onStatusCheck={checkApiStatus}
        checkInterval={10000}
        size="compact"
      />
      
      <span style={{ color: '#666', fontSize: '0.8rem' }}>
        System Health
      </span>
    </div>
  );
};

// Example 6: Manual Control (like your original approach)
export const ManualControlExample: React.FC = () => {
  const [status, setStatus] = useState<NodeConnectionStatus>('unknown');
  
  const handleConnect = () => {
    setStatus('connecting');
    
    // Simulate connection process
    setTimeout(() => {
      setStatus(Math.random() > 0.5 ? 'connected' : 'error');
    }, 2000);
  };

  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <NodeConnectionIndicator
        status={status}
        onStatusClick={handleConnect}
        size="large"
      />
      
      <button onClick={handleConnect}>
        {status === 'connecting' ? 'Connecting...' : 'Connect'}
      </button>
    </div>
  );
};

// Example 7: Custom Hook for Node Status
export const useNodeConnection = (
  checkFunction: () => Promise<NodeConnectionStatus>,
  interval: number = 5000
) => {
  const [status, setStatus] = useState<NodeConnectionStatus>('unknown');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    const performCheck = async () => {
      try {
        const newStatus = await checkFunction();
        setStatus(newStatus);
        setLastChecked(new Date());
      } catch (error) {
        setStatus('error');
        setLastChecked(new Date());
      }
    };
    
    // Initial check
    performCheck();
    
    // Set up interval
    intervalId = setInterval(performCheck, interval);
    
    return () => clearInterval(intervalId);
  }, [checkFunction, interval]);
  
  return { status, lastChecked };
};

// Using the custom hook
export const CustomHookExample: React.FC = () => {
  const checkMyNode = async (): Promise<NodeConnectionStatus> => {
    // Your checking logic
    return 'connected';
  };
  
  const { status, lastChecked } = useNodeConnection(checkMyNode, 3000);
  
  return (
    <div>
      <NodeConnectionIndicator status={status} />
      {lastChecked && (
        <small style={{ color: '#666', marginLeft: '0.5rem' }}>
          Last checked: {lastChecked.toLocaleTimeString()}
        </small>
      )}
    </div>
  );
};

// Example 8: Integration with React Query/SWR
export const ReactQueryExample: React.FC = () => {
  // If you're using React Query or SWR, you can integrate like this:
  
  /*
  const { data: nodeInfo, error, isLoading } = useQuery(
    'nodeStatus',
    checkNodeStatus,
    { refetchInterval: 5000 }
  );
  
  const getStatusFromQuery = (): NodeConnectionStatus => {
    if (isLoading) return 'connecting';
    if (error) return 'error';
    if (nodeInfo?.connected) return 'connected';
    return 'disconnected';
  };
  
  return <NodeConnectionIndicator status={getStatusFromQuery()} />;
  */
  
  return (
    <div>
      <p>See comments in code for React Query integration example</p>
      <NodeConnectionIndicator status="connected" />
    </div>
  );
};
