const path = require('path');
const mkdirp = require('mkdirp');
const fs = require('fs');
const Koa = require('koa');
const Logger = require('koa-logger');
const Router = require('koa-router');
const BodyParser = require('koa-bodyparser');



class WebApplication {
  constructor(config, logger) {
    this.config = config;
    this.logger = logger;
  }

  start() {
    let {config, logger} = this;
    let {port} = config.web
    logger.info(`config => ${JSON.stringify(config)}`);
    const app = this.app = new Koa();
    const router = new Router();
    router.post('/upload', async(ctx) => {
      let {request, response} = ctx;
      let {query} = request;
      let {site, file} = query;
      if (site && file) {
        logger.info(`site => ${site.yellow}`);
        logger.info(`file => ${file.yellow}`);
        logger.info(`ctx.request.body => ${JSON.stringify(ctx.request.body)}`);
        let sites = config.sites.filter(s => s.name == site);
        if (sites.length > 0) {
          let s = sites[0];
          let fullpath = `${s.path}${path.sep}${file}`;
          let dir = path.dirname(fullpath);
          let filename = path.basename(fullpath);
          logger.info(`filename => ${filename.yellow}`);
          try {
            let text = JSON.stringify(request.body);
            await mkdirp(dir);
            logger.info(`successfully create directory: ${dir.yellow}`);
            await fs.promises.writeFile(fullpath, text);
            logger.info(`successfully write ${fullpath.cyan} with ${text.length} bytes`);
            ctx.body = `upload to site[${site}] at ${dir} with filename ${filename}`;
          } catch (error) {
            logger.error(error);
            ctx.body = `failed to upload`;
          }
        }
        else {
          ctx.body = `no such site ${site}`;
        }
      }
      else {
        ctx.body = "missing site or file in query string...";
      }
    });
    router.get('/hello', async(ctx) => {
      ctx.body = 'World';
    });
    app.use(Logger());
    app.use(BodyParser());
    app.use(router.routes());
    app.listen(port);
    logger.info(`listening port ${port}`);
  }
}

module.exports = exports = (logger, config) => {
  var app = new WebApplication(config, logger);
  app.start();
}
