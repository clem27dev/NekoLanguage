/**
 * Module Base.neko
 * Ce module fournit les fonctionnalités de base pour nekoScript
 */

"use strict";

/**
 * Crée le module Base pour nekoScript avec les fonctions essentielles
 * @returns {Map} Module exposant les fonctionnalités de base
 */
function createBaseModule() {
  const baseModule = new Map();
  
  // Fonction d'affichage de texte
  baseModule.set('nekAfficher', (message) => {
    console.log(message);
    return message;
  });
  
  // Fonction de lecture (simulation)
  baseModule.set('nekLire', (prompt) => {
    console.log(`[NekoScript] Lecture avec prompt: ${prompt}`);
    return prompt; // Dans un environnement réel, cela lirait l'entrée utilisateur
  });
  
  // Attendre un délai
  baseModule.set('nekDormir', (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  });
  
  // Fonctions mathématiques de base
  baseModule.set('nekAddition', (a, b) => a + b);
  baseModule.set('nekSoustraction', (a, b) => a - b);
  baseModule.set('nekMultiplication', (a, b) => a * b);
  baseModule.set('nekDivision', (a, b) => {
    if (b === 0) throw new Error("Division par zéro");
    return a / b;
  });
  
  // Fonctions de conversion
  baseModule.set('nekVersTexte', (valeur) => String(valeur));
  baseModule.set('nekVersNombre', (valeur) => {
    const nombre = Number(valeur);
    if (isNaN(nombre)) throw new Error(`"${valeur}" n'est pas un nombre valide`);
    return nombre;
  });
  baseModule.set('nekVersBooleen', (valeur) => Boolean(valeur));
  
  // Fonctions de manipulation de tableaux
  baseModule.set('nekCreerTableau', (...elements) => elements);
  baseModule.set('nekAjouterElement', (tableau, element) => {
    if (!Array.isArray(tableau)) throw new Error("L'objet n'est pas un tableau");
    tableau.push(element);
    return tableau;
  });
  baseModule.set('nekObtenirElement', (tableau, index) => {
    if (!Array.isArray(tableau)) throw new Error("L'objet n'est pas un tableau");
    if (index < 0 || index >= tableau.length) throw new Error("Index hors limites");
    return tableau[index];
  });
  
  // Fonctions de manipulation de chaînes
  baseModule.set('nekLongueur', (chaine) => String(chaine).length);
  baseModule.set('nekConcatener', (...chaines) => chaines.join(''));
  baseModule.set('nekSousChaîne', (chaine, debut, fin) => String(chaine).substring(debut, fin));
  
  // Conditions et opérateurs pour les cas où l'évaluateur d'expressions ne fonctionne pas
  baseModule.set('si', (condition, siVrai, siFaux) => condition ? siVrai() : (siFaux ? siFaux() : null));
  baseModule.set('égal', (a, b) => a === b);
  baseModule.set('différent', (a, b) => a !== b);
  baseModule.set('plus_grand', (a, b) => a > b);
  baseModule.set('plus_petit', (a, b) => a < b);
  baseModule.set('contient', (chaine, sousChaine) => String(chaine).includes(String(sousChaine)));
  baseModule.set('commence_par', (chaine, prefixe) => String(chaine).startsWith(String(prefixe)));
  
  // Utilitaires
  baseModule.set('nekDate', () => new Date().toLocaleString());
  baseModule.set('nekTimestamp', () => Date.now());
  baseModule.set('nekAleatoire', (min = 0, max = 1) => Math.random() * (max - min) + min);
  baseModule.set('nekAleatoireEntier', (min, max) => Math.floor(Math.random() * (max - min + 1)) + min);
  
  return baseModule;
}

module.exports = { createBaseModule };