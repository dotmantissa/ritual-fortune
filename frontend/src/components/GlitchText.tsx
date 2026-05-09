import { useEffect, useState } from 'react'

export function GlitchText({ text, className, interval = 4000 }: { text: string; className?: string; interval?: number }) {
  const [glitching, setGlitching] = useState(false)
  useEffect(() => {
    const id = setInterval(() => { setGlitching(true); setTimeout(() => setGlitching(false), 200) }, interval)
    return () => clearInterval(id)
  }, [interval])

  return <span className={className} data-text={text} style={{ position: 'relative', display: 'inline-block', animation: glitching ? 'glitch 0.2s linear' : undefined }}>{text}</span>
}
