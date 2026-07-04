// ==========================================
// --- BOOT SEQUENCE ---
// ==========================================
const BOOT_LINES = [
    { text: 'CYBER_OS v2.5.0 — BIOS OK',             cls: '',    delay: 0   },
    { text: 'Initializing kernel modules...',          cls: 'dim', delay: 180 },
    { text: '[ OK ]  Memory subsystem',               cls: 'ok',  delay: 340 },
    { text: '[ OK ]  Crypto engine (AES-256-GCM)',    cls: 'ok',  delay: 500 },
    { text: '[ OK ]  Virtual filesystem',             cls: 'ok',  delay: 660 },
    { text: '[ OK ]  Network identity module',        cls: 'ok',  delay: 820 },
    { text: '[ OK ]  SENTINEL AI — loading model...', cls: 'ok',  delay: 1020},
    { text: '[ OK ]  Command registry (14 commands)', cls: 'ok',  delay: 1200},
    { text: 'SYSTEM_BOOT_SEQUENCE_COMPLETE',           cls: '',    delay: 1420},
    { text: 'Launching interface...',                  cls: 'dim', delay: 1620},
];

function runBootSequence(onDone) {
    const log  = document.getElementById('bootLog');
    const screen = document.getElementById('bootScreen');

    // Always show the layout hidden behind the boot screen
    document.querySelector('.layout').style.visibility = 'visible';

    BOOT_LINES.forEach(({ text, cls, delay }) => {
        setTimeout(() => {
            const line = document.createElement('div');
            if (cls) line.className = cls;
            line.textContent = text;
            log.appendChild(line);
        }, delay);
    });

    setTimeout(() => {
        screen.classList.add('fade-out');
        setTimeout(() => {
            screen.style.display = 'none';
            onDone();
        }, 650);
    }, 2100);
}

window.onload = () => {
    startMatrix();
    updateClock();
    setInterval(updateStats, 2000);
    setInterval(updateClock, 1000);

    runBootSequence(() => {
        restoreLogs();
        addLog('SYSTEM_BOOT_SEQUENCE_COMPLETE');
        addLog('ALL_MODULES_VERIFIED');
        renderPasswordVault();
        seedSocWelcome();
        updateSocStatus();
        const termInput = document.getElementById('terminalInput');
        if (termInput) termInput.focus();
    });
};

// ==========================================
// --- FULL-SCREEN TERMINAL ---
// ==========================================
let fsTermActive = false;

function toggleFullTerminal() {
    const overlay = document.getElementById('terminalFullscreen');
    const input   = document.getElementById('termFullInput');
    fsTermActive   = !fsTermActive;

    if (fsTermActive) {
        overlay.classList.add('active');
        // Mirror existing terminal output into full-screen view
        const src = document.getElementById('terminalOutput');
        const dst = document.getElementById('termFullOutput');
        dst.innerHTML = src.innerHTML;
        dst.scrollTop = dst.scrollHeight;
        input.focus();
    } else {
        overlay.classList.remove('active');
        document.getElementById('terminalInput').focus();
    }
}

// Backtick toggles full-screen terminal; Escape closes it
document.addEventListener('keydown', (e) => {
    if (e.key === '`' && document.activeElement?.id !== 'termFullInput'
                       && document.activeElement?.id !== 'terminalInput'
                       && document.activeElement?.id !== 'socInput') {
        e.preventDefault();
        toggleFullTerminal();
        return;
    }
    if (e.key === 'Escape' && fsTermActive) {
        toggleFullTerminal();
        return;
    }
});

// Full-screen terminal input wiring (shares history + processCommand)
document.addEventListener('DOMContentLoaded', () => {
    const fsInput = document.getElementById('termFullInput');
    if (!fsInput) return;

    fsInput.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
            const cmd = fsInput.value.trim();
            if (!cmd) return;
            cmdHistory.push(cmd);
            if (cmdHistory.length > 50) cmdHistory.shift();
            localStorage.setItem('ct_cmdHistory', JSON.stringify(cmdHistory));
            historyPointer = cmdHistory.length;
            fsInput.value = '';

            // Process using shared engine, output to BOTH panels
            await processCommandDual(cmd);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyPointer > 0) historyPointer--;
            fsInput.value = cmdHistory[historyPointer] || '';
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyPointer < cmdHistory.length) historyPointer++;
            fsInput.value = cmdHistory[historyPointer] || '';
        } else if (e.key === '`') {
            e.preventDefault();
            toggleFullTerminal();
        }
    });
});

// Prints to both the dashboard terminal AND the full-screen one
function termPrintDual(html) {
    for (const id of ['terminalOutput', 'termFullOutput']) {
        const el = document.getElementById(id);
        if (el) { el.innerHTML += `<p>${html}</p>`; el.scrollTop = el.scrollHeight; }
    }
}

// processCommandDual mirrors processCommand but writes to both outputs
async function processCommandDual(cmd) {
    const parts = cmd.trim().split(/\s+/);
    const verb  = parts[0].toLowerCase();
    const rest  = cmd.trim().slice(parts[0].length).trim();

    termPrintDual(`<span style="color:var(--primary)">></span> ${cmd}`);

    // Delegate to core engine but intercept output
    const origPrint = window._origTermPrint;
    // Temporarily override termPrint so processCommand writes to dual
    const savedPrint = window.termPrint;
    window.termPrint = termPrintDual;
    await processCommand(cmd);
    window.termPrint = savedPrint;
}

