import React, { useState } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import CodeEditor from "@/components/ui/code-editor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CodeBlock, { 
  CodeComment, 
  CodeKeyword, 
  CodeFunction, 
  CodeString, 
  CodeNumber 
} from "@/components/ui/code-block";

// Exemples de code prédéfinis
const codeExamples = [
  {
    id: "hello-world",
    title: "Bonjour Monde",
    code: `// Un simple programme "Bonjour, monde!"
nekVariable message = "Bonjour, monde!";
nekAfficher(message);

// Avec une condition
nekSi (message.longueur() > 5) {
  nekAfficher("C'est un message assez long!");
} nekSinon {
  nekAfficher("Message court");
}`
  },
  {
    id: "variables",
    title: "Variables et calculs",
    code: `// Définir des variables
nekVariable nombre1 = 10;
nekVariable nombre2 = 5;
nekVariable texte = "Le résultat est: ";

// Faire un calcul
nekVariable somme = nombre1 + nombre2;
nekVariable produit = nombre1 * nombre2;

// Afficher les résultats
nekAfficher(texte + somme);
nekAfficher("Le produit est: " + produit);`
  },
  {
    id: "loop",
    title: "Boucles",
    code: `// Exemple de boucle nekPour
nekAfficher("-- Boucle nekPour --");
nekPour (nekVariable i = 0; i < 5; i++) {
  nekAfficher("Itération " + i);
}

// Exemple de boucle nekTantQue
nekAfficher("-- Boucle nekTantQue --");
nekVariable compteur = 0;
nekTantQue (compteur < 3) {
  nekAfficher("Compteur: " + compteur);
  compteur = compteur + 1;
}`
  },
  {
    id: "function",
    title: "Fonctions",
    code: `// Définition d'une fonction
nekFonction calculerSomme(a, b) {
  nekRetourner a + b;
}

// Utilisation de la fonction
nekVariable resultat = calculerSomme(5, 3);
nekAfficher("La somme est: " + resultat);

// Fonction avec condition
nekFonction estPair(nombre) {
  nekSi (nombre % 2 == 0) {
    nekRetourner vrai;
  } nekSinon {
    nekRetourner faux;
  }
}

nekAfficher("10 est pair: " + estPair(10));
nekAfficher("7 est pair: " + estPair(7));`
  }
];

const PlaygroundPage: React.FC = () => {
  const [selectedExample, setSelectedExample] = useState(codeExamples[0]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="font-poppins font-bold text-4xl mb-4">Playground nekoScript</h1>
            <p className="text-gray-600 max-w-2xl mb-8">
              Testez le langage nekoScript directement dans votre navigateur ! Écrivez votre code, exécutez-le et voyez le résultat instantanément.
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3">
                <CodeEditor 
                  defaultCode={selectedExample.code} 
                  className="mb-8" 
                />
                
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                  <h2 className="font-poppins font-semibold text-xl mb-4">Guide rapide</h2>
                  <p className="text-gray-600 mb-4">
                    nekoScript est un langage de programmation en français avec une syntaxe simple et intuitive.
                    Tous les mots-clés et fonctions commencent par le préfixe "nek".
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium mb-2">Fonctions principales</h3>
                      <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
                        <li><code className="text-neko-primary font-code">nekAfficher(message)</code> - Affiche un message</li>
                        <li><code className="text-neko-primary font-code">nekVariable nom = valeur</code> - Déclare une variable</li>
                        <li><code className="text-neko-primary font-code">nekFonction nom(params) {"{...}"}</code> - Déclare une fonction</li>
                        <li><code className="text-neko-primary font-code">nekRetourner valeur</code> - Retourne une valeur</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Structures de contrôle</h3>
                      <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
                        <li><code className="text-neko-primary font-code">nekSi (condition) {"{...}"}</code> - Condition if</li>
                        <li><code className="text-neko-primary font-code">nekSinon {"{...}"}</code> - Condition else</li>
                        <li><code className="text-neko-primary font-code">nekPour (init; cond; incr) {"{...}"}</code> - Boucle for</li>
                        <li><code className="text-neko-primary font-code">nekTantQue (condition) {"{...}"}</code> - Boucle while</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                  <h2 className="font-poppins font-semibold text-xl mb-4">Exemples</h2>
                  <div className="space-y-2">
                    {codeExamples.map(example => (
                      <button
                        key={example.id}
                        className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedExample.id === example.id
                            ? "bg-neko-primary text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                        onClick={() => setSelectedExample(example)}
                      >
                        {example.title}
                      </button>
                    ))}
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

export default PlaygroundPage;