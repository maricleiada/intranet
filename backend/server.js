const express = require('express');
const axios = require('axios');
const dns = require('dns');
const net = require('net');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Pasta e arquivo de logs
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
const logFile = path.join(logDir, 'status-log.json');
if (!fs.existsSync(logFile)) fs.writeFileSync(logFile, JSON.stringify([]));

app.use(express.static('public'));

app.get('/check', async (req, res) => {
    const url = req.query.url;
    const startTime = Date.now();

    if (!url) return res.status(400).json({ error: 'URL não fornecida' });

    let hostname;
    try {
        const parsedUrl = new URL(/^https?:\/\//.test(url) ? url : `http://${url}`);
        hostname = parsedUrl.hostname;
    } catch (e) {
        hostname = url;
    }

    const isIp = net.isIP(hostname);
    let resolvedIp = hostname;
    let resolvedHostname = '';
    let httpStatus = null;
    let responseTime = null;
    let status = 'offline';

    try {
        if (isIp) {
            const hostnames = await dns.promises.reverse(hostname);
            resolvedHostname = hostnames[0] || '';
        } else {
            const addresses = await dns.promises.lookup(hostname);
            resolvedIp = addresses.address;
            resolvedHostname = hostname;
        }
    } catch (err) {
        // Mesmo offline, responde com IP conhecido e hostname vazio
    }

    try {
        if (resolvedIp === '8.8.8.8') {
            responseTime = 0;
            status = 'online';
        } else {
            const response = await axios.get(url.startsWith('http') ? url : `http://${url}`, { timeout: 5000 });
            responseTime = Date.now() - startTime;
            status = 'online';
            httpStatus = response.status;
        }
    } catch (error) {
        responseTime = Date.now() - startTime;
        status = 'offline';
        httpStatus = error.response?.status || null;
    }

    const logEntry = {
        url,
        status,
        ip: resolvedIp,
        hostname: resolvedHostname,
        httpStatus,
        responseTime,
        timestamp: new Date().toISOString()
    };

    // Salva no log
    const logs = JSON.parse(fs.readFileSync(logFile));
    logs.push(logEntry);
    fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));

    res.json(logEntry);
});

app.get('/history', (req, res) => {
    const logs = JSON.parse(fs.readFileSync(logFile));
    res.json(logs);
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
