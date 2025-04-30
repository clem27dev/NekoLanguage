# Guide de publication de nekoScript sur npm

Ce document explique comment publier nekoScript sur le registre npm, ce qui permettra aux utilisateurs d'installer facilement nekoScript via la commande `npm install -g nekoscript`.

## Prérequis

Avant de publier nekoScript, assurez-vous d'avoir :

1. Un compte npm (créez-en un sur [npmjs.com](https://www.npmjs.com/signup) si vous n'en avez pas)
2. Node.js et npm installés sur votre machine
3. Le code de nekoScript prêt à être publié

## Préparation

La structure du package est déjà configurée correctement :

```
nekoscript-package/
├── src/               # Code source TypeScript
├── lib/               # Code JavaScript compilé (généré par tsc)
├── bin/               # Scripts exécutables
├── package.json       # Configuration du package
├── tsconfig.json      # Configuration TypeScript
├── README.md          # Documentation
└── LICENSE            # Licence MIT
```

## Étapes pour publier

1. **Compilez le code TypeScript**

```bash
cd nekoscript-package
npm run build
```

Cette commande va transpiler le code TypeScript dans le dossier `src/` vers JavaScript dans le dossier `lib/`.

2. **Testez le package localement**

Avant de publier, assurez-vous que tout fonctionne correctement :

```bash
npm link
neko-script --version
neko-script aide
```

3. **Connectez-vous à npm**

```bash
npm login
```

Entrez votre nom d'utilisateur, mot de passe et email npm quand on vous le demande.

4. **Publiez le package**

```bash
npm publish
```

Si c'est la première fois que vous publiez ce package, utilisez simplement `npm publish`. Pour les mises à jour futures, vous devrez incrémenter la version dans `package.json` (utilisez `npm version patch|minor|major`) avant de publier.

5. **Vérifiez la publication**

Votre package devrait maintenant être disponible sur npm. Vérifiez en visitant :

```
https://www.npmjs.com/package/nekoscript
```

## Publication des mises à jour

Pour publier une nouvelle version :

1. Mettez à jour le code selon les besoins
2. Incrémentez la version dans package.json :

```bash
# Pour une correction de bug (1.0.0 -> 1.0.1)
npm version patch

# Pour une nouvelle fonctionnalité (1.0.0 -> 1.1.0)
npm version minor

# Pour un changement majeur (1.0.0 -> 2.0.0)
npm version major
```

3. Compilez le code :

```bash
npm run build
```

4. Publiez :

```bash
npm publish
```

## Configuration des scripts npm

Le fichier `package.json` inclut déjà plusieurs scripts utiles :

- `npm run build` : Compile le code TypeScript
- `npm run prepare` : Exécuté automatiquement avant `npm publish`
- `npm test` : Exécute les tests
- `npm start` : Exécute l'application

## Publier une version bêta

Si vous souhaitez publier une version préliminaire pour les testeurs :

```bash
# Mettre à jour vers une version bêta
npm version prerelease --preid=beta

# Publier avec le tag bêta
npm publish --tag beta
```

Les utilisateurs peuvent alors installer cette version avec :

```bash
npm install -g nekoscript@beta
```

## Conseils

- Maintenez à jour le fichier README.md avec les dernières fonctionnalités
- Ajoutez toujours des notes de version claires pour chaque mise à jour
- Testez soigneusement avant chaque publication
- Considérez l'utilisation de GitHub Actions pour automatiser le processus de publication