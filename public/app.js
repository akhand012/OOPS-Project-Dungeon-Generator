// Dungeon Generator Client Controller
let gameState = {
  active: false,
  totalRooms: 5,
  rooms: [],
  currentRoomIndex: 0,
  player: {
    health: 100,
    maxHealth: 100,
    sneakCount: 0,
    gold: 0,
    currentRoom: 0,
    rank: { title: "LEGEND", emoji: "🔥", color: "#f59e0b" },
    isAlive: true
  }
};

// DOM Elements
const versionBadge = document.getElementById('versionBadge');
const heroVersion = document.getElementById('heroVersion');
const roomInput = document.getElementById('roomInput');
const startBtn = document.getElementById('startBtn');
const playerHpText = document.getElementById('playerHpText');
const playerHpBar = document.getElementById('playerHpBar');
const rankBadge = document.getElementById('rankBadge');
const sneakCountText = document.getElementById('sneakCountText');
const goldText = document.getElementById('goldText');
const roomCountText = document.getElementById('roomCountText');
const chamberNumberBadge = document.getElementById('chamberNumberBadge');
const chamberStatusText = document.getElementById('chamberStatusText');
const emptyState = document.getElementById('emptyState');
const encounterDisplay = document.getElementById('encounterDisplay');
const enemyCard = document.getElementById('enemyCard');
const enemyIcon = document.getElementById('enemyIcon');
const enemyName = document.getElementById('enemyName');
const enemyHpText = document.getElementById('enemyHpText');
const enemyHpBar = document.getElementById('enemyHpBar');
const enemyAtkText = document.getElementById('enemyAtkText');
const lootCard = document.getElementById('lootCard');
const lootIcon = document.getElementById('lootIcon');
const lootName = document.getElementById('lootName');
const lootDesc = document.getElementById('lootDesc');
const actionBar = document.getElementById('actionBar');
const attackBtn = document.getElementById('attackBtn');
const sneakBtn = document.getElementById('sneakBtn');
const nextBtn = document.getElementById('nextBtn');
const logBox = document.getElementById('logBox');
const clearLogBtn = document.getElementById('clearLogBtn');

// 1. Fetch & Display Version Info
async function fetchVersion() {
  try {
    const res = await fetch('/api/version');
    const data = await res.json();
    const vStr = `v${data.version || "1.0.0"}`;
    versionBadge.textContent = vStr;
    heroVersion.textContent = vStr;
    addLog(`[SYSTEM] Deployed Version: ${vStr} (Akhand Pratap Singh - TYCSE)`, 'sys');
  } catch (err) {
    console.error("Failed to fetch version", err);
  }
}

// 2. Start Game / Generate Dungeon
startBtn.addEventListener('click', async () => {
  const rooms = parseInt(roomInput.value) || 5;
  startBtn.disabled = true;
  startBtn.textContent = 'Generating...';

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rooms })
    });
    const data = await res.json();

    if (data.success) {
      gameState.active = true;
      gameState.totalRooms = data.totalRooms;
      gameState.rooms = data.rooms;
      gameState.currentRoomIndex = 0;
      gameState.player = data.player;

      emptyState.style.display = 'none';
      encounterDisplay.style.display = 'flex';
      actionBar.style.display = 'flex';

      addLog(`=== 🏰 Procedural Dungeon Generated (${data.totalRooms} Rooms) ===`, 'sys');
      addLog(`Hero entered Chamber 1 with 100 HP. Rank: ${data.player.rank.title}`, 'hero');

      updateUI();
    }
  } catch (err) {
    addLog(`[ERROR] Failed to generate dungeon: ${err.message}`, 'enemy');
  } finally {
    startBtn.disabled = false;
    startBtn.textContent = '⚔️ Restart Dungeon';
  }
});

// 3. Action Dispatcher
async function performAction(actionType) {
  if (!gameState.active) return;

  const currentRoom = gameState.rooms[gameState.currentRoomIndex];
  attackBtn.disabled = true;
  sneakBtn.disabled = true;
  nextBtn.disabled = true;

  try {
    const res = await fetch('/api/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: actionType,
        playerState: gameState.player,
        currentRoomState: currentRoom,
        totalRooms: gameState.totalRooms
      })
    });
    const data = await res.json();

    if (data.success) {
      // Append logs
      data.logs.forEach(msg => {
        let cls = 'sys';
        if (msg.includes('attacked') || msg.includes('dealt')) cls = 'hero';
        else if (msg.includes('struck') || msg.includes('slain') || msg.includes('Died')) cls = 'enemy';
        else if (msg.includes('Gold') || msg.includes('Potion') || msg.includes('consumed')) cls = 'loot';
        else if (msg.includes('CONGRATULATIONS') || msg.includes('defeated')) cls = 'victory';
        addLog(msg, cls);
      });

      // Update state
      gameState.player = data.playerState;
      gameState.rooms[gameState.currentRoomIndex] = data.currentRoomState;

      if (actionType === 'next' && !data.gameOver) {
        gameState.currentRoomIndex = gameState.player.currentRoom;
      }

      updateUI();

      if (data.gameOver) {
        gameState.active = false;
        actionBar.style.display = 'none';
        if (data.gameWon) {
          chamberStatusText.textContent = '🏆 Dungeon Cleared! Victory!';
        } else {
          chamberStatusText.textContent = '💀 Defeated in Battle!';
        }
      }
    }
  } catch (err) {
    addLog(`[ERROR] Action failed: ${err.message}`, 'enemy');
  } finally {
    if (gameState.active) {
      attackBtn.disabled = false;
      sneakBtn.disabled = false;
      nextBtn.disabled = false;
    }
  }
}

