/**
 * nekoScript - Un langage de programmation en français pour les développeurs
 * 
 * Ce fichier est le point d'entrée principal du package nekoScript.
 * Il exporte toutes les fonctionnalités du langage pour permettre
 * l'importation dans d'autres projets JavaScript/TypeScript.
 */

import { NekoParser } from './parser';
import { NekoInterpreter } from './interpreter';
import { NekoCommand } from './cli/command';

// Exporter les classes principales
export { NekoParser } from './parser';
export { NekoInterpreter } from './interpreter';
export { NekoCommand } from './cli/command';

// Exporter des types pour la documentation TypeScript
export interface NekoToken {
  type: string;
  value: string;
}

export interface NekoAST {
  type: string;
  [key: string]: any;
}

// Créer des instances par défaut pour faciliter l'utilisation
const parser = new NekoParser();
const interpreter = new NekoInterpreter();

/**
 * Fonction utilitaire pour exécuter du code nekoScript directement
 * @param code Code nekoScript à exécuter
 * @returns Résultat de l'exécution
 */
export function executeNekoScript(code: string): Promise<string> {
  const ast = parser.parse(code);
  return interpreter.execute(JSON.stringify(ast));
}

/**
 * Fonction pour analyser du code nekoScript sans l'exécuter
 * @param code Code nekoScript à analyser
 * @returns AST (Abstract Syntax Tree) du code
 */
export function parseNekoScript(code: string): NekoAST {
  return parser.parse(code);
}

// Exporter un objet avec les fonctions utilitaires
export const nekoScript = {
  parse: parseNekoScript,
  execute: executeNekoScript,
  parser,
  interpreter
};

// Exporter l'objet nekoScript comme export par défaut
export default nekoScript;