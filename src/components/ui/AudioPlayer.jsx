// AudioPlayer — custom styled audio player.
// Renders as a rectangular tile with an optional background image,
// dark overlay, centered play/pause, and a bottom scrubber bar.
// Props:
//   src       — audio URL
//   image     — optional background image URL (e.g. post featuredImage)
//   className — sizing/layout classes (defaults to full-width 16:9)

import { useState, useRef, useEffect } from 'react'
import { Play, Pause } from 'lucide-react'

function formatTime(s) {
  if (!isFinite(s) || isNaN(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export default function AudioPlayer({ src, image, className = 'w-full aspect-video' }) {
  const audioRef = useRef(null)
  const [playing, setPlaying]       = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration]     = useState(0)

  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    const onPlay        = () => setPlaying(true)
    const onPause       = () => setPlaying(false)
    const onEnded       = () => setPlaying(false)
    const onTimeUpdate  = () => setCurrentTime(a.currentTime)
    const onLoaded      = () => setDuration(a.duration)
    a.addEventListener('play', onPlay)
    a.addEventListener('pause', onPause)
    a.addEventListener('ended', onEnded)
    a.addEventListener('timeupdate', onTimeUpdate)
    a.addEventListener('loadedmetadata', onLoaded)
    return () => {
      a.removeEventListener('play', onPlay)
      a.removeEventListener('pause', onPause)
      a.removeEventListener('ended', onEnded)
      a.removeEventListener('timeupdate', onTimeUpdate)
      a.removeEventListener('loadedmetadata', onLoaded)
    }
  }, [])

  const toggle = () => {
    const a = audioRef.current
    if (!a) return
    playing ? a.pause() : a.play()
  }

  const handleScrub = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const t = ratio * duration
    audioRef.current.currentTime = t
    setCurrentTime(t)
  }

  const progress = duration ? (currentTime / duration) * 100 : 0

  return (
    <div
      className={`relative overflow-hidden bg-base-300 flex items-center justify-center shrink-0 ${className}`}
      style={image ? { backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Play / pause */}
      <button
        type="button"
        onClick={toggle}
        className="relative z-10 flex items-center justify-center text-white hover:text-white/70 transition-colors"
      >
        {playing
          ? <Pause  className="w-8 h-8" />
          : <Play   className="w-8 h-8 translate-x-0.5" />
        }
      </button>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-2.5 pb-2 pt-6 bg-gradient-to-t from-black/70 to-transparent">
        <div className="flex items-center gap-2">
          <span className="font-ui text-xs text-white/60 tabular-nums shrink-0 leading-none">
            {formatTime(currentTime)}
          </span>
          <div
            className="flex-1 h-px bg-white/30 cursor-pointer relative group"
            onClick={handleScrub}
          >
            <div className="absolute inset-y-0 -top-1 -bottom-1 left-0 right-0" onClick={handleScrub} />
            <div className="h-full bg-white" style={{ width: `${progress}%` }} />
          </div>
          <span className="font-ui text-xs text-white/40 tabular-nums shrink-0 leading-none">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      <audio ref={audioRef} src={src} preload="metadata" className="hidden" />
    </div>
  )
}
