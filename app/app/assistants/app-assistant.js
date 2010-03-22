/*------------------------------------------------------------------------------
    File: assistants/app-assistant.js
 Project: Pre Google Latitude Updater
 Version: 0.1.0
      By: Tim Oram <t.oram@mitmaro.ca>
 License: MIT License. See COPYING for full license
------------------------------------------------------------------------------*/

//  News namespace
PreLatitude = {};

// Constants
PreLatitude.versionString = "0.1.0";
PreLatitude.MainStageName = "mainStage";

// Saved Settings
PreLatitude.server = "";
PreLatitude.refreshRate = "300";
PreLatitude.passkey = "";
PreLatitude.username = "";
PreLatitude.password = "";
PreLatitude.autoupdate = false;
PreLatitude.backgroundUpdate = false;

PreLatitude.MenuAttributes = {
	omitDefaultItems: true
};

PreLatitude.MenuModel = {
	visible: true,
	items: [
		{label: $L("About"), command: "do-aboutPreLatitude"},
		Mojo.Menu.editItem,
		{label: $L("Preferences"), command: "do-preLatitudeSettings"},
		{label: $L("Update Now"), command: "do-preLatitudeUpdate"}
	]
};

function AppAssistant (appController) {}

AppAssistant.prototype.setup = function() {
	
	this.location = new Location();

    // load settings from cookie
	PreLatitude.Cookie.initialize();
		
    // Set up first timeout alarm
    this.setWakeup();

};

AppAssistant.prototype.handleLaunch = function (action) {
	console.log("handleCommand run");

	var stageController = this.controller.getStageController(PreLatitude.MainStageName);
	var appController = Mojo.Controller.getAppController();

	// regular launch
	if (!action)  {
		if (stageController) {
			stageController.popScenesTo("main");
			stageController.activate();
		}
		else {
			var pushMainScene = function(stageController) {
				stageController.pushScene("main", this.location);
			};
			var stageArguments = {name: PreLatitude.MainStageName, lightweight: true};
			this.controller.createStageWithCallback(stageArguments, pushMainScene.bind(this), "card");
		}
	}
	// background update
	else  {
		if(action == "update") {
			this.location.updateLocation();
		}
	}
};

AppAssistant.prototype.handleCommand = function(event) {
	console.log("handleCommand");
	var stageController = this.controller.getActiveStageController();
	var currentScene = stageController.activeScene();
	
	if(event.type == Mojo.Event.command) {
		switch(event.command) {
		
		case "do-aboutPreLatitude":
			// alert for about
			currentScene.showAlertDialog({
				onChoose: function(value) {},
				title: $L("Pre Latitude #{version}").interpolate({version: PreLatitude.versionString}),
				message: $L("Copyright 2010; MitMaro Productions.\n Under the MIT License"),
				choices: [{label:$L("Close"), value:""}]
			});
		break;
		
		case "do-preLatitudeSettings":
			stageController.pushScene("prefs");
		break;
		
		case "do-preLatitudeUpdate":
			if(this.validSettings()) {
				this.location.updateLocation();
			}
		break;
		}
	}
};

AppAssistant.prototype.validSettings = function(){
	return PreLatitude.server != null && PreLatitude.server != '' &&
	//PreLatitude.username != null && PreLatitude.username != '' &&
	//PreLatitude.password != null && PreLatitude.password != '' &&
	PreLatitude.passkey != null && PreLatitude.passkey != '';
};

AppAssistant.prototype.setWakeup = function() {
	console.log('setWakeup');
	if (PreLatitude.backgroundUpdate) {
		this.wakeupRequest = new Mojo.Service.Request("palm://com.palm.power/timeout", {
			method: "set",
			parameters: {
				"key": "ca.mitmaro.prelatitude.update",
				"in": "00:05:00",
				"wakeup": PreLatitude.backgroundUpdate,
				"uri": "palm://com.palm.applicationManager/open",
				"params": {
					"id": "ca.mitmaro.prelatitude",
					"params": "update"
				}
			},
			onSuccess: function(){
			},
			onFailure: function(e){
				console.log(Object.toJSON(e));
			}
		});
	}
};
