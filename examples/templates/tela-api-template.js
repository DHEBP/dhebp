/**
 * TELA API Template Library
 * Complete reference implementation with all DERO/TELA API calls
 * 
 * Usage: Clone this template and replace placeholder variables with your values
 * Deploy as: tela-api-template.lib
 * 
 * Size: ~17KB (optimized for TELA deployment)
 * Version: 1.0.0
 */

(function() {
    'use strict';
    
    // ============================================================================
    // CONFIGURATION & SETUP
    // ============================================================================
    
    const TELA_API_TEMPLATE = {
        name: 'tela-api-template',
        version: '1.0.0',
        description: 'Complete DERO/TELA API template with all available calls',
        
        // Connection settings
        config: {
            XSWD_ENDPOINT: 'ws://127.0.0.1:44326/xswd',
            DEFAULT_TIMEOUT: 30000,
            DEFAULT_RINGSIZE: 2,
            APP_ID: 'YOUR_APP_ID_HERE',
            APP_NAME: 'YOUR_APP_NAME_HERE',
            APP_DESCRIPTION: 'YOUR_APP_DESCRIPTION_HERE',
            APP_URL: 'http://localhost:' + (typeof location !== 'undefined' ? location.port : '8080')
        },
        
        // Connection state
        socket: null,
        connected: false,
        pendingRequests: new Map(),
        requestId: 0,
        
        // ============================================================================
        // CONNECTION MANAGEMENT
        // ============================================================================
        
        async initialize() {
            try {
                console.log('🔧 Initializing TELA API Template...');
                return await this.connectXSWD();
            } catch (error) {
                console.error('❌ TELA API initialization failed:', error);
                return false;
            }
        },
        
        async connectXSWD() {
            return new Promise((resolve, reject) => {
                const applicationData = {
                    id: this.config.APP_ID,
                    name: this.config.APP_NAME,
                    description: this.config.APP_DESCRIPTION,
                    url: this.config.APP_URL
                };
                
                this.socket = new WebSocket(this.config.XSWD_ENDPOINT);
                let handshakeComplete = false;
                
                this.socket.onopen = () => {
                    console.log('🔗 XSWD connection opened');
                    this.socket.send(JSON.stringify(applicationData));
                    
                    setTimeout(() => {
                        if (!handshakeComplete) {
                            reject(new Error('Handshake timeout'));
                        }
                    }, 8000);
                };
                
                this.socket.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data);
                        
                        if (message.accepted) {
                            handshakeComplete = true;
                            this.connected = true;
                            console.log('✅ XSWD connected successfully');
                            resolve(true);
                        } else {
                            this.handleResponse(message);
                        }
                    } catch (error) {
                        console.error('Message parse error:', error);
                    }
                };
                
                this.socket.onclose = () => {
                    this.connected = false;
                    console.log('🔌 XSWD connection closed');
                    if (!handshakeComplete) {
                        reject(new Error('Connection closed during handshake'));
                    }
                };
                
                this.socket.onerror = (error) => {
                    console.error('🚨 XSWD connection error:', error);
                    reject(error);
                };
            });
        },
        
        handleResponse(message) {
            if (message.jsonrpc && message.id) {
                const id = message.id.toString();
                if (this.pendingRequests.has(id)) {
                    const { resolve, reject } = this.pendingRequests.get(id);
                    this.pendingRequests.delete(id);
                    
                    if (message.error) {
                        reject(new Error(message.error.message || 'RPC call failed'));
                    } else {
                        resolve(message.result);
                    }
                }
            }
        },
        
        async call(method, params = {}) {
            if (!this.connected) {
                throw new Error('Not connected to XSWD');
            }
            
            return new Promise((resolve, reject) => {
                const id = (++this.requestId).toString();
                const request = {
                    jsonrpc: '2.0',
                    method: method,
                    id: id,
                    params: Object.keys(params).length > 0 ? params : undefined
                };
                
                this.pendingRequests.set(id, { resolve, reject });
                this.socket.send(JSON.stringify(request));
                
                // Set timeout
                setTimeout(() => {
                    if (this.pendingRequests.has(id)) {
                        this.pendingRequests.delete(id);
                        reject(new Error(`Request timeout (${this.config.DEFAULT_TIMEOUT}ms)`));
                    }
                }, this.config.DEFAULT_TIMEOUT);
            });
        },
        
        // ============================================================================
        // DERO CORE RPC METHODS
        // ============================================================================
        
        // Network Information
        async getNetworkInfo() {
            return await this.call('DERO.GetInfo');
        },
        
        async getHeight() {
            return await this.call('DERO.GetHeight');
        },
        
        async getBlockCount() {
            return await this.call('DERO.GetBlockCount');
        },
        
        // Block Operations
        async getBlock(heightOrHash) {
            const params = typeof heightOrHash === 'number' 
                ? { height: heightOrHash }
                : { hash: heightOrHash };
            return await this.call('DERO.GetBlock', params);
        },
        
        async getLastBlockHeader() {
            return await this.call('DERO.GetLastBlockHeader');
        },
        
        async getBlockHeaderByHeight(height) {
            return await this.call('DERO.GetBlockHeaderByHeight', { height });
        },
        
        async getBlockHeaderByHash(hash) {
            return await this.call('DERO.GetBlockHeaderByHash', { hash });
        },
        
        // Transaction Operations
        async getTransaction(txHash) {
            return await this.call('DERO.GetTransaction', { txs_hashes: [txHash] });
        },
        
        async getTransactionPool() {
            return await this.call('DERO.GetTxPool');
        },
        
        // Smart Contract Operations
        async getSmartContract(scid, includeCode = true, includeVariables = true) {
            const params = { scid };
            if (includeCode) params.code = true;
            if (includeVariables) params.variables = true;
            return await this.call('DERO.GetSC', params);
        },
        
        async nameToAddress(name) {
            return await this.call('DERO.NameToAddress', { name });
        },
        
        // ============================================================================
        // WALLET OPERATIONS
        // ============================================================================
        
        async getAddress() {
            return await this.call('GetAddress');
        },
        
        async getBalance(scid = null) {
            const params = scid ? { scid } : {};
            return await this.call('GetBalance', params);
        },
        
        async transfer(destinations, scid = null, ringsize = null) {
            const params = {
                destinations: destinations, // [{ address: 'dero1...', amount: 1000000000000 }]
                ringsize: ringsize || this.config.DEFAULT_RINGSIZE
            };
            if (scid) params.scid = scid;
            return await this.call('Transfer', params);
        },
        
        async makeIntegratedAddress(paymentId) {
            return await this.call('MakeIntegratedAddress', { payment_id: paymentId });
        },
        
        async splitIntegratedAddress(integratedAddress) {
            return await this.call('SplitIntegratedAddress', { integrated_address: integratedAddress });
        },
        
        // ============================================================================
        // GNOMON INDEXER METHODS
        // ============================================================================
        
        // Basic Queries
        async gnomonGetLastIndexHeight() {
            return await this.call('Gnomon.GetLastIndexHeight');
        },
        
        async gnomonGetTxCount(txType) {
            return await this.call('Gnomon.GetTxCount', { txType });
        },
        
        // Smart Contract Queries
        async gnomonGetOwner(scid) {
            return await this.call('Gnomon.GetOwner', { scid });
        },
        
        async gnomonGetAllOwnersAndSCIDs() {
            return await this.call('Gnomon.GetAllOwnersAndSCIDs');
        },
        
        async gnomonGetAllSCIDVariableDetails(scid) {
            return await this.call('Gnomon.GetAllSCIDVariableDetails', { scid });
        },
        
        // Variable Queries
        async gnomonGetSCIDKeysByValue(scid, value, height) {
            return await this.call('Gnomon.GetSCIDKeysByValue', { scid, value, height });
        },
        
        async gnomonGetSCIDValuesByKey(scid, key, height) {
            return await this.call('Gnomon.GetSCIDValuesByKey', { scid, key, height });
        },
        
        async gnomonGetLiveSCIDKeysByValue(scid, value) {
            return await this.call('Gnomon.GetLiveSCIDKeysByValue', { scid, value });
        },
        
        async gnomonGetLiveSCIDValuesByKey(scid, key) {
            return await this.call('Gnomon.GetLiveSCIDValuesByKey', { scid, key });
        },
        
        // Transaction History
        async gnomonGetAllNormalTxWithSCIDByAddr(address) {
            return await this.call('Gnomon.GetAllNormalTxWithSCIDByAddr', { address });
        },
        
        async gnomonGetAllNormalTxWithSCIDBySCID(scid) {
            return await this.call('Gnomon.GetAllNormalTxWithSCIDBySCID', { scid });
        },
        
        async gnomonGetAllSCIDInvokeDetails(scid) {
            return await this.call('Gnomon.GetAllSCIDInvokeDetails', { scid });
        },
        
        async gnomonGetAllSCIDInvokeDetailsByEntrypoint(scid, entrypoint) {
            return await this.call('Gnomon.GetAllSCIDInvokeDetailsByEntrypoint', { scid, entrypoint });
        },
        
        async gnomonGetAllSCIDInvokeDetailsBySigner(scid, signer) {
            return await this.call('Gnomon.GetAllSCIDInvokeDetailsBySigner', { scid, signer });
        },
        
        // Advanced Queries
        async gnomonGetSCIDVariableDetailsAtTopoheight(scid, height) {
            return await this.call('Gnomon.GetSCIDVariableDetailsAtTopoheight', { scid, height });
        },
        
        async gnomonGetSCIDInteractionHeight(scid) {
            return await this.call('Gnomon.GetSCIDInteractionHeight', { scid });
        },
        
        async gnomonGetInteractionIndex(topoheight, height) {
            return await this.call('Gnomon.GetInteractionIndex', { topoheight, height });
        },
        
        async gnomonGetInvalidSCIDDeploys() {
            return await this.call('Gnomon.GetInvalidSCIDDeploys');
        },
        
        // Miniblock Operations
        async gnomonGetAllMiniblockDetails() {
            return await this.call('Gnomon.GetAllMiniblockDetails');
        },
        
        async gnomonGetMiniblockDetailsByHash(blid) {
            return await this.call('Gnomon.GetMiniblockDetailsByHash', { blid });
        },
        
        async gnomonGetMiniblockCountByAddress(address) {
            return await this.call('Gnomon.GetMiniblockCountByAddress', { address });
        },
        
        async gnomonGetSCIDInteractionByAddr(address) {
            return await this.call('Gnomon.GetSCIDInteractionByAddr', { address });
        },
        
        // TELA-Specific
        async handleTELALinks(telaLink) {
            return await this.call('HandleTELALinks', { telaLink });
        },
        
        // ============================================================================
        // EPOCH MINING METHODS
        // ============================================================================
        
        async epochAttempt(hashes) {
            return await this.call('AttemptEPOCH', { hashes });
        },
        
        async epochAttemptWithAddr(address, hashes) {
            return await this.call('AttemptEPOCHWithAddr', { address, hashes });
        },
        
        async epochGetMaxHashes() {
            return await this.call('GetMaxHashesEPOCH');
        },
        
        async epochGetAddress() {
            return await this.call('GetAddressEPOCH');
        },
        
        async epochGetSession() {
            return await this.call('GetSessionEPOCH');
        },
        
        // ============================================================================
        // UTILITY METHODS
        // ============================================================================
        
        // Format DERO amounts
        formatDERO(atomicUnits, decimals = 5) {
            if (!atomicUnits || atomicUnits === 0) return '0.' + '0'.repeat(decimals) + ' DERO';
            const deroAmount = parseFloat(atomicUnits) / 100000;
            return deroAmount.toFixed(decimals) + ' DERO';
        },
        
        // Validate DERO address
        isValidAddress(address) {
            if (!address || typeof address !== 'string') return false;
            return address.startsWith('dero') && address.length >= 64;
        },
        
        // Format hash for display
        formatHash(hash, length = 12) {
            if (!hash || hash.length <= length * 2) return hash || 'N/A';
            return hash.substring(0, length) + '...' + hash.substring(hash.length - length);
        },
        
        // Format large numbers
        formatNumber(num) {
            if (num === undefined || num === null) return '0';
            return parseInt(num, 10).toLocaleString();
        },
        
        // Calculate time ago
        timeAgo(timestamp) {
            if (!timestamp) return 'Unknown';
            const now = Date.now() / 1000;
            const diff = now - timestamp;
            
            if (diff < 60) return 'Just now';
            if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
            if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
            return Math.floor(diff / 86400) + 'd ago';
        },
        
        // Generate UUID for request IDs
        generateUUID() {
            return Array.from({ length: 32 }, () => 
                Math.floor(Math.random() * 16).toString(16)
            ).join('');
        },
        
        // Safe JSON parse
        safeJsonParse(str) {
            try {
                return JSON.parse(str);
            } catch (error) {
                console.error('JSON parse error:', error);
                return null;
            }
        },
        
        // ============================================================================
        // ERROR HANDLING & RETRIES
        // ============================================================================
        
        async safeCall(method, params = {}, retries = 3) {
            for (let i = 0; i < retries; i++) {
                try {
                    return await this.call(method, params);
                } catch (error) {
                    console.warn(`Attempt ${i + 1} failed:`, error.message);
                    
                    if (i === retries - 1) {
                        throw error;
                    }
                    
                    // Wait before retry
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        },
        
        // Get connection status
        getConnectionStatus() {
            return {
                connected: this.connected,
                endpoint: this.config.XSWD_ENDPOINT,
                pendingRequests: this.pendingRequests.size
            };
        },
        
        // ============================================================================
        // BATCH OPERATIONS
        // ============================================================================
        
        async batchCall(calls) {
            const promises = calls.map(({ method, params }) => 
                this.call(method, params).catch(error => ({ error: error.message }))
            );
            return await Promise.all(promises);
        },
        
        // ============================================================================
        // TEMPLATE USAGE EXAMPLES
        // ============================================================================
        
        examples: {
            // Basic wallet operations
            async getWalletInfo() {
                try {
                    const address = await TELA_API_TEMPLATE.getAddress();
                    const balance = await TELA_API_TEMPLATE.getBalance();
                    const networkInfo = await TELA_API_TEMPLATE.getNetworkInfo();
                    
                    return {
                        address: address.address,
                        balance: TELA_API_TEMPLATE.formatDERO(balance.unlocked_balance),
                        height: networkInfo.height,
                        peers: networkInfo.peer_count
                    };
                } catch (error) {
                    console.error('Failed to get wallet info:', error);
                    return null;
                }
            },
            
            // Get smart contract data
            async getContractData(scid) {
                try {
                    const contract = await TELA_API_TEMPLATE.getSmartContract(scid, true, true);
                    const owner = await TELA_API_TEMPLATE.gnomonGetOwner(scid);
                    
                    return {
                        scid: scid,
                        owner: owner.owner,
                        balance: TELA_API_TEMPLATE.formatDERO(contract.balance),
                        variables: contract.variables,
                        code: contract.code
                    };
                } catch (error) {
                    console.error('Failed to get contract data:', error);
                    return null;
                }
            },
            
            // Monitor blockchain
            async startMonitoring(callback, interval = 30000) {
                setInterval(async () => {
                    try {
                        const info = await TELA_API_TEMPLATE.getNetworkInfo();
                        const pool = await TELA_API_TEMPLATE.getTransactionPool();
                        
                        callback({
                            height: info.height,
                            hashrate: TELA_API_TEMPLATE.formatNumber(info.hashrate),
                            peers: info.peer_count,
                            txPool: pool.txs ? pool.txs.length : 0,
                            timestamp: Date.now()
                        });
                    } catch (error) {
                        console.error('Monitoring error:', error);
                    }
                }, interval);
            }
        }
    };
    
    // ============================================================================
    // GLOBAL EXPORT
    // ============================================================================
    
    // Export to global scope for TELA applications
    if (typeof window !== 'undefined') {
        window.TelaAPI = TELA_API_TEMPLATE;
        
        // Also provide shorter aliases
        window.tela = TELA_API_TEMPLATE;
        window.dero = {
            call: TELA_API_TEMPLATE.call.bind(TELA_API_TEMPLATE),
            getInfo: TELA_API_TEMPLATE.getNetworkInfo.bind(TELA_API_TEMPLATE),
            getBlock: TELA_API_TEMPLATE.getBlock.bind(TELA_API_TEMPLATE),
            getTransaction: TELA_API_TEMPLATE.getTransaction.bind(TELA_API_TEMPLATE),
            getBalance: TELA_API_TEMPLATE.getBalance.bind(TELA_API_TEMPLATE),
            transfer: TELA_API_TEMPLATE.transfer.bind(TELA_API_TEMPLATE)
        };
        
        console.log('📚 TELA API Template loaded successfully');
        console.log('🔧 Usage: await TelaAPI.initialize() or window.tela.initialize()');
        console.log('📖 Examples: TelaAPI.examples.getWalletInfo()');
    }
    
    // Return the module for direct usage
    return TELA_API_TEMPLATE;
})();

