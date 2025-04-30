import React from "react";
import CodeBlock, { 
  CodeComment, 
  CodeKeyword, 
  CodeFunction, 
  CodeString, 
  CodeNumber 
} from "./ui/code-block";

const CodeExamplesSection: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="font-poppins font-bold text-3xl text-center mb-12">
          Exemples de code nekoScript
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Example 1 */}
          <div>
            <h3 className="font-poppins font-semibold text-xl mb-4">Un simple "Bonjour, monde!"</h3>
            <CodeBlock>
              <pre>
                <CodeComment>// Mon premier programme en nekoScript</CodeComment>
                <br />
                <CodeKeyword>nekVariable</CodeKeyword> message = <CodeString>"Bonjour, monde!"</CodeString>;
                <br />
                <CodeFunction>nekAfficher</CodeFunction>(message);
                <br />
                <br />
                <CodeComment>// Avec une condition</CodeComment>
                <br />
                <CodeKeyword>nekSi</CodeKeyword> (message.<CodeFunction>longueur</CodeFunction>() {">"} <CodeNumber>5</CodeNumber>) {"{"}
                <br />
                {"  "}<CodeFunction>nekAfficher</CodeFunction>(<CodeString>"C'est un message assez long!"</CodeString>);
                <br />
                {"}"} <CodeKeyword>nekSinon</CodeKeyword> {"{"}
                <br />
                {"  "}<CodeFunction>nekAfficher</CodeFunction>(<CodeString>"Message court"</CodeString>);
                <br />
                {"}"}
              </pre>
            </CodeBlock>
          </div>
          
          {/* Example 2 */}
          <div>
            <h3 className="font-poppins font-semibold text-xl mb-4">Création d'un bot Discord</h3>
            <CodeBlock>
              <pre>
                <CodeComment>// Importer la bibliothèque Discord.neko</CodeComment>
                <br />
                <CodeKeyword>nekImporter</CodeKeyword> Discord <CodeKeyword>depuis</CodeKeyword> <CodeString>"Discord.neko"</CodeString>;
                <br />
                <br />
                <CodeComment>// Créer une instance du bot</CodeComment>
                <br />
                <CodeKeyword>nekVariable</CodeKeyword> bot = <CodeKeyword>nekNouveau</CodeKeyword> Discord.<CodeFunction>Bot</CodeFunction>(<CodeString>"TOKEN_SECRET"</CodeString>);
                <br />
                <br />
                <CodeComment>// Répondre aux messages</CodeComment>
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
        </div>
        
        <div className="mt-12">
          <h3 className="font-poppins font-semibold text-xl mb-4">Création d'un petit jeu</h3>
          <CodeBlock>
            <pre>
              <CodeComment>// Importer la bibliothèque de jeu</CodeComment>
              <br />
              <CodeKeyword>nekImporter</CodeKeyword> NekoJeu <CodeKeyword>depuis</CodeKeyword> <CodeString>"NekoJeu.neko"</CodeString>;
              <br />
              <br />
              <CodeComment>// Créer un canvas de jeu</CodeComment>
              <br />
              <CodeKeyword>nekVariable</CodeKeyword> jeu = <CodeKeyword>nekNouveau</CodeKeyword> NekoJeu.<CodeFunction>Canvas</CodeFunction>(<CodeNumber>800</CodeNumber>, <CodeNumber>600</CodeNumber>, <CodeString>"Mon Jeu"</CodeString>);
              <br />
              <br />
              <CodeComment>// Créer un joueur</CodeComment>
              <br />
              <CodeKeyword>nekVariable</CodeKeyword> joueur = jeu.<CodeFunction>créerSprite</CodeFunction>(<CodeString>"chat.png"</CodeString>, <CodeNumber>100</CodeNumber>, <CodeNumber>100</CodeNumber>);
              <br />
              <br />
              <CodeComment>// Déplacer le joueur avec les touches</CodeComment>
              <br />
              jeu.<CodeFunction>surTouche</CodeFunction>(<CodeString>"ArrowUp"</CodeString>, <CodeKeyword>nekFonction</CodeKeyword>() {"{"}
              <br />
              {"  "}joueur.<CodeFunction>nekBouger</CodeFunction>(<CodeNumber>0</CodeNumber>, -<CodeNumber>5</CodeNumber>);
              <br />
              {"}"});
              <br />
              <br />
              jeu.<CodeFunction>surTouche</CodeFunction>(<CodeString>"ArrowDown"</CodeString>, <CodeKeyword>nekFonction</CodeKeyword>() {"{"}
              <br />
              {"  "}joueur.<CodeFunction>nekBouger</CodeFunction>(<CodeNumber>0</CodeNumber>, <CodeNumber>5</CodeNumber>);
              <br />
              {"}"});
              <br />
              <br />
              jeu.<CodeFunction>démarrer</CodeFunction>();
            </pre>
          </CodeBlock>
        </div>
      </div>
    </section>
  );
};

export default CodeExamplesSection;
