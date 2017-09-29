/* liri.js                                               */
/* Author: Wallis Chau                                   */
/* Date: 9-22-2017                                       */
/* Description: this is node.JS to do several activities */
/*             based on argument or user prompts         */
/* Argument or input prompt:                             */
/* 		my-tweet:          show up to 20 last tweets     */
/*		spotify-this-song: display song info             */
/*		movie-this: 	   display movie info            */
/*      do-what-it-says:   run the request from random.txt */
/* Requirement: inquirer, node-spotify-api, request,     */
/*               twitter packages, keys.js, random.txt   */

var key = require('./keys.js');

//twitter keys
var tw_consumer_key = key.twitterKeys['consumer_key'];
var tw_consumer_secret = key.twitterKeys['consumer_secret'];
var tw_access_key = key.twitterKeys['access_token_key'];
var tw_access_secret = key.twitterKeys['access_token_secret'];
//console.log(tw_consumer_key);
//console.log(tw_consumer_secret);
//console.log(tw_access_key);
//console.log(tw_access_secret);

//spotify keys
var sp_client_id = key.spotifyKeys['client_id'];
var sp_client_secret = key.spotifyKeys['client_secret'];

var act = process.argv[2];
selectAction(act, null);

function selectAction(act, arg) {
	switch (act) {
	case 'my-tweet':
		if (!arg) {
			callTwit();
		}
		break;
	case 'spotify-this-song':
		var songName;
		if (!arg) {
			songName = getRestArgument('The Sign');
		}
		else {
			songName = arg;
		}
		callSpotify(songName);
		break;
	case 'movie-this':
		var movieName;
		if (!arg) {
			movieName = getRestArgument('Mr. Nobody');
		}
		callMovieThis(movieName);
		break;
	case 'do-what-it-says':
		if (!arg) {
			callDoWhat();
		}
		break;
	default:
		//do inquiry to get arg
		var inq = require('inquirer');
		inquireInfo();
}

function inquireInfo() {
		inq.prompt([
			{

			type: 'list',
			message: 'select activity:',
			name: 'activity',
			choices: ['my-tweet', 'spotify-this-song', 'movie-this', 'do-what-it-says']
			}
		])
		.then(function(inqResp) {
			console.log(inqResp.activity);
			switch (inqResp.activity) {
				case 'spotify-this-song':
					inq.prompt([
					{
						type: 'input',
						message: 'enter song name:',
						name: 'songName',
					}
					]).then(function(resp) {
						callSpotify(resp.songName);
					});
					break;
				case 'movie-this':
					inq.prompt([
					{
						type: 'input',
						message: 'enter movie name:',
						name: 'movieName',
					}
					]).then(function(resp) {
						callMovieThis(resp.movieName);
					});
					break;
				case 'do-what-it-says':
					break;
				case 'my-tweet':
					callTwit();
					break;

				default:
			}//switch
		});
	}//inquireInfo

}//selectAction


function getRestArgument(defaultName) {
		var itemName = '';
		if (!process.argv[3]) {
			itemName = defaultName;
		}
		else {
			for (var i=3; i<process.argv.length; i++) {
				itemName = itemName + ' ' + process.argv[i];
				itemName = itemName.trim();
			}
		}
		return itemName;
}

function callTwit() {
	var Twitter = require('twitter');
	var client = new Twitter({
		consumer_key: tw_consumer_key,
		consumer_secret: tw_consumer_secret,
		access_token_key: tw_access_key,
		access_token_secret: tw_access_secret
	});

	var params = {screen_name: 'stonemonkey88'};
	client.get('statuses/user_timeline', params, function(err, tweets, response){
		if(!err) {
			//console.log(JSON.stringify(tweets, null, 2));
			for (var i=0; i<((tweets.length<20)?tweets.length:20); i++) {
				console.log('Created: ' + tweets[i]['created_at']);
				console.log(tweets[i]['text']);
				console.log("==================");
			}
		}
	});
}//callTwit

function callSpotify(songName) {
	console.log("Song name: " + songName);
	var Spotify = require('node-spotify-api');
	var spotify = new Spotify({ 
		id: sp_client_id,
		secret: sp_client_secret
	});

	spotify.search({type: 'track', query: songName}, function(err, data) {
		if (err) {
			console.log('error:' + err);
			return;
		}
		//console.log(JSON.stringify(data, null,2));
		console.log('artist: ' + data.tracks.items[0].album.artists[0].name);
		console.log('preview: ' + data.tracks.items[0].album.artists[0].external_urls.spotify);
		console.log('album: ' + data.tracks.items[0].album.name);
		});
	
}//callspotify

function callMovieThis(movieName) {
	 console.log(movieName);	
	var req = require('request');
	var queryUrl = 'http://www.omdbapi.com/?t=' + movieName + '&apikey=40e9cece';
	console.log(queryUrl);
	req(queryUrl, function(err, response, body) {
		if (!err && response.statusCode === 200) {
			// console.log(JSON.parse(body));
			console.log('Title: ' + JSON.parse(body).Title);
			console.log('Year: ' + JSON.parse(body).Year);
			console.log('IMDB Rating: ' + JSON.parse(body).imdbRating);
			console.log('Rotton Tomatoes Rating: ' + JSON.parse(body)['Rotten Tomatoes']);
			console.log('Country: ' + JSON.parse(body).Country);
			console.log('Language: ' + JSON.parse(body).Language);
			console.log('Plot: ' + JSON.parse(body).Plot);
			console.log('Actors: ' + JSON.parse(body).Actors);
		}
	});	

}//callMovieThis

function callDoWhat() {
	var fs = require('fs');
	fs.readFile('random.txt', 'utf8', function(err, data) {
		// console.log(data);
		var lines = data.split('\n');
		linePart = lines[0].split(',');
		selectAction(linePart[0]);
		selectAction(linePart[0], linePart[1]);
	});
	
}//callDoWhat
