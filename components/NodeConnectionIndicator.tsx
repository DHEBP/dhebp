import React from 'react';
import { useEffect, useState } from 'react';

interface NodeConnectionIndicatorProps {
  isConnected?: boolean | null;
}

const NodeConnectionIndicator: React.FC<NodeConnectionIndicatorProps> = ({ 
  isConnected = null 
}) => {
  return (
    <div className="node-connection-indicator">
      <div className={`status-dot ${
        isConnected === true ? 'connected' : 
        isConnected === false ? 'disconnected' : 
        'unknown'
      }`}></div>
      <span className="status-text">
        {isConnected === true ? 'Node Connected' : 
         isConnected === false ? 'Node Disconnected' : 
         'Checking Node...'}
      </span>
    </div>
  );
};

export default NodeConnectionIndicator; 