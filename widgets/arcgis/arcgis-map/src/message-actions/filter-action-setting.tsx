/** @jsx jsx */
import {React, css, jsx, ActionSettingProps, SerializedStyles, ImmutableObject, DataSource, 
  themeUtils, ThemeVariables, polished, getAppStore, Immutable, 
  UseDataSource, DataSourceComponent, IMUseDataSource, IMFieldSchema, IMSqlExpression, 
  dataSourceUtils, DataSourceManager} from 'jimu-core';
import {Button, Icon, Switch, Collapse} from 'jimu-ui';
import {SettingSection, SettingRow} from 'jimu-ui/setting-components';
import {FieldSelector} from 'jimu-ui/data-source-selector';
import {ArcGISDataSourceTypes} from 'jimu-arcgis';
import {SelectedDataSourceJson, DataSourceSelector, AllDataSourceTypes} from 'jimu-ui/data-source-selector';
import { SqlExpressionBuilderPopup } from 'jimu-ui/sql-expression-builder';
import { SqlExpressionMode } from 'jimu-ui/sql-expression-runtime';
import defaultMessages from '../setting/translations/default';

interface ExtraProps {
  theme?: ThemeVariables;
}

interface States {
  isShowLayerList: boolean;
  currentLayerType: 'trigger' | 'action';
  isSqlExprShow: boolean;
}

interface Config {
  messageUseDataSource: UseDataSource;
  actionUseDataSource: UseDataSource;
  sqlExprObj?: IMSqlExpression;

  enabledDataRelationShip?: boolean;
}

export type IMConfig = ImmutableObject<Config>;

const DSSelectorTypes = Immutable([AllDataSourceTypes.FeatureLayer, AllDataSourceTypes.FeatureQuery]);

class _FilterActionSetting extends React.PureComponent<ActionSettingProps<IMConfig> & ExtraProps, States>{

  modalStyle: any = {position: 'absolute', top: '0', bottom: '0', width: '259px',
    height: 'auto', borderRight: '', borderBottom: '', paddingBottom: '1px'};

  constructor(props){
    super(props);

    this.modalStyle.borderRight = '1px solid black';
    this.modalStyle.borderBottom = '1px solid black';

    this.state = {
      isShowLayerList: false,
      currentLayerType: null,
      isSqlExprShow: false
    }
  }

  static defaultProps = {
    config: Immutable({
      messageUseDataSource: null,
      actionUseDataSource: null,
      sqlExprObj: null,
      enabledDataRelationShip: true
    })
  }

  getInitConfig = () => {
    const messageWidgetId = this.props.messageWidgetId;
    const config = getAppStore().getState().appStateInBuilder.appConfig;
    const messageWidgetJson = config.widgets[messageWidgetId];

    let messageUseDataSource: IMUseDataSource = null;
    let actionUseDataSource: IMUseDataSource = null;

    if (!this.props.config.messageUseDataSource) {
      if (messageWidgetJson && messageWidgetJson.useDataSources && messageWidgetJson.useDataSources[0] && messageWidgetJson.useDataSources.length === 1 ) {
        const dsJson = config.dataSources[messageWidgetJson.useDataSources[0].dataSourceId];
        if (dsJson && ((dsJson.type === ArcGISDataSourceTypes.WebMap) || (dsJson.type === ArcGISDataSourceTypes.WebScene))) {
          messageUseDataSource = null;
        } else {
          messageUseDataSource = Immutable({
            dataSourceId: messageWidgetJson.useDataSources[0].dataSourceId,
            rootDataSourceId: messageWidgetJson.useDataSources[0].rootDataSourceId
          });
        }
      }
    } else {
      messageUseDataSource = this.checkAndGetInitUseDataSource(this.props.messageWidgetId, this.props.config.messageUseDataSource);
    }

    const actionWidgetId = this.props.widgetId;
    const actionWidgetJson = config.widgets[actionWidgetId];

    if (!this.props.config.actionUseDataSource) {
      if (actionWidgetJson && actionWidgetJson.useDataSources && actionWidgetJson.useDataSources[0] && actionWidgetJson.useDataSources.length === 1 ) {
        const dsJson = config.dataSources[actionWidgetJson.useDataSources[0].dataSourceId];
        if (dsJson && ((dsJson.type === ArcGISDataSourceTypes.WebMap) || (dsJson.type === ArcGISDataSourceTypes.WebScene))) {
          actionUseDataSource = null;
        } else {
          actionUseDataSource = Immutable({
            dataSourceId: actionWidgetJson.useDataSources[0].dataSourceId,
            rootDataSourceId: actionWidgetJson.useDataSources[0].rootDataSourceId
          });
        }
      }
    } else {
      actionUseDataSource = this.checkAndGetInitUseDataSource(this.props.widgetId, this.props.config.actionUseDataSource);
    }

    const oldActionUseDataSourceId = this.props.config.actionUseDataSource && this.props.config.actionUseDataSource.dataSourceId;
    const newActionUseDataSourceId = actionUseDataSource && actionUseDataSource.dataSourceId;
    if (newActionUseDataSourceId !== oldActionUseDataSourceId) {
      return {
        messageUseDataSource: messageUseDataSource,
        actionUseDataSource: actionUseDataSource,
        sqlExprObj: null
      }
    } else {
      return {
        messageUseDataSource: messageUseDataSource,
        actionUseDataSource: actionUseDataSource,
        sqlExprObj: this.props.config.sqlExprObj
      }
    }
  }