// --- MATRIX BACKGROUND ---
function startMatrix() {
    const canvas = document.getElementById('matrixCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = "01ABCDEFGHIJKLMNOPQRSTUVWXYZｦｧｨｩｪｫｬｭｮｯ";
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);

    function draw() {
        ctx.fillStyle = "rgba(2, 6, 23, 0.05)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#38bdf8"; 
        ctx.font = fontSize + "px monospace";

        for (let i = 0; i < drops.length; i++) {
            const text = chars.charAt(Math.floor(Math.random() * chars.length));
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
    }
    setInterval(draw, 50);
}

// --- NAVIGATION ---
function showSection(sectionId) {
    document.querySelectorAll('.toolSection').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.sidebar li').forEach(l => l.classList.remove('active'));
    
    const targetSection = document.getElementById(sectionId + 'Section');
    const targetNav = document.getElementById('nav-' + sectionId);
    
    if(targetSection) targetSection.classList.add('active');
    if(targetNav) targetNav.classList.add('active');
    
    document.getElementById('pageTitle').innerText = sectionId.toUpperCase() + " // MODULE";
    addLog(`Switched to ${sectionId} module`);

    // Refresh SENTINEL status bar every time SOC section opens
    if (sectionId === 'soc') updateSocStatus();
}

// ==========================================
// --- TERMINAL ENGINE (real commands + history) ---
// ==========================================
let cmdHistory = JSON.parse(localStorage.getItem('ct_cmdHistory') || '[]');
let historyPointer = cmdHistory.length;

document.addEventListener('DOMContentLoaded', () => {
    const terminalInput = document.getElementById('terminalInput');
    if (terminalInput) {
        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = terminalInput.value.trim();
                if (command !== "") {
                    cmdHistory.push(command);
                    if (cmdHistory.length > 50) cmdHistory.shift();
                    localStorage.setItem('ct_cmdHistory', JSON.stringify(cmdHistory));
                    historyPointer = cmdHistory.length;
                    processCommand(command);
                }
                terminalInput.value = '';
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (historyPointer > 0) historyPointer--;
                terminalInput.value = cmdHistory[historyPointer] || '';
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (historyPointer < cmdHistory.length) historyPointer++;
                terminalInput.value = cmdHistory[historyPointer] || '';
            }
        });
    }
});

function termPrint(html) {
    const output = document.getElementById('terminalOutput');
    if (!output) return;
    output.innerHTML += `<p>${html}</p>`;
    output.scrollTop = output.scrollHeight;
}
// Allow full-screen terminal to override termPrint temporarily
window.termPrint = termPrint;

