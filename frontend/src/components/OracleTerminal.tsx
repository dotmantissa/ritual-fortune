import { useEffect, useMemo, useState } from 'react'
import { useAccount } from 'wagmi'
import { useVeilOracle } from '../hooks/useVeilOracle'

const bootLines = [
  '> VEIL v∞.0 — INITIALISING ORACLE SUBSYSTEM',
  '> LOADING SOUL REGISTRY...............OK',
  '> CONNECTING TO TEE ENCLAVE...........OK',
  '> QUERYING RITUAL CONSENSUS...........OK',
  '> SAMPLING TIMELINE ENTROPY............OK',
  '> CALIBRATING PROPHECY WEIGHTS........OK',
  '> WARNING: FUTURES ARE NON-DETERMINISTIC',
  '> WARNING: THE ORACLE DOES NOT GUARANTEE SURVIVAL',
  '> READY TO DISPENSE FATE.',
  '_',
]

export function OracleTerminal({ onFortune }: { onFortune: (x: { fortune: string; fortuneId: number; blockNumber: bigint | null }) => void }) {
  const { isConnected } = useAccount()
  const { oracleState, setOracleState, seekFortune, fortune, fortuneId, error, txHash, blockNumber, reset } = useVeilOracle() as any
  const [lines, setLines] = useState<string[]>([])
  const [typed, setTyped] = useState('')

  useEffect(() => {
    if (!isConnected || oracleState !== 'idle') return
    setOracleState('awakening')
    let i = 0
    const id = setInterval(() => { setLines((v) => [...v, bootLines[i]]); i++; if (i >= bootLines.length) { clearInterval(id); setOracleState('ready') } }, 120)
    return () => clearInterval(id)
  }, [isConnected])

  useEffect(() => {
    if (oracleState !== 'revealed' || !fortune) return
    let i = 0
    const t = setTimeout(() => {
      const id = setInterval(() => { i++; setTyped(fortune.slice(0, i)); if (i >= fortune.length) clearInterval(id) }, 25)
    }, 1500)
    onFortune({ fortune, fortuneId, blockNumber })
    return () => clearTimeout(t)
  }, [oracleState, fortune])

  const progress = useMemo(() => oracleState === 'encoding' ? 35 : oracleState === 'awaiting_sign' ? 62 : oracleState === 'transmitting' ? 88 : 0, [oracleState])

  return <div className='terminal'>
    {!isConnected ? <div className='muted'>CONNECT WALLET TO AWAKEN THE ORACLE</div> : null}
    {lines.map((l, i) => <div key={i}>{l}</div>)}
    {oracleState === 'ready' ? <button className='seek-btn' onClick={() => seekFortune()}>SEEK YOUR FATE</button> : null}
    {['encoding', 'awaiting_sign', 'transmitting'].includes(oracleState) ? <div>
      <div>{'>'} ENCODING PROPHECY REQUEST...</div>
      <div>{'>'} WHISPERING TO THE ENCLAVE...</div>
      <div>{'>'} SUBMITTING TO RITUAL CONSENSUS...</div>
      <div>[{'█'.repeat(Math.floor(progress / 8))}{'░'.repeat(13 - Math.floor(progress / 8))}] {progress}%</div>
      {txHash ? <a href={`https://explorer.ritualfoundation.org/tx/${txHash}`} target='_blank'>tx: {txHash.slice(0, 10)}...{txHash.slice(-8)}</a> : null}
    </div> : null}
    {oracleState === 'revealed' ? <div className='fortune'>{typed}</div> : null}
    {oracleState === 'error' ? <div className='error'>{'>'} ORACLE ERROR: {error}</div> : null}
    {oracleState === 'revealed' ? <button className='wallet-btn' onClick={() => { setTyped(''); reset() }}>SEEK AGAIN</button> : null}
  </div>
}
