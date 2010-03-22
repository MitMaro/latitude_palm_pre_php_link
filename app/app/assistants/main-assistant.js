/*------------------------------------------------------------------------------
    File: assistants/main-assistant.js
 Project: Pre Google Latitude Updater
 Version: 0.1.0
      By: Tim Oram <t.oram@mitmaro.ca>
 License: MIT License. See COPYING for full license
------------------------------------------------------------------------------*/

function MainAssistant(location) {
	this.location = location;
	this.appController = Mojo.Controller.getAppController();
    this.stageController = this.appController.getStageController(PreLatitude.MainStageName);
}

MainAssistant.prototype.setup = function() {

    // Setup App Menu
    this.controller.setupWidget(Mojo.Menu.appMenu, PreLatitude.MenuAttributes, PreLatitude.MenuModel);
    
	this.controller.setupWidget(
		'toggleOn',
		this.toggleAttributes = {
		},
		this.toggleModel = {
			value: false
		}
	);
    this.toggleOnHandler = this.handleToggle.bindAsEventListener(this);
	this.controller.listen("toggleOn", Mojo.Event.propertyChange, this.toggleOnHandler);
}


MainAssistant.prototype.handleToggle = function(event) {
	
	if(!this.appController.assistant.validSettings()) {
		this.controller.showAlertDialog({
			title: 'Settings Error',
			message: 'Please check your settings under:\n Menu > Preferences',
			choices: [{label: 'OK', value: ''}]
		});
		this.toggleModel.value = false;
		this.controlller.modelChanged(this.toggleModel, this);
		return;
	}
	
	this.setStatus("Stopped");

	Mojo.Controller.appController.getActiveStageController().activeScene().window.clearInterval(this.timerId);
	PreLatitude.autoupdate = this.toggleModel.value;
	if(this.toggleModel.value) {
		this.appController.assistant.location.updateLocation();
		// start updating
		this.timerId = Mojo.Controller.appController.getActiveStageController().activeScene().window.setInterval(
				this.appController.assistant.location.updateLocation.bind(this.appController.assistant.location),
				PreLatitude.refreshRate * 1000);
	}
}

MainAssistant.prototype.setStatus = function(msg) {
	this.controller.get('status').update(msg);
}

MainAssistant.prototype.updateLocation = function(longitude, latitude, heading, velocity, accuracy){
	// location info
	this.controller.get('longitude').update(longitude.toString().substr(0, 18));
	this.controller.get('latitude').update(latitude.toString().substr(0, 18));
	this.controller.get('heading').update(heading + "&deg;");
	this.controller.get('velocity').update(velocity + " m/s");
	this.controller.get('accuracy').update("&plusmn;" + accuracy + "m");
}

MainAssistant.prototype.considerForNotification = function(params){
	console.log("considerForNotificaition");
	if(params.type) {
		switch(params.type) {
			case "status":
				// if not tracking status will remain stopped
				if(this.toggleModel.value) {
					this.setStatus(params.message);
				}
				break;
			case "LocationUpdated":
				this.updateLocation(params.longitude, params.latitude, params.heading, params.velocity, params.accuracy);
				break;
		}
	}
}

MainAssistant.prototype.activate = function(event) {}

MainAssistant.prototype.deactivate = function(event) {}

MainAssistant.prototype.cleanup = function(event) {
	this.controller.stopListening("toggleOn", Mojo.Event.propertyChange,  this.toggleOnHandler);
}