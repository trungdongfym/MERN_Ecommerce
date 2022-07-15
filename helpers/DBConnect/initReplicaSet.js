const fs = require('fs');
const readLine = require('readline');
const { exec } = require('child_process');
const { stdout, stderr } = require('process');

async function startReplSet() {
   const fileStream = fs.createReadStream('./repl.txt');
   const rl = readLine.createInterface({
      input: fileStream,
      crlfDelay: Infinity
   });

   const commandArr = [];
   for await (const command of rl) {
      commandArr.push(command);
   }
   try {
      for (const command of commandArr) {
         const { stderr, stdout } = await exec(command);
      }
      console.log('Replica Set started!');
   } catch (error) {
      console.log('Replica Set error:', error);
   }
}

startReplSet();