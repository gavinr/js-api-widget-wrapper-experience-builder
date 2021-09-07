import { React } from "jimu-core";
import { AllWidgetSettingProps } from "jimu-for-builder";
import defaultMessages from "./translations/default";
import {
  JimuMapViewSelector,
  SettingSection,
} from "jimu-ui/advanced/setting-components";

export default function Setting(props: AllWidgetSettingProps<any>) {

  const onMapWidgetSelected = (useMapWidgetIds: string[]) => {
    props.onSettingChange({
      id: props.id,
      useMapWidgetIds: useMapWidgetIds
    });
  };

  return (
    <div className="widget-setting-js-api-widget-wrapper">
      <SettingSection
        className="map-selector-section"
        title={props.intl.formatMessage({
          id: "selectMapWidget",
          defaultMessage: defaultMessages.selectMapWidget
        })}
      >
        <JimuMapViewSelector
          onSelect={onMapWidgetSelected}
          useMapWidgetIds={props.useMapWidgetIds}
        />
      </SettingSection>
    </div>
  );
}
