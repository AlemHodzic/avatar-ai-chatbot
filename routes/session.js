const express = require('express');
const router = express.Router();
const env = require('dotenv').config();

const heygen_API = {
    apiKey: process.env.HEYGEN_APIKEY,
    serverUrl: process.env.HEYGEN_SERVERURL
};

const SERVER_URL = heygen_API.serverUrl;
const apiKey = heygen_API.apiKey;

router.get('/', async (req, res) => {
    res.send(`hello world`);
});

router.post('/create', async (req, res) => {

    const params = req.body;

    //let ssn = req.session;
    //console.log('session');
    //ssn.openaiApiKey = 'test sessie';    
    //console.log(ssn.openaiApiKey)
    //console.log(SERVER_URL);
    //console.log(heygen_API.apiKey);
    //const params = JSON.parse('{"quality":"low","avatar_name":"Sarah_studio_20240531","voice":{"voice_id":"a74c7cb1e1f047a589dda7a6103fc365"}}');
    //console.log('start req');
    //console.log(params);
    //console.log('eind req');

    const response = await fetch(`${SERVER_URL}/v1/streaming.new`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': apiKey,
        },
        body: JSON.stringify(params),
    });

    // console.log(response.status);
    if (response.status === 500) {
        //console.error('Server error');
        throw new Error('Server error');
    } else {
        const data = await response.json();
        //console.log(data.data);
        //res.send(response);
        res.json(data.data)
    }

});

router.post('/start', async (req, res) => {

    const params = req.body;

    //console.log(`${SERVER_URL}`);

    const response = await fetch(`${SERVER_URL}/v1/streaming.start`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': apiKey,
        },
        body: JSON.stringify(params),
    });

    if (response.status === 500) {
        //console.error('Server error');
        throw new Error('Server error');
    } else {

        const data = await response.json();
        console.log(data);
        //return data.data;
        res.json(data.data);
    }

});

router.post('/interrupt', async (req, res) => {

    const params = req.body;

    //console.log(`${SERVER_URL}`);

    //console.log('request for interrupt');
    //console.log(params);

    const response = await fetch(`${SERVER_URL}/v1/streaming.interrupt`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': apiKey,
        },
        body: JSON.stringify(params),
    });

    if (response.status === 500) {
        //console.error('Server error');
        throw new Error('Server error');
    } else {
        const data = await response.json();

        //console.log('data');
        //console.log(data);
        //console.log('data.data');
        //console.log(data.data);
        //return data.data;
        res.json(data);
    }

});

router.post('/handleice', async (req, res) => {

    const response = await fetch(`${SERVER_URL}/v1/streaming.ice`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': apiKey,
        },
        body: JSON.stringify(req.body),
    });

    if (response.status === 500) {
        //console.error('Server error');
        throw new Error('Server error');
    } else {
        const data = await response.json();
        //return data;
        res.json(data);
    }

});

router.post('/task', async (req, res) => {

    const response = await fetch(`${SERVER_URL}/v1/streaming.task`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': apiKey,
        },
        body: JSON.stringify(req.body),
    });

    if (response.status === 500) {
        //console.error('Server error');
        throw new Error('Server error');
    } else {
        const data = await response.json();
        //return data.data;
        res.json(data.data);
    }

});

router.post('/stop', async (req, res) => {

    const session_id = req.body;
    //console.log(session_id);

    const response = await fetch(`${SERVER_URL}/v1/streaming.stop`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': apiKey,
        },
        body: JSON.stringify(session_id),
    });

    if (response.status === 500) {
        throw new Error('Server error');
    } else {
        const data = await response.json();
        //return data.data;
        res.json(data.data);
    }

});

module.exports = router;

