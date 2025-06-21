const WebSocket = require('ws');

module.exports = (server) => {

    const wss = new WebSocket.Server({ server });    

    wss.broadcast = function broadcast(msg) {
        wss.clients.forEach(function each(ws) {
            if(!ws.isRegistered) return;
            if(config.passwordRequired && !ws.password) return;
            if(config.passwordRequired && ws.password != config.password) return;
            ws.send(msg.toString());
        });
    };

    wss.getOnlineClients = () =>
    {
        var onlineClients = [];
        wss.clients.forEach(function each(client) {
            if(!client.profile) return;
            onlineClients.push(client.profile);
        })
        return onlineClients;
    }

    wss.WSMessage = class WSMessage {
        constructor(type, content)
        {
            this.id = Date.now();
            this.type = type;
            this.content = content;
        }
        toString()
        {
            return JSON.stringify(this);
        }
    }

    //Listen to connections
    wss.on("connection", (ws, req) => {

        ws.sendError = (msg) =>
        {
            ws.send(JSON.stringify(new wss.WSMessage("ERROR", msg)));
        }

        ws.isOnline = true;
        setInterval(() =>
        {
            ws.isOnline = false;
            ws.ping();
            setTimeout(() => { 
                if(ws.isOnline == false)
                {           
                    ws.close();
                    wss.clients
                    wss.broadcast(new wss.WSMessage("ONLINE-UPDATE", wss.getOnlineClients()).toString());
                }
            }, 7000)
        }, 10000);

        ws.on("pong", function pong(data) {
            ws.isOnline = true;
        })

        //Listen to messages
        ws.on('message', function message(data, isBinary) {

            if(isBinary) return;
            data = data.toString();
            try { data = JSON.parse(data) } catch (err) { return console.log(err); }
            if(typeof data != "object" || !data.type || !data.content) return console.log();
            var c = data.content;

            if(data.type == "REGISTER") require(__root + "/src/router/ws/registerAccount.js")(wss, ws, c);
            if(data.type == "PING") { ws.send(new wss.WSMessage("PONG", {}).toString())}

            if(!ws.isRegistered) return;
            console.log("INCOMMING: " + ws.profile.username + " | " + data.type + " | " + JSON.stringify(c));
            if(config.passwordRequired && !ws.password) return ws.sendError("NO_PASSWORD");
            if(config.passwordRequired && config.password != ws.password) return ws.sendError("PASSWORD_INCORRECT");

            if(data.type == "CHAT-MESSAGE") require(__root + "/src/router/ws/sendChatMessage.js")(wss, ws, c);
        });

        ws.on("close", () => {
            wss.broadcast(new wss.WSMessage("ONLINE-UPDATE", wss.getOnlineClients()).toString());
        })

        ws.on('error', console.error);
    });

}
