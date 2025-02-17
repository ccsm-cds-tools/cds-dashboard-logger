/* Define simple logging service for recording metrics from CDS Dashboard
 * Listen for POST requests at :PORT/log and write to daily rotated logfiles
 *
 * Supports https POST requests if server.key and server.cert files are
 * present in the directory with this file.
 * PORT may be set using node environment variable.
 * 
 */

const express = require("express");
const cors = require("cors");
const process = require("node:process");
const fs = require("fs");
const https = require('https');
const http = require('http');

const winston = require("winston");
require('winston-daily-rotate-file');

const { nanoid } = require("nanoid");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json())
app.use(express.text());
const PORT = process.env.PORT || 4040;
const { combine, timestamp, json } = winston.format;

// setup auto rotate logfile transport
const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: 'ccsmcds-%DATE%.log',
  dirname: 'logfiles',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxFiles: null
});

fileRotateTransport.on('rotate', (oldLogfile, newLogfile) => {
  console.log(`Switching from ${oldLogfile} to ${newLogfile}`)
});

const logger = winston.createLogger({
  level: 'info',
  format: combine(timestamp(), json()),
  defaultMeta: { service: 'user-service' },
  transports: [
    // handle error and fatal log levels in separate file
    new winston.transports.File({ filename: 'logfiles/error.log', level: 'error' }),
    // Default logged information will go to the rotated logfiles 
    fileRotateTransport
  ],
});

// Add console logging for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}



app.get('/404', (req, res) => {
    res.sendStatus(404);
})

app.post("/log", (req, res) => {
  console.log(req.body);
  logger.info({
    id: nanoid(),
    message: req.body
  });
  res.json({success:true});
});
const certPath = 'server.cert'; // todo grab from env maybe
const keyPath = 'server.key';
if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
  const sslOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };
  const httpsServer = https.createServer(sslOptions, app);
  httpsServer.listen(parseInt(PORT, 10), () => {
    console.log(`CDS Dashboard Logger is running at https://localhost:${PORT}`);
  });
} else {
  http.createServer(app).listen(parseInt(PORT, 10), () => {
    console.log('Cert not found, using http instead of https');
    console.log(`CDS Dashboard Logger is running at http://localhost:${PORT}`);
  });
}
