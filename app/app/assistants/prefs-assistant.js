/*------------------------------------------------------------------------------
    File: assistants/prefs-assistant.js
 Project: Pre Google Latitude Updater
 Version: 0.1.0
      By: Tim Oram <t.oram@mitmaro.ca>
 License: MIT License. See COPYING for full license
------------------------------------------------------------------------------*/

function PrefsAssistant() {
}

PrefsAssistant.prototype.setup = function() {
	this.controller.setupWidget(
		"serverInput",
		this.serverAttributes = {
			limitResize: true,
			textReplacement: false,
			autoReplace: false,
			textCase: Mojo.Widget.steModeLowerCase
		},
		this.serverModel = {
			value : PreLatitude.server
		}
	);

	this.serverInputHandler = this.changeServer.bindAsEventListener(this);
	this.controller.listen("serverInput", Mojo.Event.propertyChange, this.serverInputHandler);
    

	this.controller.setupWidget(
		"usernameInput",
		this.usernameAttributes = {
			limitResize: true,
			textReplacement: false,
			autoReplace: false,
			textCase: Mojo.Widget.steModeLowerCase
		},
		this.usernameModel = {
			disabled: true,
			value: "Not Implemented" //PreLatitude.username
		}
	);

	this.usernameInputHandler = this.changeUsername.bindAsEventListener(this);
	this.controller.listen("usernameInput", Mojo.Event.propertyChange, this.usernameInputHandler);

	this.controller.setupWidget(
		"passwordInput",
		this.passwordAttributes = {
			limitResize: true,
			textReplacement: false,
			autoReplace: false,
			textCase: Mojo.Widget.steModeLowerCase
		},
		this.passwordModel = {
			disabled: true,
			value: "" //PreLatitude.password
		}
	);

	this.passwordInputHandler = this.changePassword.bindAsEventListener(this);
	this.controller.listen("passwordInput", Mojo.Event.propertyChange, this.passwordInputHandler);
   
	this.controller.setupWidget(
		"passkeyInput",
		this.passkeyAttributes = {
			limitResize: true,
			textReplacement: false,
			autoReplace: false,
			textCase: Mojo.Widget.steModeLowerCase
		},
		this.passkeyModel = {
			value: PreLatitude.passkey
		}
	);

	this.passkeyInputHandler = this.changePasskey.bindAsEventListener(this);
	this.controller.listen("passkeyInput", Mojo.Event.propertyChange, this.passkeyInputHandler);

	this.controller.setupWidget(
		"backgroundInput",
		this.backgroundAttributes = {
			limitResize: true,
			textReplacement: false,
			autoReplace: false,
			textCase: Mojo.Widget.steModeLowerCase
		},
		this.backgroundModel = {
			disabled: true,
			value: true //PreLatitude.backgroundUpdate
		}
	);

	this.backgroundInputHandler = this.changeBackground.bindAsEventListener(this);
	this.controller.listen("backgroundInput", Mojo.Event.propertyChange, this.backgroundInputHandler);
    
	this.controller.setupWidget(
		"refreshInput",
		this.refreshAttributes = {
			limitResize: true,
			textReplacement: false,
			autoReplace: false,
			textCase: Mojo.Widget.steModeLowerCase
		},
		this.refreshModel = {
			value: PreLatitude.refreshRate
		}
	);

	this.refreshInputHandler = this.changeRefresh.bindAsEventListener(this);
	this.controller.listen("refreshInput", Mojo.Event.propertyChange, this.refreshInputHandler);
}

PrefsAssistant.prototype.saveSettings = function() {
	var url = this.serverModel.value;
	if(url.length != 0 && !this.serverModel.value.toLowerCase().startsWith("http://")){
		url = "http://" + url;
	}
	PreLatitude.server = url;
	PreLatitude.Cookie.saveCookie();
	
}

PrefsAssistant.prototype.changeServer = function(event) {
	PreLatitude.server = this.serverModel.value;
}

PrefsAssistant.prototype.changePasskey = function(event) {
	PreLatitude.passkey = this.passkeyModel.value;
}

PrefsAssistant.prototype.changeUsername = function(event) {
	PreLatitude.username = this.usernameModel.value;
}

PrefsAssistant.prototype.changePassword = function(event) {
	PreLatitude.password = this.passwordModel.value;
}

PrefsAssistant.prototype.changeBackground = function(event) {
	PreLatitude.backgroundUpdater = this.backgroundModel.value;
}

PrefsAssistant.prototype.changeRefresh = function(event) {
	PreLatitude.refreshRate = this.refreshModel.value;
}

PrefsAssistant.prototype.cleanup = function(event) {
	this.controller.stopListening("serverInput", Mojo.Event.propertyChange, this.serverInputHandler);
	this.controller.stopListening("usernameInput", Mojo.Event.propertyChange, this.usernameInputHandler);
	this.controller.stopListening("passwordInput", Mojo.Event.propertyChange, this.passwordInputHandler);
	this.controller.stopListening("passkeyInput", Mojo.Event.propertyChange, this.passkeyInputHandler);
	this.controller.stopListening("backgroundInput", Mojo.Event.propertyChange, this.backgroundInputHandler);
    this.controller.stopListening("refreshInput", Mojo.Event.propertyChange, this.refreshInputHandler);
}

PrefsAssistant.prototype.activate = function(event) {}

PrefsAssistant.prototype.deactivate = function(event) {
	this.saveSettings();
}
