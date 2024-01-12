const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('fs/promises');
const config = require('../config.json');
const CatLoggr = require('cat-loggr');

const log = new CatLoggr();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('servis-oluştur')
		.setDescription('Yeni bir servis oluştur. (Yönetici komutu.)')
		.addStringOption(option =>
			option.setName('service')
				.setDescription('Hangi servis oluşturmak istiyorsun?')
				.setRequired(true)
		)
		.addStringOption(option =>
			option.setName('type')
				.setDescription('The type of service (free or premium)')
				.setRequired(true)
				.addChoices(
					{ name: 'Ucretsiz', value: 'free' },
					{ name: 'Premium', value: 'premium' },
				)),

	async execute(interaction) {
		const service = interaction.options.getString('service');
		const type = interaction.options.getString('type');

		if (!interaction.member.permissions.has('ADMINATOR')) {
			const errorEmbed = new MessageEmbed()
				.setColor(config.color.red)
				.setTitle('Yetersiz İzin!')
				.setDescription('🛑 Yönetici iznine sahip olmalısın HEHEHE')
				.setFooter(interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true, size: 64 }))
				.setTimestamp();
			return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
		}

		if (!service) {
			const missingParamsEmbed = new MessageEmbed()
				.setColor(config.color.red)
				.setTitle('Servis Bulunamadı!')
				.setDescription('Servisi yanlış veya eksik seçtiniz!')
				.setFooter(interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true, size: 64 }))
				.setTimestamp();
			return interaction.reply({ embeds: [missingParamsEmbed], ephemeral: true });
		}

		let filePath;
		if (type === 'free') {
			filePath = `${__dirname}/../free/${service}.txt`;
		} else if (type === 'premium') {
			filePath = `${__dirname}/../premium/${service}.txt`;
		} else {
			const invalidTypeEmbed = new MessageEmbed()
				.setColor(config.color.red)
				.setTitle('Servis Tipi Bulunamadı!')
				.setDescription('Servis tipi "ücretsiz" veya "premium" olmalıdır!')
				.setFooter(interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true, size: 64 }))
				.setTimestamp();
			return interaction.reply({ embeds: [invalidTypeEmbed], ephemeral: true });
		}

		try {
			await fs.writeFile(filePath, '');
			const successEmbed = new MessageEmbed()
				.setColor(config.color.green)
				.setTitle('Servis Oluşturuldu!')
				.setDescription(`Yeni servis **${type}** \`${service}\` oluşturuldu!
        `)
				.setFooter(interaction.user.tag, interaction.user.displayAvatarURL())
				.setTimestamp();

			interaction.reply({ embeds: [successEmbed], ephemeral: true });
		} catch (error) {
			log.error(error);
			return interaction.reply('An error occurred while creating the service.');
		}
	},
};