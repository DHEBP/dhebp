import type { NextApiRequest, NextApiResponse } from 'next'

// Try multiple endpoints in case one is available
const DAEMON_ENDPOINTS = [
  process.env.DERONODE || 'http://127.0.0.1:10102/json_rpc', // Standard daemon
  'http://127.0.0.1:40402/json_rpc', // Standard daemon (testnet)
  'http://127.0.0.1:10103/json_rpc', // Wallet RPC
  'http://127.0.0.1:44326/json_rpc', // XSWD port
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const rpcBody = {
    jsonrpc: '2.0',
    id: '1',
    method: 'DERO.GetInfo'
  }

  // Try each endpoint until one works
  for (const endpoint of DAEMON_ENDPOINTS) {
    try {
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rpcBody),
        // Set a short timeout to quickly move to the next endpoint if this one fails
        signal: AbortSignal.timeout(2000)
      })
      
      const data = await r.json()
      if (data.result) {
        res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate')
        return res.status(200).json(data.result)
      }
    } catch (e) {
      // Continue to next endpoint
      console.log(`Endpoint ${endpoint} failed, trying next...`)
    }
  }
  
  // If all endpoints fail
  return res.status(500).json({ error: 'daemon unreachable' })
} 