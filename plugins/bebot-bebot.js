// PRINCE PROPERTY DON'T TOUCH IT OTHERWISE YOU WILL BE FAMOUS IN THE DEPLOYERS AS A CODE THEIF AND JUNIOR DEVELOPER




const { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, MessageRetryMap, makeCacheableSignalKeyStore, jidNormalizedUser, PHONENUMBER_MCC } = await import('@whiskeysockets/baileys')
import moment from 'moment-timezone'
import PhoneNumber from 'awesome-phonenumber'
import NodeCache from 'node-cache'
import readline from 'readline'
import qrcode from "qrcode"
import { fileURLToPath } from 'url'
import crypto from 'crypto'
import fs from "fs"
import { readFileSync } from 'fs'
import { join, dirname} from 'path'
import path from 'path'
import pino from 'pino'
import * as ws from 'ws'
const { CONNECTING } = ws
import { Boom } from '@hapi/boom'

import { makeWASocket } from '../lib/simple.js'

if (global.conns instanceof Array) console.log()
else global.conns = []

const __dirname = dirname(fileURLToPath(import.meta.url))
const packageJsonPath = join(__dirname, '../package.json')
const { name, author, version: versionSB, description } = JSON.parse(readFileSync(packageJsonPath, 'utf8'))


let folderBot = 'lib/bebots', nameBotMD = 'PRINCEMD', opcion = '';

