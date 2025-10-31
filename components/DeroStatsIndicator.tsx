import { useEffect, useState } from 'react'
import { updateConnectionStatus } from '../theme.config'

interface Stats {
  height: number | null
  topoHeight: number | null
}

export default function DeroStatsIndicator() {
  const [stats, setStats] = useState<Stats>({ height: null, topoHeight: null })
  const [error, setError] = useState<boolean>(false)

  useEffect(() => {
    let timer: NodeJS.Timeout

    const fetchStats = async () => {
      try {
        const res = await fetch('/api/dero-stats')
        if (!res.ok) throw new Error('Bad status')
        const data = await res.json()
        setStats({ height: data.height, topoHeight: data.topo_height })
        setError(false)
        
        // Update the global connection status to indicate we're connected
        updateConnectionStatus(true)
      } catch (err) {
        setError(true)
        
        // Update the global connection status to indicate we're disconnected
        updateConnectionStatus(false)
      } finally {
        timer = setTimeout(fetchStats, 15000)
      }
    }
    fetchStats()

    return () => clearTimeout(timer)
  }, [])

  const { height } = stats

  return (
    <div className="text-xs font-mono ml-2 px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">
      {error ? 'Node offline' : height !== null ? `Height: ${height}` : '…'}
    </div>
  )
} 