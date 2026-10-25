#include <iostream>
#include <vector>
#include <limits.h>

using namespace std;

#define MAX 20

class LogisticsSystem {
    int n; // number of locations
    int graph[MAX][MAX];

public:
    void input() {
        cout << "Enter number of locations: ";
        cin >> n;

        cout << "\nEnter distance matrix:\n";
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                cin >> graph[i][j];
            }
        }
    }

    void displayGraph() {
        cout << "\nDistance Matrix:\n";
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                cout << graph[i][j] << "\t";
            }
            cout << endl;
        }
    }

    // Greedy Approach (Nearest Neighbor)
    void findOptimizedRoute() {
        bool visited[MAX] = {false};
        int route[MAX];
        int totalCost = 0;

        int current = 0; // start from location 0
        visited[current] = true;
        route[0] = current;

        cout << "\nOptimized Delivery Route:\n";

        for (int i = 1; i < n; i++) {
            int minDist = INT_MAX;
            int next = -1;

            for (int j = 0; j < n; j++) {
                if (!visited[j] && graph[current][j] != 0) {
                    if (graph[current][j] < minDist) {
                        minDist = graph[current][j];
                        next = j;
                    }
                }
            }

            if (next == -1) break;

            route[i] = next;
            visited[next] = true;
            totalCost += minDist;
            current = next;
        }

        // Print route
        for (int i = 0; i < n; i++) {
            cout << route[i] << " -> ";
        }
        cout << "END";

        cout << "\nTotal Delivery Cost: " << totalCost << endl;
    }
};

int main() {
    LogisticsSystem system;
    int choice;

    do {
        cout << "\n===== Logistics Delivery Optimization =====\n";
        cout << "1. Input Locations & Distances\n";
        cout << "2. Display Graph\n";
        cout << "3. Find Optimized Route (Greedy)\n";
        cout << "4. Exit\n";
        cout << "Enter choice: ";
        cin >> choice;

        switch (choice) {
            case 1:
                system.input();
                break;
            case 2:
                system.displayGraph();
                break;
            case 3:
                system.findOptimizedRoute();
                break;
            case 4:
                cout << "Exiting...\n";
                break;
            default:
                cout << "Invalid choice!\n";
        }

    } while (choice != 4);

    return 0;
}