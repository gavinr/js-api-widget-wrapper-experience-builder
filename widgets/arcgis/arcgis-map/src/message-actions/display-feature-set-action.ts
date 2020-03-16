import { AbstractMessageAction, MessageType, Message, getAppStore, appActions, DataRecordSetUpdateMessage, DataRecordSetCreateMessage, 
  MutableStoreManager, FeatureDataRecord as FeatureQueryDataRecord, DataSourceTypes, DataSource, FeatureQueryDataSource } from 'jimu-core';
import { FeatureDataRecord as FeatureLayerDataRecord, loadArcGISJSAPIModules } from 'jimu-arcgis';

export default class DisplayFeatureSetAction extends AbstractMessageAction{
  filterMessageType(messageType: MessageType, messageWidgetId?: string): boolean{
    return messageType === MessageType.DataRecordSetUpdate || messageType === MessageType.DataRecordSetCreate;
  }

  filterMessage(message: Message): boolean{
    return true;
  }

  onExecute(message: Message, actionConfig?: any): Promise<boolean> | boolean{
    const dataRecordSetMessage: DataRecordSetCreateMessage | DataRecordSetUpdateMessage = 
      message as DataRecordSetCreateMessage | DataRecordSetUpdateMessage;

    if (dataRecordSetMessage.dataRecordSet && dataRecordSetMessage.dataRecordSet.records) {
      const datasource: DataSource = dataRecordSetMessage.dataRecordSet.records[0] 
        && dataRecordSetMessage.dataRecordSet.records[0].dataSource;
      if (datasource.type === DataSourceTypes.FeatureQuery) {
        return loadArcGISJSAPIModules(['esri/renderers/support/jsonUtils', 'esri/layers/support/Field', 'esri/Graphic']).then(modules => {
          let jsonUtils: __esri.jsonUtils = null;
          let Field: __esri.FieldConstructor = null;
          let Graphic: __esri.GraphicConstructor = null;
          [jsonUtils, Field, Graphic] = modules;
          const layer = {
            title: datasource.label,
            renderer: jsonUtils.fromJSON((datasource as FeatureQueryDataSource).getLayerDefinition().drawingInfo.renderer),
            fields: (datasource as FeatureQueryDataSource).getLayerDefinition().fields.map((field) => {return Field.fromJSON(field)})
          }
          return this.handleMessage(message, layer, Graphic);
        });
      } else {
        return this.handleMessage(message);
      }
    } else {
      return true;
    }
  }

  handleMessage(message: Message, layer?: any, Graphic?: __esri.GraphicConstructor): Promise<boolean> | boolean {
    switch(message.type){
      case MessageType.DataRecordSetCreate:
        const dataRecordSetCreateMessage = message as DataRecordSetCreateMessage;
        const createdLayerId = `${message.widgetId}-${dataRecordSetCreateMessage.dataRecordSetId}`;
        const newFeatureSetActionValue = MutableStoreManager.getInstance().getStateValue([this.widgetId, 
          'newFeatureSetActionValue', 'value', `${createdLayerId}`]);
                
        if (!newFeatureSetActionValue) {
          let featureSet = {};

          if (dataRecordSetCreateMessage.dataRecordSet && dataRecordSetCreateMessage.dataRecordSet.records) {
            const features = [];

            for (let i = 0; i < dataRecordSetCreateMessage.dataRecordSet.records.length; i++) {
              const dataRecordFeature = (dataRecordSetCreateMessage.dataRecordSet.records[i] as 
                (FeatureQueryDataRecord | FeatureLayerDataRecord)).feature;
              if (dataRecordFeature) {
                let tempFeature = null;
                if ((dataRecordFeature as any).clone) {
                  tempFeature = (dataRecordFeature as any).clone();
                } else {
                  tempFeature = Graphic.fromJSON(Object.assign({}, dataRecordFeature));
                  tempFeature.attributes = Object.assign({}, dataRecordFeature.attributes);
                }

                if (layer) {
                  (tempFeature as any).layer = layer;
                }

                features.push(tempFeature);
              }
            }

            featureSet = {
              features: features
            } as __esri.FeatureSet
          }

          getAppStore().dispatch(appActions.widgetMutableStatePropChange(this.widgetId, 
            `newFeatureSetActionValue.value.${createdLayerId}`, featureSet));

          const promise: Promise<any> = MutableStoreManager.getInstance().getStateValue([this.widgetId, 
            'newFeatureSetActionValue', 'promise']);
          return Promise.all([promise]).then(() => {
            const tempPromise: Promise<any> = MutableStoreManager.getInstance().getStateValue([this.widgetId, 
              'newFeatureSetActionValue', 'promise']);
            return Promise.all([tempPromise]).then(() => {
              return true;
            })
          }, () => {
            return true;
          })
        }
      case MessageType.DataRecordSetUpdate:
        const dataRecordSetUpdateMessage = message as DataRecordSetUpdateMessage;
        const changedLayerId = `${message.widgetId}-${dataRecordSetUpdateMessage.dataRecordSetId}`;

        let featureSet = {};

        if (dataRecordSetUpdateMessage.dataRecordSet && dataRecordSetUpdateMessage.dataRecordSet.records) {
          const features = [];

          for (let i = 0; i < dataRecordSetUpdateMessage.dataRecordSet.records.length; i++) {
            const dataRecordFeature = (dataRecordSetUpdateMessage.dataRecordSet.records[i] as 
              (FeatureQueryDataRecord | FeatureLayerDataRecord)).feature;
            if (dataRecordFeature) {
              let tempFeature = null;
              if ((dataRecordFeature as any).clone) {
                tempFeature = (dataRecordFeature as any).clone();
              } else {
                tempFeature = Graphic.fromJSON(Object.assign({}, dataRecordFeature));
                tempFeature.attributes = Object.assign({}, dataRecordFeature.attributes);
              }

              if (layer) {
                (tempFeature as any).layer = layer;
              }

              features.push(tempFeature);
            }
          }

          featureSet = {
            features: features
          } as __esri.FeatureSet
        }

        getAppStore().dispatch(appActions.widgetMutableStatePropChange(this.widgetId, 
          `changedFeatureSetActionValue.${changedLayerId}`, featureSet));
        break;
    }
    return true;
  }
}