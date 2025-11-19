lucide.createIcons();

const SIMULATED_SECONDS_PER_TICK = 12; 
const VEHICLE_CAPACITY_KWH = 60;
const PRICE_22 = 1.45;
const PRICE_33 = 1.65;
const PRICE_66 = 1.85;

let currentScreen = 'welcome';
let batteryLevel = 15; 
let selectedSpeedMode = null; 

let chargingInterval;
let clockInterval; 
let secondsElapsed = 0; 
let kwhDelivered = 0;
let totalCost = 0;

let costAccumulated22 = 0;
let costAccumulated33 = 0;
let costAccumulated66 = 0;

let timeSpent22 = 0;
let timeSpent33 = 0;
let timeSpent66 = 0;

let timeInMaxPower = 0; 

let simulatedTimeDate = new Date(); 

let networkState = {
    st2: { active: true, percent: 88, label: 'Ocupado' },
    st3: { active: true, percent: 75, label: 'Ocupado' }
};

function goToScreen(screenId) {
    document.querySelectorAll('.active-screen').forEach(el => {
        el.classList.remove('active-screen');
        el.classList.add('hidden-screen');
    });
    const target = document.getElementById(`screen-${screenId}`);
    target.classList.remove('hidden-screen');
    target.classList.add('active-screen');
    currentScreen = screenId;

    if(screenId === 'speed-select') {
        updateGridDisplayOnSelection();
    }
}

function updateGridDisplayOnSelection() {
    const container = document.getElementById('selection-network-status');
    container.innerHTML = '';

    const st2 = networkState.st2;
    const st2Color = st2.active ? 'text-orange-400' : 'text-green-400';
    const st2Bg = st2.active ? 'bg-orange-900/20 border-orange-500/20' : 'bg-green-900/20 border-green-500/20';
    const st2Icon = st2.active ? 'car-front' : 'plug-zap';
    const st2Text = st2.active ? `Ocupado (${Math.floor(st2.percent)}%)` : 'Disponível';

    const st3 = networkState.st3;
    const st3Color = st3.active ? 'text-orange-400' : 'text-green-400';
    const st3Bg = st3.active ? 'bg-orange-900/20 border-orange-500/20' : 'bg-green-900/20 border-green-500/20';
    const st3Icon = st3.active ? 'car-front' : 'plug-zap';
    const st3Text = st3.active ? `Ocupado (${Math.floor(st3.percent)}%)` : 'Disponível';

    const html = `
        <div class="flex gap-2">
            <div class="flex-1 ${st2Bg} border rounded-lg p-2 flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded bg-black/30 flex items-center justify-center text-[10px] font-bold text-white/50">02</div>
                    <div>
                        <p class="text-[10px] text-white/70">Estação 02</p>
                        <p class="text-xs font-bold ${st2Color}">${st2Text}</p>
                    </div>
                </div>
                <i data-lucide="${st2Icon}" class="w-4 h-4 ${st2Color}"></i>
            </div>
            
            <div class="flex-1 ${st3Bg} border rounded-lg p-2 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded bg-black/30 flex items-center justify-center text-[10px] font-bold text-white/50">03</div>
                    <div>
                        <p class="text-[10px] text-white/70">Estação 03</p>
                        <p class="text-xs font-bold ${st3Color}">${st3Text}</p>
                    </div>
                </div>
                <i data-lucide="${st3Icon}" class="w-4 h-4 ${st3Color}"></i>
            </div>
        </div>
        <div class="text-[9px] text-center text-white/30 mt-1">
            * Velocidade máxima depende de vagas livres.
        </div>
    `;

    container.innerHTML = html;
    lucide.createIcons();
}

function selectSpeed(mode) {
    selectedSpeedMode = mode;
    let label = mode === 'ultra' ? 'ULTRA RÁPIDA' : (mode === 'standard' ? 'RÁPIDA' : 'ECO');
    document.getElementById('auth-mode-display').innerText = label;
    goToScreen('auth');
}

function simulateAuth() {
    const btn = document.getElementById('btn-auth');
    const status = document.getElementById('auth-status');
    btn.innerText = "Processando...";
    btn.disabled = true;
    btn.classList.add('opacity-75');

    setTimeout(() => {
        status.classList.remove('hidden');
        btn.classList.add('hidden');
        setTimeout(() => {
            startChargingSimulation();
        }, 1000);
    }, 1500);
}

