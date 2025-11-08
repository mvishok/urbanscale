
// Simple keyword -> category weight extractor
const CATEGORY_KEYS = {
  education: ['school','university','college','library','education','study'],
  entertainment: ['park','theater','theatre','museum','cinema','movie','art','gallery','zoo','playground','sports','stadium','swimming','gym','entertainment','fun'],
  health: ['hospital','pharmacy','chemist','dentist','clinic','health','doctor'],
  finance: ['bank','atm','finance','money','cash']
}

export function weightsFromPrompt(prompt) {
  const base = { education: 1, entertainment: 1, health: 1, finance: 1 }
  if (!prompt) return base
  const p = prompt.toLowerCase()
  for (const [cat, keys] of Object.entries(CATEGORY_KEYS)) {
    const hits = keys.reduce((acc,k)=> acc + (p.includes(k) ? 1 : 0), 0)
    base[cat] = Math.max(1, hits || 0.5)
  }
  // Normalize to sum ~ 4
  const sum = Object.values(base).reduce((a,b)=>a+b,0)
  for (const k of Object.keys(base)) base[k] = base[k] * (4/sum)
  return base
}
