class Profile {
    constructor(username, color, avatar)
    {
        this.username = username;
        this.color = color;
        this.avatar = avatar;
    }
}

//Blueprint for messages.
class Message {
    constructor(author, content)
    {
        //This client-generated random number is sent back from the server so the client knows that it was his message that arrived back.
        this.cid = Math.floor(Math.round((Math.random()*900)+100))
        this.author = session.profile.id;
        this.content = content;
        this.attachments = [];
    }
}

//Blueprint for outgoing WS messages
class WSMessage {
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
    toObject(str)
    {
        return JSON.parse(str);
    }
}

function createMessageElement(message) {};
function sendMessage(content) {};
function sendWS(wsmessage) {};
function updatePendingMessage(id) {};
function setTextareaSize() {};
function updateMemberCount(count) {};
function escapeHTML(string) {};

var ws;
var session = {};
var onlineClients = [];
var loadingContainer = {};
var loading = {};
var checkNumber = 0;
var attachmentMenuOpen = false;

function promptLogin(callback)
{
    var loginContainer = document.getElementById("login_container");
    var loginForm = document.getElementById("loginform");

    function submitLogin()
    {
        let username = document.getElementById("loginform-username").value;
        let color = document.getElementById("loginform-color").value;
        let avatar = document.getElementById("loginform-avatar").value;

        loginContainer.style.display = "none";
        session.profile = new Profile(username, color, avatar);
        callback();
    }

    loginContainer.style.display = "block";

    setTimeout(() => {loginContainer.focus()},10);
    loginContainer.addEventListener("keydown", (event) => {
        if(event.key != "Enter") return;
        loginContainer.style.display = "none";
        submitLogin();
    });

    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();
        submitLogin();
    }, true);
}

function registerWS(ws)
{
    ws.send(new WSMessage("REGISTER", {profile:session.profile}).toString());
}

function connectWS() {
    
    function createWS()
    {
        ws = new WebSocket(`${location.protocol == "https:"?"wss":"ws"}://${window.location.hostname}${window.location.port?":"+window.location.port:""}`);
    }

    if(!ws)
    {
        createWS();
    }
    else
    {
        if(ws.readyState == WebSocket.OPEN) return;
        else if(ws.readyState == WebSocket.CONNECTING) 
        {
	    console.log("connecting");
            loadingContainer.style.display = "block";
            loading.innerText = "Connecting..."; 
            return;
        }
        else createWS()
    }

    ws.addEventListener("open", (event) => {
        loadingContainer.style.display = "block";
        loading.innerText = "Successfully connected to the websocket server!\nRegistering...";
        ws.id = Date.now();

        registerWS(ws);
        var wsid = ws.id;
        setInterval(() => {
            if(ws.id != wsid) return;
            checkNumber ++;
            console.log("Running check number " + checkNumber +"...");
            ws.send(new WSMessage("PING", {}).toString());
            ws.unresponsive = true;
            setTimeout(() => {
                if(ws.unresponsive == true)
                {
                    console.log("Check number " + checkNumber + " FAILED. CLOSING WS.")
                    ws.close();
                    ws = undefined;
                }
                else { console.log("Check number " + checkNumber + " SUCCESS") }
            }, 9000)
        }, 10000);
    });

    ws.addEventListener("message", (event) => {

        const data = new WSMessage().toObject(event.data)
        var c = data.content;        

        if(data.type == "REGISTER-SUCCESS")
        {
            loading.innerText = "Successfully registered!";
            session.profile = c.profile;
            loadingContainer.style.display = "none";
        }
        if(data.type == "ONLINE-UPDATE")
        {
            onlineClients = c;
            updateMemberCount(c);
        }
        if(data.type == "CHAT-MESSAGE")
        {
            createMessageElement(c);
            setTextareaSize();
            console.log(c)
            updatePendingMessage(c.cid);
        }
        if(data.type == "PONG")
        {
            console.log("PING RECEIVED")
            ws.unresponsive = false;
        }
        if(data.type == "ERROR")
        {
            alert("The server sent the following error message:\n"+c)
        }
    });

    ws.onclose = function(e) {

    };

    return true;

}

