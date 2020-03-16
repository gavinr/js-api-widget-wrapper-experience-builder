/** @jsx jsx */
/* eslint-disable prefer-const */
import { BaseWidget, classNames, AllWidgetProps, IMState, jsx, RepeatedDataSource, css, appActions, AppMode, Immutable, expressionUtils, ReactResizeDetector } from 'jimu-core';
import { IMConfig, Style } from '../config';
import Displayer from './runtime/displayer'
import { Editor } from 'jimu-ui/rich-text-editor';
import * as utils from './utils';
import defaultMessages from './translations/default';

interface ExtraProps {
  active: boolean;
  isInlineEditing?: boolean;
  appMode: AppMode;
}

enum RepeatType { None, Main, Sub }
interface State {
  repeat: RepeatType;
  height?: number;
}
export default class Widget extends BaseWidget<AllWidgetProps<IMConfig> & ExtraProps, State>{
  constructor(props) {
    super(props);
    this.state = {
      repeat: 2
    }
    this.persistPartialConfig = this.persistPartialConfig.bind(this);
    this.onResize = this.onResize.bind(this);
  }

  static mapExtraStateProps = (state: IMState, ownProps: AllWidgetProps<IMConfig> & ExtraProps) => {
    let selected = false;
    const selection = state.appRuntimeInfo.selection;
    if (selection && state.appConfig.layouts[selection.layoutId]) {
      const layoutItem = state.appConfig.layouts[selection.layoutId].content[selection.layoutItemId];
      selected = layoutItem && layoutItem.widgetId === ownProps.id
    }

    const isInBuilder = state.appContext.isInBuilder;
    const appMode = state.appRuntimeInfo.appMode;
    const active = isInBuilder && appMode === AppMode.Design && selected;
    return {
      active,
      appMode
    }
  };

  componentDidMount() {
    this.setRepeatType();
  }

  componentDidUpdate(preProps) {
    const { useDataSources, id, isInlineEditing, appMode, useDataSourcesEnabled, repeatedDataSource } = this.props;
    const { useDataSources: preUseDataSources, useDataSourcesEnabled: preUseDataSourcesEnabled,
      isInlineEditing: preIsInlineEditing, appMode: preAppMode, repeatedDataSource: preRrpeatedDataSource } = preProps;

    if (useDataSources !== preUseDataSources || useDataSourcesEnabled !== preUseDataSourcesEnabled) {
    }

    if (appMode !== preAppMode && appMode === AppMode.Run) {
      this.props.dispatch(appActions.setWidgetIsInlineEditingState(id, false));
    }

    if (isInlineEditing !== preIsInlineEditing) {
      if (!isInlineEditing) {
        this.hideExpressionPanel();
      }
      this.updateWidgteState('isInlineEditing', isInlineEditing);
    }

    if (repeatedDataSource !== preRrpeatedDataSource) {
      this.setRepeatType()
    }
  }

  updateWidgteState = (key: string, value: any) => {
    const { id } = this.props;
    this.props.dispatch(appActions.widgetStatePropChange(id, key, value));
  }

  hideExpressionPanel = () => {
    const { id } = this.props;
    this.props.dispatch(appActions.widgetStatePropChange(id, 'showExpression', false));
  }

  setRepeatType = () => {
    const repeatedDataSource = this.props.repeatedDataSource as RepeatedDataSource;
    let repeat;
    if (!repeatedDataSource) {
      repeat = RepeatType.None;
    } else {
      if (repeatedDataSource.recordIndex === 0) {
        repeat = RepeatType.Main;
      } else {
        repeat = RepeatType.Sub;
      }
    }
    this.setState({ repeat })
  }

  translate = (id: string) => {
    const { intl } = this.props;
    return intl ? intl.formatMessage({ id: id, defaultMessage: defaultMessages[id] }) : '';
  }

  translateDefaultPlaceholder = (placeholder: string) => {
    if (placeholder === defaultMessages.placeholder) {
      placeholder = this.translate('placeholder');
    }
    return placeholder;
  }

