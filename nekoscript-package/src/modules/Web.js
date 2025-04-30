/**
 * Module Web.neko
 * Ce module permet de créer des applications web avec Express en nekoScript
 */

"use strict";

const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

/**
 * Crée un module Web pour nekoScript
 * @returns {Map} Module exposant les fonctionnalités Web
 */
function createWebModule() {
  const webModule = new Map();
  
  // Fonction pour créer un serveur web
  webModule.set('créerServeur', (port = 3000) => {
    const app = express();
    
    // Middleware pour parser le JSON et les données de formulaire
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    // Démarrer le serveur
    const server = app.listen(port, () => {
      console.log(`🐱 Serveur nekoScript démarré sur le port ${port}`);
    });
    
    return { app, server };
  });
  
  // Fonction pour définir une route
  webModule.set('créerRoute', (app, méthode, chemin, callback) => {
    const méthodesHTTP = {
      'get': app.get.bind(app),
      'post': app.post.bind(app),
      'put': app.put.bind(app),
      'delete': app.delete.bind(app)
    };
    
    if (!méthodesHTTP[méthode.toLowerCase()]) {
      throw new Error(`Méthode HTTP non supportée: ${méthode}`);
    }
    
    méthodesHTTP[méthode.toLowerCase()](chemin, (req, res) => {
      // Convertir la requête au format nekoScript
      const requête = {
        corps: req.body,
        paramètres: req.params,
        query: req.query,
        headers: req.headers,
        cookies: req.cookies
      };
      
      // Convertir la réponse au format nekoScript
      const réponse = {
        envoyer: (data) => res.send(data),
        envoyerJSON: (data) => res.json(data),
        envoyerHTML: (html) => res.send(html),
        envoyerFichier: (fichier) => res.sendFile(path.resolve(fichier)),
        statut: (code) => res.status(code),
        rediriger: (url) => res.redirect(url)
      };
      
      // Appeler le callback utilisateur
      callback(requête, réponse);
    });
  });
  
  // Fonction pour servir des fichiers statiques
  webModule.set('servirStatiques', (app, dossier) => {
    app.use(express.static(path.resolve(dossier)));
  });
  
  // Fonction pour faire une requête HTTP
  webModule.set('requête', async (url, méthode = 'get', données = null, entêtes = {}) => {
    try {
      const config = {
        method: méthode.toLowerCase(),
        url,
        headers: entêtes
      };
      
      if (données && (méthode.toLowerCase() === 'post' || méthode.toLowerCase() === 'put')) {
        config.data = données;
      }
      
      const response = await axios(config);
      
      return {
        données: response.data,
        statut: response.status,
        entêtes: response.headers
      };
    } catch (error) {
      throw new Error(`Erreur lors de la requête HTTP: ${error.message}`);
    }
  });
  
  // Fonction pour créer une page HTML
  webModule.set('créerPage', (titre, contenu) => {
    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titre}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .neko-container {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .neko-header {
      background-color: #8c52ff;
      color: white;
      padding: 10px 20px;
      border-radius: 6px;
      margin-bottom: 20px;
    }
    .neko-footer {
      text-align: center;
      margin-top: 40px;
      color: #666;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <div class="neko-header">
    <h1>🐱 ${titre}</h1>
  </div>
  <div class="neko-container">
    ${contenu}
  </div>
  <div class="neko-footer">
    <p>Créé avec nekoScript</p>
  </div>
</body>
</html>`;
  });
  
  // Fonction pour ajouter un middleware
  webModule.set('ajouterMiddleware', (app, callback) => {
    app.use((req, res, next) => {
      // Convertir la requête au format nekoScript
      const requête = {
        corps: req.body,
        paramètres: req.params,
        query: req.query,
        headers: req.headers,
        cookies: req.cookies,
        chemin: req.path,
        méthode: req.method
      };
      
      // Convertir la réponse au format nekoScript
      const réponse = {
        envoyer: (data) => res.send(data),
        envoyerJSON: (data) => res.json(data),
        envoyerHTML: (html) => res.send(html),
        statut: (code) => res.status(code),
        rediriger: (url) => res.redirect(url)
      };
      
      // Appeler le callback utilisateur
      callback(requête, réponse, next);
    });
  });
  
  // Fonction pour créer une API REST
  webModule.set('créerAPI', (app, préfixe, ressources) => {
    // Vérifier si app est valide
    if (!app || !app.get || !app.post) {
      throw new Error('Application Express invalide');
    }
    
    // Préfixe par défaut
    const basePath = préfixe || '/api';
    
    // Pour chaque ressource
    Object.keys(ressources).forEach(ressource => {
      const handlers = ressources[ressource];
      const routePath = `${basePath}/${ressource}`;
      
      // Route GET - Liste
      if (handlers.lister) {
        app.get(routePath, (req, res) => {
          try {
            const résultat = handlers.lister(req.query);
            res.json(résultat);
          } catch (error) {
            res.status(500).json({ erreur: error.message });
          }
        });
      }
      
      // Route GET - Détail
      if (handlers.obtenir) {
        app.get(`${routePath}/:id`, (req, res) => {
          try {
            const résultat = handlers.obtenir(req.params.id);
            if (!résultat) {
              return res.status(404).json({ erreur: 'Ressource non trouvée' });
            }
            res.json(résultat);
          } catch (error) {
            res.status(500).json({ erreur: error.message });
          }
        });
      }
      
      // Route POST - Création
      if (handlers.créer) {
        app.post(routePath, (req, res) => {
          try {
            const résultat = handlers.créer(req.body);
            res.status(201).json(résultat);
          } catch (error) {
            res.status(400).json({ erreur: error.message });
          }
        });
      }
      
      // Route PUT - Mise à jour
      if (handlers.modifier) {
        app.put(`${routePath}/:id`, (req, res) => {
          try {
            const résultat = handlers.modifier(req.params.id, req.body);
            if (!résultat) {
              return res.status(404).json({ erreur: 'Ressource non trouvée' });
            }
            res.json(résultat);
          } catch (error) {
            res.status(400).json({ erreur: error.message });
          }
        });
      }
      
      // Route DELETE - Suppression
      if (handlers.supprimer) {
        app.delete(`${routePath}/:id`, (req, res) => {
          try {
            const résultat = handlers.supprimer(req.params.id);
            if (!résultat) {
              return res.status(404).json({ erreur: 'Ressource non trouvée' });
            }
            res.status(204).send();
          } catch (error) {
            res.status(400).json({ erreur: error.message });
          }
        });
      }
    });
  });
  
  return webModule;
}

module.exports = { createWebModule };