/**
* @file leet command
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

  args = args.join(' ');
  args = args.replace(/a/ig, '4');
  args = args.replace(/e/ig, '3');
  args = args.replace(/l/ig, '1');
  args = args.replace(/o/ig, '0');
  args = args.replace(/s/ig, '5');
  args = args.replace(/t/ig, '7');

  message.channel.send({
    embed: {
      color: Bastion.colors.blue,
      title: 'Leet Text',
      description: args
    }
  }).catch(e => {
    Bastion.log.error(e.stack);
  });
};

exports.config = {
  aliases: [ '1337' ],
  enabled: true
};

exports.help = {
  name: 'leet',
  description: 'Changes a given text to leet text.',
  botPermission: '',
  userPermission: '',
  usage: 'leet <text>',
  example: [ 'leet Hello, Everyone!' ]
};
