class Message {
    constructor(id, attachments)
    {
        this.id = Date.now();
        this.author = id;
        this.content = "";
        this.attachments = [];
    }
    setContent(messageContent)
    {
        if(!messageContent) return;
        if(typeof messageContent != "string") throw Error("INVALID_CONTENT_TYPE")
        messageContent = messageContent.trim();
        if(messageContent.length > config.maxMessageLength) throw Error("MAX_MESSAGE_LENGTH_EXCEEDED");
        if(messageContent < config.minMessageLength) throw Error("MESSAGE_TOO_SMALL");
        this.content = messageContent;
    }
    setAttachments(attachments)
    {
        if(!attachments) return;
        if(attachments.length < 1) return;
        try {
            attachments.forEach(attachment => {
                if(typeof attachment != "string") return;
                if(attachment.length < 4) return;
                if(!attachment.startsWith("https://")) throw Error("IMAGE URL MUST BE USING HTTPS PROTOCOL!");
                this.attachments.push(attachment);
            })
        } catch(err) {
            throw Error("INVALID_ATTACHMENTS_FORMAT")
        }
    }
    setCid(cid)
    {
        if(!cid) throw Error("NO_CID")
        if(typeof cid != "number") throw Error("INVALID_CID_FORMAT");
        if(cid.toString().length != 3) throw Error("INVALID_CID_SIZE");
        this.cid = cid;
    }
}

module.exports = (wss, ws, c) =>
{
    if(!c) return;
    if(typeof !c == "object") return;

    console.log(c)

    var msg = new Message(ws.id);
    try {
        msg.setContent(c.content);
        msg.setCid(c.cid);
        msg.setAttachments(c.attachments);
        if(!msg.content && msg.attachments.length < 1) throw Error("EMPTY_MESSAGE")
    } catch (err) { return ws.sendError(err.toString()); }
    
    wss.broadcast(new wss.WSMessage("CHAT-MESSAGE", msg))

}
