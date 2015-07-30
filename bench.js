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

var bench = function (arg_param) {


    if (!validator.isInt(arg_param.count)) throw new Error("count is not a number");
    if (!validator.isURL(arg_param.url))   throw new Error("wrong url");
    if (arg_param.method != "post" && arg_param.method != "get") throw new Error("wrong method");

    var pass = 0;

    arg_param.param = arg_param.param || {};
    function httpReq(callback) {
        var time = process.hrtime();
        var req = request[arg_param.method](arg_param.url);
        if (arg_param.needCookie) agent.attachCookies(req);
        req.send(arg_param.param)
            .end(function (err, res) {
                //if (err) return callback(null,err);
                if (res && arg_param.resultAssert && res.text && validator.isJSON(res.text)) {
                    var result = JSON.parse(res.text);
                    for (var i in arg_param.resultAssert) {
                        if (arg_param.resultAssert.hasOwnProperty(i) && result.hasOwnProperty(i) && result[i] === arg_param.resultAssert[i]) {
                            pass++;
                        }
                    }
                } else if (!arg_param.resultAssert) {
                    pass++;
                }
                var diff = process.hrtime(time);
                callback(null, diff[0] * 1e9 + diff[1]);
            });
    };

    var reqArray = [];
    for (var i = 0; i < arg_param.count; i++) {
        reqArray.push(httpReq);
    }

    var time = process.hrtime();

    async.series({
            saveCookie: function (callback) {
                if (!arg_param.needCookie) return callback(null);
                if (!arg_param.getCookieUrl) return callback(new Error("need cookie url"));
                request.post(arg_param.getCookieUrl)
                    .send(arg_param.getCookieParam)
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
            console.log('pass cent %d %', (pass / arg_param.count) * 100);
            console.log('benchmark took %d s', (diff[0] * 1e9 + diff[1]) / 1000000000);
            console.log('benchmark took %d s/op', (results.req.sum() / arg_param.count / 1000000000));
        });


};

module.exports = bench;