function startChargingSimulation() {
    goToScreen('charging');
    clearInterval(clockInterval);
    simulatedTimeDate = new Date(); 

    updateNetworkUI();
    
    const smartGridPanel = document.getElementById('smart-boost');
    if (selectedSpeedMode === 'eco') {
        smartGridPanel.classList.add('hidden');
    } else {
        smartGridPanel.classList.remove('hidden');
    }
    
    batteryLevel = Math.floor(Math.random() * 20) + 10; 
    secondsElapsed = 0;
    kwhDelivered = 0;
    totalCost = 0;
    timeInMaxPower = 0;
    
    costAccumulated22 = 0;
    costAccumulated33 = 0;
    costAccumulated66 = 0;
    
    timeSpent22 = 0;
    timeSpent33 = 0;
    timeSpent66 = 0;
    
    let label = selectedSpeedMode === 'ultra' ? 'Ultra' : (selectedSpeedMode === 'standard' ? 'Rápida' : 'Eco');
    document.getElementById('charging-speed-label').innerText = label;

    updateDisplay(0);

    chargingInterval = setInterval(() => {
        secondsElapsed += SIMULATED_SECONDS_PER_TICK;
        simulatedTimeDate.setSeconds(simulatedTimeDate.getSeconds() + SIMULATED_SECONDS_PER_TICK);
        updateClockDisplay(simulatedTimeDate);

        if(networkState.st2.active) {
            networkState.st2.percent += 0.8; 
            if(networkState.st2.percent >= 100) {
                networkState.st2.active = false;
                networkState.st2.label = "Finalizado";
                showBoostNotification("Vaga liberada. Potência aumentada!");
            }
        }
        if(networkState.st3.active) {
            if (!networkState.st2.active) {
                    networkState.st3.percent += 1.2; 
            } else {
                networkState.st3.percent += 0.2; 
            }

            if(networkState.st3.percent >= 100) {
                networkState.st3.active = false;
                networkState.st3.label = "Finalizado";
                
                if(selectedSpeedMode === 'ultra') {
                    showBoostNotification("Rede livre. Potência máxima atingida!");
                }
            }
        }
        
        if(!networkState.st2.active && !networkState.st3.active) {
            timeInMaxPower += SIMULATED_SECONDS_PER_TICK;
            if(timeInMaxPower > 120 && !networkState.st2.active) {
                networkState.st2.active = true;
                networkState.st2.percent = 10;
                networkState.st2.label = "Novo Usuário";
                
                if(selectedSpeedMode !== 'eco') {
                        showTrafficNotification("Novo veículo conectado. Redirecionando energia...");
                }
            }
        }

        updateNetworkUI();

        let freeNeighbors = (!networkState.st2.active ? 1 : 0) + (!networkState.st3.active ? 1 : 0);
        
        let currentPower = 22; 
        let currentPrice = PRICE_22; 

        if (selectedSpeedMode === 'eco') {
            currentPower = 22;
            currentPrice = PRICE_22;
        } 
        else if (selectedSpeedMode === 'standard') {
            if (freeNeighbors >= 1) {
                currentPower = 33;
                currentPrice = PRICE_33;
            } else {
                currentPower = 22;
                currentPrice = PRICE_22;
            }
        }
        else if (selectedSpeedMode === 'ultra') {
            if (freeNeighbors >= 2) {
                currentPower = 66;
                currentPrice = PRICE_66;
            } else if (freeNeighbors === 1) {
                currentPower = 33;
                currentPrice = PRICE_33;
            } else {
                currentPower = 22;
                currentPrice = PRICE_22;
            }
        }

        const tariffBadge = document.getElementById('tariff-badge');
        tariffBadge.innerText = `Tarifa Atual: R$ ${currentPrice}/kWh`;
        if(currentPower > 22) {
            tariffBadge.className = "text-[10px] bg-orange-900/50 px-2 py-1 rounded text-orange-300 border border-orange-500/50 animate-pulse";
        } else {
            tariffBadge.className = "text-[10px] bg-green-900 px-2 py-1 rounded text-green-300 border border-green-700";
        }

        let displayPower = currentPower + (Math.random() * 0.2 - 0.1);
        
        if(batteryLevel > 90) displayPower = displayPower * 0.6;
        if(batteryLevel > 98) displayPower = 5;

        let instantKwh = displayPower * (SIMULATED_SECONDS_PER_TICK / 3600);
        kwhDelivered += instantKwh;

        let instantCost = instantKwh * currentPrice;
        totalCost += instantCost;

        if (currentPower === 22) {
            costAccumulated22 += instantCost;
            timeSpent22 += SIMULATED_SECONDS_PER_TICK;
        }
        else if (currentPower === 33) {
            costAccumulated33 += instantCost;
            timeSpent33 += SIMULATED_SECONDS_PER_TICK;
        }
        else if (currentPower === 66) {
            costAccumulated66 += instantCost;
            timeSpent66 += SIMULATED_SECONDS_PER_TICK;
        }

        let percentGain = (instantKwh / VEHICLE_CAPACITY_KWH) * 100;
        batteryLevel += percentGain;

        if (batteryLevel >= 100) {
            batteryLevel = 100;
            stopCharging();
        }

        updateDisplay(displayPower);

    }, 1000);
}

