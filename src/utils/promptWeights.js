
// Simple keyword -> category weight extractor
const CATEGORY_KEYS = {
  education: ['school','university','college','library','education','study','kindergarten','learning'],
  entertainment: ['park','theater','theatre','museum','cinema','movie','art','gallery','zoo','playground','sports','stadium','swimming','gym','entertainment','fun','nightclub','casino','amusement'],
  health: ['hospital','pharmacy','chemist','dentist','clinic','health','doctor','medical','veterinary','nursing'],
  finance: ['bank','atm','finance','money','cash','bureau','exchange'],
  food: ['restaurant','cafe','food','dining','eat','pub','bar','fast food','bistro'],
  shopping: ['shop','market','mall','store','supermarket','convenience','grocery','shopping','retail'],
  transport: ['bus','taxi','train','metro','transport','station','rental','parking','fuel','charging'],
  tourism: ['hotel','tourist','hostel','accommodation','guest house','camp','travel','visit','attraction','viewpoint'],
  business: ['office','coworking','business','conference','meeting','work','workspace'],
  automotive: ['repair','garage','mechanic','car','motorcycle','bike','parts','dealer','workshop'],
  services: ['post','salon','laundry','tailor','repair','service','internet cafe','bookshop'],
  religious: ['worship','church','temple','mosque','synagogue','monastery','shrine','prayer','religious'],
  civic: ['court','police','fire','government','embassy','townhall','civic','council'],
  emergency: ['ambulance','emergency','police','fire station','lifeguard','urgent']
}

export function weightsFromPrompt(prompt) {
  const base = { 
    education: 1, entertainment: 1, health: 1, finance: 1,
    food: 1, shopping: 1, transport: 1, tourism: 1,
    business: 1, automotive: 1, services: 1, religious: 1,
    civic: 1, emergency: 1
  }
  if (!prompt) return base
  const p = prompt.toLowerCase()
  for (const [cat, keys] of Object.entries(CATEGORY_KEYS)) {
    const hits = keys.reduce((acc,k)=> acc + (p.includes(k) ? 1 : 0), 0)
    base[cat] = Math.max(1, hits || 0.5)
  }
  // Normalize to sum ~ 14 (for 14 categories)
  const sum = Object.values(base).reduce((a,b)=>a+b,0)
  for (const k of Object.keys(base)) base[k] = base[k] * (14/sum)
  return base
}
