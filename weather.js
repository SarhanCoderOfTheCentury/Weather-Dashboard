//01.Setting up constants of dom elements
const searchInput = document.querySelector('.search-input');
const searchBtn = document.querySelector('.search-btn');
const searchInputForm = document.querySelector('.search-input-form');
const city = document.querySelector('.city-name')
const generalWeatherInfo = document.querySelector('.general-weather-info');
const currentDate = document.querySelector('.current-date');
const temperatureText = document.querySelector('.temperature-text');
const weatherIcon = document.querySelector('.weather-icon-img');
const weatherStatusText = document.querySelector('.weather-status-text');
const humidityText = document.querySelector('.humidity-text');
const windSpeedText = document.querySelector('.wind-speed-text');
const forecastBtn = document.querySelectorAll('.forecast-btn');

const date = new Date().toISOString().split('T')[0].toString();
currentDate.textContent = date;

//02.On city form submit the following function runs
const handlingFormSubmit = e => {
	e.preventDefault();
	const cityName = searchInput.value.trim();
	console.log(cityName);

	city.textContent = cityName;
	generateResponse(cityName);
}

//03.Is called from the generateResponse() function to get coordinates of city
async function getCoordinates(cityName) {
	const city = cityName
	if (!city) {
		console.log("Please enter a city.");
		return;
	}

	try {
		const response = await fetch(
			`https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(city)}&format=json&limit=1`
		);
		const data = await response.json();

		if (data.length > 0) {
			const lat = data[0].lat;
			const lon = data[0].lon;

			console.log("Latitude: " + lat + "Longitude" + lon);

			return { lat, lon };
		} else {
			console.log("Ooops city not found!")
		}
	} catch (error) {

		console.error(error);
	}
}

//04.Function to get weather data for a specific city
async function generateResponse(city) {
	try {
		const coords = await getCoordinates(city); //=>stores the returned {lat, lon} object from getCoordinates function

		if (!coords) {
			console.error("Could not fetch coordinates");
			return;
		}

		//i.Destructuring the coords object to get latitude and longitude
		const latitude = coords.lat;
		const longitude = coords.lon;


		const url = `https://open-weather13.p.rapidapi.com/fivedaysforcast?latitude=${latitude}&longitude=${longitude}&lang=EN`; //=>put your own api key here from RapidAPI(open weather)
		const options = {
			method: 'GET',
			headers: {
				'x-rapidapi-key': 'ad34514d96msh15e0ebcbde894afp10cc66jsn8ff50ec15fa7',
				'x-rapidapi-host': 'open-weather13.p.rapidapi.com'
			},
		};

		const response = await fetch(url, options);
		//ii.Storing the response body in json format
		const data = await response.json();


		//iii.All the necessary fields taken out from the response json
		const temperature = (data.list[0].main.temp - 273.15).toFixed(2); // Convert from Kelvin to Celsius
		const humidity = data.list[0].main.humidity;
		const windSpeed = data.list[0].wind.speed;
		const weatherCondition = data.list[0].weather[0].description;
		const iconCode = data.list[0].weather[0].icon;
		const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;
		const forecastList = data.list; //=>Taking out list array which contains weather details for different dates
		const dailyForecast = forecastList.filter(item => item.dt_txt.includes('12:00:00'));//=>Taking out weather at 12 o clock for each date
		const fourDaysForecast = dailyForecast.slice(0, 4);


		console.log("Temperature:", temperature);
		console.log("Humidity:", humidity);
		console.log("Wind Speed:", windSpeed);
		console.log("Condition:", weatherCondition);

		//iv.Dynamically changing the dummy data of dom elements with API response data
		temperatureText.textContent = `${temperature} °C`;
		humidityText.textContent = `${humidity}%`;
		windSpeedText.textContent = `${windSpeed} m/s`;
		weatherIcon.src = iconUrl;
		weatherStatusText.textContent = weatherCondition;

		//v.For all the four days, updating forecast data
		fourDaysForecast.forEach((day, index) => {
			const forecastDate = new Date(day.dt_txt).toISOString().split('T')[0].toString();;
			const temperatureForecast = (day.main.temp - 273.15).toFixed(2);
			const forecastIconCode = day.weather[0].icon;
			console.log(forecastIconCode);
			const forecastIconUrl = 'https://openweathermap.org/img/wn/' + forecastIconCode + '.png';

			const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
				"Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

			//formatting date
			const dateObj = new Date(forecastDate); //converting forecastDate into an object
			const date = dateObj.getDate();  // getting date of the date object
			const month = monthNames[dateObj.getMonth()]; // getting month index, and using that to get month name

			forecastBtn[index].querySelector('.forecast-date').textContent = `${date} ${month}`;
			forecastBtn[index].querySelector('.forecast-temperature').textContent = temperatureForecast + '°C';
			forecastBtn[index].querySelector('.forecast-icon').src = forecastIconUrl;
		});

	}
	catch (error) {
		console.error(error);
	}
	// finally{
	// 	searchBtn.disabled= false;
	// }
}

searchInputForm.addEventListener("submit", handlingFormSubmit);

