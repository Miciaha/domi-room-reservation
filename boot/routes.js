//var path = require('path');

module.exports = function(app){

	// SNAG 

	// receive request to reserve a room
	app.post('/room',
		app.snagController.room
	);


	// DASH

	// render Dash
	app.get('/dash', function(req, res) {
	  // both of these would work
	  //res.sendfile(path.resolve(__dirname + '/../app/views/dashboard.html'));
	  //res.sendfile('app/views/dashboard.html');
	  res.render('dashboard');
	});

	// return list of all members
	app.get('/mems', 
		app.dashController.mems
	);

	// return list of all requests
	app.get('/reqs', 
		app.dashController.reqs
	);

	// return list of last checked values
	app.get('/getLasts',
		app.dashController.getLasts
	);

	// set last values collection
	app.post('/setLasts',
		app.dashController.setLasts
	);

	// merge two members 
	app.post('/merge', 
		app.dashController.merge
	);

	// NOT IMPLEMENTED YET
	// delete request  
	app.post('/delreq', 
		app.dashController.delreq
	);

	// reconfigure members
	app.post('/reconfig', 
		app.dashController.reconfig
	);

	// reconfigure members
	app.post('/restart', 
		app.dashController.restart
	);




	// OTHER 

	// render robots.txt
	app.get('/robots.txt', function(req, res) {
	  res.type('text/plain');
	  res.send("User-agent: *\nDisallow: /");
	}); 


	// 404
	// always have this route last
	app.get('*', function(req, res){
		res.type('text/plain');
	  	res.send("404 Not Found, Ask Dom.");
	  //res.sendfile(__dirname + '/public/404.html');
	});


}