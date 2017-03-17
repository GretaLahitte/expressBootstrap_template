var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var colors = require('colors');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local');




// set hbs partials
var hbs = require('hbs');
hbs.registerPartials(__dirname + '/views/partials', function() {
console.log('partials registered');
});
var app = express();
//Controleurs dynamiques
var fs =require('fs');
GLOBAL.actions_json = JSON.parse(fs.readFileSync('./routes/config_actions.json','utf-8'));
var schemas_json= JSON.parse(fs.readFileSync('./database_schema.json','utf-8'));

GLOBAL.database_schema={}

//DB config Mongoose
var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/exercices",function (err){
	if (err) {throw err;}
	else console.log('Connected successfully to db server!'.green);

});
///Mongoose Schemas////
for(var toto in schemas_json){
	//console.log(schemas_json[toto].schema);
	//console.log(schemas_json[toto].collection);
	//console.log(toto);
	GLOBAL.database_schema[toto]=mongoose.model(toto,new mongoose.Schema(schemas_json[toto].schema),schemas_json[toto].collection)

};
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
				  cookieName: 'sessiongreta',
				  secret: 'keyboard cat',
				   }));

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function(user,done){
	done(null,user.id);
});
passport.deserializeUser(function(id,done){
	GLOBAL.database_schema["Users"].findById(id,function(err,user){
		done(err,user);
	});
});
passport.use(new LocalStrategy(
     function (username, password, done) {
	          GLOBAL.database_schema["Users"].findOne({ login: username }, function (err, user) {
		               if (err) { return done(err); }
		                if (!user) {
				                 console.log("pas d'utilisateur trouvé");
				                 return done(null, false, { message: 'Incorrect username.'});
				               }
				               if (user.mdp != password) {
						                 console.log("password erroné");
						                 return done(null, false, { message: 'Incorrect password.'});
						        }
						               console.log("utilisateur : ", user);
						               return done(null, user);
						            });
						         } ));
app.post('/authenticated', passport.authenticate('local'), function (req, res) {
	if (req.session.passport.user != null) {
		res.redirect('/admin'); //le user est authentifié on affiche l’index il est en session
	    } else {
		   res.redirect('/'); // il n’est pas présent on renvoie à la boîte de login
		     } });
// Gestion des routes dynamiques via configuration json
require('./dynamicRouter')(app);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
//HELPERS
hbs.registerHelper('compare', function(lvalue,rvalue,options){
	console.log('###### COMPARE lvalue: ',lvalue,' et rvalue: ',rvalue);
	if (arguments.length<3)
		throw new Error("Handlebars Helper 'compare' needs 2 parameters");
	var operator = options.hash.operator || '==';
	var operators = {
		'==': function(l,r){
			return l == r;
			},
		'isTabEmpty': function(obj){
			return (!obj|| obj.length==0)}
	}
if (!operators[operator])
	throw new Error("'compare' doesn't know the operator "+operator);
	console.log(operators[operator]);
var result =operators[operator](lvalue,rvalue);
if (result){
	return options.fn(this);
}else{
	return options.inverse(this);
}});
module.exports = app;
