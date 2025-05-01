import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { nekoInterpreterFixed } from './neko-interpreter-fixed';

/**
 * Classe qui gère les commandes CLI de nekoScript
 */
export class NekoCliCommands {
  /**
   * Exécute une commande neko-script
   * @param args Arguments de la commande
   * @returns Résultat de l'exécution
   */
  async executeCommand(args: string[]): Promise<string> {
    if (args.length === 0) {
      return this.showHelp();
    }
    
    const command = args[0].toLowerCase();
    
    switch (command) {
      case 'help':
        return this.showHelp();
        
      case 'publish':
      case 'publier':
        if (args[1] === 'package' && args.length >= 4) {
          return this.publishPackage(args[2], args[3]);
        } else {
          return "Erreur: Usage incorrect. Utilisez 'neko-script publish package <fichier> <nom>'";
        }
        
      case 'télécharger':
      case 'download':
        if (args.length >= 2) {
          return await nekoInterpreterFixed.downloadPackage(args[1]);
        } else {
          return "Erreur: Nom du package manquant. Utilisez 'neko-script télécharger <nom-package>'";
        }
        
      case 'list':
      case 'lister':
        return nekoInterpreterFixed.listPackages();
        
      case 'run':
      case 'exécuter':
        if (args.length >= 2) {
          return this.runScript(args[1]);
        } else {
          return "Erreur: Nom du fichier manquant. Utilisez 'neko-script run <fichier>'";
        }
        
      default:
        return `Commande '${command}' non reconnue. Tapez 'neko-script help' pour la liste des commandes.`;
    }
  }
  
  /**
   * Affiche l'aide de neko-script
   */
  private showHelp(): string {
    return `
🐱 nekoScript CLI - Aide 🐱

Commandes disponibles:

  help                          Affiche cette aide
  
  publish package <fichier> <nom>  Publie un fichier .neko ou .js comme un package
      Exemple: neko-script publish package monbot.neko MonBot
      Exemple: neko-script publish package utils.js NekUtils
  
  télécharger <nom-package>     Télécharge un package depuis le registre
      Exemple: neko-script télécharger MonBot
  
  lister                        Liste tous les packages disponibles
  
  run <fichier>                 Exécute un script nekoScript
      Exemple: neko-script run monscript.neko
`;
  }
  
  /**
   * Publie un package
   * @param filePath Chemin du fichier à publier
   * @param packageName Nom du package
   */
  private async publishPackage(filePath: string, packageName: string): Promise<string> {
    try {
      // Vérifier si le fichier existe
      if (!existsSync(filePath)) {
        return `Erreur: Le fichier '${filePath}' n'existe pas.`;
      }
      
      // Lire le contenu du fichier
      const code = readFileSync(filePath, 'utf8');
      
      // Déterminer si c'est du JavaScript ou du nekoScript
      const isJavaScript = path.extname(filePath).toLowerCase() === '.js';
      
      // Publier le package
      return await nekoInterpreterFixed.publishPackage(code, packageName, isJavaScript);
    } catch (error: any) {
      return `Erreur lors de la publication du package: ${error.message}`;
    }
  }
  
  /**
   * Exécute un script nekoScript
   * @param filePath Chemin du fichier à exécuter
   */
  private async runScript(filePath: string): Promise<string> {
    try {
      // Vérifier si le fichier existe
      if (!existsSync(filePath)) {
        return `Erreur: Le fichier '${filePath}' n'existe pas.`;
      }
      
      // Lire le contenu du fichier
      const code = readFileSync(filePath, 'utf8');
      
      // Exécuter le script
      return await nekoInterpreterFixed.execute(code);
    } catch (error: any) {
      return `Erreur lors de l'exécution du script: ${error.message}`;
    }
  }
}

export const nekoCliCommands = new NekoCliCommands();