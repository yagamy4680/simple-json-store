require! <[pino path fs]>
yaml = require \js-yaml

ERR_EXIT = (logger, err) ->
  logger.error err
  return process.exit 1


module.exports = exports =
  command: "start"
  describe: "startup the json store server"

  builder: (yargs) ->
    yargs
      .example '$0 start -c config/defaults.yml', 'run json store server with default settings from ./config/defaults.yml'
      .alias \c, \config
      .default \c, null
      .describe \c, "path to configuration yaml file to be loaded"
      .alias \v, \verbose
      .default \v, no
      .describe \v, "verbose output"
      .boolean 'v'
      .demand <[c v]>


  handler: (argv) ->
    {verbose} = argv
    console.log "dirname = #{__dirname}"
    console.log "verbose = #{verbose}"
    console.log JSON.stringify argv, ' ', null
    # assetDir = "." unless assetDir?
    # assetDir = path.resolve process.cwd!, assetDir
    level = if verbose then 'trace' else 'info'
    # console.log "assetDir => #{assetDir}"
    options = translateTime: 'SYS:HH:MM:ss.l', ignore: 'pid,hostname'
    target = 'pino-pretty'
    transport = pino.transport {target, options}
    # logger = pino {transport, level}
    logger = pino transport
    logger.info "config: #{argv.config}"
    json = yaml.load fs.readFileSync argv.config, 'utf8'
    logger.info "config => #{JSON.stringify json}"
    return ( require \../helpers/web ) logger, json 
    # s1 = new SerialDriver logger, 1, serial1
    # s2 = new SerialDriver logger, 2, serial2
    # pw = CreateProtocolManager logger, assetDir, s1, s2
    # (err) <- pw.start
    # eturn ERR_EXIT logger, err if err?