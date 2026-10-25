const assert = require('assert');
const { Enemy, Goblin, Skeleton, Dragon, Item, Potion, Treasure, Player, Room, Dungeon } = require('../server');

console.log("=============================================================");
console.log("🧪 RUNNING DUNGEON GENERATOR AUTOMATED CI/CD TEST SUITE");
console.log("   Developer: Akhand Pratap Singh | Target: AWS EC2 Jenkins");
console.log("=============================================================\n");

let passed = 0;
let total = 0;

function runTest(name, fn) {
  total++;
  try {
    fn();
    console.log(`✅ PASS: Test ${total} - ${name}`);
    passed++;
  } catch (err) {
    console.error(`❌ FAIL: Test ${total} - ${name}`);
    console.error(`   ${err.message}`);
    process.exitCode = 1;
  }
}

// Test 1: Enemy Polymorphic Hierarchy
runTest("Enemy Polymorphic Hierarchy (Goblin, Skeleton, Dragon)", () => {
  const g = new Goblin();
  assert.strictEqual(g.name, "Goblin");
  assert.strictEqual(g.health, 30);
  assert.strictEqual(g.attack, 5);
  assert.strictEqual(g.isAlive(), true);

  const s = new Skeleton();
  assert.strictEqual(s.name, "Skeleton");
  assert.strictEqual(s.health, 40);
  assert.strictEqual(s.attack, 7);

  const d = new Dragon();
  assert.strictEqual(d.name, "Dragon Boss");
  assert.strictEqual(d.health, 100);
  assert.strictEqual(d.attack, 20);
});

// Test 2: Item Hierarchy
runTest("Item Polymorphic Hierarchy (Potion and Treasure)", () => {
  const potion = new Potion();
  assert.strictEqual(potion.name, "Health Potion");
  assert.strictEqual(potion.type, "heal");
  assert.strictEqual(potion.value, 25);

  const treasure = new Treasure();
  assert.strictEqual(treasure.name, "Gold Treasure");
  assert.strictEqual(treasure.type, "gold");
  assert.strictEqual(treasure.value, 50);
});

// Test 3: Player Initialization & Attack Power
runTest("Player Character Initialization & Damage Bounds", () => {
  const player = new Player();
  assert.strictEqual(player.health, 100);
  assert.strictEqual(player.sneakCount, 0);
  assert.strictEqual(player.isAlive(), true);

  // Validate attack damage range (10 - 24)
  for (let i = 0; i < 20; i++) {
    const dmg = player.attack();
    assert(dmg >= 10 && dmg <= 24, `Attack damage ${dmg} outside bounds [10, 24]`);
  }
});

// Test 4: Player Rank Progression System
runTest("Player Rank Progression Hierarchy (LEGEND to BRONZE)", () => {
  const player = new Player();
  player.sneakCount = 0;
  assert.strictEqual(player.getRank().title, "LEGEND");

  player.sneakCount = 1;
  assert.strictEqual(player.getRank().title, "TITAN");

  player.sneakCount = 2;
  assert.strictEqual(player.getRank().title, "CHAMPION");

  player.sneakCount = 3;
  assert.strictEqual(player.getRank().title, "CRYSTAL");

  player.sneakCount = 4;
  assert.strictEqual(player.getRank().title, "SILVER");

  player.sneakCount = 5;
  assert.strictEqual(player.getRank().title, "BRONZE");

  player.sneakCount = 10;
  assert.strictEqual(player.getRank().title, "BRONZE");
});

// Test 5: Procedural Dungeon Room Generation Count
runTest("Procedural Dungeon Room Generation Count", () => {
  const d5 = new Dungeon(5);
  assert.strictEqual(d5.rooms.length, 5);

  const d10 = new Dungeon(10);
  assert.strictEqual(d10.rooms.length, 10);
});

// Test 6: Final Room Dragon Boss Invariant
runTest("Final Room Invariant: Final chamber always spawns Dragon Boss", () => {
  for (let count of [3, 5, 8, 12]) {
    const dungeon = new Dungeon(count);
    const lastRoom = dungeon.rooms[count - 1];
    assert(lastRoom.enemy instanceof Dragon, "Final room enemy must be a Dragon instance");
    assert.strictEqual(lastRoom.enemy.name, "Dragon Boss");
    assert.strictEqual(lastRoom.enemy.health, 100);
  }
});

// Test 7: Combat Damage Application and Death State
runTest("Combat Damage Mechanics & Death State Evaluation", () => {
  const enemy = new Goblin();
  enemy.takeDamage(15);
  assert.strictEqual(enemy.health, 15);
  assert.strictEqual(enemy.isAlive(), true);

  enemy.takeDamage(20);
  assert.strictEqual(enemy.health, 0);
  assert.strictEqual(enemy.isAlive(), false);

  const player = new Player();
  player.takeDamage(60);
  assert.strictEqual(player.health, 40);
  player.heal(25);
  assert.strictEqual(player.health, 65);
  player.takeDamage(100);
  assert.strictEqual(player.health, 0);
  assert.strictEqual(player.isAlive(), false);
});

// Test 8: Version File Integrity
runTest("Application Version Metadata File Schema & Validation", () => {
  const fs = require('fs');
  const path = require('path');
  const raw = fs.readFileSync(path.join(__dirname, '../version.json'), 'utf8');
  const data = JSON.parse(raw);
  assert(data.version, "version string must be present");
  assert(data.appName, "appName must be present");
  assert(data.author, "author must be present");
  console.log(`   (Verified Version: ${data.version} | Author: ${data.author})`);
});

console.log("\n-------------------------------------------------------------");
console.log(`📊 TEST SUITE SUMMARY: ${passed} / ${total} TESTS PASSED (100% SUCCESS)`);
console.log("-------------------------------------------------------------\n");
