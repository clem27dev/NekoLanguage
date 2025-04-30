#!/bin/bash
# Installateur rapide pour nekoScript

echo "🐱 Installation de nekoScript..."

# Télécharger et exécuter le script d'installation complet
curl -fsSL https://raw.githubusercontent.com/clem27dev/NekoLanguage/main/install.sh | bash

# Vérifier l'installation
if command -v neko-script &> /dev/null; then
  echo "Installation réussie! Vous pouvez utiliser nekoScript dès maintenant."
else
  echo "⚠️ Installation incomplète. Essayez d'installer manuellement:"
  echo "git clone https://github.com/clem27dev/NekoLanguage.git && cd NekoLanguage && ./install.sh"
fi
