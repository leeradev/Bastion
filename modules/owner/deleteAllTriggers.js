/**
 * @file deleteAllTriggers command
 * @author Sankarsan Kampa (a.k.a k3rn31p4nic)
 * @license MIT
 */

exports.run = (Bastion, message) => {
  if (!Bastion.credentials.ownerId.includes(message.author.id)) {
    /**
     * User has missing permissions.
     * @fires userMissingPermissions
     */
    return Bastion.emit('userMissingPermissions', this.help.userPermission);
  }

  Bastion.db.all('DELETE FROM triggers').then(() => {
    message.channel.send({
      embed: {
        color: Bastion.colors.red,
        description: 'Deleted all the triggers and responses.'
      }
    }).catch(e => {
      Bastion.log.error(e.stack);
    });
  }).catch(e => {
    Bastion.log.error(e.stack);
  });
};

exports.config = {
  aliases: [ 'delalltriggers', 'deletealltrips', 'delalltrips' ],
  enabled: true
};

exports.help = {
  name: 'deletealltriggers',
  description: 'Deletes all the triggers and responses.',
  botPermission: '',
  userPermission: 'BOT_OWNER',
  usage: 'deleteAllTriggers',
  example: []
};
