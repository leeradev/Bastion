/**
 * @file removeAutoAssignableRole command
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

  let index = parseInt(args[0]);
  if (!index || index <= 0) {
    /**
     * The command was ran with invalid parameters.
     * @fires commandUsage
     */
    return Bastion.emit('commandUsage', message, this.help);
  }
  index -= 1;

  Bastion.db.get(`SELECT autoAssignableRoles FROM guildSettings WHERE guildID=${message.guild.id}`).then(row => {
    if (!row || row.autoAssignableRoles === '[]') {
      message.channel.send({
        embed: {
          color: Bastion.colors.red,
          description: 'No auto assignable roles found.'
        }
      }).catch(e => {
        Bastion.log.error(e.stack);
      });
    }
    else {
      let roles = JSON.parse(row.autoAssignableRoles);
      if (index >= roles.length) {
        return message.channel.send({
          embed: {
            color: Bastion.colors.red,
            description: 'That index was not found.'
          }
        }).catch(e => {
          Bastion.log.error(e.stack);
        });
      }
      let deletedRoleID = roles[parseInt(args[0]) - 1];
      roles.splice(parseInt(args[0]) - 1, 1);
      Bastion.db.run(`UPDATE guildSettings SET autoAssignableRoles='${JSON.stringify(roles)}' WHERE guildID=${message.guild.id}`).then(() => {
        message.channel.send({
          embed: {
            color: Bastion.colors.red,
            description: `I've deleted **${message.guild.roles.get(deletedRoleID).name}** from auto assignable roles.`
          }
        }).catch(e => {
          Bastion.log.error(e.stack);
        });
      }).catch(e => {
        Bastion.log.error(e.stack);
      });
    }
  }).catch(e => {
    Bastion.log.error(e.stack);
  });
};

exports.config = {
  aliases: [ 'raar' ],
  enabled: true
};

exports.help = {
  name: 'removeautoassignablerole',
  description: 'Deletes a role from the auto assignable roles by it\'s index number.',
  botPermission: '',
  userPermission: 'ADMINISTRATOR',
  usage: 'removeAutoAssignableRole <index>',
  example: [ 'removeAutoAssignableRole 3' ]
};
