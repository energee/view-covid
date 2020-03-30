"use strict";

var labels = [];
var state_labels = [];
var days = {};

function getDays(data, countries) {
  var confirmed = [];
  for (var day of data[countries]) {
    if (day["confirmed"] < 25) continue;
    confirmed.push(day["confirmed"]);

    if (confirmed.length > labels.length) labels.push(labels.length);
  }
  days[countries] = confirmed;
  return confirmed;
}

function getDaysStates(state_data, states) {
  var confirmed = [];
  for (var day of state_data[states]) {
    if (day["confirmed"] < 5) continue;
    confirmed.push(day["confirmed"]);

    if (confirmed.length > state_labels.length) state_labels.push(state_labels.length);
  }
  days[states] = confirmed;
  return confirmed;
}

function getDaysDead(data, countries) {
  var confirmed = [];
  for (var day of data[countries]) {
    if (day["deaths"] < 25) continue;
    confirmed.push(day["deaths"]);

    if (confirmed.length > labels.length) labels.push(labels.length);
  }
  days[countries] = confirmed;
  return confirmed;
}

function getDead(data, country) {
  var infected = [];
  for (var day of data[country]) {
    if (day["confirmed"] < 25) continue;
    infected.push(day["deaths"]);
  }
  return infected;
}

function getDeadPerConfirmed(data, country) {
  var deaths_confirmed = [];
  for (var day of data[country]) {
    if (day["confirmed"] < 25) continue;
    deaths_confirmed.push(day["deaths"] / day["confirmed"] * 100);
  }
  return deaths_confirmed;
}

function getInfected(data, country) {
  var infected = [];
  for (var day of data[country]) {
    if (day["confirmed"] < 25) continue;
    infected.push(day["confirmed"]);
  }
  return infected;
}

function getActive(data, country) {
  var infected = [];
  for (var day of data[country]) {
    if (day["confirmed"] < 25) continue;
    infected.push(day["confirmed"] - day["recovered"] - day["deaths"]);
  }
  return infected;
}

function getRate(data, country) {
  var confirmed = days[country];
  var rate = [0];
  for (var i = 1; i < confirmed.length; i++) {
    rate.push((confirmed[i] / confirmed[i - 1] - 1) * 100);
  }

  var avgd = [0, 0, 0, 0, 0];
  for (var i = 4; i < rate.length; i++) {
    avgd.push(
      ((rate[i] + rate[i - 1] + rate[i - 2] + rate[i - 3]) / 4).toFixed(2)
    );
  }

  return avgd;
}

function getDatasets(data, fn, countries, fill, population) {
  var datasets = [];

  for (var i = 0; i < countries.length; i++) {
    datasets.push({
      label: countries[i],
      fill: fill,
      data: fn(data, countries[i])
    });
    // Use per capita if population is provided.
    if (typeof population !== 'undefined') {
      for (var k in datasets[i].data) {
        datasets[i].data[k] = (datasets[i].data[k] / population[countries[i]]) * 100000;
      }
    }
  }

  return datasets;
}


var rate_cvs = document.getElementById("rate").getContext("2d");
var confirmed_pc = document.getElementById("confirmed-per-capita").getContext("2d");
var confirmed = document.getElementById("confirmed").getContext("2d");
var active_pc = document.getElementById("active-per-capita").getContext("2d");
var active = document.getElementById("active").getContext("2d");
var dead_pc = document.getElementById("dead-per-capita").getContext("2d");
var dead = document.getElementById("dead").getContext("2d");
var dead_per_case = document.getElementById("dead-per-case").getContext("2d");
// var state = document.getElementById("states").getContext("2d");

var countries = [
  "US",
  "Japan",
  "Italy",
  "China",
  "Belarus",
  "Canada",
  "United Kingdom",
  "Iran",
  "Spain",
  "Ukraine",
  "Sweden",
  "Norway"
];

var states = [
  "New York",
  "New Jersey",
  "California",
  "Louisiana",
  "Michigan",
  "Illinois",
  "Washington",
  "Florida",
  "Texas",
  "Georgia",
  "Connecticut",
  "Pennsylvania",
  "North Carolina",
  "Massachusetts"
];

// Quick hack to allow State, country override
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let statesQuery = urlParams.get('states');
let countriesQuery = urlParams.get('countries');
if (statesQuery) {
  let statesArray = statesQuery.split(',');
  states = statesArray;
}
if (countriesQuery) {
  let countriesArray = countriesQuery.split(',');
  countries = countriesArray;
}

