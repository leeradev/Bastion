/**
 * @file removeSelfAssignableRole command
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

  Bastion.db.get(`SELECT selfAssignableRoles FROM guildSettings WHERE guildID=${message.guild.id}`).then(row => {
    if (!row || row.selfAssignableRoles === '[]') {
      message.channel.send({
        embed: {
          color: Bastion.colors.red,
          description: 'No self assignable roles found.'
        }
      }).catch(e => {
        Bastion.log.error(e.stack);
      });
    }
    else {
      let roles = JSON.parse(row.selfAssignableRoles);
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
      Bastion.db.run(`UPDATE guildSettings SET selfAssignableRoles='${JSON.stringify(roles)}' WHERE guildID=${message.guild.id}`).then(() => {
        message.channel.send({
          embed: {
            color: Bastion.colors.red,
            description: `I've deleted **${message.guild.roles.get(deletedRoleID).name}** from self assignable roles.`
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
  aliases: [ 'rsar' ],
  enabled: true
};

exports.help = {
  name: 'removeselfassignablerole',
  description: 'Deletes a role from the self assignable roles by it\'s index number.',
  botPermission: '',
  userPermission: 'ADMINISTRATOR',
  usage: 'removeSelfAssignableRole <index>',
  example: [ 'removeSelfAssignableRole 3' ]
};