attackBtn.addEventListener('click', () => performAction('attack'));
sneakBtn.addEventListener('click', () => performAction('sneak'));
nextBtn.addEventListener('click', () => performAction('next'));

// 4. Update UI Elements
function updateUI() {
  const p = gameState.player;
  const currentRoom = gameState.rooms[gameState.currentRoomIndex];

  // Player Stats
  playerHpText.textContent = `${p.health} / ${p.maxHealth}`;
  const hpPercent = Math.max(0, Math.min(100, (p.health / p.maxHealth) * 100));
  playerHpBar.style.width = `${hpPercent}%`;
  if (hpPercent < 30) playerHpBar.style.background = 'linear-gradient(90deg, #ef4444, #f87171)';
  else if (hpPercent < 60) playerHpBar.style.background = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
  else playerHpBar.style.background = 'linear-gradient(90deg, #10b981, #34d399)';

  rankBadge.textContent = `${p.rank.emoji} ${p.rank.title}`;
  rankBadge.style.color = p.rank.color;
  rankBadge.style.borderColor = p.rank.color;

  sneakCountText.textContent = p.sneakCount;
  goldText.textContent = `${p.gold} 💰`;
  roomCountText.textContent = `${gameState.currentRoomIndex + 1} / ${gameState.totalRooms}`;

  // Chamber Header
  chamberNumberBadge.textContent = `Room Chamber #${gameState.currentRoomIndex + 1} of ${gameState.totalRooms}`;

  // Enemy Display
  if (currentRoom.enemy && currentRoom.enemy.health > 0) {
    enemyCard.style.display = 'block';
    enemyIcon.textContent = currentRoom.enemy.icon || '👾';
    enemyName.textContent = currentRoom.enemy.name;
    enemyHpText.textContent = `${currentRoom.enemy.health} / ${currentRoom.enemy.maxHealth}`;
    const enemyPercent = (currentRoom.enemy.health / currentRoom.enemy.maxHealth) * 100;
    enemyHpBar.style.width = `${enemyPercent}%`;
    enemyAtkText.textContent = `ATK Power: ${currentRoom.enemy.attack}`;
    chamberStatusText.textContent = `⚔️ Combat: ${currentRoom.enemy.name} sighted!`;
    attackBtn.disabled = false;
    sneakBtn.disabled = false;
  } else if (currentRoom.enemy && currentRoom.enemy.health <= 0) {
    enemyCard.style.display = 'block';
    enemyHpText.textContent = `0 / ${currentRoom.enemy.maxHealth} (Defeated)`;
    enemyHpBar.style.width = '0%';
    chamberStatusText.textContent = `✅ Chamber cleared. Proceed to next room.`;
    attackBtn.disabled = true;
    sneakBtn.disabled = true;
  } else {
    enemyCard.style.display = 'none';
    chamberStatusText.textContent = `🛡️ Quiet chamber. No enemies here.`;
    attackBtn.disabled = true;
    sneakBtn.disabled = true;
  }

  // Loot Display
  if (currentRoom.item) {
    lootCard.style.display = 'block';
    lootIcon.textContent = currentRoom.item.icon;
    lootName.textContent = currentRoom.item.name;
    if (currentRoom.item.type === 'heal') {
      lootDesc.textContent = `Grants +${currentRoom.item.value} HP upon victory!`;
    } else {
      lootDesc.textContent = `Contains +${currentRoom.item.value} Gold treasure!`;
    }
  } else {
    lootCard.style.display = 'none';
  }
}

// 5. Logger Helper
function addLog(msg, type = 'sys') {
  const div = document.createElement('div');
  div.className = `log-entry ${type}`;
  div.textContent = msg;
  logBox.appendChild(div);
  logBox.scrollTop = logBox.scrollHeight;
}

clearLogBtn.addEventListener('click', () => {
  logBox.innerHTML = '';
  addLog('[SYSTEM] Log chronicle cleared.', 'sys');
});

// Initialize on load
fetchVersion();
