var express = require("express");
var router = express.Router();
var appContext
var url = require("url");

function dynamicRouter(app){
	appContext = app;
	router.use(manageAction);
	appContext.use(router);
}

function manageAction(req,res,next){
	var path; //le path aprés le port 3000 dans l'url
	var type; //GET ou POST
	var controler; //nom du controleur à charger
	path = url.parse(req.url).pathname;
	//il faut supprimer pour le routage le param aprés l'action
	if (path.split('/').length>0) path='/'+path.split('/')[1]
	//console.log('Path url: ',path.split('/')[1]);
	type =req.method;
	console.log('path: ',path);
	if (typeof GLOBAL.actions_json[type+path]=='undefined'){
		console.log("Erreur pas d'action: "+path);
		next();
	}
	else{
		instanceModule = require('./routes/'+GLOBAL.actions_json[type+path].controler);
		router.use(path,instanceModule);
		next();
	}
}
module.exports = dynamicRouter;
