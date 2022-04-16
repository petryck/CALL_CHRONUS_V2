const venom = require('venom-bot');
module.exports = async function instaciaWhastapp(session) {

      venom.create(
          {
            session: session,
            browserArgs: ['--no-sandbox'],
            disableWelcome: true,
            folderNameToken: 'tokens', //folder name when saving tokens
            logQR: false, // Logs QR automatically in terminal
            useChrome: true,
            headless: false, // Headless chrome
            disableSpins: true, // Will disable Spinnies animation, useful for containers (docker) for a better log
            updatesLog: true, // Logs info updates automatically in terminal
            autoClose: 60000, // Automatically closes the venom-bot only when scanning the QR code (default 60 seconds, if you want to turn it off, assign 0 or false)
    
          },
          (base64Qrimg, asciiQR,urlCode, attempts) => {
            console.log('Number of attempts to read the qrcode: ', attempts);
            io.emit('qrCode',base64QR);

          // console.log("base64 image of qrcode: ", base64Qrimg);
          // console.log("Terminal image of qrcode in caracter ascii: ", asciiQR);
          console.log("Terminal string hash of qrcode: ", urlCode);
          },
           (statusSession, session) => {
            console.log('Status Session: ', statusSession); 
            console.log('Session name: ', session);
          }
          )
        .then((retorno) => {
          start(retorno,session);
        })
        .catch((erro) => {
          console.log(erro);
        });
        
}

async function start(clientSession,session) {
  client[session] = clientSession
  await client[session].onMessage(async (message) => {

      if(client[session]){
          const isValidNumber = await client[session].checkNumberStatus(message.from);

          if (!message.isGroupMsg && isValidNumber) {
           
            var body = {
                from:message.from,
                text:message.body
            }
            
            await chat(body).then((result) => {
    
    
               if(result.server != false){
    
                client[session].sendText(result.from, result.text)
               }
             
               
            })
    
            
          }
      }

  });

  client[session].onStateChange((state) => {
      console.log('State changed: ', state);
      if ('CONFLICT'.includes(state)) client[session].useHere();
      if ('UNPAIRED'.includes(state)) console.log('logout');
    });

}






