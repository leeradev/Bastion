/**
 * @file unMute command
 * @author Sankarsan Kampa (a.k.a k3rn31p4nic)
 * @license MIT
 */

exports.run = (Bastion, message, args) => {
  if (!message.member.hasPermission(this.help.userPermission)) {
    /**
     * User has missing permissions.
     * @fires userMissingPermissions
     */
    return Bastion.emit('userMissingPermissions', this.help.userPermission);
  }
  if (!message.guild.me.hasPermission(this.help.botPermission)) {
    /**
     * Bastion has missing permissions.
     * @fires bastionMissingPermissions
     */
    return Bastion.emit('bastionMissingPermissions', this.help.botPermission, message);
  }

  if (!message.guild.available) return Bastion.log.info(`${message.guild.name} Guild is not available. It generally indicates a server outage.`);
  let user = message.mentions.users.first();
  if (!user) {
    /**
     * The command was ran with invalid parameters.
     * @fires commandUsage
     */
    return Bastion.emit('commandUsage', message, this.help);
  }

  if (message.author.id !== message.guild.ownerID && message.member.highestRole.comparePositionTo(message.guild.members.get(user.id).highestRole) <= 0) return Bastion.log.info('User doesn\'t have permission to use this command on that role.');

  let reason = args.slice(1).join(' ');
  if (reason.length < 1) {
    reason = 'No reason given';
  }
  message.guild.members.get(user.id).setMute(false).then(() => {
    message.channel.send({
      embed: {
        color: Bastion.colors.green,
        title: 'Unmuted',
        fields: [
          {
            name: 'User',
            value: user.tag,
            inline: true
          },
          {
            name: 'ID',
            value: user.id,
            inline: true
          },
          {
            name: 'Reason',
            value: reason,
            inline: false
          }
        ]
      }
    }).catch(e => {
      Bastion.log.error(e.stack);
    });

    Bastion.db.get(`SELECT modLog, modLogChannelID, modCaseNo FROM guildSettings WHERE guildID=${message.guild.id}`).then(row => {
      if (!row) return;

      if (row.modLog === 'true') {
        message.guild.channels.get(row.modLogChannelID).send({
          embed: {
            color: Bastion.colors.green,
            title: 'Unmuted user',
            fields: [
              {
                name: 'User',
                value: `${user}`,
                inline: true
              },
              {
                name: 'User ID',
                value: user.id,
                inline: true
              },
              {
                name: 'Reason',
                value: reason
              },
              {
                name: 'Responsible Moderator',
                value: `${message.author}`,
                inline: true
              },
              {
                name: 'Moderator ID',
                value: message.author.id,
                inline: true
              }
            ],
            footer: {
              text: `Case Number: ${row.modCaseNo}`
            },
            timestamp: new Date()
          }
        }).then(() => {
          Bastion.db.run(`UPDATE guildSettings SET modCaseNo=${parseInt(row.modCaseNo) + 1} WHERE guildID=${message.guild.id}`).catch(e => {
            Bastion.log.error(e.stack);
          });
        }).catch(e => {
          Bastion.log.error(e.stack);
        });
      }
    }).catch(e => {
      Bastion.log.error(e.stack);
    });
  }).catch(e => {
    Bastion.log.error(e.stack);
  });
};

exports.config = {
  aliases: [],
  enabled: true
};

exports.help = {
  name: 'unmute',
  description: 'Unmutes a mentioned user with an optional reason.',
  botPermission: 'MUTE_MEMBERS',
  userPermission: 'MUTE_MEMBERS',
  usage: 'unMute @user-mention [Reason]',
  example: [ 'unMute @user#0001 Reason for the unmute.' ]
};
