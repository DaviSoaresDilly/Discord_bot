const {Client, GatewayIntentBits} = require('discord.js');

// Constantes
const BASE_CATEGORY_NAME = 'Nova Categoria';
const MODEL_CATEGORY_NAME = 'Categoria Modelo';

// Cria o cliente do bot
const client = new Client({
  intents: [ 
    GatewayIntentBits.GUILDS,
    GatewayIntentBits.GUILD_MESSAGES,
    GatewayIntentBits.GUILD_MESSAGE_REACTIONS,
    GatewayIntentBits.GUILD_MESSAGE_TYPING,
    GatewayIntentBits.MESSAGE_CONTENT
    ],
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async message => {
  if (!message.content.startsWith('!replicar-categoria')) return;

  const args = message.content.split(' ');
  const numCategorias = parseInt(args[1], 10) || 1;
  const modelName = args.slice(2).join(' ') || MODEL_CATEGORY_NAME;

  // Procura pela categoria modelo
  const modelCategory = message.guild.channels.cache.find(
    c => c.name === modelName && c.type === 'category'
  );
  
  if (!modelCategory) {
    return message.reply(`Categoria modelo "${modelName}" não encontrada.`);
  }

  for (let i = 1; i <= numCategorias; i++) {
    const newCategoryName = `${BASE_CATEGORY_NAME} ${i}`;
    try {
      const newCategory = await message.guild.channels.create(newCategoryName, {
        type: 'category',
        position: modelCategory.position,
        permissionOverwrites: modelCategory.permissionOverwrites
      });

      // Replica os canais da categoria modelo para a nova categoria
      modelCategory.children.forEach(async channel => {
        const newChannel = await message.guild.channels.create(channel.name, {
          type: channel.type,
          parent: newCategory,
          permissionOverwrites: channel.permissionOverwrites
        });
      });

      message.reply(`Categoria ${newCategoryName} criada com sucesso.`);
    } catch (error) {
      console.error(error);
      message.reply(`Erro ao criar categoria ${newCategoryName}.`);
    }
  }
});

client.login('TOKEN_DO_BOT');
