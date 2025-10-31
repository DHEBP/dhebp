/**
 * Standalone Node Status Indicator
 * Extracted from TELA Explorer for reuse in other projects
 * 
 * Usage:
 * 1. Include this script in your HTML
 * 2. Add the HTML structure for status indicators
 * 3. Call NodeStatusIndicator.init() when your page loads
 * 4. Call NodeStatusIndicator.updateStatus(status) to update the indicator
 */

window.NodeStatusIndicator = {
    name: 'node-status-indicator',
    version: '1.0.0',
    
    // Configuration
    config: {
        nodeStatusSelector: '#connection-status .status-dot',
        privacyStatusSelector: '#privacy-status .status-dot',
        enablePrivacyStatus: true,
        enableConsoleLogging: true
    },

    // Initialize the status indicator system
    init: function(customConfig = {}) {
        // Merge custom config with defaults
        this.config = { ...this.config, ...customConfig };
        
        if (this.config.enableConsoleLogging) {
            console.log('🟢 Node Status Indicator initialized');
        }
        
        // Set initial status
        this.updateStatus('connecting');
        
        return this;
    },

    // Main function to update all status indicators
    updateStatus: function(status) {
        this.updateNodeStatus(status);
        
        if (this.config.enablePrivacyStatus) {
            this.updatePrivacyStatus(status);
        }
        
        if (this.config.enableConsoleLogging) {
            console.log(`📊 Status updated: ${status}`);
        }
    },

    // Update the node status indicator
    updateNodeStatus: function(status) {
        const nodeDot = document.querySelector(this.config.nodeStatusSelector);
        
        if (nodeDot) {
            // Reset classes
            nodeDot.className = 'status-dot';
            
            // Apply status-specific styling
            switch (status) {
                case 'connected':
                case 'online':
                case 'ready':
                    nodeDot.classList.add('dot-green');
                    break;
                case 'connecting':
                case 'syncing':
                case 'loading':
                    nodeDot.classList.add('dot-yellow');
                    break;
                case 'disconnected':
                case 'offline':
                case 'error':
                case 'failed':
                default:
                    nodeDot.classList.add('dot-red');
                    break;
            }
        }
    },

    // Update privacy/secondary status indicator
    updatePrivacyStatus: function(status) {
        const privacyDot = document.querySelector(this.config.privacyStatusSelector);
        
        if (privacyDot) {
            // Reset classes
            privacyDot.className = 'status-dot';
            
            // Apply status-specific styling
            switch (status) {
                case 'connected':
                case 'secure':
                case 'online':
                    privacyDot.classList.add('dot-green');
                    break;
                case 'connecting':
                case 'warning':
                case 'checking':
                    privacyDot.classList.add('dot-yellow');
                    break;
                case 'disconnected':
                case 'insecure':
                case 'error':
                default:
                    privacyDot.classList.add('dot-red');
                    break;
            }
        }
    },

    // Get current status based on dot color
    getCurrentStatus: function() {
        const nodeDot = document.querySelector(this.config.nodeStatusSelector);
        if (!nodeDot) return 'unknown';
        
        if (nodeDot.classList.contains('dot-green')) return 'connected';
        if (nodeDot.classList.contains('dot-yellow')) return 'connecting';
        if (nodeDot.classList.contains('dot-red')) return 'disconnected';
        return 'unknown';
    },

    // Utility function to start periodic status checks
    startPeriodicCheck: function(checkFunction, interval = 5000) {
        if (typeof checkFunction !== 'function') {
            console.error('❌ checkFunction must be a function');
            return null;
        }

        const intervalId = setInterval(async () => {
            try {
                const status = await checkFunction();
                if (status) {
                    this.updateStatus(status);
                }
            } catch (error) {
                console.error('❌ Periodic check failed:', error);
                this.updateStatus('error');
            }
        }, interval);

        if (this.config.enableConsoleLogging) {
            console.log(`⏰ Periodic status check started (${interval}ms interval)`);
        }

        return intervalId;
    },

    // Stop periodic checking
    stopPeriodicCheck: function(intervalId) {
        if (intervalId) {
            clearInterval(intervalId);
            if (this.config.enableConsoleLogging) {
                console.log('⏹️ Periodic status check stopped');
            }
        }
    }
};

// Auto-initialize if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Don't auto-init, let the user call init() manually
    });
} else {
    // DOM is already loaded, but still don't auto-init
}
