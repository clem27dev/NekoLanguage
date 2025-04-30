import React, { useState } from "react";
import { Link } from "wouter";
import Terminal, { TerminalLine } from "./ui/terminal";
import { apiRequest } from "@/lib/queryClient";

const HeroSection: React.FC = () => {
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const executeCommand = async (command: string) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/cli", { command });
      const data = await response.json();
      setTerminalOutput(prev => [...prev, data.result]);
    } catch (error) {
      console.error("Error executing command:", error);
      setTerminalOutput(prev => [...prev, "Erreur lors de l'exécution de la commande"]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-gradient-to-br from-neko-dark to-neko-primary text-white py-20">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-10 md:mb-0">
          <h1 className="font-poppins font-bold text-4xl md:text-5xl mb-6">
            Programmez en français avec <span className="text-neko-accent">nekoScript</span> 🐱
          </h1>
          <p className="text-xl mb-8 opacity-90">
            Un langage simple, créatif et modulable pour créer des sites web, des jeux et des bots Discord.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/documentation">
              <button className="bg-neko-accent text-neko-dark px-6 py-3 rounded-full font-medium hover:bg-opacity-90 transition-colors text-center w-full sm:w-auto">
                Commencer maintenant
              </button>
            </Link>
            <Link href="/documentation">
              <button className="bg-transparent border border-white px-6 py-3 rounded-full font-medium hover:bg-white hover:text-neko-primary transition-colors text-center w-full sm:w-auto">
                Voir la documentation
              </button>
            </Link>
          </div>
        </div>
        
        <div className="md:w-1/2">
          <Terminal className="w-full">
            <TerminalLine prompt>neko-script télécharger</TerminalLine>
            <TerminalLine success>✓ nekoScript installé avec succès!</TerminalLine>
            <TerminalLine prompt>touch mon-projet.neko</TerminalLine>
            <TerminalLine prompt>neko-script librairie Discord.neko</TerminalLine>
            <TerminalLine success>✓ Bibliothèque Discord.neko téléchargée!</TerminalLine>
            <TerminalLine prompt>neko-script exécuter mon-projet.neko</TerminalLine>
            
            {terminalOutput.map((output, index) => (
              <TerminalLine key={index} success={!output.includes("Erreur")} error={output.includes("Erreur")}>
                {output}
              </TerminalLine>
            ))}
            
            {isLoading && <TerminalLine>Chargement...</TerminalLine>}
          </Terminal>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
