const { Client, Intents, MessageEmbed } = require('discord.js');
const { token, prefix, uid, auth, server } = require('./config.json');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const isImageUrl = require('is-image-url');
const axios = require('axios');
const FormData = require('form-data');
const allowedFileTypes = [ 'jpeg', 'jpg', 'tiff', 'png', 'gif' ];
client.once('ready', () => {
  console.log('Ready!');
});

client.on('message', async msg => {
  if (!msg.content.startsWith(prefix) || msg.author.bot || msg.author.id !== uid) return;
  const args = msg.content.slice(prefix.length).trim().split(' ');
  const command = args.shift().toLowerCase();
  if (command === "help") {
    msg.channel.send(genHelpMsg());
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

function isValidCt(ct) {
  let arr = ct.split("/");
  let type = arr[0];
  let subtype = arr[1];
  if (type === 'image' && allowedFileTypes.includes(subtype)) {
    return true;
  }
  return false;
}

async function upload(url) {
  let ir = await axios({
    url: url,
    method: 'GET',
    responseType: 'arraybuffer'
  });
  const ct = ir.headers['content-type'];
  if (!isValidCt(ct)) {
    return "Invalid file type!";
  }
  const form = new FormData();
  form.append('file', ir.data, {
    contentType: ct,
    name: 'file',
    filename: `image.${ct.split("/")[1]}`
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

function genHelpMsg() {
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
