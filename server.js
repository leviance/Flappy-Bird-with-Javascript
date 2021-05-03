const express = require('express')
const app = express();
const server = require('http').createServer(app);
const ejs_extend = require('express-ejs-extend');

app.engine('ejs', ejs_extend);
app.set('view engine', 'ejs');
app.use(express.static('./public'))

app.get('/', (req, res) => {
    return res.render('./index.ejs');
})

server.listen(3000, () => {
    console.log('listening on 3000');
});