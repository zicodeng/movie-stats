/*
app.js - application script for the movies challenge
add your code to this file
*/
"use strict";

document.addEventListener("DOMContentLoaded", function() {
    console.log("Document Ready");
});

var reportSelect = document.querySelector("#report-select");
var reportTable = document.querySelector("#report");
var title = document.querySelector(".title");
var table = document.createElement("table");
table.setAttribute("class", "table");

// Build header titles
function buildHeader(objArray) {
    var thead = document.createElement("thead");
    var trHead = document.createElement("tr");
    var keys = Object.keys(objArray[0]);
    keys.forEach(function(key) {
        var thName = document.createElement("th");
        key = key.charAt(0).toUpperCase() + key.substr(1);
        if(key === "Released") {
            key = "Date Released";
        }
        if(key === "Tickets") {
            key = "Tickets Sold";
        }
        if(key === "Sales") {
            key = "Gross Sales";
        }
        if(key === "Average Tickets" || key === "Average Sales" || key === "Gross Sales" || key === "Tickets Sold") {
            thName.setAttribute("style", "text-align: right");
        }
        thName.textContent = key;
        trHead.appendChild(thName);
    });
    thead.appendChild(trHead);
    table.appendChild(thead);
}

// Insert content to the table
function buildContent(objArray) {
    var tbody = document.createElement("tbody");
    objArray.forEach(function(obj) {
        // Create a row for each object
        var trContent = document.createElement("tr");
        // Find all keys for each object
        var keys = Object.keys(obj);
        keys.forEach(function(key) {
            var value = obj[key];
            var tdContent = document.createElement("td");
            if(key === "tickets" || key === "Average Tickets") {
                value = numeral(value).format('0,0');
                tdContent.setAttribute("style", "text-align: right");
            }
            if(key === "sales" || key === "Average Sales") {
                value = numeral(value).format('$ 0,0[.]00');
                tdContent.setAttribute("style", "text-align: right");
            }
            if(key === "released") {
                value = moment(value).calendar();
                tdContent.setAttribute("style", "text-align: left");
            }

            // Handle missing data
            if(value === "" || key === "") {
                key = "N/A";
                value = "N/A";
            }
            tdContent.textContent = value;
            trContent.appendChild(tdContent);
        });
        tbody.appendChild(trContent);
    });
    table.appendChild(tbody);
}

function buildTable(objArray) {
    reportTable.appendChild(table);
    buildHeader(objArray);
    buildContent(objArray);
}

// Filter out all movies that are not star wars and store them into an array
var onlyStarWars = MOVIES.filter(function(obj) {
    return obj.title.toLowerCase().includes("star wars");
});

// Sort all star war movies by the title property, alphabetically ascending according to the current locale
var sortStarWars = onlyStarWars.sort(function(obj1, obj2) {
    return obj1.title.localeCompare(obj2.title);
});

// Get all movies that are released prior to January 1, 2000
var moviesBefore2000 = MOVIES.filter(function(obj) {
    return Date.parse(obj.released) < Date.parse("2000-01-01");
});

// Sort movies by released ascending and year
var sortMovies = moviesBefore2000.sort(function(obj1, obj2) {
    if(obj1.released !== obj2.released) {
        return Date.parse(obj1.released) - Date.parse(obj2.released);
    } else {
        return obj1.year - obj2.year;
    }
});

// Get all unique genres and store them into a Set
function getUniqueGenre() {
    var genreSet = new Set();
    MOVIES.forEach(function(obj) {
        genreSet.add(obj.genre);
    });
    return genreSet;
}

// Get average sales by each unique genre and store them into a array
function getGenreSales() {
    var uniqueGenre = getUniqueGenre();
    var genreAvgArray = [];
    uniqueGenre.forEach(function(genreName) {
        var count = 0;
        var totalSales = 0;
        MOVIES.forEach(function(obj) {
            if(genreName === obj.genre) {
                count ++;
                totalSales += obj.sales;
            }
        });
        var avg = totalSales / count;
        var genreObj = {
            "Genre": genreName,
            "Average Sales": avg
        };
        genreAvgArray.push(genreObj);
    });
    return genreAvgArray;
}

// Sort the array by average sales descending
var avgByGenre = getGenreSales().sort(function(obj1, obj2) {
    return - (obj1["Average Sales"] - obj2["Average Sales"]);
});

// Get distinct movie by its title and released date
function getDistinctMovie() {
    var distinctMovieSet = new Set();
    MOVIES.forEach(function(obj) {
        var distinctMovie = obj.title + "*" + obj.released;
        distinctMovieSet.add(distinctMovie);
    });
    return distinctMovieSet;
}

// Get total tickets group by distict movie
function getMovieAndTickets() {
    var distinctMovieSet = getDistinctMovie();
    var movieAndTickets = [];
    distinctMovieSet.forEach(function(movieName) {
        var totalTickets = 0;
        var movieTitle = "";
        var year = "";
        MOVIES.forEach(function(obj) {
            var titlePlusReleased = obj.title + "*" + obj.released;
            if(titlePlusReleased === movieName) {
                totalTickets += obj.tickets;
                movieTitle = obj.title;
                year = moment(obj.released).year();
            }
        });
        var movieObj = {
            "title": movieTitle + "(" + year + ")",
            "tickets": totalTickets
        };
        movieAndTickets.push(movieObj);
    });
    return movieAndTickets;
}

// Get top 100 distinct movies based on total tickets
var top100 = getMovieAndTickets().sort(function(obj1, obj2) {
    return -(obj1.tickets - obj2.tickets);
}).slice(0, 100);

// Advanced Extra-Credit
// Get average sales and total tickets group by distinct rating
function getRatingSalesAndTickets() {
    var ratingList = ["Not Rated", "G", "PG", "PG-13", "R", "NC-17"];
    var movieList = [];
    ratingList.forEach(function(ratingName) {
        var count = 0;
        var totalSales = 0;
        var totalTickets = 0;
        MOVIES.forEach(function(obj) {
            if(ratingName === obj.rating) {
                count ++;
                totalSales += obj.sales;
                totalTickets += obj.tickets;
            }
        });
        var avgSales = totalSales / count;
        var avgTickets = totalTickets / count;
        var ratingObj = {
            "Rating": ratingName,
            "Average Sales": avgSales,
            "Average Tickets": avgTickets
        };
        movieList.push(ratingObj);
    });
    return movieList;
}

// Build different table based on user's selection
reportSelect.addEventListener("change", function (e) {
    // Removes all the elements in the table.
    table.innerHTML = "";
    var value = e.target.value;
    if (value === "star-wars") {
        title.textContent = "Only Star Wars";
        buildTable(sortStarWars);
    } else if (value === "20th") {
        title.textContent = "20th-Century Movies";
        buildTable(sortMovies);
    } else if(value === "avg-by-genre") {
        title.textContent = "Average Sales by Genre";
        buildTable(avgByGenre);
    } else if(value === "top-by-tickets") {
        title.textContent = "Top 100 Movies by Tickets Sold";
        buildTable(top100);
    } else if(value === "avg-sales-tickets-by-rating") {
        title.textContent = "Average Sales and Tickets by Rating";
        buildTable(getRatingSalesAndTickets());
    } else {
        buildTable(MOVIES);
    }
});
