I have created this application in sophomore year for personal use and I no longer maintain it actively. This software comes with no warranty and I am not liable for any damages caused by it.

The primary goal of this application is to provide a lightweight and easily self-hostable chat application that circumvents censorship.

### Features
- Sending and receiving messages thru websockets
- Nice-looking UI with easily customizable themes
- "Cloaking" feature to prevent browser extensions from viewing message contents
- Send images by providing image URL
- Optional password protection of the application
- Tested for potential XSS vulnerabilities
  
### Anti-features
- No message preservation or databases of any kind
- No file uploading
- No proxies for attachment URLs. Clients load third party content directly.
- Known to break on Safari
- Might require a theme with blur disabled on low-end systems for a smooth experience

### Usage
1. Have git, node.js and npm isntalled
2. Clone repo: `git clone https://github.com/aumenhoffer/express-chat`
3. Change directory: `cd express-chat`
4. Run `npm update` to install dependencies
5. Optionally, configure port by editing config.json (Default is port 8080)
6. Run `node index.js` or `node .`
7. Done. Access chat app by going to 127.0.0.1:*port*/app