  checkAndGetInitUseDataSource = (widgetId: string, oldUseDataSource: Immutable.ImmutableObject<UseDataSource>) => {
    const config = getAppStore().getState().appStateInBuilder.appConfig;
    const widgetJson = config.widgets[widgetId];
    let initUseDataSource = null;
    let isMapDs = false;

    const dsId = widgetJson.useDataSources && widgetJson.useDataSources[0] && widgetJson.useDataSources[0].dataSourceId;
    if (!dsId) {
      return null;
    }

    const dsJson = config.dataSources[dsId];
    if (dsJson && ((dsJson.type === ArcGISDataSourceTypes.WebMap) || (dsJson.type === ArcGISDataSourceTypes.WebScene))) {
      isMapDs = true;
    }

    if (isMapDs) {
      // webmap or webscene ds
      let isUseOldDs = false;
      if (widgetJson && widgetJson.useDataSources) {
        for (let i = 0; i < widgetJson.useDataSources.length; i++) {
          if (widgetJson.useDataSources[i].dataSourceId === oldUseDataSource.rootDataSourceId) {
            isUseOldDs = true;
            break;
          }
        }
      }

      if (isUseOldDs) {
        initUseDataSource = oldUseDataSource;
      } else {
        initUseDataSource = null;
      }
    } else {
      // featurelayer ds
      let isUseOldDs = false;
      if (widgetJson && widgetJson.useDataSources) {
        for (let i = 0; i < widgetJson.useDataSources.length; i++) {
          if (widgetJson.useDataSources[i].dataSourceId === oldUseDataSource.dataSourceId) {
            isUseOldDs = true;
            break;
          }
        }
      }

      if (isUseOldDs) {
        initUseDataSource = oldUseDataSource;
      } else {
        if (widgetJson && widgetJson.useDataSources && widgetJson.useDataSources.length === 1) {
          initUseDataSource = Immutable({
            dataSourceId: widgetJson.useDataSources[0].dataSourceId,
            rootDataSourceId: widgetJson.useDataSources[0].rootDataSourceId
          });
        } else {
          initUseDataSource = null;
        }
      }
    }

    return initUseDataSource;
  }

  componentDidMount() {
    const initConfig = this.getInitConfig();

    this.props.onSettingChange({
      actionId: this.props.actionId,
      config: this.props.config.set('messageUseDataSource', initConfig.messageUseDataSource)
        .set('actionUseDataSource', initConfig.actionUseDataSource).set('sqlExprObj', initConfig.sqlExprObj)
    });
  }

  getStyle (theme: ThemeVariables): SerializedStyles {
    return css`
      .setting-header {
        padding: ${polished.rem(10)} ${polished.rem(16)} ${polished.rem(0)} ${polished.rem(16)}
      }

      .deleteIcon {
        cursor: pointer;
        opacity: .8;
      }

      .deleteIcon:hover {
        opacity: 1;
      }

      .sql-expr-display {
        width: 100%;
        height: auto;
        min-height: 60px;
        line-height: 25px;
        padding: 3px 5px;
        color: ${theme.colors.palette.dark[300]};
        border: 1px solid ${theme.colors.palette.light[500]};
      }

      .relate-panel-left {
        flex: auto;
        .action-select-chooser {
          margin-top: ${polished.rem(12)};
        }
      }
    `;
  }

