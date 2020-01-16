var socketCluster = require('socketcluster-client');

var socket = socketCluster.connect({
    hostname: '127.0.0.1',
    port: 3000
});

socket.publish('broker', {
    message: 'Hello 1'
});

socket.publish('broadcast', {
    message: 'Hello 2'
});

socket.emit('broker', {
    message: 'Hello 3'
});