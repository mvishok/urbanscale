
export default function Loader({ size=24 }){
  const s = { width: size, height: size, borderWidth: size/8 }
  return (
    <span className="inline-block animate-spin rounded-full border-t-transparent border-white" style={s} />
  )
}
