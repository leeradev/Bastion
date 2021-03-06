/**
 * @file quotes command
 * @author Sankarsan Kampa (a.k.a k3rn31p4nic)
 * @license MIT
 */

const getRandomInt = require('../../functions/getRandomInt');
const quotes = require('../../data/quotes.json');

exports.run = (Bastion, message, args) => {
  /*
   * Get a random quote
   */
  let index = getRandomInt(1, Object.keys(quotes).length);

  /**
   * If a quote number is provided, use that number.
   */
  if (!isNaN(args.number)) {
    /**
     * If the quote number exists
     */
    if (args.number >= 1 && args.number <= Object.keys(quotes).length) {
      index = args.number;
    }
  }
  /**
   * If a author is provided, use that author.
   */
  else if (args.author) {
    let authorQuoteIDs = [];
    /**
     * If the quotes list has a quote from the specified author, store it.
     */
    for (let i = 1; i <= Object.keys(quotes).length; i++) {
      if (quotes[i].author.search(new RegExp(args.author.join(' '), 'i')) !== -1) {
        authorQuoteIDs.push(i);
      }
    }
    /**
     * If the author has at least 1 quote, get a random quote number from it.
     */
    if (authorQuoteIDs.length > 0) {
      index = authorQuoteIDs[Math.floor(Math.random() * authorQuoteIDs.length)];
    }
  }

  message.channel.send({
    embed: {
      color: Bastion.colors.blue,
      description: `*"${quotes[index].quote}"*\n\n**${quotes[index].author}**`,
      footer: {
        text: `Quote Number: ${index}`
      }
    }
  }).catch(e => {
    Bastion.log.error(e.stack);
  });
};

exports.config = {
  aliases: [ 'q' ],
  enabled: true,
  argsDefinitions: [
    { name: 'number', type: Number, alias: 'n' },
    { name: 'author', type: String, alias: 'a', multiple: true }
  ]
};

exports.help = {
  name: 'quotes',
  description: 'Shows a quote to get you inspired. Search a quote by it\'s index no. or by the author. If none is provided, shows a random quote.',
  botPermission: '',
  userPermission: '',
  usage: 'quotes [ -n | -a Author Name]',
  example: [ 'quotes', 'quotes -n 189', 'quotes -a Albert Einstein' ]
};