async function processCommand(cmd) {
    const output = document.getElementById('terminalOutput');
    if (!output) return;

    // Split into command + args, but keep original case for text arguments
    const parts = cmd.trim().split(/\s+/);
    const verb = parts[0].toLowerCase();
    const rest = cmd.trim().slice(parts[0].length).trim();

    termPrint(`<span style="color: var(--primary)">></span> ${cmd}`);

    switch (verb) {
        case 'help':
            termPrint(`<span style="color:#38bdf8">— CRYPTO ——</span> hash &lt;text&gt; &nbsp;|&nbsp; genpass &nbsp;|&nbsp; strength &lt;text&gt; &nbsp;|&nbsp; caesar enc|dec &lt;shift&gt; &lt;text&gt;`);
            termPrint(`<span style="color:#38bdf8">— NETWORK —</span> whoami`);
            termPrint(`<span style="color:#22c55e">— AI SOC ——</span> ask &lt;question&gt; &nbsp;|&nbsp; setkey &lt;sk-ant-...&gt;`);
            termPrint(`<span style="color:#94a3b8">— SYSTEM ——</span> status &nbsp;|&nbsp; scan &nbsp;|&nbsp; hack &nbsp;|&nbsp; clear &nbsp;|&nbsp; about &nbsp;|&nbsp; fullscreen`);
            break;

        case 'about':
            termPrint(`<span style="color:var(--primary)">╔══ CYBER TERMINAL ══════════════════════╗</span>`);
            termPrint(`  A browser-based cybersecurity toolkit`);
            termPrint(`  Real: AES-256-GCM vault · SHA-256 · SENTINEL AI`);
            termPrint(`  Simulated: network map · brute-force visualizer`);
            termPrint(`  Built by <span style="color:var(--primary)">FRANKLIN GEEZER</span> — github.com/franklingeezer`);
            termPrint(`<span style="color:var(--primary)">╚════════════════════════════════════════╝</span>`);
            break;

        case 'fullscreen':
            toggleFullTerminal();
            break;

        case 'status': {
            const cpu = document.getElementById('cpuStat')?.innerText || "27%";
            termPrint(`<span style="color: #38bdf8">CORE: ACTIVE | LOAD: ${cpu} | OS: CYBER_OS v2.4</span>`);
            break;
        }

        case 'clear':
            output.innerHTML = '';
            return;

        case 'scan':
            termPrint(`Scanning system nodes...`);
            setTimeout(() => termPrint(`<span style="color: #22c55e">SYSTEM SECURE: No threats found.</span>`), 800);
            break;

        case 'hack':
            termPrint(`<span style="color: #ef4444">Initializing bypass sequence (cosmetic demo)...</span>`);
            setTimeout(() => termPrint(`Accessing kernel...`), 500);
            setTimeout(() => termPrint(`<span style="color: #22c55e">SUCCESS: Virtual root access granted.</span>`), 1500);
            break;

        case 'whoami':
            termPrint(`Looking up real connection info...`);
            try {
                const res = await fetch('https://ipwho.is/');
                const data = await res.json();
                if (data.success) {
                    termPrint(`<span style="color:#38bdf8">IP: ${data.ip} | ${data.city}, ${data.region}, ${data.country} | ISP: ${data.connection?.isp || 'n/a'} | TZ: ${data.timezone?.id || 'n/a'}</span>`);
                } else {
                    termPrint(`<span style="color:#ef4444">Lookup failed.</span>`);
                }
            } catch (err) {
                termPrint(`<span style="color:#ef4444">Network lookup unavailable (offline or blocked).</span>`);
            }
            break;

        case 'hash':
            if (!rest) { termPrint(`<span style="color:#ef4444">Usage: hash &lt;text&gt;</span>`); break; }
            { const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(rest));
              const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
              termPrint(`<span style="color:#38bdf8">SHA-256: ${hex}</span>`); }
            break;

        case 'genpass': {
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
            let pw = "";
            for (let i = 0; i < 16; i++) pw += chars.charAt(Math.floor(Math.random() * chars.length));
            termPrint(`<span style="color:#22c55e">Generated: ${pw}</span>`);
            break;
        }

        case 'strength': {
            if (!rest) { termPrint(`<span style="color:#ef4444">Usage: strength &lt;text&gt;</span>`); break; }
            let s = "WEAK", c = "#ef4444";
            if (rest.length > 8 && /[A-Z]/.test(rest) && /[0-9]/.test(rest)) { s = "STRONG"; c = "#22c55e"; }
            else if (rest.length > 5) { s = "MEDIUM"; c = "#f59e0b"; }
            termPrint(`Strength: <span style="color:${c}">${s}</span>`);
            break;
        }

        case 'caesar': {
            const sub = parts[1];
            const shift = parseInt(parts[2]);
            const text = cmd.split(/\s+/).slice(3).join(' ');
            if (!sub || isNaN(shift) || !text) {
                termPrint(`<span style="color:#ef4444">Usage: caesar enc|dec &lt;shift&gt; &lt;text&gt;</span>`);
                break;
            }
            const effShift = sub === 'dec' ? (26 - (shift % 26)) % 26 : shift;
            const result = text.replace(/[a-z]/gi, (char) => {
                const start = char <= 'Z' ? 65 : 97;
                return String.fromCharCode(((char.charCodeAt(0) - start + effShift) % 26) + start);
            });
            termPrint(`<span style="color:#38bdf8">${sub.toUpperCase()}: ${result}</span>`);
            break;
        }

        case 'ask':
            if (!rest) { termPrint(`<span style="color:#ef4444">Usage: ask &lt;question&gt;</span>`); break; }
            termPrint(`<span style="color:#94a3b8">Routing to SENTINEL...</span>`);
            showSection('soc');
            await socSubmit(rest);
            break;

        case 'setkey': {
            if (!rest) { termPrint(`<span style="color:#ef4444">Usage: setkey sk-ant-...</span>`); break; }
            if (!rest.startsWith('sk-ant-')) { termPrint(`<span style="color:#ef4444">Invalid key format. Should start with sk-ant-</span>`); break; }
            localStorage.setItem('ct_sentinelKey', rest);
            termPrint(`<span style="color:#22c55e">SENTINEL API key saved. Try: ask what is a SQL injection?</span>`);
            updateSocStatus();
            break;
        }
    }
}

// ==========================================
// --- COMMAND PALETTE (Ctrl+K) ---
// ==========================================
const PALETTE_SECTIONS = [
    { label: 'Dashboard', id: 'dashboard', icon: 'fa-gauge-high' },
    { label: 'Password Tools', id: 'password', icon: 'fa-key' },
    { label: 'Encryption', id: 'encryption', icon: 'fa-user-secret' },
    { label: 'Network', id: 'network', icon: 'fa-network-wired' },
    { label: 'Cracking Lab', id: 'crack', icon: 'fa-microchip' },
    { label: 'SOC Analyst — SENTINEL', id: 'soc', icon: 'fa-brain' },
];

document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        togglePalette();
    }
    if (e.key === 'Escape') closePalette();
});

function togglePalette() {
    let palette = document.getElementById('cmdPalette');
    if (palette) { closePalette(); return; }

    palette = document.createElement('div');
    palette.id = 'cmdPalette';
    palette.style.cssText = `
        position:fixed; top:0; left:0; width:100%; height:100%; z-index:9999;
        background:rgba(2,6,23,0.75); backdrop-filter:blur(4px);
        display:flex; align-items:flex-start; justify-content:center; padding-top:140px;`;
    palette.onclick = (e) => { if (e.target === palette) closePalette(); };

    const box = document.createElement('div');
    box.style.cssText = `
        background:#0d1829; border:1px solid rgba(56,189,248,0.35); border-radius:10px;
        width:480px; overflow:hidden; box-shadow:0 0 40px rgba(56,189,248,0.15);`;

    const header = document.createElement('div');
    header.style.cssText = `padding:14px 18px; border-bottom:1px solid rgba(56,189,248,0.1);
        font-family:monospace; font-size:11px; color:#475569; display:flex; justify-content:space-between;`;
    header.innerHTML = `<span><i class="fa-solid fa-terminal" style="color:var(--primary); margin-right:8px;"></i>COMMAND PALETTE</span><span>ESC to close</span>`;

    const list = document.createElement('div');
    list.style.cssText = `padding:8px;`;

    PALETTE_SECTIONS.forEach(s => {
        const item = document.createElement('div');
        item.style.cssText = `
            display:flex; align-items:center; gap:14px; padding:11px 14px; border-radius:6px;
            cursor:pointer; font-family:monospace; font-size:13px; color:#cbd5e1;
            transition:background 0.1s;`;
        item.innerHTML = `<i class="fa-solid ${s.icon}" style="color:var(--primary); width:16px; text-align:center;"></i>${s.label}`;
        item.onmouseenter = () => item.style.background = 'rgba(56,189,248,0.1)';
        item.onmouseleave = () => item.style.background = '';
        item.onclick = () => { showSection(s.id); closePalette(); };
        list.appendChild(item);
    });

    const hint = document.createElement('div');
    hint.style.cssText = `padding:10px 18px; border-top:1px solid rgba(56,189,248,0.08); font-size:10px; color:#1e3a5f; font-family:monospace;`;
    hint.textContent = 'Ctrl+K to open · Enter to select · ESC to close';

    box.appendChild(header);
    box.appendChild(list);
    box.appendChild(hint);
    palette.appendChild(box);
    document.body.appendChild(palette);
}

