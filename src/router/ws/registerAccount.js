class Profile {
    constructor(id)
    {
        this.id = id;
        this.username = "Guest";
        this.color = "#FFFFFF";
        this.avatar = "/img/avatars/default.png";
    }
    setUsername(username)
    {
        if(!username) return;
        if(typeof username != "string") throw Error("USERNAME_NOT_STRING");
        if(username.length < config.minUsernameLength) throw Error("USERNAME_TOO_SHORT");
        if(username.length > config.maxUsernameLength) throw Error("MAX_USERNAME_LENGTH_EXCEEDED");
        this.username = username;
        return true;
    }
    setColor(color)
    {
        if(!color) return;
        if(typeof color != "string") throw Error("COLOR_NOT_STRING");
        try { color = color.toUpperCase(); } catch (err) { throw Error("COLOR_UPPERCASE_FAILED"); }
        if(!/^#[0-9A-F]{6}$/i.test(color)) throw Error("COLOR_NOT_HEX");
        this.color = color;
        return true;
    }
    setAvatar(url)
    {
        if(!url) return;
        if(typeof url != "string") throw Error("AVATAR_NOT_STRING")
        if(url.length > config.maxAvatarUrlLength) throw Error("AVATAR_URL_TOO_LONG");
        if(url.startsWith("/img/"))
        {
            var imgName = url.split("/img/avatars/")[1];
            if(!imgName) throw Error("AVATAR_NOT_FOUND");
            if(imgName.includes("../")) throw Error("SORRY_THIS_WONT_WORK");
            if(!/[a-zA-Z0-9]/.test(imgName)) throw Error("AVATAR_NOT_FOUND")
            try { 
                if(require("fs").existsSync(__root + "/src/static/img/avatars/"+imgName)) this.avatar = "/img/avatars/"+imgName;
                else throw Error("AVATAR_NOT_FOUND");
            }
            catch(err) { throw Error("AVATAR_NOT_FOUND") }
        }
        else
        {
            if(config.localMediaHosting) require(__root + "/src/utils/")(url);
            else
            {
                if(!url.startsWith("https://")) throw Error("AVATAR_PROTOCOL_NOT_SECURE");
                this.avatar = url;
            }
        }
    }
}

module.exports = (wss, ws, c) =>
{
    if(!c) return;
    if(typeof !c == "object") return;

    try
    {
        if(config.passwordRequired)
        {
            if(!c.password) throw Error("PASSWORD_REQUIRED");
            if(typeof c.password != "string") throw Error("INVALID_PASSWORD_FORMAT");
            if(c.password != config.password) throw Error("INCORRECT_PASSWORD");
        }
    } catch(err) { return ws.sendError(err.toString()); }

    var userid = Date.now();

    ws.id = userid;

    var profile = new Profile(userid);

    var successfull = true;
    try {
        if(!c.profile) throw Error("NO_PROFILE_SET")
        if(typeof c.profile != "object") throw Error("INVALID_PROFILE_FORMAT")
        profile.setUsername(c.profile.username);
        profile.setColor(c.profile.color);
        profile.setAvatar(c.profile.avatar);
    }
    catch (err) { ws.sendError(err.toString()); successfull = false }

    if(successfull)
    {
        ws.profile = profile;
        ws.isRegistered = true;
        wss.broadcast(new wss.WSMessage("ONLINE-UPDATE", wss.getOnlineClients()).toString());
        ws.send(new wss.WSMessage("REGISTER-SUCCESS", {profile:profile}).toString())
    }
}
