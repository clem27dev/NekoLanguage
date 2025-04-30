/**
 * Module Discord.neko
 * Ce module permet d'utiliser l'API Discord.js directement avec nekoScript
 */

"use strict";

const discord = require('discord.js');
const { GatewayIntentBits, Partials, ActivityType, EmbedBuilder, AttachmentBuilder } = discord;

/**
 * Crée un module Discord pour nekoScript avec accès complet à Discord.js
 * @returns {Map} Module exposant les fonctionnalités Discord
 */
function createDiscordModule() {
  const discordModule = new Map();
  
  // Fonction pour créer un client Discord
  discordModule.set('créerBot', (token, options = {}) => {
    if (!token || token === "VOTRE_TOKEN_DISCORD") {
      console.warn("[NekoScript] ⚠️ Aucun token Discord valide n'a été fourni!");
      console.warn("[NekoScript] ℹ️ Pour obtenir un token, créez une application sur https://discord.com/developers/applications");
      // On continue quand même avec un client Discord fonctionnel, mais il ne pourra pas se connecter
    }
    
    // Options par défaut pour la création du client
    const defaultOptions = {
      // Intents par défaut
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessageReactions
      ],
      // Partials par défaut
      partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
        Partials.User,
        Partials.GuildMember
      ],
      // Autres options
      autoLoginIfValid: true, // Se connecter automatiquement si token valide
      showReadyMessage: true  // Afficher un message quand le bot est prêt
    };
    
    // Fusionner les options par défaut avec celles fournies
    const botOptions = { ...defaultOptions, ...options };
    
    // Configuration complète du client Discord.js
    const client = new discord.Client({
      intents: botOptions.intents,
      partials: botOptions.partials,
      // Autres options de Discord.js
      rest: { 
        timeout: 60000 // Augmenter le timeout pour les API Discord à 60s
      }
    });
    
    // Propriétés supplémentaires pour faciliter l'utilisation
    client.nekoOptions = botOptions;
    client.readyTimestamp = null;
    
    // Événement ready
    client.once('ready', () => {
      client.readyTimestamp = Date.now();
      
      if (botOptions.showReadyMessage) {
        console.log(`🐱 Bot Discord connecté en tant que ${client.user.tag}!`);
        console.log(`📊 Connecté à ${client.guilds.cache.size} serveurs`);
        console.log(`📅 Date de connexion: ${new Date().toLocaleString()}`);
      }
      
      // Événement personnalisé pour les développeurs nekoScript
      client.emit('botReady', client);
    });
    
    // Gérer les erreurs de connexion
    client.on('error', (error) => {
      console.error("[NekoScript] ❌ Erreur Discord.js:", error.message);
    });
    
    // Gérer les déconnexions
    client.on('disconnect', (event) => {
      console.warn("[NekoScript] ⚠️ Bot déconnecté! Code:", event.code);
      console.warn("[NekoScript] Raison:", event.reason);
    });
    
    // Gérer les reconnexions
    client.on('reconnecting', () => {
      console.log("[NekoScript] 🔄 Tentative de reconnexion...");
    });
    
    // Méthodes supplémentaires pour faciliter l'utilisation
    client.estConnecté = () => client.readyTimestamp !== null;
    
    client.obtenirServeur = (serveurId) => {
      return client.guilds.cache.get(serveurId);
    };
    
    client.obtenirUtilisateur = async (userId) => {
      try {
        return await client.users.fetch(userId);
      } catch (error) {
        console.error(`[NekoScript] Erreur lors de la récupération de l'utilisateur ${userId}:`, error.message);
        return null;
      }
    };
    
    // Se connecter automatiquement si demandé et token valide
    if (botOptions.autoLoginIfValid && token && token !== "VOTRE_TOKEN_DISCORD") {
      try {
        client.login(token).catch(err => {
          console.error("[NekoScript] ❌ Erreur de connexion Discord:", err.message);
          if (err.message.includes("token")) {
            console.error("[NekoScript] ℹ️ Vérifiez que votre token Discord est valide.");
          }
        });
      } catch (error) {
        console.error("[NekoScript] ❌ Erreur lors de la tentative de connexion:", error.message);
      }
    }
    
    return client;
  });
  
  // Fonction pour surveiller les messages
  discordModule.set('surMessage', (client, callback) => {
    if (typeof client === 'string') {
      // Si on a donné un token directement au lieu d'un client
      console.warn("[NekoScript] ⚠️ Attention: 'surMessage' a reçu un token au lieu d'un client bot. Création automatique du client...");
      
      // Créer automatiquement un client avec ce token
      const newClient = new discord.Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent,
          GatewayIntentBits.DirectMessages
        ]
      });
      
      // Se connecter avec le token
      newClient.login(client).catch(err => {
        console.error("[NekoScript] ❌ Erreur de connexion Discord:", err.message);
      });
      
      // Remplacer le client par le vrai client
      client = newClient;
    }
    
    // Vérifier que le client est bien un objet Client de Discord.js
    if (!client || typeof client.on !== 'function') {
      throw new Error("[NekoScript] Le client Discord fourni n'est pas valide. Utilisez 'créerBot(token)' pour obtenir un client valide.");
    }
    
    // Vérifier que le client a les intents nécessaires
    const requiredIntents = [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ];
    
    // Ajouter un événement pour écouter les messages
    client.on('messageCreate', async (message) => {
      try {
        // Log pour débogage
        console.log(`[NekoScript] 📨 Message reçu de ${message.author.username}: ${message.content}`);
        
        // Conversion au format nekoScript avec des méthodes améliorées
        const messageNeko = {
          // Propriétés de base
          contenu: message.content,
          auteur: message.author.username,
          auteurId: message.author.id,
          canalId: message.channelId,
          serveurId: message.guildId,
          date: message.createdAt,
          estBot: message.author.bot,
          mentions: message.mentions,
          
          // Méthodes pour répondre - prend en charge les chaînes, les objets et les embeds
          répondre: async (contenu) => {
            console.log(`[NekoScript] 📤 Réponse envoyée: ${typeof contenu === 'string' ? contenu : '[Objet/Embed]'}`);
            
            try {
              // Format adapté selon le type
              if (typeof contenu === 'string') {
                return await message.reply(contenu);
              } else if (contenu && typeof contenu === 'object') {
                // Si c'est un embed ou une configuration complexe
                return await message.reply(contenu);
              } else {
                return await message.reply({ content: String(contenu) });
              }
            } catch (error) {
              console.error(`[NekoScript] ❌ Erreur lors de l'envoi de la réponse:`, error);
              throw new Error(`Impossible d'envoyer la réponse: ${error.message}`);
            }
          },
          
          // Réagir avec un émoji
          réagir: async (emoji) => {
            try {
              console.log(`[NekoScript] 🎭 Réaction ajoutée: ${emoji}`);
              return await message.react(emoji);
            } catch (error) {
              console.error(`[NekoScript] ❌ Erreur lors de l'ajout de la réaction:`, error);
              throw new Error(`Impossible d'ajouter la réaction: ${error.message}`);
            }
          },
          
          // Supprimer le message
          supprimer: async () => {
            try {
              console.log(`[NekoScript] 🗑️ Message supprimé`);
              return await message.delete();
            } catch (error) {
              console.error(`[NekoScript] ❌ Erreur lors de la suppression du message:`, error);
              throw new Error(`Impossible de supprimer le message: ${error.message}`);
            }
          },
          
          // Envoi direct dans le canal (sans répondre)
          envoyerCanal: async (contenu) => {
            try {
              console.log(`[NekoScript] 📤 Message envoyé au canal`);
              return await message.channel.send(contenu);
            } catch (error) {
              console.error(`[NekoScript] ❌ Erreur lors de l'envoi au canal:`, error);
              throw new Error(`Impossible d'envoyer au canal: ${error.message}`);
            }
          },
          
          // Méthodes utilitaires
          getMembre: () => message.member,
          getCanal: () => message.channel,
          getServeur: () => message.guild,
          
          // Obtenir des informations sur l'auteur
          getAuteurInfo: () => ({
            nom: message.author.username,
            id: message.author.id,
            tag: message.author.tag,
            avatar: message.author.displayAvatarURL(),
            bot: message.author.bot
          })
        };
        
        // Appel du callback utilisateur avec le message formaté pour nekoScript
        await Promise.resolve(callback(messageNeko));
      } catch (err) {
        console.error("[NekoScript] ❌ Erreur lors du traitement du message:", err);
      }
    });
    
    console.log("[NekoScript] ✅ Gestionnaire de messages configuré");
    return client; // Retourner le client pour permettre le chaînage
  });
  
  // Fonction pour envoyer un message dans un canal
  discordModule.set('envoyerMessage', (client, canalId, message) => {
    const channel = client.channels.cache.get(canalId);
    if (channel) {
      return channel.send(message);
    } else {
      throw new Error(`Canal avec ID ${canalId} introuvable.`);
    }
  });
  
  // Fonction pour créer un embed riche
  discordModule.set('créerEmbed', (titre, description, couleur, image) => {
    const embed = new EmbedBuilder()
      .setTitle(titre || '')
      .setDescription(description || '')
      .setColor(couleur || '#8c52ff');
      
    if (image) {
      embed.setImage(image);
    }
    
    return embed;
  });
  
  // Fonction pour configurer le statut du bot
  discordModule.set('changerStatut', (client, type, nom) => {
    // Log pour débogage
    console.log(`[NekoScript] Changement du statut du bot: ${type} ${nom}`);
    
    const types = {
      'joue': ActivityType.Playing,
      'regarde': ActivityType.Watching,
      'écoute': ActivityType.Listening,
      'streaming': ActivityType.Streaming,
      'compétition': ActivityType.Competing
    };
    
    try {
      // Vérifier que le client est bien connecté
      if (!client || !client.user) {
        console.error('[NekoScript] ❌ Erreur: impossible de changer le statut, bot non connecté');
        return false;
      }
      
      // Appliquer le statut personnalisé
      const activityType = types[type] || ActivityType.Playing;
      
      client.user.setPresence({
        activities: [{
          name: nom,
          type: activityType
        }],
        status: 'online'
      });
      
      console.log(`[NekoScript] ✅ Statut du bot modifié avec succès: ${type} ${nom}`);
      return true;
    } catch (error) {
      console.error(`[NekoScript] ❌ Erreur lors du changement de statut: ${error.message}`);
      return false;
    }
  });
  
  // Fonction pour obtenir les membres d'un serveur
  discordModule.set('obtenirMembres', async (client, serveurId) => {
    const guild = client.guilds.cache.get(serveurId);
    if (!guild) {
      throw new Error(`Serveur avec ID ${serveurId} introuvable.`);
    }
    
    // Récupérer tous les membres
    await guild.members.fetch();
    
    return Array.from(guild.members.cache.values()).map(member => ({
      id: member.id,
      nom: member.user.username,
      estBot: member.user.bot,
      rôles: Array.from(member.roles.cache.values()).map(role => role.name),
      avatar: member.user.displayAvatarURL(),
      aJoint: member.joinedAt
    }));
  });
  
  // Fonction pour envoyer un message privé
  discordModule.set('envoyerMessagePrivé', async (client, userId, message) => {
    try {
      const user = await client.users.fetch(userId);
      const dm = await user.createDM();
      return dm.send(message);
    } catch (error) {
      throw new Error(`Impossible d'envoyer un message privé: ${error.message}`);
    }
  });
  
  // Fonction pour créer un système de commandes
  discordModule.set('créerGestionnaireCommandes', (préfixe) => {
    const commandes = new Map();
    
    // Fonction pour ajouter une commande
    const ajouterCommande = (nom, description, callback) => {
      commandes.set(nom, { description, callback });
    };
    
    // Fonction pour traiter les messages
    const traiter = (message) => {
      // Vérifier si le message commence par le préfixe
      if (!message.contenu.startsWith(préfixe)) return false;
      
      // Extraire le nom de la commande et les arguments
      const args = message.contenu.slice(préfixe.length).trim().split(/ +/);
      const commandName = args.shift().toLowerCase();
      
      // Vérifier si la commande existe
      if (!commandes.has(commandName)) return false;
      
      // Exécuter la commande
      try {
        commandes.get(commandName).callback(message, args);
        return true;
      } catch (error) {
        console.error(`Erreur lors de l'exécution de la commande ${commandName}:`, error);
        return false;
      }
    };
    
    return {
      ajouterCommande,
      traiter,
      commandes
    };
  });
  
  // Fonction pour créer des commandes slash (interactions)
  discordModule.set('créerCommandesSlash', (client, commandes) => {
    if (!client || !client.application) {
      throw new Error("[NekoScript] Client Discord non valide ou non connecté. Connectez-vous d'abord.");
    }
    
    const { REST } = require('discord.js');
    const { Routes } = require('discord-api-types/v10');
    
    // Construire les données des commandes
    const commandesData = [];
    for (const [nom, options] of Object.entries(commandes)) {
      const commandData = {
        name: nom,
        description: options.description || `Commande ${nom}`,
        options: options.options || []
      };
      
      commandesData.push(commandData);
    }
    
    // Créer un client REST pour enregistrer les commandes
    const rest = new REST({ version: '10' }).setToken(client.token);
    
    // Enregistrer les commandes globalement
    (async () => {
      try {
        console.log(`[NekoScript] Enregistrement de ${commandesData.length} commandes slash...`);
        
        await rest.put(
          Routes.applicationCommands(client.application.id),
          { body: commandesData }
        );
        
        console.log('[NekoScript] ✅ Commandes slash enregistrées avec succès!');
        
        // Configurer l'écouteur d'interactions
        client.on('interactionCreate', async (interaction) => {
          if (!interaction.isCommand()) return;
          
          const { commandName } = interaction;
          
          if (commandes[commandName] && commandes[commandName].exécuter) {
            try {
              await commandes[commandName].exécuter(interaction);
            } catch (error) {
              console.error(`[NekoScript] Erreur lors de l'exécution de la commande slash ${commandName}:`, error);
              
              // Répondre avec une erreur si la réponse n'a pas déjà été envoyée
              if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ 
                  content: "Une erreur s'est produite lors de l'exécution de cette commande.", 
                  ephemeral: true 
                });
              }
            }
          }
        });
      } catch (error) {
        console.error('[NekoScript] ❌ Erreur lors de l\'enregistrement des commandes slash:', error);
      }
    })();
  });
  
  // Fonction pour réagir aux événements Discord
  discordModule.set('surÉvénement', (client, événement, callback) => {
    if (!client || typeof client.on !== 'function') {
      throw new Error("[NekoScript] Client Discord non valide. Utilisez créerBot(token) pour obtenir un client valide.");
    }
    
    // Mapper les noms d'événements français vers les noms d'événements Discord.js
    const événementsMap = {
      'prêt': 'ready',
      'messageReçu': 'messageCreate',
      'réaction': 'messageReactionAdd',
      'membre': 'guildMemberAdd',
      'membreParti': 'guildMemberRemove',
      'interaction': 'interactionCreate',
      'erreur': 'error',
      'warning': 'warn'
    };
    
    // Obtenir le nom d'événement Discord.js correspondant ou utiliser l'original
    const événementDiscord = événementsMap[événement] || événement;
    
    // Écouter l'événement
    client.on(événementDiscord, (...args) => {
      try {
        // Appeler le callback avec les arguments
        callback(...args);
      } catch (error) {
        console.error(`[NekoScript] Erreur dans le gestionnaire d'événement '${événement}':`, error);
      }
    });
    
    return client; // Pour le chaînage
  });
  
  // Fonction pour gérer des boutons interactifs
  discordModule.set('créerBouton', (id, label, style = 'primary', emoji = null, disabled = false) => {
    const { ButtonBuilder, ButtonStyle } = require('discord.js');
    
    // Mapper les styles en français vers les styles Discord.js
    const styles = {
      'primaire': ButtonStyle.Primary,
      'secondaire': ButtonStyle.Secondary,
      'succès': ButtonStyle.Success,
      'danger': ButtonStyle.Danger,
      'lien': ButtonStyle.Link,
      
      // Équivalents en anglais
      'primary': ButtonStyle.Primary,
      'secondary': ButtonStyle.Secondary,
      'success': ButtonStyle.Success,
      'danger': ButtonStyle.Danger,
      'link': ButtonStyle.Link
    };
    
    // Créer le bouton
    const bouton = new ButtonBuilder()
      .setCustomId(id)
      .setLabel(label)
      .setStyle(styles[style] || ButtonStyle.Primary);
    
    if (emoji) {
      bouton.setEmoji(emoji);
    }
    
    if (disabled) {
      bouton.setDisabled(true);
    }
    
    return bouton;
  });
  
  // Fonction pour créer un menu select
  discordModule.set('créerMenu', (id, options, placeholder = "Sélectionnez une option", minValues = 1, maxValues = 1) => {
    const { StringSelectMenuBuilder } = require('discord.js');
    
    // Créer le menu
    const menu = new StringSelectMenuBuilder()
      .setCustomId(id)
      .setPlaceholder(placeholder)
      .setMinValues(minValues)
      .setMaxValues(maxValues);
    
    // Ajouter les options
    for (const option of options) {
      menu.addOptions({
        label: option.label,
        value: option.value,
        description: option.description || undefined,
        emoji: option.emoji || undefined,
        default: option.défaut || false
      });
    }
    
    return menu;
  });
  
  // Fonction pour créer une action ligne (pour les boutons/menus)
  discordModule.set('créerLigneAction', (composants) => {
    const { ActionRowBuilder } = require('discord.js');
    
    // Créer une ligne d'action avec les composants
    return new ActionRowBuilder().addComponents(composants);
  });
  
  // Exposer les constantes Discord.js
  discordModule.set('Couleurs', {
    ROUGE: '#ff0000',
    VERT: '#00ff00',
    BLEU: '#0000ff',
    JAUNE: '#ffff00',
    CYAN: '#00ffff',
    MAGENTA: '#ff00ff',
    BLANC: '#ffffff',
    NOIR: '#000000',
    ROSE: '#ff69b4',
    ORANGE: '#ffa500',
    VIOLET: '#8a2be2',
    NEKO: '#8c52ff'
  });
  
  // Exposer les constantes de permissions
  discordModule.set('Permissions', {
    ADMINISTRATEUR: 'Administrator',
    GÉRER_SERVEUR: 'ManageGuild',
    GÉRER_MESSAGES: 'ManageMessages',
    GÉRER_RÔLES: 'ManageRoles',
    BANNIR_MEMBRES: 'BanMembers',
    EXPULSER_MEMBRES: 'KickMembers',
    ENVOYER_MESSAGES: 'SendMessages',
    VOIR_SALONS: 'ViewChannel',
    PARLER: 'Speak'
  });
  
  return discordModule;
}

module.exports = { createDiscordModule };