escapeHTML = (string) =>
{
    return string.replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function getProfileById(id)
{
    var c = undefined;
    onlineClients.forEach((client) => {
        if(client.id == id) c = client;
    });
    return c;
}

window.addEventListener("load", async function() {

    var channel = document.getElementById("channel_content");
    var channel_content_bottom = document.getElementById("channel_content_bottom");
    var textbox = document.getElementById("chat_input");
    var appContainer = document.getElementById("app_container");
    var attachmentButton = document.getElementById("attachment_button");
    var attachmentMenu = document.getElementById("attachment_menu");
    var attachmentUrl = document.getElementById("attachment-url");
    var imagePreview = document.getElementById("img_embed_preview");
    var sendButton = document.getElementById("send_button");
    
    loadingContainer = document.getElementById("loading_container");
    loading = document.getElementById("loading_text_details");

    promptLogin(() =>
    {
        loadingContainer.style.display = "block";
        appContainer.style.display = "block";
        setTextareaSize();
        connectWS();
        setInterval(function() {
            connectWS();
        }, 500); 
    });

    updateMemberCount = (clients) =>
    {
        var onlineNames = [];
        clients.forEach((client) => {
            onlineNames.push(` <b style="color:${client.color}">` + escapeHTML(client.username)+`</b>`)
        })
        onlineindividuals.innerHTML = onlineNames;
    }

    createMessageElement = (message) =>
    {
        var a = getProfileById(message.author);
        let element = document.createElement("div");
        var msgAttachments = "";
        if(message.attachments.length > 0)
        {
            message.attachments.forEach((attachment) => {
                msgAttachments = msgAttachments + `<img src="${escapeHTML(attachment)}"></img>`;
            })
        }
        element.className = `message ${message instanceof Message?"pending_message":""} ${message.cid}`;
        if(message.id) element.id = `message-${message.id}`
        channel.insertBefore(element, channel_content_bottom);
        element.innerHTML =
        `<div class="avatar_holder" style="border-color:${a.color};background-color:color-mix(in srgb, ${a.color}, transparent 80%)">`+
            `<img src="${escapeHTML(a.avatar)}" style="border-color: ${a.color}">` +
        `</div>`+                    
        `<div class="message_content">`+
            `<p class="username" style="color:${a.color}">${escapeHTML(a.username)}</p>` + 
            `<p>${escapeHTML(message.content)}</p> ` +
            `${msgAttachments?msgAttachments:""}` +
        `</div>`;  

        setTimeout(() => {
            element.innerHTML = element.innerHTML.replace("Sending...","Server seems to be down")
        }, 5000)
    }

    sendMessage = () =>
    {
        if(textbox.value.length < 1 && attachmentUrl.value.length < 1) return;
        var text = textbox.value.trim()
        var msg = new Message(session.profile.id, text);
        if(attachmentUrl.value.length > 1) msg.attachments.push(attachmentUrl.value);
        attachmentUrl.value = "";
        imagePreview.src = "";
        createMessageElement(msg)
        textbox.value = "";
        setTextareaSize();
        ws.send(new WSMessage("CHAT-MESSAGE", msg));
    }

    updatePendingMessage = (cid) =>
    {
        var pendingMessages = channel.getElementsByClassName("pending_message");
        for (let pendingMessage of pendingMessages) {
            if(pendingMessage.className.includes(cid)) pendingMessage.remove();
        }
    }

    /*
    //Scrolling
    window.addEventListener("wheel", (event) => {
        if(channel.matches(':hover')) channel.scrollTo(0, channel.scrollTop+(event.deltaY/2));
    });
    */

    //Textarea scaling
    setTextareaSize = () =>
    {
        textbox.style.height = '1px';
        if(textbox.scrollHeight > window.innerHeight/2)
        {
            return textbox.style.height = (window.innerHeight/2)-20 + "px";
        }
        textbox.style.height = textbox.scrollHeight + "px";
        channel_content_bottom.style.height = (75 + textbox.scrollHeight) + "px";
        channel.scrollTo(0, channel.scrollHeight);
    };
    textbox.addEventListener("input", () => { setTextareaSize() });

    //Focus on textarea by default
    textbox.focus();

    //Send message on enter
    textbox.addEventListener("keydown", (event) => {
        if (event.key == "Enter") {
            if(event.shiftKey) return;
            event.preventDefault();
            sendMessage();
        }
    });

    attachmentButton.addEventListener("click", (event) =>
    {
        if(attachmentMenuOpen)
        {
            attachmentButton.style.filter = "brightness(50%)";
            attachmentMenu.style.bottom = "0";
            attachmentMenu.style.top = "auto";
            attachmentMenu.style.transform = "translateY(100%)";
            attachmentMenu.style.opacity = 0;
            attachmentMenuOpen = false;
        }
        else
        {
            attachmentButton.style.filter = "brightness(200%)";
            attachmentMenu.style.top = "0";
            attachmentMenu.style.bottom = "auto";
            attachmentMenu.style.transform = "translateY(-100%)";
            attachmentMenu.style.opacity = 1;
            attachmentMenuOpen = true;
        }
    });

    attachmentUrl.addEventListener("input", (event) =>
    {
        event.preventDefault();
        imagePreview.src = attachmentUrl.value;
    })

    sendButton.addEventListener("click", (event) => {
        sendMessage();
    })

});

