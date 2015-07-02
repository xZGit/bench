/**
 * Created by xx on 15/7/2.
 */



var async = require("async");
var request = require('superagent');
var validator = require('validator');
var url = "http://localhost:3000/api/getResult/55939995288153500d7b3bef";

Array.prototype.sum = function () {
    for (var sum = i = 0; i < this.length; i++)sum += parseInt(this[i]);
    return sum
};

var bench = function (arg_count, arg_url, arg_method, arg_param, arg_resultAssert, arg_getCookieUrl) {

    if (!validator.isInt(arg_count)) throw new Error("count is not a number");
    if (!validator.isURL(arg_url))   throw new Error("wrong url");
    if (arg_method != "post" && arg_method != "get") throw new Error("wrong method");

    var pass = 0;

    function httpReq(callback) {
        var time = process.hrtime();
        var req = request[arg_method](arg_url);
        req.send(arg_param)
            .end(function (err, res) {
                if (res && res.text && validator.isJSON(res.text)) {
                    var result = JSON.parse(res.text);
                    for (var i in arg_resultAssert) {
                        if (arg_resultAssert.hasOwnProperty(i) && result.hasOwnProperty(i) && result[i] === arg_resultAssert[i]) {
                            pass++;
                        }
                    }
                }
                var diff = process.hrtime(time);
                callback(null, diff[0] * 1e9 + diff[1]);
            });
    };

    var reqArray = [];
    for (var i = 0; i < arg_count; i++) {
        reqArray.push(httpReq);
    }

    var time = process.hrtime();
    async.parallel(reqArray, function (err, results) {
        //console.log(err);
        var diff = process.hrtime(time);
        console.log('pass %d', pass);
        console.log('pass cent %d %', (pass/arg_count)*100);
        console.log('benchmark took %d s', (diff[0] * 1e9 + diff[1]) / 1000000000);
        console.log('benchmark took %d s/op', (results.sum() / arg_count / 1000000000));

    });


};


bench(500, url, "get", null, {code: 0});