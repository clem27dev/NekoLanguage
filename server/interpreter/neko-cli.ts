import { storage } from "../storage";

/**
 * Simulated CLI for nekoScript commands
 */
export class NekoCommand {
  private installedPackages: Set<string> = new Set();
  private localFiles: Map<string, string> = new Map();
  
  constructor() {
    // Simuler quelques fichiers par défaut
    this.localFiles.set("mon-projet.neko", "// Mon premier projet nekoScript\nnekVariable message = \"Bonjour, monde!\";\nnekAfficher(message);");
  }

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
        
        case "init":
        case "initialiser":
          return this.handleInit(parts[2] || "mon-projet");
          
        case "librairie":
        case "installer":
          return this.handleLibraryInstall(parts[2]);
          
        case "lister":
        case "packages":
          return this.handleListPackages();
        
        case "publier":
        case "publish":
          return this.handlePublish(parts[2], parts.slice(3).join(' '));
        
        case "exécuter":
        case "run":
          return this.handleExecute(parts[2]);
        
        case "tester":
        case "test":
          return this.handleTest(parts[2]);
          
        case "créer":
        case "nouveau":
          return this.handleCreateFile(parts[2]);
          
        case "aide":
        case "help":
          return this.showHelp();
        
        default:
          return `Commande inconnue: ${subCommand}\n\n${this.showHelp()}`;
      }
    } else {
      return this.handleSystemCommand(command);
    }
  }
  
  private showHelp(): string {
    return `
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
    `;
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

  private handleInit(projectName: string): string {
    if (this.localFiles.has(`${projectName}.neko`)) {
      return `Erreur: Le fichier ${projectName}.neko existe déjà`;
    }
    
    this.localFiles.set(`${projectName}.neko`, `// ${projectName}.neko
// Créé avec nekoScript

nekVariable nom = "${projectName}";
nekAfficher("Projet " + nom + " initialisé avec succès!");

// Vous pouvez commencer à coder ici
nekFonction direBonjour(utilisateur) {
  nekRetourner "Bonjour, " + utilisateur + "!";
}

nekVariable message = direBonjour("développeur");
nekAfficher(message);
`);
    
    this.localFiles.set("neko.config.json", `{
  "nom": "${projectName}",
  "version": "1.0.0",
  "description": "Mon projet nekoScript",
  "auteur": "Développeur",
  "dependances": []
}`);
    
    return `✓ Projet ${projectName} initialisé avec succès!\n✓ Fichiers créés: ${projectName}.neko, neko.config.json`;
  }
  
  private async handleListPackages(): Promise<string> {
    const packages = await storage.getAllPackages();
    
    if (packages.length === 0) {
      return "Aucun package disponible.";
    }
    
    let result = "╔═══════ 📦 Packages disponibles ════════╗\n";
    
    packages.forEach(pkg => {
      result += `║ ${pkg.name.padEnd(20)} v${pkg.version.padEnd(8)} ║\n`;
      result += `║ ${pkg.description.substring(0, 36).padEnd(36)} ║\n`;
      result += `║ ${"―".repeat(36)} ║\n`;
    });
    
    result += "╚════════════════════════════════════╝";
    
    return result;
  }
  
  private handleCreateFile(fileName: string): string {
    if (!fileName) {
      return "Erreur: Nom de fichier manquant";
    }
    
    if (!fileName.endsWith(".neko")) {
      fileName += ".neko";
    }
    
    if (this.localFiles.has(fileName)) {
      return `Erreur: Le fichier ${fileName} existe déjà`;
    }
    
    this.localFiles.set(fileName, `// ${fileName}
// Créé avec nekoScript

nekAfficher("Nouveau fichier ${fileName} créé!");
`);
    
    return `✓ Fichier ${fileName} créé avec succès!`;
  }
  
  private async handlePublish(packageName: string, description: string = ""): Promise<string> {
    if (!packageName) {
      return "Erreur: Nom de package manquant";
    }
    
    // Vérifier format du nom (pas d'espace, caractères spéciaux limités)
    if (!/^[a-zA-Z0-9\._-]+$/.test(packageName)) {
      return "Erreur: Le nom du package ne peut contenir que des lettres, chiffres, points, tirets et underscores";
    }
    
    const pkg = await storage.getPackageByName(packageName);
    
    if (pkg) {
      return `Erreur: Un package nommé ${packageName} existe déjà`;
    } else {
      // Déterminer si un fichier correspondant existe
      const fileName = `${packageName}.neko`;
      let code = this.localFiles.get(fileName);
      
      if (!code) {
        return `Erreur: Aucun fichier ${fileName} trouvé. Créez d'abord votre package avec 'neko-script créer ${fileName}'`;
      }
      
      // Simuler la création du package
      const newPackage = await storage.createPackage({
        name: packageName,
        version: "1.0.0",
        description: description || `Package ${packageName} pour nekoScript`,
        author: "utilisateur",
        category: "Autre",
        code,
        metadata: {}
      });
      
      // Ajouter à nos packages installés
      this.installedPackages.add(packageName);
      
      return `✓ Package ${packageName} publié avec succès!
Les autres développeurs peuvent maintenant l'installer avec:
  $ neko-script librairie ${packageName}`;
    }
  }

  private handleExecute(fileName: string): string {
    if (!fileName) {
      return "Erreur: Nom de fichier manquant";
    }
    
    if (!fileName.endsWith(".neko")) {
      fileName += ".neko";
    }
    
    const code = this.localFiles.get(fileName);
    if (!code) {
      return `Erreur: Fichier ${fileName} non trouvé`;
    }
    
    // On simule l'exécution
    return `Exécution de ${fileName}...\n\n--- Résultat ---\n${this.simulateExecution(code)}`;
  }

  private handleTest(fileName: string): string {
    if (!fileName) {
      return "Erreur: Nom de fichier manquant";
    }
    
    if (!fileName.endsWith(".neko")) {
      fileName += ".neko";
    }
    
    const code = this.localFiles.get(fileName);
    if (!code) {
      return `Erreur: Fichier ${fileName} non trouvé`;
    }
    
    // On simule les tests
    return `Test de ${fileName}...\n\n--- Résultat des tests ---\n✓ Tous les tests ont réussi!`;
  }
  
  private simulateExecution(code: string): string {
    // Simulation simple d'exécution (extrait les nekAfficher)
    const outputs: string[] = [];
    const lines = code.split("\n");
    
    for (const line of lines) {
      const printMatch = line.match(/nekAfficher\(["'](.*)["']\)/);
      if (printMatch) {
        outputs.push(printMatch[1]);
      }
      
      const printVarMatch = line.match(/nekAfficher\(([^"']+)\)/);
      if (printVarMatch && !printMatch) {
        // On simule l'affichage d'une variable
        outputs.push(`[Variable: ${printVarMatch[1]}]`);
      }
    }
    
    return outputs.join("\n");
  }

  private handleSystemCommand(command: string): string {
    const parts = command.trim().split(/\s+/);
    const baseCommand = parts[0];
    
    switch (baseCommand) {
      case "touch":
        const fileName = parts[1];
        if (!fileName) {
          return "Erreur: Nom de fichier manquant";
        }
        this.localFiles.set(fileName, "");
        return `Fichier ${fileName} créé`;
      
      case "ls":
      case "dir":
        return Array.from(this.localFiles.keys()).join("\n") || "Aucun fichier";
      
      case "cat":
        const fileToRead = parts[1];
        if (!fileToRead) {
          return "Erreur: Nom de fichier manquant";
        }
        const content = this.localFiles.get(fileToRead);
        if (!content) {
          return `Erreur: Fichier ${fileToRead} non trouvé`;
        }
        return content;
      
      default:
        return `Commande système simulée: ${command}`;
    }
  }
}

export const nekoCommand = new NekoCommand();
