/** @jsx jsx */
import {BaseWidget, AllWidgetProps, jsx, DEFAULT_EMBED_LAYOUT_NAME } from 'jimu-core';
import {LayoutViewer} from 'jimu-layouts/layout-runtime';
import defaultMessages from './translations/default';
import {WidgetPlaceholder} from 'jimu-ui';

const IconImage = require('./assets/icon.svg');

export default class Widget extends BaseWidget<AllWidgetProps<{}>>{
  render(){
    const {layouts, id, intl, builderSupportModules} = this.props;
    const LayoutComponent = !window.jimuConfig.isInBuilder ?
      LayoutViewer : builderSupportModules.widgetModules.LayoutBuilder;

    if (!LayoutComponent) {
      return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        No layout component!
      </div>;
    }

    return <div className="widget-fixed-layout d-flex w-100 h-100">
      <LayoutComponent layouts={layouts[DEFAULT_EMBED_LAYOUT_NAME]} isInWidget={true} style={{
        overflow: 'auto',
        minHeight: 'none'
      }}>
        <WidgetPlaceholder icon={IconImage} widgetId={id}
          style={{
            border: 'none'
          }}
          message={intl.formatMessage({id: 'tips', defaultMessage: defaultMessages.tips})}></WidgetPlaceholder>
      </LayoutComponent>
    </div>;
  }
}