function closePalette() {
    const p = document.getElementById('cmdPalette');
    if (p) p.remove();
}
const SOC_SYSTEM_PROMPT = `You are SENTINEL, an AI Security Operations Center analyst embedded in Cyber Terminal OS — a browser-based cybersecurity toolkit.

Your role:
- Analyze suspicious strings, hashes, IP addresses, code snippets, and log lines
- Explain CVEs, attack vectors, malware behavior, and threat intelligence concepts
- Guide incident response procedures step by step
- Assess password strength, cryptographic choices, and security configurations
- Identify patterns in provided logs or network data
- Explain security concepts clearly for learners

Response style:
- Concise and technical. Terminal-appropriate formatting.
- Lead with the most critical finding or direct answer.
- Use bullet points for multi-step answers. Bold key terms with **asterisks**.
- End every response with a single "**Recommendation:**" line.
- If asked about something outside security, briefly redirect: "That's outside my SOC scope. Ask me about threats, vulnerabilities, or defenses."
- Never hallucinate CVE numbers, threat actor names, or real IP reputations — say "I'd recommend checking a live threat intel feed for this."
- Keep responses under 300 words unless the user explicitly asks for detail.`;

let socConversation = []; // in-memory conversation history

function getSocKey() {
    return localStorage.getItem('ct_sentinelKey') || '';
}

function saveSocKey() {
    const input = document.getElementById('socApiKeyInput');
    const status = document.getElementById('socKeyStatus');
    const key = input.value.trim();
    if (!key.startsWith('sk-ant-')) {
        status.innerHTML = '<span style="color:#ef4444">Key should start with sk-ant- — double-check and retry.</span>';
        return;
    }
    localStorage.setItem('ct_sentinelKey', key);
    status.innerHTML = '<span style="color:#22c55e">Key saved to localStorage. SENTINEL is ready.</span>';
    input.value = '';
    setTimeout(() => {
        document.getElementById('socKeyCard').style.display = 'none';
        updateSocStatus();
    }, 1200);
}

function showSocKeyCard() {
    const card = document.getElementById('socKeyCard');
    card.style.display = card.style.display === 'none' ? 'block' : 'none';
}

function updateSocStatus() {
    const line = document.getElementById('socStatusLine');
    if (!line) return;
    if (getSocKey()) {
        line.innerHTML = '<span style="color:#22c55e">● ONLINE</span> &nbsp;|&nbsp; Key loaded from local storage &nbsp;|&nbsp; Shift+Enter = newline';
    } else {
        line.innerHTML = '<span style="color:#f97316">● API KEY REQUIRED</span> — click the orange button above to set your Anthropic key';
    }
}

function socKeyHandler(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        socSubmit();
    }
}

function appendSocMessage(role, content, isStreaming = false) {
    const container = document.getElementById('socMessages');
    if (!container) return null;

    const isUser = role === 'user';
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `display:flex; flex-direction:column; align-items:${isUser ? 'flex-end' : 'flex-start'}; gap:4px;`;

    const label = document.createElement('div');
    label.style.cssText = `font-size:9px; font-family:monospace; color:#475569; padding:0 4px;`;
    label.textContent = isUser ? 'YOU' : 'SENTINEL';

    const bubble = document.createElement('div');
    bubble.style.cssText = `
        max-width:82%; padding:12px 16px; border-radius:8px; font-size:12px; line-height:1.65;
        font-family:monospace; white-space:pre-wrap; word-break:break-word;
        ${isUser
            ? 'background:rgba(56,189,248,0.12); border:1px solid rgba(56,189,248,0.25); color:#e2e8f0; border-bottom-right-radius:2px;'
            : 'background:rgba(0,0,0,0.45); border:1px solid rgba(56,189,248,0.1); color:#cbd5e1; border-bottom-left-radius:2px;'
        }`;

    // Render markdown-light: **bold** and bullet points
    bubble.innerHTML = renderSocMarkdown(content);
    if (isStreaming) bubble.dataset.streaming = 'true';

    wrapper.appendChild(label);
    wrapper.appendChild(bubble);
    container.appendChild(wrapper);
    container.scrollTop = container.scrollHeight;
    return bubble;
}

function renderSocMarkdown(text) {
    return text
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#38bdf8">$1</strong>')
        .replace(/`(.+?)`/g, '<code style="background:rgba(56,189,248,0.1);padding:1px 5px;border-radius:3px;color:#7dd3fc">$1</code>')
        .replace(/^[-•]\s(.+)/gm, '<div style="padding-left:14px;position:relative;"><span style="position:absolute;left:0;color:var(--primary)">›</span>$1</div>')
        .replace(/\n/g, '<br>');
}

