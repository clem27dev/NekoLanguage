import React, { useState } from "react";
import { Link } from "wouter";
import PackageCard from "./package-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, packageCategories } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

const PackageRegistrySection: React.FC = () => {
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
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row justify-between items-start mb-10">
          <div>
            <h2 className="font-poppins font-bold text-3xl mb-4">Bibliothèques populaires</h2>
            <p className="text-gray-600 mb-6">
              Découvrez et utilisez des bibliothèques créées par la communauté nekoScript.
            </p>
          </div>
          
          <div className="w-full lg:w-auto mt-4 lg:mt-0">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="text"
                placeholder="Rechercher des bibliothèques..."
                className="w-full sm:w-64 py-2 px-4 text-sm rounded-lg border border-gray-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              
              <Select 
                value={category} 
                onValueChange={(value) => setCategory(value === "Tous" ? undefined : value)}
              >
                <SelectTrigger className="py-2 px-4 text-sm rounded-lg border border-gray-300">
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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages && packages.length > 0 ? (
                packages.slice(0, 6).map((pkg) => (
                  <PackageCard key={pkg.id} pkg={pkg} />
                ))
              ) : (
                <div className="col-span-3 text-center py-10">
                  Aucune bibliothèque trouvée.
                </div>
              )}
            </div>
            
            <div className="mt-10 text-center">
              <Link href="/packages">
                <a className="text-neko-primary font-medium hover:underline">
                  Voir toutes les bibliothèques →
                </a>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default PackageRegistrySection;
