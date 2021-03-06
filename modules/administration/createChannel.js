/**
 * @file createChannel command
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
  if (!message.guild.me.hasPermission(this.help.botPermission)) {
    /**
     * Bastion has missing permissions.
     * @fires bastionMissingPermissions
     */
    return Bastion.emit('bastionMissingPermissions', this.help.botPermission, message);
  }
  if (!args.name) {
    /**
     * The command was ran with invalid parameters.
     * @fires commandUsage
     */
    return Bastion.emit('commandUsage', message, this.help);
  }

  args.name = args.name.join('-');
  if (args.length < 2 || args.name.length > 100) {
    return message.channel.send({
      embed: {
        color: Bastion.colors.red,
        description: 'Channel name should be between 2 and 100 characters.'
      }
    }).catch(e => {
      Bastion.log.error(e.stack);
    });
  }

  let channelType = 'text';
  if (!args.text && args.voice) {
    channelType = 'voice';
  }
  else {
    args.name = args.name.replace(' ', '-');
  }

  message.guild.createChannel(args.name, channelType).then(channel => {
    message.channel.send({
      embed: {
        color: Bastion.colors.green,
        title: `${channelType.charAt(0).toUpperCase() + channelType.substr(1)} Channel Created`,
        fields: [
          {
            name: 'Channel Name',
            value: channel.name,
            inline: true
          },
          {
            name: 'Channel ID',
            value: channel.id,
            inline: true
          }
        ]
      }
    }).catch(e => {
      Bastion.log.error(e.stack);
    });
  }).catch(e => {
    Bastion.log.error(e.stack);
  });
};

exports.config = {
  aliases: [ 'createc' ],
  enabled: true,
  argsDefinitions: [
    { name: 'name', type: String, alias: 'n', multiple: true, defaultOption: true },
    { name: 'text', type: Boolean, alias: 't' },
    { name: 'voice', type: Boolean, alias: 'v' }
  ]
};

exports.help = {
  name: 'createchannel',
  description: 'Creates a new text/voice channel with a given name.',
  botPermission: 'MANAGE_CHANNELS',
  userPermission: 'MANAGE_CHANNELS',
  usage: 'createChannel [-t | -v] <Channel Name>',
  example: [ 'createChannel -t Text Channel Name', 'createChannel -v Voice Channel Name', 'createChannel Text Channel Name' ]
};
