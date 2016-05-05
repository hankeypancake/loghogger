

const [nodePath, appPath, ...argsList] = process.argv, argv = require('minimist')(argsList);
const http = require('http');
const connect = require('connect');
const FileLogger = require('./utils/FileLogger');
const bodyParser = require('body-parser');

const badRequestHandler = (req, res, next) => {
  if(/POST/i.test(req.method) && /Application\/Json/i.test(req.headers['content-type'])){
    next();
  } else {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'Requests must be POST with content-type: Application/Json' }));
  }
}
const notFoundHandler = (req, res, next) => {
  res.statusCode = 404;
  res.end();
}

const app = {
  server: connect(),
  argv: argv,
  port: appPort = process.env.PORT || argv.port || 3000,
  logger: new FileLogger(argv._, argv.logPath),
  middleWares: [bodyParser.json(), badRequestHandler]
}

for(let middleWare of app.middleWares) app.server.use(middleWare);

for(let routeName of argv._){
  app.server.use(`/${routeName}`, (req, res, next) => {
    app.logger.log(routeName, req.body);
    res.end();
  });
}

app.server.use(notFoundHandler);


http.createServer(app.server).listen(app.port);

let routeNames = app.argv._.map((routeName) => { return `/${routeName}` });
console.log(`Logserver listening at port ${app.port}, logging for routes: ${routeNames}`);