const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, downloadContentFromMessage } = require('@whiskeysockets/baileys')
const P = require('pino')
const fs = require('fs')
const axios = require('axios')
const moment = require('moment-timezone')
const yts = require('yt-search')

const PAIRING_NUMBER = process.env.PAIRING_NUMBER || '263778724084'
let MODE = process.env.MODE || 'public'
let startTime = Date.now()
let reconnectAttempts = 0

let blockList = fs.existsSync('./block.json') ? JSON.parse(fs.readFileSync('./block.json')) : []
let warns = fs.existsSync('./warns.json') ? JSON.parse(fs.readFileSync('./warns.json')) : {}
let protect = fs.existsSync('./protect.json') ? JSON.parse(fs.readFileSync('./protect.json')) : { antibug: true, antispam: true, antilink: false, antitag: false, antidelete: true, antiviewonce: true }
let spamMap = {}
let messageCache = {}
const saveDB = () => {
  fs.writeFileSync('./block.json', JSON.stringify(blockList))
  fs.writeFileSync('./warns.json', JSON.stringify(warns))
  fs.writeFileSync('./protect.json', JSON.stringify(protect))
}

process.on('uncaughtException', e => console.log('Exception:', e.message))
process.on('unhandledRejection', e => console.log('Rejection:', e.message))

