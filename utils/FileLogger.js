const fs = require('fs');

class Logger {
  constructor(logTargets = ['app'], logFolder = './logs/'){
    this.logFolder = logFolder;
    if (!fs.existsSync(this.logFolder)) fs.mkdirSync(this.logFolder);
    this.logs = new Map(logTargets.map( (target) => ([target, {fileStream: null, lastDate: null}]) ));
  }
  get currentLogTime(){
    let now = new Date();
    now.setUTCMinutes(0,0,0);
    return now.toISOString();
  }
  getCurrentLogStream(target){
    let log = this.logs.get(target);
    if(log == null){
      let availableLogs = [...this.logs.keys()].join(', ');
      let error = `Logtarget [${target}] not found. Available targets are [${availableLogs}]`;
      throw new Error(error);
    } else if(log && log.lastDate !== this.currentLogTime) {
      if(log.fileStream != null) log.fileStream.end();
      let logPath = `${this.logFolder}/${target}_${this.currentLogTime}.log`;
      log.fileStream = fs.createWriteStream(logPath, {flags: 'a'});
      log.lastDate = this.currentLogTime;
    }
    return log.fileStream;
  }
  log(target, ...args){
    let logStream = this.getCurrentLogStream(target);
    let logContent = this.currentLogTime + ' ' + args.map((arg) => JSON.stringify(arg)).join(' ');
    logStream.write(`${(new Date()).toISOString()} ${logContent}\n`);
  }
}

module.exports = Logger;