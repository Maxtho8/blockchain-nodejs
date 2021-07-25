import { Blockquote } from "@blueprintjs/core";
import express from "express"
import WebSocket from "ws"
const app = express();
import { getGenesisBlock, BLOCKCHAIN, generateNextBlock, isValidChain, getLatestBlock } from './block.js'

const sockets = []

/* Commande web pour intérargir avec un noeud */

// obtenir le block génésis
app.get('/getGenesisBlock', (req, res) => {
  console.log(BLOCKCHAIN[0])
});

// voir la blockchain
app.get('/seeBlockchain', (req, res) => {
  console.log(BLOCKCHAIN)
});

// demander la blockchain 
app.get('/needBlockchain', (req, res) => {
  let socket = sockets[Math.floor(Math.random()*sockets.length)]
  socket.send(JSON.stringify({type:"needBlockchain",data: null}))
});

// ajouter un block
app.get('/addBlock/:data', (req, res) => {
  // je crée une blockchain temporaire à partir de celle existante, j'ajoute le block et je vérifie l'intégrité de la blockchain
  let tempBlockchain = BLOCKCHAIN.slice()
  let newBlock = generateNextBlock(req.params.data)
  tempBlockchain.push(newBlock)
  if(isValidChain(tempBlockchain)){
    sockets.map((socket) => {
      socket.send(JSON.stringify({type:"addBlock",data: newBlock}))
    })
    //Si le block et valide je l'ajoute à la blockchain et j'envoie a tout les autres utilisateurs
    BLOCKCHAIN.push(newBlock)
  }else{
    //Le block n'est pas valide
    //Si la blockchain est en retard alors je la demande aux serveurs 
    if(newBlock.index > getLatestBlock().index){
      //demande a un des noeuds 
        let socket = sockets[Math.floor(Math.random()*sockets.length)]
        socket.send(JSON.stringify({type:"needBlockchain",data: null}))
    }
    console.log("Block invalide")
  }
});

/*Indique aux sockets les évènements à écouter */
const listenMessages = (ws) => {
  ws.onmessage = (e) => {
    /* structures message :  {type:"message",data:{type:"addBlock",data:"..."}}, j'extrais donc la party data */ 
    let msg = JSON.parse(e.data)
    //Si recoit une demande de noeuds 
    if(msg.type == "needNodeAddr"){
      ws.send({type:"nodeAddr",data:JSON.stringify(listNode)})
    }
    //Réponse demande de noeuds 
    else if(msg.type == "nodeAddr"){
      msg.data.map((addr) => {
        /*let socket = new WebSocket("ws://"+addr.split("f:")[1]+":8080")
        listenMessages(socket)
        socket.onerror = (error) => {
          console.log(error)
        }
        sockets.push(socket)*/
      })
    }
    // si reçoit un nouveau block
    else if(msg.type== "addBlock"){
      let tempBlockchain = BLOCKCHAIN
      tempBlockchain.push(generateNextBlock(req.params.data))
      if(isValidChain(tempBlockchain)){
        console.log(JSON.stringify({type:"addBlock",data: generateNextBlock(req.params.data)}))
        sockets.map((socket) => {
          socket.send(JSON.stringify({type:"addBlock",data: generateNextBlock(req.params.data)}))
        })
      //Si le block et valide je l'ajoute à la blockchain et j'envoie a tout les autres utilisateurs
      BLOCKCHAIN.push(generateNextBlock(req.params.data))
      }else{
        // le block n'est pas valide
        // SI il me manque des blocs 
        if(newBlock.index > getLatestBlock().index){
          //demande a un des noeuds 
            let socket = sockets[Math.floor(Math.random()*sockets.length)]
            socket.send(JSON.stringify({type:"needBlockchain",data: null}))
        }
      }
   }
   else if(msg.type == "needBlockchain"){
    ws.send(JSON.stringify({type:"giveBlockchain",data: BLOCKCHAIN}))
   }
   else if(msg.type == "giveBlockchain"){
    console.log("j'ai recu la blockchain",msg.data)
   }
  }
}

//Mise en place du server socket et web
app.listen(3001,()=>{console.log("Serveur Web démarré")})
const server = new WebSocket.Server({ port: 8080 })

// connexion au noeud maitre
const url = 'ws://134.209.75.141:8080'
const connection = new WebSocket(url)
sockets.push(connection)
// on demande au noeud lourd tout les noeuds connectés 
connection.onopen = ()=> {
  console.log("socket open")
  connection.send(JSON.stringify({type:"needNodeAddr"}))
  listenMessages(connection);
}

// Si un client se connecte 
server.on('connection', function (socket,req) {
  console.log("un utilisateurs est connecté")
  listenMessages(socket)
  nodeAddr.push(req.socket.remoteAddress)
  sockets.push(socket)
})

