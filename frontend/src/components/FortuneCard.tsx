export function FortuneCard({ fortune, walletAddress, count, totalFortunes, blockNumber, timestamp }: { fortune: string; walletAddress: string; count: number; totalFortunes: number; blockNumber: string; timestamp: string }) {
  const parts = fortune.split('\n*')
  const body = parts[0]
  const epigram = parts[1] ? `*${parts[1]}` : ''
  return (
    <div style={{ position: 'absolute', left: -9999, top: 0, width: 1200, height: 630, overflow: 'hidden', border: '1px solid rgba(0,255,65,.4)', boxShadow: 'inset 0 0 60px rgba(0,255,65,.15)', background: 'radial-gradient(circle at center, #0D200D 0%, #020702 75%)' }}>
      <div style={{ padding: 40, color: '#00FF41', textAlign: 'center', letterSpacing: 12, fontSize: 14 }}>⟨ V E I L ⟩</div>
      <div style={{ margin: '0 60px', border: '1px solid rgba(0,255,65,.25)', borderRadius: 4, background: 'rgba(0,255,65,.02)', minHeight: 400, padding: 40, color: '#C8F7C5', fontFamily: 'Georgia, serif', fontSize: 24, lineHeight: 1.85 }}>
        <div>{body}</div>
        {epigram ? <div style={{ marginTop: 20, textAlign: 'right', color: '#4A7A47', fontStyle: 'italic', fontSize: '0.85em' }}>{epigram}</div> : null}
      </div>
      <div style={{ position: 'absolute', left: 60, right: 60, bottom: 30, fontSize: 11, color: '#2A4A27', fontFamily: 'Courier New, monospace' }}>
        <div>SEEKER: {walletAddress} · FORTUNE #{count} · {totalFortunes} SEEKERS BEFORE YOU</div>
        <div>RITUAL CHAIN · BLOCK {blockNumber} · {timestamp}</div>
      </div>
    </div>
  )
}
