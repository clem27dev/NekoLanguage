/**
 * Module Math.neko
 * Ce module fournit des fonctions mathématiques avancées pour nekoScript
 */

"use strict";

/**
 * Crée le module Math pour nekoScript avec des fonctions mathématiques
 * @returns {Map} Module exposant les fonctionnalités mathématiques
 */
function createMathModule() {
  const mathModule = new Map();
  
  // Constantes mathématiques
  mathModule.set('PI', Math.PI);
  mathModule.set('E', Math.E);
  mathModule.set('INFINITY', Infinity);
  mathModule.set('NAN', NaN);
  
  // Fonctions trigonométriques
  mathModule.set('nekSin', Math.sin);
  mathModule.set('nekCos', Math.cos);
  mathModule.set('nekTan', Math.tan);
  mathModule.set('nekAsin', Math.asin);
  mathModule.set('nekAcos', Math.acos);
  mathModule.set('nekAtan', Math.atan);
  mathModule.set('nekAtan2', Math.atan2);
  
  // Fonctions exponentielles et logarithmiques
  mathModule.set('nekExp', Math.exp);
  mathModule.set('nekLog', Math.log);
  mathModule.set('nekLog10', Math.log10);
  mathModule.set('nekLog2', Math.log2);
  mathModule.set('nekPow', Math.pow);
  mathModule.set('nekSqrt', Math.sqrt);
  mathModule.set('nekCbrt', Math.cbrt);
  
  // Fonctions d'arrondi
  mathModule.set('nekCeil', Math.ceil);
  mathModule.set('nekFloor', Math.floor);
  mathModule.set('nekRound', Math.round);
  mathModule.set('nekTrunc', Math.trunc);
  
  // Fonctions de valeur absolue et signes
  mathModule.set('nekAbs', Math.abs);
  mathModule.set('nekSign', Math.sign);
  
  // Fonctions min/max
  mathModule.set('nekMin', Math.min);
  mathModule.set('nekMax', Math.max);
  
  // Fonctions aléatoires
  mathModule.set('nekAleatoire', Math.random);
  mathModule.set('nekAleatoireEntier', (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  });
  
  // Fonctions spéciales
  mathModule.set('nekHypot', Math.hypot);
  mathModule.set('nekClamp', (value, min, max) => {
    return Math.min(Math.max(value, min), max);
  });
  mathModule.set('nekEstEntier', Number.isInteger);
  mathModule.set('nekEstNombre', (value) => !isNaN(value) && typeof value === 'number');
  mathModule.set('nekEstInfini', (value) => value === Infinity || value === -Infinity);
  
  // Fonctions de conversion
  mathModule.set('nekRadians', (degrees) => degrees * Math.PI / 180);
  mathModule.set('nekDegres', (radians) => radians * 180 / Math.PI);
  
  return mathModule;
}

module.exports = { createMathModule };