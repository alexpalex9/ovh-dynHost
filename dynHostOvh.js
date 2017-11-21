module.exports = function(config){
	const waterfall = require('async-waterfall')
		, events = require('events')
		, schedule = require('node-schedule')
		, request = require("request")
		, eventEmitter = new events.EventEmitter();
	var ovh = require('ovh')(config);
	
	function getPublicIP(cb){
		console.log("get public ip")
		// exec(" curl ipinfo.io/ip", function(err, stdout, stderr) {
		request("https://ipinfo.io/ip", function (error, response, body) {

			// /** for test
			// error=undefined;
			// response={};
			// response.statusCode=200
			// body="198.15.2.15"
			// */
			if (!error && response.statusCode == 200) {
				body = body.replace("\n","").replace(" ","");
				if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(body)){
					return cb(error,config.zone,body);
				}else{
					return cb("public ip retrieve is not an ip address format");
				}
			}else{
				return cb("error when trying to get public ip : " + error);
			}
		});
	};
	function getOvhID(zone,publicIP,cb){
		// console.log("getOvhID",zone,publicIP)
		ovh.request('GET','/domain/zone/'+ zone +'/dynHost/record',function(err,result){
			
			// err=null
			// result="45";
			
			if (err){
				console.log();
				//return cb(err);
				return cb("error when getting ovh zone id : " + result);
			}else{
				result=JSON.parse(result);
				console.log(result);
				return cb(err,zone,publicIP,result);
			}
		});
	};
	function getOvhIP(zone,publicIP,id,cb){
		console.log("getOvhIP",zone,publicIP,id)
		ovh.request('GET','/domain/zone/'+ zone +'/dynHost/record/'+id,function(err,result){
			
			// err=null;
			// result={"ip":"198.15.2.14"};
			
			if (err){
				cb("error when getting ovh zone ip : " + result);
			}else{
				console.log("ovh ip =", result)
				ovhIP=result.ip;
				if (publicIP!=ovhIP){
					cb(err,zone,publicIP,id,ovhIP);
				}else{
					finalCallback(err,"no need to update IP")
				}
				
			}
		});
	};
	function putOvhIP(zone,publicIP,id,ovhIP,cb){
		console.log("putOvhIP",zone,publicIP,id,ovhIP)
		ovh.request('PUT','/domain/zone/'+ zone +'/dynHost/record/'+id,{ ip: publicIP},function(err,result){
			
			// err=null;
			
			if (err){
				cb("error when getting ovh zone id : " +  result);
			}else{
				cb(err,zone,publicIP);
			}
		});
	};
	function refreshOVH(zone,ip,cb){
		console.log("refreshOVH",zone,ip)
		ovh.request('POST', '/domain/zone/'+ zone +'/refresh',function(err,result){
			
			// err=null;
			
			if (err){
				cb("error when refreshing ovh ip : " +  result);
			}else{
				cb(err,"ovh IP udpated",ip);
			}
		});
	};
	function finalCallback(err,result,ip){
		if (err){
			// console.log("emitting","error",err)
			eventEmitter.emit("error",err)
		}else{
			// console.log("emitting",result)
			eventEmitter.emit(result,ip)
		};
	};
	
	job = function (){
		// console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!! JOB OVH !!!!!!!!!!!!!!!!!")
		waterfall([
			getPublicIP,
			getOvhID,
			getOvhIP,
			putOvhIP,
			refreshOVH
		], finalCallback);
	};
	eventEmitter.init = function(){
		job();
		requestJob =  schedule.scheduleJob("0 */"+config.minutesRequestFrequency.toString()+" * * * *",function(){
			job();
		});
	};
	return eventEmitter;
};