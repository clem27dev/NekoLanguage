/**
 * nekoScript - Un langage de programmation en français pour les développeurs
 * 
 * Ce fichier est le point d'entrée principal du package nekoScript.
 * Il exporte toutes les fonctionnalités du langage pour permettre
 * l'importation dans d'autres projets JavaScript.
 */

"use strict";

const { NekoParser } = require('./parser');
const { NekoInterpreter } = require('./interpreter');
const { NekoCommand } = require('./cli/command');

// Créer des instances par défaut pour faciliter l'utilisation
const parser = new NekoParser();
const interpreter = new NekoInterpreter();

/**
 * Fonction utilitaire pour exécuter du code nekoScript directement
 * @param {string} code Code nekoScript à exécuter
 * @returns {Promise<string>} Résultat de l'exécution
 */
function executeNekoScript(code) {
  const ast = parser.parse(code);
  return interpreter.execute(JSON.stringify(ast));
}

/**
 * Fonction pour analyser du code nekoScript sans l'exécuter
 * @param {string} code Code nekoScript à analyser
 * @returns {Object} AST (Abstract Syntax Tree) du code
 */
function parseNekoScript(code) {
  return parser.parse(code);
}

// Exporter un objet avec les fonctions utilitaires
const nekoScript = {
  parse: parseNekoScript,
  execute: executeNekoScript,
  parser,
  interpreter,
  NekoParser,
  NekoInterpreter,
  NekoCommand
};

// Exporter l'objet nekoScript
module.exports = nekoScript;