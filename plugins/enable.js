//import db from '../lib/database.js'

let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {
	

  let isEnable = /true|enable|(turn)?on|1/i.test(command)
  let chat = global.db.data.chats[m.chat]
  let user = global.db.data.users[m.sender]
  let bot = global.db.data.settings[conn.user.jid] || {}
  let type = (args[0] || '').toLowerCase()
  let isAll = false, isUser = false
  switch (type) {
    case 'welcome':
      if (!m.isGroup) {
        if (!isOwner) {
          global.dfail('group', m, conn)
          throw false
        }
      } else if (!isAdmin) {
        global.dfail('admin', m, conn)
        throw false
      }
      chat.welcome = isEnable
      break
   
	  
	  
	  case 'jarvis':
     case 'autotalk':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
           throw false
          }}
      chat.jarvis = isEnable
     break
	
	  
	  case 'pmblocker':
	case 'pbm':
isAll = true
if (!isROwner) {
global.dfail('rowner', m, conn)
throw false
}
bot.pmblocker = isEnable
break	  

		  
		  case 'testbb':
	case 'testb':
isAll = true
if (!isROwner) {
global.dfail('rowner', m, conn)
throw false
}
bot.testbot = isEnable
break	  


case 'antipmspam':
	case 'pmspam':
		  case 'spampm':
isAll = true
if (!isROwner) {
global.dfail('rowner', m, conn)
throw false
}
bot.pmspam = isEnable
break	  
		  

	  
 case 'autobio':
  isAll = true
  if (!isROwner) {
  global.dfail('rowner', m, conn)
  throw false
  }
  bot.autoBio = isEnable
  break	 
   
	  
	  
     case 'detect':
      case 'detector':
        if (!m.isGroup) {
         if (!isOwner) {
           global.dfail('group', m, conn)
          throw false
        }
       } else if (!isAdmin) {
         global.dfail('admin', m, conn)
         throw false
       }
       chat.detect = isEnable
     break
    
	  
     case 'autosticker':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.autosticker = isEnable
      break
      
	  
	  
      case 'antispam':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.antiSpam = isEnable
      break
   
	  
   case 'antidelete':
    case 'delete':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.delete = !isEnable
      break
  
	  
    case 'antitoxic':
    case 'antibadword':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.antiToxic = isEnable
      break

		  
    case 'document':
    case 'documento':
    if (m.isGroup) {
        if (!(isAdmin || isOwner)) return dfail('admin', m, conn)
      }
    chat.useDocument = isEnable
    break
 
	  
	  case 'autostatus':
      isAll = true
      if (!isROwner) {
        global.dfail('rowner', m, conn)
        throw false
      }
      chat.viewStory = isEnable
      break

		  
    case 'testf':
    case 'testfeature':
    case 'tst':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.testf = isEnable
      break
		  

		  case 'nocmds':
    case 'anticommands':
    case 'blockcmds':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.anticmds = isEnable
      break


		  
		  case 'antilink2': case 'antilinkall':
if (m.isGroup) {
if (!(isAdmin || isOwner)) {
global.dfail('admin', m, conn)
throw false
}}
chat.antiLink2 = isEnable 
break

		  
case 'antitiktok': case 'antitk': case 'antitik':
if (m.isGroup) {
if (!(isAdmin || isOwner)) {
global.dfail('admin', m, conn)
throw false
}}
chat.antiTiktok = isEnable 
break

		  
case 'antiyoutube': case 'antiyt':
if (m.isGroup) {
if (!(isAdmin || isOwner)) {
global.dfail('admin', m, conn)
throw false
}}
chat.antiYoutube = isEnable 
break

		  
case 'antitelegram': case 'antitl': case 'antitele': case 'antitg': case 'antitel':
if (m.isGroup) {
if (!(isAdmin || isOwner)) {
global.dfail('admin', m, conn)
throw false
}}
chat.antiTelegram = isEnable 
break

		  
case 'antifacebook': case 'antifb': case 'antifbook':
if (m.isGroup) {
if (!(isAdmin || isOwner)) {
global.dfail('admin', m, conn)
throw false
}}
chat.antiFacebook = isEnable 
break


		  
case 'antiinstagram': case 'antinstagram': case 'antiig': case 'antig': case 'antiinsta': case 'antinsta':
if (m.isGroup) {
if (!(isAdmin || isOwner)) {
global.dfail('admin', m, conn)
throw false
}}
chat.antiInstagram = isEnable 
break


		  
case 'antitwitter': case 'antitw': case 'antitwit': case 'antitwter': case 'antitwiter': case 'antix':
if (m.isGroup) {
if (!(isAdmin || isOwner)) {
global.dfail('admin', m, conn)
throw false
}}
chat.antiTwitter = isEnable 
break


		  
case 'antidiscord':
if (m.isGroup) {
if (!(isAdmin || isOwner)) {
global.dfail('admin', m, conn)
throw false
}}
chat.antiDiscord = isEnable 
break


		  
case 'antithreads':
if (m.isGroup) {
if (!(isAdmin || isOwner)) {
global.dfail('admin', m, conn)
throw false
}}
chat.antiThreads = isEnable 
break
		  

case 'antitwitch':
if (m.isGroup) {
if (!(isAdmin || isOwner)) {
global.dfail('admin', m, conn)
throw false
}}
chat.antiTwitch = isEnable 
break

		  case 'antiporn': case 'antinude':
