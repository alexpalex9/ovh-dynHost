module.exports = function(config){
const  events = require('events')
	, schedule = require('node-schedule')
	, request = require("request")

// tutorial : http://ovh.github.io/node-ovh/
//create OVH token : https://eu.api.ovh.com/createToken/  We want PUT & GET & POST for /domain*

	var eventEmitter = new events.EventEmitter();
	var ovh = require('ovh')(config);
	function getPublicIP(cb){
		// exec(" curl ipinfo.io/ip", function(err, stdout, stderr) {
		request("https://ipinfo.io/ip", function (error, response, body) {
			// console.log(body)
			if (!error && response.statusCode == 200) {
				// console.log("rough return",body)
				 // var patt = new RegExp("^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$");
				 // console.log("rough return",body,patt.test(body))
				// if (patt.test(body)){
					return cb(body);
				// }else{
					// return cb(false);
				// }
			}else{
				return cb(false);
			}
		});
	};
	function getOvhID(zone,cb){
		ovh.request('GET','/domain/zone/'+ zone +'/dynHost/record',function(err,d){
				if (err){
					return cb(false);
				}else{
					return cb(JSON.parse(d));
				}
			});
	};
	function getOvhIP(zone,id,cb){
		ovh.request('GET','/domain/zone/'+ zone +'/dynHost/record/'+id,function(err,d){
			if (err){
				cb(false);
			}else{
				cb(d);
			}
		});
	};
	function putOvhIP(zone,id,newIP,cb){
		ovh.request('PUT','/domain/zone/'+ zone +'/dynHost/record/'+id,{ ip: newIP},function(err,d){
			if (err){
				cb(false);
			}else{
				cb(true);
			}
		});
	};
	function refreshOVH(zone,cb){
		ovh.request('POST', '/domain/zone/'+ zone +'/refresh',function(err,d){
			if (err){
				cb(false);
			}else{
				cb(true);
			}
		});
	};
	
	
	function job(){
		getPublicIP(function(currentPublicIp){
			if (currentPublicIp!=false){
				getOvhID(config.zone,function(id){
					if (id!=false){
						getOvhIP(config.zone,id,function(ovhIP){
							if (ovh!=false){
								if (ovhIP.ip != currentPublicIp){
									// console.log("different ip :" ,ovhIP,currentPublicIp)
									putOvhIP(config.zone,id,currentPublicIp,function(r){
										if (r==false){
											// console.log("fail to set new public ip in OVH");
											eventEmitter.emit("fail to update OVH ip");
										}else{
											refreshOVH(config.zone,function(r){
												if (r!=false){
													// console.log("success")
													eventEmitter.emit("public ip updated",currentPublicIp);
												}else{
													// console.log("fail to refresh OVH zone")
													eventEmitter.emit("fail to refresh OVH zone");
												}
											});
										};
									});
									
								}else{
									// console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<same IP",ovhIP);
									eventEmitter.emit("no need to update IP",ovhIP.ip);
								}
							}else{
								eventEmitter.emit("fail to get OVH IP");
							}
						});
					}else{
						eventEmitter.emit("fail to get OVH ID");
					}
				});
			}else{
				console.log("fail to get current public IP")
			}
		});
	}
	job();
	requestJob =  schedule.scheduleJob("0 */"+config.refreshFrequency.toString()+" * * * *",function(){
		job();
	});
	return eventEmitter;
};