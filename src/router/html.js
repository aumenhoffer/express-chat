const express = require('express')
const router = express.Router()

router.use(express.static(__root+"/src/static/"))

router.get('/app', (req, res) => res.sendFile(__root+"/src/views/app.html"));
router.get('/cloak', (req, res) => res.sendFile(__root+"/src/views/cloak.html"));

router.use('*', (req, res) => {
    res.status(404);
    res.sendFile(__root+"/src/views/404.html")
});

module.exports = router;