# 🧮 Calculateur Distribué avec RabbitMQ

Un système de calcul distribué basé sur **RabbitMQ**, conçu pour l’**Institut de Physique Nucléaire NGI**.  
Le système répartit des opérations mathématiques (`add`, `sub`, `mul`, `div`) entre plusieurs workers.

---

## 🎯 Objectif

Simuler un système distribué de calcul mathématique utilisant **RabbitMQ** comme message broker.  
Un producteur envoie des opérations aléatoires, réparties entre des workers via RabbitMQ, et les résultats sont collectés par un consommateur dédié.

---

## 🧰 Technologies utilisées

- 🟢 Node.js
- 🐇 RabbitMQ (via Docker)
- 📦 [amqplib](https://www.npmjs.com/package/amqplib)
- 🐳 Docker & Docker Compose

---

## 📁 Structure du projet

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

## ⚙️ Prérequis

- 📦 Node.js ≥ 16
- 🐳 Docker ≥ 20
- 🐇 RabbitMQ (via Docker ou installation locale)

---

## 🚀 Installation & Exécution

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
