/**
 * Module d'évaluation avancée des expressions nekoScript
 * Spécialisé pour les conditions en français et la syntaxe nekoScript
 */

"use strict";

/**
 * Evalue une expression de comparaison comme "message.contenu === '!ping'"
 * @param {string} expression - L'expression à évaluer
 * @param {Map} environment - L'environnement d'exécution avec les variables
 * @returns {boolean} - Le résultat de l'évaluation
 */
function evaluateComparisonExpression(expression, environment) {
  console.log(`[NekoScript] Évaluation de l'expression: "${expression}"`);
  
  // Rechercher des opérateurs spécifiques en français et en notation standard
  const operatorPattern = /(?:\s+|^)(est égal à|égal à|===|==|!==|!=|>=|<=|>|<|est différent de|différent de|contient|ne contient pas|commence par|ne commence pas par)(?:\s+|$)/;
  const match = expression.match(operatorPattern);
  
  // Cas des méthodes comme startsWith, includes, etc.
  if (!match && (
      expression.includes('.startsWith(') || 
      expression.includes('.endsWith(') || 
      expression.includes('.includes(') || 
      expression.includes('.match(')
    )) {
    return evaluateMethodCall(expression, environment);
  }
  
  // S'il n'y a pas d'opérateur, essayer d'évaluer comme une variable ou valeur simple
  if (!match) {
    // Vérifier si c'est une valeur booléenne littérale
    if (expression.trim() === 'true' || expression.trim() === 'vrai') return true;
    if (expression.trim() === 'false' || expression.trim() === 'faux') return false;
    
    // Vérifier si c'est une variable
    if (environment.has(expression.trim())) {
      const value = environment.get(expression.trim());
      return Boolean(value);
    }
    
    // Dernière tentative : évaluer comme expression JavaScript
    try {
      // Créer un environnement sécurisé pour l'évaluation
      const envVars = Object.create(null);
      for (const [key, value] of environment.entries()) {
        if (typeof key === 'string') {
          envVars[key] = value;
        }
      }
      
      // Fonction d'évaluation sécurisée
      const evalInContext = new Function('env', `with(env) { return Boolean(${expression}); }`);
      return evalInContext(envVars);
    } catch (error) {
      console.error(`[NekoScript] Erreur d'évaluation: ${error.message}`);
      return false;
    }
  }
  
  // Si nous avons trouvé un opérateur
  const operator = match[1];
  
  // Diviser l'expression en opérandes gauche et droite
  const parts = expression.split(operatorPattern);
  const leftOperand = parts[0].trim();
  const rightOperand = parts[parts.length - 1].trim();
  
  console.log(`[NekoScript] Comparaison: "${leftOperand}" ${operator} "${rightOperand}"`);
  
  // Évaluer les opérandes
  const leftValue = evaluateOperand(leftOperand, environment);
  const rightValue = evaluateOperand(rightOperand, environment);
  
  console.log(`[NekoScript] Valeurs évaluées: "${leftValue}" ${operator} "${rightValue}"`);
  
  // Évaluer la comparaison selon l'opérateur
  switch (operator) {
    case 'est égal à':
    case 'égal à':
    case '===':
    case '==':
      return leftValue === rightValue;
      
    case 'est différent de':
    case 'différent de':
    case '!==':
    case '!=':
      return leftValue !== rightValue;
      
    case '>=':
      return leftValue >= rightValue;
      
    case '<=':
      return leftValue <= rightValue;
      
    case '>':
      return leftValue > rightValue;
      
    case '<':
      return leftValue < rightValue;
      
    case 'contient':
      if (typeof leftValue === 'string' && typeof rightValue === 'string') {
        return leftValue.includes(rightValue);
      }
      return false;
      
    case 'ne contient pas':
      if (typeof leftValue === 'string' && typeof rightValue === 'string') {
        return !leftValue.includes(rightValue);
      }
      return true;
      
    case 'commence par':
      if (typeof leftValue === 'string' && typeof rightValue === 'string') {
        return leftValue.startsWith(rightValue);
      }
      return false;
      
    case 'ne commence pas par':
      if (typeof leftValue === 'string' && typeof rightValue === 'string') {
        return !leftValue.startsWith(rightValue);
      }
      return true;
      
    default:
      console.error(`[NekoScript] Opérateur non reconnu: ${operator}`);
      return false;
  }
}

