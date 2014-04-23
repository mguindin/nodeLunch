// Node.js lunch selector

var http = require('http'),
    fs = require('fs'),
    path = require('path'),
	yelp_url = "http://api.yelp.com/business_review_search?",
	weather_url = "",
	cuisine = "random",
	rating = 0,
	rev = 0,
	location = "10021", //default for now
	choice = 1,
	debug = false;

function radius(){
	return "0.5"; //default to half mile for now
}

function buildYelpUrl(callback){
	var yelp_key = "";
	fs.readFile(path.resolve(__dirname, 'yelp_key'), 'utf8', function(err, data){
		if (err) {
			console.log("yelp_key file doesn't exist! " + err);
			process.exit(1);
		} else {
			yelp_key = data.replace("\n", "");
		}
		var url = yelp_url +
			"term=" + cuisine +
			"&location=" + location +
			"&radius=" + radius() +
			"&limit=20" +
			"&ywsid=" + yelp_key +
			"&category=restaurants";
		callback(url);
	});
}

function processReview(element, index, array){
	var rev = Math.abs(rating - element.rating) < 1 ? element : rev;
}

function processData(data, choice){
	var restaurant = data.businesses[choice];
	console.log("You will be having " + restaurant.name +
		", which is located at " + restaurant.address1 + ".");
	rating = restaurant.avg_rating;
	console.log(restaurant.name + " has an average rating of " + rating);
	restaurant.reviews.forEach(processReview);
	var review_text = restaurant.reviews[rev].text_excerpt.replace("\n", " ");
	console.log("People are saying: " + review_text);
}


function processRequest(url){
	http.get(url, function(response) {
		var buffer = "",
			data,
			route;

		response.on("data", function(chunk){
			buffer += chunk;
		});

		response.on("end", function(err){
			data = JSON.parse(buffer);
			processData(data, choice);
		});
	});
}

//process the code
//get command line arguments
if (process.argv.length > 2) { //we have command line arguments
	process.argv.forEach(function (val, index) {
		if (val.indexOf("--") != -1) {
			switch(val) {
				case "--debug":
					debug = true;
					break;
				case "--cuisine":
					cuisine = process.argv[index+1];
					break;
				case "--location":
					location = process.argv[index+1].replace(/ /g, "%20");
					break;
                case "--choice":
                    choice = process.argv[index+1];
                    break;
            }
        }
    });
}

if (debug) {
    console.log("Cuisine: " + cuisine);
    console.log("Location: " + location);
    console.log("Choice: " + choice);
    buildYelpUrl(console.log);
} else {
    buildYelpUrl(processRequest);
}
