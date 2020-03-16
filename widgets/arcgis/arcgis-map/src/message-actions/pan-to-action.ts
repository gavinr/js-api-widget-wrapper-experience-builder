import { AbstractMessageAction, MessageType, Message, getAppStore, appActions, DataRecordSetCreateMessage, DataRecordSetUpdateMessage, 
  DataRecordsSelectionChangeMessage, ExtentChangeMessage, FeatureDataRecord as FeatureQueryDataRecord } from 'jimu-core';
import { FeatureDataRecord as FeatureLayerDataRecord, loadArcGISJSAPIModules } from 'jimu-arcgis';
import {handleFeature} from '../runtime/utils';
import {IMConfig} from './pan-to-action-setting';

export default class PanToAction extends AbstractMessageAction{
  filterMessageType(messageType: MessageType, messageWidgetId?: string): boolean{
    return messageType === MessageType.DataRecordSetCreate || messageType === MessageType.DataRecordSetUpdate 
      || messageType === MessageType.DataRecordsSelectionChange || messageType === MessageType.ExtentChange;
  }

  filterMessage(message: Message): boolean{
    return true;
  }

  getSettingComponentUri(messageType: MessageType, messageWidgetId?: string): string {
    const config = getAppStore().getState().appStateInBuilder ? getAppStore().getState().appStateInBuilder.appConfig : getAppStore().getState().appConfig;
    const messageWidgetJson = config.widgets[messageWidgetId];
    if (messageWidgetJson.manifest.label === 'Map') {
      if (messageType === MessageType.DataRecordsSelectionChange) {
        return 'message-actions/pan-to-action-setting';
      } else {
        return null;
      }
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
              const dataRecordFeature = (dataRecordSetCreateMessage.dataRecordSet.records[i] as 
                (FeatureQueryDataRecord | FeatureLayerDataRecord)).feature;
              if (dataRecordFeature) {
                features.push(handleFeature(dataRecordFeature, Graphic).geometry);
              }
            }
  
            newFeatureSet = {
              features: features
            } as __esri.FeatureSet
          }
  
          getAppStore().dispatch(appActions.widgetMutableStatePropChange(this.widgetId, 'panToActionValue.value', newFeatureSet));
          break;
        case MessageType.DataRecordSetUpdate:
          const dataRecordSetUpdateMessage = message as DataRecordSetUpdateMessage;
  
          let updateFeatureSet = {};
          if (dataRecordSetUpdateMessage.dataRecordSet && dataRecordSetUpdateMessage.dataRecordSet.records) {
            const features = [];
            for (let i = 0; i < dataRecordSetUpdateMessage.dataRecordSet.records.length; i++) {
              const dataRecordFeature = (dataRecordSetUpdateMessage.dataRecordSet.records[i] as 
                (FeatureQueryDataRecord | FeatureLayerDataRecord)).feature;
              if (dataRecordFeature) {
                features.push(handleFeature(dataRecordFeature, Graphic).geometry);
              }
            }
  
            updateFeatureSet = {
              features: features
            } as __esri.FeatureSet
          }
  
          getAppStore().dispatch(appActions.widgetMutableStatePropChange(this.widgetId, 'panToActionValue.value', updateFeatureSet));
          break;
        case MessageType.DataRecordsSelectionChange:
          if (actionConfig) {
            const dataRecordsSelectionChangeMessage = message as DataRecordsSelectionChangeMessage;
  
            let selectionFeatureSet = {};
            const selectFeatures = [];
            if (dataRecordsSelectionChangeMessage.records) {
              if (dataRecordsSelectionChangeMessage.records[0]) {
                if (!actionConfig.useDataSource || (dataRecordsSelectionChangeMessage.records[0].dataSource.id !== actionConfig.useDataSource.dataSourceId)) {
                  break;
                }
              }

              for (let i = 0; i < dataRecordsSelectionChangeMessage.records.length; i++) {
                const dataRecordFeature = (dataRecordsSelectionChangeMessage.records[i] as 
                  (FeatureQueryDataRecord | FeatureLayerDataRecord)).feature;
                if (dataRecordFeature) {
                  selectFeatures.push(handleFeature(dataRecordFeature, Graphic).geometry);
                }
              }
            }
    
            selectionFeatureSet = {
              features: selectFeatures
            }
  
            getAppStore().dispatch(appActions.widgetMutableStatePropChange(this.widgetId, 'panToActionValue.value', selectionFeatureSet));
            break;
          } else {
            const dataRecordsSelectionChangeMessage = message as DataRecordsSelectionChangeMessage;
  
            let selectionFeatureSet = {};
            const selectFeatures = [];
            if (dataRecordsSelectionChangeMessage.records) {
              for (let i = 0; i < dataRecordsSelectionChangeMessage.records.length; i++) {
                const dataRecordFeature = (dataRecordsSelectionChangeMessage.records[i] as 
                  (FeatureQueryDataRecord | FeatureLayerDataRecord)).feature;
                if (dataRecordFeature) {
                  selectFeatures.push(handleFeature(dataRecordFeature, Graphic).geometry);
                }
              }
            }
  
            selectionFeatureSet = {
              features: selectFeatures
            }
    
            getAppStore().dispatch(appActions.widgetMutableStatePropChange(this.widgetId, 'panToActionValue.value', selectionFeatureSet));
            break;
          }
        case MessageType.ExtentChange:
          const extentChangeMessage = message as ExtentChangeMessage;
  
          if (extentChangeMessage.getRelatedWidgetIds().indexOf(this.widgetId) > -1) {
            break;
          }

          const extentValue = {
            features: [extentChangeMessage.extent]
          }
  
          const panToFeatureActionValue = {
            value: extentValue,
            relatedWidgets: extentChangeMessage.getRelatedWidgetIds()
          }
          getAppStore().dispatch(appActions.widgetMutableStatePropChange(this.widgetId, 'panToActionValue', panToFeatureActionValue));
          break;
      }
      return true;
    })
  }
}