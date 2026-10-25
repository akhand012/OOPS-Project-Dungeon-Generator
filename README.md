# ⚔️ OOPS-Project-Dungeon-Generator — Enterprise CI/CD on AWS EC2

[![CI/CD Pipeline](https://img.shields.io/badge/CI%2FCD-Jenkins%20LTS-2496ED?logo=jenkins&logoColor=white)](#)
[![Docker](https://img.shields.io/badge/Docker-Hub%20Registry-0db7ed?logo=docker&logoColor=white)](#)
[![Kubernetes](https://img.shields.io/badge/Orchestration-Kubernetes%20(k3s)-326ce5?logo=kubernetes&logoColor=white)](#)
[![Cloud](https://img.shields.io/badge/Cloud-AWS%20EC2%20(ap--south--1)-FF9900?logo=amazon-aws&logoColor=white)](#)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](#)

> **College Continuous Competency Assessment 2 (CCA 2) Project**  
> **Student:** Akhand Pratap Singh  
> **Department:** Department of Computer Science & Engineering (TYCSE)  
> **Institution:** Dr. Vishwanath Karad MIT World Peace University (MIT-WPU) / PW IOI  
> **Course:** Cloud Computing and DevOps (Course Coordinator: Priya Nagargoje)  
> **Repository:** [https://github.com/akhand012/OOPS-Project-Dungeon-Generator](https://github.com/akhand012/OOPS-Project-Dungeon-Generator)

---

## 📖 1. Project Overview & Architecture

**Dungeon Generator** is an interactive, object-oriented procedural game application originally engineered in C++ utilizing core Object-Oriented Programming (OOP) paradigms:
- **Polymorphic Enemy Hierarchy:** Base `Enemy` class with derived `Goblin` (30 HP, 5 ATK), `Skeleton` (40 HP, 7 ATK), and `Dragon Boss` (100 HP, 20 ATK).
- **Polymorphic Item Hierarchy:** Base `Item` class with derived `Potion` (+25 HP healing) and `Treasure` (+50 Gold).
- **Player Mechanics & Rank Progression:** HP management (100 HP max), procedural attack calculations (`rand() % 15 + 10`), damage mitigation, and a dynamic rank engine tied to the player's Sneak Count:
  - 0 Sneaks &rarr; `🔥 LEGEND`
  - 1 Sneak &rarr; `💪 TITAN`
  - 2 Sneaks &rarr; `⚔️ CHAMPION`
  - 3 Sneaks &rarr; `💎 CRYSTAL`
  - 4 Sneaks &rarr; `🥈 SILVER`
  - 5+ Sneaks &rarr; `🪙 BRONZE`
- **Procedural Chamber Generator:** Dynamic room synthesis with an invariant that guarantees a showdown with the Dragon Boss in the final chamber.

To demonstrate this application over an AWS EC2 HTTP endpoint without compromising or replacing the original C++ codebase, a lightweight containerized web bridge (`server.js`, `public/`) was engineered to execute the exact same OOP engine and present a retro web-accessible interface alongside standard health monitoring endpoints (`/health`).

---

## 🏗️ 2. CI/CD Architecture & Pipeline Workflow

```
[Developer Commit & Push]
           │
           ▼
 [GitHub Repository: main branch]
           │
           ▼ (Triggered via Jenkins "Build Now")
 [Jenkins Automation Server on AWS EC2 (Port 8080)]
   ├── Stage 1: Checkout SCM
   ├── Stage 2: Build & Test (npm test - 8 Unit Tests)
   ├── Stage 3: Docker Image Build (Multi-stage build)
   ├── Stage 4: Docker Hub Push (akhand012/dungeon-generator:${BUILD_NUMBER} & :latest)
   ├── Stage 5: Kubernetes Rollout (k3s RollingUpdate with 2 Pod Replicas)
   └── Stage 6: Application Health Verification (HTTP 200 on /health)
           │
           ▼
[Live Dungeon Generator Application (NodePort: 30007)]
```

---

## 📂 3. Repository Directory Structure

```
OOPS-Project-Dungeon-Generator/
├── Dungeon_generator.cpp            # Original C++ console engine
├── FINAL_DUNGEON_GENERATOR_PROJECT.cpp # Original C++ Win32 GUI implementation
├── delivery.cpp                     # Logistics route optimization algorithm
├── server.js                        # Containerized web bridge and API engine
├── version.json                     # Application version metadata (v1.0.0 -> v1.1.0)
├── package.json                     # Node.js project manifest & test scripts
├── Dockerfile                       # Multi-stage lightweight Alpine container
├── .dockerignore                    # Build exclusion rules
├── Jenkinsfile                      # Declarative 6-stage CI/CD pipeline
├── public/
│   ├── index.html                   # Retro dungeon crawler web interface
│   ├── style.css                    # Responsive dark pixel-art styling
│   └── app.js                       # Frontend client game controller
├── tests/
│   └── dungeon.test.js              # Automated unit test suite (8 assertions)
├── k8s/
│   ├── deployment.yaml              # Kubernetes Deployment (2 replicas, probes)
│   └── service.yaml                 # Kubernetes NodePort Service (Port 30007)
├── scripts/
│   └── ec2-setup.sh                 # Cloud provisioning automation script
└── README.md                        # Documentation and demonstration guide
```

---

## 🧪 4. Local Execution & Automated Verification

### Running Unit Tests Locally
```bash
npm install
npm test
```

### Running Application Server Locally
```bash
node server.js
# Access in browser at: http://localhost:3000
# Health check: http://localhost:3000/health
```

### Testing Multi-stage Docker Container
```bash
docker build -t dungeon-generator:local .
docker run -d -p 3000:3000 --name dungeon-app dungeon-generator:local
curl http://localhost:3000/health
```

---

## 🎯 5. Teacher Evaluation & Version Change Demonstration

This CI/CD pipeline enables seamless, zero-downtime rolling deployments on AWS EC2:

1. **Initial Deployment (Step A):**
   - Access the live application URL: `http://<EC2-IP>:30007/`
   - Observe the initial displayed version badge: `v1.0.0`.
2. **Modify Version in Source Code (Step B):**
   - In `version.json`, edit `"version": "1.0.0"` to `"version": "1.1.0"`.
   - Commit and push changes:
     ```bash
     git add version.json
     git commit -m "feat(release): upgrade dungeon generator to version v1.1.0"
     git push origin main
     ```
3. **Trigger Pipeline (Step C):**
   - Navigate to the Jenkins Dashboard: `http://<EC2-IP>:8080/job/dungeon-generator-cicd/`
   - Click **Build Now**.
4. **Automated Pipeline Rollout (Step D):**
   - Observe Jenkins executing all 6 stages automatically without manual intervention.
   - Kubernetes executes a rolling update across both pod replicas.
5. **Verify New Live Deployment (Step E):**
   - Refresh `http://<EC2-IP>:30007/`.
   - Confirm the live badge now prominently displays `v1.1.0` with full health verification.
