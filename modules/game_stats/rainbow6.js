/**
 * @file rainbow6 command
 * @author Sankarsan Kampa (a.k.a k3rn31p4nic)
 * @license MIT
 */

const RainbowSix = require('rainbowsix-api-node');
const r6 = new RainbowSix();

exports.run = (Bastion, message, args) => {
  if (args.length < 2) {
    /**
     * The command was ran with invalid parameters.
     * @fires commandUsage
     */
    return Bastion.emit('commandUsage', message, this.help);
  }
  if (!/^(uplay|ps4|xone)$/.test(args[0] = args[0].toLowerCase())) {
    return message.channel.send({
      embed: {
        color: Bastion.colors.red,
        description: `**${args[0]}** is not a valid platform. Valid platforms are \`Uplay\`, \`PS4\` and \`XOne\`.`
      }
    }).catch(e => {
      Bastion.log.error(e.stack);
    });
  }
  if (!/^[a-zA-Z][\w-. ]{2,14}$/.test(args[1] = args.slice(1).join(' '))) {
    return message.channel.send({
      embed: {
        color: Bastion.colors.red,
        description: `**${args[1]}** is not a valid username.`
      }
    }).catch(e => {
      Bastion.log.error(e.stack);
    });
  }

  r6.stats(args[1], args[0]).then(data => {
    let stats = [
      {
        name: 'Player Name',
        value: data.player.username
      },
      {
        name: 'Level',
        value: `${data.player.stats.progression.level}`,
        inline: true
      },
      {
        name: 'XP',
        value: `${data.player.stats.progression.xp}`,
        inline: true
      }
    ];
    if (data.player.stats.ranked.has_played) {
      stats.push(
        {
          name: 'Ranked',
          value: `${args[1]} has played Ranked games for **${(data.player.stats.ranked.playtime / 60 / 60).toFixed(2)}** Hours.`
        },
        {
          name: 'Wins',
          value: `${data.player.stats.ranked.wins}`,
          inline: true
        },
        {
          name: 'Losses',
          value: `${data.player.stats.ranked.losses}`,
          inline: true
        },
        {
          name: 'Kills',
          value: `${data.player.stats.ranked.kills}`,
          inline: true
        },
        {
          name: 'Deaths',
          value: `${data.player.stats.ranked.deaths}`,
          inline: true
        },
        {
          name: 'Win/Lose Ratio',
          value: `${data.player.stats.ranked.wlr}`,
          inline: true
        },
        {
          name: 'Kill/Death Ratio',
          value: `${data.player.stats.ranked.kd}`,
          inline: true
        }
      );
    }
    else {
      stats.push(
        {
          name: 'Ranked',
          value: `${args[1]} has not played any Ranked game.`
        }
      );
    }
    if (data.player.stats.casual.has_played) {
      stats.push(
        {
          name: 'Casual',
          value: `${args[1]} has played Casual games for **${(data.player.stats.casual.playtime / 60 / 60).toFixed(2)}** Hours.`
        },
        {
          name: 'Wins',
          value: `${data.player.stats.casual.wins}`,
          inline: true
        },
        {
          name: 'Losses',
          value: `${data.player.stats.casual.losses}`,
          inline: true
        },
        {
          name: 'Kills',
          value: `${data.player.stats.casual.kills}`,
          inline: true
        },
        {
          name: 'Deaths',
          value: `${data.player.stats.casual.deaths}`,
          inline: true
        },
        {
          name: 'Win/Lose Ratio',
          value: `${data.player.stats.casual.wlr}`,
          inline: true
        },
        {
          name: 'Kill/Death Ratio',
          value: `${data.player.stats.casual.kd}`,
          inline: true
        }
      );
    }
    else {
      stats.push(
        {
          name: 'Casual',
          value: `${args[1]} has not played any Casual game.`
        }
      );
    }
    message.channel.send({
      embed: {
        color: Bastion.colors.blue,
        title: 'Rainbow 6',
        url: `https://r6stats.com/stats/${args[0]}/${encodeURIComponent(args[1])}`,
        fields: stats,
        thumbnail: {
          url: 'https://vignette1.wikia.nocookie.net/rainbowsix/images/0/06/Rainbow_(Clear_Background)_logo.png'
        }
      }
    }).catch(e => {
      Bastion.log.error(e.stack);
    });
  }).catch(e => {
    Bastion.log.error(e.stack);
    message.channel.send({
      embed: {
        color: Bastion.colors.red,
        description: `No player with username **${args[1]}** found for the platform **${args[0]}**.`
      }
    }).catch(e => {
      Bastion.log.error(e.stack);
    });
  });
};

exports.config = {
  aliases: [ 'r6' ],
  enabled: true
};

exports.help = {
  name: 'rainbow6',
  description: 'Shows Ranbow 6 player stats specified by his platform and username.',
  botPermission: '',
  userPermission: '',
  usage: 'rainbow6 <uplay|ps4|xone> <username>',
  example: [ 'rainbow6 uplay SaffronPants' ]
};
