import React from "react";
import { Link } from "wouter";
import CodeBlock, { CodeComment, CodeKeyword } from "./ui/code-block";
import Terminal, { TerminalLine } from "./ui/terminal";

const PublicationSection: React.FC = () => {
  return (
    <section className="py-16 bg-neko-light">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-poppins font-bold text-3xl text-center mb-6">
            Publiez vos propres bibliothèques
          </h2>
          <p className="text-gray-600 text-center mb-10">
            Créez et partagez vos bibliothèques nekoScript avec la communauté en quelques étapes simples.
          </p>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="font-poppins font-semibold text-xl mb-4">Comment publier une bibliothèque</h3>
            
            <ol className="space-y-6">
              <li className="flex gap-4">
                <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-neko-primary text-white font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Créez votre bibliothèque</h4>
                  <CodeBlock className="text-sm">
                    <pre>
                      <CodeComment>// MonLib.neko</CodeComment>
                      <br />
                      <CodeKeyword>nekModule</CodeKeyword> MonLib {"{"}
                      <br />
                      {"  "}<CodeKeyword>nekFonction</CodeKeyword> maFonction(param) {"{"}
                      <br />
                      {"    "}<CodeKeyword>nekRetourner</CodeKeyword> "Résultat: " + param;
                      <br />
                      {"  "}{"}"} 
                      <br />
                      {"}"}
                    </pre>
                  </CodeBlock>
                </div>
              </li>
              
              <li className="flex gap-4">
                <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-neko-primary text-white font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Testez localement</h4>
                  <Terminal className="text-sm">
                    <TerminalLine prompt>neko-script tester MonLib.neko</TerminalLine>
                  </Terminal>
                </div>
              </li>
              
              <li className="flex gap-4">
                <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-neko-primary text-white font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Publiez votre bibliothèque</h4>
                  <Terminal className="text-sm">
                    <TerminalLine prompt>neko-script publish MonLib.neko</TerminalLine>
                    <TerminalLine success>✓ Bibliothèque MonLib.neko publiée avec succès!</TerminalLine>
                  </Terminal>
                </div>
              </li>
            </ol>
          </div>
          
          <div className="text-center">
            <Link href="/documentation">
              <a className="bg-neko-primary text-white px-6 py-3 rounded-full font-medium hover:bg-opacity-90 transition-colors">
                Commencer à publier
              </a>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PublicationSection;
