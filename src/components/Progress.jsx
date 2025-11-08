
export default function Progress({ value=0 }){
  const v = Math.max(0, Math.min(100, value))
  
  const getGradient = () => {
    if (v >= 75) return 'from-green-500 to-emerald-500'
    if (v >= 50) return 'from-indigo-500 to-purple-500'
    if (v >= 25) return 'from-amber-500 to-yellow-500'
    return 'from-red-500 to-orange-500'
  }
  
  return (
    <div className="w-full h-2.5 rounded-full bg-slate-800/50 overflow-hidden relative">
      <div 
        className={`h-full rounded-full bg-gradient-to-r ${getGradient()} transition-all duration-1000 ease-out shadow-lg`}
        style={{ width: v + '%' }}
      />
      <div 
        className={`absolute inset-0 bg-gradient-to-r ${getGradient()} opacity-30 blur-sm`}
        style={{ width: v + '%' }}
      />
    </div>
  )
}
