# JS API Widget Wrapper

Example of how to include an [ArcGIS API for JavaScript widget](https://developers.arcgis.com/javascript/latest/sample-code/?search=Widget) in an Experience Builder widget.

The main example here includes the [2D Measurement widget](https://developers.arcgis.com/javascript/latest/sample-code/widgets-measurement-2d/index.html). Click the download button above and extract the files to `client\your-extensions\widgets\js-api-widget-wrapper` to see it in action.

[![Screenshot](https://github.com/gavinr/js-api-widget-wrapper-experience-builder/raw/master/screencast.gif)](https://gavinr.github.io/js-api-widget-wrapper-experience-builder/)


([builder interface](https://github.com/gavinr/js-api-widget-wrapper-experience-builder/raw/master/builder-screencast.mp4))

## Quick Start - Download

1. [Download](https://developers.arcgis.com/downloads/apis-and-sdks?product=arcgis-experience-builder) and unzip [Experience Builder Developer Edition](https://developers.arcgis.com/experience-builder/).
2. Download the latest [release](https://github.com/gavinr/js-api-widget-wrapper-experience-builder/releases) from this repository.
3. Unzip the downloaded files, and copy the `js-api-widget-wrapper` folder into the `client\your-extensions\widgets\js-api-widget-wrapper` folder of the extracted Experience Builder files.

## Quick Start - Git

1. [Download](https://developers.arcgis.com/downloads/apis-and-sdks?product=arcgis-experience-builder) and unzip [Experience Builder Developer Edition](https://developers.arcgis.com/experience-builder/).
2. Open a new terminal window and browse to the `client` folder.
3. `git clone https://github.com/gavinr/js-api-widget-wrapper-experience-builder`
4. `npm ci`
5. `npm start`
6. Start Experience Builder server per the instructions (in a separate terminal, `cd server`, `npm ci`, `npm start`)

## Development

1. Open the `client` folder as a project in VS Code (or similar code editor).
1. Make sure *both* scripts are running (in the `server` folder and `client`) folder).
1. Every time you make a change to your widget, it will be re-built with webpack automatically.

## Icon Widget

If you want to include a widget that is primarily placed as an icon over the map (using `view.ui.add()`), like the [Compass widget](https://developers.arcgis.com/javascript/latest/sample-code/widgets-compass-2d/index.html), an example is shown in the [compass branch here](https://github.com/gavinr/js-api-widget-wrapper-experience-builder/tree/compass) ([download zip](https://github.com/gavinr/js-api-widget-wrapper-experience-builder/archive/compass.zip)). This will be a less-common use case for custom widgets, because the out-of-the-box Experience Builder Map Widget allows you to easily enable/disable these types of widgets in the widget settings.

## More

View my other Experience Builder projects [here](https://github.com/gavinr?tab=repositories&q=experience-builder)
