
//current weather
var displayCurrentWeather = function(name, date, temp, humidity, wind_speed, uvi){
    var dataArr = [temp, humidity, wind_speed, uvi]
    var nameArr = ["Temp: ", "Wind: ", "Humidity: ", "UV Index: "]
    var unitArr = ["\u00B0F", " MPH", " %"]

    var dateObj = new Date(date * 1000).toLocaleString();
    var convertDate = dateObj.slice(0,8);

    var currentWeather = $("<div>").attr("id", "current").addClass("row current d-flex flex-column justify-content-around");
    var h2El = $("<h2>").attr("id", "city-name").addClass("pl-3 pt-2").text(name.toUpperCase() + " (" + convertDate + ")");
    currentWeather.append(h2El) 
 
    for(var i = 0; i < 4; i++){
        if (i < 3){
            var pEl = $("<p>").attr("id", dataArr[i]).text(nameArr[i] + dataArr[i] + unitArr[i]);
            currentWeather.append(pEl);
        } else { 
            var spanEl = $("<span>").addClass("text-light pl-3 pr-3 text-center").text(dataArr[i]);
            pEl = $("<p>").attr("id", dataArr[i]).text(nameArr[i]);

            //UV colors
            if (dataArr[i] <= 2){
                spanEl.addClass("bg-success");
                pEl.append(spanEl);
                currentWeather.append(pEl);
            } else if ( dataArr[i] > 2 && dataArr[i] <= 5){
                spanEl.addClass("bg-warning");
                pEl.append(spanEl);
                currentWeather.append(pEl);
            } else if (dataArr[i] > 5 && dataArr[i] <= 10){
                spanEl.addClass("bg-danger");
                pEl.append(spanEl);
                currentWeather.append(pEl);
            } else {
                spanEl.addClass("bg-secondary");
                pEl.append(spanEl);
                currentWeather.append(pEl);
            }
        }
    }

    $("#display-data").append(currentWeather);

    create5DaySection();
};

// 5 day forecast
var create5DaySection = function(){
    var divEl = $("<div>").addClass("row-md d-flex flex-column justify-content-around forecast")
    var h2El = $("<h3>").text("5-Day Forecast:").addClass("pt-3 pb-2");
    var cardDiv = $("<div>").addClass("d-flex flex-row justify-content-between").attr("id", "5DayCard");

    divEl.append(h2El);
    divEl.append(cardDiv);

    $("#display-data").append(divEl)
}

var display5Day = function (date, temp, humidity, wind_speed, icon, description){
    var dateObj = new Date(date * 1000).toLocaleString();
    var convertDate = dateObj.slice(0,8);
    var card = $("<div>").addClass("card align-self-md-stretch days")
    var cardBody = $("<div>").addClass("card-body pt-0 pl-0 pr-0 pb-0");
    var cardTitle = $("<p>").addClass("title").text(convertDate);
    cardBody.append(cardTitle);

    var divEl = $("<div>");
    var cardImg = $("<img>").attr({src:"http://openweathermap.org/img/wn/" + icon +".png", alt: description});
    divEl.append(cardImg);
    cardBody.append(divEl);

    var tempEl = $("<p>").addClass("data").text("Temp: " + temp + "\u00B0F");
    cardBody.append(tempEl);
    
    var windEl = $("<p>").addClass("data").text("Wind: " + wind_speed + " MPH");
    cardBody.append(windEl);

    var humidityEl = $("<p>").addClass("data").text("Humidity: " + humidity + " %")
    cardBody.append(humidityEl);

    card.append(cardBody);

    $("#5DayCard").append(card);
};

//weather details
var getWeather = function(cityName,lon, lat){
    var apiUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&units=imperial&appid=9698d78e4b0b91d10c1cae15ee7197eb"

    var response = fetch(apiUrl).then(function(response){
        if (response.ok){
            response.json().then(function(data){
                console.log(data);
                for(var i = 0; i < 6; i++){
                    if (i === 0){
                        displayCurrentWeather(cityName, data.daily[i].dt, data.daily[i].temp.day, data.daily[i].humidity, data.daily[i].wind_speed, data.daily[i].uvi);
                    } else {
                        display5Day(data.daily[i].dt, data.daily[i].temp.day, data.daily[i].humidity, data.daily[i].wind_speed, data.daily[i].weather[0].icon, data.daily[i].weather[0].description);
                    }
                }
                
            })
        }
    })
};

//city latlon
var getLatLon = function(city){
    var apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=9698d78e4b0b91d10c1cae15ee7197eb"

    var response = fetch(apiUrl).then(function(response){
        if (response.ok){
            response.json().then(function(data){
                getWeather(city, data.coord.lon, data.coord.lat);
                saveData(city);
            })
        } else {
            console.log("error: please enter a valid city name");
        }
    })
};

//city buttons
var createBtn = function(name){
    var btnEl = $("<button>").addClass("btn btn-secondary mb-2").attr("id", "submit").text(name);
    $("#history").append(btnEl);
};

//save city to local storage
var saveData = function(name){
    var citySearch = JSON.parse(localStorage.getItem("cityName")) || []
    var nameUpper = name.toUpperCase();

    if(citySearch.length === 0){
        citySearch.push(nameUpper);
        createBtn(nameUpper);
    } else if (!citySearch.includes(nameUpper)){
        citySearch.push(nameUpper);
        createBtn(nameUpper);
    }   
            
    window.localStorage.setItem("cityName", JSON.stringify(citySearch));

};

var loadData = function(){
    var name = JSON.parse(localStorage.getItem("cityName"));

    $.each(name, function(list, item){
        createBtn(item);
    })
}

//search button click
$("#search").on("click", function(event){
    event.preventDefault();
    document.getElementById("display-data").innerHTML = ""

    var cityName = $("#city").val();

    getLatLon(cityName);

});

//city button click
$("#history").on("click", "#submit", function(){
    var city = $(this).text();
    document.getElementById("display-data").innerHTML = "";
    getLatLon(city);
});


loadData();