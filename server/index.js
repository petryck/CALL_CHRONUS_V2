const express = require('express');
const app = express();
const server = require('http').Server(app);
app.use(require("cors")());
const venom = require('venom-bot');
const fs = require('fs');
const chat = require('./controller/chat.js');


var client = {};


function instaciaWhastapp(session){

    venom.create({
        session: session, 
        folderNameToken: 'tokens', //folder name when saving tokens
        logQR: true, // Logs QR automatically in terminal
        useChrome: true,
        headless: false, // Headless chrome
        disableSpins: true, // Will disable Spinnies animation, useful for containers (docker) for a better log
        updatesLog: true, // Logs info updates automatically in terminal
        autoClose: 60000, // Automatically closes the venom-bot only when scanning the QR code (default 60 seconds, if you want to turn it off, assign 0 or false)
      }).then((retorno) => {
        client[session] = retorno;

        start(client,session);
      })
      .catch((erro) => {
        console.log(erro);
      });
}
  

async function start(client,session) {

    await client[session].onMessage(async (message) => {

        if(client[session]){
            const isValidNumber = await client[session].checkNumberStatus(message.from);

            if (!message.isGroupMsg && isValidNumber) {
             
              var body = {
                  from:message.from,
                  text:message.body
              }
              
              await chat(body).then((result) => {
                 console.log(result)
      
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







app.get('/send', async function (req, res) {

    var session = req.query.session
    var numero = req.query.numero+'@c.us'
    var text = req.query.text

        if(client[session]){
            await client[session].sendText(numero, text)
            .then((result) => {
                res.json(result)
            })
            .catch((erro) => {

                res.json('Error when sending: ', erro)
            console.error('Error when sending: ', erro); //return object error
            });
        }else{
            res.json('Instancia desconectada, inicie ou reinicie seu servidor')
        }
        

 });

app.get('/start', function (req, res) {

    var session = req.query.session

    if(!client[session]){
        instaciaWhastapp(session)
        res.send(session+' -> Iniciada')
    }else{
        res.send(session+' -> Já existe')
    }

    
    
});


app.get('/close', function (req, res) {

    var session = req.query.session

    if(client[session]){
        delete client[session];
        res.send(session+' -> Removida')
    }else{
        res.send(session+' -> Não existe')
    }

    
    
});



app.get('/', function (req, res) {
    
    res.send('Funcionando')

});

server.listen(7070, function () {
    console.log(`Servidors Carregado http://localhost:${server.address().port}`);
});