async function startBot(){
  const { state, saveCreds } = await useMultiFileAuthState('auth_info')
  const { version } = await fetchLatestBaileysVersion()
  const sock = makeWASocket({ 
    version, 
    auth: state, 
    logger: P({level:'silent'}), 
    browser:['Thunder Ultimate','Chrome','1.0'],
    keepAliveIntervalMs: 10000,
    markOnlineOnConnect: true
  })

  if (!sock.authState.creds.registered) {
    setTimeout(async()=>{ 
      try{ 
        const code = await sock.requestPairingCode(PAIRING_NUMBER); 
        console.log(`\n⚡ PAIRING CODE FOR ${PAIRING_NUMBER}: ${code}\n`) 
      }catch(e){ console.log(e.message) } 
    },4000)
  }

  sock.ev.on('creds.update', saveCreds)
  
  sock.ev.on('connection.update', async(u)=>{
    const { connection, lastDisconnect } = u
    if(connection==='close'){
      const reason = lastDisconnect?.error?.output?.statusCode
      console.log(`Connection closed, reason: ${reason}, attempt: ${reconnectAttempts}`)
      if(reason === DisconnectReason.loggedOut){
        console.log('Logged out, clearing auth...')
        try{ fs.rmSync('auth_info', { recursive: true, force: true }) }catch{}
        setTimeout(()=>startBot(), 3000)
      } else {
        reconnectAttempts++
        const delay = Math.min(reconnectAttempts * 2000, 10000)
        console.log(`Reconnecting in ${delay}ms...`)
        setTimeout(()=>startBot(), delay)
      }
    }
    if(connection==='open'){
      console.log('⚡ THUNDER ULTIMATE v15.2 CLEAN 60 CMDS ONLINE - MODE: '+MODE)
      reconnectAttempts = 0
    }
  })

  sock.ev.on('messages.upsert', async({messages})=>{
    try{
      const msg = messages[0]
      if(!msg.message) return
      const from = msg.key.remoteJid
      const sender = msg.key.participant || from
      const isGroup = from.endsWith('@g.us')
      const isOwner = sender.includes('263778724084') || from.includes('263778724084')
      const body = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || msg.message.videoMessage?.caption || ''

      if(protect.antiviewonce){
        const vo = msg.message.viewOnceMessage || msg.message.viewOnceMessageV2 || msg.message.viewOnceMessageV2Extension
        if(vo){
          const inner = vo.message; const type = Object.keys(inner)[0]; const innerMsg = inner[type]
          try{
            const stream = await downloadContentFromMessage(innerMsg, type.replace('Message',''))
            let buff = Buffer.from([]); for await (const chunk of stream){ buff = Buffer.concat([buff, chunk]) }
            await sock.sendMessage(from, { text: `👁️ *ANTIVIEWONCE*\n👤 @${sender.split('@')[0]}`, mentions: [sender] })
            if(type === 'imageMessage') await sock.sendMessage(from, { image: buff, caption: `🔓 ViewOnce ${innerMsg.caption||''}` })
            if(type === 'videoMessage') await sock.sendMessage(from, { video: buff, mimetype:'video/mp4', caption: `🔓 ViewOnce ${innerMsg.caption||''}` })
            if(type === 'audioMessage') await sock.sendMessage(from, { audio: buff, mimetype:'audio/mpeg', ptt: true })
          }catch{}
        }
      }

      if(msg.message.protocolMessage && msg.message.protocolMessage.type === 0){
        if(protect.antidelete){
          const cached = messageCache[msg.message.protocolMessage.key?.id]
          if(cached){
            await sock.sendMessage(from, { text: `🗑️ *ANTIDELETE*\n👤 @${cached.sender.split('@')[0]} deleted:\n${cached.body || '[Media Below]'}`, mentions: [cached.sender] })
            if(cached.media) await sock.sendMessage(from, { [cached.mediaType]: cached.media })
          }
        }
        return
      }
      if(msg.key.fromMe) return

      if(body || msg.message.imageMessage || msg.message.videoMessage){
        let media=null, mediaType=null
        try{
          if(msg.message.imageMessage){ const s = await downloadContentFromMessage(msg.message.imageMessage, 'image'); let b=Buffer.from([]); for await (const c of s){ b=Buffer.concat([b,c]) }; media=b; mediaType='image' }
          if(msg.message.videoMessage){ const s = await downloadContentFromMessage(msg.message.videoMessage, 'video'); let b=Buffer.from([]); for await (const c of s){ b=Buffer.concat([b,c]) }; media=b; mediaType='video' }
        }catch{}
        messageCache[msg.key.id] = { body, media, mediaType, sender }
        if(Object.keys(messageCache).length > 500) delete messageCache[Object.keys(messageCache)[0]]
      }

      if(blockList.includes(sender) && !isOwner) return
      if(protect.antibug && body.length > 10000 && !isOwner){ await sock.sendMessage(from,{delete:msg.key}); return }
      if(protect.antispam && !isOwner){ const now=Date.now(); spamMap[sender]=(spamMap[sender]||[]).filter(t=>now-t<4000); spamMap[sender].push(now); if(spamMap[sender].length>6) return }
      if(protect.antilink && isGroup && /https?:\/\/|chat\.whatsapp\.com/i.test(body) && !isOwner){ await sock.sendMessage(from,{delete:msg.key}); return }
      if(protect.antitag && isGroup && body.includes('@all') && !isOwner){ await sock.sendMessage(from,{delete:msg.key}); return }
      if(!body.startsWith('.')) return

      const args = body.slice(1).trim().split(/ +/); const command = args.shift()?.toLowerCase(); const text = args.join(' ')
      const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || []

      // ===== PRIVATE MODE - BLOCK EVERYONE EXCEPT OWNER =====
      if (MODE === 'private' && !isOwner) {
        return sock.sendMessage(from, { text: `🔒 *THUNDER ULTIMATE is in PRIVATE MODE*\n\nOnly owner can use commands now.\n👑 Owner: +263778724084` }, { quoted: msg })
      }

      if(command==='menu'){
        return sock.sendMessage(from,{text:`
╭━━━ ⚡ THUNDER ULTIMATE v15.2 CLEAN ━━━╮
┃ 60 CMDS - PRIVATE MODE FIXED
╰━━━━━━━━━━━━━━━━━━━━━╯
👑 .mode .public .private .pair .restart .settings .owner
🛡️ .antibug .antispam .antilink .antitag .antidelete .antiviewonce .warn .warnings .block .unblock
📥 .play .song .ytmp3 .vid .video .ytmp4
🎮 .8ball .dice .slot .rps .quiz .joke .truth .dare .ship .fact .meme
👥 .kick .add .promote .demote .tagall .hidetag .link .leave .group
🌍 .ping .alive .runtime .ai .tr .qr .calc .weather .lyrics .sticker .repo
`.trim()}, {quoted:msg})
      }

      if(['public','private','mode'].includes(command)){ 
        if(!isOwner) return; 
        if(command==='public' || text==='public'){ MODE='public'; await sock.sendMessage(from,{text:'🌍 PUBLIC ✅ Everyone can use bot'}, {quoted:msg}) } 
        if(command==='private' || text
