var mongo = require('mongoose');



console.log("try connect");
var url = "mongodb://172.16.151.33:27017/alnoamanApi";
mongo.connect(url, { useNewUrlParser: true, useUnifiedTopology: true  },function(err, db) {
    if (err) throw err;
    else
    console.log("Database Connected");
    
   // db.close();
  });