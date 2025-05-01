/**
 * nekoScript - Un langage de programmation en français pour les développeurs
 * 
 * Ce fichier est le point d'entrée principal du package nekoScript.
 * Il exporte toutes les fonctionnalités du langage pour permettre
 * l'importation dans d'autres projets JavaScript.
 * 
 * NekoScript permet de créer facilement:
 * - Des sites web en français
 * - Des bots Discord
 * - Des jeux simples
 * - Et plus encore!
 */

"use strict";

const { NekoParser, nekoParser } = require('./parser');
const { NekoInterpreter, nekoInterpreter } = require('./interpreter');
const { NekoCommand } = require('./cli/command');
const ExpressionEvaluator = require('./expression-evaluator');

/**
 * Fonction utilitaire pour exécuter du code nekoScript directement
 * @param {string} code Code nekoScript à exécuter
 * @param {Object} options Options d'exécution (verbose, debugInfo, etc.)
 * @returns {Promise<string>} Résultat de l'exécution
 */
function executeNekoScript(code, options = {}) {
  return nekoInterpreter.execute(code, options);
}

/**
 * Fonction pour analyser du code nekoScript sans l'exécuter
 * @param {string} code Code nekoScript à analyser
 * @returns {Object} AST (Abstract Syntax Tree) du code
 */
function parseNekoScript(code) {
  return nekoParser.parse(code);
}

/**
 * Fonction pour publier un package dans le registre nekoScript
 * @param {string} code Code source du package
 * @param {string} name Nom du package
 * @param {boolean} isJavaScript Si true, le code est traité comme du JavaScript
 * @returns {Promise<string>} Message de confirmation
 */
async function publishNekoPackage(code, name, isJavaScript = false) {
  return await nekoInterpreter.publishPackage(code, name, isJavaScript);
}

/**
 * Fonction pour télécharger un package du registre nekoScript
 * @param {string} name Nom du package à télécharger
 * @returns {Promise<string>} Message de confirmation
 */
async function downloadNekoPackage(name) {
  return await nekoInterpreter.downloadPackage(name);
}

/**
 * Fonction pour lister les packages disponibles
 * @returns {string} Liste formatée des packages disponibles
 */
function listNekoPackages() {
  return nekoInterpreter.listPackages();
}

/**
 * Fonction pour évaluer une expression nekoScript
 * @param {string} expression Expression à évaluer
 * @param {Map} environment Environnement d'exécution
 * @returns {any} Résultat de l'évaluation
 */
function evaluateExpression(expression, environment = new Map()) {
  return ExpressionEvaluator.evaluateComparisonExpression(expression, environment);
}

// Exporter un objet avec les fonctions utilitaires
const nekoScript = {
  // Fonctions principales
  parse: parseNekoScript,
  execute: executeNekoScript,
  
  // Gestion des packages
  publishPackage: publishNekoPackage,
  downloadPackage: downloadNekoPackage,
  listPackages: listNekoPackages,
  
  // Évaluation d'expressions
  evaluateExpression,
  
  // Instances par défaut
  parser: nekoParser,
  interpreter: nekoInterpreter,
  ExpressionEvaluator,
  
  // Classes pour extension
  NekoParser,
  NekoInterpreter,
  NekoCommand,
  
  // Version
  VERSION: "1.1.0"
};

// Exporter l'objet nekoScript
module.exports = nekoScript;