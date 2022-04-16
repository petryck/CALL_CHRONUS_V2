const venom = require('venom-bot');
const fs = require('fs');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const path = require('path');

const bodyParser = require('body-parser');


// CONTROLLERS
const chat = require('./controller/chat.js');
// const instaciaWhastapp = require('./controller/instancias.js');

// SETS
app.use(require("cors")());
app.set("view engine", "html");
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use('/', express.static(path.join(__dirname, '../public')))


// SESSION
var client = {};

// 
server.lastUserID = 0;
server.lastADMID = 0;


function createSession(session){
    venom.create(
        {
          session: session,
          browserArgs: ['--no-sandbox'],
          disableWelcome: true,
          folderNameToken: 'tokens', //folder name when saving tokens
          logQR: false, // Logs QR automatically in terminal
          useChrome: true,
          headless: true, // Headless chrome
          disableSpins: true, // Will disable Spinnies animation, useful for containers (docker) for a better log
          updatesLog: true, // Logs info updates automatically in terminal
          autoClose: 60000, // Automatically closes the venom-bot only when scanning the QR code (default 60 seconds, if you want to turn it off, assign 0 or false)
  
        },
        (base64Qrimg, asciiQR,urlCode, attempts) => {
        console.log("QR_code", base64Qrimg);

        var saida_qrcode = {code64:base64Qrimg,session:session}

        io.emit('qrCode',saida_qrcode);

        },
         (statusSession, session) => {

        var saida_qrcode = {status:statusSession,session:session}

        io.emit('SessionStatus',saida_qrcode);
        console.log('Status Session: ', statusSession); 
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
  

io.on('connection', (socket) => {


    socket.on('NewConnectionUser',function(){
            id_new_User = server.lastUserID++;
            socket.users = {
                id: id_new_User,
                type:0
            };
            console.log(socket.users)

    })

    socket.on('NewConnectionADM',function(){
            id_new_ADM = server.lastADMID++;
            socket.users = {
                id: id_new_ADM,
                type:1
            };

            console.log(socket.users)
    })

    socket.on('StartSession',function(data){
 
        var session = data.name;

        if(!client[session]){
            var body = {
                SessionName:session,
                SessionStatus:'success'
            };
            createSession(session)
           
        }else{
            var body = {
                SessionName:session,
                SessionStatus:'error'
            };
        }


        socket.emit('StatusServer',body);

       

    });


    
    
    
    socket.on('disconnect', () => {
        console.log('user disconnected');
      });

});




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



app.get('/close', function (req, res) {

    var session = req.query.session

    if(client[session]){
        delete client[session];
        res.send(session+' -> Removida')
    }else{
        res.send(session+' -> Não existe')
    }

    
    
});


app.get('/login', function (req, res) {
    
    res.send('Funcionando')

});


app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');

});

server.listen(7070, function () {
    console.log(`Servidors Carregado http://localhost:${server.address().port}`);
});


