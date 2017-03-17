var express = require('express');
var router = express.Router();
/* GET users listing. */
router.get('/', function(req, res, next) {
	if ((req.session.passport) && (req.session.passport.user != null)) {
		res.render('admin',{title:'Espace Admin',status:'true'});
	}else res.redirect('/login');
});

module.exports = router;
