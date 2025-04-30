#!/usr/bin/env node
/**
 * CLI pour nekoScript
 * Ce fichier est le point d'entrée pour la commande CLI neko-script
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { NekoCommand } from './cli/command';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Lire les informations du package.json
const packageJson = require('../package.json');

// Créer une instance pour la commande
const program = new Command();
const nekoCommand = new NekoCommand();

// Fonction principale du CLI
export function run() {
  // Configuration de base
  program
    .name('neko-script')
    .description(chalk.magenta('🐱 nekoScript - Un langage de programmation français pour les développeurs'))
    .version(packageJson.version);

  // Commande: télécharger
  program
    .command('télécharger')
    .description('Télécharger ou mettre à jour nekoScript')
    .action(async () => {
      console.log(chalk.cyan('🐱 Mise à jour de nekoScript...'));
      await downloadNekoScript();
    });

  // Commande: initialiser
  program
    .command('initialiser [nom]')
    .description('Initialiser un nouveau projet nekoScript')
    .action(async (nom = 'mon-projet') => {
      const result = await nekoCommand.execute(`init ${nom}`);
      console.log(result);
    });

  // Commande: librairie
  program
    .command('librairie <nom>')
    .description('Installer une librairie pour nekoScript')
    .action(async (nom) => {
      const result = await nekoCommand.execute(`install ${nom}`);
      console.log(result);
    });

  // Commande: lister
  program
    .command('lister')
    .description('Lister les librairies disponibles')
    .action(async () => {
      const result = await nekoCommand.execute('list');
      console.log(result);
    });

  // Commande: créer
  program
    .command('créer <nom>')
    .description('Créer un nouveau fichier nekoScript')
    .action(async (nom) => {
      const result = await nekoCommand.execute(`create ${nom}`);
      console.log(result);
    });

  // Commande: exécuter
  program
    .command('exécuter <fichier>')
    .description('Exécuter un programme nekoScript')
    .action(async (fichier) => {
      const result = await nekoCommand.execute(`execute ${fichier}`);
      console.log(result);
    });

  // Commande: tester
  program
    .command('tester <fichier>')
    .description('Tester un programme nekoScript')
    .action(async (fichier) => {
      const result = await nekoCommand.execute(`test ${fichier}`);
      console.log(result);
    });

  // Commande: publier
  program
    .command('publier <nom> [description]')
    .description('Publier un package nekoScript')
    .action(async (nom, description = '') => {
      const result = await nekoCommand.execute(`publish ${nom} ${description}`);
      console.log(result);
    });

  // Commande: aide
  program
    .command('aide')
    .description('Afficher l\'aide de nekoScript')
    .action(() => {
      console.log(chalk.cyan(`
╔══════════════ 🐱 nekoScript CLI ═══════════════╗
║                                                ║
║  Commandes disponibles:                        ║
║                                                ║
║  Installation:                                 ║
║  - télécharger                                 ║
║  - initialiser [nom]                           ║
║                                                ║
║  Gestion des packages:                         ║
║  - librairie <nom>    Installer un package     ║
║  - lister             Lister les packages      ║
║  - publier <nom> [description]                 ║
║                                                ║
║  Développement:                                ║
║  - créer <nom.neko>   Créer un fichier         ║ 
║  - exécuter <fichier> Exécuter un programme    ║
║  - tester <fichier>   Tester un programme      ║
║                                                ║
╚════════════════════════════════════════════════╝
      `));
    });

  // Analyse des arguments
  program.parse(process.argv);

  // Si aucun argument n'est fourni, afficher l'aide
  if (!process.argv.slice(2).length) {
    program.help();
  }
}

// Fonction pour télécharger/mettre à jour nekoScript
async function downloadNekoScript() {
  try {
    const { execSync } = require('child_process');
    const homeDir = os.homedir();
    const nekoScriptDir = path.join(homeDir, '.nekoscript');

    // Si nekoScript est déjà installé, mettre à jour
    if (fs.existsSync(nekoScriptDir)) {
      console.log(chalk.blue("Installation existante détectée, mise à jour..."));
      process.chdir(nekoScriptDir);
      execSync('git pull origin main', { stdio: 'inherit' });
      execSync('npm install --production', { stdio: 'inherit' });
    } 
    // Sinon, télécharger depuis GitHub
    else {
      console.log(chalk.blue("Première installation de nekoScript..."));
      fs.mkdirSync(nekoScriptDir, { recursive: true });
      process.chdir(nekoScriptDir);
      
      // Télécharger depuis GitHub
      execSync('git clone https://github.com/clem27dev/NekoLanguage.git .', { stdio: 'inherit' });
      execSync('npm install --production', { stdio: 'inherit' });
      
      // Créer lien symbolique pour l'exécutable
      const binDir = path.join(nekoScriptDir, 'bin');
      fs.mkdirSync(binDir, { recursive: true });
      
      // Créer le script exécutable
      const scriptPath = path.join(binDir, 'neko-script');
      fs.writeFileSync(scriptPath, '#!/usr/bin/env node\nrequire("../src/cli").run();\n');
      fs.chmodSync(scriptPath, '755');
      
      // Ajouter au PATH si ce n'est pas déjà fait
      const bashrcPath = path.join(homeDir, '.bashrc');
      const zshrcPath = path.join(homeDir, '.zshrc');
      
      const pathLine = `\n# nekoScript PATH\nexport PATH="$PATH:${binDir}"\n`;
      
      if (fs.existsSync(bashrcPath)) {
        fs.appendFileSync(bashrcPath, pathLine);
      }
      
      if (fs.existsSync(zshrcPath)) {
        fs.appendFileSync(zshrcPath, pathLine);
      }
    }
    
    console.log(chalk.green("✅ nekoScript a été installé/mis à jour avec succès!"));
    console.log(chalk.yellow("Note: Pour utiliser immédiatement la commande 'neko-script',"));
    console.log(chalk.yellow("      vous devrez peut-être redémarrer votre terminal ou exécuter:"));
    console.log(chalk.yellow(`      export PATH="$PATH:${path.join(nekoScriptDir, 'bin')}"`));
    
  } catch (error) {
    console.error(chalk.red("❌ Erreur lors de l'installation:"), error.message);
    console.log(chalk.yellow("Essayez d'installer manuellement:"));
    console.log(chalk.yellow("curl -fsSL https://raw.githubusercontent.com/clem27dev/NekoLanguage/main/install.sh | bash"));
  }
}

// Si ce fichier est exécuté directement
if (require.main === module) {
  run();
}