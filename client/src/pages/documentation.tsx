import React from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import CodeBlock, { 
  CodeComment, 
  CodeKeyword, 
  CodeFunction, 
  CodeString, 
  CodeNumber 
} from "@/components/ui/code-block";
import Terminal, { TerminalLine } from "@/components/ui/terminal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaBook, FaCode, FaTerminal, FaBoxOpen } from "react-icons/fa";

const DocumentationPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="font-poppins font-bold text-4xl mb-4">Documentation nekoScript</h1>
            <p className="text-gray-600 max-w-2xl">
              Apprenez à utiliser nekoScript, un langage de programmation en français simple et puissant pour créer des sites web, des jeux et des bots Discord.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <Tabs defaultValue="introduction">
              <TabsList className="grid grid-cols-1 md:grid-cols-4 mb-8">
                <TabsTrigger value="introduction" className="flex items-center gap-2">
                  <FaBook /> Introduction
                </TabsTrigger>
                <TabsTrigger value="syntax" className="flex items-center gap-2">
                  <FaCode /> Syntaxe
                </TabsTrigger>
                <TabsTrigger value="cli" className="flex items-center gap-2">
                  <FaTerminal /> Commandes CLI
                </TabsTrigger>
                <TabsTrigger value="libs" className="flex items-center gap-2">
                  <FaBoxOpen /> Bibliothèques
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="introduction">
                <h2 className="font-poppins font-semibold text-2xl mb-4">Introduction à nekoScript</h2>
                <p className="text-gray-600 mb-4">
                  nekoScript est un langage de programmation basé sur le français, conçu pour être accessible et intuitif.
                  Il permet de créer des applications web, des jeux et des bots Discord grâce à un écosystème riche
                  de bibliothèques.
                </p>
                
                <h3 className="font-poppins font-semibold text-xl mt-8 mb-4">Installation</h3>
                <Terminal className="mb-4">
                  <TerminalLine prompt>neko-script télécharger</TerminalLine>
                  <TerminalLine success>✓ nekoScript installé avec succès!</TerminalLine>
                </Terminal>
                
                <h3 className="font-poppins font-semibold text-xl mt-8 mb-4">Votre premier programme</h3>
                <p className="text-gray-600 mb-4">
                  Créez un fichier <code>bonjour.neko</code> avec le contenu suivant:
                </p>
                
                <CodeBlock className="mb-6">
                  <pre>
                    <CodeComment>// Mon premier programme en nekoScript</CodeComment>
                    <br />
                    <CodeKeyword>nekVariable</CodeKeyword> message = <CodeString>"Bonjour, monde!"</CodeString>;
                    <br />
                    <CodeFunction>nekAfficher</CodeFunction>(message);
                  </pre>
                </CodeBlock>
                
                <p className="text-gray-600 mb-4">
                  Exécutez votre programme avec:
                </p>
                
                <Terminal className="mb-4">
                  <TerminalLine prompt>neko-script exécuter bonjour.neko</TerminalLine>
                  <TerminalLine>Bonjour, monde!</TerminalLine>
                </Terminal>
              </TabsContent>
              
              <TabsContent value="syntax">
                <h2 className="font-poppins font-semibold text-2xl mb-4">Syntaxe de base</h2>
                
                <h3 className="font-poppins font-semibold text-xl mt-6 mb-3">Variables</h3>
                <CodeBlock className="mb-4">
                  <pre>
                    <CodeKeyword>nekVariable</CodeKeyword> nom = <CodeString>"Chat"</CodeString>;
                    <br />
                    <CodeKeyword>nekVariable</CodeKeyword> age = <CodeNumber>3</CodeNumber>;
                    <br />
                    <CodeKeyword>nekVariable</CodeKeyword> estMignon = <CodeKeyword>vrai</CodeKeyword>;
                  </pre>
                </CodeBlock>
                
                <h3 className="font-poppins font-semibold text-xl mt-6 mb-3">Conditions</h3>
                <CodeBlock className="mb-4">
                  <pre>
                    <CodeKeyword>nekSi</CodeKeyword> (age {">"} <CodeNumber>2</CodeNumber>) {"{"}
                    <br />
                    {"  "}<CodeFunction>nekAfficher</CodeFunction>(<CodeString>"C'est un chat adulte"</CodeString>);
                    <br />
                    {"}"} <CodeKeyword>nekSinon</CodeKeyword> {"{"}
                    <br />
                    {"  "}<CodeFunction>nekAfficher</CodeFunction>(<CodeString>"C'est un chaton"</CodeString>);
                    <br />
                    {"}"}
                  </pre>
                </CodeBlock>
                
                <h3 className="font-poppins font-semibold text-xl mt-6 mb-3">Boucles</h3>
                <CodeBlock className="mb-4">
                  <pre>
                    <CodeComment>// Boucle pour</CodeComment>
                    <br />
                    <CodeKeyword>nekPour</CodeKeyword> (<CodeKeyword>nekVariable</CodeKeyword> i = <CodeNumber>0</CodeNumber>; i {"<"} <CodeNumber>5</CodeNumber>; i++) {"{"}
                    <br />
                    {"  "}<CodeFunction>nekAfficher</CodeFunction>(<CodeString>"Itération "</CodeString> + i);
                    <br />
                    {"}"}
                    <br />
                    <br />
                    <CodeComment>// Boucle tant que</CodeComment>
                    <br />
                    <CodeKeyword>nekVariable</CodeKeyword> j = <CodeNumber>0</CodeNumber>;
                    <br />
                    <CodeKeyword>nekTantQue</CodeKeyword> (j {"<"} <CodeNumber>5</CodeNumber>) {"{"}
                    <br />
                    {"  "}<CodeFunction>nekAfficher</CodeFunction>(<CodeString>"Boucle "</CodeString> + j);
                    <br />
                    {"  "}j++;
                    <br />
                    {"}"}
                  </pre>
                </CodeBlock>
                
                <h3 className="font-poppins font-semibold text-xl mt-6 mb-3">Fonctions</h3>
                <CodeBlock className="mb-4">
                  <pre>
                    <CodeKeyword>nekFonction</CodeKeyword> calculerAge(anneeNaissance) {"{"}
                    <br />
                    {"  "}<CodeKeyword>nekVariable</CodeKeyword> anneeActuelle = <CodeNumber>2023</CodeNumber>;
                    <br />
                    {"  "}<CodeKeyword>nekRetourner</CodeKeyword> anneeActuelle - anneeNaissance;
                    <br />
                    {"}"}
                    <br />
                    <br />
                    <CodeKeyword>nekVariable</CodeKeyword> monAge = <CodeFunction>calculerAge</CodeFunction>(<CodeNumber>1990</CodeNumber>);
                    <br />
                    <CodeFunction>nekAfficher</CodeFunction>(<CodeString>"J'ai "</CodeString> + monAge + <CodeString>" ans"</CodeString>);
                  </pre>
                </CodeBlock>
                
                <h3 className="font-poppins font-semibold text-xl mt-6 mb-3">Modules et imports</h3>
                <CodeBlock className="mb-4">
                  <pre>
                    <CodeComment>// Définir un module</CodeComment>
                    <br />
                    <CodeKeyword>nekModule</CodeKeyword> MathUtils {"{"}
                    <br />
                    {"  "}<CodeKeyword>nekFonction</CodeKeyword> addition(a, b) {"{"}
                    <br />
                    {"    "}<CodeKeyword>nekRetourner</CodeKeyword> a + b;
                    <br />
                    {"  "}{"}"} 
                    <br />
                    {"  "}
                    <br />
                    {"  "}<CodeKeyword>nekFonction</CodeKeyword> soustraction(a, b) {"{"}
                    <br />
                    {"    "}<CodeKeyword>nekRetourner</CodeKeyword> a - b;
                    <br />
                    {"  "}{"}"} 
                    <br />
                    {"}"}
                    <br />
                    <br />
                    <CodeComment>// Importer un module</CodeComment>
                    <br />
                    <CodeKeyword>nekImporter</CodeKeyword> Discord <CodeKeyword>depuis</CodeKeyword> <CodeString>"Discord.neko"</CodeString>;
                    <br />
                    <CodeKeyword>nekImporter</CodeKeyword> MathUtils; <CodeComment>// Import local</CodeComment>
                  </pre>
                </CodeBlock>
              </TabsContent>
              
              <TabsContent value="cli">
                <h2 className="font-poppins font-semibold text-2xl mb-4">Commandes CLI</h2>
                <p className="text-gray-600 mb-6">
                  La CLI (Command Line Interface) de nekoScript vous permet d'installer, d'exécuter, de gérer des applications persistantes et de publier des bibliothèques.
                </p>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-poppins font-semibold text-xl mb-2">Installation de nekoScript</h3>
                    <Terminal>
                      <TerminalLine prompt>neko-script télécharger</TerminalLine>
                    </Terminal>
                  </div>
                  
                  <div>
                    <h3 className="font-poppins font-semibold text-xl mb-2">Exécuter un programme</h3>
                    <Terminal>
                      <TerminalLine prompt>neko-script exécuter mon-programme.neko</TerminalLine>
                    </Terminal>
                  </div>
                  
                  <div>
                    <h3 className="font-poppins font-semibold text-xl mb-2">Démarrer en mode persistant</h3>
                    <Terminal>
                      <TerminalLine prompt>neko-script démarrer mon-programme.neko</TerminalLine>
                    </Terminal>
                  </div>
                  
                  <div>
                    <h3 className="font-poppins font-semibold text-xl mb-2">Arrêter une application en cours</h3>
                    <Terminal>
                      <TerminalLine prompt>neko-script arrêter 1</TerminalLine>
                      <TerminalLine success>✓ Application arrêtée avec succès</TerminalLine>
                    </Terminal>
                  </div>
                  
                  <div>
                    <h3 className="font-poppins font-semibold text-xl mb-2">Lister les processus actifs</h3>
                    <Terminal>
                      <TerminalLine prompt>neko-script processus</TerminalLine>
                      <TerminalLine>ID: 1 | Nom: mon-jeu | Type: jeu | Démarré: il y a 2 minutes</TerminalLine>
                      <TerminalLine>ID: 2 | Nom: mon-bot | Type: bot | Démarré: il y a 5 minutes</TerminalLine>
                    </Terminal>
                  </div>
                  
                  <div>
                    <h3 className="font-poppins font-semibold text-xl mb-2">Installer une bibliothèque</h3>
                    <Terminal>
                      <TerminalLine prompt>neko-script librairie NomDeLaBibliotheque.neko</TerminalLine>
                    </Terminal>
                  </div>
                  
                  <div>
                    <h3 className="font-poppins font-semibold text-xl mb-2">Publier une bibliothèque</h3>
                    <Terminal>
                      <TerminalLine prompt>neko-script publish MaBibliotheque.neko</TerminalLine>
                    </Terminal>
                  </div>
                  
                  <div>
                    <h3 className="font-poppins font-semibold text-xl mb-2">Tester une bibliothèque</h3>
                    <Terminal>
                      <TerminalLine prompt>neko-script tester MaBibliotheque.neko</TerminalLine>
                    </Terminal>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="libs">
                <h2 className="font-poppins font-semibold text-2xl mb-4">Bibliothèques standard</h2>
                <p className="text-gray-600 mb-6">
                  nekoScript dispose de plusieurs bibliothèques standard pour différents types de projets.
                </p>
                
                <div className="space-y-8">
                  <div>
                    <h3 className="font-poppins font-semibold text-xl mb-4 flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Discord</span>
                      Discord.neko
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Bibliothèque pour créer des bots Discord facilement.
                    </p>
                    <CodeBlock>
                      <pre>
                        <CodeKeyword>nekImporter</CodeKeyword> Discord <CodeKeyword>depuis</CodeKeyword> <CodeString>"Discord.neko"</CodeString>;
                        <br />
                        <br />
                        <CodeKeyword>nekVariable</CodeKeyword> bot = <CodeKeyword>nekNouveau</CodeKeyword> Discord.<CodeFunction>Bot</CodeFunction>(<CodeString>"TOKEN_SECRET"</CodeString>);
                        <br />
                        <br />
                        bot.<CodeFunction>surMessage</CodeFunction>(<CodeKeyword>nekFonction</CodeKeyword>(message) {"{"}
                        <br />
                        {"  "}<CodeKeyword>nekSi</CodeKeyword> (message.<CodeFunction>contenu</CodeFunction>() == <CodeString>"!salut"</CodeString>) {"{"}
                        <br />
                        {"    "}message.<CodeFunction>répondre</CodeFunction>(<CodeString>"Bonjour!"</CodeString>);
                        <br />
                        {"  "}{"}"} 
                        <br />
                        {"}"});
                        <br />
                        <br />
                        bot.<CodeFunction>démarrer</CodeFunction>();
                      </pre>
                    </CodeBlock>
                  </div>
                  
                  <div>
                    <h3 className="font-poppins font-semibold text-xl mb-4 flex items-center gap-2">
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Jeux</span>
                      NekoJeu
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Moteur de jeu 2D simple pour créer des jeux interactifs.
                    </p>
                    <CodeBlock>
                      <pre>
                        <CodeKeyword>nekImporter</CodeKeyword> NekoJeu <CodeKeyword>depuis</CodeKeyword> <CodeString>"NekoJeu.neko"</CodeString>;
                        <br />
                        <br />
                        <CodeKeyword>nekVariable</CodeKeyword> jeu = <CodeKeyword>nekNouveau</CodeKeyword> NekoJeu.<CodeFunction>Canvas</CodeFunction>(<CodeNumber>800</CodeNumber>, <CodeNumber>600</CodeNumber>, <CodeString>"Mon Jeu"</CodeString>);
                        <br />
                        <br />
                        <CodeKeyword>nekVariable</CodeKeyword> joueur = jeu.<CodeFunction>créerSprite</CodeFunction>(<CodeString>"chat.png"</CodeString>, <CodeNumber>100</CodeNumber>, <CodeNumber>100</CodeNumber>);
                        <br />
                        <br />
                        jeu.<CodeFunction>démarrer</CodeFunction>();
                      </pre>
                    </CodeBlock>
                  </div>
                  
                  <div>
                    <h3 className="font-poppins font-semibold text-xl mb-4 flex items-center gap-2">
                      <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">Web</span>
                      NekoWeb
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Framework web pour créer des sites dynamiques avec gestion de routes et templates.
                    </p>
                    <CodeBlock>
                      <pre>
                        <CodeKeyword>nekImporter</CodeKeyword> NekoWeb <CodeKeyword>depuis</CodeKeyword> <CodeString>"NekoWeb.neko"</CodeString>;
                        <br />
                        <br />
                        <CodeKeyword>nekVariable</CodeKeyword> app = <CodeKeyword>nekNouveau</CodeKeyword> NekoWeb.<CodeFunction>Application</CodeFunction>();
                        <br />
                        <br />
                        app.<CodeFunction>definirRoute</CodeFunction>(<CodeString>"/"</CodeString>, <CodeKeyword>nekFonction</CodeKeyword>() {"{"}
                        <br />
                        {"  "}<CodeKeyword>nekRetourner</CodeKeyword> <CodeString>"{"<"}h1{">"}Bienvenue sur mon site!{"</"}h1{">"}</CodeString>;
                        <br />
                        {"}"});
                        <br />
                        <br />
                        app.<CodeFunction>démarrer</CodeFunction>(<CodeNumber>3000</CodeNumber>);
                      </pre>
                    </CodeBlock>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DocumentationPage;
