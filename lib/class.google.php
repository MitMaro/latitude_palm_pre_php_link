<?php
/*------------------------------------------------------------------------------
    File: lib/class.google.php
 Project: PHP Google Latitude Updater
 Version: 0.1.0
      By: Tim Oram <t.oram@mitmaro.ca>
 Purpose: A class to login to Google Latitude Mobile, save a session cookie and
          update Latitude with a given location.        
  Forked: http://github.com/ablyler/playnice
  Credit: Nat Friedman <nat@nat.org>
          Jack Catchpoole <jack@catchpoole.com>
          Andy Blyler <ajb@blyler.cc>
 License: MIT License. See COPYING for full license
------------------------------------------------------------------------------*/

class GoogleLatitude {
	private $cookie_file; // Where we store the Google session cookie
	private $last_url;    // The previous URL as visited by curl

	public function __construct() {
		$this->cookie_file = dirname(__FILE__) . "/google-cookie.txt";
	}

	// Update the location on google latitude
	public function updateLatitude($lat, $lng, $accuracy) {
		/* build the post data */
		$post_data  = "t=ul&mwmct=iphone&mwmcv=5.8&mwmdt=iphone&mwmdv=30102&auto=true&nr=180000&";
		$post_data .= "cts=" . time() . "000&lat=$lat&lng=$lng&accuracy=$accuracy";

		/* set the needed header */
		$header = array("X-ManualHeader: true");

		/* execute the location update */
		$this->curlPost("http://maps.google.com/glm/mmap/mwmfr?hl=en", $post_data, $this->last_url, $header);
	}

	// Login to google and save the cookie in $cookie_file
	public function login($username, $password) {
		/* obtain needed cookies from the mobile latitude site */
		$html = $this->curlGet("http://maps.google.com/maps/m?mode=latitude");

		/* obtain login form and cookies */
		$html = $this->curlGet("https://www.google.com/accounts/ServiceLogin?service=friendview&hl=en&nui=1&continue=http://maps.google.com/maps/m%3Fmode%3Dlatitude", $this->last_url);

		/* parse out the hidden fields */
		preg_match_all('!hidden.*?name=["\'](.*?)["\'].*?value=["\'](.*?)["\']!ms', $html, $hidden);

		/* build post data */
		$post_data = '';
		for($i = 0; $i < count($hidden[1]); $i++) {
			$post_data .= $hidden[1][$i] . '=' . urlencode($hidden[2][$i]) . '&';
		}

		$post_data .= "signIn=Sign+in&PersistentCookie=yes";
		$post_data .= "&Email=$username";
		$post_data .= "&Passwd=$password";

		/* execute the login */
		$html = $this->curlPost("https://www.google.com/accounts/ServiceLoginAuth?service=friendview", $post_data, $this->last_url);

		/* verify the login was successful */
		if (strpos ($html, "Sign in") != false) {
			unlink($this->cookie_file);
			return false;
		}

		/* reset the permissions of the cookie file */
		chmod($this->cookie_file, 0600);
		return true;
	}

	public function haveCookie() {
		return file_exists($this->cookie_file);
	}

	private function curlGet($url, $referer = null, $headers = null) {
		$ch = curl_init($url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_cookie_file, $this->cookie_file);
		curl_setopt($ch, CURLOPT_COOKIEJAR, $this->cookie_file);
		curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
		curl_setopt($ch, CURLOPT_AUTOREFERER, true);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/5.0 (iPhone; U; CPU iPhone OS 3_1_2 like Mac OS X; en-us) AppleWebKit/528.18 (KHTML, like Gecko) Version/4.0 Mobile/7D11 Safari/528.16");
		if(!is_null($referer)) curl_setopt($ch, CURLOPT_REFERER, $referer);
		if(!is_null($headers)) curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

		curl_setopt($ch, CURLOPT_HEADER, true);
		// curl_setopt($ch, CURLOPT_VERBOSE, true);

		$html = curl_exec($ch);

		if (curl_errno($ch) != 0) {
			die("\nError during GET of '$url': " . curl_error($ch) . "\n");
		}

		$this->last_url = curl_getinfo($ch, CURLINFO_EFFECTIVE_URL);

		return $html;
	}

	private function curlPost($url, $post_vars = null, $referer = null, $headers = null) {
		$ch = curl_init($url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_cookie_file, $this->cookie_file);
		curl_setopt($ch, CURLOPT_COOKIEJAR, $this->cookie_file);
		curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
		curl_setopt($ch, CURLOPT_AUTOREFERER, true);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/5.0 (iPhone; U; CPU iPhone OS 3_1_2 like Mac OS X; en-us) AppleWebKit/528.18 (KHTML, like Gecko) Version/4.0 Mobile/7D11 Safari/528.16");
		if(!is_null($referer)) curl_setopt($ch, CURLOPT_REFERER, $referer);
		curl_setopt($ch, CURLOPT_POST, true);
		if(!is_null($post_vars)) curl_setopt($ch, CURLOPT_POSTFIELDS, $post_vars);
		if(!is_null($headers)) curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

		curl_setopt($ch, CURLOPT_HEADER, true);
		// curl_setopt($ch, CURLOPT_VERBOSE, true);

		$html = curl_exec($ch);

		if (curl_errno($ch) != 0) {
			die("\nError during POST of '$url': " . curl_error($ch) . "\n");
		}

		$this->last_url = curl_getinfo($ch, CURLINFO_EFFECTIVE_URL);

		return $html;
	}
}
