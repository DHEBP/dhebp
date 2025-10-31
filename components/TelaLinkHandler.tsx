import { useEffect, useRef, useState } from 'react';
import { updateConnectionStatus } from '../theme.config';

interface TelaLinkHandlerProps {
  onConnectionStatusChange?: (status: boolean) => void;
  disableAutoOpen?: boolean; // New prop to control automatic URL opening
}

// Interface for tracking pending request metadata
interface PendingRequest {
  telaLink: string;
  scid: string | null;
  timestamp: number;
}

export const TelaLinkHandler: React.FC<TelaLinkHandlerProps> = ({ 
  onConnectionStatusChange,
  disableAutoOpen = true // Default to true to prevent duplicate tabs
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const MAX_RECONNECT_ATTEMPTS = 3; // Reduced from 5 - only need to try each mainnet port once
  // Keep track of rejected app IDs
  const rejectedAppIdsRef = useRef<Set<string>>(new Set());
  // Track pending link requests
  const pendingRequestsRef = useRef<Map<string, PendingRequest>>(new Map());
  // Track already opened URLs to prevent duplicates
  const openedUrlsRef = useRef<Set<string>>(new Set());
  // Track the last opened time to avoid rapid-fire openings
  const lastOpenedTimeRef = useRef<number>(0);
  // Track if a connection has been attempted in this session/page load
  const connectionAttemptedRef = useRef<boolean>(false);
  // Track if we're currently in a connection attempt
  const isConnectingRef = useRef<boolean>(false);
  // Track TELA app ports that are in use (port => SCID)
  const usedPortsRef = useRef<Map<number, string>>(new Map());
  // Track last used port to increment for new apps
  const lastUsedPortRef = useRef<number>(8085); // Start from one below 8086 as we'll increment

  // Alternative ports to try (mainnet only)
  const ports = [44326, 10103]; // XSWD standard (Engram), DERO mainnet wallet RPC
  
  // Function to generate a random 64-character hex string for app ID
  const generateAppId = () => {
    return Array.from({length: 64}, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  };

  // XSWD application data with dynamically generated ID
  const getApplicationData = () => ({
    id: generateAppId(), // Generate a new random ID each time
    name: "Dero Quick Start Guide",
    description: "The Best Way to Get Started with Dero",
    url: typeof window !== 'undefined' ? window.location.origin : ''
  });

  const connectWebSocket = (attemptNumber = 0) => {
    // Check if socket is already open
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }
    
    // Check if we're at max attempts
    if (attemptNumber >= MAX_RECONNECT_ATTEMPTS) {
      // Silent fail - this is expected when Engram isn't running
      // console.log(`No XSWD connection available. Engram wallet not detected.`);
      connectionAttemptedRef.current = false; // Reset so user can try again later
      isConnectingRef.current = false;
      return;
    }

    // If we're in the middle of connecting and this isn't a retry, exit
    if (isConnectingRef.current && attemptNumber === 0) {
      console.log('Already attempting connection, skipping duplicate attempt');
      return;
    }
    
    // If this is a fresh connection (not a retry) and we've already attempted once
    if (attemptNumber === 0 && connectionAttemptedRef.current) {
      console.log('Connection already attempted in this session, skipping duplicate attempt');
      return;
    }

    // Mark that we're connecting and have attempted
    isConnectingRef.current = true;
    connectionAttemptedRef.current = true;
    
    // Close any existing connection
    if (socketRef.current) {
      try {
        socketRef.current.close();
      } catch (e) {
        console.error("Error closing existing connection:", e);
      }
      // Set to null after closing
      socketRef.current = null;
    }
    
    // Choose which port to try based on the attempt number
    const portIndex = attemptNumber % ports.length;
    const port = ports[portIndex];
    
    // Create a new WebSocket connection
    const wsUrl = `ws://localhost:${port}/xswd`;
    console.log(`Attempting connection to ${wsUrl} (attempt ${attemptNumber + 1})`);
    
    try {
      socketRef.current = new WebSocket(wsUrl);
      setReconnectAttempts(attemptNumber);

      socketRef.current.onopen = () => {
        console.log(`WebSocket connected to ${wsUrl}`);
        setIsConnected(true);
        onConnectionStatusChange?.(true);
        updateConnectionStatus(true);
        isConnectingRef.current = false;
        
        // Generate a fresh app ID for this connection attempt
        // Make sure it's not previously rejected
        let appData;
        do {
          appData = getApplicationData();
        } while (rejectedAppIdsRef.current.has(appData.id));
        
        // Send the application data
        console.log('Sending application data:', appData);
        sendData(appData);
      };

      socketRef.current.onclose = (event) => {
        console.log(`WebSocket disconnected. Code: ${event.code}, Reason: ${event.reason || 'No reason provided'}`);
        
        // If socket is closing because of page navigation, don't try to reconnect
        if (event.wasClean && event.code === 1000) {
          console.log('Clean close detected (likely page navigation)');
          isConnectingRef.current = false;
          // Don't attempt to reconnect immediately
          return;
        }
        
        // Only change connection status if we weren't already authorized
        // This prevents temporary disconnects during page refreshes from 
        // showing "disconnected" when the wallet has already authorized us
        if (!isAuthorized) {
          setIsConnected(false);
          onConnectionStatusChange?.(false);
          updateConnectionStatus(false);
        } else {
          console.log('Socket closed but keeping authorized status');
        }
        
        // Try the next connection after a delay
        setTimeout(() => {
          connectWebSocket(attemptNumber + 1);
        }, 1000);
      };

      socketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        
        // Only change status if not already authorized
        if (!isAuthorized) {
          setIsConnected(false);
          onConnectionStatusChange?.(false);
          updateConnectionStatus(false);
        } else {
          console.log('Socket error but keeping authorized status');
        }
        
        // Close will be called after error, triggering reconnect
      };

      socketRef.current.onmessage = (event) => {
        const response = JSON.parse(event.data);
        console.log('Received:', response);

        // Check for app ID already used error
        if (response.accepted === false && response.message?.includes("App ID is already used")) {
          console.log("App ID already in use, will try with a new ID on next attempt");
          
          // Store the rejected app ID
          if (response.id) {
            rejectedAppIdsRef.current.add(response.id);
          }
          
          // Force close and attempt reconnection with new ID
          if (socketRef.current) {
            // Use a small delay before closing to avoid too rapid reconnection
            setTimeout(() => {
              if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
              }
              // Try with same port but new app ID
              connectWebSocket(attemptNumber);
            }, 500);
          }
          return;
        }

        // Check for registration confirmation
        if (response.accepted === true) {
          console.log("Application registration accepted by XSWD!");
          
          // Set as authorized - this remains true even across temporary disconnects
          setIsAuthorized(true);
          
          // Reset reconnect attempts on successful connection
          setReconnectAttempts(0);
          
          // Log the address if provided
          if (response.address) {
            console.log("Wallet address:", response.address);
          }
          
          // Make handleTelaLink globally available
          window.handleTelaLink = handleTelaLink;
          console.log("TELA link handler initialized and exposed globally.");
          
          // Reset opened URLs on new connection
          openedUrlsRef.current.clear();
        }
        
        // Handle TELA link result (from HandleTELALinks call)
        if (response.id && (response.result || response.error)) {
          // Check if this is a TELA link response
          if (response.result?.telaLinkResult) {
            const url = response.result.telaLinkResult;
            console.log("Received TELA link result:", url);
            
            // Parse the URL to get port and SCID
            try {
              const parsedUrl = new URL(url);
              const port = parseInt(parsedUrl.port);
              
              // Extract SCID from the original request if possible
              const pendingRequest = pendingRequestsRef.current.get(response.id);
              const originalRequestScid = pendingRequest?.scid || null;
              
              // Store this port as used by this SCID
              if (port && originalRequestScid) {
                usedPortsRef.current.set(port, originalRequestScid);
                console.log(`Recording port ${port} as used by SCID ${originalRequestScid}`);
                
                // Update last used port if this is higher
                if (port > lastUsedPortRef.current) {
                  lastUsedPortRef.current = port;
                  console.log(`Updated last used port to ${lastUsedPortRef.current}`);
                }
              }
              
              // Clean up the pending request
              pendingRequestsRef.current.delete(response.id);
            } catch (e) {
              console.error("Failed to parse TELA response URL:", e);
            }
            
            // Check if we've already opened this URL recently (within the last 5 seconds)
            const now = Date.now();
            const isDuplicate = openedUrlsRef.current.has(url);
            const isTooSoon = (now - lastOpenedTimeRef.current) < 5000;
            
            if (!isDuplicate && !isTooSoon) {
              // Remember this URL to prevent duplicates
              openedUrlsRef.current.add(url);
              lastOpenedTimeRef.current = now;
              
              // Only open the URL if auto-open is enabled
              if (!disableAutoOpen && url && url.startsWith('http')) {
                console.log(`Opening URL: ${url}`);
                window.open(url, '_blank');
                
                // Clean up the opened URL set after a delay
                setTimeout(() => {
                  openedUrlsRef.current.delete(url);
                }, 10000); // Remove from tracking after 10 seconds
              } else {
                // Just log that we received the URL but aren't opening it automatically
                console.log(`Auto-open is disabled. URL: ${url}`);
              }
            } else {
              console.log(`Skipping duplicate or rapid URL open: ${url}`);
            }
          } else if (response.error) {
            const pendingRequest = pendingRequestsRef.current.get(response.id);
            const originalRequestScid = pendingRequest?.scid || null;
            pendingRequestsRef.current.delete(response.id);
            
            // Check if this is a port conflict error
            if (response.error.message && response.error.message.includes("cloning") && 
                response.error.message.includes("was not successful")) {
              console.error("Port conflict or cloning error, attempting with a higher port");
              
              // If we have the original SCID, try to serve it on a different port
              if (originalRequestScid) {
                // Find the next available port (increment from last used port)
                const nextPort = lastUsedPortRef.current + 1;
                lastUsedPortRef.current = nextPort;
                
                console.log(`Retrying with port ${nextPort} for SCID ${originalRequestScid}`);
                
                // Retry with the modified telaLink
                const modifiedTelaLink = `tela://open/${originalRequestScid}/index.html?port=${nextPort}`;
                handleTelaLinkInternal(modifiedTelaLink, originalRequestScid);
                return;
              }
            }
            
            // Handle other error responses
            console.error("TELA link error:", response.error);
            
            // Show user-friendly error message based on error code
            let errorMessage = "Error processing TELA link";
            
            if (response.error.message) {
              if (response.error.message.includes("not found")) {
                errorMessage = "TELA application not found. The SCID may be invalid or not deployed on your node.";
              } else if (response.error.message.includes("timeout")) {
                errorMessage = "Timeout while processing TELA link. Please try again.";
              } else {
                errorMessage = `TELA link error: ${response.error.message}`;
              }
            }
            
            // Show an alert if we have a meaningful error
            if (errorMessage) {
              alert(errorMessage);
            }
          }
        }
      };
    } catch (error) {
      console.error(`Error creating WebSocket: ${error}`);
      // Try the next connection after a delay
      setTimeout(() => {
        connectWebSocket(attemptNumber + 1);
      }, 1000);
    }
  };

  const sendData = (data: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      try {
        socketRef.current.send(JSON.stringify(data));
        console.log("Data sent to the server:", data);
      } catch (error) {
        console.error("Failed to send data:", error);
      }
    } else {
      console.log("WebSocket is not open");
    }
  };

  // Extract SCID from a tela link
  const extractScidFromTelaLink = (telaLink: string): string | null => {
    const match = telaLink.match(/tela:\/\/open\/([a-f0-9]+)/i);
    return match ? match[1] : null;
  };

  // Internal implementation that tracks request metadata
  const handleTelaLinkInternal = (telaLink: string, scid: string | null = null) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.log("Wallet is not connected");
      alert("Wallet is not connected. Please ensure your DERO wallet with XSWD is running.");
      return;
    }
    
    // If we don't have a SCID yet, try to extract it from the link
    if (!scid) {
      scid = extractScidFromTelaLink(telaLink);
    }
    
    // Generate a unique request ID
    const requestId = Date.now().toString();
    
    // This is a proper JSON-RPC request for HandleTELALinks
    const call = {
      jsonrpc: "2.0",
      id: requestId, 
      method: "HandleTELALinks",
      params: {
        telaLink: telaLink
      }
    };
    
    // Store the request metadata for potential retries
    pendingRequestsRef.current.set(requestId, { 
      telaLink,
      scid,
      timestamp: Date.now()
    });

    sendData(call);
  };

  // Public API that's exposed globally
  const handleTelaLink = (telaLink: string) => {
    // Check if URL has a port parameter already
    if (telaLink.includes("?port=")) {
      handleTelaLinkInternal(telaLink);
      return;
    }
    
    // Extract the SCID from the link
    const scid = extractScidFromTelaLink(telaLink);
    if (!scid) {
      console.error("Invalid TELA link format, couldn't extract SCID:", telaLink);
      alert("Invalid TELA link format");
      return;
    }
    
    // Check if we've already served this SCID on a specific port
    // Use Array.from to convert Map entries to array for iteration
    const portEntries = Array.from(usedPortsRef.current.entries());
    for (const [port, existingScid] of portEntries) {
      if (existingScid === scid) {
        console.log(`SCID ${scid} is already being served on port ${port}`);
        // Just reuse the same port
        const modifiedTelaLink = `${telaLink}?port=${port}`;
        handleTelaLinkInternal(modifiedTelaLink, scid);
        return;
      }
    }
    
    // If this is a new SCID, increment the last used port
    const nextPort = lastUsedPortRef.current + 1;
    lastUsedPortRef.current = nextPort;
    
    console.log(`Using port ${nextPort} for new SCID ${scid}`);
    
    // Modify the telaLink to include the port parameter
    const modifiedTelaLink = `${telaLink}?port=${nextPort}`;
    handleTelaLinkInternal(modifiedTelaLink, scid);
  };

  useEffect(() => {
    // Reset the connection flags on component mount
    connectionAttemptedRef.current = false;
    isConnectingRef.current = false;
    
    // Clear port tracking
    usedPortsRef.current.clear();
    lastUsedPortRef.current = 8085; // Reset to starting port

    // Start the connection process
    connectWebSocket();

    // Cleanup function
    return () => {
      if (socketRef.current) {
        // Use a clean close when component unmounts
        try {
          socketRef.current.close(1000, "Page navigation");
        } catch (e) {
          console.error("Error closing connection during cleanup:", e);
        }
        socketRef.current = null;
      }
      // Clean up global handler
      delete window.handleTelaLink;
      // Reset connection flags
      connectionAttemptedRef.current = false;
      isConnectingRef.current = false;
      // Clear port tracking
      usedPortsRef.current.clear();
    };
  }, []);

  // Add a visible status indicator (only in development)
  if (process.env.NODE_ENV === 'development') {
    const indicatorStyle = {
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      padding: '5px 10px',
      borderRadius: '5px',
      fontSize: '12px',
      fontWeight: 'bold',
      zIndex: 9999,
      opacity: 0.9,
      backgroundColor: isAuthorized ? '#4CAF50' : isConnected ? '#FFC107' : '#F44336',
      color: 'white',
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
    };

    return (
      <div 
        style={indicatorStyle as React.CSSProperties} 
        title={isAuthorized ? 'Wallet authorized' : isConnected ? 'Connecting to wallet...' : 'Wallet disconnected'}
        onClick={() => {
          if (!isConnected) {
            // Reset connection flags on manual reconnect
            connectionAttemptedRef.current = false;
            isConnectingRef.current = false;
            // Try reconnecting on click
            connectWebSocket();
          }
        }}
      >
        {isAuthorized ? 'DERO Wallet: Authorized ✓' : isConnected ? 'DERO Wallet: Connecting...' : 'DERO Wallet: Disconnected'}
      </div>
    );
  }

  return null; // This is a utility component, no UI needed in production
}; 