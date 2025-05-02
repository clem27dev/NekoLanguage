/**
 * NekoRunner - Exécuteur de scripts nekoScript en mode réel
 * Ce module permet d'exécuter des scripts nekoScript comme des applications réelles
 * en gardant l'exécution en vie (au lieu de terminer immédiatement)
 */

"use strict";

const fs = require('fs');
const path = require('path');
const { nekoInterpreter } = require('../interpreter');
const chalk = require('chalk');

class NekoRunner {
  constructor() {
    this.runningProcesses = new Map();
    this.nextProcessId = 1;
  }

  /**
   * Exécute un script nekoScript en mode persistant
   * @param {string} filePath Chemin vers le fichier à exécuter
   * @param {Object} options Options d'exécution
   * @returns {number} ID du processus lancé
   */
  async runScript(filePath, options = {}) {
    try {
      // Vérifier que le fichier existe
      if (!fs.existsSync(filePath)) {
        throw new Error(`Le fichier ${filePath} n'existe pas.`);
      }

      // Lire le contenu du fichier
      const code = fs.readFileSync(filePath, 'utf-8');
      
      // Déterminer le type d'application
      const appType = this.detectApplicationType(code);
      
      console.log(chalk.cyan(`🐱 NekoScript - Démarrage d'une application de type: ${appType}`));
      
      // Préparer les options spécifiques au type d'application
      const runOptions = {
        ...options,
        realExecution: true,
        verbose: true,
        workingDir: path.dirname(path.resolve(filePath))
      };
      
      // Créer un objet contenant les informations du processus
      const processId = this.nextProcessId++;
      const processInfo = {
        id: processId,
        type: appType,
        filePath,
        startTime: new Date(),
        stopPromise: null,
        stopResolver: null
      };
      
      // Exécuter le code avec l'interpréteur
      console.log(chalk.cyan(`🐱 Démarrage du processus ${processId}...`));
      
      // Créer une promesse qui sera résolue lorsque le processus se terminera
      processInfo.stopPromise = new Promise(resolve => {
        processInfo.stopResolver = resolve;
      });
      
      // Stocker les informations du processus
      this.runningProcesses.set(processId, processInfo);
      
      // Exécuter l'application
      try {
        const result = await nekoInterpreter.execute(code, runOptions);
        console.log(chalk.green(`✅ Application démarrée avec succès:`));
        console.log(chalk.yellow(`   Type: ${appType}`));
        console.log(chalk.yellow(`   Fichier: ${filePath}`));
        console.log(chalk.yellow(`   ID de processus: ${processId}`));
        
        if (appType === 'bot-discord') {
          console.log(chalk.green(`🤖 Bot Discord en cours d'exécution... (Ctrl+C pour arrêter)`));
        } else if (appType === 'web-app') {
          console.log(chalk.green(`🌐 Application Web en cours d'exécution... (Ctrl+C pour arrêter)`));
        } else if (appType === 'game') {
          console.log(chalk.green(`🎮 Jeu en cours d'exécution... (Ctrl+C pour arrêter)`));
        }
        
        // Garder le processus en vie jusqu'à ce que stopPromise soit résolue
        await processInfo.stopPromise;
        console.log(chalk.yellow(`Application arrêtée: ${processId}`));
      } catch (error) {
        console.error(chalk.red(`❌ Erreur lors de l'exécution de l'application:`));
        console.error(chalk.red(error.message));
        this.stopProcess(processId);
      }
      
      return processId;
    } catch (error) {
      console.error(chalk.red(`❌ Erreur lors du démarrage de l'application:`));
      console.error(chalk.red(error.message));
      return -1;
    }
  }
  
  /**
   * Détecte le type d'application en analysant le code
   * @param {string} code Code source nekoScript
   * @returns {string} Type d'application ('bot-discord', 'web-app', 'game' ou 'unknown')
   */
  detectApplicationType(code) {
    // Chercher des indices dans le code pour déterminer le type d'application
    if (code.includes('nekImporter Discord') || code.includes('Discord.Bot')) {
      return 'bot-discord';
    } else if (code.includes('nekImporter Web') || code.includes('Web.Express')) {
      return 'web-app';
    } else if (code.includes('nekImporter NekoJeu') || code.includes('NekoJeu.Canvas')) {
      return 'game';
    } else {
      return 'unknown';
    }
  }
  
  /**
   * Arrête un processus en cours d'exécution
   * @param {number} processId ID du processus à arrêter
   * @returns {boolean} true si le processus a été arrêté, false sinon
   */
  stopProcess(processId) {
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
  listProcesses() {
    return Array.from(this.runningProcesses.values()).map(process => ({
      id: process.id,
      type: process.type,
      filePath: process.filePath,
      uptime: Math.floor((new Date() - process.startTime) / 1000) // en secondes
    }));
  }
}

// Exporter une instance unique
const nekoRunner = new NekoRunner();
module.exports = { NekoRunner, nekoRunner };