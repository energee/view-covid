"use strict";

let labels = [];
let state_labels = [];
let days = {};

function getDays(data, countries) {
  let confirmed = [];
  for (let day of data[countries]) {
    if (day["confirmed"] < 25) continue;
    confirmed.push(day["confirmed"]);

    if (confirmed.length > labels.length) labels.push(labels.length);
  }
  days[countries] = confirmed;
  return confirmed;
}

function getDaysStates(state_data, states) {
  let confirmed = [];
  for (let day of state_data[states]) {
    if (day["confirmed"] < 5) continue;
    confirmed.push(day["confirmed"]);

    if (confirmed.length > state_labels.length) state_labels.push(state_labels.length);
  }
  days[states] = confirmed;
  return confirmed;
}

function getDeadStates(state_data, states) {
  let deaths = [];
  for (let day of state_data[states]) {
    if (day["deaths"] < 1) continue;
    deaths.push(day["deaths"]);

    if (deaths.length > state_labels.length) state_labels.push(state_labels.length);
  }
  days[states] = deaths;
  return deaths;
}

function getDaysDead(data, countries) {
  let confirmed = [];
  for (let day of data[countries]) {
    if (day["deaths"] < 25) continue;
    confirmed.push(day["deaths"]);

    if (confirmed.length > labels.length) labels.push(labels.length);
  }
  days[countries] = confirmed;
  return confirmed;
}

function getDead(data, country) {
  let infected = [];
  for (let day of data[country]) {
    if (day["confirmed"] < 25) continue;
    infected.push(day["deaths"]);
  }
  return infected;
}

function getDeadPerConfirmed(data, country) {
  let deaths_confirmed = [];
  for (let day of data[country]) {
    if (day["confirmed"] < 25) continue;
    deaths_confirmed.push(day["deaths"] / day["confirmed"] * 100);
  }
  return deaths_confirmed;
}

function getInfected(data, country) {
  let infected = [];
  for (let day of data[country]) {
    if (day["confirmed"] < 25) continue;
    infected.push(day["confirmed"]);
  }
  return infected;
}

function getActive(data, country) {
  let infected = [];
  for (let day of data[country]) {
    if (day["confirmed"] < 25) continue;
    infected.push(day["confirmed"] - day["recovered"] - day["deaths"]);
  }
  return infected;
}

function getRate(data, country) {
  let confirmed = days[country];
  let rate = [0];
  for (let i = 1; i < confirmed.length; i++) {
    rate.push((confirmed[i] / confirmed[i - 1] - 1) * 100);
  }

  let avgd = [0, 0, 0, 0, 0];
  for (let i = 4; i < rate.length; i++) {
    avgd.push(
      ((rate[i] + rate[i - 1] + rate[i - 2] + rate[i - 3]) / 4).toFixed(2)
    );
  }

  return avgd;
}

function getDatasets(data, fn, countries, fill, population) {
  let datasets = [];

  for (let i = 0; i < countries.length; i++) {
    datasets.push({
      label: countries[i],
      fill: fill,
      data: fn(data, countries[i])
    });
    // Use per capita if population is provided.
    if (typeof population !== 'undefined') {
      for (let k in datasets[i].data) {
        datasets[i].data[k] = (datasets[i].data[k] / population[countries[i]]) * 100000;
      }
    }
  }

  return datasets;
}

function displayInfo() {
  let clicked = localStorage.getItem('legendClicked'),
      element = document.getElementById('toggle-info');
  if (clicked && parseInt(clicked) == 5) {
    element.classList.remove('show');
  } else {
    element.classList.add('show');
  }
}

let rate_cvs = document.getElementById("rate").getContext("2d");
let confirmed_pc = document.getElementById("confirmed-per-capita").getContext("2d");
let confirmed = document.getElementById("confirmed").getContext("2d");
let active_pc = document.getElementById("active-per-capita").getContext("2d");
let active = document.getElementById("active").getContext("2d");
let dead_pc = document.getElementById("dead-per-capita").getContext("2d");
let dead = document.getElementById("dead").getContext("2d");
let dead_per_case = document.getElementById("dead-per-case").getContext("2d");
let state_pc = document.getElementById("states-per-capita").getContext("2d");
let state = document.getElementById("states").getContext("2d");
let dead_state = document.getElementById("dead-states").getContext("2d");

let countries = [
  "US",
  "Italy",
  "Spain",
  "China",
  "Germany",
  "France",
  "Iran",
  "United Kingdom",
  "Switzerland",
  "Turkey",
  "Belgium",
  "Netherlands",
  "Austria",
  "Korea, South",
  "Canada",
  "Belarus",
  "Ukraine",
  "Sweden",
  "Norway",
  "Israel"
];

