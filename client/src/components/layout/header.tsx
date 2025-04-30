import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();

  const menuItems = [
    { label: "Accueil", path: "/" },
    { label: "Playground", path: "/playground" },
    { label: "Documentation", path: "/documentation" },
    { label: "Bibliothèques", path: "/packages" },
    { label: "Publier", path: "/publish" },
    { label: "Communauté", path: "/community" },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-neko-primary text-3xl">🐱</span>
          <span className="font-poppins font-bold text-xl text-neko-dark">nekoScript</span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {menuItems.map((item) => (
            <Link 
              key={item.path}
              href={item.path} 
              className={`font-medium transition-colors ${
                location === item.path 
                  ? "text-neko-primary" 
                  : "hover:text-neko-primary"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Input 
              type="text" 
              placeholder="Rechercher des packages..." 
              className="w-64 py-2 px-4 text-sm rounded-full border border-gray-300 focus:outline-none focus:border-neko-primary"
            />
            <button className="absolute right-3 top-2 text-gray-400 hover:text-neko-primary">
              <Search size={16} />
            </button>
          </div>
          <Button className="bg-neko-primary hover:bg-opacity-90 text-white px-4 py-2 rounded-full">
            Connexion
          </Button>
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-gray-500 focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg py-4 px-6 absolute w-full z-50">
          <div className="flex flex-col space-y-4">
            {menuItems.map((item) => (
              <Link 
                key={item.path}
                href={item.path} 
                className={`font-medium transition-colors ${
                  location === item.path 
                    ? "text-neko-primary" 
                    : "hover:text-neko-primary"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="relative pt-2">
              <Input 
                type="text" 
                placeholder="Rechercher des packages..." 
                className="w-full py-2 px-4 text-sm rounded-full border border-gray-300 focus:outline-none focus:border-neko-primary"
              />
              <button className="absolute right-3 top-4 text-gray-400 hover:text-neko-primary">
                <Search size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
