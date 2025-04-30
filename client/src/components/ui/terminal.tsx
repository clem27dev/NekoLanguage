import React from "react";

interface TerminalProps {
  className?: string;
  children: React.ReactNode;
}

const Terminal: React.FC<TerminalProps> = ({ className, children }) => {
  return (
    <div className={`bg-neko-dark text-neko-light rounded-lg p-4 font-code ${className}`}>
      {children}
    </div>
  );
};

interface TerminalLineProps {
  prompt?: boolean;
  success?: boolean;
  error?: boolean;
  children: React.ReactNode;
}

export const TerminalLine: React.FC<TerminalLineProps> = ({ 
  prompt = false, 
  success = false,
  error = false,
  children 
}) => {
  return (
    <div className="flex items-center line-clamp-1">
      {prompt && <span className="text-neko-secondary mr-2">$</span>}
      <span className={`
        ${success ? "text-green-400" : ""}
        ${error ? "text-red-400" : ""}
      `}>
        {children}
      </span>
    </div>
  );
};

export default Terminal;
