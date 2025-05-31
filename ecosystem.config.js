module.exports = 
  {
    apps: [{
        env: {
            NODE_ENV: "development"
        },
        error_file: "./logs-test/api-error.log",
        //ignore_watch: ["logs", "node_modules","public"],
        log_date_format: "YYYY-MM-DD HH:mm:ss.SSS",
        out_file: "./logs-test/api-console.log",
        script: "./server.js",
        name:'Api-test1'
    }]
}


