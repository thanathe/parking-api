/* jshint node:true */
'use strict';

var app = require('./app');
var environment = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';

app.set('port', process.env.PORT || 8000);
app.set('ipaddress', process.env.IPADDR || '127.0.0.1');
app.set('env', environment);

var server = app.listen(app.get('port'), app.get('ipaddress'), function() {
  console.log('Express server listening on port ' + server.address().port);
});
