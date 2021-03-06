/**
 * @file play command
 * @author Sankarsan Kampa (a.k.a k3rn31p4nic)
 * @license MIT
 */

const yt = require('youtube-dl');
const jsonDB = require('node-json-db');
const db = new jsonDB('./data/favouriteSongs', true, true);
let queue = {};

exports.run = (Bastion, message, args) => {
  // TODO: Auto pause/resume playback
  if (message.deletable) {
    message.delete().catch(e => {
      Bastion.log.error(e.stack);
    });
  }
  if (args.length < 1) {
    /**
     * The command was ran with invalid parameters.
     * @fires commandUsage
     */
    return Bastion.emit('commandUsage', message, this.help);
  }
  args = args.join(' ');

  Bastion.db.get(`SELECT musicMasterRoleID, musicTextChannelID, musicVoiceChannelID FROM guildSettings WHERE guildID=${message.guild.id}`).then(musicChannel => {
    let voiceChannel, textChannel, vcStats;
    if (message.guild.voiceConnection) {
      voiceChannel = message.guild.voiceConnection.channel;
      textChannel = message.channel;
      vcStats = 'You need to be in the same voice channel as the BOT to be able to use music commands.';
    }
    else if (musicChannel.musicTextChannelID && musicChannel.musicVoiceChannelID) {
      if (!(voiceChannel = message.guild.channels.filter(c => c.type === 'voice').get(musicChannel.musicVoiceChannelID)) || !(textChannel = message.guild.channels.filter(c => c.type === 'text').get(musicChannel.musicTextChannelID))) {
        return message.channel.send({
          embed: {
            color: Bastion.colors.red,
            description: 'Invalid Text/Voice Channel ID has been added to default music channel.'
          }
        }).catch(e => {
          Bastion.log.error(e.stack);
        });
      }
      if (!voiceChannel.joinable) {
        return message.channel.send({
          embed: {
            color: Bastion.colors.red,
            description: `I don't have permission to join the voice channel **${voiceChannel.name}**`
          }
        }).catch(e => {
          Bastion.log.error(e.stack);
        });
      }
      if (!voiceChannel.speakable) {
        return message.channel.send({
          embed: {
            color: Bastion.colors.red,
            description: `I don't have permission to speak in the voice channel **${voiceChannel.name}**`
          }
        }).catch(e => {
          Bastion.log.error(e.stack);
        });
      }
      vcStats = `You need to be in the default music channel (**${voiceChannel.name}**) of the BOT to be able to use music commands.`;
    }
    else {
      return message.channel.send({
        embed: {
          color: Bastion.colors.red,
          description: 'No default music channel has been set. And I need to be in a voice channel to be able to play music.'
        }
      }).catch(e => {
        Bastion.log.error(e.stack);
      });
    }
    if (textChannel !== message.channel) return;
    if (voiceChannel.members.get(message.author.id) === undefined) {
      return message.channel.send({
        embed: {
          color: Bastion.colors.red,
          description: vcStats
        }
      }).catch(e => {
        Bastion.log.error(e.stack);
      });
    }

    try {
      if (args === '-favs') {
        let favs;
        try {
          db.reload();
          favs = db.getData('/');
        }
        catch(e) {
          Bastion.log.error(e.stack);
        }
        if (favs.length === 0) {
          return message.channel.send({
            embed: {
              color: Bastion.colors.red,
              description: 'You don\'t have any songs in your favourite list!'
            }
          }).catch(e => {
            Bastion.log.error(e.stack);
          });
        }
        args = favs.shift();
        message.channel.send({
          embed: {
            color: Bastion.colors.green,
            description: `Adding ${favs.length + 1} favourite songs to the queue...`
          }
        }).then(m => {
          m.delete(5000).catch(e => {
            Bastion.log.error(e.stack);
          });
        }).catch(e => {
          Bastion.log.error(e.stack);
        });
        // TODO: This executes before `args` is added to the queue, so the first song (`args`) is added later in the queue. Using setTimeout or flags is inefficient, find an efficient way to fix this!
        favs.forEach(e => {
          e = /^(http[s]?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)$/i.test(e) ? e : `ytsearch:${e}`;
          if (!queue.hasOwnProperty(message.guild.id)) {
            queue[message.guild.id] = {}, queue[message.guild.id].playing = false, queue[message.guild.id].repeat = false, queue[message.guild.id].skipVotes = [], queue[message.guild.id].songs = [];
          }
          yt.getInfo(e, [ '-q', '--no-warnings', '--format=bestaudio[protocol^=http]' ], (err, info) => {
            if (err || info.format_id === undefined || info.format_id.startsWith('0')) return;
            queue[message.guild.id].songs.push({
              url: info.formats[info.formats.length - 1].url,
              title: info.title,
              thumbnail: info.thumbnail,
              duration: info.duration,
              requester: message.author.id
            });
          });
        });
      }
      else if (args.startsWith('-pl')) {
        if (!/^(http[s]?:\/\/)?(www\.)?youtube\.com\/playlist\?list=([-a-zA-Z0-9@:%_+.~#?&/=]*)$/i.test(args.slice(4))) {
          return message.channel.send({
            embed: {
              color: Bastion.colors.red,
              description: 'Invalid YouTube Playlist URL!'
            }
          }).catch(e => {
            Bastion.log.error(e.stack);
          });
        }
        message.channel.send({
          embed: {
            color: Bastion.colors.green,
            description: 'Processing playlist...'
          }
        }).then(m => {
          m.delete(5000).catch(e => {
            Bastion.log.error(e.stack);
          });
        }).catch(e => {
          Bastion.log.error(e.stack);
        });

        yt.getInfo(args.slice(4), [ '-q', '-i', '--skip-download', '--no-warnings', '--flat-playlist', '--format=bestaudio[protocol^=http]' ], (err, info) => {
          if (err) {
            Bastion.log.error(err);
            return message.channel.send({
              embed: {
                color: Bastion.colors.red,
                description: 'Some error has occured while adding songs from your playlist. Please check the console or try again.'
              }
            }).catch(e => {
              Bastion.log.error(e.stack);
            });
          }
          if (info) {
            if (info.length === 0) {
              return message.channel.send({
                embed: {
                  color: Bastion.colors.red,
                  description: 'No songs in the playlist!'
                }
              }).catch(e => {
                Bastion.log.error(e.stack);
              });
            }
            args = info.shift().title;
            message.channel.send({
              embed: {
                color: Bastion.colors.green,
                description: `Adding ${info.length} songs to the queue...`
              }
            }).then(m => {
              m.delete(5000).catch(e => {
                Bastion.log.error(e.stack);
              });
            }).catch(e => {
              Bastion.log.error(e.stack);
            });
            // TODO: This executes before `args` is added to the queue, so the first song (`args`) is added later in the queue. Using setTimeout or flags is inefficient, find an efficient way to fix this!
            info.forEach(e => {
              if (!queue.hasOwnProperty(message.guild.id)) {
                queue[message.guild.id] = {}, queue[message.guild.id].playing = false, queue[message.guild.id].repeat = false, queue[message.guild.id].skipVotes = [], queue[message.guild.id].songs = [];
              }
              queue[message.guild.id].songs.push({
                url: `https://www.youtube.com/watch?v=${e.url}`,
                title: e.title,
                thumbnail: '',
                duration: e.duration,
                requester: message.author.id
              });
            });
          }
        });
      }
      args = /^(http[s]?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)$/i.test(args) ? args : `ytsearch:${args}`;

      yt.getInfo(args, [ '-q', '-i', '--no-warnings', '--format=bestaudio[protocol^=http]' ], (err, info) => {
        if (err || info.format_id === undefined || info.format_id.startsWith('0')) {
          let result;
          if (err && err.stack.includes('No video results')) {
            result = `No results found found for **${args.replace('ytsearch:', '')}**.`;
          }
          else {
            result = `Some error has occured while finding results for **${args.replace('ytsearch:', '')}**.`;
          }
          return message.channel.send({
            embed: {
              color: Bastion.colors.red,
              description: result
            }
          }).catch(e => {
            Bastion.log.error(e.stack);
          });
        }
        if (!queue.hasOwnProperty(message.guild.id)) {
          queue[message.guild.id] = {}, queue[message.guild.id].playing = false, queue[message.guild.id].repeat = false, queue[message.guild.id].skipVotes = [], queue[message.guild.id].songs = [];
        }
        queue[message.guild.id].songs.push({
          url: info.formats[info.formats.length - 1].url,
          title: info.title,
          thumbnail: info.thumbnail,
          duration: info.duration,
          requester: message.author.id
        });
        textChannel.send({
          embed: {
            color: Bastion.colors.green,
            title: 'Added to the queue',
            description: info.title,
            thumbnail: {
              url: info.thumbnail
            },
            footer: {
              text: `Position: ${queue[message.guild.id].songs.length} | Duration: ${info.duration} | Requester: ${message.author.tag}`
            }
          }
        }).catch(e => {
          Bastion.log.error(e.stack);
        });
        if (queue.hasOwnProperty(message.guild.id) && (queue[message.guild.id].playing === true)) return;

        voiceChannel.join().then(connection => {
          message.guild.members.get(Bastion.user.id).setDeaf(true).catch(e => {
            Bastion.log.error(e.stack);
          });
          (function play(song) {
            if (song === undefined) {
              return textChannel.send({
                embed: {
                  color: Bastion.colors.red,
                  description: 'Exiting voice channel.'
                }
              }).then(m => {
                queue[message.guild.id].playing = false;
                voiceChannel.leave();
                m.delete(5000).catch(e => {
                  Bastion.log.error(e.stack);
                });
              }).catch(e => {
                Bastion.log.error(e.stack);
              });
            }

            const dispatcher = connection.playStream(yt(song.url), { passes: 1 });

            queue[message.guild.id].playing = true;

            textChannel.send({
              embed: {
                color: Bastion.colors.blue,
                title: 'Playing',
                description: song.title,
                thumbnail: {
                  url: song.thumbnail
                },
                footer: {
                  text: `🔉 ${dispatcher.volume * 50}% | Duration: ${song.duration} | Requester: ${message.author.tag}`
                }
              }
            }).catch(e => {
              Bastion.log.error(e.stack);
            });

            let collector = textChannel.createMessageCollector(
              msg => connection.channel === msg.member.voiceChannel &&
              (msg.content.startsWith(`${Bastion.config.prefix}clean`) ||
              msg.content.startsWith(`${Bastion.config.prefix}np`) ||
              msg.content.startsWith(`${Bastion.config.prefix}pause`) ||
              msg.content.startsWith(`${Bastion.config.prefix}queue`) ||
              msg.content.startsWith(`${Bastion.config.prefix}repeat`) ||
              msg.content.startsWith(`${Bastion.config.prefix}resume`) ||
              msg.content.startsWith(`${Bastion.config.prefix}shuffle`) ||
              msg.content.startsWith(`${Bastion.config.prefix}skip`) ||
              msg.content.startsWith(`${Bastion.config.prefix}stop`) ||
              msg.content.startsWith(`${Bastion.config.prefix}volume`))
            );
            collector.on('collect', msg => {
              if (msg.content.startsWith(`${Bastion.config.prefix}clean`)) {
                if (!Bastion.credentials.ownerId.includes(msg.author.id) && !msg.member.roles.has(musicChannel.musicMasterRoleID)) return;
                queue[message.guild.id].songs.splice(1, queue[message.guild.id].songs.length - 1);
                textChannel.send({
                  embed: {
                    color: Bastion.colors.green,
                    description: 'Cleaned up the queue.'
                  }
                }).catch(e => {
                  Bastion.log.error(e.stack);
                });
              }
              else if (msg.content.startsWith(`${Bastion.config.prefix}np`)) {
                let title;
                if (dispatcher.paused) {
                  title = 'Paused';
                }
                else {
                  title = 'Now Playing';
                }
                textChannel.send({
                  embed: {
                    color: Bastion.colors.blue,
                    title: title,
                    description: song.title,
                    thumbnail: {
                      url: song.thumbnail
                    },
                    footer: {
                      text: `🔉 ${dispatcher.volume * 50}% | ${Math.floor(dispatcher.time / 60000)}:${Math.floor((dispatcher.time % 60000) / 1000) < 10 ? `0${Math.floor((dispatcher.time % 60000) / 1000)}` : Math.floor((dispatcher.time % 60000) / 1000)} / ${song.duration}`
                    }
                  }
                }).catch(e => {
                  Bastion.log.error(e.stack);
                });
              }
              else if (msg.content.startsWith(`${Bastion.config.prefix}pause`)) {
                if (!Bastion.credentials.ownerId.includes(msg.author.id) && !msg.member.roles.has(musicChannel.musicMasterRoleID)) return;
                if (!connection.speaking) return;

                textChannel.send({
                  embed: {
                    color: Bastion.colors.orange,
                    title: 'Paused Playback',
                    description: song.title,
                    footer: {
                      text: `🔉 ${dispatcher.volume * 50}% | ${Math.floor(dispatcher.time / 60000)}:${Math.floor((dispatcher.time % 60000) / 1000) < 10 ? `0${Math.floor((dispatcher.time % 60000) / 1000)}` : Math.floor((dispatcher.time % 60000) / 1000)} / ${song.duration}`
                    }
                  }
                }).then(() => {
                  dispatcher.pause();
                }).catch(e => {
                  Bastion.log.error(e.stack);
                });
              }
              else if (msg.content.startsWith(`${Bastion.config.prefix}queue`)) {
                let fields = [ {
                  name: `:loud_sound: ${song.title}`,
                  value: `Requested by: <@${song.requester}>`
                } ];
                for (let i = 1; i < (queue[message.guild.id].songs.length < 10 ? queue[message.guild.id].songs.length : 9); i++) {
                  fields.push({
                    name: `${i + 1}. ${queue[message.guild.id].songs[i].title}`,
                    value: `Requested by: <@${queue[message.guild.id].songs[i].requester}>`
                  });
                }
                textChannel.send({
                  embed: {
                    color: Bastion.colors.blue,
                    title: 'Music queue',
                    description: `${queue[message.guild.id].songs.length - 1} songs in queue`,
                    fields: fields
                  }
                }).catch(e => {
                  Bastion.log.error(e.stack);
                });
              }
              else if (msg.content.startsWith(`${Bastion.config.prefix}repeat`)) {
                let color, repeatStat = '';
                if (queue[message.guild.id].repeat) {
                  color = Bastion.colors.red;
                  queue[message.guild.id].repeat = false;
                  repeatStat = 'Removed the current song from repeat queue.';
                }
                else {
                  color = Bastion.colors.green;
                  queue[message.guild.id].repeat = true;
                  repeatStat = 'Added the current song to the repeat queue.';
                }
                textChannel.send({
                  embed: {
                    color: color,
                    description: repeatStat
                  }
                }).catch(e => {
                  Bastion.log.error(e.stack);
                });
              }
              else if (msg.content.startsWith(`${Bastion.config.prefix}resume`)) {
                if (!Bastion.credentials.ownerId.includes(msg.author.id) && !msg.member.roles.has(musicChannel.musicMasterRoleID)) return;
                if (connection.speaking) return;

                textChannel.send({
                  embed: {
                    color: Bastion.colors.green,
                    title: 'Resumed Playback',
                    description: song.title,
                    footer: {
                      text: `🔉 ${dispatcher.volume * 50}% | ${Math.floor(dispatcher.time / 60000)}:${Math.floor((dispatcher.time % 60000) / 1000) < 10 ? `0${Math.floor((dispatcher.time % 60000) / 1000)}` : Math.floor((dispatcher.time % 60000) / 1000)} / ${song.duration}`
                    }
                  }
                }).then(() => {
                  dispatcher.resume();
                }).catch(e => {
                  Bastion.log.error(e.stack);
                });
              }
              else if (msg.content.startsWith(`${Bastion.config.prefix}shuffle`)) {
                if (!Bastion.credentials.ownerId.includes(msg.author.id) && !msg.member.roles.has(musicChannel.musicMasterRoleID)) return;

                let nowPlaying = queue[message.guild.id].songs.shift();
                queue[message.guild.id].songs = shuffle(queue[message.guild.id].songs);
                queue[message.guild.id].songs.unshift(nowPlaying);
                // queue[message.guild.id].songs.shuffle();

                textChannel.send({
                  embed: {
                    color: Bastion.colors.green,
                    description: 'Shuffled the queue.'
                  }
                }).catch(e => {
                  Bastion.log.error(e.stack);
                });
              }
              else if (msg.content.startsWith(`${Bastion.config.prefix}skip`)) {
                if (!Bastion.credentials.ownerId.includes(msg.author.id) && !msg.member.roles.has(musicChannel.musicMasterRoleID)) {
                  if (!queue[message.guild.id].skipVotes.includes(msg.author.id)) {
                    queue[message.guild.id].skipVotes.push(msg.author.id);
                  }
                  if (queue[message.guild.id].skipVotes.length >= (voiceChannel.members.size - 1) / 2) {
                    textChannel.send({
                      embed: {
                        color: Bastion.colors.green,
                        description: 'Skipping current song.'
                      }
                    }).then(() => {
                      dispatcher.end();
                    }).catch(e => {
                      Bastion.log.error(e.stack);
                    });
                  }
                  else {
                    textChannel.send({
                      embed: {
                        color: Bastion.colors.dark_grey,
                        description: `${((voiceChannel.members.size - 1) / 2) - queue[message.guild.id].skipVotes.length} votes required to skip the current song.`
                      }
                    }).catch(e => {
                      Bastion.log.error(e.stack);
                    });
                  }
                }
                else {
                  textChannel.send({
                    embed: {
                      color: Bastion.colors.green,
                      description: 'Skipping current song.'
                    }
                  }).then(() => {
                    dispatcher.end();
                  }).catch(e => {
                    Bastion.log.error(e.stack);
                  });
                }
              }
              else if (msg.content.startsWith(`${Bastion.config.prefix}stop`)) {
                if (!Bastion.credentials.ownerId.includes(msg.author.id) && !msg.member.roles.has(musicChannel.musicMasterRoleID)) return;
                textChannel.send({
                  embed: {
                    color: Bastion.colors.red,
                    description: 'Stopped Playback.'
                  }
                }).then(() => {
                  if (queue.hasOwnProperty(message.guild.id)) {
                    queue[message.guild.id].songs = [];
                  }
                  dispatcher.end();
                }).catch(e => {
                  Bastion.log.error(e.stack);
                });
              }
              else if (msg.content.startsWith(`${Bastion.config.prefix}volume`)) {
                if (!Bastion.credentials.ownerId.includes(msg.author.id) && !msg.member.roles.has(musicChannel.musicMasterRoleID)) return;
                let param = msg.content.split(' ').slice(1);
                if (param[0] === '+') {
                  dispatcher.setVolume((dispatcher.volume * 50 + 2) / 50);
                }
                else if (param[0] === '-') {
                  dispatcher.setVolume((dispatcher.volume * 50 - 2) / 50);
                }
                else if (/^\d+$/.test(param[0])) {
                  param = param[0] > 0 && param[0] < 100 ? param[0] : 100;
                  dispatcher.setVolume(param / 50);
                }
                textChannel.send({
                  embed: {
                    color: Bastion.colors.green,
                    description: `Volume: ${Math.round(dispatcher.volume * 50)}%`
                  }
                }).catch(e => {
                  Bastion.log.error(e.stack);
                });
              }
            });

            dispatcher.on('end', () => {
              collector.stop();
              queue[message.guild.id].playing = false;
              queue[message.guild.id].skipVotes = [];
              if (!queue[message.guild.id].repeat) {
                queue[message.guild.id].songs.shift();
              }
              else {
                queue[message.guild.id].repeat = false;
              }
              play(queue[message.guild.id].songs[0]);
            });
            dispatcher.on('error', (err) => {
              queue[message.guild.id].playing = false;
              queue[message.guild.id].songs.shift();
              play(queue[message.guild.id].songs[0]);
              return Bastion.log.error(err);
            });
          }(queue[message.guild.id].songs[0]));
        }).catch(e => {
          Bastion.log.error(e.stack);
        });
      });
    }
    catch (e) {
      textChannel.send({
        embed: {
          color: Bastion.colors.red,
          description: 'Some connection error has occured. Please try again later.'
        }
      }).catch(e => {
        Bastion.log.error(e.stack);
      });
    }
  }).catch(e => {
    Bastion.log.error(e.stack);
  });
};

exports.config = {
  aliases: [],
  enabled: true
};

exports.help = {
  name: 'play',
  description: 'Plays a song (adds the song to the queue if already playing) specified by name/link. To play songs in a YouTube playlist, use \'-pl\' argument with the playlist link. To play songs in your favourites use \'-favs\' argument instead of song name/link.',
  botPermission: '',
  userPermission: '',
  usage: 'play <name | song_link | -pl <playlist_link> | -favs>',
  example: [ 'play Shape of you', 'play https://www.youtube.com/watch?v=GoUyrUwDN64', 'play -pl https://www.youtube.com/playlist?list=PL4zQ6RXLMCJx4RD3pyzRX4QYFubtCdn_k', 'play -favs' ]
};

/**
 * Shuffles an array.
 * @function shuffle
 * @param {array} array The array to shuffle.
 * @returns {array} The shuffled array.
 */
function shuffle(array) {
  let i = array.length;
  while (i) {
    let j = Math.floor(Math.random() * i);
    let t = array[--i];
    array[i] = array[j];
    array[j] = t;
  }
  return array;
}
