/** @jsx jsx */
import { AllWidgetProps, BaseWidget, jsx, React } from "jimu-core";
import { IMConfig } from "../config";
import { JimuMapViewComponent, JimuMapView } from "jimu-arcgis";

import Compass = require("esri/widgets/Compass");

interface IState {
  jimuMapView: JimuMapView;
  currentWidget: Compass;
}

export default class Widget extends BaseWidget<AllWidgetProps<IMConfig>, any> {
  private myRef = React.createRef<HTMLDivElement>();

  constructor(props) {
    super(props);
    this.state = {
      jimuMapView: null,
      currentWidget: null
    };
  }

  activeViewChangeHandler = (jmv: JimuMapView) => {
    if (this.state.jimuMapView) {
      // we have a "previous" map where we added the widget
      // (ex: case where two Maps in single Experience page and user is switching
      // between them in the dropdown) - we must destroy the old widget in this case.
      if (this.state.currentWidget) {
        this.state.currentWidget.destroy();
      }
    }

    if (jmv) {
      this.setState({
        jimuMapView: jmv
      });

      const compass = new Compass({
        view: jmv.view
      });
      jmv.view.ui.add(compass, "bottom-left");

      // Save reference to the "Current widget" in State so we can destroy later if necessary.
      this.setState({
        currentWidget: compass
      });
    }
  };

  // activeViewChangeHandler is not called in the builder when "None" is selected
  // for the map, so we must cleanup here:
  componentDidUpdate = evt => {
    if (this.props.useMapWidgetIds.length === 0) {
      // "None" was selected in the "Select map widget" dropdown:
      if (this.state.currentWidget) {
        this.state.currentWidget.destroy();
      }
    }
  };

  render() {
    // If the user has selected a map, include JimuMapViewComponent.
    // If not, show a message asking for the Experience Author to select it.
    let jmc = <p>Please select a map.</p>;
    if (
      this.props.hasOwnProperty("useMapWidgetIds") &&
      this.props.useMapWidgetIds &&
      this.props.useMapWidgetIds.length === 1
    ) {
      jmc = (
        <JimuMapViewComponent
          useMapWidgetIds={this.props.useMapWidgetIds}
          onActiveViewChange={this.activeViewChangeHandler}
        />
      );
    }

    return (
      <div
        className="widget-js-api-widget-wrapper jimu-widget"
        style={{ overflow: "auto" }}
      >
        {jmc}
      </div>
    );
  }
}
