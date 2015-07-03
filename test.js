/**
 * Created by xx on 15/7/3.
 */

var bench = require('./bench');

var url = "https://www.baidu.com/";
bench(1000, url, "get", null);