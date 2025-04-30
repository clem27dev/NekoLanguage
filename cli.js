#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Fonction principale du CLI
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    showHelp();
    return;
  }
  
  const command = args[0];
  
  switch (command) {
    case 'télécharger':
      downloadNekoScript();
      break;
    case 'initialiser':
      initializeProject(args[1] || 'mon-projet');
      break;
    case 'librairie':
      installLibrary(args[1]);
      break;
    case 'publier':
      publishPackage(args[1], args.slice(2).join(' '));
      break;
    case 'exécuter':
      executeFile(args[1]);
      break;
    case 'aide':
    case 'help':
      showHelp();
      break;
    default:
      console.log(`Commande inconnue: ${command}`);
      showHelp();
  }
}

// Fonction pour télécharger/mettre à jour nekoScript
function downloadNekoScript() {
  console.log("🐱 Mise à jour de nekoScript...");
  
  try {
    // Si nekoScript est déjà installé, mettre à jour
    if (fs.existsSync(path.join(process.env.HOME, '.nekoscript'))) {
      console.log("Installation existante détectée, mise à jour...");
      process.chdir(path.join(process.env.HOME, '.nekoscript'));
      execSync('git pull origin main', { stdio: 'inherit' });
      execSync('npm install --production', { stdio: 'inherit' });
    } 
    // Sinon, télécharger le script d'installation et l'exécuter
    else {
      console.log("Première installation de nekoScript...");
      execSync('curl -fsSL https://raw.githubusercontent.com/clem27dev/NekoLanguage/main/install.sh | bash', 
               { stdio: 'inherit' });
    }
    
    console.log("✅ nekoScript a été installé/mis à jour avec succès!");
  } catch (error) {
    console.error("❌ Erreur lors de l'installation:", error.message);
    console.log("Essayez d'installer manuellement: curl -fsSL https://get.nekoscript.fr | sh");
  }
}

// Autres fonctions du CLI...
function showHelp() {
  console.log(`
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
  `);
}

// Appel de la fonction principale
main();
