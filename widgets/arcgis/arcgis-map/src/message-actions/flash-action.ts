import { AbstractMessageAction, MessageType, Message, getAppStore, appActions, FieldSchema,
  DataRecordsSelectionChangeMessage, DataSourceManager, FeatureQueryDataSource, ImmutableObject, dataSourceUtils } from 'jimu-core';
import { FeatureLayerDataSource } from 'jimu-arcgis';
import {IMConfig} from '../message-actions/flash-action-setting';

export default class FlashAction extends AbstractMessageAction{
  filterMessageType(messageType: MessageType, messageWidgetId?: string): boolean{
    return messageType === MessageType.DataRecordsSelectionChange;
  }

  filterMessage(message: Message): boolean{
    return true;
  }

  getSettingComponentUri(messageType: MessageType, messageWidgetId?: string): string {
    return 'message-actions/flash-action-setting';
  }

  onExecute(message: Message, actionConfig?: IMConfig): Promise<boolean> | boolean{
    switch(message.type) {
      case MessageType.DataRecordsSelectionChange:
        let flashActionValue: {layerId: string, querySQL: string} = null;
        if (actionConfig) {
          if (actionConfig.messageUseDataSource && actionConfig.actionUseDataSource) {
            if ((message as DataRecordsSelectionChangeMessage).records.length > 0 
              && (message as DataRecordsSelectionChangeMessage).records[0].dataSource.id !== actionConfig.messageUseDataSource.dataSourceId) {
              getAppStore().dispatch(appActions.widgetMutableStatePropChange(this.widgetId, 'flashActionValue', null));
              break;
            }

            const messageDataSource = DataSourceManager.getInstance().getDataSource(actionConfig.messageUseDataSource.dataSourceId);
            const actionDataSource = DataSourceManager.getInstance().getDataSource(actionConfig.actionUseDataSource.dataSourceId);

            if (messageDataSource && actionDataSource) {
              // when ds instances exit
              if (actionConfig.enabledDataRelationShip) {
                // use DataRelationShip
                let messageField: ImmutableObject<FieldSchema> = null;
                let actionField: ImmutableObject<FieldSchema> = null;

                if (actionConfig.messageUseDataSource.dataSourceId === actionConfig.actionUseDataSource.dataSourceId &&
                  actionConfig.messageUseDataSource.rootDataSourceId === actionConfig.actionUseDataSource.rootDataSourceId) {
                  // if trigger ds is same to action ds
                  const messageDsSchema = messageDataSource.getSchema();
                  const objectIdJimuFieldName = messageDsSchema && messageDsSchema.fields 
                    && Object.keys(messageDsSchema.fields).find(jimuFieldName => messageDsSchema.fields[jimuFieldName].esriType === 'esriFieldTypeOID');
                  messageField = messageDsSchema && messageDsSchema.fields && messageDsSchema.fields[objectIdJimuFieldName];
                  actionField = messageField;
                } else {
                  // if trigger ds isn't same to action ds
                  const messageJimuFieldName = actionConfig.messageUseDataSource.fields[0];
                  const actionJimuFieldName = actionConfig.actionUseDataSource.fields[0];
                  messageField = messageDataSource.getSchema().fields[messageJimuFieldName];
                  actionField = actionDataSource.getSchema().fields[actionJimuFieldName];
                }

                let whereSql = '';
                if (messageField && actionField) {
                  const messageFieldName = messageField.name;
                  const messageFieldType = messageField.type;

                  const tempMessage: DataRecordsSelectionChangeMessage = message as DataRecordsSelectionChangeMessage;
                  const messageFieldValues = [];

                  for (let i = 0; i < tempMessage.records.length; i++) {
                    const tempFieldValue = tempMessage.records[i].getData()[messageFieldName];
                    if (messageFieldValues.indexOf(`${this.formatValue(tempFieldValue, messageFieldType)}`) > -1) {
                      continue;
                    } else {
                      messageFieldValues.push(`${this.formatValue(tempMessage.records[i].getData()[messageFieldName], messageFieldType)}`);
                    }
                  }

                  whereSql = `${actionField.name} IN `;

                  if (messageFieldValues.length > 0) {
                    whereSql = whereSql + `(${messageFieldValues.join(', ')})`;
                  } else {
                    whereSql = '';
                  }
                }

                if ((message as DataRecordsSelectionChangeMessage).records.length > 0) {
                  const moreAditionSQL = actionConfig.sqlExprObj ? dataSourceUtils.getArcGISSQL(actionConfig.sqlExprObj, actionDataSource).sql : null;
                  if (moreAditionSQL) {
                    if (whereSql) {
                      whereSql = whereSql + ' AND ' + moreAditionSQL;
                    } else {
                      whereSql = moreAditionSQL;
                    }
                  }
                } else {
                  whereSql = '';
                }

                const query = {
                  outFields: ['*'],
                  where: whereSql,
                  returnGeometry: true
                };

                const realQuery = (actionDataSource as FeatureLayerDataSource | FeatureQueryDataSource).getRealQueryParams(query, 'query');

                flashActionValue = {
                  layerId: this.getLayerIdFromLayerDs(actionDataSource as FeatureLayerDataSource | FeatureQueryDataSource),
                  querySQL: realQuery && realQuery.where
                }
              } else {
                // not use DataRelationShip
                let whereSql = '';

                if ((message as DataRecordsSelectionChangeMessage).records.length > 0) {
                  const moreAditionSQL = actionConfig.sqlExprObj ? dataSourceUtils.getArcGISSQL(actionConfig.sqlExprObj, actionDataSource).sql : null;
                  if (moreAditionSQL) {
                    whereSql = moreAditionSQL;
                  }
                } else {
                  whereSql = '';
                }

                const query = {
                  outFields: ['*'],
                  where: whereSql,
                  returnGeometry: true
                };

                const realQuery = (actionDataSource as FeatureLayerDataSource | FeatureQueryDataSource).getRealQueryParams(query, 'query');

                flashActionValue = {
                  layerId: this.getLayerIdFromLayerDs(actionDataSource as FeatureLayerDataSource | FeatureQueryDataSource),
                  querySQL: realQuery && realQuery.where
                }
              }
            } else {
              // when ds instances don't exist
              flashActionValue = null;
            }
          } else {
            flashActionValue = null;
          }
        }

        getAppStore().dispatch(appActions.widgetMutableStatePropChange(this.widgetId, 'flashActionValue', flashActionValue));
        break;
    }

    return true;
  }

  getLayerIdFromLayerDs(ds: FeatureLayerDataSource | FeatureQueryDataSource) {
    if ((ds as any).layerId) {
      return (ds as FeatureQueryDataSource).layerId;
    } else if ((ds as any).layer) {
      return (ds as FeatureLayerDataSource).layer.id;
    } else {
      return null;
    }
  }

  formatValue (value, type: string) {
    if (type === 'STRING') {
      return `'${value}'`;
    } else if (type === 'NUMBER') {
      return `${value}`;
    } else if (type === 'DATE') {
      return `'${value}'`;
    }
  }
}