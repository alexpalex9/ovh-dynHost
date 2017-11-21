# ovh-dynhost

this module is actually a simple wrapper of official OVH module in order to automatically set your dynamic hosting in OVH.
it just needs to be initiated with a configuration json variable and will provide back events to handle.


### version 2.0

- cleaner code using waterfall
- bug correction
- reduction of event (only one event for any error)

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
	"minutesRequestFrequency":5 //refreshFrequency is in minutes
	}
	

var ovh = require('./dynHostOvh.js')(config);

// event catch

ovh.on('ovh IP udpated',function(ip){
	console.log('public ip changed in ovh with success - newip = '+ ip)
})
ovh.on("error",function(message){
	// do something
});
ovh.on("no need to update IP",function(){
	// do something
});
