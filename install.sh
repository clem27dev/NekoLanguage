#!/bin/bash
# install.sh - Script d'installation pour nekoScript

echo "🐱 Installation de nekoScript en cours..."

# Créer le répertoire d'installation
mkdir -p ~/.nekoscript
cd ~/.nekoscript

# Télécharger le code depuis GitHub
if command -v git &> /dev/null; then
  git clone https://github.com/clem27dev/NekoLanguage.git .
else
  echo "Git n'est pas installé. Téléchargement via curl..."
  curl -L https://github.com/clem27dev/NekoLanguage/archive/main.tar.gz | tar xz --strip-components=1
fi

# Installer les dépendances
if command -v npm &> /dev/null; then
  npm install --production
else
  echo "⚠️ npm n'est pas installé. Veuillez installer Node.js pour utiliser nekoScript."
  exit 1
fi

# Créer le répertoire bin et copier les exécutables
mkdir -p ~/.nekoscript/bin
cat > ~/.nekoscript/bin/neko-script << 'EOF'
#!/usr/bin/env node
require('../cli.js');
EOF
chmod +x ~/.nekoscript/bin/neko-script

# Ajouter au PATH si ce n'est pas déjà fait
if [[ ":$PATH:" != *":$HOME/.nekoscript/bin:"* ]]; then
  echo 'export PATH="$PATH:$HOME/.nekoscript/bin"' >> ~/.bashrc
  echo 'export PATH="$PATH:$HOME/.nekoscript/bin"' >> ~/.zshrc
  
  # Pour l'utilisation immédiate
  export PATH="$PATH:$HOME/.nekoscript/bin"
fi

echo "✅ nekoScript a été installé avec succès!"
echo "Vous pouvez maintenant utiliser 'neko-script' dans votre terminal."
echo "Essayez 'neko-script aide' pour voir les commandes disponibles."
