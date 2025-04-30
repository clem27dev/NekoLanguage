/**
 * Module Discord.neko
 * Ce module permet d'utiliser l'API Discord.js directement avec nekoScript
 */

"use strict";

/**
 * Crée un module Discord pour nekoScript avec accès complet à Discord.js
 * @returns {Map} Module exposant les fonctionnalités Discord
 */
function createDiscordModule() {
  // Vérifier si Discord.js est installé
  try {
    const { Client, IntentsBitField, GatewayIntentBits, EmbedBuilder, ActivityType } = require('discord.js');

    // Créer le module Discord nekoScript
    const discordModule = new Map();

    // Types d'activité pour le statut du bot
    const ACTIVITES = {
      JOUE: ActivityType.Playing,       // "Joue à..."
      REGARDE: ActivityType.Watching,   // "Regarde..."
      ECOUTE: ActivityType.Listening,   // "Écoute..."
      STREAM: ActivityType.Streaming,   // "Streame..."
      COMPETE: ActivityType.Competing   // "Participe à..."
    };

    // Fonction principale pour créer un bot Discord
    discordModule.set('nekCréerBot', (token) => {
      console.log("[NekoScript:Discord] Création d'un bot Discord");
      
      if (!token) {
        throw new Error("Erreur: Token Discord manquant");
      }
      
      // Créer un client Discord avec tous les intents nécessaires
      const client = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent,
          GatewayIntentBits.GuildMembers,
          GatewayIntentBits.DirectMessages
        ]
      });
      
      // Gérer les erreurs de connexion
      client.on('error', (error) => {
        console.error(`[NekoScript:Discord] Erreur: ${error.message}`);
      });
      
      // Se connecter au compte Discord
      client.login(token).catch(error => {
        console.error(`[NekoScript:Discord] Erreur de connexion: ${error.message}`);
        if (error.message.includes('token')) {
          console.error("[NekoScript:Discord] Le token fourni est invalide. Vérifiez qu'il est correct.");
        }
        throw error;
      });
      
      // Objet qui représente le bot dans le code nekoScript
      return {
        client: client,
        token: token,
        estConnecté: false,
        préfixe: '!',
        
        // Définir le préfixe des commandes
        définirPréfixe: function(nouveauPréfixe) {
          this.préfixe = nouveauPréfixe;
          return this;
        },
        
        // Changer le statut et l'activité du bot
        changerStatut: function(statut, type = "JOUE") {
          console.log(`[NekoScript:Discord] Changement de statut: ${statut} (${type})`);
          
          // Convertir le type d'activité
          const activité = ACTIVITES[type] || ActivityType.Playing;
          
          // Définir l'activité si le client est prêt
          if (client.isReady()) {
            client.user.setActivity(statut, { type: activité });
          } else {
            client.once('ready', () => {
              client.user.setActivity(statut, { type: activité });
            });
          }
          
          return this;
        },
        
        // Définir le gestionnaire d'événements 'ready'
        surConnexion: function(callback) {
          client.once('ready', () => {
            console.log(`[NekoScript:Discord] Bot connecté sous le nom ${client.user.tag}`);
            this.estConnecté = true;
            
            // Appeler le callback avec des informations utiles
            if (typeof callback === 'function') {
              callback({
                nom: client.user.username,
                tag: client.user.tag,
                id: client.user.id,
                serveurs: client.guilds.cache.size
              });
            }
          });
          
          return this;
        },
        
        // Envoyer un message dans un canal spécifique
        envoyerMessage: function(canalId, message) {
          const canal = client.channels.cache.get(canalId);
          if (canal) {
            canal.send(message).catch(err => {
              console.error(`[NekoScript:Discord] Erreur d'envoi de message: ${err.message}`);
            });
          } else {
            console.error(`[NekoScript:Discord] Canal ${canalId} introuvable`);
          }
          
          return this;
        },
        
        // Gestionnaire d'événements pour les messages reçus
        surMessage: function(callback) {
          // Gestionnaire pour les messages
          client.on('messageCreate', async (message) => {
            // Ignorer les messages du bot lui-même
            if (message.author.bot) return;
            
            try {
              // Créer un objet message simplifié pour nekoScript
              const messageNeko = {
                contenu: message.content,
                auteur: message.author.username,
                auteurId: message.author.id,
                auteurTag: message.author.tag,
                canalId: message.channel.id,
                canalNom: message.channel.name,
                serveurId: message.guild ? message.guild.id : null,
                serveurNom: message.guild ? message.guild.name : null,
                estMP: message.channel.type === 'DM',
                
                // Méthodes pour interagir avec le message
                répondre: async (contenu) => {
                  try {
                    const reply = await message.reply(contenu);
                    return {
                      id: reply.id,
                      contenu: reply.content
                    };
                  } catch (err) {
                    console.error(`[NekoScript:Discord] Erreur de réponse: ${err.message}`);
                    return null;
                  }
                },
                
                supprimer: async () => {
                  try {
                    await message.delete();
                    return true;
                  } catch (err) {
                    console.error(`[NekoScript:Discord] Erreur de suppression: ${err.message}`);
                    return false;
                  }
                },
                
                réaction: async (emoji) => {
                  try {
                    await message.react(emoji);
                    return true;
                  } catch (err) {
                    console.error(`[NekoScript:Discord] Erreur de réaction: ${err.message}`);
                    return false;
                  }
                }
              };
              
              // Appeler le callback avec le message
              if (typeof callback === 'function') {
                await callback(messageNeko);
              }
            } catch (callbackError) {
              console.error(`[NekoScript:Discord] Erreur dans le gestionnaire de messages: ${callbackError.message}`);
            }
          });
          
          return this;
        },
        
        // Créer un embed riche pour les messages
        créerEmbed: function(titre, description, couleur = '#8c52ff') {
          const embed = new EmbedBuilder()
            .setTitle(titre)
            .setDescription(description)
            .setColor(couleur)
            .setTimestamp();
            
          return {
            embed: embed,
            
            ajouterChamp: function(nom, valeur, inline = false) {
              embed.addFields({ name: nom, value: valeur, inline: inline });
              return this;
            },
            
            définirAuteur: function(nom, iconURL) {
              embed.setAuthor({ name: nom, iconURL: iconURL });
              return this;
            },
            
            définirImage: function(url) {
              embed.setImage(url);
              return this;
            },
            
            définirThumbnail: function(url) {
              embed.setThumbnail(url);
              return this;
            },
            
            définirFooter: function(texte, iconURL) {
              embed.setFooter({ text: texte, iconURL: iconURL });
              return this;
            },
            
            envoyerDans: function(canalId) {
              const canal = client.channels.cache.get(canalId);
              if (canal) {
                canal.send({ embeds: [embed] }).catch(err => {
                  console.error(`[NekoScript:Discord] Erreur d'envoi d'embed: ${err.message}`);
                });
              } else {
                console.error(`[NekoScript:Discord] Canal ${canalId} introuvable`);
              }
              return this;
            }
          };
        }
      };
    });
    
    // Exposer les types d'activité pour le statut du bot
    discordModule.set('ACTIVITE_JOUE', ACTIVITES.JOUE);
    discordModule.set('ACTIVITE_REGARDE', ACTIVITES.REGARDE);
    discordModule.set('ACTIVITE_ECOUTE', ACTIVITES.ECOUTE);
    discordModule.set('ACTIVITE_STREAM', ACTIVITES.STREAM);
    discordModule.set('ACTIVITE_COMPETE', ACTIVITES.COMPETE);
    
    return discordModule;
  } catch (error) {
    console.error(`[NekoScript:Discord] Erreur d'initialisation du module Discord: ${error.message}`);
    
    // Créer un module simulé si Discord.js n'est pas disponible
    const discordModuleSimulé = new Map();
    
    discordModuleSimulé.set('nekCréerBot', (token) => {
      console.log("[NekoScript:Discord] Création d'un bot Discord (SIMULATION)");
      
      return {
        client: null,
        token: token,
        estConnecté: true,
        préfixe: '!',
        
        définirPréfixe: function(nouveauPréfixe) {
          this.préfixe = nouveauPréfixe;
          return this;
        },
        
        changerStatut: function(statut, type = "JOUE") {
          console.log(`[NekoScript:Discord] Statut simulé: ${statut} (${type})`);
          return this;
        },
        
        surConnexion: function(callback) {
          console.log("[NekoScript:Discord] Événement 'ready' simulé");
          
          if (typeof callback === 'function') {
            callback({
              nom: "NekoBot",
              tag: "NekoBot#0000",
              id: "000000000000000000",
              serveurs: 3
            });
          }
          
          return this;
        },
        
        envoyerMessage: function(canalId, message) {
          console.log(`[NekoScript:Discord] Message simulé envoyé à ${canalId}: ${message}`);
          return this;
        },
        
        surMessage: function(callback) {
          console.log("[NekoScript:Discord] Gestionnaire de messages simulé configuré");
          
          // Simuler un message après un court délai
          setTimeout(() => {
            if (typeof callback === 'function') {
              callback({
                contenu: "!aide",
                auteur: "Utilisateur",
                auteurId: "123456789",
                auteurTag: "Utilisateur#1234",
                canalId: "987654321",
                canalNom: "général",
                serveurId: "111222333",
                serveurNom: "Serveur Test",
                estMP: false,
                
                répondre: async (contenu) => {
                  console.log(`[NekoScript:Discord] Réponse simulée: ${contenu}`);
                  return { id: "000000", contenu: contenu };
                },
                
                supprimer: async () => {
                  console.log("[NekoScript:Discord] Message supprimé (simulation)");
                  return true;
                },
                
                réaction: async (emoji) => {
                  console.log(`[NekoScript:Discord] Réaction ajoutée: ${emoji} (simulation)`);
                  return true;
                }
              });
            }
          }, 1000);
          
          return this;
        },
        
        créerEmbed: function(titre, description, couleur = '#8c52ff') {
          console.log(`[NekoScript:Discord] Embed créé: ${titre} - ${description} (simulation)`);
          
          return {
            ajouterChamp: function(nom, valeur, inline = false) {
              console.log(`[NekoScript:Discord] Champ ajouté: ${nom} - ${valeur} (simulation)`);
              return this;
            },
            
            définirAuteur: function(nom, iconURL) {
              console.log(`[NekoScript:Discord] Auteur défini: ${nom} (simulation)`);
              return this;
            },
            
            définirImage: function(url) {
              console.log(`[NekoScript:Discord] Image définie: ${url} (simulation)`);
              return this;
            },
            
            définirThumbnail: function(url) {
              console.log(`[NekoScript:Discord] Thumbnail définie: ${url} (simulation)`);
              return this;
            },
            
            définirFooter: function(texte, iconURL) {
              console.log(`[NekoScript:Discord] Footer défini: ${texte} (simulation)`);
              return this;
            },
            
            envoyerDans: function(canalId) {
              console.log(`[NekoScript:Discord] Embed envoyé dans ${canalId} (simulation)`);
              return this;
            }
          };
        }
      };
    });
    
    // Exposer les constantes simulées
    discordModuleSimulé.set('ACTIVITE_JOUE', 0);
    discordModuleSimulé.set('ACTIVITE_REGARDE', 3);
    discordModuleSimulé.set('ACTIVITE_ECOUTE', 2);
    discordModuleSimulé.set('ACTIVITE_STREAM', 1);
    discordModuleSimulé.set('ACTIVITE_COMPETE', 5);
    
    return discordModuleSimulé;
  }
}

module.exports = { createDiscordModule };