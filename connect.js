/*
	connect.js is only responsible for connecting to the database and is loaded on every single page we have (except Impressum, which is as static as can be)
*/

//Let's connect to our Baqend
DB.connect("http://fuba.baqend.com");