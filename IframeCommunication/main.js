const express = require('express')
const fetch = require('node-fetch');
const cors = require('cors');

const app = express()
const port = 3000

app.use(cors());

app.get('/iframe', (req, res) => {
    fetch('http://localhost:5001/index-iframe.html')
    .then(response => response.text())
    .then(text => {
        text = text.split('src="/').join('src="http://localhost:5001/')
        text = text.replace('</body>', `<script src="http://localhost:5000/injectScript.js"></script></body>`);
        res.send(text)
    });
})

app.get('/iframeFull', (req, res) => {
    
    fetch('http://localhost:5002/index-iframe.html')
    .then(response => response.text())
    .then(text => {
        text = text.split('src="/').join('src="http://localhost:3000/')
        text = text.replace('</body>', `<script src="http://localhost:5000/injectScript.js"></script></body>`);
        res.send(text)
    });
})

var proxy = require('http-proxy').createProxyServer({
    host: 'http://localhost',
    port: 5002
});

app.get('*', (req, res, next)=>{
    console.log(req.originalUrl);
    if (req.originalUrl !== '/iframeFull'&& req.originalUrl !== '/iframe'){
        proxy.web(req, res, {
            target: 'http://localhost:5002'
        }, next);
    }
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})