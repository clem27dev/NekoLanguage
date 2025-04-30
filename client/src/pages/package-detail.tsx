import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import CodeBlock from "@/components/ui/code-block";
import Terminal, { TerminalLine } from "@/components/ui/terminal";
import { Button } from "@/components/ui/button";
import { Package } from "@shared/schema";
import { FaDownload, FaStar, FaCalendarAlt, FaCode } from "react-icons/fa";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

const PackageDetailPage: React.FC = () => {
  const [, params] = useRoute("/packages/:id");
  const packageId = params?.id ? parseInt(params.id, 10) : undefined;
  const [isInstalling, setIsInstalling] = useState(false);
  const [installResult, setInstallResult] = useState<string | null>(null);

  const { data: pkg, isLoading, error } = useQuery<Package>({
    queryKey: [`/api/packages/${packageId}`],
    queryFn: async () => {
      if (!packageId) throw new Error("ID de package invalide");
      return fetch(`/api/packages/${packageId}`).then(res => res.json());
    },
    enabled: !!packageId
  });

  const handleInstall = async () => {
    if (!pkg) return;
    
    setIsInstalling(true);
    try {
      const response = await apiRequest("POST", "/api/cli", { 
        command: `neko-script librairie ${pkg.name}` 
      });
      const data = await response.json();
      setInstallResult(data.result);
      
      // Increment download count
      await apiRequest("PUT", `/api/packages/${pkg.id}/download`, {});
      
      // Invalidate package query to update the download count
      queryClient.invalidateQueries({ queryKey: [`/api/packages/${pkg.id}`] });
    } catch (error) {
      console.error("Error installing package:", error);
      setInstallResult("Erreur lors de l'installation");
    } finally {
      setIsInstalling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow py-16">
          <div className="container mx-auto px-4">
            <div className="text-center py-20">Chargement des détails du package...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow py-16">
          <div className="container mx-auto px-4">
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <p className="text-red-500 font-bold mb-2">Erreur lors du chargement du package</p>
              <p className="text-gray-600">Package introuvable ou ID invalide</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <div className="flex flex-col lg:flex-row justify-between">
              <div className="mb-6 lg:mb-0">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="font-poppins font-bold text-3xl">{pkg.name}</h1>
                  <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">v{pkg.version}</span>
                </div>
                <p className="text-gray-600 mb-4 max-w-2xl">{pkg.description}</p>
                
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-1 text-gray-500">
                    <FaDownload /> <span>{pkg.downloadCount} téléchargements</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <FaStar /> <span>{pkg.stars}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <FaCalendarAlt /> <span>Publié le {formatDate(pkg.publishedAt)}</span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Installation</h3>
                  <Terminal className="mb-4">
                    <TerminalLine prompt>neko-script librairie {pkg.name}</TerminalLine>
                    {installResult && (
                      <TerminalLine success={!installResult.includes("Erreur")} error={installResult.includes("Erreur")}>
                        {installResult}
                      </TerminalLine>
                    )}
                  </Terminal>
                  
                  <Button 
                    onClick={handleInstall} 
                    disabled={isInstalling}
                    className="bg-neko-primary hover:bg-opacity-90 text-white"
                  >
                    {isInstalling ? "Installation..." : "Installer"}
                  </Button>
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg w-full lg:w-64">
                <h3 className="font-semibold mb-4">Informations</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-500">Auteur</div>
                    <div className="font-medium">@{pkg.author}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Catégorie</div>
                    <div className="font-medium">{pkg.category}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Date de publication</div>
                    <div className="font-medium">{formatDate(pkg.publishedAt)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Dernière mise à jour</div>
                    <div className="font-medium">{formatDate(pkg.createdAt)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center gap-2 mb-4">
              <FaCode className="text-neko-primary" />
              <h2 className="font-poppins font-semibold text-xl">Code source</h2>
            </div>
            
            <CodeBlock className="mb-4">
              <pre>{pkg.code}</pre>
            </CodeBlock>
            
            <div className="mt-8">
              <h3 className="font-semibold mb-4">Comment utiliser</h3>
              <CodeBlock className="mb-4">
                <pre>
                  {`// Importer la bibliothèque
nekImporter ${pkg.name.split('.')[0]} depuis "${pkg.name}";

// Utiliser les fonctionnalités
// Consultez la documentation pour plus d'informations`}
                </pre>
              </CodeBlock>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PackageDetailPage;
