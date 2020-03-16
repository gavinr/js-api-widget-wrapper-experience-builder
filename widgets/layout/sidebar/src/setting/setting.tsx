/** @jsx jsx */
import { jsx } from 'jimu-core';
import { BaseWidgetSetting, AllWidgetSettingProps } from 'jimu-for-builder';
import SidebarLayoutSetting from './layout-setting';
import { defaultConfig } from '../config';
import defaultMessages from './translations/default';

export default class Setting extends BaseWidgetSetting<AllWidgetSettingProps<any>> {
  formatMessage = (id: string) => {
    return this.props.intl.formatMessage({ id, defaultMessage: defaultMessages[id] });
  }

  render() {
    const { config, id, onSettingChange } = this.props;

    return (
      <SidebarLayoutSetting
        widgetId={id}
        config={config || defaultConfig}
        formatMessage={this.formatMessage}
        onSettingChange={onSettingChange}
      />
    );
  }
}
