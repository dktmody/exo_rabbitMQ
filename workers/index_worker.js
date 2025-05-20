console.log("🚀 Lancement de tous les workers...");

// Importe et exécute chaque worker
require("./worker_add");
require("./worker_sub");
require("./worker_mul");
require("./worker_div");

console.log("✅ Tous les workers sont lancés !");
