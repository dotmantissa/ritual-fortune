import { useRef } from 'react'
import { toPng } from 'html-to-image'

export function useFortuneCard() {
  const cardRef = useRef<HTMLDivElement>(null)

  const downloadCard = async () => {
    if (!cardRef.current) return
    const dataUrl = await toPng(cardRef.current, { width: 1200, height: 630, pixelRatio: 2 })
    const link = document.createElement('a')
    link.download = `veil-fortune-${Date.now()}.png`
    link.href = dataUrl
    link.click()
  }

  const shareOnX = async (fortune: string, appUrl: string) => {
    const text = encodeURIComponent(`The oracle VEIL has spoken my fate on @ritualnet\n\n"${fortune.slice(0, 160)}..."\n\nSeek yours → ${appUrl}`)
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank')
    await downloadCard()
  }

  return { cardRef, downloadCard, shareOnX }
}