  handleTriggerLayerSelected = (allSelectedDss: SelectedDataSourceJson[], currentSelectedDs: SelectedDataSourceJson) => {
    const useDataSource: UseDataSource = {
      dataSourceId: currentSelectedDs.dataSourceJson.id,
      rootDataSourceId: currentSelectedDs.rootDataSourceId
    }
    this.props.onSettingChange({
      actionId: this.props.actionId,
      config: this.props.config.set('messageUseDataSource', useDataSource)
    })
  }

  handleActionLayerSelected = (allSelectedDss: SelectedDataSourceJson[], currentSelectedDs: SelectedDataSourceJson) => {
    const useDataSource: UseDataSource = {
      dataSourceId: currentSelectedDs.dataSourceJson.id,
      rootDataSourceId: currentSelectedDs.rootDataSourceId
    }
    this.props.onSettingChange({
      actionId: this.props.actionId,
      config: this.props.config.set('actionUseDataSource', useDataSource).set('sqlExprObj', null)
    })
  }

  handleRemoveLayerForTriggerLayer = () => {
    this.props.onSettingChange({
      actionId: this.props.actionId,
      config: this.props.config.set('messageUseDataSource', null)
    })
  }

  handleRemoveLayerForActionLayer = () => {
    this.props.onSettingChange({
      actionId: this.props.actionId,
      config: this.props.config.set('actionUseDataSource', null).set('sqlExprObj', null)
    })
  }

  showSqlExprPopup = () => {
    this.setState({isSqlExprShow: true});
  }

  toggleSqlExprPopup = () => {
    this.setState({isSqlExprShow: !this.state.isSqlExprShow});
  }

  onSqlExprBuilderChange = (sqlExprObj: IMSqlExpression) => {
    this.props.onSettingChange({
      actionId: this.props.actionId,
      config: this.props.config.set('sqlExprObj', sqlExprObj)
    })
  }

  onMessageFieldSelected = (allSelectedFields: IMFieldSchema[], field: IMFieldSchema, ds: DataSource) => {
    this.props.onSettingChange({
      actionId: this.props.actionId,
      config: this.props.config.set('messageUseDataSource', {
        dataSourceId: this.props.config.messageUseDataSource.dataSourceId,
        rootDataSourceId: this.props.config.messageUseDataSource.rootDataSourceId,
        fields: [field.jimuName]
      })
    })
  }

  onActionFieldSelected = (allSelectedFields: IMFieldSchema[], field: IMFieldSchema, ds: DataSource) => {
    this.props.onSettingChange({
      actionId: this.props.actionId,
      config: this.props.config.set('actionUseDataSource', {
        dataSourceId: this.props.config.actionUseDataSource.dataSourceId,
        rootDataSourceId: this.props.config.actionUseDataSource.rootDataSourceId,
        fields: [field.jimuName]
      })
    })
  }

  swicthEnabledDataRelationShip = (checked) => {
    this.props.onSettingChange({
      actionId: this.props.actionId,
      config: this.props.config.set('enabledDataRelationShip', checked)
    })
  }

