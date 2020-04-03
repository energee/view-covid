# Corona Virus Tracker
The charts that I found online were tracking totals, but this does not help to understand the amount of cases based on population or the number of cases vs the previous day.

I created these charts to visualize growth from previous day, compare cases between countries, with an example showing recoveries on a per-capita basis and actual totals.

## Todo:
- Refactor into VueJS for better data extraction between data and views and improve state management.
- Allow control of default options for charts (States & Countries).
  - Provide list of all available countries and states
  - Allow user to choose what appears in the legend
  - Locally save state of user configuration and toggle control on each chart.
- Add county visualizations

Check it out here https://energ.ee/corona-virus/

![Screenhot](https://github.com/energee/corona-virus/blob/master/assets/screenshot.png?raw=true)

Charts powered by https://www.chartjs.org

Data from https://github.com/pomber/covid19
