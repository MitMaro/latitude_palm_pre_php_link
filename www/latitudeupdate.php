<?php
/*------------------------------------------------------------------------------
    File: www/latitudeupdate.php
 Project: PHP Google Latitude Updater
 Version: 0.1.0
      By: Tim Oram <t.oram@mitmaro.ca>
 License: MIT License. See COPYING for full license
------------------------------------------------------------------------------*/

include '../php/config.php';
include '../php/classes/GoogleLatitude.class.php';

$gl = new GoogleLatitude($cookie_file);

// very simple authentication
if(!isset($_GET['passkey']) || !$_GET['passkey'] == $passkey){
	echo "Invalid passkey provided";
	return 1;
}

if(!isset($_GET['latitude'])){
	echo "Latitude Required";
	return 2;
}
else{
	$latitude = (double)$_GET['latitude'];
}


if(!isset($_GET['longitude'])){
	echo "Longitude Required";
	return 3;
}
else{
	$longitude = (double)$_GET['longitude'];
}

// accuracy is not a required parameter
if(isset($_GET['accuracy'])){
	$accuracy = (double)$_GET['accuracy'];
}
else{
	$accuracy = 0;
}

if(!$gl->login($username, $password)){
	echo "Login Failed";
	return 4;
}


$gl->updateLatitude($latitude, $longitude, $accuracy);
return 0;