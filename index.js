const { Client, Intents, MessageEmbed } = require('discord.js');
const { token, prefix, uid, auth, server } = require('./config.json');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const isImageUrl = require('is-image-url');
const axios = require('axios');
const FormData = require('form-data');

client.once('ready', () => {
  console.log('Ready!');
});

client.on('message', async msg => {
  if (!msg.content.startsWith(prefix) || msg.author.bot || msg.author.id !== uid) return;
  const args = msg.content.slice(prefix.length).trim().split(' ');
  const command = args.shift().toLowerCase();
  if (command === "help") {
    msg.channel.send(generateHelpMsg());
  }
  else if (command === "upload") {
    if (isImageUrl(args[0])) {
      var res = await upload(args[0]);
      msg.channel.send(res);
    }
    else {
      msg.channel.send("Please provide a valid image URL!");
    }
  }
  else {
    msg.channel.send("Unknown command.");
  }
});

async function upload(url) {
  let ir = await axios({
    url: url,
    method: 'GET',
    responseType: 'arraybuffer'
  });
  const form = new FormData();
  form.append('file', ir.data, {
    contentType: 'image/png',
    name: 'file',
    filename: 'image.png'
  });
  let result = await axios({
    url: `${server}/api/upload`,
    method: "POST",
    data: form,
    headers: {
      "Content-Type": `multipart/form-data; boundary=${form._boundary}`,
      "Authorization": auth,
      "Embed": "true"
    }
  }).then(r => r.data);
  if (result.url === undefined) {
    return `Couldn't upload the image\n${result.error}`;
  }
  return `Image uploaded!\nURL: ${result.url}`;
}

function generateHelpMsg() {
  return new MessageEmbed()
    .setAuthor("Axtral")
    .addFields(
      { name: "upload [url]", value: "Upload a new image." },
      { name: "help", value: "Show this message." })
    .setTimestamp()
    .setColor("#7289DA")
    .setTitle("Command usage");
}
client.login(token);