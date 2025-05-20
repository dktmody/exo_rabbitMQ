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
- 🐳 Docker Compose >= 1.29
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

### 3. Using Docker

1. Create a `.env` file with RabbitMQ credentials:
   ```env
   RABBITMQ_USER=admin
   RABBITMQ_PASS=securepassword123
   ```

### 4. Lancer RabbitMQ avec Docker

```bash
docker-compose up -d
```

### 5. Vérifier le lancement de rabbitMQ

- AMQP: `amqp://localhost:5672`
- Interface de gestion de RabbitMQ (optionnel):  
  🔗 [http://localhost:15672](http://localhost:15672) (login with credentials from `.env`)

**Identifiants de connexion :**

- **Login** : `user`
- **Mot de passe** : `password`

### 5. Fonctionnement via le terminal :

- Si on lance la commande node producer.js (sans arguments) alors le mode aléatoire est lancé et des opérations et nombres (n1 et n2) sont choisis aléatoirement.
- Si on souhaite communiquer les arguments, on utilise la commande "node producer.js n1 n2 operation" soit par exemple "5 2 add" (pour 5+2) ou encore "9 5 mul" (pour 9\*5).
- l'opération "all" peut également désormais être choisie consistant à lancer toutes les opérations pour les nombres n1 et n2 choisis en tapant la commande "node producer.js n1 n2 all".
