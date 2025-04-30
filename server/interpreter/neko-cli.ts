import { storage } from "../storage";

/**
 * Simulated CLI for nekoScript commands
 */
export class NekoCommand {
  constructor() {}

  async execute(command: string): Promise<string> {
    const parts = command.trim().split(/\s+/);
    
    if (parts.length === 0) {
      return "Commande invalide";
    }
    
    const baseCommand = parts[0];
    
    // Process nekoScript CLI commands
    if (baseCommand === "$neko-script" || baseCommand === "neko-script") {
      const subCommand = parts[1];
      
      switch (subCommand) {
        case "télécharger":
          return this.handleDownload();
        
        case "librairie":
        case "librairie":
          return this.handleLibraryInstall(parts[2]);
        
        case "publish":
          return this.handlePublish(parts[2]);
        
        case "exécuter":
          return this.handleExecute(parts[2]);
        
        case "tester":
          return this.handleTest(parts[2]);
        
        default:
          return `Commande inconnue: ${subCommand}\n\nCommandes disponibles:\n- télécharger\n- librairie (nom)\n- publish (nom)\n- exécuter (fichier)\n- tester (fichier)`;
      }
    } else {
      return this.handleSystemCommand(command);
    }
  }

  private handleDownload(): string {
    return "✓ nekoScript installé avec succès!";
  }

  private async handleLibraryInstall(packageName: string): Promise<string> {
    if (!packageName) {
      return "Erreur: Nom de bibliothèque manquant";
    }
    
    const pkg = await storage.getPackageByName(packageName);
    
    if (pkg) {
      // Increment download count
      await storage.incrementDownloadCount(pkg.id);
      return `✓ Bibliothèque ${packageName} téléchargée!`;
    } else {
      return `Erreur: Bibliothèque ${packageName} introuvable`;
    }
  }

  private async handlePublish(packageName: string): Promise<string> {
    if (!packageName) {
      return "Erreur: Nom de bibliothèque manquant";
    }
    
    const pkg = await storage.getPackageByName(packageName);
    
    if (pkg) {
      return `Erreur: Une bibliothèque nommée ${packageName} existe déjà`;
    } else {
      // Simulate package creation with default values
      const nameParts = packageName.split('.');
      const name = nameParts[0];
      
      const newPackage = await storage.createPackage({
        name,
        version: "1.0.0",
        description: `Nouvelle bibliothèque ${name}`,
        author: "utilisateur",
        category: "Autre",
        code: `// ${name}.neko\nnekModule ${name} {\n  // Votre code ici\n}`,
        metadata: {}
      });
      
      return `✓ Bibliothèque ${name} publiée avec succès!`;
    }
  }

  private handleExecute(fileName: string): string {
    if (!fileName) {
      return "Erreur: Nom de fichier manquant";
    }
    
    return `Exécution de ${fileName}...`;
  }

  private handleTest(fileName: string): string {
    if (!fileName) {
      return "Erreur: Nom de fichier manquant";
    }
    
    return `Test de ${fileName} réussi!`;
  }

  private handleSystemCommand(command: string): string {
    const parts = command.trim().split(/\s+/);
    const baseCommand = parts[0];
    
    switch (baseCommand) {
      case "touch":
        return `Fichier ${parts[1]} créé`;
      
      case "ls":
      case "dir":
        return "mon-projet.neko\nDiscord.neko\nNekoJeu.neko";
      
      default:
        return `Commande système simulée: ${command}`;
    }
  }
}

export const nekoCommand = new NekoCommand();
