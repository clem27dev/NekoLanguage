import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { extendedInsertPackageSchema, packageCategorySchema } from "@shared/schema";
import { nekoInterpreter } from "./interpreter/neko-interpreter";
import { nekoCommand } from "./interpreter/neko-cli";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes for package registry
  app.get("/api/packages", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const query = req.query.q as string | undefined;
      
      let packages;
      if (category) {
        const validatedCategory = packageCategorySchema.safeParse(category);
        if (!validatedCategory.success) {
          packages = await storage.getAllPackages();
        } else {
          packages = await storage.getPackagesByCategory(validatedCategory.data);
        }
      } else if (query) {
        packages = await storage.searchPackages(query);
      } else {
        packages = await storage.getAllPackages();
      }
      
      res.json(packages);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des packages" });
    }
  });

  app.get("/api/packages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de package invalide" });
      }
      
      const pkg = await storage.getPackageById(id);
      if (!pkg) {
        return res.status(404).json({ message: "Package non trouvé" });
      }
      
      res.json(pkg);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération du package" });
    }
  });

  app.get("/api/packages/name/:name", async (req, res) => {
    try {
      const name = req.params.name;
      
      const pkg = await storage.getPackageByName(name);
      if (!pkg) {
        return res.status(404).json({ message: "Package non trouvé" });
      }
      
      res.json(pkg);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération du package" });
    }
  });

  app.post("/api/packages", async (req, res) => {
    try {
      const validationResult = extendedInsertPackageSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Données de package invalides", 
          errors: validationResult.error.format() 
        });
      }
      
      const existingPackage = await storage.getPackageByName(validationResult.data.name);
      if (existingPackage) {
        return res.status(409).json({ message: "Un package avec ce nom existe déjà" });
      }
      
      const newPackage = await storage.createPackage(validationResult.data);
      res.status(201).json(newPackage);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la création du package" });
    }
  });

  app.put("/api/packages/:id/download", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de package invalide" });
      }
      
      const pkg = await storage.incrementDownloadCount(id);
      if (!pkg) {
        return res.status(404).json({ message: "Package non trouvé" });
      }
      
      res.json(pkg);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la mise à jour du package" });
    }
  });

  // API Route for nekoScript interpreter
  app.post("/api/interpreter", async (req, res) => {
    try {
      const codeSchema = z.object({
        code: z.string().min(1)
      });
      
      const validationResult = codeSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Le code est requis", 
          errors: validationResult.error.format() 
        });
      }
      
      const { code } = validationResult.data;
      const result = await nekoInterpreter.execute(code);
      
      res.json({ result });
    } catch (error: any) {
      res.status(400).json({ 
        message: "Erreur d'exécution",
        error: error.message || "Erreur inconnue" 
      });
    }
  });

  // API Route for nekoScript CLI command simulation
  app.post("/api/cli", async (req, res) => {
    try {
      const commandSchema = z.object({
        command: z.string().min(1)
      });
      
      const validationResult = commandSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "La commande est requise", 
          errors: validationResult.error.format() 
        });
      }
      
      const { command } = validationResult.data;
      const result = await nekoCommand.execute(command);
      
      res.json({ result });
    } catch (error: any) {
      res.status(400).json({ 
        message: "Erreur d'exécution de la commande",
        error: error.message || "Erreur inconnue" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
