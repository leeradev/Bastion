/**
 * @file leaderboard command
 * @author Sankarsan Kampa (a.k.a k3rn31p4nic)
 * @license MIT
 */

exports.run = (Bastion, message, args) => {
  Bastion.db.all('SELECT userID, bastionCurrencies FROM profiles ORDER BY bastionCurrencies DESC').then(profiles => {
    let fields = [];

    if (!args.global) {
      profiles = profiles.filter(p => message.guild.members.get(p.userID));
    }
    profiles = profiles.slice(0, 10);

    for (let i = 0; i < profiles.length; i++) {
      let user = message.guild.members.map(m => m.id).includes(profiles[i].userID) ? message.guild.members.get(profiles[i].userID).user.tag : profiles[i].userID;
      fields.push({
        name: `${i + 1}. ${user}`,
        value: `${profiles[i].bastionCurrencies} Bastion Currencies`,
        inline: true
      });
    }

    message.channel.send({
      embed: {
        color: Bastion.colors.blue,
        title: 'Leaderboard',
        description: `Top ${profiles.length} users with highest Bastion Currencies`,
        fields: fields
      }
    }).catch(e => {
      Bastion.log.error(e.stack);
    });
  }).catch(e => {
    Bastion.log.error(e.stack);
  });
};

exports.config = {
  aliases: [ 'lb' ],
  enabled: true,
  argsDefinitions: [
    { name: 'global', type: Boolean, alias: 'g' }
  ]
};

exports.help = {
  name: 'leaderboard',
  description: 'Shows the top 10 ranking with the highest amount of Bastion Currencies from all the members of the server. If used with the `--global` flap, it shows the ranking of all users of the bot.',
  botPermission: '',
  userPermission: '',
  usage: 'leaderboard [--global]',
  example: [ 'leaderboard', 'leaderboard --global' ]
};
