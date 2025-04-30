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
  discordModule.set('créerBot', (token) => {
    // Configuration complète avec tous les intents
    const client = new discord.Client({
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
      partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
        Partials.User,
        Partials.GuildMember
      ]
    });
    
    // Événement ready
    client.once('ready', () => {
      console.log(`🐱 Bot connecté en tant que ${client.user.tag}!`);
    });
    
    // Connexion au client Discord
    client.login(token);
    
    return client;
  });
  
  // Fonction pour surveiller les messages
  discordModule.set('surMessage', (client, callback) => {
    client.on('messageCreate', (message) => {
      // Conversion au format nekoScript
      const messageNeko = {
        contenu: message.content,
        auteur: message.author.username,
        auteurId: message.author.id,
        canalId: message.channelId,
        date: message.createdAt,
        estBot: message.author.bot,
        
        // Méthodes pour répondre
        répondre: (texte) => message.reply(texte),
        réagir: (emoji) => message.react(emoji),
        supprimer: () => message.delete()
      };
      
      // Appel du callback utilisateur
      callback(messageNeko);
    });
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
    const types = {
      'joue': ActivityType.Playing,
      'regarde': ActivityType.Watching,
      'écoute': ActivityType.Listening,
      'streaming': ActivityType.Streaming,
      'compétition': ActivityType.Competing
    };
    
    client.user.setActivity(nom, { type: types[type] || ActivityType.Playing });
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
  
  return discordModule;
}

module.exports = { createDiscordModule };