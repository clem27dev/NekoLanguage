/**
 * Module Math.neko
 * Ce module fournit des fonctions mathématiques avancées pour nekoScript
 */

"use strict";

/**
 * Crée un module Math pour nekoScript
 * @returns {Map} Module exposant les fonctionnalités mathématiques
 */
function createMathModule() {
  const mathModule = new Map();
  
  // Constantes mathématiques
  mathModule.set('PI', Math.PI);
  mathModule.set('E', Math.E);
  mathModule.set('INFINITY', Infinity);
  mathModule.set('NAN', NaN);
  
  // Fonctions trigonométriques (en radians)
  mathModule.set('sin', Math.sin);
  mathModule.set('cos', Math.cos);
  mathModule.set('tan', Math.tan);
  mathModule.set('asin', Math.asin);
  mathModule.set('acos', Math.acos);
  mathModule.set('atan', Math.atan);
  mathModule.set('atan2', Math.atan2);
  
  // Fonctions trigonométriques (en degrés)
  mathModule.set('sinDegrés', (degrés) => Math.sin(degrés * Math.PI / 180));
  mathModule.set('cosDegrés', (degrés) => Math.cos(degrés * Math.PI / 180));
  mathModule.set('tanDegrés', (degrés) => Math.tan(degrés * Math.PI / 180));
  
  // Conversions
  mathModule.set('radiansDegrés', (radians) => radians * 180 / Math.PI);
  mathModule.set('degrésRadians', (degrés) => degrés * Math.PI / 180);
  
  // Fonctions exponentielles et logarithmiques
  mathModule.set('exp', Math.exp);
  mathModule.set('log', Math.log);
  mathModule.set('log10', Math.log10);
  mathModule.set('log2', Math.log2);
  mathModule.set('pow', Math.pow);
  mathModule.set('sqrt', Math.sqrt);
  mathModule.set('racine', Math.sqrt);
  mathModule.set('racineCubique', (x) => Math.cbrt(x));
  
  // Fonctions d'arrondi
  mathModule.set('arrondir', Math.round);
  mathModule.set('plafond', Math.ceil);
  mathModule.set('plancher', Math.floor);
  mathModule.set('tronquer', Math.trunc);
  
  // Valeurs min/max
  mathModule.set('min', Math.min);
  mathModule.set('max', Math.max);
  mathModule.set('absolu', Math.abs);
  mathModule.set('signe', Math.sign);
  
  // Fonctions aléatoires
  mathModule.set('aléatoire', Math.random);
  mathModule.set('entierAléatoire', (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  });
  
  // Fonctions de distance
  mathModule.set('distance', (x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  });
  
  mathModule.set('distance3D', (x1, y1, z1, x2, y2, z2) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2));
  });
  
  // Fonctions d'interpolation
  mathModule.set('lerp', (a, b, t) => {
    return a + (b - a) * Math.max(0, Math.min(1, t));
  });
  
  // Fonctions statistiques
  mathModule.set('moyenne', (...nombres) => {
    if (nombres.length === 0) return 0;
    const somme = nombres.reduce((acc, val) => acc + val, 0);
    return somme / nombres.length;
  });
  
  mathModule.set('médiane', (...nombres) => {
    if (nombres.length === 0) return 0;
    const triés = [...nombres].sort((a, b) => a - b);
    const milieu = Math.floor(triés.length / 2);
    return triés.length % 2 === 0
      ? (triés[milieu - 1] + triés[milieu]) / 2
      : triés[milieu];
  });
  
  mathModule.set('variance', (...nombres) => {
    if (nombres.length <= 1) return 0;
    const moyenne = mathModule.get('moyenne')(...nombres);
    const sommeCarrésDiffs = nombres.reduce((acc, val) => {
      return acc + Math.pow(val - moyenne, 2);
    }, 0);
    return sommeCarrésDiffs / nombres.length;
  });
  
  mathModule.set('écartType', (...nombres) => {
    return Math.sqrt(mathModule.get('variance')(...nombres));
  });
  
  // Fonctions vectorielles
  mathModule.set('créerVecteur2D', (x = 0, y = 0) => {
    return { x, y };
  });
  
  mathModule.set('créerVecteur3D', (x = 0, y = 0, z = 0) => {
    return { x, y, z };
  });
  
  mathModule.set('additionnerVecteurs', (v1, v2) => {
    if (v1.z !== undefined && v2.z !== undefined) {
      return { 
        x: v1.x + v2.x, 
        y: v1.y + v2.y, 
        z: v1.z + v2.z 
      };
    }
    return { 
      x: v1.x + v2.x, 
      y: v1.y + v2.y 
    };
  });
  
  mathModule.set('soustraireVecteurs', (v1, v2) => {
    if (v1.z !== undefined && v2.z !== undefined) {
      return { 
        x: v1.x - v2.x, 
        y: v1.y - v2.y, 
        z: v1.z - v2.z 
      };
    }
    return { 
      x: v1.x - v2.x, 
      y: v1.y - v2.y 
    };
  });
  
  mathModule.set('normaliserVecteur', (v) => {
    if (v.z !== undefined) {
      const longueur = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
      if (longueur === 0) return { x: 0, y: 0, z: 0 };
      return { 
        x: v.x / longueur, 
        y: v.y / longueur, 
        z: v.z / longueur 
      };
    }
    
    const longueur = Math.sqrt(v.x * v.x + v.y * v.y);
    if (longueur === 0) return { x: 0, y: 0 };
    return { 
      x: v.x / longueur, 
      y: v.y / longueur 
    };
  });
  
  mathModule.set('produitScalaire', (v1, v2) => {
    if (v1.z !== undefined && v2.z !== undefined) {
      return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    }
    return v1.x * v2.x + v1.y * v2.y;
  });
  
  mathModule.set('produitVectoriel', (v1, v2) => {
    return {
      x: v1.y * v2.z - v1.z * v2.y,
      y: v1.z * v2.x - v1.x * v2.z,
      z: v1.x * v2.y - v1.y * v2.x
    };
  });
  
  // Fonctions de conversion
  mathModule.set('décimauxVersHexadécimal', (nombre) => {
    return nombre.toString(16);
  });
  
  mathModule.set('hexadécimalVersDécimaux', (hex) => {
    return parseInt(hex, 16);
  });
  
  mathModule.set('décimauxVersBinaire', (nombre) => {
    return nombre.toString(2);
  });
  
  mathModule.set('binaireVersDécimaux', (binaire) => {
    return parseInt(binaire, 2);
  });
  
  return mathModule;
}

module.exports = { createMathModule };