function clearSocChat() {
    socConversation = [];
    const container = document.getElementById('socMessages');
    if (container) container.innerHTML = '';
    seedSocWelcome();
    addLog('SOC: SENTINEL session cleared.');
}

function seedSocWelcome() {
    appendSocMessage('assistant',
        `**SENTINEL online.** I'm your AI Security Operations Center analyst.\n\nAsk me to:\n- Analyze suspicious IPs, hashes, or log lines\n- Explain attack techniques or CVEs\n- Guide an incident response procedure\n- Assess a password or crypto config\n\nType your question below, or use \`ask <question>\` in the terminal.\n\n**Recommendation:** Start with something real — paste a log line, a hash, or describe what you're investigating.`
    );
}

async function socSubmit(questionOverride) {
    const key = getSocKey();
    if (!key) {
        document.getElementById('socKeyCard').style.display = 'block';
        document.getElementById('socKeyStatus').innerHTML = '<span style="color:#f97316">Set your API key first.</span>';
        showSection('soc');
        return;
    }

    const inputEl = document.getElementById('socInput');
    const question = questionOverride || (inputEl ? inputEl.value.trim() : '');
    if (!question) return;

    if (inputEl) inputEl.value = '';

    // Add to conversation history
    socConversation.push({ role: 'user', content: question });
    appendSocMessage('user', question);

    // Keep conversation to last 10 turns to stay within token budget
    const trimmed = socConversation.slice(-10);

    // Disable send button while waiting
    const sendBtn = document.getElementById('socSendBtn');
    if (sendBtn) { sendBtn.disabled = true; sendBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>'; }

    // Streaming bubble
    const thinkingBubble = appendSocMessage('assistant', '█', true);

    addLog('SOC: SENTINEL processing query...');

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
            body: JSON.stringify({
                model: 'claude-sonnet-4-6',
                max_tokens: 600,
                system: SOC_SYSTEM_PROMPT,
                messages: trimmed,
                stream: true,
            }),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err?.error?.message || `HTTP ${response.status}`);
        }

        // Stream the response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';
        thinkingBubble.innerHTML = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
            for (const line of lines) {
                const data = line.slice(6).trim();
                if (data === '[DONE]') break;
                try {
                    const parsed = JSON.parse(data);
                    const delta = parsed?.delta?.text || '';
                    if (delta) {
                        fullText += delta;
                        thinkingBubble.innerHTML = renderSocMarkdown(fullText);
                        document.getElementById('socMessages').scrollTop = document.getElementById('socMessages').scrollHeight;
                    }
                } catch {}
            }
        }

        // Save full response to conversation
        socConversation.push({ role: 'assistant', content: fullText });
        terminalLog(`SOC: SENTINEL responded (${fullText.length} chars).`);
        addLog('SOC: Analysis complete.', 'success');

    } catch (err) {
        thinkingBubble.innerHTML = `<span style="color:#ef4444">SENTINEL ERROR: ${err.message}</span>\n<span style="color:#64748b">Check your API key or network connection.</span>`;
        socConversation.pop(); // Remove the unanswered user message
        addLog(`SOC ERROR: ${err.message}`, 'warn');
    } finally {
        if (sendBtn) { sendBtn.disabled = false; sendBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> SEND'; }
    }
}
async function startCrack() {
    const targetInput = document.getElementById('targetPassword');
    const visual = document.getElementById('crackVisual');
    const status = document.getElementById('attackStatus');
    const progress = document.getElementById('crackProgress');
    const result = document.getElementById('crackResult');

    const target = targetInput.value.trim();
    if (!target) return;

    // Reset UI
    visual.style.color = "var(--primary)";
    status.innerText = "STATUS: INJECTING DICTIONARY...";
    progress.style.width = "0%";
    result.innerText = "Attacking...";
    addLog(`Initiating Brute Force attack on: ${target}`);

    const chars = "abcdefghijklmnopqrstuvwxyz0123456789!@#$%";
    let discovered = "";

    for (let i = 0; i < target.length; i++) {
        for (let flicker = 0; flicker < 10; flicker++) {
            let randomChar = chars[Math.floor(Math.random() * chars.length)];
            
            // Safe manual mask building
            let mask = "";
            for (let s = i + 1; s < target.length; s++) {
                mask += "*";
            }
            
            visual.innerText = discovered + randomChar + mask;
            await new Promise(r => setTimeout(r, 35));
        }
        discovered += target[i];
        progress.style.width = Math.floor(((i + 1) / target.length) * 100) + "%";
    }

    // Success State
    visual.innerText = discovered;
    visual.style.color = "var(--accent-green)";
    status.innerText = "STATUS: ACCESS GRANTED";
    result.innerHTML = `<span style="color:var(--accent-green)">SUCCESS:</span> Password recovered: <strong>${target}</strong>`;
    terminalLog(`BRUTE FORCE SUCCESS: Target "${target}" decrypted.`);

    if (typeof addLog === 'function') {
        addLog("Brute Force Attack Successful", "success");
    }
}

// ==========================================
// --- CRYPTO TOOLS ---
// ==========================================
function generatePassword() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
    let password = "";
    for (let i = 0; i < 16; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    document.getElementById("generatedPassword").innerText = password;
    addLog("New secure key generated.");
    savePasswordToVault(password);
}

function savePasswordToVault(password) {
    let vault = JSON.parse(localStorage.getItem('ct_pwVault') || '[]');
    vault.unshift({ password, time: new Date().toLocaleTimeString() });
    vault = vault.slice(0, 8);
    localStorage.setItem('ct_pwVault', JSON.stringify(vault));
    renderPasswordVault();
}

