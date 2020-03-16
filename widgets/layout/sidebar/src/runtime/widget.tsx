/** @jsx jsx */
import { BaseWidget, AllWidgetProps, jsx, IMThemeVariables, IMState } from 'jimu-core';
import { SidebarLayout } from '../layout/runtime/layout';
import { IMSidebarConfig } from '../config';

interface ExtraProps {
  sidebarVisible: boolean;
}

export default class Widget extends BaseWidget<AllWidgetProps<IMSidebarConfig> & ExtraProps> {

  static mapExtraStateProps = (state: IMState, props: AllWidgetProps<IMSidebarConfig>): ExtraProps => {
    return {
      sidebarVisible: state?.widgetsState?.[props.id]?.collapse ?? true,
    };
  }

  render() {
    const { layouts, theme, builderSupportModules } = this.props;
    const LayoutComponent = !window.jimuConfig.isInBuilder
      ? SidebarLayout
      : builderSupportModules.widgetModules.SidebarLayoutBuilder;

    if (!LayoutComponent) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>No layout component!</div>
      );
    }

    return (
      <div className="widget-sidebar-layout d-flex w-100 h-100" >
        <LayoutComponent
          theme={theme as IMThemeVariables}
          widgetId={this.props.id}
          direction={this.props.config.direction}
          firstLayouts={layouts.FIRST}
          secondLayouts={layouts.SECOND}
          config={this.props.config}
          sidebarVisible={this.props.sidebarVisible}
        />
      </div>
    );
  }
}
