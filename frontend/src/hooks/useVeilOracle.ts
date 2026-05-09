import { useState } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import {
  VEIL_ORACLE_ABI,
  VEIL_ORACLE_ADDRESS,
} from '../lib/constants'

export type OracleState = 'idle'|'awakening'|'ready'|'encoding'|'awaiting_sign'|'transmitting'|'receiving'|'revealed'|'error'

export function useVeilOracle() {
  const [oracleState, setOracleState] = useState<OracleState>('idle')
  const [fortune, setFortune] = useState<string | null>(null)
  const [fortuneId, setFortuneId] = useState<number>(0)
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [blockNumber, setBlockNumber] = useState<bigint | null>(null)
  const { address } = useAccount()

  const { data: fortuneCount } = useReadContract({ address: VEIL_ORACLE_ADDRESS, abi: VEIL_ORACLE_ABI, functionName: 'fortuneCount', args: address ? [address] : undefined, query: { enabled: !!address } })
  const { data: totalFortunes } = useReadContract({ address: VEIL_ORACLE_ADDRESS, abi: VEIL_ORACLE_ABI, functionName: 'totalFortunes' })

  const seekFortune = async () => {
    if (!address) return
    try {
      setOracleState('encoding')
      setError(null)
      setOracleState('awaiting_sign')
      const res = await fetch('/api/seek', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ seeker: address }),
      })
      if (!res.ok) throw new Error(await res.text())
      const out = await res.json()
      setTxHash(out.txHash as `0x${string}`)
      setOracleState('transmitting')
      setOracleState('receiving')
      setBlockNumber(BigInt(out.blockNumber))
      setFortune(out.fortune)
      setFortuneId(Number(out.fortuneId))
      setOracleState('revealed')
    } catch (e: any) {
      setError(e?.message ?? 'Unknown error')
      setOracleState('error')
    }
  }

  const reset = () => { setOracleState('ready'); setFortune(null); setTxHash(null); setError(null) }
  return { oracleState, fortune, fortuneId, txHash, blockNumber, error, fortuneCount, totalFortunes, seekFortune, reset, setOracleState }
}
