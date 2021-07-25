import express from "express"
import WebSocket from "ws"
const app = express();
import { getGenesisBlock, BLOCKCHAIN, generateNextBlock, isValidChain } from './block.js'

const sockets = []
const nodeAddr = []

app.get('/getGenesisBlock', (req, res) => {
  console.log(BLOCKCHAIN[0])
});


app.get('/seeBlockchain', (req, res) => {
  console.log(BLOCKCHAIN)
});

app.get('/addBlock/:data', (req, res) => {
  let tempBlockchain = BLOCKCHAIN
  tempBlockchain.push(generateNextBlock(req.params.data))
  if(isValidChain(tempBlockchain)){
    BLOCKCHAIN.push(generateNextBlock(req.params.data))
  }
});

app.listen(3001,()=>{console.log("Serveur Web démarré")})

const wss = new WebSocket.Server({ port: 8080 })

wss.on('connection', function (ws,req) {
  console.log("un utilisateurs est connecté")
  ws.onmessage = (e) => { 
    let msg = JSON.parse(e.data)
    if(msg.type == "needNodeAddr"){
      ws.send(JSON.stringify({type:"nodeAddr",data:nodeAddr}))
      console.log(nodeAddr)
    }else{
      if(msg.type == "addBlock"){
        console.log(e.data)
      }
    }
  }
  nodeAddr.push(req.socket.remoteAddress)
  sockets.push(ws)
});