function updateNetworkUI() {
    const updateRow = (id, data) => {
        const bar = document.getElementById(`${id}-bar`);
        const label = document.getElementById(`${id}-status-text`);
        const percent = document.getElementById(`${id}-percent`);

        if(data.active) {
            label.innerText = data.label;
            label.className = "text-orange-400";
            percent.innerText = Math.floor(data.percent) + "%";
            bar.style.width = data.percent + "%";
            bar.className = "bg-orange-500 h-full rounded-full transition-all duration-1000 progress-bar-striped";
        } else {
            label.innerText = "Ocioso (Livre)";
            label.className = "text-green-400";
            percent.innerText = "--";
            bar.style.width = "0%";
            bar.className = "bg-green-900 h-full rounded-full transition-all duration-1000";
        }
    };
    updateRow('st2', networkState.st2);
    updateRow('st3', networkState.st3);
}

function showBoostNotification(msg) {
    const alert = document.getElementById('boost-active-alert');
    alert.querySelector('p').innerText = msg;
    alert.classList.remove('hidden');
    setTimeout(() => {
        alert.classList.add('hidden');
    }, 5000);
}

function showTrafficNotification(msg) {
    const alert = document.getElementById('traffic-alert');
    alert.querySelector('p').innerText = msg;
    alert.classList.remove('hidden');
    setTimeout(() => {
        alert.classList.add('hidden');
    }, 5000);
}

function updateDisplay(power) {
    const currentPercent = Math.floor(batteryLevel);
    
    const circle = document.getElementById('progress-ring');
    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (batteryLevel / 100) * circumference;
    circle.style.strokeDashoffset = offset;

    document.getElementById('battery-percent').innerText = currentPercent + '%';
    document.getElementById('power-kw').innerText = power.toFixed(1);
    document.getElementById('energy-kwh').innerText = kwhDelivered.toFixed(2);
    document.getElementById('current-cost').innerText = `R$ ${totalCost.toFixed(2).replace('.', ',')}`;

    const mins = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
    const secs = (secondsElapsed % 60).toString().padStart(2, '0');
    document.getElementById('time-elapsed').innerText = `${mins}:${secs}`;

    if (power > 1) { 
        const percentRemaining = 100 - currentPercent;
        const kwhNeeded = VEHICLE_CAPACITY_KWH * (percentRemaining / 100);
        const hoursRemaining = kwhNeeded / power;
        const minutesRemaining = Math.ceil(hoursRemaining * 60);
        document.getElementById('time-remaining').innerText = `${minutesRemaining} min restantes`;
    } else {
            document.getElementById('time-remaining').innerText = `-- min restantes`;
    }
}

function formatTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function stopCharging() {
    clearInterval(chargingInterval);
    startStandardClock(); 
    
    const mins = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
    const secs = (secondsElapsed % 60).toString().padStart(2, '0');

    document.getElementById('final-kwh').innerText = kwhDelivered.toFixed(2) + ' kWh';
    document.getElementById('final-time').innerText = `${mins}:${secs}`;
    document.getElementById('final-cost').innerText = `R$ ${totalCost.toFixed(2).replace('.', ',')}`;
    
    document.getElementById('cost-22').innerText = `R$ ${costAccumulated22.toFixed(2).replace('.', ',')}`;
    document.getElementById('time-22').innerText = formatTime(timeSpent22);
    
    document.getElementById('cost-33').innerText = `R$ ${costAccumulated33.toFixed(2).replace('.', ',')}`;
    document.getElementById('time-33').innerText = formatTime(timeSpent33);
    
    document.getElementById('cost-66').innerText = `R$ ${costAccumulated66.toFixed(2).replace('.', ',')}`;
    document.getElementById('time-66').innerText = formatTime(timeSpent66);

    goToScreen('summary');
}

function simulateDisconnect() {
    clearInterval(chargingInterval);
    startStandardClock();
    const alertEl = document.getElementById('disconnect-alert');
    alertEl.classList.remove('hidden');
    alertEl.classList.add('flex');
    setTimeout(() => {
        alertEl.classList.add('hidden');
        alertEl.classList.remove('flex');
        stopCharging(); 
    }, 2000);
}

function resetApp() {
    const btn = document.getElementById('btn-auth');
    const status = document.getElementById('auth-status');
    btn.innerText = "Simular Pagamento";
    btn.disabled = false;
    btn.classList.remove('opacity-75', 'hidden');
    status.classList.add('hidden');
    
    networkState = {
        st2: { active: true, percent: 88, label: 'Ocupado' },
        st3: { active: true, percent: 75, label: 'Ocupado' }
    };
    timeInMaxPower = 0;

    goToScreen('welcome');
}

function updateClockDisplay(dateObj) {
        document.getElementById('clock').innerText = dateObj.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
}

function startStandardClock() {
    if(clockInterval) clearInterval(clockInterval);
    updateClockDisplay(new Date());
    clockInterval = setInterval(() => {
        updateClockDisplay(new Date());
    }, 1000);
}

startStandardClock();