  getStyle = (editable: boolean) => {
    const style = this.props.config.style || {} as Style;
    const { wrap } = style;


    const nowrap = css`
     .ql-container {
        > .ql-runtime,
        > .ql-editor {
          white-space: nowrap !important;
        }
        > .ql-editor {
          overflow-x: auto;
        }
      }
    `;

    return css`
    display: flex;
    overflow: ${editable ? 'auto' : 'hidden'};
    .ql-container {
        > .ql-runtime {
          overflow: hidden;
        }
    }
    ${!wrap && nowrap};
    `
  }

  isEditable = () => {
    const { repeat } = this.state;
    const { active } = this.props;
    return active && repeat !== RepeatType.Sub;
  }

  displayer = () => {
    const { repeatedDataSource, useDataSources, useDataSourcesEnabled } = this.props;
    let { config: { text, placeholder } } = this.props;
    placeholder = this.translateDefaultPlaceholder(placeholder);

    return <Displayer
      text={text}
      parentHeight={this.state.height}
      placeholder={placeholder}
      useDataSources={useDataSourcesEnabled ? useDataSources : Immutable([])}
      repeatedDataSource={repeatedDataSource as RepeatedDataSource} />;
  }

  onEditorCreate = (editor: Editor) => {
    this.props.dispatch(appActions.widgetMutableStatePropChange(this.props.id, 'editor', editor));
  }

  onEditorDestory = () => {
    this.props.dispatch(appActions.widgetMutableStatePropChange(this.props.id, 'editor', null));
  }

  getExpressionParts = (text: string) => {
    const expressions = utils.getAllExpressions(text);
    const parts = utils.getExpressionParts(expressions);
    return parts;
  }

  mergeUseDataSources = (text: string) => {
    const { useDataSources } = this.props
    const parts = this.getExpressionParts(text);
    const udsWithFields = expressionUtils.getUseDataSourceFromExpParts(parts);
    return utils.replaceUseDataSourcesFields(useDataSources as any, udsWithFields);
    return useDataSources;
  }

  persistPartialConfig(partialConfig: Partial<IMConfig>) {
    let { builderSupportModules, config, id } = this.props
    const getAppConfigAction = builderSupportModules && builderSupportModules.jimuForBuilderLib.getAppConfigAction;
    if (!getAppConfigAction) return;
    let useDataSources = null
    if (partialConfig.text) {
      useDataSources = this.mergeUseDataSources(partialConfig.text);
    }
    config = config.merge(partialConfig);
    let appConfigAction = getAppConfigAction().editWidgetProperty(id, 'config', config);
    if (useDataSources) {
      appConfigAction = appConfigAction.editWidgetProperty(id, 'useDataSources', useDataSources as any);
    }
    appConfigAction.exec();
  }

  onResize(_, height: number) {
    this.setState({ height });
  }

  editor = () => {
    const { builderSupportModules, id, useDataSources, useDataSourcesEnabled, isInlineEditing } = this.props;
    let { config: { text, placeholder } } = this.props;
    placeholder = this.translateDefaultPlaceholder(placeholder);

    const Editor = builderSupportModules.widgetModules.Editor;
    return <Editor
      widgetId={id}
      useDataSources={useDataSourcesEnabled ? useDataSources : undefined}
      enabled={!!isInlineEditing}
      onEditorCreate={this.onEditorCreate}
      onEditorDestory={this.onEditorDestory}
      persistPartialConfig={this.persistPartialConfig}
      placeholder={placeholder}
      text={text}>
    </Editor>;
  }

  render() {
    const editable = this.isEditable();
    return <div
      css={this.getStyle(editable)}
      className={classNames('widget-text jimu-widget p-1')}>
      <ReactResizeDetector handleHeight onResize={this.onResize}></ReactResizeDetector>
      {editable && this.editor()}
      {!editable && this.displayer()}
    </div>;
  }
}
