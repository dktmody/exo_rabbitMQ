# 🧮 Distributed Calculator with RabbitMQ

A RabbitMQ-based distributed computing system for the **NGI Nuclear Physics Institute**.  
The system distributes mathematical operations (`add`, `sub`, `mul`, `div`) across multiple workers.

---

## 🎯 Objective

Simulate a distributed system for mathematical computation using **RabbitMQ** as a message broker.  
A producer sends random operations, distributed among workers via RabbitMQ, and results are collected by a result consumer.

---

## 🧰 Technologies Used

- 🟢 Node.js
- 🐇 RabbitMQ (via Docker)
- 📦 [amqplib](https://www.npmjs.com/package/amqplib)
- 🐳 Docker & Docker Compose

---

## 📁 Project Structure
```
exo_rabbitMQ/
├── docker-compose.yml        # Définition du service RabbitMQ
├── package.json              # Scripts et dépendances
├── README.md                 # Documentation du projet

├── producer.js               # Envoie des opérations aléatoires (add, sub, mul, div, all)
├── result_consumer.js        # Lit et affiche les résultats des calculs

└── workers/
    ├── worker_add.js         # Worker gérant les additions
    ├── worker_sub.js         # Worker gérant les soustractions
    ├── worker_mul.js         # Worker gérant les multiplications
    └── worker_div.js         # Worker gérant les divisions
```

---

## ⚙️ Prerequisites

- 📦 Node.js >= 16
- 🐳 Docker >= 20
- 🐇 RabbitMQ (via Docker or local installation)

---

## 🚀 Setup & Run

### 1. Cloner le dépôt

```bash
git clone https://github.com/dktmody/exo_rabbitMQ.git
cd exo_rabbitMQ
```

### 2. Installer les dépendances Node.js

```bash
npm install
```

### 3. Lancer RabbitMQ avec Docker

```bash
docker-compose up -d
```

Ensuite, accéder à l'interface de gestion de RabbitMQ à l'adresse suivante :  
🔗 [http://localhost:15672](http://localhost:15672)  
**Identifiants de connexion :**  
- **Login** : `user`  
- **Mot de passe** : `password`




