// scripts/test-apis.mjs
// Ejecutar con: node scripts/test-apis.mjs
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Leer .env.local manualmente ─────────────────────────────────
const envPath = resolve(__dirname, '../.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    env[key.trim()] = rest.join('=').trim();
}

const GOOGLE_AI_API_KEY = env['GOOGLE_AI_API_KEY'];
const INEGI_API_TOKEN = env['INEGI_API_TOKEN'];

console.log('\n═══════════════════════════════════════════════════════');
console.log('  🔑  VALIDACIÓN DE API KEYS — Garza Casas IA');
console.log('═══════════════════════════════════════════════════════\n');

// ── 1. GEMINI ────────────────────────────────────────────────────
async function testGemini() {
    process.stdout.write('🤖 Gemini IA                  … ');

    if (!GOOGLE_AI_API_KEY) {
        console.log('❌  GOOGLE_AI_API_KEY no encontrada en .env.local');
        return false;
    }

    // Probar con gemini-1.5-flash primero, luego gemini-2.0-flash
    const models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash-latest'];

    for (const model of models) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GOOGLE_AI_API_KEY}`;
        const body = { contents: [{ parts: [{ text: 'Responde solo "OK"' }] }] };

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await res.json();

            if (res.status === 429) {
                // Cuota agotada para este modelo, intentar el siguiente
                continue;
            }

            if (!res.ok) {
                console.log(`❌  HTTP ${res.status} — ${data?.error?.message ?? JSON.stringify(data)}`);
                return false;
            }

            const respText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
            console.log(`✅  OK`);
            console.log(`   Modelo  : ${model}`);
            console.log(`   Respuesta: "${respText.trim()}"`);
            console.log(`   Key     : ${GOOGLE_AI_API_KEY.slice(0, 12)}…`);
            return true;
        } catch (e) {
            console.log(`❌  Error de red — ${e.message}`);
            return false;
        }
    }

    console.log(`⚠️   Key válida pero cuota diaria agotada (429 en todos los modelos)`);
    console.log(`   Key     : ${GOOGLE_AI_API_KEY.slice(0, 12)}…`);
    console.log(`   Solución: Esperar reinicio de cuota (medianoche PT) o activar billing en https://aistudio.google.com`);
    return false;
}

// ── 2. INEGI DENUE ───────────────────────────────────────────────
async function testINEGI() {
    process.stdout.write('🏛️  INEGI DENUE               … ');

    if (!INEGI_API_TOKEN) {
        console.log('❌  INEGI_API_TOKEN no encontrada en .env.local');
        return false;
    }

    // Formato correcto: /Buscar/[condicion]/[lat],[lon]/[metros]/[token]
    // Centro de Monterrey: 25.6866,-100.3161
    const url = `https://www.inegi.org.mx/app/api/denue/v1/consulta/Buscar/inmobiliaria/25.6866,-100.3161/2000/${INEGI_API_TOKEN}`;

    try {
        const res = await fetch(url);

        if (!res.ok) {
            const text = await res.text();
            console.log(`❌  HTTP ${res.status} — ${text.slice(0, 120)}`);
            return false;
        }

        const data = await res.json().catch(() => null);

        if (!Array.isArray(data)) {
            console.log(`❌  Respuesta inesperada: ${JSON.stringify(data).slice(0, 120)}`);
            return false;
        }

        const first = data[0]?.Nombre ?? data[0]?.nom_estab ?? 'N/A';
        console.log(`✅  OK  (${data.length} establecimientos encontrados)`);
        console.log(`   1° resultado: "${first.slice(0, 60)}"`);
        console.log(`   Token   : ${INEGI_API_TOKEN.slice(0, 8)}…`);
        return true;
    } catch (e) {
        console.log(`❌  Error de red — ${e.message}`);
        return false;
    }
}

// ── Ejecutar ─────────────────────────────────────────────────────
const [geminiOk, inegiOk] = await Promise.all([testGemini(), testINEGI()]);

console.log('\n───────────────────────────────────────────────────────');
console.log(`  Gemini: ${geminiOk ? '✅  Activa y funcionando' : '❌  Requiere atención'}`);
console.log(`  INEGI : ${inegiOk ? '✅  Activa y funcionando' : '❌  Requiere atención'}`);
console.log('═══════════════════════════════════════════════════════\n');
