/**
 * NekoExecutor - Module d'exécution réelle de code nekoScript
 * Ce module permet d'exécuter réellement du code nekoScript, en particulier pour:
 * - Les bots Discord
 * - Les applications web Express
 * - Les jeux avec Canvas
 */

const fs = require('fs');
const path = require('path');
const { NekoInterpreter } = require('../interpreter');
const chalk = require('chalk');
const dotenv = require('dotenv');

// Charger les variables d'environnement si disponibles
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  dotenv.config();
}

class NekoExecutor {
  constructor() {
    this.interpreter = new NekoInterpreter();
    this.runningProcesses = new Map();
    this.nextProcessId = 1;
  }
  
  /**
   * Détecte le type d'application en analysant le code
   * @param {string} code Code source nekoScript
   * @returns {string} Type d'application ('bot-discord', 'web-app', 'game' ou 'script')
   */
  detectApplicationType(code) {
    if (code.includes('nekImporter Discord') || code.includes('Discord.Bot')) {
      return 'bot-discord';
    } else if (code.includes('nekImporter Web') || code.includes('Web.Express')) {
      return 'web-app';
    } else if (code.includes('nekImporter NekoJeu') || code.includes('NekoJeu.Canvas')) {
      return 'game';
    } else {
      return 'script';
    }
  }
  
  /**
   * Vérifie les dépendances requises pour le type d'application
   * @param {string} appType Type d'application
   * @returns {Object} Résultat de la vérification avec les dépendances manquantes
   */
  checkDependencies(appType) {
    const missingDependencies = [];
    
    try {
      if (appType === 'bot-discord') {
        try {
          require.resolve('discord.js');
        } catch (e) {
          missingDependencies.push('discord.js');
        }
      } else if (appType === 'web-app') {
        try {
          require.resolve('express');
        } catch (e) {
          missingDependencies.push('express');
        }
      } else if (appType === 'game') {
        try {
          require.resolve('canvas');
        } catch (e) {
          missingDependencies.push('canvas');
        }
      }
      
      return {
        missingDependencies,
        hasMissing: missingDependencies.length > 0
      };
    } catch (error) {
      console.error("Erreur lors de la vérification des dépendances:", error);
      return {
        missingDependencies: [],
        hasMissing: false
      };
    }
  }
  
  /**
   * Exécute un script nekoScript
   * @param {string} code Code source à exécuter
   * @param {Object} options Options d'exécution
   * @returns {Promise<string>} Résultat de l'exécution
   */
  async executeScript(code, options = {}) {
    try {
      const appType = this.detectApplicationType(code);
      
      // Vérifier les dépendances
      const dependencyCheck = this.checkDependencies(appType);
      
      if (dependencyCheck.hasMissing) {
        return {
          success: false,
          output: chalk.red(`⚠️ Dépendances manquantes pour exécuter ce type de script (${appType}):\n`) +
                  chalk.yellow(`Pour installer les dépendances manquantes, exécutez:\n`) +
                  dependencyCheck.missingDependencies.map(dep => 
                    chalk.cyan(`npm install ${dep}`)
                  ).join('\n')
        };
      }
      
      // Configurer les options d'exécution
      const execOptions = {
        ...options,
        verbose: true,
        realExecution: true,
        appType
      };
      
      // Exécuter le code avec l'interpréteur
      const result = await this.interpreter.execute(code, execOptions);
      
      // Formater le résultat
      return {
        success: true,
        output: chalk.green(`✅ Script exécuté avec succès!\n`) +
                chalk.yellow(`Type d'application: ${appType}\n`) +
                chalk.cyan(`Résultat: ${result || 'Aucun retour explicite'}`),
        result
      };
    } catch (error) {
      return {
        success: false,
        output: chalk.red(`❌ Erreur lors de l'exécution du script:\n${error.message || error}`)
      };
    }
  }
  