function renderPasswordVault() {
    const list = document.getElementById('pwVaultList');
    if (!list) return;
    const vault = JSON.parse(localStorage.getItem('ct_pwVault') || '[]');
    list.innerHTML = vault.length
        ? vault.map(v => `<div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px solid rgba(56,189,248,0.08);"><span style="font-family:monospace;">${v.password}</span><span style="color:#64748b; font-size:10px;">${v.time}</span></div>`).join('')
        : `<span style="opacity:0.5;">No keys generated yet this session.</span>`;
}

function clearPasswordVault() {
    localStorage.removeItem('ct_pwVault');
    renderPasswordVault();
    addLog("Password vault history cleared.");
}

function analyzePassword() {
    const input = document.getElementById("passwordInput").value;
    const result = document.getElementById("strengthResult");
    if (!input) { result.innerText = "Strength: ---"; return; }
    
    let strength = "WEAK";
    let color = "#ef4444";
    
    if (input.length > 8 && /[A-Z]/.test(input) && /[0-9]/.test(input)) {
        strength = "STRONG";
        color = "#22c55e";
    } else if (input.length > 5) {
        strength = "MEDIUM";
        color = "#f59e0b";
    }
    result.innerHTML = `Strength: <span style="color:${color}">${strength}</span>`;
}

async function generateHash() {
    const text = document.getElementById("hashInput").value;
    const resultDisplay = document.getElementById("hashResult");
    
    if(!text) {
        addLog("ERR: No input for hasher.");
        return;
    }

    const msgBuffer = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // --- MODIFIED: REMOVED ALL EXTRA TEXT ---
    // This updates the box to show ONLY the hash string.
    resultDisplay.innerText = hashHex;
    
    // We still store it in an attribute just in case your copy function needs it
    resultDisplay.setAttribute('data-raw-hash', hashHex);
    
    addLog("Generated SHA-256 Hash");
    terminalLog("CRYPTO: SHA-256 Hash Generated successfully.");
}

function encryptText() {
    let text = document.getElementById("cipherText").value;
    let shift = parseInt(document.getElementById("shiftValue").value) || 0;
    let result = text.replace(/[a-z]/gi, (char) => {
        const start = char <= 'Z' ? 65 : 97;
        return String.fromCharCode(((char.charCodeAt(0) - start + shift) % 26) + start);
    });
    document.getElementById("cipherResult").innerText = result;
    addLog(`Encrypted text with shift ${shift}`);
}

function decryptText() {
    let text = document.getElementById("cipherText").value;
    let shift = parseInt(document.getElementById("shiftValue").value) || 0;
    let reverseShift = (26 - (shift % 26)) % 26;
    let result = text.replace(/[a-z]/gi, (char) => {
        const start = char <= 'Z' ? 65 : 97;
        return String.fromCharCode(((char.charCodeAt(0) - start + reverseShift) % 26) + start);
    });
    document.getElementById("cipherResult").innerHTML = `<span style="color: #38bdf8">DECRYPTED:</span> ${result}`;
    addLog(`Decrypted text: "${text}" -> "${result}"`);
}

// ==========================================
// --- NETWORK TOOLS ---
// ==========================================
async function lookupSelf() {
    const result = document.getElementById('identityResult');
    result.innerText = "Querying public network info...";
    addLog("Running real network identity lookup");
    try {
        const res = await fetch('https://ipwho.is/');
        const data = await res.json();
        if (data.success) {
            result.innerHTML = `
                <div>IP: <span style="color:var(--primary)">${data.ip}</span></div>
                <div>Location: ${data.city}, ${data.region}, ${data.country}</div>
                <div>ISP: ${data.connection?.isp || 'n/a'}</div>
                <div>Org: ${data.connection?.org || 'n/a'}</div>
                <div>Timezone: ${data.timezone?.id || 'n/a'}</div>`;
            terminalLog(`NET: Identity lookup resolved ${data.ip} (${data.city}, ${data.country}).`);
        } else {
            result.innerHTML = `<span style="color: var(--error-red)">Lookup failed.</span>`;
        }
    } catch (err) {
        result.innerHTML = `<span style="color: var(--error-red)">Network lookup unavailable (offline or blocked by browser/extension).</span>`;
    }
}
function addLog(msg, type = 'info') {
    const logs = document.getElementById('logs');
    if(!logs) return;
    const time = new Date().toLocaleTimeString();
    const p = document.createElement('p');
    let color = type === 'warn' ? '#ef4444' : (type === 'success' ? '#22c55e' : '#38bdf8');
    p.innerHTML = `<span style="color: #64748b">[${time}]</span> <span style="color: ${color}">${msg}</span>`;
    logs.prepend(p);
    saveLogs();
}

function saveLogs() {
    const logs = document.getElementById('logs');
    if (!logs) return;
    const entries = Array.from(logs.querySelectorAll('p')).slice(0, 40).map(p => p.innerHTML);
    localStorage.setItem('ct_logs', JSON.stringify(entries));
}

function restoreLogs() {
    const logs = document.getElementById('logs');
    if (!logs) return;
    try {
        const entries = JSON.parse(localStorage.getItem('ct_logs') || '[]');
        entries.forEach(html => {
            const p = document.createElement('p');
            p.innerHTML = html;
            logs.appendChild(p);
        });
    } catch (e) { /* ignore corrupt storage */ }
}

