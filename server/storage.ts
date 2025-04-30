import { packages, type Package, type InsertPackage, users, type User, type InsertUser } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Package methods
  getAllPackages(): Promise<Package[]>;
  getPackageById(id: number): Promise<Package | undefined>;
  getPackageByName(name: string): Promise<Package | undefined>;
  getPackagesByCategory(category: string): Promise<Package[]>;
  createPackage(pkg: InsertPackage): Promise<Package>;
  updatePackage(id: number, pkg: Partial<InsertPackage>): Promise<Package | undefined>;
  incrementDownloadCount(id: number): Promise<Package | undefined>;
  searchPackages(query: string): Promise<Package[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private packages: Map<number, Package>;
  private userIdCounter: number;
  private packageIdCounter: number;

  constructor() {
    this.users = new Map();
    this.packages = new Map();
    this.userIdCounter = 1;
    this.packageIdCounter = 1;

    // Initialize with sample packages
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const samplePackages: InsertPackage[] = [
      {
        name: "Discord.neko",
        version: "1.2.0",
        description: "Bibliothèque complète pour créer des bots Discord avec des fonctionnalités avancées.",
        author: "nekoMaster",
        category: "Discord",
        code: "// Sample Discord.neko code\nnekModule Discord {\n  nekFonction Bot(token) {\n    // Implementation\n  }\n}",
        metadata: {
          repositoryUrl: "https://github.com/nekoMaster/Discord.neko"
        }
      },
      {
        name: "NekoJeu",
        version: "2.3.1",
        description: "Moteur de jeu 2D simple pour créer des jeux en nekoScript avec gestion de sprites et de collisions.",
        author: "gameNeko",
        category: "Jeux",
        code: "// Sample NekoJeu code\nnekModule NekoJeu {\n  nekFonction Canvas(width, height, title) {\n    // Implementation\n  }\n}",
        metadata: {
          repositoryUrl: "https://github.com/gameNeko/NekoJeu"
        }
      },
      {
        name: "NekoWeb",
        version: "1.5.3",
        description: "Framework web pour créer des sites dynamiques avec gestion de routes et templates.",
        author: "webNeko",
        category: "Web",
        code: "// Sample NekoWeb code\nnekModule NekoWeb {\n  nekFonction Router() {\n    // Implementation\n  }\n}",
        metadata: {
          repositoryUrl: "https://github.com/webNeko/NekoWeb"
        }
      },
      {
        name: "NekoDB",
        version: "0.9.2",
        description: "Solution de base de données légère avec stockage local ou cloud pour vos applications nekoScript.",
        author: "dataNeko",
        category: "Base de données",
        code: "// Sample NekoDB code\nnekModule NekoDB {\n  nekFonction connexion(config) {\n    // Implementation\n  }\n}",
        metadata: {
          repositoryUrl: "https://github.com/dataNeko/NekoDB"
        }
      },
      {
        name: "NekoUI",
        version: "1.0.0",
        description: "Bibliothèque d'interfaces utilisateur avec composants stylisés pour vos applications web.",
        author: "designNeko",
        category: "UI",
        code: "// Sample NekoUI code\nnekModule NekoUI {\n  nekFonction Button(text, onClick) {\n    // Implementation\n  }\n}",
        metadata: {
          repositoryUrl: "https://github.com/designNeko/NekoUI"
        }
      },
      {
        name: "NekoUtil",
        version: "1.7.4",
        description: "Collection de fonctions utilitaires pour manipuler les chaînes, tableaux, dates et plus.",
        author: "utilNeko",
        category: "Utilitaires",
        code: "// Sample NekoUtil code\nnekModule NekoUtil {\n  nekFonction formaterDate(date, format) {\n    // Implementation\n  }\n}",
        metadata: {
          repositoryUrl: "https://github.com/utilNeko/NekoUtil"
        }
      }
    ];

    // Add sample packages to storage
    samplePackages.forEach(pkg => {
      const id = this.packageIdCounter++;
      const now = new Date();
      
      const fullPackage: Package = {
        ...pkg,
        id,
        downloadCount: Math.floor(Math.random() * 20000) + 1000,
        stars: Math.floor(Math.random() * 500) + 50,
        createdAt: now,
        publishedAt: now
      };
      
      this.packages.set(id, fullPackage);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Package methods
  async getAllPackages(): Promise<Package[]> {
    return Array.from(this.packages.values());
  }

  async getPackageById(id: number): Promise<Package | undefined> {
    return this.packages.get(id);
  }

  async getPackageByName(name: string): Promise<Package | undefined> {
    return Array.from(this.packages.values()).find(
      (pkg) => pkg.name.toLowerCase() === name.toLowerCase()
    );
  }

  async getPackagesByCategory(category: string): Promise<Package[]> {
    return Array.from(this.packages.values()).filter(
      (pkg) => pkg.category.toLowerCase() === category.toLowerCase()
    );
  }

  async createPackage(pkg: InsertPackage): Promise<Package> {
    const id = this.packageIdCounter++;
    const now = new Date();
    
    const newPackage: Package = {
      ...pkg,
      id,
      downloadCount: 0,
      stars: 0,
      createdAt: now,
      publishedAt: now
    };
    
    this.packages.set(id, newPackage);
    return newPackage;
  }

  async updatePackage(id: number, updates: Partial<InsertPackage>): Promise<Package | undefined> {
    const pkg = this.packages.get(id);
    if (!pkg) return undefined;
    
    const updatedPackage: Package = {
      ...pkg,
      ...updates
    };
    
    this.packages.set(id, updatedPackage);
    return updatedPackage;
  }

  async incrementDownloadCount(id: number): Promise<Package | undefined> {
    const pkg = this.packages.get(id);
    if (!pkg) return undefined;
    
    const updatedPackage: Package = {
      ...pkg,
      downloadCount: pkg.downloadCount + 1
    };
    
    this.packages.set(id, updatedPackage);
    return updatedPackage;
  }

  async searchPackages(query: string): Promise<Package[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.packages.values()).filter(
      (pkg) => 
        pkg.name.toLowerCase().includes(lowercaseQuery) ||
        pkg.description.toLowerCase().includes(lowercaseQuery) ||
        pkg.author.toLowerCase().includes(lowercaseQuery)
    );
  }
}

export const storage = new MemStorage();
