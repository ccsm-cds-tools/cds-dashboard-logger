/* Define simple logging service for recording metrics from CDS Dashboard
 * Listen for POST requests at :PORT/log and write to daily rotated logfiles
 *
 * TODO: Convert to HTTPS, reject HTTP POST requests
 *       Add default / GET
 */

const express = require("express");
const cors = require("cors");
const process = require("node:process")

const winston = require("winston");
require('winston-daily-rotate-file');

const { nanoid } = require("nanoid");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json())

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
  logger.info({
    id: nanoid(),
    message: req.body
  });
  res.json({success:true});
});

app.listen(parseInt(PORT, 10), () => {
  console.log(`CDS Dashboard Logger is running at http://localhost:${PORT}`);
});