function updateStats() {
    const cpu = Math.floor(Math.random() * 45) + 10;
    const cpuStat = document.getElementById('cpuStat');
    const cpuBar = document.getElementById('cpuBar');
    if(cpuStat) cpuStat.innerText = cpu + "%";
    if(cpuBar) cpuBar.style.width = cpu + "%";
}

function updateClock() {
    const sysTime = document.getElementById('sysTime');
    if(sysTime) sysTime.innerText = new Date().toLocaleTimeString();
}

function downloadLogs() {
    const logLines = Array.from(document.querySelectorAll('#logs p')).map(p => p.innerText);
    const blob = new Blob([logLines.join('\n')], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `cyber_report_${Date.now()}.txt`;
    link.click();
}

function terminalLog(message) {
    const output = document.getElementById('terminalOutput');
    if (!output) return;

    const time = new Date().toLocaleTimeString();
    output.innerHTML += `<p><span style="color: #f59e0b">[${time}]</span> <span style="color: #22c55e">SYSTEM:</span> ${message}</p>`;
    
    // Auto-scroll the terminal to the newest line
    output.scrollTop = output.scrollHeight;
}

const tasks = [
    "PING 127.0.0.1 - OK",
    "SCRAPING_METADATA...",
    "CLEANING_CACHE_0x4F",
    "MEM_SYNC_SUCCESS",
    "ENCRYPT_DAEMON_RUNNING",
    "VULN_SCAN_COMPLETE"
];

function startBackgroundFeed() {
    const container = document.getElementById('taskScroll');
    if (!container) return;

    setInterval(() => {
        const task = tasks[Math.floor(Math.random() * tasks.length)];
        const line = document.createElement('div');
        line.style.marginBottom = "4px";
        line.innerText = `[${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}] ${task}`;
        
        container.prepend(line); // Adds new task to the top
        
        if (container.children.length > 8) {
            container.removeChild(container.lastChild); // Keep it from overflowing
        }
    }, 3000); // New activity every 3 seconds
}

// Call this when the window loads
window.addEventListener('load', startBackgroundFeed);

/**
 * Initializes and executes the tactical network map
 */
async function startNetworkScan() {
    // 1. Setup Elements & Canvas
    const canvas = document.getElementById('netCanvas');
    const container = document.getElementById('netMapContainer');
    const nodeLayer = document.getElementById('nodeLayer');
    const status = document.getElementById('scanStatus');
    const log = document.getElementById('scanResult');
    const ctx = canvas.getContext('2d');

    // Reset UI
    nodeLayer.innerHTML = "";
    log.innerHTML = "Initializing uplink... scanning local subnets.";
    status.innerText = "SCANNING...";
    status.style.color = "var(--primary)";

    // Set Canvas Dimensions (matches CSS container size)
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    let activeNodes = [];
    let discoveredCount = 0;
    const maxNodes = 8;

    // 2. Node Discovery Loop
    const scanInterval = setInterval(() => {
        discoveredCount++;
        
        // Calculate circular coordinates
        const angle = (discoveredCount / maxNodes) * Math.PI * 2;
        const distance = Math.min(canvas.width, canvas.height) * 0.35; // Responsive radius
        
        const targetX = centerX + Math.cos(angle) * distance;
        const targetY = centerY + Math.sin(angle) * distance;

        // Store for animation
        activeNodes.push({ 
            x: targetX, 
            y: targetY, 
            offset: Math.random(), // Randomized start position for data pulses
            ip: `10.0.0.${100 + discoveredCount}` 
        });

        // Create HTML Node Element
        const nodeEl = document.createElement('div');
        nodeEl.className = 'net-node';
        nodeEl.style.left = `${(targetX / canvas.width) * 100}%`;
        nodeEl.style.top = `${(targetY / canvas.height) * 100}%`;
        nodeEl.setAttribute('data-ip', `10.0.0.${100 + discoveredCount}`);
        nodeLayer.appendChild(nodeEl);

        // System feedback
        addLog(`Network Discovery: Node ${100 + discoveredCount} online.`, "info");
        if(typeof terminalLog === 'function') {
            terminalLog(`NET: Node 10.0.0.${100 + discoveredCount} mapped.`);
        }

        if (discoveredCount >= maxNodes) {
            clearInterval(scanInterval);
            status.innerText = "COMPLETED";
            status.style.color = "var(--accent-green)";
            log.innerHTML = `Topology mapping complete. ${maxNodes} nodes active.`;
            
            // Start the data pulse animation
            requestAnimationFrame(animateDataFlow);
        }
    }, 600);

    // 3. Animation Loop (Data Packets)
    function animateDataFlow() {
        // Clear canvas for next frame
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        activeNodes.forEach(node => {
            // Draw Connection Line (Static)
            ctx.beginPath();
            ctx.setLineDash([5, 5]); // Tactical dashed look
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(node.x, node.y);
            ctx.stroke();
            ctx.setLineDash([]); // Reset dash

            // Calculate Pulse Position
            node.offset += 0.015; // Speed of packets
            if (node.offset > 1) node.offset = 0;

            const pulseX = centerX + (node.x - centerX) * node.offset;
            const pulseY = centerY + (node.y - centerY) * node.offset;

            // Draw Pulse Glow
            ctx.shadowBlur = 15;
            ctx.shadowColor = 'var(--primary)';
            
            // Draw Data Packet (Moving Dot)
            ctx.beginPath();
            ctx.fillStyle = 'var(--primary)';
            ctx.arc(pulseX, pulseY, 2.5, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.shadowBlur = 0; // Reset shadow for next lines
        });

        // Only keep animating if we are on the network section
        if (document.getElementById('networkSection').classList.contains('active')) {
            requestAnimationFrame(animateDataFlow);
        }
    }
}

function copyHash() {
    // 1. Get the text from your hashResult div
    const hashDiv = document.getElementById('hashResult');
    const textToCopy = hashDiv.innerText.trim();

    // 2. Stop if there is no hash
    if (!textToCopy || textToCopy === "Awaiting input...") {
        if (typeof addLog === "function") addLog("ERR: No hash to copy.");
        return;
    }

    // 3. THE BACKUP TRICK: Create a hidden textarea
    const textArea = document.createElement("textarea");
    textArea.value = textToCopy;
    document.body.appendChild(textArea);
    textArea.select();

    try {
        // Attempt the old-school copy command
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea); // Clean up

        if (successful) {
            // Visual feedback for the user
            const btn = event.target;
            const originalText = btn.innerHTML;
            
            btn.innerHTML = '<i class="fa-solid fa-check"></i> COPIED!';
            btn.style.color = "#22c55e"; // Green

            if (typeof addLog === "function") addLog("SYS: Signature copied (Legacy Mode).");

            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.color = "";
            }, 2000);
        }
    } catch (err) {
        console.error('Fallback copy failed', err);
        alert("Manual Copy Required: " + textToCopy);
    }
}

