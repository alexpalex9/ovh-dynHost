# ovh-dynhost

this module is actually a simple wrapper of official OVH module in order to automatically set your dynamic hosting in OVH.
it just needs to be initiated with a configuration json variable and will provide back events to handle.

### Prerequisites
- have a domain name with OVH
- set a inital record of dynHost in ovh manager []
- obtain a token for the ovh API : https://eu.api.ovh.com/createToken/

### Utilization :
```
var config={
	"endpoint":"ovh-eu",
	"appKey":"XXXXXXXXXX",
	"appSecret":"YYYYYYYYYYYYYYYY",
	"consumerKey":"ZZZZZZZZZZZZZZZZz",
	"zone":"mydomainname.fr",
	"refreshFrequency":5 //refreshFrequency is in minutes
	}
	

var ovh = require('./dynHostOvh.js')(config);

// event catch

ovh.on('success',function(){
	console.log('public ip changed in ovh with success')
})
myovh.on("fail to get current public IP",function(){
	// do something
});
myovh.on("fail to get OVH ID",function(){
	// do something
});
myovh.on("fail to get ovh IP",function(){
	// do something
});
myovh.on("fail to update ovh ip",function(){
	// do something
});
myovh.on("fail to refresh OVH zone",function(){
	// do something
});
myovh.on("public ip updated",function(ip){
	// do something
});
myovh.on("no need to update IP",function(ip){
	// console.log("INFO","cloud","ip identique : " + ip);
});
```