import React from "react";
import { Link } from "wouter";
import { FaGithub, FaDiscord, FaTwitter } from "react-icons/fa";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-8 md:mb-0">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-neko-primary text-2xl">🐱</span>
              <span className="font-poppins font-bold text-lg text-neko-dark">nekoScript</span>
            </div>
            <p className="text-gray-600 max-w-xs">
              Un langage de programmation en français, simple et accessible pour tous les développeurs.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-poppins font-semibold mb-4">Produit</h4>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-600 hover:text-neko-primary">Télécharger</Link></li>
                <li><Link href="/" className="text-gray-600 hover:text-neko-primary">Fonctionnalités</Link></li>
                <li><Link href="/" className="text-gray-600 hover:text-neko-primary">Feuille de route</Link></li>
                <li><Link href="/" className="text-gray-600 hover:text-neko-primary">Statut</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-poppins font-semibold mb-4">Ressources</h4>
              <ul className="space-y-2">
                <li><Link href="/documentation" className="text-gray-600 hover:text-neko-primary">Documentation</Link></li>
                <li><Link href="/documentation" className="text-gray-600 hover:text-neko-primary">Tutoriels</Link></li>
                <li><Link href="/packages" className="text-gray-600 hover:text-neko-primary">Bibliothèques</Link></li>
                <li><Link href="/" className="text-gray-600 hover:text-neko-primary">Blog</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-poppins font-semibold mb-4">Communauté</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-neko-primary">Discord</a></li>
                <li><a href="#" className="text-gray-600 hover:text-neko-primary">GitHub</a></li>
                <li><a href="#" className="text-gray-600 hover:text-neko-primary">Twitter</a></li>
                <li><a href="#" className="text-gray-600 hover:text-neko-primary">Forum</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-poppins font-semibold mb-4">Légal</h4>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-600 hover:text-neko-primary">Conditions</Link></li>
                <li><Link href="/" className="text-gray-600 hover:text-neko-primary">Confidentialité</Link></li>
                <li><Link href="/" className="text-gray-600 hover:text-neko-primary">Licences</Link></li>
                <li><Link href="/" className="text-gray-600 hover:text-neko-primary">Contact</Link></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 mb-4 md:mb-0">© {currentYear} nekoScript. Tous droits réservés.</p>
          
          <div className="flex items-center gap-4">
            <a href="#" className="text-gray-500 hover:text-neko-primary">
              <FaGithub className="text-xl" />
            </a>
            <a href="#" className="text-gray-500 hover:text-neko-primary">
              <FaDiscord className="text-xl" />
            </a>
            <a href="#" className="text-gray-500 hover:text-neko-primary">
              <FaTwitter className="text-xl" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
