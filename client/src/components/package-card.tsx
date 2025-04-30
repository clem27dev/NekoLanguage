import React from "react";
import { Link } from "wouter";
import Terminal from "./ui/terminal";
import type { Package } from "@shared/schema";

interface PackageCardProps {
  pkg: Package;
}

const PackageCard: React.FC<PackageCardProps> = ({ pkg }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <Link href={`/packages/${pkg.id}`}>
            <a className="font-poppins font-semibold text-lg hover:text-neko-primary transition-colors">
              {pkg.name}
            </a>
          </Link>
          <p className="text-sm text-gray-500">v{pkg.version} • Publié par @{pkg.author}</p>
        </div>
        
        <CategoryBadge category={pkg.category} />
      </div>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{pkg.description}</p>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">⭐ {pkg.stars}</span>
          <span className="text-xs text-gray-500">⬇️ {formatDownloads(pkg.downloadCount)}/semaine</span>
        </div>
        
        <Terminal className="py-1 px-3 text-xs">
          <code>$neko-script librairie {pkg.name}</code>
        </Terminal>
      </div>
    </div>
  );
};

const CategoryBadge: React.FC<{ category: string }> = ({ category }) => {
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "discord":
        return "bg-blue-100 text-blue-800";
      case "jeux":
        return "bg-green-100 text-green-800";
      case "web":
        return "bg-purple-100 text-purple-800";
      case "base de données":
        return "bg-yellow-100 text-yellow-800";
      case "ui":
        return "bg-pink-100 text-pink-800";
      case "utilitaires":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span className={`${getCategoryColor(category)} text-xs px-2 py-1 rounded-full`}>
      {category}
    </span>
  );
};

const formatDownloads = (downloads: number): string => {
  if (downloads >= 1000) {
    return `${(downloads / 1000).toFixed(0)}k`;
  }
  return downloads.toString();
};

export default PackageCard;
