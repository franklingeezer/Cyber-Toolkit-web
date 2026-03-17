// ==========================================
// --- INITIALIZATION & CORE SYSTEMS ---
// ==========================================
window.onload = () => {
    startMatrix();
    updateClock();
    setInterval(updateStats, 2000);
    setInterval(updateClock, 1000);
    setInterval(updateTrafficMonitor, 200); // Start the network monitor
    
    addLog("SYSTEM_BOOT_SEQUENCE_COMPLETE");
    addLog("ALL_MODULES_VERIFIED");
    
    // Auto-focus terminal on load
    const termInput = document.getElementById('terminalInput');
    if(termInput) termInput.focus();
};

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
}

// ==========================================
// --- TERMINAL ENGINE ---
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const terminalInput = document.getElementById('terminalInput');
    if (terminalInput) {
        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = terminalInput.value.trim();
                if (command !== "") {
                    processCommand(command.toLowerCase());
                }
                terminalInput.value = ''; 
            }
        });
    }
});

function processCommand(cmd) {
    const output = document.getElementById('terminalOutput');
    if(!output) return;
    const cleanCmd = cmd.toLowerCase().trim();

    output.innerHTML += `<p><span style="color: var(--primary)">></span> ${cleanCmd}</p>`;

    if (cleanCmd === 'help') {
        output.innerHTML += `<p style="color: #22c55e">Available: [status, scan, hack, clear, logs]</p>`;
    } 
    else if (cleanCmd === 'status') {
        const cpu = document.getElementById('cpuStat')?.innerText || "27%";
        output.innerHTML += `<p style="color: #38bdf8">CORE: ACTIVE | LOAD: ${cpu} | OS: CYBER_OS v2.4</p>`;
    } 
    else if (cleanCmd === 'clear') {
        output.innerHTML = '';
        return; 
    } 
    else if (cleanCmd === 'scan') {
        output.innerHTML += `<p>Scanning system nodes...</p>`;
        setTimeout(() => {
            output.innerHTML += `<p style="color: #22c55e">SYSTEM SECURE: No threats found.</p>`;
            output.scrollTop = output.scrollHeight;
        }, 1000);
    } 
    else if (cleanCmd === 'hack') {
        output.innerHTML += `<p style="color: #ef4444">Initializing bypass sequence...</p>`;
        setTimeout(() => { output.innerHTML += `<p>Accessing kernel...</p>`; }, 500);
        setTimeout(() => { output.innerHTML += `<p style="color: #22c55e">SUCCESS: Virtual root access granted.</p>`; }, 1500);
    }
    else {
        output.innerHTML += `<p style="color: #ef4444">Unknown command: ${cleanCmd}</p>`;
    }
    output.scrollTop = output.scrollHeight;
}

// ==========================================
// --- CRACKING LAB (FIXED VERSION) ---
// ==========================================
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
async function scanPorts() {
    const ip = document.getElementById("targetIP").value;
    const start = parseInt(document.getElementById("startPort").value);
    const end = parseInt(document.getElementById("endPort").value);
    const res = document.getElementById("scanResult");
    
    if(!ip || isNaN(start)) return alert("Invalid Scan Parameters");

    res.innerHTML = "Scanning...";
    addLog(`Starting port scan on ${ip}`, 'info');
    
    let openPorts = [];
    for(let i = start; i <= end; i++) {
        res.innerText = `Testing Port: ${i}...`;
        await new Promise(r => setTimeout(r, 50)); 
        if(Math.random() > 0.9) {
            openPorts.push(i);
            addLog(`Vulnerability Found: Port ${i} OPEN`, 'warn');
        }
    }
    res.innerHTML = openPorts.length > 0 ? 
        `<span style="color:#ef4444">Scan Complete. Open: ${openPorts.join(', ')}</span>` : 
        `<span style="color:#22c55e">Scan Complete. No vulnerabilities found.</span>`;
}

