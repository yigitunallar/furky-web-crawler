var cheerio = require('cheerio');
var URL = require('url-parse');
var request = require('request');

var initialVisit = 'http://en.wikipedia.org/wiki/information';
var pagesToVisit = [];
var pagesVisited = {};
var MAX_VISIT  = 20;
var numberPagesVisited = 0;

pagesToVisit.push(initialVisit);
crawler();

function crawler(){
	if(numberPagesVisited >= MAX_VISIT){
		console.log("1000 pages already visited!!");
		var sortable = [];
		for (el in pagesVisited) {
    		sortable.push([el, pagesVisited[el]]);
		}
		sortable.sort(function(a, b) {
    		return a[1] - b[1];
		}).reverse();
		for(el in sortable){
			console.log(sortable[el][0] +" referenced "+sortable[el][1]+ " time/s!");
		}
		return;
	}
	var nextPage = pagesToVisit.pop();
	if(nextPage in pagesVisited){
		pagesVisited[nextPage]++;
		crawler();
	} else { // visit the new page
		visit(nextPage, crawler);
	}
}

function visit(nextPage, callback){
	pagesVisited[nextPage] = 1;
	numberPagesVisited ++; 
	console.log("Visiting the page " + nextPage);
	request(nextPage, function(err, res, body){
		if(res.statusCode !== 200){
			callback();
			return;
		}
		var $ = cheerio.load(body);
		collectLinks($);
		callback();
	});
}

function collectLinks($){
	var links = $("a[href^='http']");
	links.each(function(){
		pagesToVisit.push($(this).attr('href'));
	});
	console.log("There are " + pagesToVisit.length + " pages to visit!");
}