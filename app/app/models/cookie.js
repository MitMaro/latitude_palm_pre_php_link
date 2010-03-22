/*------------------------------------------------------------------------------
    File: models/cookie.js
 Project: Pre Google Latitude Updater
 Version: 0.1.0
      By: Tim Oram <t.oram@mitmaro.ca>
 License: MIT License. See COPYING for full license
------------------------------------------------------------------------------*/
PreLatitude.Cookie = ({
    initialize: function() {
		this.cookie = new Mojo.Model.Cookie("caMitMaroPreLatitudePrefs");
		var data = this.cookie.get();
		if(data) {
			PreLatitude.server = data.server;
			PreLatitude.username = data.username;
			PreLatitude.password = data.password;
			PreLatitude.refreshRate = data.refreshRate;
			PreLatitude.passkey = data.passkey;
			PreLatitude.autoupdate = data.autoupdate;
		}
	},

	saveCookie: function() {
		this.cookie.put({
			server: PreLatitude.server,
			username: PreLatitude.username,
			password: PreLatitude.password,
			refreshRate: PreLatitude.refreshRate,
			passkey: PreLatitude.passkey,
			autoupdate: PreLatitude.autoupdate
		});
	}
});