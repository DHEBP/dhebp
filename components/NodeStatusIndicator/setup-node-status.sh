#!/bin/bash

# Node Status Indicator Setup Script
# Usage: ./setup-node-status.sh [target-directory]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default target directory
TARGET_DIR="${1:-.}"

echo -e "${BLUE}🚀 Node Status Indicator Setup${NC}"
echo -e "${BLUE}================================${NC}"

# Check if target directory exists
if [ ! -d "$TARGET_DIR" ]; then
    echo -e "${RED}❌ Error: Directory '$TARGET_DIR' does not exist${NC}"
    exit 1
fi

echo -e "${YELLOW}📁 Target directory: $TARGET_DIR${NC}"

# Copy files
echo -e "${YELLOW}📋 Copying files...${NC}"

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Copy the necessary files
cp "$SCRIPT_DIR/node-status-indicator.js" "$TARGET_DIR/"
cp "$SCRIPT_DIR/node-status-styles.css" "$TARGET_DIR/"
cp "$SCRIPT_DIR/node-status-example.html" "$TARGET_DIR/node-status-example.html"

echo -e "${GREEN}✅ Files copied successfully!${NC}"

# Create integration instructions
cat > "$TARGET_DIR/NODE-STATUS-INTEGRATION.md" << 'EOF'
# Node Status Indicator Integration Guide

## Files Included
- `node-status-indicator.js` - Main JavaScript functionality
- `node-status-styles.css` - Required CSS styles
- `node-status-example.html` - Working example
- `NODE-STATUS-INTEGRATION.md` - This guide

## Quick Setup

### 1. Include in your HTML
```html
<link rel="stylesheet" href="node-status-styles.css">
<script src="node-status-indicator.js"></script>
```

### 2. Add HTML structure
```html
<div class="status-bar">
    <div class="status-indicators-mini">
        <div id="connection-status" class="status-mini" title="Node Connection Status">
            <span class="status-dot"></span>
            <span class="status-label">NODE</span>
        </div>
    </div>
</div>
```

### 3. Initialize and use
```javascript
// Initialize
NodeStatusIndicator.init();

// Update status
NodeStatusIndicator.updateStatus('connected');    // Green dot
NodeStatusIndicator.updateStatus('connecting');   // Yellow dot (pulsing)
NodeStatusIndicator.updateStatus('disconnected'); // Red dot
```

## Available Status Values
- `connected`, `online`, `ready` → Green dot
- `connecting`, `syncing`, `loading` → Yellow dot (pulsing)
- `disconnected`, `offline`, `error`, `failed` → Red dot

## Advanced Usage

### Custom Configuration
```javascript
NodeStatusIndicator.init({
    nodeStatusSelector: '#my-custom-status .dot',
    enablePrivacyStatus: false,
    enableConsoleLogging: false
});
```

### Periodic Status Checking
```javascript
const checkInterval = NodeStatusIndicator.startPeriodicCheck(async () => {
    // Your connection check logic here
    try {
        const response = await fetch('/api/status');
        const data = await response.json();
        return data.connected ? 'connected' : 'disconnected';
    } catch (error) {
        return 'error';
    }
}, 5000); // Check every 5 seconds

// Stop checking when needed
NodeStatusIndicator.stopPeriodicCheck(checkInterval);
```

### Get Current Status
```javascript
const currentStatus = NodeStatusIndicator.getCurrentStatus();
console.log('Current status:', currentStatus);
```

## Example Integration for Different Projects

### DERO/Blockchain Projects
```javascript
async function checkDeroNodeStatus() {
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
        const data = await response.json();
        return data.result ? 'connected' : 'disconnected';
    } catch (error) {
        return 'disconnected';
    }
}

// Start checking DERO node status
NodeStatusIndicator.startPeriodicCheck(checkDeroNodeStatus, 3000);
```

### Web3/Ethereum Projects
```javascript
async function checkWeb3Status() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            return accounts.length > 0 ? 'connected' : 'disconnected';
        } catch (error) {
            return 'error';
        }
    }
    return 'disconnected';
}

NodeStatusIndicator.startPeriodicCheck(checkWeb3Status, 2000);
```

### API/Server Status
```javascript
async function checkApiStatus() {
    try {
        const response = await fetch('/api/health');
        return response.ok ? 'connected' : 'error';
    } catch (error) {
        return 'disconnected';
    }
}

NodeStatusIndicator.startPeriodicCheck(checkApiStatus, 10000);
```

## Customization

### Custom Colors
Add to your CSS:
```css
.dot-custom-blue {
    background-color: #007bff;
    box-shadow: 0 0 5px #007bff;
}
```

Then modify the JavaScript to use your custom class.

### Different Sizes
```css
.status-dot-large {
    width: 12px;
    height: 12px;
}
```

## Troubleshooting

1. **Status not updating**: Check that the HTML structure matches the expected selectors
2. **Styles not applied**: Ensure `node-status-styles.css` is loaded before the page content
3. **JavaScript errors**: Check browser console for initialization errors

## Browser Compatibility
- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

For older browsers, you may need to add polyfills for:
- `async/await`
- `fetch()`
- `Object spread operator (...)`
EOF

echo -e "${GREEN}📖 Created integration guide: NODE-STATUS-INTEGRATION.md${NC}"

# Make the script executable if it was copied
if [ -f "$TARGET_DIR/setup-node-status.sh" ]; then
    chmod +x "$TARGET_DIR/setup-node-status.sh"
fi

echo -e "${GREEN}🎉 Setup complete!${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo -e "1. Open node-status-example.html in your browser to see it working"
echo -e "2. Read NODE-STATUS-INTEGRATION.md for integration instructions"
echo -e "3. Copy the HTML structure and JavaScript calls to your project"

echo -e "${YELLOW}💡 Tip: Run 'open node-status-example.html' to view the demo${NC}"