let config = {
  type: "line",
  data: {
    datasets: null,
    labels: null
  },
  options: {
    responsive: true,
    plugins: {
      colorschemes: {
        scheme: "brewer.SetThree12"
      }
    },
    legend: {
      labels: {}
    },
    title: {
      display: true,
      fontColor: "white",
      text: "Confirmed Cases (per capita)"
    },
    tooltips: {
      mode: "index",
      intersect: false
    },
    scales: {
      xAxes: [
        {
          display: true,
          scaleLabel: {
            display: true,
            fontColor: "white",
            labelString: "Days Since 25 Confirmed"
          }
        }
      ],
      yAxes: [
        {
          display: true,
          scaleLabel: {
            display: true,
            fontColor: "white",
            labelString: "Confirmed (per capita)"
          },
          ticks: {}
        }
      ]
    }
  }
};
fetch("https://pomber.github.io/covid19/timeseries.json")
  .then(response => {
    return response.json();
  })
  .then(data => {
    let cconfig = JSON.parse(JSON.stringify(config));
    cconfig.data.datasets = getDatasets(
      data,
      getDays,
      countries,
      false,
      population
    );

    cconfig = JSON.parse(JSON.stringify(config));
    cconfig.options.title.text = "Infection Rate (Percentage of growth from today's cases vs yesterday - as this decreases, rate of spread is slowing)";
    cconfig.options.scales.yAxes[0].scaleLabel.labelString =
      "Confirmed today/yesterday";
    cconfig.options.scales.yAxes[0].ticks.min = 0;
    cconfig.options.scales.yAxes[0].ticks.callback = function(value) {
      return value + "%";
    };
    cconfig.data.datasets = getDatasets(data, getRate, countries, true);
    cconfig.data.labels = labels;
    var chartr = new Chart(rate_cvs, cconfig);

    cconfig = JSON.parse(JSON.stringify(config));
    cconfig.options.title.text = "Confirmed Cases (per capita)";
    cconfig.options.scales.yAxes[0].scaleLabel.labelString =
      "Cases per capita";
    cconfig.data.datasets = getDatasets(
      data,
      getInfected,
      countries,
      true,
      population
    );
    cconfig.data.labels = labels;
    var chartrc = new Chart(confirmed_pc, cconfig);

    cconfig = JSON.parse(JSON.stringify(config));
    cconfig.options.title.text = "Confirmed Cases (total per country)";
    cconfig.options.scales.yAxes[0].scaleLabel.labelString =
      "Total Confirmed Cases";
    cconfig.data.datasets = getDatasets(
      data,
      getInfected,
      countries,
      true
    );
    cconfig.data.labels = labels;
    var chartrc = new Chart(confirmed, cconfig);

    cconfig = JSON.parse(JSON.stringify(config));
    cconfig.options.title.text = "Active Cases Per Capita (confirmed cases after removing recovered cases and deaths)";
    cconfig.options.scales.yAxes[0].scaleLabel.labelString =
      "Active Cases per capita";
    cconfig.data.datasets = getDatasets(
      data,
      getActive,
      countries,
      true,
      population
    );
    cconfig.data.labels = labels;
    var chartrc = new Chart(active_pc, cconfig);

    cconfig = JSON.parse(JSON.stringify(config));
    cconfig.options.title.text = "Total Active Cases (confirmed cases after removing recovered cases and deaths)";
    cconfig.options.scales.yAxes[0].scaleLabel.labelString =
      "Total Active Cases";
    cconfig.data.datasets = getDatasets(
      data,
      getActive,
      countries,
      true
    );
    cconfig.data.labels = labels;
    var chartrc = new Chart(active, cconfig);

    cconfig = JSON.parse(JSON.stringify(config));
    cconfig.options.title.text = "Deaths (per capita)";
    cconfig.options.scales.yAxes[0].scaleLabel.labelString =
      "Deaths per capita";
    cconfig.data.datasets = getDatasets(
      data,
      getDead,
      countries,
      true,
      population
    );
    cconfig.data.labels = labels;
    var chartrc = new Chart(dead_pc, cconfig);

    cconfig = JSON.parse(JSON.stringify(config));
    cconfig.options.title.text = "Total Deaths (total per country)";
    cconfig.options.scales.yAxes[0].scaleLabel.labelString =
      "Total Deaths";
    cconfig.data.datasets = getDatasets(
      data,
      getDead,
      countries,
      true
    );
    cconfig.data.labels = labels;
    var chartrc = new Chart(dead, cconfig);

    cconfig = JSON.parse(JSON.stringify(config));
    cconfig.options.title.text = "Deaths Per Confirmed Cases (per country)";
    cconfig.options.scales.yAxes[0].scaleLabel.labelString =
      "Total Deaths / Confirmed";
    cconfig.options.scales.yAxes[0].ticks.callback = function(value) {
      return value + "%";
    };
    cconfig.data.datasets = getDatasets(
      data,
      getDeadPerConfirmed,
      countries,
      true
    );
    cconfig.data.labels = labels;
    var chartrc = new Chart(dead_per_case, cconfig);
  }
);
