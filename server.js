const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Load Application Version Metadata
const getVersionInfo = () => {
  try {
    const raw = fs.readFileSync(path.join(__dirname, 'version.json'), 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return { version: "1.0.0", appName: "Dungeon Generator CI/CD" };
  }
};

/* ======================================================
   C++ OOP CORE LOGIC PRESERVED & PORTED FOR WEB HOSTING
   Directly mirrors Dungeon_generator.cpp & FINAL_DUNGEON_GENERATOR_PROJECT.cpp
   ====================================================== */

// Polymorphic Enemy Hierarchy
class Enemy {
  constructor(name, health, attack, icon) {
    this.name = name;
    this.health = health;
    this.maxHealth = health;
    this.attack = attack;
    this.icon = icon;
  }

  getInfo() {
    return `${this.name} | HP: ${this.health}/${this.maxHealth} | ATK: ${this.attack}`;
  }

  takeDamage(dmg) {
    this.health = Math.max(0, this.health - dmg);
  }

  isAlive() {
    return this.health > 0;
  }
}

class Goblin extends Enemy {
  constructor() {
    super("Goblin", 30, 5, "👺");
  }
}

class Skeleton extends Enemy {
  constructor() {
    super("Skeleton", 40, 7, "💀");
  }
}

class Dragon extends Enemy {
  constructor() {
    super("Dragon Boss", 100, 20, "🐉");
  }
}

// Polymorphic Item Hierarchy
class Item {
  constructor(name, icon, type, value) {
    this.name = name;
    this.icon = icon;
    this.type = type;
    this.value = value;
  }

  getInfo() {
    return `${this.icon} ${this.name}`;
  }
}

class Potion extends Item {
  constructor() {
    super("Health Potion", "🧪", "heal", 25);
  }
}

class Treasure extends Item {
  constructor() {
    super("Gold Treasure", "💰", "gold", 50);
  }
}

// Player Character Mechanics
class Player {
  constructor() {
    this.health = 100;
    this.maxHealth = 100;
    this.sneakCount = 0;
    this.gold = 0;
    this.currentRoom = 0;
  }

  attack() {
    return Math.floor(Math.random() * 15) + 10; // 10 to 24 damage
  }

  takeDamage(dmg) {
    this.health = Math.max(0, this.health - dmg);
  }

  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  isAlive() {
    return this.health > 0;
  }

  getRank() {
    if (this.sneakCount === 0) return { title: "LEGEND", emoji: "🔥", color: "#f59e0b" };
    if (this.sneakCount === 1) return { title: "TITAN", emoji: "💪", color: "#3b82f6" };
    if (this.sneakCount === 2) return { title: "CHAMPION", emoji: "⚔️", color: "#10b981" };
    if (this.sneakCount === 3) return { title: "CRYSTAL", emoji: "💎", color: "#06b6d4" };
    if (this.sneakCount === 4) return { title: "SILVER", emoji: "🥈", color: "#94a3b8" };
    return { title: "BRONZE", emoji: "🪙", color: "#b45309" };
  }
}

// Procedural Room Generation
class Room {
  constructor(id, isLastRoom) {
    this.id = id;
    this.visited = false;
    this.cleared = false;

    // Enemy spawn probabilities
    if (isLastRoom) {
      this.enemy = new Dragon();
    } else {
      const r = Math.floor(Math.random() * 100);
      if (r < 40) {
        this.enemy = new Goblin();
      } else if (r < 70) {
        this.enemy = new Skeleton();
      } else {
        this.enemy = null; // 30% empty room
      }
    }

    // Loot spawn probabilities
    const lootRoll = Math.floor(Math.random() * 100);
    if (lootRoll < 30) {
      this.item = new Potion();
    } else if (lootRoll < 50) {
      this.item = new Treasure();
    } else {
      this.item = null;
    }
  }
}

// Dungeon Engine
class Dungeon {
  constructor(totalRooms) {
    this.totalRooms = Math.max(3, Math.min(20, totalRooms || 5));
    this.rooms = [];
    this.generate();
  }

  generate() {
    for (let i = 0; i < this.totalRooms; i++) {
      const isLast = (i === this.totalRooms - 1);
      this.rooms.push(new Room(i + 1, isLast));
    }
  }
}

/* ======================================================
   API ENDPOINTS FOR CI/CD & LIVE DEMONSTRATION
   ====================================================== */

// 1. Health Endpoint (Verified by Jenkins Stage 6 & K8s Liveness Probe)
app.get('/health', (req, res) => {
  const versionInfo = getVersionInfo();
  res.status(200).json({
    status: "UP",
    healthy: true,
    application: versionInfo.appName || "Dungeon Generator CI/CD",
    version: versionInfo.version || "1.0.0",
    pipeline: "Jenkins AWS EC2 Pipeline",
    timestamp: new Date().toISOString(),
    engine: "C++ OOP Procedural Dungeon Engine",
    student: "Akhand Pratap Singh"
  });
});

// 2. Application Version Endpoint
app.get('/api/version', (req, res) => {
  res.json(getVersionInfo());
});

// 3. Procedural Dungeon Generation API
app.post('/api/generate', (req, res) => {
  const roomCount = parseInt(req.body.rooms) || 5;
  const dungeon = new Dungeon(roomCount);
  const player = new Player();

  res.json({
    success: true,
    version: getVersionInfo().version,
    totalRooms: dungeon.totalRooms,
    rooms: dungeon.rooms,
    player: {
      health: player.health,
      maxHealth: player.maxHealth,
      sneakCount: player.sneakCount,
      gold: player.gold,
      currentRoom: player.currentRoom,
      rank: player.getRank()
    }
  });
});

// 4. Combat / Adventure Action API
app.post('/api/action', (req, res) => {
  const { action, playerState, currentRoomState, totalRooms } = req.body;
  if (!playerState || !currentRoomState) {
    return res.status(400).json({ error: "Missing state payload" });
  }

  let logs = [];
  let player = Object.assign(new Player(), playerState);
  let enemy = currentRoomState.enemy ? Object.assign(new Enemy(), currentRoomState.enemy) : null;
  let item = currentRoomState.item;
  let roomCleared = currentRoomState.cleared || false;
  let gameOver = false;
  let gameWon = false;

  if (action === "attack") {
    if (enemy && enemy.health > 0) {
      const playerDmg = player.attack();
      enemy.health = Math.max(0, enemy.health - playerDmg);
      logs.push(`⚔️ You attacked ${enemy.name} for ${playerDmg} damage!`);

      if (enemy.health === 0) {
        logs.push(`✅ ${enemy.name} defeated!`);
        roomCleared = true;
        if (item) {
          if (item.type === "heal") {
            player.heal(item.value);
            logs.push(`🧪 You consumed ${item.name} and recovered ${item.value} HP!`);
          } else if (item.type === "gold") {
            player.gold += item.value;
            logs.push(`💰 You picked up ${item.name} (+${item.value} Gold)!`);
          }
          item = null;
        }
      } else {
        // Enemy retaliates
        const enemyDmg = Math.floor(Math.random() * enemy.attack) + 3;
        player.takeDamage(enemyDmg);
        logs.push(`💥 ${enemy.name} struck back for ${enemyDmg} damage!`);

        if (!player.isAlive()) {
          logs.push(`💀 You were slain by ${enemy.name}! GAME OVER.`);
          gameOver = true;
        }
      }
    } else {
      logs.push(`No active enemy to attack!`);
    }
  } else if (action === "sneak") {
    if (enemy && enemy.health > 0) {
      player.sneakCount++;
      roomCleared = true;
      logs.push(`🕵️ You skillfully sneaked past the ${enemy.name}! (Sneak Count: ${player.sneakCount})`);
      logs.push(`🏆 Rank updated: ${player.getRank().emoji} ${player.getRank().title}`);
    } else {
      logs.push(`No enemy to sneak past.`);
    }
  } else if (action === "next") {
    if (enemy && enemy.health > 0 && !roomCleared) {
      logs.push(`⚠️ Cannot advance! You must defeat or sneak past the enemy first.`);
    } else {
      player.currentRoom++;
      if (player.currentRoom >= totalRooms) {
        gameWon = true;
        gameOver = true;
        logs.push(`🎉 CONGRATULATIONS! You cleared all ${totalRooms} rooms of the dungeon!`);
        logs.push(`🏆 Final Rank Achieved: ${player.getRank().emoji} ${player.getRank().title}`);
      } else {
        logs.push(`🚪 You moved forward into Room ${player.currentRoom + 1}...`);
      }
    }
  }

  res.json({
    success: true,
    logs,
    playerState: {
      health: player.health,
      maxHealth: player.maxHealth,
      sneakCount: player.sneakCount,
      gold: player.gold,
      currentRoom: player.currentRoom,
      rank: player.getRank(),
      isAlive: player.isAlive()
    },
    currentRoomState: {
      ...currentRoomState,
      enemy: enemy,
      item: item,
      cleared: roomCleared
    },
    gameOver,
    gameWon
  });
});

// Fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    const v = getVersionInfo();
    console.log(`=======================================================`);
    console.log(`🗡️  DUNGEON GENERATOR CI/CD PIPELINE RUNNING`);
    console.log(`📌  Version: ${v.version} | Author: ${v.author}`);
    console.log(`🌐  Server listening on http://0.0.0.0:${PORT}`);
    console.log(`=======================================================`);
  });
}

module.exports = { app, Enemy, Goblin, Skeleton, Dragon, Item, Potion, Treasure, Player, Room, Dungeon };