// ============================================================================
// DEPLOYMENT INSTRUCTIONS
// ============================================================================

/*
DEPLOYMENT AS TELA LIBRARY:

1. Deploy this file as a TELA-DOC-1:
   - Name: TELA API Template
   - Description: Complete DERO/TELA API reference with all available calls
   - dURL: tela-api-template.lib
   - File: tela-api-template.js

2. Usage in your TELA application:
   a) Include in your TELA-INDEX-1 as a DOC
   b) In your HTML: <script src="tela-api-template.js"></script>
   c) Initialize: await TelaAPI.initialize()

3. Customize for your application:
   - Replace config.APP_ID with your unique app ID
   - Replace config.APP_NAME with your app name
   - Replace config.APP_DESCRIPTION with your app description
   - Modify timeout and other settings as needed

4. Example usage:
   ```javascript
   // Initialize connection
   await TelaAPI.initialize();
   
   // Get wallet info
   const info = await TelaAPI.examples.getWalletInfo();
   
   // Get network status
   const network = await TelaAPI.getNetworkInfo();
   
   // Get smart contract
   const contract = await TelaAPI.getSmartContract('your-scid');
   
   // Start monitoring
   TelaAPI.examples.startMonitoring((data) => {
       console.log('Network update:', data);
   });
   ```

FILE SIZE: ~17KB (within TELA limits)
COMPATIBLE: All TELA host applications (Engram, TELA-CLI)
DEPENDENCIES: None (pure JavaScript)
*/
