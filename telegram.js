var https = require("https");
var fs = require("fs");

var config = require("./config");

var apiKey = config.telegram.apiKey;
var chat_id = config.telegram.chat_id;
var timeout = config.telegram.timeout;

var timer_j = 0, timer_m = 0, timer_t = 0;

var mainnet_forging = false;
var testnet_forging = false;

var mainnet_badMessage = false;
var testnet_badMessage = false;
var json_badMessage = false;

var mainnet_next_turn = "null";
var testnet_next_turn = "null";

function Monitor() {
  var json_data = fs.readFileSync('data.json', 'utf8');

  if(IsJsonString(json_data)) {
    if(json_badMessage) {
      let message = "%E2%9C%85 JSON file is read. *All is okay.*";
      sendMessage(message);
      json_badMessage = false;
      console.log("Telegram: JSON file is read. All is okay.");
    }
    timer_j = 0;

    json_data = JSON.parse(json_data);

    var i=1;
    for (var ss in json_data.servers) {
      isForging(i, json_data.servers[ss].forging,json_data.servers[ss].testnet);
      i++;
    }

    BadMessage(testnet_forging, mainnet_forging);
    GoodMessage();

    console.log(`Mainnet_forging: ${mainnet_forging} \nTestnet_forging: ${testnet_forging}`);

    if(testnet_forging) {
      testnet_next_turn = nextTurnTime(json_data.testnet.nextturn);
    }
    if(mainnet_forging) {
      mainnet_next_turn = nextTurnTime(json_data.mainnet.nextturn);
    }

    mainnet_forging = false;
    testnet_forging = false;

    //console.log(`timeout: ${timeout}`);
    //console.log(`timer_j: ${timer_j} timer_m: ${timer_m} timer_t: ${timer_t}`);

  } else {
      if(!json_badMessage) {
        if(timer_j >= 2 && timer_j >= timeout){
          let message = "%E2%9D%8C *Error!* Can't read JSON file!";
          sendMessage(message);
          json_badMessage = true;
          timer_j = 0;
        }
        timer_j++;
      }
      console.log("Telegram: Can't read JSON file!");
  }
}

function IsJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

function isForging(server, forging, testnet) {
  if(forging == true) {
    if(testnet) {
      testnet_forging = true;
      timer_t = 0;
    } else {
      mainnet_forging = true;
      timer_m = 0;
    }
  }
}

function BadMessage(testnet_forging, mainnet_forging) {
  if(!testnet_badMessage) {
    if(!testnet_forging) {
      if(timer_t >= 2 && timer_t >= timeout){
        let message = '%E2%80%BC *Testnet* are *not* forging!' + 
        `\n%F0%9F%95%90 Next turn in *${testnet_next_turn}*`;

        sendMessage(message);
        testnet_badMessage = true;
        console.log('\nTelegram: Testnet are not forging!');
      }
      timer_t++;      
    }
  }
  if(!mainnet_badMessage) { 
    if(!mainnet_forging) {
      if(timer_m >= 2 && timer_m >= timeout){
        let message = '%E2%80%BC *Mainnet* are *not* forging!' + 
        `\n%F0%9F%95%90 Next turn in *${mainnet_next_turn}*`;

        sendMessage(message);
        mainnet_badMessage = true;
        console.log('\nTelegram: Mainnet are not forging!');
      }
      timer_m++;      
    }
  }
}

function GoodMessage() {
  if(testnet_badMessage) {
    if(testnet_forging) {
      let message = '%E2%9C%85 *Testnet* are forging now! *All is okay.* %F0%9F%9A%80';
      sendMessage(message);
      testnet_badMessage = false;
      console.log('Telegram: Testnet are forging now! All is okay.');
    }
  }
  if(mainnet_badMessage) {
    if(mainnet_forging) {
      let message = '%E2%9C%85 *Mainnet* are forging now! *All is okay.* %F0%9F%9A%80';
      sendMessage(message);
      mainnet_badMessage = false;
      console.log('Telegram: Mainnet are forging now! All is okay.');
    }
  } 
}

function sendMessage(msg) {
  var url = `https://api.telegram.org/bot${apiKey}/sendMessage?chat_id=${chat_id}&parse_mode=Markdown&text=${msg}`;

  https.get(url, (res) => {
/*
  let json = '';
  res.on('data', (d) => {
    json += d;
  });

  res.on('end', () => console.log(json));
*/
  }).on('error', (e) => { console.error(e); });
}

function nextTurnTime(nextturn){
  if(nextturn !== null) {
    timeg = nextturn * 27;
    time = (timeg/60);
    minutes = Math.floor(timeg / 60);
    seconds = Math.round((time - minutes) * 60);

    var v_nextturn= '';

    if(minutes == 0){ 
      v_nextturn = timeg +" sec"; 
    } else{ 
      v_nextturn = minutes + " min "+ seconds + " sec";
    }
    return v_nextturn;                      
  } else {
      return v_nextturn = 'SOON';
  }
}

exports.Monitor = Monitor;
exports.sendMessage = sendMessage;