let trafficPoints = Array(30).fill(0);
function updateTrafficMonitor() {
    const canvas = document.getElementById('trafficChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    trafficPoints.push(Math.random() * canvas.height * 0.8);
    trafficPoints.shift();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;

    const step = canvas.width / (trafficPoints.length - 1);
    for (let i = 0; i < trafficPoints.length; i++) {
        const x = i * step;
        const y = canvas.height - trafficPoints[i];
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, 'rgba(56, 189, 248, 0.3)');
    grad.addColorStop(1, 'transparent');
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.stroke();

    document.getElementById('inboundRate').innerText = (Math.random() * 500).toFixed(1) + " KB/s";
    document.getElementById('outboundRate').innerText = (Math.random() * 100).toFixed(1) + " KB/s";
}

// ==========================================
// --- SYSTEM HELPERS ---
// ==========================================
function addLog(msg, type = 'info') {
    const logs = document.getElementById('logs');
    if(!logs) return;
    const time = new Date().toLocaleTimeString();
    const p = document.createElement('p');
    let color = type === 'warn' ? '#ef4444' : (type === 'success' ? '#22c55e' : '#38bdf8');
    p.innerHTML = `<span style="color: #64748b">[${time}]</span> <span style="color: ${color}">${msg}</span>`;
    logs.prepend(p);
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

let activeNodes = []; // Store node positions for the canvas to find them

async function startNetworkScan() {
    const canvas = document.getElementById('netCanvas');
    const container = document.getElementById('netMapContainer');
    const nodeLayer = document.getElementById('nodeLayer');
    const status = document.getElementById('scanStatus');
    const log = document.getElementById('scanResult');
    
    if (!canvas || !container) return; // Safety check

    // 1. Initialize Canvas properly inside the function
    const ctx = canvas.getContext('2d');
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;

    // Reset UI
    nodeLayer.innerHTML = "";
    log.innerHTML = "Mapping network topology...";
    status.innerText = "SCANNING...";
    status.style.color = "var(--primary)";

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    let activeNodes = [];
    let discoveredCount = 0;
    const maxNodes = 8;

    // 2. Node Discovery Loop
    const scanInterval = setInterval(() => {
        discoveredCount++;
        
        const angle = (discoveredCount / maxNodes) * Math.PI * 2;
        const distance = Math.min(canvas.width, canvas.height) * 0.35;
        
        const targetX = centerX + Math.cos(angle) * distance;
        const targetY = centerY + Math.sin(angle) * distance;

        activeNodes.push({ 
            x: targetX, 
            y: targetY, 
            offset: Math.random()
        });

        const nodeEl = document.createElement('div');
        nodeEl.className = 'net-node';
        nodeEl.style.left = `${(targetX / canvas.width) * 100}%`;
        nodeEl.style.top = `${(targetY / canvas.height) * 100}%`;
        nodeEl.setAttribute('data-ip', `192.168.1.${100 + discoveredCount}`);
        nodeLayer.appendChild(nodeEl);

        if (discoveredCount >= maxNodes) {
            clearInterval(scanInterval);
            status.innerText = "COMPLETED";
            status.style.color = "var(--accent-green)";
            requestAnimationFrame(animateDataFlow);
        }
    }, 600);

    // 3. Animation Loop for Data Pulses
    function animateDataFlow() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        activeNodes.forEach(node => {
            // Draw Connection Line
            ctx.beginPath();
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(node.x, node.y);
            ctx.stroke();

            // Animate Pulse
            node.offset += 0.015;
            if (node.offset > 1) node.offset = 0;

            const pulseX = centerX + (node.x - centerX) * node.offset;
            const pulseY = centerY + (node.y - centerY) * node.offset;

            ctx.beginPath();
            ctx.fillStyle = 'var(--primary)';
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'var(--primary)';
            ctx.arc(pulseX, pulseY, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        });

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

async function processFile(action) {
    const fileInput = document.getElementById('fileSelector');
    const statusDisplay = document.getElementById('fileStatus');
    
    if (!fileInput.files[0]) return;

    const file = fileInput.files[0];
    const reader = new FileReader();

    statusDisplay.innerText = `Status: ${action === 'encrypt' ? 'SEALING' : 'UNSEALING'}...`;
    addLog(`Initiating ${action} on ${file.name}`);

    reader.onload = function(e) {
        try {
            const rawData = e.target.result;
            let processedContent;

            if (action === 'encrypt') {
                // Seal: Convert raw text/binary to Base64
                processedContent = btoa(rawData);
                downloadFile(processedContent, `SEALED_${file.name}.lock`, 'text/plain');
                statusDisplay.innerHTML = 'Status: <span style="color: var(--accent-green)">FILE SEALED</span>';
            } else {
                // Unseal: Convert Base64 back to raw data
                processedContent = atob(rawData);
                downloadFile(processedContent, file.name.replace('SEALED_', ''), 'application/octet-stream');
                statusDisplay.innerHTML = 'Status: <span style="color: var(--primary)">FILE UNSEALED</span>';
            }

            terminalLog(`VAULT: ${action.toUpperCase()} operation successful.`);
            addLog(`Completed: ${file.name}`);

        } catch (err) {
            console.error(err);
            statusDisplay.innerHTML = 'Status: <span style="color: var(--error-red)">ERROR: INVALID DATA</span>';
            terminalLog("VAULT: Critical failure during buffer transformation.");
        }
    };

    // Read as binary string to handle various file types
    reader.readAsBinaryString(file);
}

// Helper function to trigger the browser download
function downloadFile(content, fileName, contentType) {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
}