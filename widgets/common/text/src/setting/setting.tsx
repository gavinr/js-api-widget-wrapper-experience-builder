import { React, Immutable, IMState, UseDataSource, ThemeVariables } from 'jimu-core';
import {
  BaseWidgetSetting, AllWidgetSettingProps, defaultMessages as jimuForBuilderMessages
} from 'jimu-for-builder';
import { SettingRow, SettingSection } from 'jimu-ui/setting-components';
import { Editor, Formats as FormatsValue } from 'jimu-ui/rich-text-editor'
import { IMConfig, Style } from '../config';
import { Switch, defaultMessages as jimuUiMessage } from 'jimu-ui';
import { DataSourceSelector, AllDataSourceTypes, SelectedDataSourceJson } from 'jimu-ui/data-source-selector';
import { Formats } from './editor-plugins/formats';
import { ClearFormats } from './editor-plugins/clear-formats';
import { mixinFormats } from '../utils';
import defaultMessages from './translations/default';


interface State {
  editor: Editor;
}

interface ExtraProps {
  appTheme: ThemeVariables;
  isInlineEditing?: boolean;
  mutableStateVersion?: number;
}

export default class Setting extends BaseWidgetSetting<AllWidgetSettingProps<IMConfig> & ExtraProps, State>{
  supportedTypes = Immutable([AllDataSourceTypes.FeatureLayer, AllDataSourceTypes.FeatureQuery]);

  static mapExtraStateProps = (state: IMState, ownProps: AllWidgetSettingProps<IMConfig>) => {
    const appStateInBuilder = state && state.appStateInBuilder;
    const stateVersion = appStateInBuilder && appStateInBuilder.widgetsMutableStateVersion && appStateInBuilder.widgetsMutableStateVersion[ownProps.id];

    const widgetRuntimeInfo = appStateInBuilder && appStateInBuilder.widgetsRuntimeInfo && appStateInBuilder.widgetsRuntimeInfo[ownProps.id]

    return {
      appTheme: appStateInBuilder.theme,
      isInlineEditing: widgetRuntimeInfo && widgetRuntimeInfo.isInlineEditing,
      mutableStateVersion: stateVersion
    }
  };
  mutableStoreManager: any;

  constructor(props) {
    super(props);
    this.state = {
      editor: null
    }
    this.mutableStoreManager = window._appWindow._mutableStoreManager;
    this.getDataSourceIds = this.getDataSourceIds.bind(this);
  }

  componentDidMount() {
    const editor = this.mutableStoreManager ? this.mutableStoreManager.getStateValue([this.props.id, 'editor']) : null;
    this.setState({ editor });
  }

  componentDidUpdate(prevProps: AllWidgetSettingProps<IMConfig> & ExtraProps) {
    const { mutableStateVersion } = this.props;
    if (mutableStateVersion !== prevProps.mutableStateVersion) {
      const editor = this.mutableStoreManager ? this.mutableStoreManager.getStateValue([this.props.id, 'editor']) : null;
      this.setState({ editor });
    }
  }

  mixinFormats = (formats: FormatsValue = {}): FormatsValue => {
    const { appTheme } = this.props;
    formats = mixinFormats(appTheme, formats);
    return formats
  }

  private getDataSourceIds() {
    const { useDataSources, useDataSourcesEnabled } = this.props;
    if (!useDataSourcesEnabled || !useDataSources) return;
    return Immutable(useDataSources.map(ds => ds.dataSourceId));
  }

  editWidgetConfig = (config: IMConfig) => {
    this.props.onSettingChange({
      id: this.props.id,
      config
    });
  }

  onToggleUseDataEnabled = (useDataSourcesEnabled: boolean) => {
    this.props.onSettingChange({
      id: this.props.id,
      useDataSourcesEnabled
    });
  }

  onDataSourceSelected = (allSelectedDss: SelectedDataSourceJson[], currentSelectedDs?: SelectedDataSourceJson) => {
    if (!allSelectedDss) {
      return;
    }
    const useDataSources: UseDataSource[] = allSelectedDss.map(ds => ({
      dataSourceId: ds.dataSourceJson && ds.dataSourceJson.id,
      rootDataSourceId: ds.rootDataSourceId
    }));

    this.props.onSettingChange({
      id: this.props.id,
      useDataSources: useDataSources
    });
  }

  onDataSourceRemoved = (allSelectedDss: SelectedDataSourceJson[], currentRemovedDs?: SelectedDataSourceJson) => {
    if (!currentRemovedDs || !currentRemovedDs.dataSourceJson) {
      return;
    }

    this.props.onSettingChange({
      id: this.props.id,
      useDataSources: this.props.useDataSources.filter(ds => ds && ds.dataSourceId !== currentRemovedDs.dataSourceJson.id).asMutable({ deep: true })
    });
  }

  onStyleChange = (key: string, value: any) => {
    const { config } = this.props;
    this.editWidgetConfig(config.setIn(['style', key], value));
  }

  translate = (id: string, jimu?: boolean) => {
    const { intl } = this.props;
    const message = jimu ? jimuForBuilderMessages : defaultMessages;
    return intl ? intl.formatMessage({ id: id, defaultMessage: message[id] }) : id;
  }

  render() {
    const { isInlineEditing, config: { style = {} as Style } } = this.props;
    const { wrap } = style
    return <div className="widget-setting-text jimu-widget-setting">
      <SettingSection>
        <SettingRow>
          <DataSourceSelector isMultiple={true} selectedDataSourceIds={this.getDataSourceIds()}
            types={this.supportedTypes} useDataSourcesEnabled={this.props.useDataSourcesEnabled} onToggleUseDataEnabled={this.onToggleUseDataEnabled}
            onSelect={this.onDataSourceSelected} onRemove={this.onDataSourceRemoved}
          />
        </SettingRow>
      </SettingSection>
      <SettingSection>

        <SettingRow flow="no-wrap" label={this.translate('wrap')}>
          <Switch checked={wrap} onChange={() => this.onStyleChange('wrap', !wrap)}></Switch>
        </SettingRow>
      </SettingSection>

      {!!this.state.editor && <SettingSection>
        <SettingRow flow="no-wrap" label={this.props.intl.formatMessage({ id: 'textFormat', defaultMessage: jimuUiMessage['textFormat'] })}>
          <ClearFormats
            quillEnabled={isInlineEditing}
            source={isInlineEditing ? 'user' : 'api'}
            editor={this.state.editor}
          ></ClearFormats>
        </SettingRow>

        <SettingRow>
          <Formats
            quillEnabled={isInlineEditing}
            source={isInlineEditing ? 'user' : 'api'}
            editor={this.state.editor}
            mixFormats={this.mixinFormats}
            dataSourceIds={this.getDataSourceIds()} />
        </SettingRow>
      </SettingSection>}
    </div>
  }
}