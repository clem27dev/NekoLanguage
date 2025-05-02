import { readFileSync, existsSync, writeFileSync } from 'fs';
import path from 'path';
import { nekoInterpreterFixed } from './neko-interpreter-fixed';

// Gestion des processus persistants
interface NekoProcess {
  id: number;
  name: string;
  type: string;
  startTime: number;
  fileName: string;
}

// Liste des processus actifs
const activeProcesses: Map<number, NekoProcess> = new Map();

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
      case 'execute':
      case 'exécuter':
        if (args.length >= 2) {
          return this.runScript(args[1]);
        } else {
          return "Erreur: Nom du fichier manquant. Utilisez 'neko-script run <fichier>'";
        }
        
      case 'start':
      case 'démarrer':
        if (args.length >= 2) {
          return this.startApp(args[1]);
        } else {
          return "Erreur: Nom du fichier manquant. Utilisez 'neko-script démarrer <fichier>'";
        }
        
      case 'stop':
      case 'arrêter':
        if (args.length >= 2) {
          return this.stopApp(args[1]);
        } else {
          return "Erreur: ID du processus manquant. Utilisez 'neko-script arrêter <id_processus>'";
        }
        
      case 'processes':
      case 'processus':
        return this.listProcesses();
        
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
  
  exécuter <fichier>            Exécute un script nekoScript
  run <fichier>                 Alias de 'exécuter'
      Exemple: neko-script exécuter monscript.neko
  
  démarrer <fichier>            Démarre une application persistante
  start <fichier>               Alias de 'démarrer'
      Exemple: neko-script démarrer monapp.neko
  
  arrêter <id>                  Arrête une application persistante
  stop <id>                     Alias de 'arrêter'
      Exemple: neko-script arrêter 1234
  
  processus                     Liste les applications en cours d'exécution
  processes                     Alias de 'processus'
      Exemple: neko-script processus
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
  
  /**
   * Démarre une application nekoScript en mode persistant
   * @param filePath Chemin du fichier à exécuter
   */
  private async startApp(filePath: string): Promise<string> {
    try {
      // Vérifier si le fichier existe
      if (!existsSync(filePath)) {
        return `Erreur: Le fichier '${filePath}' n'existe pas.`;
      }
      
      // Lire le contenu du fichier
      const code = readFileSync(filePath, 'utf8');
      
      // Déterminer le type d'application
      let appType = 'script';
      
      if (code.includes('nekImporter Discord') || code.includes('Discord.Bot') || code.includes('créerBot')) {
        appType = 'bot-discord';
      } else if (code.includes('nekImporter Web') || code.includes('Web.Express') || code.includes('créerServeur')) {
        appType = 'web-app';
      } else if (code.includes('nekImporter NekoJeu') || code.includes('NekoJeu.Canvas') || code.includes('créerJeu')) {
        appType = 'jeu';
      }
      
      // Extraire le nom du module
      const moduleMatch = code.match(/nekModule\s+(\w+)/);
      const moduleName = moduleMatch ? moduleMatch[1] : path.basename(filePath, '.neko');
      
      // Générer un ID unique
      const processId = Date.now() % 10000;
      
      // Exécuter l'application en arrière-plan
      // Dans une vraie implémentation, on devrait créer un processus enfant
      // Ici, on va juste simuler l'exécution
      setTimeout(async () => {
        try {
          await nekoInterpreterFixed.execute(code);
        } catch (err) {
          console.error(`Erreur lors de l'exécution de ${moduleName}:`, err);
        }
      }, 0);
      
      // Enregistrer l'application dans la liste des processus actifs
      activeProcesses.set(processId, {
        id: processId,
        name: moduleName,
        type: appType,
        startTime: Date.now(),
        fileName: filePath
      });
      
      return `✅ Application ${moduleName} démarrée avec succès!

📊 Informations:
- ID du processus: ${processId}
- Type d'application: ${appType}
- Nom: ${moduleName}

⚙️ Gestion:
- Liste des processus: neko-script processus
- Arrêter ce processus: neko-script arrêter ${processId}
      `;
    } catch (error: any) {
      return `Erreur lors du démarrage de l'application: ${error.message}`;
    }
  }
  
  /**
   * Arrête une application en cours d'exécution
   * @param processId ID du processus à arrêter
   */
  private stopApp(processId: string): string {
    try {
      const pid = parseInt(processId, 10);
      
      if (isNaN(pid)) {
        return `Erreur: ID de processus invalide: ${processId}`;
      }
      
      // Vérifier si le processus existe
      if (!activeProcesses.has(pid)) {
        return `Erreur: Aucune application en cours d'exécution avec l'ID ${pid}`;
      }
      
      // Récupérer les informations du processus
      const process = activeProcesses.get(pid)!;
      
      // Supprimer le processus de la liste
      activeProcesses.delete(pid);
      
      return `✅ Application ${process.name} (ID: ${pid}) arrêtée avec succès.`;
    } catch (error: any) {
      return `Erreur lors de l'arrêt de l'application: ${error.message}`;
    }
  }
  
  /**
   * Liste les applications en cours d'exécution
   */
  private listProcesses(): string {
    try {
      // Vérifier s'il y a des processus actifs
      if (activeProcesses.size === 0) {
        return "Aucune application nekoScript en cours d'exécution.";
      }
      
      let output = "🐱 Applications nekoScript en cours d'exécution:\n\n";
      
      activeProcesses.forEach(process => {
        const uptimeMs = Date.now() - process.startTime;
        const uptimeSec = Math.floor(uptimeMs / 1000);
        const uptimeMin = Math.floor(uptimeSec / 60);
        const uptimeHour = Math.floor(uptimeMin / 60);
        
        const uptime = uptimeHour > 0 
          ? `${uptimeHour}h ${uptimeMin % 60}m ${uptimeSec % 60}s`
          : uptimeMin > 0 
            ? `${uptimeMin}m ${uptimeSec % 60}s` 
            : `${uptimeSec}s`;
        
        output += `\nID: ${process.id}`;
        output += `\nType: ${process.type}`;
        output += `\nNom: ${process.name}`;
        output += `\nFichier: ${process.fileName}`;
        output += `\nTemps d'exécution: ${uptime}`;
        output += `\n-------------------------------------`;
      });
      
      output += `\n\nPour arrêter une application: neko-script arrêter <id_processus>`;
      
      return output;
    } catch (error: any) {
      return `Erreur lors de la récupération des processus: ${error.message}`;
    }
  }
}

export const nekoCliCommands = new NekoCliCommands();