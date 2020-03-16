import { extensionSpec, React, appActions, getAppStore, LayoutContextToolProps, Immutable, i18n } from 'jimu-core';
import { IMWidgetState } from '../config';
import defaultMessage from '../../src/runtime/translations/default';

export default class TextTool implements extensionSpec.ContextTool {
  index = 2;
  id = 'text-expression';
  widgetId: string;

  visible(props: LayoutContextToolProps) {
    const widgetId = props.layoutItem.widgetId;
    const widgetJson = getAppStore().getState().appConfig?.widgets?.[widgetId];
    const showExpressionTool = widgetJson?.useDataSources?.length &&  widgetJson?.useDataSourcesEnabled;
    return showExpressionTool;
  }

  getGroupId() {
    return null;
  }

  getTitle() {
    const intl = i18n.getIntl('_jimu');
    return intl ? intl.formatMessage({ id: 'dynamicContent', defaultMessage: defaultMessage['dynamicContent'] }) : 'Dynamic content';
  }

  checked(props: LayoutContextToolProps) {
    const widgetId = props.layoutItem.widgetId;
    const widgetState: IMWidgetState = getAppStore().getState().widgetsState[widgetId] || Immutable({});
    return !!widgetState.showExpression;
  }

  getIcon() {
    return require('jimu-ui/lib/icons/data-16.svg');
  }

  onClick(props: LayoutContextToolProps) {
    const widgetId = props.layoutItem.widgetId;
    const widgetState: IMWidgetState = getAppStore().getState().widgetsState[widgetId] || Immutable({});

    const showExpression = !widgetState.showExpression;

    if (showExpression) {
      if (!getAppStore().getState().widgetsRuntimeInfo[widgetId].isInlineEditing) {
        getAppStore().dispatch(appActions.setWidgetIsInlineEditingState(widgetId, true));
      }
    }
    getAppStore().dispatch(appActions.widgetStatePropChange(widgetId, 'showExpression', showExpression));
  }

  getSettingPanel(): React.ComponentClass<{}> {
    return null;
  }
}




