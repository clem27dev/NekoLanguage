import React, { useState } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Terminal, { TerminalLine } from "@/components/ui/terminal";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Upload, Check, AlertTriangle } from "lucide-react";
import { packageCategories } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

const PublishPackagePage: React.FC = () => {
  const { toast } = useToast();
  const [packageName, setPackageName] = useState("");
  const [packageDescription, setPackageDescription] = useState("");
  const [packageVersion, setPackageVersion] = useState("1.0.0");
  const [packageCategory, setPackageCategory] = useState("Autre");
  const [packageCode, setPackageCode] = useState(`// ${packageName || "MonPackage"}.neko
// Votre code nekoScript pour ce package

nekModule ${packageName || "MonPackage"} {
  // Exportez vos fonctions et variables ici
  
  nekFonction maFonction(param) {
    nekRetourner "Exemple: " + param;
  }
  
  // Vous pouvez exporter des constantes
  nekVariable VERSION = "${packageVersion}";
  
  // Ou d'autres fonctionnalités
  nekFonction initialiser() {
    nekAfficher("${packageName || "MonPackage"} initialisé avec succès!");
  }
}`);
  
  const [publishStatus, setPublishStatus] = useState<"idle" | "publishing" | "success" | "error">("idle");
  const [cliOutput, setCliOutput] = useState<string | null>(null);
  
  const publishPackage = async () => {
    // Validation de base
    if (!packageName) {
      toast({
        title: "Erreur",
        description: "Le nom du package est requis",
        variant: "destructive"
      });
      return;
    }
    
    if (!packageCode) {
      toast({
        title: "Erreur",
        description: "Le code du package est requis",
        variant: "destructive"
      });
      return;
    }
    
    setPublishStatus("publishing");
    setCliOutput(null);
    
    try {
      // Soumettre le package
      const response = await apiRequest("POST", "/api/packages", {
        name: packageName,
        version: packageVersion,
        description: packageDescription || `Package ${packageName} pour nekoScript`,
        category: packageCategory,
        author: "utilisateur",
        code: packageCode,
        metadata: {}
      });
      
      // Simuler la commande CLI également
      const cliResponse = await apiRequest("POST", "/api/cli", {
        command: `neko-script publier ${packageName} "${packageDescription}"`
      });
      
      const cliData = await cliResponse.json();
      setCliOutput(cliData.result);
      
      setPublishStatus("success");
      
      toast({
        title: "Succès",
        description: `Le package ${packageName} a été publié avec succès!`,
        variant: "default"
      });
    } catch (error) {
      console.error("Erreur lors de la publication:", error);
      setPublishStatus("error");
      
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la publication du package",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="font-poppins font-bold text-4xl mb-4">Publier un package nekoScript</h1>
            <p className="text-gray-600 max-w-2xl mb-8">
              Partagez votre code avec la communauté nekoScript ! Créez et publiez votre propre package
              qui pourra être utilisé par d'autres développeurs dans leurs projets.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-lg shadow-sm p-8">
                <h2 className="font-poppins font-semibold text-xl mb-6">Informations du package</h2>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label htmlFor="packageName" className="block text-sm font-medium text-gray-700 mb-1">
                      Nom du package <span className="text-red-500">*</span>
                    </label>
                    <Input 
                      id="packageName"
                      value={packageName}
                      onChange={(e) => setPackageName(e.target.value)}
                      placeholder="MonPackage"
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Le nom doit être unique et ne contenir que des lettres, chiffres, points, tirets et underscores.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="packageVersion" className="block text-sm font-medium text-gray-700 mb-1">
                        Version
                      </label>
                      <Input 
                        id="packageVersion"
                        value={packageVersion}
                        onChange={(e) => setPackageVersion(e.target.value)}
                        placeholder="1.0.0"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="packageCategory" className="block text-sm font-medium text-gray-700 mb-1">
                        Catégorie
                      </label>
                      <Select 
                        value={packageCategory} 
                        onValueChange={setPackageCategory}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                          {packageCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="packageDescription" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <Textarea 
                      id="packageDescription"
                      value={packageDescription}
                      onChange={(e) => setPackageDescription(e.target.value)}
                      placeholder="Décrivez votre package et ses fonctionnalités"
                      className="w-full h-24"
                    />
                  </div>
                </div>
                
                <h3 className="font-poppins font-semibold text-lg mb-3">Code du package</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Écrivez votre code nekoScript ci-dessous. Utilisez <code className="text-pink-600">nekModule</code> pour 
                  rendre vos fonctions accessibles aux utilisateurs.
                </p>
                
                <Textarea 
                  value={packageCode}
                  onChange={(e) => setPackageCode(e.target.value)}
                  className="w-full min-h-[300px] font-mono text-sm"
                />
                
                <div className="mt-6">
                  <Button
                    onClick={publishPackage}
                    disabled={publishStatus === "publishing"}
                    className="bg-neko-primary hover:bg-neko-primary/90"
                  >
                    {publishStatus === "publishing" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Publication en cours...
                      </>
                    ) : publishStatus === "success" ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Publié avec succès
                      </>
                    ) : publishStatus === "error" ? (
                      <>
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Erreur, réessayer
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Publier le package
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              {cliOutput && (
                <div className="bg-white rounded-lg shadow-sm p-8">
                  <h3 className="font-poppins font-semibold text-lg mb-4">Résultat de la publication</h3>
                  <Terminal>
                    <TerminalLine prompt>
                      neko-script publier {packageName} "{packageDescription}"
                    </TerminalLine>
                    {cliOutput.split('\n').map((line, index) => (
                      <TerminalLine key={index} success={line.startsWith('✓')}>
                        {line}
                      </TerminalLine>
                    ))}
                  </Terminal>
                </div>
              )}
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <h2 className="font-poppins font-semibold text-xl mb-4">Guide de publication</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-800 mb-1">Bonnes pratiques</h3>
                    <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
                      <li>Donnez un nom descriptif à votre package</li>
                      <li>Incluez une documentation claire dans le code</li>
                      <li>Testez votre package avant de le publier</li>
                      <li>Utilisez nekModule pour encapsuler votre code</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-800 mb-1">Structure recommandée</h3>
                    <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
                      <li>Déclaration du module</li>
                      <li>Constantes et variables</li>
                      <li>Fonctions utilitaires</li>
                      <li>Fonctions principales exportées</li>
                    </ul>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="font-medium text-gray-800 mb-1">Après la publication</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Les autres développeurs pourront installer votre package avec:
                    </p>
                    <div className="bg-gray-100 p-2 rounded font-mono text-xs">
                      neko-script librairie {packageName || "MonPackage"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PublishPackagePage;