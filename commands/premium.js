const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const fs = require("fs");
const config = require("../config.json");
const CatLoggr = require("cat-loggr");

const log = new CatLoggr();
const generated = new Set();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("premium")
    .setDescription("Premium hizmeti kullan.")
    .addStringOption((option) =>
      option
        .setName("service")
        .setDescription("Kullanılacak hizmet ismi.")
        .setRequired(true),
    ),

  async execute(interaction) {
    const service = interaction.options.getString("service");
    const member = interaction.member;

    // Check if the channel where the command was used is the generator channel
    if (interaction.channelId !== config.premiumChannel) {
      const wrongChannelEmbed = new MessageEmbed()
        .setColor(config.color.red)
        .setTitle("Yanlış Komut Kullanımı!")
        .setDescription(
          `Bu kanalda \`/premium\` komutunu kullanamazsınız! <#${config.premiumChannel}>'da deneyin!`,
        )
        .setFooter(
          interaction.user.tag,
          interaction.user.displayAvatarURL({ dynamic: true, size: 64 }),
        )
        .setTimestamp();

      return interaction.reply({
        embeds: [wrongChannelEmbed],
        ephemeral: true,
      });
    }

    // Check if the user has cooldown on the command
    if (generated.has(member.id)) {
      const cooldownEmbed = new MessageEmbed()
        .setColor(config.color.red)
        .setTitle("Sakin Ol!")
        .setDescription(
          `Bu komutu tekrar çalıştırmadan önce lütfen **${config.premiumCooldown}** saniye bekleyin!`,
        )
        .setFooter(
          interaction.user.tag,
          interaction.user.displayAvatarURL({ dynamic: true, size: 64 }),
        )
        .setTimestamp();

      return interaction.reply({ embeds: [cooldownEmbed], ephemeral: true });
    }

    // File path to find the given service
    const filePath = `${__dirname}/../premium/${service}.txt`;

    // Read the service file
    fs.readFile(filePath, "utf-8", (error, data) => {
      if (error) {
        const notFoundEmbed = new MessageEmbed()
          .setColor(config.color.red)
          .setTitle("Generator Hata!")
          .setDescription(`\`${service}\` hizmeti mevcut değil!`)
          .setFooter(
            interaction.user.tag,
            interaction.user.displayAvatarURL({ dynamic: true, size: 64 }),
          )
          .setTimestamp();

        return interaction.reply({ embeds: [notFoundEmbed], ephemeral: true });
      }

      const lines = data.split(/\r?\n/);

      if (lines.length <= 1) {
        const emptyServiceEmbed = new MessageEmbed()
          .setColor(config.color.red)
          .setTitle("Generator Hatası!")
          .setDescription(`\`${service}\` hizmetinin Stokları Yok!`)
          .setFooter(
            interaction.user.tag,
            interaction.user.displayAvatarURL({ dynamic: true, size: 64 }),
          )
          .setTimestamp();

        return interaction.reply({
          embeds: [emptyServiceEmbed],
          ephemeral: true,
        });
      }

      const generatedAccount = lines[0];

      // Remove the redeemed account line
      lines.shift();
      const updatedData = lines.join("\n");

      // Write the updated data back to the file
      fs.writeFile(filePath, updatedData, (writeError) => {
        if (writeError) {
          log.error(writeError);
          return interaction.reply("Hesabı kullanırken bir hata oluştu.");
        }

        const embedMessage = new MessageEmbed()
          .setColor(config.color.green)
          .setTitle("Premium Hesap Oluşturuldu!")
          .setFooter(
            interaction.user.tag,
            interaction.user.displayAvatarURL({ dynamic: true, size: 64 }),
          )
          .setDescription(
            "🙏 Premium üye olduğunuz için çok teşekkür ederiz! \n 🌟 Desteğiniz bizim için dünyalara bedel! 💖😊",
          )
          .addField(
            "Servis",
            `\`\`\`${service[0].toUpperCase()}${service
              .slice(1)
              .toLowerCase()}\`\`\``,
            true,
          )
          .addField("Hesap", `\`\`\`${generatedAccount}\`\`\``, true)
          .setImage(config.banner)
          .setTimestamp();

        member
          .send({ embeds: [embedMessage] })
          .catch((error) =>
            console.error(`Error sending embed message: ${error}`),
          );
        interaction.reply({
          content: `**DM ${member} Kutunuzu kontrol edin!**\n\n__**Not:**Mesajı almazsanız lütfen hesabınızın DM kilidini açın!__`,
        });

        generated.add(member.id);
        setTimeout(() => {
          generated.delete(member.id);
        }, config.premiumCooldown * 1000);
      });
    });
  },
};
