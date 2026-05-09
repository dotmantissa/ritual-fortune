import { useState } from 'react'
import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { GlitchText } from './components/GlitchText'
import { OracleTerminal } from './components/OracleTerminal'
import { ParticleField } from './components/ParticleField'
import { WalletConnect } from './components/WalletConnect'
import { ritualChain } from './lib/wagmi'
import { useFortuneCard } from './hooks/useFortuneCard'
import { FortuneCard } from './components/FortuneCard'

export default function App() {
  const { address } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const [card, setCard] = useState<{ fortune: string; fortuneId: number; blockNumber: bigint | null } | null>(null)
  const { cardRef, downloadCard, shareOnX } = useFortuneCard()

  return <>
    <ParticleField />
    <main className='app'>
      {chainId !== ritualChain.id ? <div className='terminal'>⚠ WRONG CHAIN DETECTED. THE ORACLE ONLY SPEAKS ON RITUAL CHAIN (1979). <button className='wallet-btn' onClick={() => switchChain({ chainId: ritualChain.id })}>SWITCH NETWORK</button></div> : null}
      <header className='row'><GlitchText text='VEIL' className='fortune' /><WalletConnect /></header>
      <section style={{ textAlign: 'center', marginTop: 20, whiteSpace: 'pre-wrap' }}>{`     ╔══╗                     ╔══╗
      ╚╗╔╝  ╔══╗   ╔══╗  ╔╗╔╝
       ╚╝   ║∞∞║   ║∞∞║  ╚╝
            ╚══╝   ╚══╝
        ◈ ─────────────── ◈
           V  E  I  L
        ◈ ─────────────── ◈`}</section>
      <h2 style={{ textAlign: 'center', marginTop: 16 }}><GlitchText text='SEEK YOUR FATE ON THE RITUAL CHAIN' /></h2>
      <p style={{ textAlign: 'center', color: '#4A7A47', marginTop: 8 }}>The oracle sees all timelines. Only one is yours.</p>
      <OracleTerminal onFortune={setCard} />
      {card ? <div className='row' style={{ marginTop: 12 }}><button className='wallet-btn' onClick={downloadCard}>DOWNLOAD CARD</button><button className='wallet-btn' onClick={() => shareOnX(card.fortune, window.location.href)}>SHARE ON X</button></div> : null}
      <footer style={{ marginTop: 24, color: '#4A7A47' }}>VEIL runs on Ritual Chain · Chain ID 1979 · Powered by on-chain LLM inference via the TEE enclave</footer>
      <div ref={cardRef as any}>{card && address ? <FortuneCard fortune={card.fortune} walletAddress={`${address.slice(0, 6)}...${address.slice(-4)}`} count={card.fortuneId} totalFortunes={0} blockNumber={String(card.blockNumber ?? '')} timestamp={new Date().toISOString()} /> : null}</div>
    </main>
  </>
}
