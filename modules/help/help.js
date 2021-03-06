/**
 * @file help command
 * @author Sankarsan Kampa (a.k.a k3rn31p4nic)
 * @license MIT
 */

exports.run = (Bastion, message, args) => {
  if (args.command) {
    let channel, command = args.command.toLowerCase();
    if (Bastion.commands.has(command) || Bastion.aliases.has(command)) {
      if (Bastion.commands.has(command)) {
        command = Bastion.commands.get(command);
      }
      else if (Bastion.aliases.has(command)) {
        command = Bastion.commands.get(Bastion.aliases.get(command));
      }
      let example = [];
      if (command.help.example.length < 1) {
        example.push('-');
      }
      else {
        for (let i = 0; i < command.help.example.length; i++) {
          example.push(`\`${Bastion.config.prefix}${command.help.example[i]}\``);
        }
      }

      if (args.dm) {
        channel = message.author;
      }
      else {
        channel = message.channel;
      }

      channel.send({
        embed: {
          color: Bastion.colors.yellow,
          fields: [
            {
              name: 'Command',
              value: command.help.name,
              inline: true
            },
            {
              name: 'Aliases',
              value: command.config.aliases.join(', ') || '-',
              inline: true
            },
            {
              name: 'Description',
              value: command.help.description,
              inline: false
            },
            {
              name: 'BOT Permissions',
              value: command.help.botPermission || '-',
              inline: true
            },
            {
              name: 'User Permissions',
              value: command.help.userPermission || '-',
              inline: true
            },
            {
              name: 'Usage',
              value: `\`${Bastion.config.prefix}${command.help.usage}\``,
              inline: false
            },
            {
              name: 'Example',
              value: example.join('\n'),
              inline: false
            }
          ],
          footer: {
            text: command.config.enabled ? '' : 'This command is temporarily disabled.'
          }
        }
      }).catch(e => {
        Bastion.log.error(e.stack);
      });
    }
    else {
      message.channel.send({
        embed: {
          color: Bastion.colors.red,
          description: `There's no **${args.command}** command`
        }
      }).catch(e => {
        Bastion.log.error(e.stack);
      });
    }
  }
  else {
    message.channel.send({
      embed: {
        color: Bastion.colors.yellow,
        title: 'Help',
        description: `To get a list of commands, type \`${Bastion.config.prefix}commands\`.\nTo get help about a specific command, type \`${Bastion.config.prefix}help command_name\`.\n\nNeed help or support with Bastion Discord BOT?\nJoin Bastion Support Server for any help you need.\nhttps://discord.gg/fzx8fkt\n\nSee your DM from me, for invite links.`,
        footer: {
          text: `Prefix: ${Bastion.config.prefix} | Total Commands: ${Bastion.commands.size}`
        }
      }
    }).catch(e => {
      Bastion.log.error(e.stack);
    });
    message.author.send({
      embed: {
        color: Bastion.colors.blue,
        title: 'Bastion Discord BOT',
        url: 'https://bastion.js.org',
        description: 'Join [**Bastion Support Server**](https://discord.gg/fzx8fkt) for testing the commands or any help you need with the bot or maybe just for fun.',
        fields: [
          {
            name: 'Support Server Invite Link',
            value: 'https://discord.gg/fzx8fkt'
          },
          {
            name: 'BOT Invite Link',
            value: `https://discordapp.com/oauth2/authorize?client_id=${message.client.user.id}&scope=bot&permissions=2146958463`
          }
        ],
        thumbnail: {
          url: message.client.user.displayAvatarURL
        },
        footer: {
          text: 'Copyright © 2017 Sankarsan Kampa'
        }
      }
    }).catch(e => {
      message.client.log.error(e.stack);
    });
  }
};

exports.config = {
  aliases: [ 'h' ],
  enabled: true,
  argsDefinitions: [
    { name: 'command', type: String, alias: 'c', defaultOption: true },
    { name: 'dm', type: Boolean }
  ]
};

exports.help = {
  name: 'help',
  description: 'Shows all the available commands. If a command name is specified as a argument, shows help about that command and if the `--dm` flag is provided with that, it will DM you the help rather than posting it in the server.',
  botPermission: '',
  userPermission: '',
  usage: 'help [command_name [--dm]]',
  example: [ 'help', 'help magic8ball', 'help acrophobia --dm' ]
};
