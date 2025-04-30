/**
 * Module Base.neko
 * Ce module fournit les fonctionnalités de base pour nekoScript
 */

"use strict";

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { promisify } = require('util');
const child_process = require('child_process');

/**
 * Crée un module Base pour nekoScript
 * @returns {Map} Module exposant les fonctionnalités de base
 */
function createBaseModule() {
  const baseModule = new Map();
  
  // Fonction pour afficher un message
  baseModule.set('nekAfficher', (message) => {
    console.log(message);
    return message;
  });
  
  // Fonction pour lire une entrée utilisateur
  baseModule.set('nekLire', async (message) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const question = promisify(rl.question).bind(rl);
    
    try {
      return await question(`${message} `);
    } finally {
      rl.close();
    }
  });
  
  // Fonction pour attendre un certain temps
  baseModule.set('nekDormir', (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  });
  
  // Fonction pour lire un fichier
  baseModule.set('nekLireFichier', async (chemin) => {
    try {
      return fs.readFileSync(path.resolve(chemin), 'utf-8');
    } catch (error) {
      throw new Error(`Erreur lors de la lecture du fichier: ${error.message}`);
    }
  });
  
  // Fonction pour écrire dans un fichier
  baseModule.set('nekÉcrireFichier', (chemin, contenu) => {
    try {
      fs.writeFileSync(path.resolve(chemin), contenu);
      return true;
    } catch (error) {
      throw new Error(`Erreur lors de l'écriture dans le fichier: ${error.message}`);
    }
  });
  
  // Fonction pour vérifier si un fichier existe
  baseModule.set('nekFichierExiste', (chemin) => {
    return fs.existsSync(path.resolve(chemin));
  });
  
  // Fonction pour exécuter une commande système
  baseModule.set('nekExécuter', (commande) => {
    try {
      return child_process.execSync(commande, { encoding: 'utf-8' });
    } catch (error) {
      throw new Error(`Erreur lors de l'exécution de la commande: ${error.message}`);
    }
  });
  
  // Fonction pour obtenir l'heure actuelle
  baseModule.set('nekHeure', () => {
    return new Date().toLocaleTimeString();
  });
  
  // Fonction pour obtenir la date actuelle
  baseModule.set('nekDate', () => {
    return new Date().toLocaleDateString();
  });
  
  // Fonction pour formater une date
  baseModule.set('nekFormaterDate', (date, format = 'fr-FR') => {
    return new Date(date).toLocaleDateString(format);
  });
  
  // Fonction pour générer un nombre aléatoire
  baseModule.set('nekAléatoire', (min = 0, max = 1) => {
    return Math.random() * (max - min) + min;
  });
  
  // Fonction pour générer un entier aléatoire
  baseModule.set('nekEntierAléatoire', (min = 0, max = 100) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  });
  
  // Fonction pour arrondir un nombre
  baseModule.set('nekArrondir', (nombre, décimales = 0) => {
    const facteur = Math.pow(10, décimales);
    return Math.round(nombre * facteur) / facteur;
  });
  
  // Fonction pour obtenir les variables d'environnement
  baseModule.set('nekEnvironnement', (nom) => {
    return nom ? process.env[nom] : process.env;
  });
  
  // Fonction pour manipuler des tableaux
  baseModule.set('nekTableau', {
    créer: (...éléments) => [...éléments],
    ajouter: (tableau, élément) => { tableau.push(élément); return tableau; },
    supprimer: (tableau, index) => { tableau.splice(index, 1); return tableau; },
    obtenir: (tableau, index) => tableau[index],
    définir: (tableau, index, valeur) => { tableau[index] = valeur; return tableau; },
    longueur: (tableau) => tableau.length,
    trier: (tableau) => [...tableau].sort(),
    filtrer: (tableau, condition) => tableau.filter(condition),
    carte: (tableau, transformation) => tableau.map(transformation),
    joindre: (tableau, séparateur = ',') => tableau.join(séparateur)
  });
  
  // Fonction pour manipuler des chaînes de caractères
  baseModule.set('nekTexte', {
    longueur: (texte) => texte.length,
    majuscule: (texte) => texte.toUpperCase(),
    minuscule: (texte) => texte.toLowerCase(),
    découper: (texte, séparateur = '') => texte.split(séparateur),
    remplacer: (texte, recherche, remplacement) => texte.replace(recherche, remplacement),
    sousTexte: (texte, début, fin) => texte.substring(début, fin),
    estVide: (texte) => !texte || texte.trim().length === 0
  });
  
  // Fonction pour manipuler des objets
  baseModule.set('nekObjet', {
    créer: (props = {}) => ({ ...props }),
    clés: (objet) => Object.keys(objet),
    valeurs: (objet) => Object.values(objet),
    entrées: (objet) => Object.entries(objet),
    assigner: (cible, ...sources) => Object.assign(cible, ...sources),
    obtenir: (objet, clé) => objet[clé],
    définir: (objet, clé, valeur) => { objet[clé] = valeur; return objet; }
  });
  
  // Fonction pour la gestion des erreurs
  baseModule.set('nekErreur', (message) => {
    throw new Error(message);
  });
  
  // Fonction pour vérifier une condition
  baseModule.set('nekAssertionVraie', (condition, messageErreur) => {
    if (!condition) {
      throw new Error(messageErreur || 'Assertion échouée');
    }
    return true;
  });
  
  return baseModule;
}

module.exports = { createBaseModule };