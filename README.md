# Shift Monitor ( Server Version / [Web Version](https://github.com/MxShift/shift-webmonitor) )
Tool to watch your servers status. Height, Consensus and Forging status. Next turn and last forged block time.

## Requisites

* Install this script only in one server;
* Make sure you **whitelist your server IP** in API and Forging sections of Shift *config.json* in all servers;
* You need to have **fs, http, node-cmd, path** and **https** (for SLL and Telegram) installed in npm, for example: `sudo npm install node-cmd`;
* Make sure to add your new serverport numbers to your firewall. Instructions: [ShiftProject Wiki](https://www.reddit.com/r/ShiftProject/wiki/guides/delegate#wiki_step_seven_.2014_set_up_a_basic_firewall);

## Installation
Clone this repository to your server.

`git clone https://github.com/MxShift/shift-monitor.git`

You need to edit **config.json** file with all your proper data. You can use it for Mainnet and Testnet both or only for Mainnet.

> "m_name" **// Mainnet delagate username;**

> "t_name" **// Testnet delagate username;**

> "m_publicKey" **// Mainnet publicKey;**

> "t_publicKey" **// Testnet publicKey;**

> "serverip" **// IP of the server where you are installing this software;**

> "serverport" **// It's the port of your server for the Shift Monitor. Must be different from the ports that Shift uses;**

>  "servers" **// It's an array of all the servers you will monitor.**

>  "server1" **// Server number;**

>  "name" **// Your server's name;**

>  "http" **// Your server's connection;**
      
>  "ip" **// Your server's ip or domain;**
       
>  "port" **// Your server's Shift port;**
      
>  "testnet" **// 'true' for Testnet servers, 'false' for Mainnet servers;**

<br>
 
After you finish and save your changes from **config.json**, 

Run **server.js** in a background process. You can use **screen**:

`screen -R shift-monitor`

```
cd shift-monitor
node server.js
```

**node server.js** will start a web server which you can access with http://serverip:serverport/ from a web browser like Firefox.

You will be able to obtain almost realtime data. A page reloaded every 27 seconds (Shift Block Time).

#### Browser notifications are works perfectly with Firefox Desktop and Mobile browsers.

### Telegram
For enabling messages from Telegram Bot you need to edit **config.json** file with all your proper data.

>  "telegram": {

>  "enabled" **// 'true' for Telegram messages;**

>  "apiKey" **// your Bot API Token;**

1. Start a conversation with: [**BotFather**](https://t.me/BotFather);
2. Press: **/newbot**;
3. Tell botfather your bot’s name;
4. Tell botfather your bot’s username;
5. BotFather will say “Congratulations!” and give you a token;
6. Replace **apiKey** with your token;
 
>  "chat_id" **// your Chat ID;**

1. Open Telegram and start a conversation with: [**userinfobot**](https://t.me/userinfobot);
2. Replace **chat_id** with your ID;
  
>  "timeout" **// timeout for messages in blocks (1 = 27 sec). Min timeout is 2;**

Telegram Bot will send you a bad message when one of your Nets is not forging and then a good message when it's forging again.

### Chromium based browsers
For using with Chromium based browsers you should use a secure **https** connection for recieving notifications. You can enabled it in **config.json**:

>  "ssl": {

>  "enabled" **// 'true' for https support;**

>  "port" **// port for https connection;**

>  "options": {
 
>  "key" **// your SSL private key;**
  
>  "cert" **// your SSL certificate;**

<br>

Or you can start your Chromium based browser with this key:

```
--user-data-dir=/tmp/foo --unsafely-treat-insecure-origin-as-secure=http://serverip:serverport/
```

*Notifications are not supported by Chromium based Mobile browsers.*

## Output example

![Screenshot must be right here](https://github.com/MxShift/shift-monitor/blob/master/resources/Screenshot.png?raw=true "Screenshot")
![Telegram Monitor](https://github.com/MxShift/shift-monitor/blob/master/resources/telegram-monitor.png)