if (m.isGroup) {
if (!(isAdmin || isOwner)) {
global.dfail('admin', m, conn)
throw false
}}
chat.antiPorn = isEnable          
break
		  
      case 'antibotclone':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.antiBotClone = isEnable
      break

		  
      case 'nsfw':
      case '+18':
       if (m.isGroup) {
         if (!(isAdmin || isOwner)) {
           global.dfail('admin', m, conn)
            throw false
           }}
    chat.nsfw = isEnable          
    break

		  
    case 'autolevelup':
    isUser = true
     user.autolevelup = isEnable
     break

		  
     case 'chatbot':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.chatbot = isEnable
      break

    case 'princechat':
	case 'princegpt':	  
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.princechat = isEnable
      break

		  
    case 'restrict':
    case 'restringir':
      isAll = true
      if (!isOwner) {
        global.dfail('owner', m, conn)
        throw false
      }
      bot.restrict = isEnable
      break

		  case 'public':
    case 'publico':
      isAll = true
      if (!isROwner) {
        global.dfail('rowner', m, conn)
        throw false
      }
      global.opts['self'] = !isEnable
      break
		  
	  
	case 'autotype':
    case 'alwaysonline':
      isAll = true
      if (!isOwner) {
        global.dfail('owner', m, conn)
        throw false
      }
      chat.autotype = isEnable
      break

		  
      case 'anticall':
        case 'nocall':
          isAll = true
          if (!isOwner) {
            global.dfail('owner', m, conn)
            throw false
          }
          bot.antiCall = isEnable
          break


		  
    case 'onlypv':
    case 'onlydm':
    case 'onlymd':
    case 'pconly':
      isAll = true
      if (!isOwner) {
        global.dfail('owner', m, conn)
        throw false
      }
      //global.opts['solopv'] = isEnable
      bot.pconly = isEnable
      break
      
    case 'gponly':
    case 'onlygp':
    case 'grouponly':
    case 'gconly':
    case 'sologrupo':
      isAll = true
      if (!isOwner) {
        global.dfail('owner', m, conn)
        throw false
      }
      //global.opts['sologp'] = isEnable
      bot.gconly = isEnable
      break


		  
    default:
     if (!/[01]/.test(command)) return m.reply(`
╭━⊱⊱⊱『 *⚙️BOT SETTINGS⚙️*』
> bot on off features
     
╭━━━━⊱『 *OWNER CMD*』

⚙️⛊ *${usedPrefix}public*
> make bot private and public

⚙️⛊ *${usedPrefix}pmblocker*
> auto inbox blocker 

⚙️⛊ *${usedPrefix}antipmspam*
> auto virus sender blocker 

⚙️⛊ *${usedPrefix}onlydm*
> bot will only work in inbox

⚙️⛊ *${usedPrefix}onlyg*
> bot will only work in group

⚙️⛊ *${usedPrefix}autotype*
> bot will show auto typing on chats

⚙️⛊ *${usedPrefix}autobio*
> bot auto bio 

⚙️⛊ *${usedPrefix}antibotclone*
> jadibot will be left if main bot in the same gp

⚙️⛊ *${usedPrefix}restrict*
> If restrict mode is on the few on off features will work otherwise won't like antilinkall


╭━━━━⊱『 *ADMIN CMD*』

⚙️⛊ *${usedPrefix}welcome*
> bot will welcome and goodbye new joiners and lefters

⚙️⛊ *${usedPrefix}autosticker*
> bot will create auto sticker if someone will send img/short video

⚙️⛊ *${usedPrefix}detect*
> not added yet

⚙️⛊ *${usedPrefix}jarvis*
> voice chatbot

⚙️⛊ *${usedPrefix}antispam*
> bot will detect spammers 

⚙️⛊ *${usedPrefix}nocmds*
> bot will remove command users

⚙️⛊ *${usedPrefix}antilinkall*
> bot will detect all links

⚙️⛊ *${usedPrefix}antitoxic*
> bot will detect bad words

⚙️⛊ *${usedPrefix}antiTiktok*
> bot will detect tiktok links 

⚙️⛊ *${usedPrefix}antiYoutube*
> bot will detect youtube links

⚙️⛊ *${usedPrefix}antiTelegram*
> bot will detect telegram links

⚙️⛊ *${usedPrefix}antiFacebook*
> bot will detect facebook links

⚙️⛊ *${usedPrefix}antiInstagram*
> bot will detect Instagram link

⚙️⛊ *${usedPrefix}antiTwitter* 
> bot will detect twitter links 

⚙️⛊ *${usedPrefix}antiThreads* 
> bot will detect Threads links 

⚙️⛊ *${usedPrefix}antiDiscord* 
> bot will detect discord links 

⚙️⛊ *${usedPrefix}antiTwitch* 
> bot will detect twitch links

⚙️⛊ *${usedPrefix}antinude* 
> bot will detect +18 things


> bot will detect and remove these all whoever will violate it


╭━━━━⊱『 *USER CMD*』
⚙️⛊ *${usedPrefix}chatbot*
> bot will start chating 

⚙️⛊ *${usedPrefix}princechat or princegpt*
> Princebot advance chatbot you can ask anything

╰━━━━━━━━━━━━━━

*🔻EXAMPLE🔻*
> example message you can trun on, off like this

*${usedPrefix}on* welcome
*${usedPrefix}off* welcome
`)
      throw false
  }

m.reply(`
✅ *${type.toUpperCase()}* *${isEnable ? `${mssg.nable}` : `${mssg.disable}`}* ${isAll ? `${mssg.toBot}` : isUser ? '' : `${mssg.toGp}`}
`.trim())  

}
handler.help = ['en', 'dis'].map(v => v + 'able <option>')
handler.tags = ['config']
handler.command = /^((en|dis)able|(turn)?o(n|ff)|[01])$/i

export default handler
