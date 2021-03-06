/**
 * @file deleteTodo command
 * @author Sankarsan Kampa (a.k.a k3rn31p4nic)
 * @license MIT
 */

exports.run = (Bastion, message, args) => {
  if (!Bastion.credentials.ownerId.includes(message.author.id)) {
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

  Bastion.db.get(`SELECT * FROM todo WHERE ownerID=${message.author.id}`).then(todo => {
    if (!todo) {
      message.channel.send({
        embed: {
          color: Bastion.colors.red,
          title: 'Todo list not found',
          description: `${message.author.username}, you haven't created a todo list.`
        }
      }).catch(e => {
        Bastion.log.error(e.stack);
      });
    }
    else {
      let list = JSON.parse(todo.list);
      if (index >= list.length) {
        return message.channel.send({
          embed: {
            color: Bastion.colors.red,
            description: 'That index was not found.'
          }
        }).catch(e => {
          Bastion.log.error(e.stack);
        });
      }
      let deletedItem = list[parseInt(args[0]) - 1];
      list.splice(parseInt(args[0]) - 1, 1);
      Bastion.db.run(`UPDATE todo SET list='${JSON.stringify(list)}' WHERE ownerID=${message.author.id}`).then(() => {
        message.channel.send({
          embed: {
            color: Bastion.colors.red,
            description: `${message.author.username}, I've deleted **${deletedItem}** from your todo list.`
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
  aliases: [ 'deltodo' ],
  enabled: true
};

exports.help = {
  name: 'deletetodo',
  description: 'Deletes an item from your todo list by it\'s index number.',
  botPermission: '',
  userPermission: 'BOT_OWNER',
  usage: 'deleteTodo <index>',
  example: [ 'deleteTodo 3' ]
};
