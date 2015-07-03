/**
 * Created by xx on 15/7/2.
 */



var async = require("async");
var request = require('superagent');
var validator = require('validator');
var agent = request.agent();


Array.prototype.sum = function () {
    for (var sum = i = 0; i < this.length; i++)sum += parseInt(this[i]);
    return sum
};

var bench = function (arg_count, arg_url, arg_method, arg_param, arg_resultAssert, arg_needCookie, arg_getCookieUrl, arg_getCookieParam) {

    if (!validator.isInt(arg_count)) throw new Error("count is not a number");
    if (!validator.isURL(arg_url))   throw new Error("wrong url");
    if (arg_method != "post" && arg_method != "get") throw new Error("wrong method");

    var pass = 0;

    arg_param = arg_param || {};
    function httpReq(callback) {
        var time = process.hrtime();
        var req = request[arg_method](arg_url);
        if (arg_needCookie) agent.attachCookies(req);
        req.send(arg_param)
            .end(function (err, res) {
                //if (err) return callback(null,err);
                if (res && arg_resultAssert && res.text && validator.isJSON(res.text)) {
                    var result = JSON.parse(res.text);
                    for (var i in arg_resultAssert) {
                        if (arg_resultAssert.hasOwnProperty(i) && result.hasOwnProperty(i) && result[i] === arg_resultAssert[i]) {
                            pass++;
                        }
                    }
                } else if (!arg_resultAssert) {
                    pass++;
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

    async.series({
            saveCookie: function (callback) {
                if (!arg_needCookie) return callback(null);
                if (!arg_getCookieUrl) return callback(new Error("need cookie url"));
                request.post(arg_getCookieUrl)
                    .send(arg_getCookieParam)
                    .end(function (err, res) {
                        if (err) {
                            callback(err);
                        }
                        agent.saveCookies(res);
                        callback();
                    });
            },
            req: function (callback) {
                async.parallel(reqArray, callback);
            }
        },
        function (err, results) {
            if (err) return console.log(err);
            var diff = process.hrtime(time);
            console.log('pass %d', pass);
            console.log('pass cent %d %', (pass / arg_count) * 100);
            console.log('benchmark took %d s', (diff[0] * 1e9 + diff[1]) / 1000000000);
            console.log('benchmark took %d s/op', (results.req.sum() / arg_count / 1000000000));
        });


};

module.exports = bench;

