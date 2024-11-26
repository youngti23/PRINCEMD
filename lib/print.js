import { WAMessageStubType } from '@whiskeysockets/baileys'
import PhoneNumber from 'awesome-phonenumber'
import chalk from 'chalk'
import { watchFile } from 'fs'

const terminalImage = global.opts['img'] ? require('terminal-image') : ''
const urlRegex = (await import('url-regex-safe')).default({ strict: false })

export default async function (m, conn = { user: {} }) {
  // Replace sensitive sender information with "MASKED"
  let senderNumber = 'MASKED'
  let _name = 'Unknown User' // Default name if not available
  try {
    _name = await conn.getName(m.sender) || 'Unknown User'
  } catch { /* Ignore errors */ }
  let sender = `${senderNumber} ~ ${_name}`

  // Replace sensitive chat information with "MASKED"
  let chat = 'MASKED Chat' // Default for chat name

  // Ensure messages don't leak sensitive info
  let img
  try {
    if (global.opts['img'])
      img = /sticker|image/gi.test(m.mtype) ? await terminalImage.buffer(await m.download()) : false
  } catch (e) {
    console.error(e)
  }

  let filesize = (m.msg ?
    m.msg.vcard ?
      m.msg.vcard.length :
      m.msg.fileLength ?
        m.msg.fileLength.low || m.msg.fileLength :
        m.msg.axolotlSenderKeyDistributionMessage ?
          m.msg.axolotlSenderKeyDistributionMessage.length :
          m.text ?
            m.text.length :
            0
    : m.text ? m.text.length : 0) || 0

  // Replace bot's information with "MASKED"
  let me = 'MASKED Bot'

  console.log(`
${chalk.hex('#FE0041').bold('┎━─━─━─━─━─━─━━──━━──━')}
🤖 ${chalk.cyan('%s')} ⏰ ${chalk.black(chalk.bgGreen('%s'))} 📁 ${chalk.black(chalk.bgGreen('%s'))} ${chalk.magenta('%s [%s %sB]')} 
👤 ${chalk.redBright('%s')} 🪙 ${chalk.yellow('%s%s')} ${chalk.blueBright('en')} 
👥 ${chalk.green('%s')} ${chalk.black(chalk.bgYellow('%s'))}
${chalk.hex('#FE0041').bold('┕━─━─━─━─━─━─━━──━━──━')}
`.trim(),
    me + ' ~ MASKED', // Replace bot info
    (m.messageTimestamp ? new Date(1000 * (m.messageTimestamp.low || m.messageTimestamp)) : new Date).toLocaleTimeString('es-ES', { timeZone: 'Asia/Karachi' }),
    m.messageStubType ? WAMessageStubType[m.messageStubType] : '',
    filesize,
    filesize === 0 ? 0 : (filesize / 1009 ** Math.floor(Math.log(filesize) / Math.log(1000))).toFixed(1),
    ['', ...'KMGTP'][Math.floor(Math.log(filesize) / Math.log(1000))] || '',
    sender,
    m ? m.exp : '?',
    'MASKED Data',
    chat,
    m.mtype ? m.mtype.replace(/message$/i, '').replace('audio', m.msg.ptt ? 'PTT' : 'audio').replace(/^./, v => v.toUpperCase()) : ''
  )
  if (img) console.log(img.trimEnd())
  if (typeof m.text === 'string' && m.text) {
    let log = 'Message content hidden for privacy.' // Hide message content entirely
    console.log(log)
  }
  if (m.messageStubParameters) console.log('Message stub parameters are hidden.') // Hide stub parameters
  if (/document/i.test(m.mtype)) console.log(`📄 Document file name hidden.`)
  else if (/ContactsArray/i.test(m.mtype)) console.log(`👥 Contact list hidden.`)
  else if (/contact/i.test(m.mtype)) console.log(`👤 Contact name hidden.`)
  else if (/audio/i.test(m.mtype)) {
    const duration = m.msg.seconds
    console.log(`🎶 Audio file (${Math.floor(duration / 60).toString().padStart(2, 0)}:${(duration % 60).toString().padStart(2, 0)})`)
  }

  console.log()
}

let file = global.__filename(import.meta.url)
watchFile(file, () => {
  console.log(chalk.redBright("Update 'lib/print.js'"))
})
