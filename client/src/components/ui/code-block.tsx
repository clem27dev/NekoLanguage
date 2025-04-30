import React from "react";

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ children, className }) => {
  return (
    <div className={`relative rounded-lg p-4 bg-neko-dark text-neko-light font-code overflow-x-auto ${className}`}>
      {children}
    </div>
  );
};

// Predefined syntax highlighting classes
export const CodeComment: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-neko-gray">{children}</span>
);

export const CodeKeyword: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-neko-primary">{children}</span>
);

export const CodeFunction: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-neko-secondary">{children}</span>
);

export const CodeString: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-neko-accent">{children}</span>
);

export const CodeNumber: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-pink-400">{children}</span>
);

export default CodeBlock;
