import { useState, useEffect } from 'react';
import { TelaLink } from './TelaLink';
import { TelaLinkHandler } from './TelaLinkHandler';

interface ContentItem {
  title: string;
  description: string;
  scid: string;
  path: string;
}

const DeroContentExample: React.FC = () => {
  // Example data - in a real app, this might come from an API or config
  const [deroContent] = useState<ContentItem[]>([
    {
      title: "DERO Documentation",
      description: "Official documentation for DERO blockchain",
      scid: "b5c77d84506268755ce96e1a6a25a2db34315a1c638bd215426e5f8f5b9c43dd",
      path: "index.html"
    },
    {
      title: "DERO Explorer",
      description: "Browse and explore the DERO blockchain",
      scid: "a1c638bd215426e5f8f5b9c43ddb5c77d84506268755ce96e1a6a25a2db3431",
      path: "explorer/index.html"
    },
    {
      title: "DERO Community Hub",
      description: "Connect with the DERO community",
      scid: "8496fb92427ae41e4649b934ca495991b71605a32e3b0c44298fc1c549afbf4",
      path: "community.html"
    }
  ]);

  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);

  const handleConnectionStatusChange = (status: boolean) => {
    console.log('Connection status changed:', status);
    setConnectionStatus(status);
  };

  return (
    <div className="dero-content-showcase">
      <TelaLinkHandler onConnectionStatusChange={handleConnectionStatusChange} />
      
      <div className="connection-status">
        <h3>Wallet Connection Status:</h3>
        <div className={`status-indicator ${connectionStatus === true ? 'connected' : connectionStatus === false ? 'disconnected' : 'unknown'}`}>
          {connectionStatus === true ? 'Connected' : connectionStatus === false ? 'Disconnected' : 'Unknown'}
        </div>
        <p className="status-message">
          {connectionStatus === true ? 
            'Your DERO wallet is connected. You can click on the links below to access decentralized content.' : 
            connectionStatus === false ? 
            'Your DERO wallet is not connected. Please open your wallet (e.g., Engram) and ensure XSWD is enabled.' : 
            'Checking wallet connection status...'}
        </p>
      </div>

      <h2>Decentralized Content on DERO</h2>
      <p className="intro-text">
        Browse and access content stored on the DERO blockchain using TELA links.
        Each link will open in your connected DERO wallet after approval.
      </p>

      <div className="content-grid">
        {deroContent.map((item, index) => (
          <div key={index} className="content-card">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <TelaLink 
              scid={item.scid} 
              path={item.path}
              className="tela-link"
            >
              Access Content
            </TelaLink>
          </div>
        ))}
      </div>

      <div className="info-box">
        <h3>How TELA Links Work</h3>
        <p>
          When you click a TELA link, your DERO wallet will request permission to access the content.
          After approval, the content will be fetched from the DERO blockchain and displayed in your browser.
        </p>
        <p>
          TELA links provide secure, censorship-resistant access to decentralized content without relying on centralized servers.
        </p>
      </div>
    </div>
  );
};

export default DeroContentExample; 