  checkTrigerLayerIsSameToActionLayer = () => {
    if (this.props.config.messageUseDataSource && this.props.config.actionUseDataSource) {
      if (this.props.config.messageUseDataSource.dataSourceId === this.props.config.actionUseDataSource.dataSourceId &&
        this.props.config.messageUseDataSource.rootDataSourceId === this.props.config.actionUseDataSource.rootDataSourceId) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  getDsRootIdsByWidgetId = (wId: string) => {
    const appConfig = getAppStore().getState()?.appStateInBuilder?.appConfig;
    const widgetJson = appConfig?.widgets?.[wId]
    const rootIds = []
    const dsM = DataSourceManager.getInstance();
    widgetJson?.useDataSources?.forEach((useDS: ImmutableObject<UseDataSource>) => {
      const ds = dsM.getDataSource(useDS.dataSourceId)
      if (ds?.type === ArcGISDataSourceTypes.WebMap || ds?.type === ArcGISDataSourceTypes.WebScene) {//is root ds
        rootIds.push(useDS.dataSourceId)
      }
    })
    return rootIds.length > 0 ? Immutable(rootIds) : undefined
  }

  getDsIdsByWidgetId = (wId: string) => {
    const appConfig = getAppStore().getState()?.appStateInBuilder?.appConfig;
    const widgetJson = appConfig?.widgets?.[wId];
    return Immutable(widgetJson?.useDataSources?.map((useDS: ImmutableObject<UseDataSource>) => useDS.dataSourceId) ?? [])
  }

  getDsSelectorSourceData = (widgetId: string, useDataSource: Immutable.ImmutableObject<UseDataSource>) => {
    const appConfig = getAppStore().getState()?.appStateInBuilder?.appConfig;
    const widgetJson = appConfig?.widgets?.[widgetId];
    let isReadOnly = false;
    const dsRootIds = this.getDsRootIdsByWidgetId(widgetId);
    if (dsRootIds && dsRootIds.length === 0 && (widgetJson && widgetJson.useDataSources && widgetJson.useDataSources.length === 1)) {
      isReadOnly = true;
    }

    if (!dsRootIds && (widgetJson && widgetJson.useDataSources && widgetJson.useDataSources.length === 1)) {
      isReadOnly = true;
    }

    const selectedDataSourceIds = (useDataSource && useDataSource.dataSourceId) 
      ? Immutable([useDataSource.dataSourceId]) : Immutable([]);

    const fromDsIds = dsRootIds ? undefined : this.getDsIdsByWidgetId(widgetId);
    const dsSelectorSource = {
      isReadOnly: isReadOnly,
      selectedDataSourceIds: selectedDataSourceIds,
      fromRootDsIds: dsRootIds,
      fromDsIds: fromDsIds
    };

    return dsSelectorSource;
  }

  render(){
    const actionUseDataSourceInstance = this.props.config.actionUseDataSource 
      && DataSourceManager.getInstance().getDataSource(this.props.config.actionUseDataSource.dataSourceId);

    const { theme } = this.props;
    const triggerDsSelectorSourceData = this.getDsSelectorSourceData(this.props.messageWidgetId, this.props.config.messageUseDataSource);
    const actionDsSelectorSourceData = this.getDsSelectorSourceData(this.props.widgetId, this.props.config.actionUseDataSource);

    return <div css={this.getStyle(this.props.theme)}>
      <SettingSection title={this.props.intl.formatMessage({id: 'mapAction_TriggerLayer', defaultMessage: defaultMessages.mapAction_TriggerLayer})}>
        {<DataSourceSelector
          types={DSSelectorTypes}
          selectedDataSourceIds={triggerDsSelectorSourceData.selectedDataSourceIds}
          fromRootDsIds={triggerDsSelectorSourceData.fromRootDsIds}
          fromDsIds={triggerDsSelectorSourceData.fromDsIds}
          closeDataSourceListOnSelect={true}
          disableRemove={() => triggerDsSelectorSourceData.isReadOnly}
          disableDsList={triggerDsSelectorSourceData.isReadOnly}
          hideAddData={true}
          hideTypeDropdown={true}
          mustUseDataSource={true}
          onSelect={this.handleTriggerLayerSelected}
          onRemove={this.handleRemoveLayerForTriggerLayer}
        />}
      </SettingSection>
      <SettingSection title={this.props.intl.formatMessage({id: 'mapAction_ActionLayer', defaultMessage: defaultMessages.mapAction_ActionLayer})}>
        {<DataSourceSelector
          types={DSSelectorTypes}
          selectedDataSourceIds={actionDsSelectorSourceData.selectedDataSourceIds}
          fromRootDsIds={actionDsSelectorSourceData.fromRootDsIds}
          fromDsIds={actionDsSelectorSourceData.fromDsIds}
          closeDataSourceListOnSelect={true}
          disableRemove={() => actionDsSelectorSourceData.isReadOnly}
          disableDsList={actionDsSelectorSourceData.isReadOnly}
          hideAddData={true}
          hideTypeDropdown={true}
          mustUseDataSource={true}
          onSelect={this.handleActionLayerSelected}
          onRemove={this.handleRemoveLayerForActionLayer}
        />}
      </SettingSection>
      {this.props.config && this.props.config.messageUseDataSource && this.props.config.actionUseDataSource 
        && <SettingSection title={this.props.intl.formatMessage({id: 'mapAction_Conditions', defaultMessage: defaultMessages.mapAction_Conditions})}>
          <SettingRow label={this.props.intl.formatMessage({id: 'mapAction_RelateMessage', defaultMessage: defaultMessages.mapAction_RelateMessage})}>
            <Switch checked={this.props.config.enabledDataRelationShip} onChange={evt => {this.swicthEnabledDataRelationShip(evt.target.checked)}}/>
          </SettingRow>
          <SettingRow>
            <Collapse isOpen={this.props.config.enabledDataRelationShip} className="w-100">
              {this.checkTrigerLayerIsSameToActionLayer() &&
                  <div className="w-100 border p-1 mr-2">{this.props.intl.formatMessage({id: 'mapAction_AutoBind', defaultMessage: defaultMessages.mapAction_AutoBind})}</div>}
              {!this.checkTrigerLayerIsSameToActionLayer() && <div className="w-100 d-flex align-items-center">
                <div className="d-flex flex-column relate-panel-left">
                  <DataSourceComponent useDataSource={this.props.config.messageUseDataSource}>
                    {
                      (ds: DataSource) =>
                        <FieldSelector className="w-100"
                          dataSources={[ds]} isDataSourceDropDownHidden={true}
                          placeHolder={this.props.intl.formatMessage({id: 'mapAction_TriggerLayerField', defaultMessage: defaultMessages.mapAction_TriggerLayerField})}
                          onSelect={this.onMessageFieldSelected} useDropdown={true} isSearchInputHidden={true}
                          selectedFields={this.props.config.messageUseDataSource && this.props.config.messageUseDataSource.fields
                            ? this.props.config.messageUseDataSource.fields : Immutable([])} />
                    }
                  </DataSourceComponent>
                  <DataSourceComponent useDataSource={this.props.config.actionUseDataSource}>
                    {
                      (ds: DataSource) =>
                        <FieldSelector className="w-100 action-select-chooser"
                          placeHolder={this.props.intl.formatMessage({id: 'mapAction_ActionLayerField', defaultMessage: defaultMessages.mapAction_ActionLayerField})}
                          dataSources={[ds]} isDataSourceDropDownHidden={true}
                          onSelect={this.onActionFieldSelected} useDropdown={true} isSearchInputHidden={true}
                          selectedFields={this.props.config.actionUseDataSource && this.props.config.actionUseDataSource.fields
                            ? this.props.config.actionUseDataSource.fields : Immutable([])} />
                    }
                  </DataSourceComponent>
                </div>
                <Icon className="flex-none" width={12} height={40} color={theme.colors.dark[400]} icon={require('jimu-ui/lib/icons/link-combined.svg')} ></Icon>
              </div>}
            </Collapse>
          </SettingRow>
          <SettingRow>
            <Button type="link" disabled={!this.props.config.actionUseDataSource} className="w-100 d-flex justify-content-start" onClick={this.showSqlExprPopup}>
              <div className="w-100 text-truncate" style={{textAlign: 'start'}}>
                {this.props.intl.formatMessage({id: 'mapAction_MoreConditions', defaultMessage: defaultMessages.mapAction_MoreConditions})}
              </div>
            </Button>
            {this.props.config.actionUseDataSource && <DataSourceComponent useDataSource={this.props.config.actionUseDataSource}>{(ds) => {
              return <SqlExpressionBuilderPopup selectedDs={ds} mode={SqlExpressionMode.Simple}
                isOpen={this.state.isSqlExprShow} toggle={this.toggleSqlExprPopup}
                config = {this.props.config.sqlExprObj} onChange={(sqlExprObj) => {this.onSqlExprBuilderChange(sqlExprObj)}}
                id="filter-widget-sql-expression-builder-popup" />
            }}</DataSourceComponent>}
          </SettingRow>
          <SettingRow>
            <div className="sql-expr-display">
              {this.props.config.sqlExprObj && actionUseDataSourceInstance
                ? dataSourceUtils.getArcGISSQL(this.props.config.sqlExprObj, actionUseDataSourceInstance, this.props.intl).displaySQL 
                : this.props.intl.formatMessage({id: 'mapAction_SetExpression', defaultMessage: defaultMessages.mapAction_SetExpression})}
            </div>
          </SettingRow>
        </SettingSection>}
    </div>
  }
}

export default themeUtils.withTheme(_FilterActionSetting);