let states = [
  "New York",
  "New Jersey",
  "Michigan",
  "California",
  "Massachusetts",
  "Florida",
  "Illinois",
  "Washington",
  "Louisiana",
  "Pennsylvania",
  "Georgia",
  "Texas",
  "Colorado",
  "Connecticut",
  "Ohio",
  "Indiana",
  "Tennessee",
  "Maryland",
  "District of Columbia",
  "Virginia"
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
        scheme: "tableau.Tableau20"
      }
    },
    legend: {
      position: "right",
      labels: {
        boxWidth: 12,
        fontColor: "white",
      }
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
// Put legend on the top when displaying on mobile.
if ((window.innerWidth <= 480 ) || ( window.innerHeight <= 480)) {
  config.options.legend.position = "top";
}
displayInfo();

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
    let chartr = new Chart(rate_cvs, cconfig);

    cconfig = JSON.parse(JSON.stringify(config));
    cconfig.options.title.text = "Confirmed Cases (per capita)";
    cconfig.options.scales.yAxes[0].scaleLabel.labelString =
      "Cases per capita";
    cconfig.data.datasets = getDatasets(
      data,
      getInfected,
      countries,
      false,
      population
    );
    cconfig.data.labels = labels;
    let chartrc = new Chart(confirmed_pc, cconfig);

    cconfig = JSON.parse(JSON.stringify(config));
    cconfig.options.title.text = "Confirmed Cases (total per country)";
    cconfig.options.scales.yAxes[0].scaleLabel.labelString =
      "Total Confirmed Cases";
    cconfig.data.datasets = getDatasets(
      data,
      getInfected,
      countries,
      false
    );
    cconfig.data.labels = labels;
    chartrc = new Chart(confirmed, cconfig);

    cconfig = JSON.parse(JSON.stringify(config));
    cconfig.options.title.text = "Active Cases Per Capita (confirmed cases after removing recovered cases and deaths)";
    cconfig.options.scales.yAxes[0].scaleLabel.labelString =
      "Active Cases per capita";
    cconfig.data.datasets = getDatasets(
      data,
      getActive,
      countries,
      false,
      population
    );
    cconfig.data.labels = labels;
    chartrc = new Chart(active_pc, cconfig);

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
    chartrc = new Chart(active, cconfig);

    cconfig = JSON.parse(JSON.stringify(config));
    cconfig.options.title.text = "Deaths (per capita)";
    cconfig.options.scales.yAxes[0].scaleLabel.labelString =
      "Deaths per capita";
    cconfig.data.datasets = getDatasets(
      data,
      getDead,
      countries,
      false,
      population
    );
    cconfig.data.labels = labels;
    chartrc = new Chart(dead_pc, cconfig);

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
    chartrc = new Chart(dead, cconfig);

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
    chartrc = new Chart(dead_per_case, cconfig);
  }
);

fetch("https://energ.ee/covid19-us-api/states.json")
  .then(response => {
    return response.json();
  })
  .then(state_data => {
    let cconfig = JSON.parse(JSON.stringify(config));
    cconfig.data.datasets = getDatasets(
      state_data,
      getDaysStates,
      states,
      false,
      state_population
    );
    cconfig.options.title.text = "Cases per state (per capita)";
    cconfig.options.scales.yAxes[0].scaleLabel.labelString =
      "Cases per State per capita";
    cconfig.options.scales.xAxes[0].scaleLabel.labelString =
        "Days Since 5 Confirmed";
    cconfig.data.labels = state_labels;
    let chartrc = new Chart(state_pc, cconfig);

    cconfig = JSON.parse(JSON.stringify(config));
    cconfig.data.datasets = getDatasets(
      state_data,
      getDaysStates,
      states,
      false,
    );
    cconfig.options.title.text = "Total Cases per state";
    cconfig.options.scales.yAxes[0].scaleLabel.labelString =
      "Total Cases per State";
    cconfig.options.scales.xAxes[0].scaleLabel.labelString =
        "Days Since 5 Confirmed";
    cconfig.data.labels = state_labels;
    chartrc = new Chart(state, cconfig);

    cconfig = JSON.parse(JSON.stringify(config));
    cconfig.data.datasets = getDatasets(
      state_data,
      getDeadStates,
      states,
      false,
    );
    cconfig.options.title.text = "Total Deaths per state";
    cconfig.options.scales.yAxes[0].scaleLabel.labelString =
      "Total Deaths";
    cconfig.options.scales.xAxes[0].scaleLabel.labelString =
        "Days Since first death Confirmed";
    cconfig.data.labels = state_labels;
    chartrc = new Chart(dead_state, cconfig);
  }
);
Chart.defaults.global.elements.line.borderWidth = 1;
Chart.defaults.global.elements.point.radius = .5;
Chart.defaults.global.defaultFontFamily = "Open Sans";
Chart.defaults.global.legend.onClick = function (e, legendItem) {
  var index = legendItem.datasetIndex;
  var ci = this.chart;
  var meta = ci.getDatasetMeta(index);
  meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;
  ci.update();
  // Count legend clicks up to 5 and set in localstorage.
  if (localStorage.getItem('legendClicked') < 5) {
    var clicks = parseInt(localStorage.getItem('legendClicked'));
    localStorage.setItem('legendClicked', ++clicks || 1);
    displayInfo();
  }
}