let handler = async (m, { conn: _conn, args, usedPrefix, command, isOwner, text }) => {
  let parent = args[0] && args[0] === 'plz' ? _conn : await global.conn;
  text = (text ? text : (args[0] ? args[0] : '')).toLowerCase();

  let message1 = `**You can use this command only in the main bot, you can go to it via \n Click on the link\n\nwa.me/${global.conn.user.jid.split('@')[0]}?text=${usedPrefix}jadibot`;

  if (!((args[0] && args[0] === 'plz') || (await global.conn).user.jid === _conn.user.jid) && !m.fromMe) {
    return _conn.sendMessage(m.chat, { text: message1 }, { quoted: m });
  }

  let authFolderB = crypto.randomBytes(10).toString('hex').slice(0, 8);

  async function serbot() {
    // Path resolution using path.join
    const authFolderPath = join(__dirname, folderBot, authFolderB);
    const credsFilePath = join(authFolderPath, "creds.json");

    // Create folder if it doesn't exist
    if (!fs.existsSync(authFolderPath)) {
      fs.mkdirSync(authFolderPath, { recursive: true });
    }

    // Write creds.json if args[0] is provided
    if (args[0]) {
      fs.writeFileSync(
        credsFilePath,
        JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t')
      );
    }

    const { state, saveState, saveCreds } = await useMultiFileAuthState(authFolderPath);
    const msgRetryCounterMap = (MessageRetryMap) => { };
    const msgRetryCounterCache = new NodeCache();
    const { version } = await fetchLatestBaileysVersion();
    let phoneNumber = m.sender.split('@')[0];

    const methodCodeQR = text.includes('qr') || false;
    const methodCode = text.includes('code') || true;
    const MethodMobile = process.argv.includes("mobile");

    const connectionOptions = {
      logger: pino({ level: 'silent' }),
      printQRInTerminal: opcion === '1' ? true : methodCodeQR,
      mobile: MethodMobile,
      browser: opcion === '1' ? [`${nameBotMD} (sub bot)`, 'Edge', '2.0.0'] : ['Ubuntu', 'Edge', '110.0.1587.56'],
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" }))
      },
      markOnlineOnConnect: true,
      generateHighQualityLinkPreview: true,
      getMessage: async (clave) => {
        let jid = jidNormalizedUser(clave.remoteJid);
        let msg = await store.loadMessage(jid, clave.id);
        return msg?.message || "";
      },
      msgRetryCounterCache,
      msgRetryCounterMap,
      defaultQueryTimeoutMs: undefined,
      version
    };

    let conn = makeWASocket(connectionOptions);
    conn.isInit = false;
    let isInit = true;

    let cleanedNumber = phoneNumber.replace(/[^0-9]/g, '');

    let txt = '';
    if (!fs.existsSync(credsFilePath)) {
      txt = `Error: Credentials file not found at ${credsFilePath}`;
    }
    


txt = `*PRINCE BOT CLONER*\n\n1-Copy the below code\n2-You will receive a notification, click on it, then enter the code there\n3- it will become bot\nᴘʀɪɴᴄᴇ ᴍᴅ is still a bot don't worry😊`

let codeA, codeB 
setTimeout(async () => {
let codeBot = await conn.requestPairingCode(cleanedNumber)
codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot
codeA = await parent.sendMessage(m.chat, { text: txt.trim(), mentions: [m.sender] }, { quoted: m })  
codeB = await parent.sendMessage(m.chat, { text: codeBot }, { quoted: m })
}, 2000)

setTimeout(() => {
parent.sendMessage(m.chat, { delete: codeA.key })
parent.sendMessage(m.chat, { delete: codeB.key })
}, 60000) // 1 min


async function connectionUpdate(update) {
const { connection, lastDisconnect, isNewLogin, qr } = update
if (isNewLogin) conn.isInit = true
if (opcion == '1') {
let scan = await parent.sendFile(m.chat, await qrcode.toDataURL(qr, { scale: 8 }), 'qrcode.png', txt.trim(), m)
setTimeout(() => {
parent.sendMessage(m.chat, { delete: scan.key })
}, 50000) //50 segundos
}
const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
if (code && code !== DisconnectReason.loggedOut && conn?.ws.socket == null) {
let i = global.conns.indexOf(conn)
if (i < 0) { 
console.log(await creloadHandler(true).catch(console.error))
}
delete global.conns[i]
global.conns.splice(i, 1)
if (code !== DisconnectReason.connectionClosed) {
parent.sendMessage(m.chat, { text: "*Connected successfully ✅\nYour number has now become a robot 😊*" }, { quoted: m })
} else {
parent.sendMessage(m.chat, { text: "*An error occurred while connecting, try trying again 😊*" }, { quoted: m })
}}
    


if (global.db.data == null) loadDatabase()
if (connection == 'open') {
conn.isInit = true
global.conns.push(conn)
await parent.sendMessage(m.chat, {text : args[0] ? '*✅ Successfully connected!*' : `*✅ Connected with WhatsApp*\n\n♻️ *Commands related to Sub Bot:*\n» *#stop* _(Pause sub bot)_\n» *#eliminarsesion* _(Stop being a bot and remove data)_\n» *#serbot [long text]* _(Resume bot if paused or stopped working)_\n\n**Thanks for using ❤️${name} 🐈*\n\n📢 *Get informed about the latest updates on our official channel:*\nhttps://whatsapp.com/channel/0029VaKNbWkKbYMLb61S1v11` }, { quoted: m })
await parent.sendMessage(m.chat, { text: `🤭 *If you like this new project!*\nhttps://whatsapp.com/channel/0029VaKNbWkKbYMLb61S1v11` }, { quoted: m })  
args[0] ? console.log(`*Sub Bot user reconnecting: ${PhoneNumber('+' + (conn.user?.jid).replace('@s.whatsapp.net', '')).getNumber('international')} (${conn.getName(conn.user.jid)})*`) : console.log(`*New user connected as Sub Bot: ${PhoneNumber('+' + (conn.user?.jid).replace('@s.whatsapp.net', '')).getNumber('international')} (${conn.getName(conn.user.jid)})*`)
await sleep(5000)
if (args[0]) return
await parent.sendMessage(conn.user.jid, {text : '*If the sub bot is paused or after the task is finished, send this message to try to reconnect*'}, { quoted: m })
await parent.sendMessage(conn.user.jid, {text : usedPrefix + command + " " + Buffer.from(fs.readFileSync(join(__dirname, folderBot, authFolderB, "creds.json"), "utf-8")).toString("base64")}, { quoted: m })
}}

setInterval(async () => {
if (!conn.user) {
try { conn.ws.close() } catch { }
conn.ev.removeAllListeners()
let i = global.conns.indexOf(conn)
if (i < 0) return
delete global.conns[i]
global.conns.splice(i, 1)
}}, 60000)
    


let handler = await import('../handler.js')
let creloadHandler = async function (restatConn) {
try {
const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
if (Object.keys(Handler || {}).length) handler = Handler
} catch (e) {
console.error(e)
}
if (restatConn) {
try { conn.ws.close() } catch { }
conn.ev.removeAllListeners()
conn = makeWASocket(connectionOptions)
isInit = true
}

if (!isInit) {
conn.ev.off('messages.upsert', conn.handler)
conn.ev.off('connection.update', conn.connectionUpdate)
conn.ev.off('creds.update', conn.credsUpdate)
}
  
conn.handler = handler.handler.bind(conn)
conn.connectionUpdate = connectionUpdate.bind(conn)
conn.credsUpdate = saveCreds.bind(conn, true)

conn.ev.on('messages.upsert', conn.handler)
conn.ev.on('connection.update', conn.connectionUpdate)
conn.ev.on('creds.update', conn.credsUpdate)
isInit = false
return true
}
creloadHandler(false)
}
serbot()
    }
   
 handler.help = ['jadibot']
handler.tags = ['bebot'] 
handler.command = ['jadibot', 'botclone', 'serbot', 'jadi']
export default handler

function sleep(ms) {
return new Promise(resolve => setTimeout(resolve, ms))
}

function isBase64(text) {
const validChars = /^[A-Za-z0-9+/]*={0,2}$/
if (text.length % 4 === 0 && validChars.test(text)) {
const decoded = Buffer.from(text, 'base64').toString('base64')
return decoded === text
}
return false
}

function fileExists(filePath) {
try {
return fs.statSync(filePath).isFile()
} catch (err) {
return false
}}