function handleFileSelect(input) {
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const encryptBtn = document.getElementById('fileEncryptBtn');
    const decryptBtn = document.getElementById('fileDecryptBtn');

    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        // --- THE FIX ---
        // Updates the UI to show the filename in primary color
        fileNameDisplay.innerHTML = `SELECTED: <span style="color: var(--primary); font-weight: bold;">${file.name}</span>`;
        
        // Enable the action buttons
        encryptBtn.disabled = false;
        decryptBtn.disabled = false;
        
        // Log it to the terminal for that OS feel
        addLog(`File loaded: ${file.name}`);
        terminalLog(`VAULT: Initialized buffer for ${file.name} (${file.size} bytes)`);
    } else {
        fileNameDisplay.innerHTML = 'Drop file here or <span style="color: var(--primary)">Browse</span>';
        encryptBtn.disabled = true;
        decryptBtn.disabled = true;
    }
}

// Derive an AES-GCM key from a user passphrase using PBKDF2
async function deriveKey(passphrase, salt) {
    const keyMaterial = await crypto.subtle.importKey(
        "raw", new TextEncoder().encode(passphrase), "PBKDF2", false, ["deriveKey"]
    );
    return crypto.subtle.deriveKey(
        { name: "PBKDF2", salt, iterations: 150000, hash: "SHA-256" },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );
}

async function processFile(action) {
    const fileInput = document.getElementById('fileSelector');
    const statusDisplay = document.getElementById('fileStatus');

    if (!fileInput.files[0]) return;
    const file = fileInput.files[0];

    const passphrase = prompt(action === 'encrypt'
        ? "Set a passphrase to seal this file (you'll need it to unseal):"
        : "Enter the passphrase used to seal this file:");
    if (!passphrase) {
        statusDisplay.innerHTML = 'Status: <span style="color: var(--error-red)">CANCELLED — passphrase required</span>';
        return;
    }

    statusDisplay.innerText = `Status: ${action === 'encrypt' ? 'SEALING (AES-256-GCM)' : 'UNSEALING'}...`;
    addLog(`Initiating ${action} on ${file.name}`);

    try {
        const rawBuffer = await file.arrayBuffer();

        if (action === 'encrypt') {
            const salt = crypto.getRandomValues(new Uint8Array(16));
            const iv = crypto.getRandomValues(new Uint8Array(12));
            const key = await deriveKey(passphrase, salt);
            const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, rawBuffer);

            // Package as: [16 bytes salt][12 bytes iv][ciphertext]
            const packed = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
            packed.set(salt, 0);
            packed.set(iv, salt.length);
            packed.set(new Uint8Array(ciphertext), salt.length + iv.length);

            downloadBinaryFile(packed, `${file.name}.sealed`, 'application/octet-stream');
            statusDisplay.innerHTML = 'Status: <span style="color: var(--accent-green)">FILE SEALED (real AES-256-GCM)</span>';
            terminalLog(`VAULT: AES-256-GCM seal complete for ${file.name}.`);
        } else {
            const data = new Uint8Array(rawBuffer);
            if (data.length < 28) throw new Error("File too small to be a sealed vault file.");
            const salt = data.slice(0, 16);
            const iv = data.slice(16, 28);
            const ciphertext = data.slice(28);
            const key = await deriveKey(passphrase, salt);
            const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);

            const outName = file.name.endsWith('.sealed') ? file.name.slice(0, -7) : `unsealed_${file.name}`;
            downloadBinaryFile(new Uint8Array(plaintext), outName, 'application/octet-stream');
            statusDisplay.innerHTML = 'Status: <span style="color: var(--primary)">FILE UNSEALED</span>';
            terminalLog(`VAULT: Unseal successful for ${file.name}.`);
        }
        addLog(`Completed: ${file.name}`);
    } catch (err) {
        console.error(err);
        statusDisplay.innerHTML = 'Status: <span style="color: var(--error-red)">ERROR: WRONG PASSPHRASE OR CORRUPT FILE</span>';
        terminalLog("VAULT: Critical failure — decryption rejected (bad key or tampered data).");
    }
}

// Helper: trigger browser download for binary data
function downloadBinaryFile(uint8Array, fileName, contentType) {
    const blob = new Blob([uint8Array], { type: contentType });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
}