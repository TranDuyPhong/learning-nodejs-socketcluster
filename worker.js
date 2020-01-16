var SCWorker = require('socketcluster/scworker');
var express = require('express');
var serveStatic = require('serve-static');
var path = require('path');
var morgan = require('morgan');
var healthChecker = require('sc-framework-health-check');

class Worker extends SCWorker {
    run() {
        var env = require('node-env-file');
        var mysql = require('mysql');
        var crypto = require('crypto');
        var sessions = require('client-sessions');
        var bodyParser = require('body-parser');
        var cookieParser = require('cookie-parser');

        env('./.env');

        var pool = mysql.createPool({
            connectionLimit: 500,
            host: process.env.DB_HOST,
            user: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            debug: false
        });

        console.log('   >> Worker PID:', process.pid);
        var environment = this.options.environment;

        var app = express();

        app.set('views', __dirname + '/public/views');
        app.set('view engine', 'jade');

        // Format source code HTML pretty
        app.locals.pretty = true;

        var httpServer = this.httpServer;
        var scServer = this.scServer;

        if (environment === 'dev') {
            // Log every HTTP request.
            // See https://github.com/expressjs/morgan for other available formats.
            app.use(morgan('dev'));
        }

        app.use(serveStatic(path.resolve(__dirname, 'public')));
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(bodyParser.json());
        app.use(cookieParser());
        app.use(sessions({
            cookieName: 'session',
            secret: process.env.SESSION_SECRET,
            duration: 1 * 24 * 60 * 60 * 1000 // 1 day
        }));

        app.use(function(req, res, next) {
            var url = req.url;
            if (req.session.user) {
                if (url === '/session/create') {
                    res.redirect('/');
                } else {
                    next();
                }
            } else {
                if (url === '/session/create' || url === '/session/store') {
                    next();
                } else {
                    req.session.error = 'You must be logged in to access that area.';
                    res.redirect('/session/create');
                }
            }
        });

        app.get('/session/create', (req, res) => {
            var error = req.session.error || null;
            var msg = req.session.msg || null;
            delete req.session.error;
            delete req.session.msg;;
            res.render('session-create', {
                title: 'Login Page',
                error: error,
                msg: msg
            });
        });

        app.post('/session/create', (req, res) => {
            var email = req.body.email;
            var password = crypto.createHash('md5').update(req.body.password).digest('hex');
            pool.query('SELECT * FROM users WHERE email = ?', [email], function(err, rows) {
                if (err) {
                    console.error(err);
                    req.session.error = 'Failed to get user accounts. Please contact an administrator';
                    res.redirect('back');
                } else {
                    if (rows.length) {
                        var user = rows[0];
                        if (user.password === password) {
                            delete user.password;
                            req.session.user = user;
                            res.redirect('/#/dashboard');
                        } else {
                            req.session.error = 'The password does not match';
                            res.redirect('back');
                        }
                    } else {
                        req.session.error = 'There is no user with that email';
                        res.redirect('back');
                    }
                }
            });
        });

        app.get('/session/destroy', function(req, res) {
            res.session.destroy();
            req.session.msg = 'Successfully logged out !';
            res.redirect('/session/create');
        });

        app.get('/', (req, res) => {
            res.render('index.jade', {
                title: 'Home Page'
            });
        });

        app.get('*', (req, res) => {
            res.redirect('/');
        });

        // Listen for HTTP GET "/health-check".
        healthChecker.attach(this, app);

        httpServer.on('request', app);

        var ModelController = require('./controllers/ModelController');

        scServer.on('connection', function(client) {
            console.log('Client ' + client.id + ' has connected');
            client.on('messages', function(data) {
                // console.log(data);
                // client.emit('response', data);
                ModelController[data.route][data.resource](client, pool, data);
            });
        });

        /**
         * NOTE: Be sure to replace the following sample logic with your own logic.
         */

        /**
        var count = 0;
        // Handle incoming websocket connections and listen for events.
        scServer.on('connection', function (socket) {
     
          socket.on('sampleClientEvent', function (data) {
            count++;
            console.log('Handled sampleClientEvent', data);
            scServer.exchange.publish('sample', count);
          });
     
          var interval = setInterval(function () {
            socket.emit('random', {
              number: Math.floor(Math.random() * 5)
            });
          }, 1000);
     
          socket.on('disconnect', function () {
            clearInterval(interval);
          });
     
        });
        */
    }
}

new Worker()