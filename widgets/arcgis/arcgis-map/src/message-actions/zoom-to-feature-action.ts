import { AbstractMessageAction, MessageType, Message, getAppStore, appActions, DataRecordSetCreateMessage, DataRecordSetUpdateMessage, 
  DataRecordsSelectionChangeMessage, FeatureDataRecord, ExtentChangeMessage } from 'jimu-core';
import { loadArcGISJSAPIModules } from 'jimu-arcgis'
import {handleFeature} from '../runtime/utils';
import {IMConfig} from './zoom-to-feature-action-setting';

export default class ZoomToFeatureAction extends AbstractMessageAction{
  NoLockTriggerLayerWidgets = ['Map'];

  filterMessageType(messageType: MessageType, messageWidgetId?: string): boolean{
    return messageType === MessageType.DataRecordSetCreate || messageType === MessageType.DataRecordSetUpdate 
      || messageType === MessageType.DataRecordsSelectionChange || messageType === MessageType.ExtentChange;
  }

  filterMessage(message: Message): boolean{
    return true;
  }

  getSettingComponentUri(messageType: MessageType, messageWidgetId?: string): string {
    if (messageType === MessageType.DataRecordsSelectionChange) {
      return 'message-actions/zoom-to-feature-action-setting';
    } else {
      return null;
    }
  }

