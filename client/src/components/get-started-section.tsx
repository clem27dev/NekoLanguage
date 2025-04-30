import React, { useState } from "react";
import { Link } from "wouter";
import Terminal, { TerminalLine } from "./ui/terminal";
import { apiRequest } from "@/lib/queryClient";

const GetStartedSection: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [commandResult, setCommandResult] = useState<string | null>(null);
  
  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/cli", { 
        command: "neko-script télécharger" 
      });
      const data = await response.json();
      setCommandResult(data.result);
    } catch (error) {
      console.error("Error executing command:", error);
      setCommandResult("Erreur lors de l'exécution de la commande");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-16 bg-neko-dark text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="font-poppins font-bold text-3xl mb-6">
          Prêt à commencer avec nekoScript?
        </h2>
        <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
          Installez nekoScript et commencez à coder en français dès aujourd'hui. C'est simple, intuitif et amusant!
        </p>
        
        <div className="bg-neko-dark p-6 rounded-lg inline-block mx-auto mb-10">
          <Terminal className="text-left">
            <TerminalLine prompt>neko-script télécharger</TerminalLine>
            {commandResult && (
              <TerminalLine success={!commandResult.includes("Erreur")} error={commandResult.includes("Erreur")}>
                {commandResult}
              </TerminalLine>
            )}
            {isLoading && <TerminalLine>Chargement...</TerminalLine>}
          </Terminal>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={handleDownload}
            disabled={isLoading}
            className="bg-neko-accent text-neko-dark px-6 py-3 rounded-full font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Installation..." : "Guide d'installation"}
          </button>
          <Link href="/playground">
            <a className="bg-neko-secondary text-white px-6 py-3 rounded-full font-medium hover:bg-opacity-90 transition-colors">
              Playground en ligne
            </a>
          </Link>
          <Link href="/documentation">
            <a className="bg-transparent border border-white px-6 py-3 rounded-full font-medium hover:bg-white hover:text-neko-primary transition-colors">
              Tutoriel débutant
            </a>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default GetStartedSection;
