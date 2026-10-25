#include <iostream>
#include <vector>
#include <cstdlib>
#include <ctime>
using namespace std;

/* ================= Enemy Hierarchy ================= */
class Enemy {
protected:
    string name;
    int health;
    int attack;

public:
    Enemy(string n, int h, int a) : name(n), health(h), attack(a) {}

    virtual void showInfo() {
        cout << "Enemy: " << name << " | HP: " << health << " | ATK: " << attack << endl;
    }

    int getAttack() { return attack; }

    void takeDamage(int dmg) {
        health -= dmg;
        if (health < 0) health = 0;
    }

    bool isAlive() {
        return health > 0;
    }

    virtual ~Enemy() {}
};

class Goblin : public Enemy {
public:
    Goblin() : Enemy("Goblin", 30, 5) {}
};

class Skeleton : public Enemy {
public:
    Skeleton() : Enemy("Skeleton", 40, 7) {}
};

class Dragon : public Enemy {
public:
    Dragon() : Enemy("Dragon Boss", 100, 20) {}
};

/* ================= Item Hierarchy ================= */
class Item {
protected:
    string name;
public:
    Item(string n) : name(n) {}

    virtual void showInfo() {
        cout << "Item: " << name << endl;
    }

    virtual ~Item() {}
};

class Potion : public Item {
public:
    Potion() : Item("Health Potion") {}
};

class Treasure : public Item {
public:
    Treasure() : Item("Gold Treasure") {}
};

/* ================= Player ================= */
class Player {
private:
    int currentRoom;
    int health;
    int sneakCount;

public:
    Player() : currentRoom(0), health(100), sneakCount(0) {}

    int getCurrentRoom() const { return currentRoom; }
    int getHealth() const { return health; }

    void moveForward() { currentRoom++; }

    int attack() {
        return rand() % 15 + 10;
    }

    void takeDamage(int dmg) {
        health -= dmg;
        if (health < 0) health = 0;
    }

    bool isAlive() const {
        return health > 0;
    }

    void showStatus() {
        cout << "🧍 Player HP: " << health << endl;
    }

    void incrementSneak() {
        sneakCount++;
    }

    int getSneakCount() const {
        return sneakCount;
    }

    // ✅ Rank display (used everywhere)
    void displayRank() const {
        cout << "🏆 Current Rank: ";

        if (sneakCount == 0)
            cout << "LEGEND 🔥";
        else if (sneakCount == 1)
            cout << "TITAN 💪";
        else if (sneakCount == 2)
            cout << "CHAMPION ⚔️";
        else if (sneakCount == 3)
            cout << "CRYSTAL 💎";
        else if (sneakCount == 4)
            cout << "SILVER 🥈";
        else
            cout << "BRONZE 🪙";

        cout << endl;
    }
};

/* ================= Room ================= */
class Room {
private:
    int id;
    bool visited;
    Enemy* enemy;
    Item* item;

public:
    Room(int i) : id(i), visited(false), enemy(NULL), item(NULL) {}

    void setEnemy(Enemy* e) { enemy = e; }
    void setItem(Item* it) { item = it; }

    void fight(Player &player) {
        cout << "\n🔥 Battle Started!\n";

        while (enemy->isAlive() && player.isAlive()) {
            int playerDamage = player.attack();
            enemy->takeDamage(playerDamage);
            cout << "You dealt " << playerDamage << " damage!\n";

            if (!enemy->isAlive()) {
                cout << "✅ Enemy defeated!\n";
                return;
            }

            int enemyDamage = rand() % enemy->getAttack() + 3;
            player.takeDamage(enemyDamage);
            cout << "Enemy dealt " << enemyDamage << " damage!\n";

            player.showStatus();
        }

        if (!player.isAlive()) {
            cout << "\n💀 You Died! Game Over.\n";
        }
    }

    void enterRoom(Player &player) {
        visited = true;
        cout << "\n--- You entered Room " << id << " ---\n";

        // ✅ Show rank every time player enters room
        player.displayRank();

        if (enemy) {
            cout << "⚔️ Enemy encountered!\n";
            enemy->showInfo();

            cout << "Choose action: (1 = Attack, 2 = Sneak): ";
            int choice;
            cin >> choice;

            if (choice == 1) {
                fight(player);
                if (!player.isAlive()) return;
            } else {
                cout << "🕵️ You sneaked past the enemy!\n";
                player.incrementSneak();
                return;
            }
        } else {
            cout << "No enemy here.\n";
        }

        if (item) {
            cout << "🎁 You found loot!\n";
            item->showInfo();
        } else {
            cout << "No items in this room.\n";
        }
    }

    ~Room() {
        delete enemy;
        delete item;
    }
};

/* ================= Dungeon ================= */
class Dungeon {
private:
    vector<Room*> rooms;
    int totalRooms;

public:
    Dungeon(int n) : totalRooms(n) {
        generateDungeon();
    }

    void generateDungeon() {
        for (int i = 0; i < totalRooms; i++) {
            Room* room = new Room(i + 1);

            int r = rand() % 100;

            if (i == totalRooms - 1) {
                room->setEnemy(new Dragon());
            } else if (r < 40) {
                room->setEnemy(new Goblin());
            } else if (r < 70) {
                room->setEnemy(new Skeleton());
            }

            int lootChance = rand() % 100;
            if (lootChance < 30)
                room->setItem(new Potion());
            else if (lootChance < 50)
                room->setItem(new Treasure());

            rooms.push_back(room);
        }

        cout << "Dungeon Generated with " << totalRooms << " rooms!\n";
    }

    Room* getRoom(int index) {
        if (index >= 0 && index < totalRooms)
            return rooms[index];
        return NULL;
    }

    int getTotalRooms() const { return totalRooms; }

    ~Dungeon() {
        for (auto r : rooms)
            delete r;
    }
};

/* ================= Game Engine ================= */
class GameEngine {
private:
    Dungeon dungeon;
    Player player;

public:
    GameEngine(int rooms) : dungeon(rooms) {}

    void start() {
        cout << "\n=== Dungeon Adventure Started ===\n";

        while (true) {
            int pos = player.getCurrentRoom();

            if (pos >= dungeon.getTotalRooms()) {
                cout << "\n🏁 You cleared the dungeon! Game Over!\n";
                player.displayRank();
                break;
            }

            Room* room = dungeon.getRoom(pos);
            room->enterRoom(player);

            if (!player.isAlive()) {
                player.displayRank();
                break;
            }

            cout << "\nMove to next room? (1 = Yes, 0 = Exit): ";
            int choice;
            cin >> choice;

            if (choice == 1) {
                player.moveForward();
            } else {
                cout << "You exited the dungeon early.\n";
                player.displayRank();
                break;
            }
        }
    }
};

/* ================= Main ================= */
int main() {
    srand(time(0));

    int rooms;
    cout << "Enter number of rooms in dungeon: ";
    cin >> rooms;

    GameEngine game(rooms);
    game.start();

    return 0;
}