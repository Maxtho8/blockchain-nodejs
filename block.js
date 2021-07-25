
import CryptoJS from "crypto-js";

class Block {
    constructor(index, previousHash, timestamp, transactions, hash) {
        this.index = index;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.hash = hash;
    }
}

var calculateHash = (index, previousHash, timestamp, transactions) => {
    return CryptoJS.SHA256(index + previousHash + timestamp + transactions).toString();
};

var calculateHashForBlock = (block) => {
    return CryptoJS.SHA256(block.index + block.previousHash + block.timestamp + block.transactions).toString();
};

export var getGenesisBlock = () => {
    return new Block(0, null ,0,[null], 'cvoucou');
};

export var getLatestBlock = () => BLOCKCHAIN[BLOCKCHAIN.length - 1];

export var generateNextBlock = (blockData) => {
    var previousBlock = getLatestBlock();
    var nextIndex = previousBlock.index + 1;
    var nextTimestamp = Date.now();
    var nextHash = calculateHash(nextIndex, previousBlock.hash, nextTimestamp, blockData);
    return new Block(nextIndex, previousBlock.hash, nextTimestamp, blockData, nextHash);
};

var newBlockValidation = (newBlock,lastBlock) => {
    calculateHash(newBlock)
    if(lastBlock.index +1 !== newBlock.index){
        console.log("index invalide");
        return false;
    }else if(lastBlock.hash != newBlock.previousHash){
        console.log("hash précédent invalide")
        return false
    }else if(calculateHashForBlock(newBlock) != newBlock.hash){
        console.log('hash invalide')
        return false
    }
    return true;
}

export var isValidChain = (blockchainToValidate) => {
    if (JSON.stringify(blockchainToValidate[0]) !== JSON.stringify(getGenesisBlock())) {
        console.log("Premier block invalide")
        return false;
    }
    var tempBlocks = [blockchainToValidate[0]];
    for (var i = 1; i < blockchainToValidate.length; i++) {
        if (newBlockValidation(blockchainToValidate[i], tempBlocks[i - 1])) {
            tempBlocks.push(blockchainToValidate[i]);
        } else {
            console.log("block",i,"invalide")
            return false
        }
    }
    return true;
};


export const BLOCKCHAIN = [getGenesisBlock()]



