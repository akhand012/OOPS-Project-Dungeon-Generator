#include <windows.h>
#include <string>
#include <vector>
#include <ctime>
#include <cstdlib>

using namespace std;

/* ================= GLOBAL ================= */
HWND hText, hInput, hAttack, hSneak, hNext;
bool gameStarted = false;

/* ================= Enemy ================= */
class Enemy {
protected:
    string name;
    int health, attack;

public:
    Enemy(string n, int h, int a) : name(n), health(h), attack(a) {}

    string getInfo() {
        return name + " | HP: " + to_string(health) + " | ATK: " + to_string(attack);
    }

    int getAttack() { return attack; }

    void takeDamage(int dmg) {
        health -= dmg;
        if (health < 0) health = 0;
    }

    bool isAlive() { return health > 0; }

    virtual ~Enemy() {}
};

class Goblin : public Enemy { public: Goblin() : Enemy("Goblin", 30, 5) {} };
class Skeleton : public Enemy { public: Skeleton() : Enemy("Skeleton", 40, 7) {} };
class Dragon : public Enemy { public: Dragon() : Enemy("Dragon Boss", 100, 20) {} };

/* ================= Item ================= */
class Item {
protected:
    string name;

public:
    Item(string n) : name(n) {}
    virtual string getInfo() { return name; }
    virtual ~Item() {}
};

class Potion : public Item { public: Potion() : Item("Health Potion") {} };
class Treasure : public Item { public: Treasure() : Item("Gold Treasure") {} };

/* ================= Player ================= */
class Player {
public:
    int room = 0;
    int health = 100;
    int sneak = 0;

    int attack() { return rand() % 15 + 10; }

    void takeDamage(int dmg) {
        health -= dmg;
        if (health < 0) health = 0;
    }

    bool isAlive() { return health > 0; }

    string getRank() {
        if (sneak == 0) return "LEGEND";
        if (sneak == 1) return "TITAN";
        if (sneak == 2) return "CHAMPION";
        if (sneak == 3) return "CRYSTAL";
        if (sneak == 4) return "SILVER";
        return "BRONZE";
    }
};

/* ================= Room ================= */
class Room {
public:
    Enemy* enemy;
    Item* item;

    Room(bool last = false) {
        if (last) enemy = new Dragon();
        else {
            int r = rand() % 100;
            if (r < 40) enemy = new Goblin();
            else if (r < 70) enemy = new Skeleton();
            else enemy = NULL;
        }

        int loot = rand() % 100;
        if (loot < 30) item = new Potion();
        else if (loot < 50) item = new Treasure();
        else item = NULL;
    }

    ~Room() {
        delete enemy;
        delete item;
    }
};

/* ================= Game ================= */
class Game {
public:
    Player player;
    vector<Room*> rooms;
    string log = "";

    Game(int n) {
        for (int i = 0; i < n; i++)
            rooms.push_back(new Room(i == n - 1));
    }

    Room* currentRoom() { return rooms[player.room]; }

    bool isGameOver() {
        return player.room >= rooms.size() || !player.isAlive();
    }

    void updateText() {
        string text = "Room: " + to_string(player.room + 1) + "\r\n";
        text += "Player HP: " + to_string(player.health) + "\r\n";
        text += "Rank: " + player.getRank() + "\r\n\r\n";

        if (!isGameOver()) {
            Room* r = currentRoom();

            if (r->enemy && r->enemy->isAlive())
                text += "Enemy: " + r->enemy->getInfo() + "\r\n";

            if (r->item)
                text += "Loot: " + r->item->getInfo() + "\r\n";
        }

        text += "\r\n" + log;

        SetWindowText(hText, text.c_str());

        if (isGameOver()) {
            EnableWindow(hAttack, FALSE);
            EnableWindow(hSneak, FALSE);
            EnableWindow(hNext, FALSE);
        }
    }

