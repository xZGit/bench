# Bench

------

A library to support the benchmarking of requests, similar to webbench.


## Example usage


### 1. simple usage 


```node
var bench = require('./bench');
var option={
      count:100,   //request times
      method:"get",
      url:"https://www.baidu.com/"
  }
bench(option);
```
result:
```node
pass 100
pass cent 100 %
benchmark took 1.880738569 s
benchmark took 0.51501380586 s/op
```

### 2. what should i do if the request need cookies？ 



```node
var bench = require('./bench');
var option={
      count:100,   //request times
      method:"post",
      url:"https://www.a.com/",
      param:{},
      getCookieUrl:"https://www.a.com/login",
      getCookieParam:"{user:123,pass:123}",
      resultAssert:{dataA:1},    //check the json result
  }
bench(option);
```