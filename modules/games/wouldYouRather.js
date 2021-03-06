/**
 * @file wouldYouRather command
 * @author Sankarsan Kampa (a.k.a k3rn31p4nic)
 * @license MIT
 */

const question = require('../../data/wouldYouRather.json');

exports.run = (Bastion, message) => {
  message.channel.send({
    embed: {
      color: Bastion.colors.blue,
      description: question[Math.floor(Math.random() * question.length)]
      // description: question.random()
    }
  }).catch(e => {
    Bastion.log.error(e.stack);
  });
};

exports.config = {
  aliases: [ 'wouldyou' ],
  enabled: true
};

exports.help = {
  name: 'wouldyourather',
  description: 'Asks you a would you rather question! Let\'s see how you answer that.',
  botPermission: '',
  userPermission: '',
  usage: 'wouldYouRather',
  example: []
};
