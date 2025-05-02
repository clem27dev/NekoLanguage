#!/bin/bash

# Ce script simplifie le test des commandes nekoScript

# Affiche des informations sur l'utilisation du script
echo "🐱 Test des commandes nekoScript"
echo "-------------------------------"

# Vérifie que le premier argument est fourni
if [ -z "$1" ]; then
  echo "Usage: ./test-neko.sh <commande> [arguments]"
  echo "Exemple: ./test-neko.sh help"
  echo "Exemple: ./test-neko.sh execute examples/jeu-reel.neko"
  echo "Exemple: ./test-neko.sh démarrer examples/web-app-reel.neko"
  exit 1
fi

# Construire la commande complète
COMMAND="$*"
echo "🚀 Exécution de: neko-script $COMMAND"
echo "-------------------------------"

# Exécuter la commande via node cli.cjs
node cli.cjs $COMMAND

# Afficher un message de fin
echo "-------------------------------"
echo "✅ Commande exécutée"