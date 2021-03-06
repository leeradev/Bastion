/**
 * @file echo command
 * @author Sankarsan Kampa (a.k.a k3rn31p4nic)
 * @license MIT
 */

exports.run = (Bastion, message, args) => {
  if (args.length < 1) {
    /**
     * The command was ran with invalid parameters.
     * @fires commandUsage
     */
    return Bastion.emit('commandUsage', message, this.help);
  }

  message.channel.send({
    embed: {
      color: Bastion.colors.dark_grey,
      description: args.join(' ')
    }
  }).catch(e => {
    Bastion.log.error(e.stack);
  });
};

exports.config = {
  aliases: [ 'say' ],
  enabled: true
};

exports.help = {
  name: 'echo',
  description: 'Sends the same message that you send as an argument. Just like an echo!',
  botPermission: '',
  userPermission: '',
  usage: 'echo <text>',
  example: [ 'echo Hello, world!' ]
};