    void attackEnemy() {
        Room* r = currentRoom();

        if (!r->enemy || !r->enemy->isAlive()) return;

        int dmg = player.attack();
        r->enemy->takeDamage(dmg);

        log = "You dealt " + to_string(dmg) + "\r\n";

        if (!r->enemy->isAlive()) {
            log += "Enemy defeated!\r\n";

            if (r->item)
                log += "You got: " + r->item->getInfo() + "\r\n";
        } else {
            int edmg = rand() % r->enemy->getAttack();
            player.takeDamage(edmg);
            log += "Enemy dealt " + to_string(edmg) + "\r\n";
        }

        if (!player.isAlive()) {
            log += "\r\n💀 You Died!\r\nFinal Rank: " + player.getRank();
        }

        updateText();
    }

    void sneak() {
        Room* r = currentRoom();

        if (!r->enemy || !r->enemy->isAlive()) return;

        player.sneak++;
        log = "You sneaked past enemy!\r\n";

        updateText();
    }

    void nextRoom() {
        Room* r = currentRoom();

        if (r->enemy && r->enemy->isAlive()) {
            log = "Defeat or sneak first!\r\n";
            updateText();
            return;
        }

        player.room++;

        if (player.room >= rooms.size()) {
            log = "🎉 Congratulations!\r\nYou successfully cleared the dungeon!\r\nFinal Rank: " + player.getRank();
        } else {
            log = "➡ Entered next room!\r\n";
        }

        updateText();
    }
};

Game* game = NULL;

/* ================= Window ================= */
LRESULT CALLBACK WindowProc(HWND hwnd, UINT msg, WPARAM wp, LPARAM lp) {
    switch (msg) {

    case WM_CREATE:
        CreateWindow("STATIC", "Enter Rooms:",
            WS_VISIBLE | WS_CHILD,
            20, 20, 100, 20,
            hwnd, NULL, NULL, NULL);

        hInput = CreateWindow("EDIT", "5",
            WS_VISIBLE | WS_CHILD | WS_BORDER,
            130, 20, 100, 20,
            hwnd, NULL, NULL, NULL);

        CreateWindow("BUTTON", "Start",
            WS_VISIBLE | WS_CHILD,
            250, 20, 80, 25,
            hwnd, (HMENU)10, NULL, NULL);
        break;

    case WM_COMMAND:
        switch (LOWORD(wp)) {

        case 10: {
            char buf[10];
            GetWindowText(hInput, buf, 10);
            int rooms = atoi(buf);

            game = new Game(rooms);
            gameStarted = true;

            hText = CreateWindow("STATIC", "",
                WS_VISIBLE | WS_CHILD,
                20, 60, 350, 180,
                hwnd, NULL, NULL, NULL);

            hAttack = CreateWindow("BUTTON", "Attack",
                WS_VISIBLE | WS_CHILD,
                20, 250, 100, 30,
                hwnd, (HMENU)1, NULL, NULL);

            hSneak = CreateWindow("BUTTON", "Sneak",
                WS_VISIBLE | WS_CHILD,
                140, 250, 100, 30,
                hwnd, (HMENU)2, NULL, NULL);

            hNext = CreateWindow("BUTTON", "Next",
                WS_VISIBLE | WS_CHILD,
                260, 250, 100, 30,
                hwnd, (HMENU)3, NULL, NULL);

            game->updateText();
            break;
        }

        case 1: if (gameStarted) game->attackEnemy(); break;
        case 2: if (gameStarted) game->sneak(); break;
        case 3: if (gameStarted) game->nextRoom(); break;
        }
        break;

    case WM_DESTROY:
        PostQuitMessage(0);
        break;
    }

    return DefWindowProc(hwnd, msg, wp, lp);
}

/* ================= Main ================= */
int WINAPI WinMain(HINSTANCE hInst, HINSTANCE, LPSTR, int nCmdShow) {
    srand(time(0));

    WNDCLASS wc = {};
    wc.lpfnWndProc = WindowProc;
    wc.hInstance = hInst;
    wc.lpszClassName = "DungeonGUI";

    RegisterClass(&wc);

    HWND hwnd = CreateWindow("DungeonGUI", "Dungeon Game (OOP + GUI)",
        WS_OVERLAPPEDWINDOW,
        100, 100, 420, 350,
        NULL, NULL, hInst, NULL);

    ShowWindow(hwnd, nCmdShow);

    MSG msg = {};
    while (GetMessage(&msg, NULL, 0, 0)) {
        TranslateMessage(&msg);
        DispatchMessage(&msg);
    }

    return 0;
}