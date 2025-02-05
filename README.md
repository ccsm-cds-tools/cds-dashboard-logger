# CDS Dashboard Logger
This is a super-lightweight logging service used to record analytics data from the CCSM CDS Dashboard for testing and evaluation purposes. 

It uses [Express](https://expressjs.com) and [Winston](https://github.com/winstonjs/winston) to record data sent from the CCSM CDS Dashboard. 

## Usage
Install dependencies: `npm install` and then start the logger `npm run start`. You can pass an env variable to set the port the logger will listen on: `PORT=5000 node index.js`
When run in development mode, it will write a log message to the console. In production mode (`NODE_ENV=production node index.js`) it will not output to the console.

By default, the logger will listen for HTTP POST requests with a JSON body. These will be written to .log files in the `logfiles` directory. By default, log files will be rotated daily, and previous log files are gzipped. 

If you want to run the logger in https mode, place `server.key` and `server.cert` files in the directory with index.js and start. The logger will then listen for HTTPS POST requests.

## License

(C) 2025 The MITRE Corporation. All Rights Reserved. Approved for Public Release: 21-1556. Distribution Unlimited.

Unless otherwise noted, the CDS Dashboard Logger is available under an Apache 2.0 license, no warranty is made and no liability is assumed.