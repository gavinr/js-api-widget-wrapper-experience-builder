import { React, FormattedMessage } from "jimu-core";
import { BaseWidgetSetting, AllWidgetSettingProps } from "jimu-for-builder";
import { IMConfig } from "../config";
import defaultMessages from "./translations/default";
import {
  JimuMapViewSelector,
  SettingSection,
  SettingRow
} from "jimu-ui/setting-components";

export default class Setting extends BaseWidgetSetting<
  AllWidgetSettingProps<IMConfig>,
  any
> {
  onMapWidgetSelected = (useMapWidgetIds: string[]) => {
    this.props.onSettingChange({
      id: this.props.id,
      useMapWidgetIds: useMapWidgetIds
    });
  };

  render() {
    return (
      <div className="widget-setting-js-api-widget-wrapper">
        <SettingSection
          className="map-selector-section"
          title={this.props.intl.formatMessage({
            id: "selectMapWidget",
            defaultMessage: defaultMessages.selectMapWidget
          })}
        >
          <JimuMapViewSelector
            onSelect={this.onMapWidgetSelected}
            useMapWidgetIds={this.props.useMapWidgetIds}
          />
        </SettingSection>
      </div>
    );
  }
}
