let handler = async (m, { conn, text, command, usedPrefix }) => {
  if (!text) throw `Tag someone to unban.\nExample:\n*${usedPrefix + command} @tag*`;

  let who;
  if (m.isGroup) who = m.mentionedJid[0];
  else who = m.chat;

  if (!who) throw `Tag someone to unban.\nExample:\n*${usedPrefix + command} @tag*`;

  let users = global.db.data.users;
  if (!users[who]) throw `The user is not found in the database.`;

  users[who].banned = false;

  conn.reply(
    m.chat,
    `The user has been successfully unbanned. 🎉\nThey can now use PRINCE MD.`,
    m
  );
};

handler.help = ['unbanuser'];
handler.tags = ['owner'];
handler.command = /^unbanuser$/i;

handler.rowner = true;
export default handler;
