/*------------------------------------------------------------------------------
    File: models/location.js
 Project: Pre Google Latitude Updater
 Version: 0.1.0
      By: Tim Oram <t.oram@mitmaro.ca>
 License: MIT License. See COPYING for full license
------------------------------------------------------------------------------*/

var Location = Class.create({
	lastData: {
		"longitude": -1,
		"latitude": -1,
		"heading": -1,
		"velocity": -1,
		"accuracy": -1
	},
	updateLocation: function(){
		console.log("updating");
		Mojo.Controller.getAppController().sendToNotificationChain({type: 'status', message: "Updating"});
		this.LocationServices = new Mojo.Service.Request('palm://com.palm.location', {
			method:"getCurrentPosition",
			parameters:{
				accuracy:1, //high
				responseTime: 1
			},
			onSuccess: this.handleUpdate.bind(this),
			onFailure: function(){
				console.log("GPS Error");
			}
		});
	},
	
	handleUpdate: function(event){
		console.log("success");
		switch(event.errorCode) {
		case 0:
			
			// calculate the accuracy by taking an average
			var accuracy = (event.horizAccuracy + event.vertAccuracy)/2;
			
			// if the location has not changed we can stop here
			if(!this.locationChanged(event.longitude, event.latitude, event.heading, event.velocity, accuracy)) {
				Mojo.Controller.getAppController().sendToNotificationChain({type: 'status', message: "No Change"});
				Mojo.Controller.getAppController().sendToNotificationChain({type: 'LocationNotChanged'});
			}
			// location has changed so update
			else {
				// make request to server here
				var url = PreLatitude.server + '?latitude=' + event.latitude +
				'&longitude=' + event.longitude +
				'&velocity=' + event.velocity +
				'&heading=' + event.heading +
				'&accuracy=' + accuracy +
				'&passkey=' + PreLatitude.passkey;

				console.log(url)
				
				var request = new Ajax.Request(url, {
					method: 'get',
					evalJSON: 'force',
					onComplete: function(transport){
						var json = transport.responseJSON;
						if(json.status && json.status == "ok") {
							Mojo.Controller.getAppController().sendToNotificationChain({type: 'status', message: "Updated"});
						}
						else if(json.error) {
							Mojo.Controller.getAppController().sendToNotificationChain({type: 'status', message: json.error});
						}
					}.bind(this),
					onFailure: function(){
						Mojo.Controller.getAppController().sendToNotificationChain({type: 'status', message: "Server Error"});
					}
				});
				Mojo.Controller.getAppController().sendToNotificationChain({
					type: 'LocationUpdated',
					longitude: event.longitude,
					latitude: event.latitude,
					heading: event.heading,
					velocity: event.velocity,
					// average of accuracies
					accuracy: accuracy
				});
			}
			break;
		case 1:
			Mojo.Controller.getAppController().sendToNotificationChain({type: 'status', message: "Timeout"});
			break;
		case 2:
			Mojo.Controller.getAppController().sendToNotificationChain({type: 'status', message: "Unknown Position"});
			break;
		case 5:
			Mojo.Controller.getAppController().sendToNotificationChain({type: 'status', message: "GPS Off"});
			break;
		case 6:
			Mojo.Controller.getAppController().sendToNotificationChain({type: 'status', message: "Denied"});
			break;
		case 7:
			Mojo.Controller.getAppController().sendToNotificationChain({type: 'status', message: "Busy"});
			break;
		case 8:
			Mojo.Controller.getAppController().sendToNotificationChain({type: 'status', message: "Blacklisted"});
			break;
		default:
			Mojo.Controller.getAppController().sendToNotificationChain({type: 'status', message: "Error"});
		}
		Mojo.Controller.getAppController().sendToNotificationChain({type: 'status', message: "Updated"});
	},
	
	locationChanged: function(longitude, latitude, heading, velocity, accuracy){
		return !(this.lastData.longitude == longitude && this.lastData.latitude == latitude
		   && this.lastData.heading == heading && this.lastData.velocity == velocity
		   && this.lastData.accuracy == accuracy);
	}

});
