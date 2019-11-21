/** @jsx jsx */
import { AllWidgetProps, BaseWidget, jsx } from "jimu-core";
import { IMConfig } from "../config";
import {
  JimuMapViewComponent,
  JimuMapView,
  loadArcGISJSAPIModules
} from "jimu-arcgis";

// import { TabContent, TabPane, Nav, NavItem, NavLink, Button} from 'jimu-ui';
// import defaultMessages from "./translations/default";
// import Compass = require("esri/widgets/Compass");

interface IState {
  jimuMapView: JimuMapView;
}

export default class Widget extends BaseWidget<AllWidgetProps<IMConfig>, any> {
  Compass: typeof __esri.Compass;

  constructor(props) {
    super(props);
    this.state = {};
  }

  activeViewChangeHandler = (jmv: JimuMapView) => {
    if (jmv) {
      this.setState({
        jimuMapView: jmv
      });

      loadArcGISJSAPIModules(["esri/widgets/Compass"]).then(modules => {
        [this.Compass] = modules;
        console.log("creating compass - jmv.view", this.state.jimuMapView.view);
        const compass = new this.Compass({
          view: this.state.jimuMapView.view
        });
        this.state.jimuMapView.view.ui.add(compass, "top-right");
      });
    }
  };

  render() {
    return (
      <div
        className="widget-js-api-widget-wrapper jimu-widget"
        style={{ overflow: "auto" }}
      >
        {this.props.hasOwnProperty("useMapWidgetIds") &&
          this.props.useMapWidgetIds &&
          this.props.useMapWidgetIds.length === 1 && (
            <JimuMapViewComponent
              useMapWidgetIds={this.props.useMapWidgetIds}
              onActiveViewChange={this.activeViewChangeHandler}
            />
          )}
        test
      </div>
    );
  }
}
