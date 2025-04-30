import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import PackageCard from "@/components/package-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, packageCategories } from "@shared/schema";

const PackagesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);

  const { data: packages, isLoading } = useQuery<Package[]>({
    queryKey: ["/api/packages", category, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category) params.append("category", category);
      if (searchTerm) params.append("q", searchTerm);
      
      const url = `/api/packages${params.toString() ? `?${params.toString()}` : ""}`;
      return fetch(url).then(res => res.json());
    }
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="font-poppins font-bold text-4xl mb-4">Bibliothèques nekoScript</h1>
            <p className="text-gray-600 max-w-2xl">
              Découvrez et téléchargez des bibliothèques créées par la communauté pour étendre les fonctionnalités de nekoScript.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow">
                <Input
                  type="text"
                  placeholder="Rechercher des bibliothèques..."
                  className="w-full py-2 px-4 text-sm rounded-lg border border-gray-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="w-full md:w-40">
                <Select 
                  value={category} 
                  onValueChange={(value) => setCategory(value === "Tous" ? undefined : value)}
                >
                  <SelectTrigger className="py-2 px-4 text-sm rounded-lg border border-gray-300 w-full">
                    <SelectValue placeholder="Tous" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tous">Tous</SelectItem>
                    {packageCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="text-center py-10">Chargement des bibliothèques...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages && packages.length > 0 ? (
                packages.map((pkg) => (
                  <PackageCard key={pkg.id} pkg={pkg} />
                ))
              ) : (
                <div className="col-span-3 bg-white p-8 rounded-lg text-center">
                  <p className="text-gray-500 mb-2">Aucune bibliothèque trouvée.</p>
                  <p className="text-sm text-gray-400">Essayez de modifier vos critères de recherche.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PackagesPage;
