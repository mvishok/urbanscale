import { Groq } from 'groq-sdk';

export async function groqWeights(prompt, baseWeights) {
    const key = process.env.GROQ_API_KEY;
    console.log('Using Groq API Key:', key);
    if (!key || !prompt) return null;

    try {
        const groq = new Groq({ apiKey: key });

        const system = `You are an expert at understanding user location preferences and assigning priority weights.

Categories: education, entertainment, health, finance

Analyze the user's request and assign weights from 0 to 3 for each category based on importance:
- 0 = Not mentioned or irrelevant
- 0.5 = Slightly relevant
- 1.0 = Moderately important  
- 1.5 = Important
- 2.0 = Very important
- 2.5 = Critical
- 3.0 = Absolutely essential

Examples:
"I'm a college student looking for a PG" → education=2.5, entertainment=1.0, health=0.5, finance=0 (students need schools/colleges nearby, some fun, minimal health/finance)
"Need a place near hospitals and clinics" → education=0, entertainment=0, health=3.0, finance=0
"Family with kids, need schools and parks" → education=2.5, entertainment=2.0, health=1.0, finance=0.5

The weights MUST sum to exactly 4.0. Be precise and realistic - don't give high scores to everything.

Output ONLY valid JSON in this exact format with no other text:
{"education":x,"entertainment":y,"health":z,"finance":w}`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: system },
                { role: 'user', content: prompt }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3,
            max_completion_tokens: 200,
            top_p: 0.9,
            stream: false
        });

        let content = chatCompletion.choices?.[0]?.message?.content?.trim() || '';
        
        // Extract JSON if there's extra text
        const jsonMatch = content.match(/\{[^}]+\}/);
        if (jsonMatch) content = jsonMatch[0];
        
        const parsed = JSON.parse(content);

        // Validate and normalize
        const weights = { ...baseWeights };
        for (const k of Object.keys(weights)) {
            if (parsed[k] != null && !isNaN(parsed[k])) {
                weights[k] = Math.max(0, Math.min(3, Number(parsed[k])));
            }
        }
        
        // Ensure sum is 4
        const sum = Object.values(weights).reduce((a, b) => a + b, 0);
        if (sum > 0) {
            for (const k of Object.keys(weights)) {
                weights[k] = (weights[k] * 4) / sum;
            }
        }

        console.log('Groq weights:', weights);
        return weights;
    } catch (e) {
        console.error('Groq parse failed', e.message);
        return null;
    }
}
