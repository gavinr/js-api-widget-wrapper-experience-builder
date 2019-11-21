/** @jsx jsx */
import { AllWidgetProps, BaseWidget, jsx, React } from "jimu-core";
import { IMConfig } from "../config";
import { JimuMapViewComponent, JimuMapView } from "jimu-arcgis";

import DistanceMeasurement2D = require("esri/widgets/DistanceMeasurement2D");

interface IState {
  jimuMapView: JimuMapView;
}

export default class Widget extends BaseWidget<AllWidgetProps<IMConfig>, any> {
  private myRef = React.createRef<HTMLDivElement>();

  constructor(props) {
    super(props);
    this.state = {
      jimuMapView: null
    };
  }

  activeViewChangeHandler = (jmv: JimuMapView) => {
    if (jmv) {
      this.setState({
        jimuMapView: jmv
      });

      new DistanceMeasurement2D({
        view: jmv.view,
        container: this.myRef.current
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
        <div ref={this.myRef}></div>
      </div>
    );
  }
}
