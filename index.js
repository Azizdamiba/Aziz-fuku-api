const express = require('express');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

app.enable("trust proxy");
app.set("json spaces", 2);

// Middleware pour analyser les corps de requête JSON et URL-encodés, afin que req.body soit disponible pour les API POST
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Servir les fichiers statiques depuis le dossier "web"
app.use('/', express.static(path.join(__dirname, 'web')));

// Exposer settings.json à la racine
app.get('/settings.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'settings.json'));
});

// Charger les paramètres pour le middleware
const settingsPath = path.join(__dirname, 'settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));

// Middleware pour enrichir les réponses JSON, compatible avec les réponses de users.js
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function (data) {
    if (data && typeof data === 'object') {
      const responseData = {
        status: data.status,
        operator: (settings.apiSettings && settings.apiSettings.operator) || "Created Using Rynn UI",
        ...data
      };
      return originalJson.call(this, responseData);
    }
    return originalJson.call(this, data);
  };
  next();
});

// Charger les modules d'API depuis le dossier "api" et ses sous-dossiers de manière récursive
const apiFolder = path.join(__dirname, 'api');
let totalRoutes = 0;
const apiModules = [];

// Fonction récursive pour charger les modules
const loadModules = (dir) => {
  fs.readdirSync(dir).forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      loadModules(filePath); // Récursion dans le sous-dossier
    } else if (fs.statSync(filePath).isFile() && path.extname(file) === '.js') {
      try {
        const module = require(filePath);
        // Valider la structure du module attendue par index.js
        if (!module.meta || !module.onStart || typeof module.onStart !== 'function') {
          console.warn(chalk.bgHex('#FF9999').hex('#333').bold(`Module invalide dans ${filePath} : meta ou onStart manquant ou invalide`));
          return;
        }

        const basePath = module.meta.path.split('?')[0];
        const routePath = '/api' + basePath; // Ajoute /api devant, compatible avec le path de users.js
        const method = (module.meta.method || 'get').toLowerCase(); // Gère le 'post' provenant de users.js
        app[method](routePath, (req, res) => {
          console.log(chalk.bgHex('#99FF99').hex('#333').bold(`Traitement de la requête ${method.toUpperCase()} pour ${routePath}`));
          module.onStart({ req, res }); // Passe req et res à onStart de users.js
        });
        apiModules.push({
          name: module.meta.name,
          description: module.meta.description,
          category: module.meta.category,
          path: routePath + (module.meta.path.includes('?') ? '?' + module.meta.path.split('?')[1] : ''),
          author: module.meta.author,
          method: module.meta.method || 'get'
        });
        totalRoutes++;
        console.log(chalk.bgHex('#FFFF99').hex('#333').bold(`Route chargée : \( {module.meta.name} ( \){method.toUpperCase()})`));
      } catch (error) {
        console.error(chalk.bgHex('#FF9999').hex('#333').bold(`Erreur lors du chargement du module ${filePath} : ${error.message}`));
      }
    }
  });
};

loadModules(apiFolder);

console.log(chalk.bgHex('#90EE90').hex('#333').bold('Chargement terminé ! ✓'));
console.log(chalk.bgHex('#90EE90').hex('#333').bold(`Nombre total de routes chargées : ${totalRoutes}`));

// Endpoint pour exposer les métadonnées de l'API
app.get('/api/info', (req, res) => {
  const categories = {};
  apiModules.forEach(module => {
    if (!categories[module.category]) {
      categories[module.category] = { name: module.category, items: [] };
    }
    categories[module.category].items.push({
      name: module.name,
      desc: module.description,
      path: module.path,
      author: module.author,
      method: module.method
    });
  });
  res.json({ categories: Object.values(categories) });
});

// Servir index.html pour la route racine
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'web', 'portal.html'));
});

app.get('/docs', (req, res) => {
  res.sendFile(path.join(__dirname, 'web', 'docs.html'));
});

// Gestionnaire d'erreur 404
app.use((req, res) => {
  console.log(`404 Not Found: ${req.url}`);
  res.status(404).sendFile(path.join(__dirname, 'web', '404.html'));
});

// Gestionnaire d'erreur 500
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).sendFile(path.join(__dirname, 'web', '500.html'));
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(chalk.bgHex('#90EE90').hex('#333').bold(`Le serveur tourne sur le port ${PORT}`));
});

module.exports = app;
        const basePath = module.meta.path.split('?')[0];
        const routePath = '/api' + basePath; // Prepends /api, compatible with users.js path
        const method = (module.meta.method || 'get').toLowerCase(); // Handles 'post' from users.js
        app[method](routePath, (req, res) => {
          console.log(chalk.bgHex('#99FF99').hex('#333').bold(`Handling ${method.toUpperCase()} request for ${routePath}`));
          module.onStart({ req, res }); // Passes req and res to users.js onStart
        });
        apiModules.push({
          name: module.meta.name,
          description: module.meta.description,
          category: module.meta.category,
          path: routePath + (module.meta.path.includes('?') ? '?' + module.meta.path.split('?')[1] : ''),
          author: module.meta.author,
          method: module.meta.method || 'get'
        });
        totalRoutes++;
        console.log(chalk.bgHex('#FFFF99').hex('#333').bold(`Loaded Route: ${module.meta.name} (${method.toUpperCase()})`));
      } catch (error) {
        console.error(chalk.bgHex('#FF9999').hex('#333').bold(`Error loading module ${filePath}: ${error.message}`));
      }
    }
  });
};

loadModules(apiFolder);

console.log(chalk.bgHex('#90EE90').hex('#333').bold('Load Complete! ✓'));
console.log(chalk.bgHex('#90EE90').hex('#333').bold(`Total Routes Loaded: ${totalRoutes}`));

// Endpoint to expose API metadata
app.get('/api/info', (req, res) => {
  const categories = {};
  apiModules.forEach(module => {
    if (!categories[module.category]) {
      categories[module.category] = { name: module.category, items: [] };
    }
    categories[module.category].items.push({
      name: module.name,
      desc: module.description,
      path: module.path,
      author: module.author,
      method: module.method
    });
  });
  res.json({ categories: Object.values(categories) });
});

// Serve index.html for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'web', 'portal.html'));
});

app.get('/docs', (req, res) => {
  res.sendFile(path.join(__dirname, 'web', 'docs.html'));
});

// 404 error handler
app.use((req, res) => {
  console.log(`404 Not Found: ${req.url}`);
  res.status(404).sendFile(path.join(__dirname, 'web', '404.html'));
});

// 500 error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).sendFile(path.join(__dirname, 'web', '500.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(chalk.bgHex('#90EE90').hex('#333').bold(`Server is running on port ${PORT}`));
});

module.exports = app;
