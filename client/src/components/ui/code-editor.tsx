import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import Terminal, { TerminalLine } from "@/components/ui/terminal";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { Play, Copy, Trash } from "lucide-react";

interface CodeEditorProps {
  defaultCode?: string;
  className?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  defaultCode = '// Mon code nekoScript\nnekVariable message = "Bonjour, monde!";\nnekAfficher(message);', 
  className 
}) => {
  const [code, setCode] = useState(defaultCode);
  const [output, setOutput] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    setIsExecuting(true);
    setError(null);
    setOutput(null);
    
    try {
      const response = await apiRequest("POST", "/api/interpreter", { code });
      const data = await response.json();
      setOutput(data.result);
    } catch (err: any) {
      console.error("Error executing code:", err);
      setError(err?.error?.message || "Erreur lors de l'exécution du code");
    } finally {
      setIsExecuting(false);
    }
  };

  const handleClear = () => {
    setCode("");
    setOutput(null);
    setError(null);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className={`rounded-lg bg-gray-50 border border-gray-200 overflow-hidden ${className}`}>
      <div className="flex items-center justify-between bg-gray-100 px-4 py-2 border-b border-gray-200">
        <span className="text-sm font-medium text-gray-700">Éditeur nekoScript</span>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleCopy} 
            title="Copier le code"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleClear} 
            title="Effacer le code"
          >
            <Trash className="h-4 w-4" />
          </Button>
          <Button 
            onClick={handleRun} 
            disabled={isExecuting} 
            className="bg-neko-primary hover:bg-neko-primary/90 text-white"
          >
            <Play className="h-4 w-4 mr-2" />
            Exécuter
          </Button>
        </div>
      </div>
      
      <Textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="font-code border-0 rounded-none min-h-[300px] resize-none p-4 focus-visible:ring-0 focus-visible:ring-offset-0"
        placeholder="Écrivez votre code nekoScript ici..."
      />
      
      <div className="border-t border-gray-200">
        <div className="bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
          Résultat
        </div>
        <Terminal className="rounded-none rounded-b-lg border-0 min-h-[120px] max-h-[200px] overflow-auto">
          {isExecuting && <TerminalLine>Exécution en cours...</TerminalLine>}
          {output && <TerminalLine success>{output}</TerminalLine>}
          {error && <TerminalLine error>{error}</TerminalLine>}
          {!isExecuting && !output && !error && (
            <div className="text-gray-500">
              Le résultat de l'exécution s'affichera ici.
            </div>
          )}
        </Terminal>
      </div>
    </div>
  );
};

export default CodeEditor;