  onExecute(message: Message, actionConfig?: IMConfig): Promise<boolean> | boolean{
    return loadArcGISJSAPIModules(['esri/Graphic']).then(modules => {
      let Graphic: __esri.GraphicConstructor = null;
      [Graphic] = modules;

      switch(message.type){
        case MessageType.DataRecordSetCreate:
          const dataRecordSetCreateMessage = message as DataRecordSetCreateMessage;
  
          let newFeatureSet = {};
          if (dataRecordSetCreateMessage.dataRecordSet && dataRecordSetCreateMessage.dataRecordSet.records) {
            const features = [];
            for (let i = 0; i < dataRecordSetCreateMessage.dataRecordSet.records.length; i++) {
              if ((dataRecordSetCreateMessage.dataRecordSet.records[i] as FeatureDataRecord).feature) {
                features.push(handleFeature((dataRecordSetCreateMessage.dataRecordSet.records[i] as 
                  FeatureDataRecord).feature, Graphic));
              }
            }
  
            newFeatureSet = {
              features: features,
              type: 'zoom-to-graphics'
            }
          }
  
          getAppStore().dispatch(appActions.widgetMutableStatePropChange(this.widgetId, 'zoomToFeatureActionValue.value', newFeatureSet));
          break;
        case MessageType.DataRecordSetUpdate:
          const dataRecordSetUpdateMessage = message as DataRecordSetUpdateMessage;
  
          let updateFeatureSet = {};
          if (dataRecordSetUpdateMessage.dataRecordSet && dataRecordSetUpdateMessage.dataRecordSet.records) {
            const features = [];
            for (let i = 0; i < dataRecordSetUpdateMessage.dataRecordSet.records.length; i++) {
              if ((dataRecordSetUpdateMessage.dataRecordSet.records[i] as FeatureDataRecord).feature) {
                features.push(handleFeature((dataRecordSetUpdateMessage.dataRecordSet.records[i] as 
                  FeatureDataRecord).feature, Graphic));
              }
            }
  
            updateFeatureSet = {
              features: features,
              type: 'zoom-to-graphics'
            }
          }
  
          getAppStore().dispatch(appActions.widgetMutableStatePropChange(this.widgetId, 'zoomToFeatureActionValue.value', updateFeatureSet));
          break;
        case MessageType.DataRecordsSelectionChange:
          const config = getAppStore().getState().appConfig;
          const messageWidgetJson = config.widgets[message.widgetId];
          const messageWidgetLabel = messageWidgetJson.manifest.label;
          if (actionConfig) {
            const dataRecordsSelectionChangeMessage = message as DataRecordsSelectionChangeMessage;
  
            let selectionFeatureSet = {};
            const selectFeatures = [];

            let layerId = null;
            if (dataRecordsSelectionChangeMessage.records) {
              if (dataRecordsSelectionChangeMessage.records[0]) {
                if ((dataRecordsSelectionChangeMessage.records[0].dataSource as any).layer) {
                  layerId = (dataRecordsSelectionChangeMessage.records[0].dataSource as any).layer.id;
                }

                if (this.NoLockTriggerLayerWidgets.indexOf(messageWidgetLabel) > -1) {
                  if (!actionConfig.useDataSource || (dataRecordsSelectionChangeMessage.records[0].dataSource.id !== actionConfig.useDataSource.dataSourceId)) {
                    break;
                  }
                }
              }

              for (let i = 0; i < dataRecordsSelectionChangeMessage.records.length; i++) {
                if ((dataRecordsSelectionChangeMessage.records[i] as FeatureDataRecord).feature) {
                  selectFeatures.push(handleFeature((dataRecordsSelectionChangeMessage.records[i] as 
                    FeatureDataRecord).feature, Graphic));
                }
              }
            }
    
            selectionFeatureSet = {
              features: selectFeatures,
              layerId: layerId,
              zoomToOption: actionConfig && actionConfig.isUseCustomZoomToOption && actionConfig.zoomToOption.scale ? actionConfig.zoomToOption : null,
              type: 'zoom-to-graphics'
            }
  
            getAppStore().dispatch(appActions.widgetMutableStatePropChange(this.widgetId, 'zoomToFeatureActionValue.value', selectionFeatureSet));
            break;
          } else {
            const dataRecordsSelectionChangeMessage = message as DataRecordsSelectionChangeMessage;
  
            let selectionFeatureSet = {};
            const selectFeatures = [];
            let layerId = null;
            if (dataRecordsSelectionChangeMessage.records) {
              if (dataRecordsSelectionChangeMessage.records[0]) {
                if ((dataRecordsSelectionChangeMessage.records[0].dataSource as any).layer) {
                  layerId = (dataRecordsSelectionChangeMessage.records[0].dataSource as any).layer.id;
                }

                if (this.NoLockTriggerLayerWidgets.indexOf(messageWidgetLabel) > -1) {
                  if (!actionConfig.useDataSource || (dataRecordsSelectionChangeMessage.records[0].dataSource.id !== actionConfig.useDataSource.dataSourceId)) {
                    break;
                  }
                }
              }

              for (let i = 0; i < dataRecordsSelectionChangeMessage.records.length; i++) {
                if ((dataRecordsSelectionChangeMessage.records[i] as FeatureDataRecord).feature) {
                  selectFeatures.push(handleFeature((dataRecordsSelectionChangeMessage.records[i] as 
                    FeatureDataRecord).feature, Graphic));
                }
              }
            }
    
            selectionFeatureSet = {
              features: selectFeatures,
              layerId: layerId,
              zoomToOption: null,
              type: 'zoom-to-graphics'
            }
  
            getAppStore().dispatch(appActions.widgetMutableStatePropChange(this.widgetId, 'zoomToFeatureActionValue.value', selectionFeatureSet));
            break;
          }
        case MessageType.ExtentChange:
          const extentChangeMessage = message as ExtentChangeMessage;
          if (extentChangeMessage.getRelatedWidgetIds().indexOf(this.widgetId) > -1) {
            break;
          }

          const extentValue = {
            features: [extentChangeMessage.extent],
            type: 'zoom-to-extent'
          }
  
          const zoomToFeatureActionValue = {
            value: extentValue,
            relatedWidgets: extentChangeMessage.getRelatedWidgetIds()
          }
          getAppStore().dispatch(appActions.widgetMutableStatePropChange(this.widgetId, 'zoomToFeatureActionValue', zoomToFeatureActionValue));
          break;
      }
  
      return true;
    });
  }
}