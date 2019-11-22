# JS API Widget Wrapper

Example of how to include an [ArcGIS API for JavaScript widget](https://developers.arcgis.com/javascript/latest/sample-code/?search=Widget) in an Experience Builder widget.

The main example here includes the [2D Measurement widget](https://developers.arcgis.com/javascript/latest/sample-code/widgets-measurement-2d/index.html). Click the download button above and extract the files to `client\your-extensions\widgets\js-api-widget-wrapper` to see it in action.

![Screenshot](https://github.com/gavinr/js-api-widget-wrapper-experience-builder/raw/master/screencast.gif)

### Icon Widget

If you want to include a widget that is primarily placed as an icon over the map (using `view.ui.add()`), like the [Compass widget](https://developers.arcgis.com/javascript/latest/sample-code/widgets-compass-2d/index.html), an example is shown in the [compass branch here](https://github.com/gavinr/js-api-widget-wrapper-experience-builder/tree/compass) ([download zip](https://github.com/gavinr/js-api-widget-wrapper-experience-builder/archive/compass.zip)). This will be a less-common use case for custom widgets, because the out-of-the-box Experience Builder Map Widget allows you to easily enable/disable these types of widgets in the widget settings.
