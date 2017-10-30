// das zoals een functie aanmaken en oproepen.
// We doen het zo om conflicten te vermijden.
// Het is een zelfopstartende anonieme functie.
// Om functie op te roepen, tussen () zetten.
// Use strict dwingt af om bv variabelen zo te noteren x = 3
// Met use strict moet je var x = 3 noteren. Nogmaals voor fouten te voorlopen.

/*global  $, Skycons*/
(function () {
    'use strict';
	
	//jSon
	var App = {
		APIKEY: "bfb637186a99ada7d9701c39fcb7a3aa",
		lat: "",
		lng: "",
		
		init: function () {
			// kickstart the app
			App.getLocation();
		},
		getLocation: function () {
			// get the current user position	App.foundPos maakt nieuwe functie
			navigator.geolocation.getCurrentPosition(App.foundPosition);
		},
		foundPosition: function (pos) {
			// found the current user position
			App.lat = pos.coords.latitude;
			App.lng = pos.coords.longitude;
			App.getWeather();
			App.coordinatesToCity();
			App.currentDate();
			App.weatherMessage();
			App.weatherDataFromLocalStorage();
		},
		coordinatesToCity: function(){
			var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng="+ App.lat+","+ App.lng+"&key=AIzaSyDJfh1TMqPGRyJ90CZZYbWGe9wO8CCLsb4";
			
			window.jQuery.ajax({
				dataType: "json",
				url: url,
				success: function(data){
					var city = data.results[2].address_components[1].long_name;
					var country = data.results[2].address_components[4].long_name;
					
					$('.location').text(city + ", " + country);
				}
			});
		},
		currentDate: function(){
			var date = new Date;
			//date.setTime(result_from_Date_getTime);
			
			var seconds = date.getSeconds();
			var minutes = date.getMinutes();
			var hour = date.getHours();

			var year = date.getFullYear();
			var month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][(date.getMonth())]; // beware: January = 0; February = 1, etc.
			var day = date.getDate();

			var dayOfWeek = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][(new Date()).getDay()]; // Sunday = 0, Monday = 1, etc.
			var milliSeconds = date.getMilliseconds();
			
			var days_in_months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
			if (( new Date(year, 1, 29)).getDate()== 29) days_in_months[1] = 29;
			
			$('.locationDate').text(dayOfWeek + ", " + month + " " + day + ", " + hour+":"+minutes);
			
			
		},
		predictionHourly: function(hour){
			var url = "https://api.forecast.io/forecast/" + App.APIKEY + "/" + App.lat + "," + App.lng;
			
			window.jQuery.ajax({
                url: url,
                dataType: "jsonp",
                success: function (data) {
					var fahrenheit = data.hourly.data[hour].temperature;
					var temperature = Math.round((fahrenheit - 32) * 5 / 9);
					$('.temp'+hour).text(temperature+'°');
					
					
					
					var time = new Date(data.hourly.data[hour].time*1000);
					var timeHours = time.getHours();
					var timeMinutes = "0"+time.getMinutes();
					var timeFormat = timeHours+":"+timeMinutes.substr(-2);
					$('.hour'+hour).text(timeFormat);
					
					
					//var predictions = $(".predictions").html();
					//window.setInterval(function(){localStorage.setItem('savedPredictions', predictions);}, 3600);	
					
					
					
				}
			});
		},
		weatherMessage: function(){
			var url = "https://api.forecast.io/forecast/" + App.APIKEY + "/" + App.lat + "," + App.lng;
			
			window.jQuery.ajax({
				url: url,
				dataType: "jsonp",
				success: function(data){
					var icon = data.currently.icon;
					
					// WEATHER MESSAGE
					if(icon == "clear-day"){
						$('.message').text("It's clear today, it shouldn't rain. Don't forget about the pressure in your tires.");
						$('.weather').css("background-image", "url(images/background.jpg)");
					}else if ( icon == "clear-night" ){
						$('.message').text("It's a clear night. Don't forget a light, it's dark out!");
						$('.weather').css("background-image", "url(images/background.jpg)");
					}else if ( icon == "partly-cloudy-day" ){
						$('.message').text("It's partly cloudy today. The temperature isn't as high as you'd like. Bring something warm to drink.");
						$('.weather').css("background-image", "url(images/whatever.jpg)");
					}else if ( icon == "partly-cloudy-night" ){
						$('.message').text("It's clear out, bring something to eat.");
					}else if ( icon == "cloudy" ){
						$('.message').text("It's cloudy, it might rain, be prepared! Don't forget about the pressure in your tires.");
						$('.weather').css("background-image", "url(images/whatever.jpg)");
					}else if (icon == "rain" ){
						$('.message').text("It's raining, take a raincoat, take care of your tire pressure and bring something warm to drink and or eat.");
						$('.weather').css("background-image", "url(images/background-rain.jpg)");
					} else if (icon == "sleet" ) {
						$('.message').text("It's raining heavily. Take precautions if you're going mountainbiking today.");
						$('.weather').css("background-image", "url(images/background-rain.jpg)");
					} else if (icon == "snow"){
						$('.message').text("It's snowing! The paths might be very slippery! Put on some warm clothes, take enough food and enough stuff to drink.");
						$('.weather').css("background-image", "url(images/fog.jpg)");
					} else if (icon == "wind"){
						$('.message').text("It's very windy today. Don't dress too lightly.");
						$('.weather').css("background-image", "url(images/light-rainy.jpg)");
					} else if (icon == "fog"){
						$('.message').text("There's alot of fog out today. This will reduce your visibility. Be careful!");
						$('.weather').css("background-image", "url(images/fog.jpg)");
					}
				}
			});
		},
		weatherDataFromLocalStorage: function(){
			if('tempMax' in localStorage && 'tempMin' in localStorage && 'sunrise' in localStorage && 'sunset' in localStorage && 'savedPredictions' in localStorage){
				$('.temperatureMax').html(localStorage.getItem('tempMax'));
				$('.temperatureMin').html(localStorage.getItem('tempMin'));
				$('.sunrise').html(localStorage.getItem('sunrise'));
				$('.sunset').html(localStorage.getItem('sunset'));
				$(".predictions").html(localStorage.getItem('savedPredictions'));
			}else{
				App.weatherDataFromAPI();
			}
		},
		weatherDataFromAPI: function (){
			var url = "https://api.forecast.io/forecast/" + App.APIKEY + "/" + App.lat + "," + App.lng;
			
			window.jQuery.ajax({
				url: url,
				dataType: "jsonp",
				success: function (data){
					// TEMPERATURE
					var fahrenheitMin = data.daily.data[0].temperatureMin;
					var fahrenheitMax = data.daily.data[0].temperatureMax;
					var temperatureMin = Math.round((fahrenheitMin - 32) * 5 / 9);
					var temperatureMax = Math.round((fahrenheitMax - 32) * 5 / 9);
					$(".temperatureMin").text(temperatureMin+"°");
					$(".temperatureMax").text(temperatureMax+"°");
					
					// SUNSET, SUNRISE
					var sunrise = new Date(data.daily.data[0].sunriseTime*1000);
					var hoursSunrise = sunrise.getHours();
					var minutesSunrise = "0" + sunrise.getMinutes();
					var sunriseFormat = hoursSunrise + ":"+minutesSunrise.substr(-2);
					$('.sunrise').text(sunriseFormat);
					
					var sunset = new Date(data.daily.data[0].sunsetTime*1000);
					var hoursSunset = sunset.getHours();
					var minutesSunset = "0" + sunset.getMinutes();
					var sunsetFormat = hoursSunset + ":"+minutesSunset.substr(-2);
					$('.sunset').text(sunsetFormat);
					
					var savedSunrise = $('.sunrise').html();
					var savedSunset = $('.sunset').html();
					var tempMax = $('.temperatureMax').html();
					var tempMin = $('.temperatureMin').html();
						
					window.setInterval(function(){localStorage.setItem('tempMax', tempMax); }, 3600);
					window.setInterval(function (){localStorage.setItem('tempMin', tempMin); }, 3600);
					window.setInterval(function (){localStorage.setItem('sunrise', savedSunrise);}, 3600);
					window.setInterval(function(){localStorage.setItem('sunset', savedSunset);}, 3600);
					
					
				}
			});
		},
		getWeather: function () {
			
			// get current weather for my position.
			var url = "https://api.forecast.io/forecast/" + App.APIKEY + "/" + App.lat + "," + App.lng;
			
			// JSONP
			window.jQuery.ajax({
                url: url,
                dataType: "jsonp",
                success: function (data) {
                    $(".weather-summary").text(data.currently.summary);
					
					console.log(data);
					
					var icon = data.currently.icon;
					var skycons = new Skycons({"color": "white"});
					skycons.add("weather-icon", icon);
					skycons.play();
					
					// TEMPERATURE 
					var fahrenheit = data.currently.temperature;
					var temperature = Math.round((fahrenheit - 32) * 5 / 9);
					$(".temperature").text(temperature+"°");
					
					// WINDSPEED
					$('.windspeed').text(Math.round(data.currently.windSpeed)+"km/h");
					
					// iconen predictions
					var iconHourlyPred1 = data.hourly.data[1].icon;
					var iconHourlyPred2 = data.hourly.data[2].icon;
					var iconHourlyPred3 = data.hourly.data[3].icon;
					
					var skycons = new Skycons({"color":"white"});
					skycons.add("icon1", iconHourlyPred1);
					skycons.add("icon2", iconHourlyPred2);
					skycons.add("icon3", iconHourlyPred3);
					skycons.play();
					
					$('.prediction1').text(App.predictionHourly(1));
					$('.prediction2').text(App.predictionHourly(2));
					$('.prediction3').text(App.predictionHourly(3));
                }
            });
		}
	};
	
	App.init();
	
}());

