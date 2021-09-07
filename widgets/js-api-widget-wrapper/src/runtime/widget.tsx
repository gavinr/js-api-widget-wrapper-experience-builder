/** @jsx jsx */
import { AllWidgetProps, jsx, React } from "jimu-core";
import { JimuMapViewComponent, JimuMapView } from "jimu-arcgis";
const { useRef, useState, useEffect } = React;

import * as DistanceMeasurement2D from "esri/widgets/DistanceMeasurement2D";

export default function Setting(props: AllWidgetProps<any>) {
  const widgetRef = useRef<HTMLDivElement>();
  const [currentWidget, setCurrentWidget] = useState<DistanceMeasurement2D>();

  const activeViewChangeHandler = (jmv: JimuMapView) => {
    if (currentWidget && currentWidget !== undefined) {
      // we have a "previous" map where we added the widget
      // (ex: case where two Maps in single Experience page and user is switching
      // between them in the dropdown) - we must destroy the old widget in this case.
      currentWidget.destroy();
    }

    if (jmv) {
      if (widgetRef.current) {
        // since the widget replaces the container, we must create a new DOM node
        // so when we destroy we will not remove the "ref" DOM node
        const container = document.createElement("div");
        widgetRef.current.appendChild(container);

        const distanceMeasurement2D = new DistanceMeasurement2D({
          view: jmv.view,
          container: container
        });

        // Save reference to the "Current widget" in State so we can destroy later if necessary.
        setCurrentWidget(distanceMeasurement2D);
      } else {
        console.error('could not find widgetRef.current');
      }
    }
  };

  // activeViewChangeHandler is not called in the builder when "None" is selected
  // for the map, so we must cleanup here:
  useEffect(() => {
    if (props.useMapWidgetIds && props.useMapWidgetIds.length === 0 && currentWidget) {
      console.log('destroying');
      currentWidget.destroy();
    }
  });

  // If the user has selected a map, include JimuMapViewComponent.
  // If not, show a message asking for the Experience Author to select it.
  let jmc = <p>Please select a map.</p>;
  if (
    props.hasOwnProperty("useMapWidgetIds") &&
    props.useMapWidgetIds &&
    props.useMapWidgetIds.length === 1
  ) {
    jmc = (
      <JimuMapViewComponent
        useMapWidgetId={props.useMapWidgetIds?.[0]}
        onActiveViewChange={activeViewChangeHandler}
      />
    );
  }

  return (
    <div
      className="widget-js-api-widget-wrapper jimu-widget"
      style={{ overflow: "auto" }}
    >
      <div ref={widgetRef}></div>
      {jmc}
    </div>
  );
}
