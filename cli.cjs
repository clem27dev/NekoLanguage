#!/usr/bin/env node

/**
 * CLI pour nekoScript
 * Interface en ligne de commande pour exécuter les commandes nekoScript
 */

const fs = require('fs');
const path = require('path');
const { NekoCommand } = require('./nekoscript-package/src/cli/command');

// Fonction principale
async function main() {
  try {
    // Créer une instance de NekoCommand
    const nekoCommand = new NekoCommand();

    // Récupérer les arguments de la ligne de commande
    // [0] est node, [1] est le nom du script, [2] et suivants sont les arguments
    const args = process.argv.slice(2);

    if (args.length === 0) {
      console.log("Usage: neko-script <commande> [options]");
      console.log("Pour voir la liste des commandes disponibles, utilisez: neko-script help");
      process.exit(1);
    }

    // Construire la commande
    const command = args.join(' ');

    // Exécuter la commande
    const result = await nekoCommand.execute(command);
    console.log(result);

  } catch (error) {
    console.error("Erreur lors de l'exécution de la commande:", error.message);
    process.exit(1);
  }
}

// Exécuter la fonction principale
main();