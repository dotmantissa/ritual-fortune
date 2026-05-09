import { useEffect, useRef } from 'react'

export function ParticleField() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current!; const ctx = canvas.getContext('2d')!
    const resize = () => { canvas.width = innerWidth; canvas.height = innerHeight }
    resize(); addEventListener('resize', resize)
    const particles = Array.from({ length: 80 }, () => ({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, s: Math.random() * 1.5 + 0.5, v: Math.random() * 0.4 + 0.15, w: Math.random() * 0.8 + 0.2, o: Math.random() * 0.6 + 0.2 }))
    let raf = 0
    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const p of particles) {
        p.y -= p.v; p.x += Math.sin(p.y / 40) * p.w * 0.1
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width }
        ctx.fillStyle = `rgba(0,255,65,${p.o * (0.4 + 0.6 * Math.abs(Math.sin(p.y / 60)))})`
        ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2); ctx.fill()
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={ref} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.4 }} />
}