/**
 * Évalue un opérande simple
 * @param {string} operand - L'opérande à évaluer
 * @param {Map} environment - L'environnement d'exécution avec les variables
 * @returns {any} - La valeur évaluée
 */
function evaluateOperand(operand, environment) {
  // Supprimer les guillemets si c'est une chaîne de caractères
  if ((operand.startsWith('"') && operand.endsWith('"')) || 
      (operand.startsWith("'") && operand.endsWith("'"))) {
    return operand.slice(1, -1);
  }
  
  // C'est un nombre
  if (!isNaN(Number(operand))) {
    return Number(operand);
  }
  
  // C'est une variable
  if (environment.has(operand)) {
    return environment.get(operand);
  }
  
  // C'est une propriété d'objet (comme message.contenu)
  if (operand.includes('.')) {
    const parts = operand.split('.');
    let value = environment.get(parts[0]);
    
    if (!value) {
      console.log(`[NekoScript] Variable non trouvée: ${parts[0]}`);
      return operand;
    }
    
    // Naviguer dans l'objet
    for (let i = 1; i < parts.length; i++) {
      if (value === undefined || value === null) {
        console.log(`[NekoScript] Propriété ${parts.slice(0, i).join('.')} est undefined ou null`);
        return undefined;
      }
      
      value = value[parts[i]];
    }
    
    return value;
  }
  
  // Par défaut, retourner l'opérande tel quel
  return operand;
}

/**
 * Évalue un appel de méthode comme message.contenu.startsWith("!")
 * @param {string} expression - L'expression à évaluer
 * @param {Map} environment - L'environnement d'exécution avec les variables
 * @returns {boolean} - Le résultat de l'évaluation
 */
function evaluateMethodCall(expression, environment) {
  console.log(`[NekoScript] Évaluation de l'appel de méthode: ${expression}`);
  
  try {
    // Extraire le nom de l'objet (avant le premier point)
    const dotIndex = expression.indexOf('.');
    if (dotIndex === -1) return false;
    
    const objectName = expression.substring(0, dotIndex);
    const obj = environment.get(objectName);
    
    if (!obj) {
      console.error(`[NekoScript] Objet non trouvé: ${objectName}`);
      return false;
    }
    
    // Créer un environnement sécurisé pour l'évaluation
    const envVars = { [objectName]: obj };
    
    // Fonction d'évaluation sécurisée
    const evalInContext = new Function(
      Object.keys(envVars).join(','),
      `try { return Boolean(${expression}); } catch(e) { console.error(e); return false; }`
    );
    
    return evalInContext.apply(null, Object.values(envVars));
  } catch (error) {
    console.error(`[NekoScript] Erreur d'évaluation de méthode: ${error.message}`);
    return false;
  }
}

/**
 * Gère l'extraction des arguments depuis une chaîne de texte
 * @param {string} prefix - Le préfixe de commande à retirer
 * @param {string} messageContent - Le contenu du message
 * @returns {object|null} - Un objet avec le nom de la commande et les arguments, ou null
 */
function parseCommand(prefix, messageContent) {
  if (!messageContent || !messageContent.startsWith(prefix)) {
    return null;
  }
  
  try {
    // Retirer le préfixe
    const content = messageContent.slice(prefix.length).trim();
    
    // Séparer la commande et les arguments
    const parts = content.split(/\s+/);
    const commandName = parts.shift().toLowerCase();
    const args = parts;
    
    return { commandName, args };
  } catch (error) {
    console.error(`[NekoScript] Erreur de parsing de commande: ${error.message}`);
    return null;
  }
}

// Exporter les fonctions
module.exports = {
  evaluateComparisonExpression,
  evaluateOperand,
  evaluateMethodCall,
  parseCommand
};