  /**
   * Démarre une application nekoScript en mode persistant
   * @param {string} code Code source
   * @param {Object} options Options de démarrage
   * @returns {Promise<Object>} Informations sur le processus démarré
   */
  async startApplication(code, options = {}) {
    try {
      const appType = this.detectApplicationType(code);
      
      // Vérifier les dépendances
      const dependencyCheck = this.checkDependencies(appType);
      
      if (dependencyCheck.hasMissing) {
        return {
          success: false,
          output: chalk.red(`⚠️ Dépendances manquantes pour exécuter ce type d'application (${appType}):\n`) +
                  chalk.yellow(`Pour installer les dépendances manquantes, exécutez:\n`) +
                  dependencyCheck.missingDependencies.map(dep => 
                    chalk.cyan(`npm install ${dep}`)
                  ).join('\n')
        };
      }
      
      // Créer un ID de processus unique
      const processId = this.nextProcessId++;
      
      // Extraire le nom du module
      const moduleMatch = code.match(/nekModule\s+(\w+)/);
      const moduleName = moduleMatch ? moduleMatch[1] : `App-${processId}`;
      
      // Créer les informations du processus
      const processInfo = {
        id: processId,
        type: appType,
        name: moduleName,
        startTime: new Date(),
        stopPromise: null,
        stopResolver: null
      };
      
      // Créer une promesse qui sera résolue lorsque le processus se terminera
      processInfo.stopPromise = new Promise(resolve => {
        processInfo.stopResolver = resolve;
      });
      
      // Stocker les informations du processus
      this.runningProcesses.set(processId, processInfo);
      
      // Configurer les options d'exécution
      const execOptions = {
        ...options,
        verbose: true,
        realExecution: true,
        appType,
        processId,
        persistent: true
      };
      
      // Exécuter le code avec l'interpréteur en mode persistant
      this.interpreter.execute(code, execOptions)
        .then(result => {
          console.log(chalk.green(`✅ Application ${moduleName} (ID: ${processId}) exécutée avec succès!`));
          console.log(chalk.yellow(`Type: ${appType}`));
          console.log(chalk.cyan(`Statut: En cours d'exécution`));
        })
        .catch(error => {
          console.error(chalk.red(`❌ Erreur lors de l'exécution de l'application ${moduleName} (ID: ${processId}):`));
          console.error(chalk.red(error.message || error));
          this.stopApplication(processId);
        });
      
      // En fonction du type d'application, ajouter des messages spécifiques
      let specificMessage = '';
      
      if (appType === 'bot-discord') {
        specificMessage = chalk.cyan(`🤖 Bot Discord en cours d'exécution... (ID: ${processId})\n`) +
                         chalk.yellow(`Pour arrêter le bot: neko-script arrêter ${processId}`);
      } else if (appType === 'web-app') {
        specificMessage = chalk.cyan(`🌐 Application Web en cours d'exécution... (ID: ${processId})\n`) +
                         chalk.yellow(`Pour arrêter le serveur: neko-script arrêter ${processId}`);
      } else if (appType === 'game') {
        specificMessage = chalk.cyan(`🎮 Jeu en cours d'exécution... (ID: ${processId})\n`) +
                         chalk.yellow(`Pour arrêter le jeu: neko-script arrêter ${processId}`);
      }
      
      return {
        success: true,
        processId,
        appType,
        moduleName,
        output: chalk.green(`✅ Application ${moduleName} démarrée avec succès!\n`) +
                specificMessage
      };
    } catch (error) {
      return {
        success: false,
        output: chalk.red(`❌ Erreur lors du démarrage de l'application:\n${error.message || error}`)
      };
    }
  }
  
  /**
   * Arrête une application en cours d'exécution
   * @param {number} processId ID du processus à arrêter
   * @returns {boolean} true si le processus a été arrêté, false sinon
   */
  stopApplication(processId) {
    if (this.runningProcesses.has(processId)) {
      const processInfo = this.runningProcesses.get(processId);
      
      // Résoudre la promesse de fin pour permettre à l'application de se terminer
      if (processInfo.stopResolver) {
        processInfo.stopResolver();
      }
      
      this.runningProcesses.delete(processId);
      return true;
    }
    
    return false;
  }
  
  /**
   * Liste tous les processus en cours d'exécution
   * @returns {Array} Liste des processus
   */
  listRunningApplications() {
    return Array.from(this.runningProcesses.values()).map(process => ({
      id: process.id,
      type: process.type,
      name: process.name,
      uptime: Math.floor((new Date() - process.startTime) / 1000) // en secondes
    }));
  }
}

// Créer une instance unique
const nekoExecutor = new NekoExecutor();

// Exporter la classe et l'instance
module.exports = { NekoExecutor, nekoExecutor };