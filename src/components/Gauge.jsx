
export default function Gauge({ value=0 }){
  const v = Math.max(0, Math.min(100, value))
  const circumference = 2 * Math.PI * 45
  const offset = circumference - (v/100) * circumference
  
  // Color based on score
  const getColor = () => {
    if (v >= 75) return 'url(#gradient-excellent)'
    if (v >= 50) return 'url(#gradient-good)'
    if (v >= 25) return 'url(#gradient-fair)'
    return 'url(#gradient-poor)'
  }
  
  return (
    <div className="relative">
      <svg width="160" height="160" viewBox="0 0 120 120">
        <defs>
          <linearGradient id="gradient-excellent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <linearGradient id="gradient-good" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <linearGradient id="gradient-fair" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
          <linearGradient id="gradient-poor" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#f87171" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Background circle */}
        <circle 
          cx="60" 
          cy="60" 
          r="45" 
          stroke="rgba(255,255,255,0.08)" 
          strokeWidth="10" 
          fill="none"
        />
        
        {/* Progress circle */}
        <circle 
          cx="60" 
          cy="60" 
          r="45" 
          stroke={getColor()}
          strokeWidth="10" 
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          filter="url(#glow)"
          style={{ 
            transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%'
          }}
        />
        
        {/* Center text */}
        <text 
          x="60" 
          y="70" 
          textAnchor="middle" 
          fontSize="32" 
          fill="white" 
          fontWeight="700"
          style={{ fontFamily: 'system-ui' }}
        >
          {v}
        </text>
      </svg>
    </div>
  )
}
