
export default function Button({ children, className='', loading=false, ...props }){
  return (
    <button
      disabled={loading || props.disabled}
      className={`px-4 py-2 rounded-2xl shadow hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition ${className}`}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  )
}
