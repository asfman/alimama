
var express = require('express');
var router = express.Router();

router.get('/fetch/:id', function(req, res) {
	console.log("get http://www.jpjie.com/welcome/buy" + req.params.id);
	var EventProxy = require('eventproxy');
	/*var urls = [
		"http://www.jpjie.com/welcome/buy99",
		"http://www.jpjie.com/welcome/buy199",
		"http://www.jpjie.com/welcome/buy2099"
	];*/

	var stripPrice = function(str) {
		return str.replace(/￥|原价/g, "");
	}
	var request = require("superagent");

	request.get("http://www.jpjie.com/welcome/buy" + req.params.id).end(function(sres){
		var cheerio = require('cheerio');
		var $ = cheerio.load(sres.text);
		//res.set("Content-Type", "text/html;charset=utf8;");
		var ret = [];
		var products = $(".product");
		if(req.params.id == 2099) 
			products = $(".product1");
		products.each(function(idx, ele) {
			var product = {};
			if(req.params.id == 2099) {
				product.title = $(this).find(".product_title2 .px20").text();
				product.img = $(this).find(".product_pic img").attr("src");
				product.recommend_text = $(this).find(".recommend .blank").text().trim();
				product.cur_price = stripPrice($(this).find(".newprice2").text());
				product.origin_price = stripPrice($(this).find(".costprice").text());
				product.buy_num = $(this).find(".buynum .pinkft").text();
			}else {
				product.title = $(this).find(".product_title").text();
				product.img = $(this).find(".product_pic img").attr("src");
				product.recommend_text = $(this).find(".push").contents()
				  .filter(function() {
				    return this.nodeType === 3;
				  }).text();
				product.cur_price = stripPrice($(this).find(".nowprice").text());
				product.origin_price = stripPrice($(this).find(".pastprice").text());
				product.buy_num = $(this).find(".count").text();
			}
			product.type = req.params.id;
			ret.push(product);
		});
		var renderObj = {
			title: req.params.id,
			products: ret,
			message: "更新成功"
		};
		var nineModel = require("../mongo/nine").nineModel;
		console.log("insert: " + ret.length);
		ret.forEach(function(product, index) {
			product.date = new Date();
			nineModel.update(
				{title: product.title},
				{
					$set: product,
					$setOnInsert: {
						"created_time": Date.now(),
						"published": false
					}
				},
				{
					multi: true,
					upsert: true
				},
				function(err) {
					if(err) {
						console.error("更新[" + product.title + "]出错了: " + err.message);
						return;
					} 
				});
		});
		res.render("nine_fetch", renderObj);	

/*		nineModel.create(ret, function(err) {
			if(err) {
				console.error(err.message);
				renderObj.message = err.message;
			} 
			
			res.render("nine", renderObj);				
		});
*/		
	});
});

router.get("/list/:id", function(req, res) {
	console.log("list: " + req.params.id);
	var url = require("url");
	var params = url.parse(req.url, true).query;	
	var nineModel = require("../mongo/nine").nineModel;
	var options  = {
		type: req.params.id
	};
	console.log("params.published: " + params.published);
	if(params.published != undefined) {
		options.published = params.published;
	}
	nineModel.find(options)
	.sort("created_time")
    .exec(function(err, doc) {
        res.render("nine_update", {
        	title: req.params.id,
        	published: params.published,
            products: doc
        });
    });
});

router.post("/update_url/:id", function(req, res) {
	var id = req.params.id;
	var url = req.body.url;
	console.log(id, ": ", url);
	res.set("Content-Type", "application/json;charset=utf8");
	var nineModel = require("../mongo/nine").nineModel;
	nineModel.update({_id: id}, {
		$set: {url: url}
		}, function(err) {
			console.log(err);
			if(err) {
				console.log(err.message);
		        res.status(err.status).end(JSON.stringify({message: err.message}));
		        return;
		    }
			var ret = {message: "更新成功！"};
			res.status(200).end(JSON.stringify(ret));
		});

});

router.post("/update_published/:id", function(req, res) {
	var id = req.params.id;
	var published = req.body.published;
	console.log(id, ": ", published);
	res.set("Content-Type", "application/json;charset=utf8");
	var nineModel = require("../mongo/nine").nineModel;
	nineModel.update({_id: id}, {
		$set: {published: published}
		}, function(err) {
			console.log(err);
			if(err) {
				console.log(err.message);
		        res.status(err.status).end(JSON.stringify({message: err.message}));
		        return;
		    }
			var ret = {message: "更新成功！"};
			res.status(200).end(JSON.stringify(ret));
		});

});

router.get("/json/:id", function(req, res){
	console.log("list: " + req.params.id);
	var url = require("url");
	var params = url.parse(req.url, true).query;
	res.set("Content-Type", "application/json;charset=utf8");
	var callback = params.callback;
	var limit = params.limit;
	console.log("callback: " + callback);
	if(!callback) {
		res.end(JSON.stringify({message: "缺少callback参数"}));
		return;
	}
	var nineModel = require("../mongo/nine").nineModel;
	var q = nineModel.find({
		type: req.params.id,
		published: true
	});
	if(limit)
		q.limit(limit);
	q.sort("created_time")
    .exec(function(err, doc) {
    	console.log("ok");
        res.status(200).end(callback + "(" + JSON.stringify(doc) + ")");
    });
});

module.exports = router;
