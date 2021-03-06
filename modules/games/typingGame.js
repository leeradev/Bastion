/**
 * @file typingGame command
 * @author Sankarsan Kampa (a.k.a k3rn31p4nic)
 * @license MIT
 */

const getRandomInt = require('../../functions/getRandomInt');
const typingArticles = require('../../data/typingArticles.json');
let activeChannels = [];

exports.run = (Bastion, message) => {
  if (!activeChannels.includes(message.channel.id)) {
    activeChannels.push(message.channel.id);

    message.channel.send({
      embed: {
        color: Bastion.colors.blue,
        title: 'Typing Game',
        description: `Game started by ${message.author}. Type the following text and send in this channel ASAP. The first one to do so will be the winner.\nAnd please do not Copy & Paste the text, play fairly.`,
        footer: {
          text: `You have ${5} minutes to make your submission.`
        }
      }
    }).then(msg => {
      let index = getRandomInt(1, Object.keys(typingArticles).length);
      message.channel.send({
        embed: {
          color: Bastion.colors.blue,
          description: typingArticles[index]
        }
      }).then(articleMessage => {
        const collector = message.channel.createMessageCollector(
          msg => msg.content === typingArticles[index],
          {
            time: 5 * 60 * 1000,
            maxMatches: 1
          }
        );
        collector.on('end', (collection, reason) => {
          let color, result;
          if (reason === 'time') {
            color = Bastion.colors.red;
            result = 'Game ended. Unfortunately, no one was able to type the article on time.';
          }
          else {
            color = Bastion.colors.blue;
            result = `Game ended. Congratulations ${collection.map(m => m.author)[0]}! You won it.`;
          }
          message.channel.send({
            embed: {
              color: color,
              title: 'Typing Game',
              description: result
            }
          }).then(() => {
            msg.delete().catch(e => {
              Bastion.log.error(e.stack);
            });
            articleMessage.delete().catch(e => {
              Bastion.log.error(e.stack);
            });
            activeChannels = activeChannels.slice(activeChannels.indexOf(message.channel.id) + 1, 1);
          }).catch(e => {
            Bastion.log.error(e.stack);
          });
        });
      }).catch(e => {
        Bastion.log.error(e.stack);
      });
    }).catch(e => {
      Bastion.log.error(e.stack);
    });
  }
  else {
    message.channel.send({
      embed: {
        color: Bastion.colors.red,
        description: 'Can\'t start a typing game now. A typing game is already running in this channel.\nPlease wait for it to end, or wait for 5 mins to end it automatically.'
      }
    }).catch(e => {
      Bastion.log.error(e.stack);
    });
  }
};

exports.config = {
  aliases: [ 'typegame' ],
  enabled: true
};

exports.help = {
  name: 'typinggame',
  description: 'Starts a typing speed competition. The user to type the given article and send it first, wins. It automatically ends in 5 mins if no one is able to type the article by this time.',
  botPermission: '',
  userPermission: '',
  usage: 'typingGame',
  example: []
};
