import {React, DataSourceManager, ExtentChangeMessage, DataSourceComponent, portalUrlUtils,
  getAppStore, appActions, MutableStoreManager, ReactResizeDetector, ImmutableObject} from 'jimu-core';
import { IMConfig } from '../../config';
import { MapDataSource, DataSourceTypes, loadArcGISJSAPIModules, MapViewManager, JimuMapView, JimuMapViewConstructorOptions, zoomToUtils } from 'jimu-arcgis';
import {InitialMapState} from 'jimu-ui/map';
import {defaultMessages} from 'jimu-ui';
import { createNewFeaturelayer, updateFeaturelayer, getMapBaseRestoreData, restoreMapBase, selectFeature, 
  mapPanto, flashFeaturesByQuery, projectGeometries, filterFeaturesByQuery, processZoomToFeatures } from '../utils';
import {MapWidgetProps, ActionRelatedProps} from '../widget';
import Layout from '../layout/layout';
import pcLayoutJsons from '../layout/pc-layout-json';
import mobileLayoutJsons from '../layout/mobile-layout-json';
import {Icon} from 'jimu-ui';
import {MultiSourceMapContext} from './multisourcemap-context';

const Exchange = require('../assets/icons/exchange.svg');

interface Props{
  isDefaultMap?: boolean;
  baseWidgetProps: MapWidgetProps;
  startLoadModules: boolean;
  dataSourceId: string;
  onViewChanged?: (shareViewPoint: ShareViewPoint) => void;
  onMutableStatePropsChanged?: (dataSourceId: string, propKey: string, value?: any) => void;

  onExtentChanged?: (dataSourceId: string, message: ExtentChangeMessage) => void;
  onMapLoaded?: (dataSourceId: string, mapLoadStatus: MapLoadStatus) => void;
  onJimuMapViewCreated?: () => void;
}

export interface ShareViewPoint {
  dataSourceId: string;
  viewpoint: __esri.Viewpoint;
}

export enum MapLoadStatus {
  Loading = 'LOADING',
  Loadok = 'LOADOK',
  LoadError = 'LOADERROR'
}

export interface HighLightHandle {
  layerId: string;
  handle: __esri.Handle;
}

interface State{
  dataSourceId: string;
  mapDs?: MapDataSource;
  preMapDs?: MapDataSource;
  isModulesLoaded?: boolean;
  mapLoadStatus?: MapLoadStatus;

  mapBaseJimuMapView: JimuMapView;
  widthBreakpoint: string;

  widgetHeight: number;
}

export default class MapBase extends React.PureComponent<Props, State>{
  mapContainer: HTMLDivElement;
  widgetContainer: HTMLDivElement;

  Geometry: typeof __esri.Geometry;
  InitialViewProperties: typeof __esri.InitialViewProperties;
  TileLayer: typeof __esri.TileLayer;
  Basemap: typeof __esri.Basemap;
  MapView: typeof __esri.MapView;
  SceneView: typeof __esri.SceneView;
  Extent: typeof  __esri.geometry.Extent;
  Viewpoint: typeof  __esri.Viewpoint;
  PortalItem: typeof __esri.PortalItem;
  Portal: typeof __esri.Portal;
  WebMap: typeof __esri.WebMap;
  WebScene: typeof __esri.WebScene;

  mapView: __esri.MapView;
  sceneView: __esri.SceneView;
  extentWatch: __esri.WatchHandle;
  fatalErrorWatch: __esri.WatchHandle;
  highLightHandles: {[layerId: string]: __esri.Handle} = {};
  mapBaseViewEventHandles: {[eventName: string]: __esri.Handle} = {};
  dsManager = DataSourceManager.getInstance();

  onExtented = null;
  isReceiveExtentChange = false;

  constructor(props) {
    super(props);

    const restoreData = MutableStoreManager.getInstance().getStateValue([this.props.baseWidgetProps.id, 'restoreData',
      `${this.props.baseWidgetProps.id}-restoreData-${this.props.dataSourceId}`]);
    
    if (restoreData) {
      restoreMapBase(this, restoreData);
      this.props.baseWidgetProps.dispatch(appActions.widgetMutableStatePropChange(this.props.baseWidgetProps.id,
        `restoreData.${this.props.baseWidgetProps.id}-restoreData-${this.props.dataSourceId}`, null));
      
      this.bindMapBaseViewEvent(this.mapView || this.sceneView);
    } else {
      this.state = {
        mapLoadStatus: MapLoadStatus.Loading,
        widthBreakpoint: null,
        mapBaseJimuMapView: null,
        dataSourceId: null,
        widgetHeight: null
      } as State;
    }
  }

  startRenderMap = () => {
    loadArcGISJSAPIModules([
      'esri/geometry/Extent',
      'esri/Viewpoint'
    ]).then(modules => {
      [
        this.Extent, this.Viewpoint
      ] = modules;

      this.setState({
        isModulesLoaded: true
      });
    });
  }

  componentDidMount() {
    if (this.widgetContainer.getElementsByClassName('widget-map').length === 0 ) {
      if (!this.mapContainer) {
        this.mapContainer = document && document.createElement('div');
        this.mapContainer.className = 'jimu-widget widget-map';
      }
      this.widgetContainer.appendChild(this.mapContainer);
    }

    if(this.props.startLoadModules && !this.state.isModulesLoaded){
      this.startRenderMap();
      return;
    }

    if (!this.getMapDsId() && !this.props.isDefaultMap) {
      return;
    }

    if(!this.state.mapDs  && !this.props.isDefaultMap){
      return;
    }

    if (this.props.isDefaultMap) {
      // init and update map
      this.analysisMapView().then(() => {
        this.updateMapView(this.props.baseWidgetProps.config);
      });

      return;
    }

    if (this.state.mapDs.type === DataSourceTypes.WebMap) {
      // init and update map
      this.analysisMapView().then(() => {
        this.updateMapView(this.props.baseWidgetProps.config);
      });
    }

    if (this.state.mapDs.type === DataSourceTypes.WebScene) {
      // init and update map
      this.analysisSceneView().then(() => {
        this.updateSceneView(this.props.baseWidgetProps.config);
      });
    }
  }

  componentDidUpdate(prevProps: Props) {
    if(!this.state.isModulesLoaded){
      return;
    }

    const curDsId = this.getMapDsId();
    const prevDsId = this.state.preMapDs && this.state.preMapDs.id;

    const curDsItemId = this.state.mapDs && this.state.mapDs.dataSourceJson.itemId;
    const preDsItemId = this.state.preMapDs && this.state.preMapDs.dataSourceJson.itemId;

    if (curDsId !== prevDsId || curDsItemId !== preDsItemId) {
      this.mapView = null;
      this.sceneView = null;
      const prevJimuMapViewId = this.state.preMapDs && `${this.props.baseWidgetProps.id}-${this.state.preMapDs.id}`;
      if (prevJimuMapViewId) {
        MapViewManager.getInstance().destroyJimuMapView(prevJimuMapViewId);
      }

      if (this.state.mapLoadStatus === MapLoadStatus.LoadError && !this.state.mapDs) {
        this.setState({
          preMapDs: this.state.mapDs
        });
        return;
      }

      this.setState({
        preMapDs: this.state.mapDs,
        mapLoadStatus: MapLoadStatus.Loading
      });
    }

    if (this.props.isDefaultMap) {
      this.sceneView = null;

      this.analysisMapView().then(() => {
        this.updateMapView(this.props.baseWidgetProps.config);

        if(!this.mapView || !this.props.baseWidgetProps.mutableStateProps){
          return;
        }

        if (this.props.baseWidgetProps.mutableStateProps) {
          this.handleAction(this.props.baseWidgetProps.mutableStateProps, this.mapView);
        }
      });
    }

    if(!this.state.mapDs){
      return;
    }

    if (this.state.mapDs.type === DataSourceTypes.WebMap) {
      this.sceneView = null;

      this.analysisMapView().then(() => {
        this.updateMapView(this.props.baseWidgetProps.config);

        if(!this.mapView || !this.props.baseWidgetProps.mutableStateProps){
          return;
        }

        if (this.props.baseWidgetProps.mutableStateProps) {
          this.handleAction(this.props.baseWidgetProps.mutableStateProps, this.mapView);
        }
      });
    }

    if (this.state.mapDs.type === DataSourceTypes.WebScene) {
      this.mapView = null;

      this.analysisSceneView().then(() => {
        this.updateSceneView(this.props.baseWidgetProps.config);

        if(!this.sceneView || !this.props.baseWidgetProps.mutableStateProps){
          return;
        }

        if (this.props.baseWidgetProps.mutableStateProps) {
          this.handleAction(this.props.baseWidgetProps.mutableStateProps, this.sceneView);
        }
      });
    }
  }

  analysisMapView = (): Promise<void> => {
    if (!this.mapView) {
      if (this.MapView) {
        this.initMapView();
        return Promise.resolve();
      } else {
        return loadArcGISJSAPIModules([
          'esri/geometry/Geometry',
          'esri/webmap/InitialViewProperties',
          'esri/Basemap',
          'esri/layers/TileLayer',
          'esri/views/MapView',
          'esri/WebMap',
          'esri/portal/Portal',
          'esri/portal/PortalItem'
        ]).then(modules => {
          [
            this.Geometry, this.InitialViewProperties, this.Basemap, this.TileLayer, this.MapView, this.WebMap, this.Portal, this.PortalItem
          ] = modules;
          this.initMapView();
          return Promise.resolve();
        });
      }
    } else {
      return Promise.resolve();
    }
  }

  analysisSceneView = (): Promise<void> => {
    if (!this.sceneView) {
      if (this.SceneView) {
        this.initSceneView();
        return Promise.resolve();
      } else {
        return loadArcGISJSAPIModules([
          'esri/views/SceneView',
          'esri/WebScene',
          'esri/portal/Portal',
          'esri/portal/PortalItem'
        ]).then(modules => {
          [
            this.SceneView, this.WebScene, this.Portal, this.PortalItem
          ] = modules;
          this.initSceneView();
          return Promise.resolve();
        });
      }
    } else {
      return Promise.resolve();
    }
  }

  static getDerivedStateFromProps(nextProps: Props, prevState: State) {
    if (nextProps.dataSourceId !== prevState.dataSourceId) {
      return {
        dataSourceId: nextProps.dataSourceId,
        mapLoadStatus: MapLoadStatus.Loading
      }
    } else {
      return null;
    }
  }

  componentWillUnmount() {
    const widgets =  getAppStore().getState().appConfig.widgets;

    if (widgets[this.props.baseWidgetProps.id] && widgets[this.props.baseWidgetProps.id].useDataSources === this.props.baseWidgetProps.useDataSources) {
      const restoreData = getMapBaseRestoreData(this);
      this.props.baseWidgetProps.dispatch(appActions.widgetMutableStatePropChange(this.props.baseWidgetProps.id, 
        `restoreData.${this.props.baseWidgetProps.id}-restoreData-${this.props.dataSourceId}`, restoreData));
    } else {
      this.props.onViewChanged && this.props.onViewChanged({dataSourceId: this.props.dataSourceId, viewpoint: null});
      const jimuMapViewId = `${this.props.baseWidgetProps.id}-${this.props.dataSourceId}`;
      MapViewManager.getInstance().destroyJimuMapView(jimuMapViewId);

      if (this.mapView && !this.mapView.destroyed) {
        this.mapView.container = null;
        this.mapView = null;
      }
      if (this.sceneView && !this.sceneView.destroyed) {
        this.sceneView.container = null;
        this.sceneView = null;
      }
      this.highLightHandles = {};
      this.extentWatch = null;
      this.fatalErrorWatch = null;
    }
  }

  generateViewPointFromInitialMapState = (initialMapState: ImmutableObject<InitialMapState>): __esri.Viewpoint => {
    if (initialMapState.viewType === '2d') {
      return new this.Viewpoint(
        {
          targetGeometry: this.Extent.fromJSON(initialMapState.extent),
          rotation: initialMapState.rotation
        }
      )
    } else {
      return this.Viewpoint.fromJSON(initialMapState.viewPoint);
    }
  }

  cloneMap = (dataSource: MapDataSource): __esri.WebMap | __esri.WebScene => {
    let map = null;
    const dataSourceJson = dataSource.dataSourceJson;
    let MapClass: typeof __esri.WebMap | typeof __esri.WebScene = null;
    if (dataSourceJson.type === DataSourceTypes.WebMap) {
      MapClass = this.WebMap;
    }

    if (dataSourceJson.type === DataSourceTypes.WebScene) {
      MapClass = this.WebScene;
    }

    if(dataSourceJson.portalUrl){
      const portal = new this.Portal({
        url: portalUrlUtils.getHostUrlByOrgUrl(dataSourceJson.portalUrl)
      });

      map = new MapClass({
        portalItem: new this.PortalItem({
          id: dataSourceJson.itemId,
          portal: portal
        })
      });
    }else{
      map = new MapClass({
        portalItem: new this.PortalItem({
          id: dataSourceJson.itemId
        })
      });
    }
    return map;
  }

  getInitViewPointForDefaultWebMap = (): __esri.Viewpoint => {
    const portalSelf = getAppStore().getState().portalSelf;
    const defaultExtent = portalSelf && portalSelf.defaultExtent;
    let tempViewPoint = null;
    if (this.props.baseWidgetProps.config.initialMapState && this.props.baseWidgetProps.config.initialMapState.viewPoint) {
      tempViewPoint = this.generateViewPointFromInitialMapState(this.props.baseWidgetProps.config.initialMapState);
    } else {
      tempViewPoint = new this.Viewpoint(
        {
          targetGeometry: new this.Extent({
            xmin: defaultExtent && defaultExtent.xmin,
            ymin: defaultExtent && defaultExtent.ymin,
            xmax: defaultExtent && defaultExtent.xmax,
            ymax: defaultExtent && defaultExtent.ymax,
            spatialReference: {wkid: defaultExtent.spatialReference.wkid}
          })
        }
      );
    }
    return tempViewPoint;
  }

  getDefaultWebMap = () => {
    const portalSelf = getAppStore().getState().portalSelf;

    const baseMapObj = portalSelf && portalSelf.defaultBasemap && portalSelf.defaultBasemap.baseMapLayers && portalSelf.defaultBasemap.baseMapLayers[0];
    const defaultExtent = portalSelf && portalSelf.defaultExtent;

    let tempViewPoint = null;
    tempViewPoint = new this.Viewpoint(
      {
        targetGeometry: new this.Extent({
          xmin: defaultExtent && defaultExtent.xmin,
          ymin: defaultExtent && defaultExtent.ymin,
          xmax: defaultExtent && defaultExtent.xmax,
          ymax: defaultExtent && defaultExtent.ymax,
          spatialReference: {wkid: defaultExtent.spatialReference.wkid}
        })
      }
    );

    const defaultWebmap = new this.WebMap({
      basemap: new this.Basemap({
        baseLayers: [
          new this.TileLayer({
            url: baseMapObj && baseMapObj.url
          })
        ],
        title: 'basemap',
        id: 'basemap'
      }),
      initialViewProperties: new this.InitialViewProperties({
        spatialReference: defaultExtent && defaultExtent.spatialReference,
        viewpoint: tempViewPoint,
      })
    });

    return defaultWebmap;
  }

  initMapView = (): void => {
    this.extentWatch = null;
    this.fatalErrorWatch = null;

    if (this.mapView) {
      return;
    }

    let mapViewOption: __esri.MapViewProperties;
    if (this.props.isDefaultMap) {
      const defaultMap = this.getDefaultWebMap();
      mapViewOption = {
        map: defaultMap,
        container: this.mapContainer,
        viewpoint: this.getInitViewPointForDefaultWebMap(),
        rotation: this.props.baseWidgetProps.config.initialMapState && this.props.baseWidgetProps.config.initialMapState.rotation
      };
    } else {
      const tempWebmap = this.cloneMap(this.state.mapDs);

      if (this.props.baseWidgetProps.config.initialMapState) {
        mapViewOption = {
          map: tempWebmap,
          container: this.mapContainer,
          viewpoint: this.props.baseWidgetProps.config.initialMapState 
            && this.generateViewPointFromInitialMapState(this.props.baseWidgetProps.config.initialMapState)
        };
      } else {
        mapViewOption = {
          map: tempWebmap,
          container: this.mapContainer
        };
      }
    }

    if (!window.jimuConfig.isInBuilder) {
      if(this.props.baseWidgetProps.queryObject[this.props.baseWidgetProps.id]){
        const extentStr = this.props.baseWidgetProps.queryObject[this.props.baseWidgetProps.id].substr('extent='.length);
        let extent;
        try{
          extent = new this.Extent(JSON.parse(extentStr));
        }catch(err){
          console.error('Bad extent URL parameter.')
        }
  
        if(extent){
          mapViewOption.extent = extent;
        }
      }
    }

    this.mapView = new this.MapView(mapViewOption);
    this.mapView.popup.spinnerEnabled = false;

    const ui = this.mapView.ui as any;
    ui.exbMapTools = {};

    MapViewManager.getInstance().createJimuMapView({
      mapWidgetId: this.props.baseWidgetProps.id,
      datasourceId: this.props.dataSourceId,
      view: this.mapView,
      isEnablePopup: this.props.baseWidgetProps.config && !this.props.baseWidgetProps.config.disablePopUp
    } as JimuMapViewConstructorOptions);

    this.mapView.when(() => {
      // after view is loaded, send extent change message
      this.setState({mapLoadStatus: MapLoadStatus.Loadok}, () => {
        this.props.onMapLoaded(this.props.dataSourceId, MapLoadStatus.Loadok);
      });

      const tempJimuMapViewId = `${this.props.baseWidgetProps.id}-${this.props.dataSourceId}`;
      const tempJimuMapView = MapViewManager.getInstance().getJimuMapViewById(tempJimuMapViewId);
      if (tempJimuMapView) {
        this.props.onJimuMapViewCreated();

        this.setState({
          mapBaseJimuMapView: tempJimuMapView
        });
      }

      if(!this.extentWatch){
        this.extentWatch = this.mapView.watch('extent', (extent: __esri.Extent) => {
          if (!extent) {
            return;
          }
          
          clearTimeout(this.onExtented);
          this.onExtented = setTimeout(() => {
            if (!extent) {
              return;
            }

            if (this.isReceiveExtentChange) {
              this.isReceiveExtentChange = false;
            } else {
              const extentMessage = new ExtentChangeMessage(this.props.baseWidgetProps.id, extent);
              extentMessage.addRelatedWidgetId(this.props.baseWidgetProps.id);
              this.props.onExtentChanged(this.props.dataSourceId, extentMessage);
            }
          }, 200);
        });
      }

      if(!this.fatalErrorWatch) {
        this.fatalErrorWatch = this.mapView.watch('fatalError', (error) => {
          if(error) {
            console.error('Fatal Error! View has lost its WebGL context. Attempting to recover...');
            this.mapView.tryFatalErrorRecovery();
          }
        });
      }

      setTimeout(() => {
        this.goHome(false).then(() => {
          const extentMessage = new ExtentChangeMessage(this.props.baseWidgetProps.id, this.mapView.extent);
          extentMessage.addRelatedWidgetId(this.props.baseWidgetProps.id);
          this.props.onExtentChanged(this.props.dataSourceId, extentMessage);
          this.props.onViewChanged && this.props.onViewChanged({dataSourceId: this.props.dataSourceId, viewpoint: this.mapView.viewpoint.clone()});
        });
      }, 500);
    });

    this.bindMapBaseViewEvent(this.mapView);
  }

  initSceneView = (): void => {
    this.extentWatch = null;
    this.fatalErrorWatch = null;

    if (this.sceneView) {
      return;
    }

    const tempWebScene = this.cloneMap(this.state.mapDs);

    let mapViewOption: __esri.SceneViewProperties;

    if (this.props.baseWidgetProps.config.initialMapState) {
      mapViewOption = {
        map: tempWebScene,
        container: this.mapContainer,
        qualityProfile: 'low',
        viewpoint: this.props.baseWidgetProps.config.initialMapState 
          && this.generateViewPointFromInitialMapState(this.props.baseWidgetProps.config.initialMapState)
      };
    } else {
      mapViewOption = {
        map: tempWebScene,
        container: this.mapContainer,
        qualityProfile: 'low'
      };
    }

    this.sceneView = new this.SceneView(mapViewOption);
    this.sceneView.popup.spinnerEnabled = false;

    const ui = this.sceneView.ui as any;
    ui.exbMapTools = {};

    MapViewManager.getInstance().createJimuMapView({
      mapWidgetId: this.props.baseWidgetProps.id,
      datasourceId: this.props.dataSourceId,
      view: this.sceneView,
      isEnablePopup: this.props.baseWidgetProps.config && !this.props.baseWidgetProps.config.disablePopUp
    } as JimuMapViewConstructorOptions);

    this.sceneView.when(() => {
      // after view is loaded, send extent change message
      this.setState({mapLoadStatus: MapLoadStatus.Loadok}, () => {
        this.props.onMapLoaded(this.props.dataSourceId, MapLoadStatus.Loadok);
      });

      const tempJimuMapViewId = `${this.props.baseWidgetProps.id}-${this.props.dataSourceId}`;
      const tempJimuMapView = MapViewManager.getInstance().getJimuMapViewById(tempJimuMapViewId);
      if (tempJimuMapView) {
        this.props.onJimuMapViewCreated();
          
        this.setState({
          mapBaseJimuMapView: tempJimuMapView
        });
      }

      if(!this.extentWatch){
        this.extentWatch = this.sceneView.watch('extent', (extent: __esri.Extent) => {
          if (!extent) {
            return;
          }

          clearTimeout(this.onExtented);
          this.onExtented = setTimeout(() => {
            if (!extent) {
              return;
            }

            if (this.isReceiveExtentChange) {
              this.isReceiveExtentChange = false;
            } else {
              const extentMessage = new ExtentChangeMessage(this.props.baseWidgetProps.id, extent);
              extentMessage.addRelatedWidgetId(this.props.baseWidgetProps.id);
              this.props.onExtentChanged(this.props.dataSourceId, extentMessage);
            }
          }, 200);
        });
      }

      if(!this.fatalErrorWatch) {
        this.fatalErrorWatch = this.sceneView.watch('fatalError', (error) => {
          if(error) {
            console.error('Fatal Error! View has lost its WebGL context. Attempting to recover...');
            this.sceneView.tryFatalErrorRecovery();
          }
        });
      }

      setTimeout(() => {
        this.goHome(false).then(() => {
          const extentMessage = new ExtentChangeMessage(this.props.baseWidgetProps.id, this.sceneView.extent);
          extentMessage.addRelatedWidgetId(this.props.baseWidgetProps.id);
          this.props.onExtentChanged(this.props.dataSourceId, extentMessage);
          this.props.onViewChanged && this.props.onViewChanged({dataSourceId: this.props.dataSourceId, viewpoint: this.sceneView.viewpoint.clone()});
        });
      }, 500);
    });

    this.bindMapBaseViewEvent(this.sceneView);
  }

  updateMapView = (config: IMConfig): void => {
    const jimuMapViewId = `${this.props.baseWidgetProps.id}-${this.props.dataSourceId}`;
    let jimuMapView: JimuMapView = null;
    if (jimuMapViewId) {
      jimuMapView = MapViewManager.getInstance().getJimuMapViewById(jimuMapViewId);
    }

    if (!(jimuMapView && jimuMapView.getIsEditing())) {
      if (config.disablePopUp) {
        this.mapView.popup.close();
        this.mapView.popup.autoOpenEnabled = false;
      } else {
        this.mapView.popup.autoOpenEnabled = true;
      }

      if (jimuMapView) {
        (jimuMapView as any).isEnablePopUp = !config.disablePopUp;
      }
    }

    if (!this.mapView.ui) {
      return;
    }

    this.mapView.ui.components = [];
  }

  updateSceneView = (config: IMConfig): void => {
    const jimuMapViewId = `${this.props.baseWidgetProps.id}-${this.props.dataSourceId}`;

    let jimuMapView: JimuMapView = null;
    if (jimuMapViewId) {
      jimuMapView = MapViewManager.getInstance().getJimuMapViewById(jimuMapViewId);
    }

    if (!(jimuMapView && jimuMapView.getIsEditing())) {
      if (config.disablePopUp) {
        this.sceneView.popup.close();
        this.sceneView.popup.autoOpenEnabled = false;
      } else {
        this.sceneView.popup.autoOpenEnabled = true;
      }

      if (jimuMapView) {
        (jimuMapView as any).isEnablePopUp = !config.disablePopUp;
      }
    }

    if (!this.sceneView.ui) {
      return;
    }

    this.sceneView.ui.components = [];
  }

  bindMapBaseViewEvent = (mapBaseView: __esri.MapView |  __esri.SceneView) => {
    if (mapBaseView) {
      if (this.mapBaseViewEventHandles['mouse-wheel']) {
        this.mapBaseViewEventHandles['mouse-wheel'].remove();
        this.mapBaseViewEventHandles['mouse-wheel'] = null;
      }

      this.mapBaseViewEventHandles['mouse-wheel'] = mapBaseView.on('mouse-wheel', (e) => {
        if (this.props.baseWidgetProps.config.disableScroll) {
          e.stopPropagation();
          this.handleDisableWheel();
          return;
        }
  
        this.props.onViewChanged && this.props.onViewChanged({dataSourceId: this.props.dataSourceId, viewpoint: mapBaseView.viewpoint.clone()});
      });
  
      if (this.mapBaseViewEventHandles['drag']) {
        this.mapBaseViewEventHandles['drag'].remove();
        this.mapBaseViewEventHandles['drag'] = null;
      }

      this.mapBaseViewEventHandles['drag'] = mapBaseView.on('drag', () => {
        this.props.onViewChanged && this.props.onViewChanged({dataSourceId: this.props.dataSourceId, viewpoint: mapBaseView.viewpoint.clone()});
      });
  
      if (this.mapBaseViewEventHandles['click']) {
        this.mapBaseViewEventHandles['click'].remove();
        this.mapBaseViewEventHandles['click'] = null;
      }

      this.mapBaseViewEventHandles['click'] = mapBaseView.on('click', () => {
        for (const key in this.highLightHandles) {
          this.highLightHandles[key].remove();
        }
      });
    }
  }

  getMapDsId = (): string => {
    return this.state.mapDs && this.state.mapDs.id;
  }

  onDataSourceCreated = (dataSource: MapDataSource): void => {
    this.setState({
      mapDs: dataSource,
      preMapDs: this.state.mapDs
    }
    )
  }

  onCreateDataSourceFailed = (err): void => {
    console.warn(err);
    this.setState({
      mapLoadStatus: MapLoadStatus.LoadError,
      mapDs: null,
      preMapDs: this.state.mapDs
    }, () => {
      this.props.onMapLoaded(this.props.dataSourceId, MapLoadStatus.LoadError);

      MapViewManager.getInstance().createJimuMapView({
        mapWidgetId: this.props.baseWidgetProps.id,
        datasourceId: this.props.dataSourceId,
        view: null,
        isEnablePopUp: this.props.baseWidgetProps.config && !this.props.baseWidgetProps.config.disablePopUp
      } as JimuMapViewConstructorOptions);
    });
  }

  setViewPoint = (viewPoint): void => {
    if (!viewPoint || !this.state.mapDs) {
      return;
    }

    if (this.state.mapDs.type === DataSourceTypes.WebMap) {
      if (this.mapView) {
        this.mapView.viewpoint = viewPoint;
      }
    }

    if (this.state.mapDs.type === DataSourceTypes.WebScene) {
      if (this.sceneView) {
        this.sceneView.viewpoint = viewPoint;
      }
    }
  }

  getMapLoadStatus = (): MapLoadStatus => {
    return this.state.mapLoadStatus;
  }

  getViewPoint = (): __esri.Viewpoint => {
    if (!this.state.mapDs) {
      return null;
    }

    if (this.state.mapDs.type === DataSourceTypes.WebMap) {
      return this.mapView && this.mapView.viewpoint ? this.mapView.viewpoint.clone() : null;
    }

    if (this.state.mapDs.type === DataSourceTypes.WebScene) {
      if (this.sceneView && this.sceneView.viewpoint) {
        // For scene, the first extent (after scene loaded) is not correct. So we use go to camera to get correct extent
        this.sceneView.goTo(this.sceneView.viewpoint.camera, {
          animate: false
        }) as any;

        return this.sceneView.viewpoint.clone();
      } else {
        return null;
      }
    }
  }

  getViewType = (): string => {
    return this.state.mapDs && this.state.mapDs.type;
  }

  goToTilt = (tilt) => {
    this.sceneView && this.sceneView.goTo({
      tilt: tilt
    });
  }

  goHome = (useAmination?: boolean): Promise<any> => {
    if (!this.state.mapDs) {
      return Promise.resolve();
    }

    const initViewPoint = this.getMapBaseInitViewPoint();

    if (this.state.mapDs.type === DataSourceTypes.WebMap) {
      if (this.mapView) {
        return this.mapView.goTo(initViewPoint, {
          animate: useAmination
        }) as any;
      }
    }

    if (this.state.mapDs.type === DataSourceTypes.WebScene) {
      if (this.sceneView) {
        return this.sceneView.goTo(initViewPoint, {
          animate: useAmination
        }) as any;
      }
    }

    return Promise.resolve();
  }

  getMapBaseInitViewPoint = (): __esri.Viewpoint => {
    if (this.props.isDefaultMap) {
      return this.getInitViewPointForDefaultWebMap();
    } else {
      if (this.props.baseWidgetProps.config.initialMapState) {
        return this.generateViewPointFromInitialMapState(this.props.baseWidgetProps.config.initialMapState);
      } else {
        return (this.state.mapDs.map as __esri.WebMap | __esri.WebScene).initialViewProperties.viewpoint.clone();
      }
    }
  }

  handleAction = (mutableStateProps: ActionRelatedProps, mapBaseView: __esri.MapView | __esri.SceneView) => {
    if (mutableStateProps.zoomToFeatureActionValue) {
      if (mutableStateProps.zoomToFeatureActionValue.relatedWidgets 
        && mutableStateProps.zoomToFeatureActionValue.relatedWidgets.indexOf(this.props.baseWidgetProps.id) > -1) {
        this.props.onMutableStatePropsChanged(this.props.dataSourceId, 'zoomToFeatureActionValue', null);
      } else {
        const tempMapBaseView = mapBaseView as any;

        const relatedWidgets = mutableStateProps.zoomToFeatureActionValue.relatedWidgets ? 
          mutableStateProps.zoomToFeatureActionValue.relatedWidgets : [];

        const zoomToFeatureValue = mutableStateProps.zoomToFeatureActionValue.value;
        let layer = null;
        if (zoomToFeatureValue.layerId) {
          layer = tempMapBaseView.map.layers.find(layer => layer.id === zoomToFeatureValue.layerId);
        }

        if (zoomToFeatureValue.type === 'zoom-to-extent') {
          zoomToUtils.zoomTo(tempMapBaseView, zoomToFeatureValue.features[0], zoomToFeatureValue.zoomToOption).then(() => {
            this.isReceiveExtentChange = true;
            relatedWidgets.push(this.props.baseWidgetProps.id);
            const extentMessage = new ExtentChangeMessage(this.props.baseWidgetProps.id, tempMapBaseView.extent);
            extentMessage.setRelatedWidgetIds(relatedWidgets);
            this.props.onExtentChanged(this.props.dataSourceId, extentMessage);
          }, () => {
            this.isReceiveExtentChange = true;
          })
        } else {
          let target = null;
          if (layer) {
            target = {
              layer: layer,
              graphics: zoomToFeatureValue.features
            }
          } else {
            target = zoomToFeatureValue.features;
          }

          processZoomToFeatures(tempMapBaseView, target.layer, (target && target.graphics) ? target.graphics : target).then(
            graphics => {
              if (layer) {
                target.graphics = graphics;
              } else {
                target = graphics;
              }
              
              zoomToUtils.zoomTo(tempMapBaseView, target, zoomToFeatureValue.zoomToOption).then(() => {
                this.isReceiveExtentChange = true;
                relatedWidgets.push(this.props.baseWidgetProps.id);
                const extentMessage = new ExtentChangeMessage(this.props.baseWidgetProps.id, tempMapBaseView.extent);
                extentMessage.setRelatedWidgetIds(relatedWidgets);
                this.props.onExtentChanged(this.props.dataSourceId, extentMessage);
              }, () => {
                this.isReceiveExtentChange = true;
              })
            }
          )
        }

        this.props.onMutableStatePropsChanged(this.props.dataSourceId, 'zoomToFeatureActionValue', null);
      }
    }

    if (mutableStateProps.panToActionValue) {
      if (mutableStateProps.panToActionValue.relatedWidgets 
        && mutableStateProps.panToActionValue.relatedWidgets.indexOf(this.props.baseWidgetProps.id) > -1) {
        this.props.onMutableStatePropsChanged(this.props.dataSourceId, 'panToActionValue', null);
      } else {
        const tempMapBaseView = mapBaseView as any;
        const relatedWidgets = mutableStateProps.panToActionValue.relatedWidgets ? 
          mutableStateProps.panToActionValue.relatedWidgets : [];

        const panToValue = mutableStateProps.panToActionValue.value as any;
        projectGeometries(panToValue.features, tempMapBaseView.spatialReference).then((geometries) => {
          mapPanto(mapBaseView, geometries).then(() => {
            this.isReceiveExtentChange = true;
            relatedWidgets.push(this.props.baseWidgetProps.id);
            const extentMessage = new ExtentChangeMessage(this.props.baseWidgetProps.id, tempMapBaseView.extent);
            extentMessage.setRelatedWidgetIds(relatedWidgets);
            this.props.onExtentChanged(this.props.dataSourceId, extentMessage);
          }, () => {
            this.isReceiveExtentChange = true;
          })
        })
      }

      this.isReceiveExtentChange = true;
      this.props.onMutableStatePropsChanged(this.props.dataSourceId, 'panToActionValue', null);
    }

    if (mutableStateProps.newFeatureSetActionValue && !mutableStateProps.newFeatureSetActionValue.promise) {
      const createNewFeaturelayerPromise = createNewFeaturelayer(mapBaseView, mutableStateProps.newFeatureSetActionValue.value);
      if (createNewFeaturelayerPromise) {
        this.props.onMutableStatePropsChanged(this.props.dataSourceId, 'newFeatureSetActionValue.promise', createNewFeaturelayerPromise);


        createNewFeaturelayerPromise.then(() => {
          this.props.onMutableStatePropsChanged(this.props.dataSourceId, 'newFeatureSetActionValue', null);
        })
      } else {
        this.props.onMutableStatePropsChanged(this.props.dataSourceId, 'newFeatureSetActionValue', null);
      }
    }

    if (mutableStateProps.changedFeatureSetActionValue) {
      updateFeaturelayer(mapBaseView, mutableStateProps.changedFeatureSetActionValue);
      this.props.onMutableStatePropsChanged(this.props.dataSourceId, 'changedFeatureSetActionValue', null);
    }

    if (mutableStateProps.selectFeatureActionValue) {
      mapBaseView.popup.close();

      for (const key in this.highLightHandles) {
        this.highLightHandles[key].remove();
      }

      const selectFeatureHandle = selectFeature(mapBaseView, mutableStateProps.selectFeatureActionValue);
      if (selectFeatureHandle) {
        this.highLightHandles[selectFeatureHandle.layerId] = selectFeatureHandle.handle;
      }

      setTimeout(() => {
        this.props.onMutableStatePropsChanged(this.props.dataSourceId, 'selectFeatureActionValue', null);
      }, 500);
    }

    if (mutableStateProps.flashActionValue) {
      mutableStateProps.flashActionValue.querySQL && flashFeaturesByQuery(mapBaseView, mutableStateProps.flashActionValue.layerId, mutableStateProps.flashActionValue.querySQL);
      this.props.onMutableStatePropsChanged(this.props.dataSourceId, 'flashActionValue', null);
    }

    if (mutableStateProps.filterActionValue) {
      filterFeaturesByQuery(mapBaseView, mutableStateProps.filterActionValue.layerId, mutableStateProps.filterActionValue.querySQL);
      this.props.onMutableStatePropsChanged(this.props.dataSourceId, 'filterActionValue', null);
    }
  }

  formatMessage = (id: string) => {
    return this.props.baseWidgetProps.intl.formatMessage({id: id, defaultMessage: defaultMessages[id]})
  }

  handleDisableWheel = () => {
    this.widgetContainer.style.pointerEvents = 'none';
    setTimeout(() => {
      this.widgetContainer.style.pointerEvents = 'auto';
    }, 50);
  }

  getLayoutConfig = () => {
    if (this.state.widthBreakpoint === 'xsmall') {
      return mobileLayoutJsons[0];
    } else {
      return this.props.baseWidgetProps.config.layoutIndex ? pcLayoutJsons[this.props.baseWidgetProps.config.layoutIndex] : pcLayoutJsons[0];
    }
  }

  onResize = (width, height) => {
    if (!width || !height) {
      return;
    }

    if (width <= 545 && width > 0) {
      this.setState({
        widthBreakpoint: 'xsmall',
        widgetHeight: height
      })
    } else {
      this.setState({
        widthBreakpoint: 'other',
        widgetHeight: height
      })
    }
  }

  getMapSwitchForErrorMap = () => {
    return <MultiSourceMapContext.Consumer>
      {({isShowMapSwitchBtn,  dataSourceIds, activeDataSourceId, switchMap}) => (
        <div className="mapswitch-container" style={{display: isShowMapSwitchBtn ? 'block' : 'none', 
          marginBottom: this.state.widthBreakpoint === 'xsmall' ? 10 : 0}}>
          <div onClick={(e) => {e.preventDefault(); switchMap(); }} className="border-0 jimu-widget esri-widget--button" >
            <Icon icon={Exchange} width={16} height={16} className="mapswitch-icon"/>
          </div>
        </div>
      )}
    </MultiSourceMapContext.Consumer>;
  }

  render() {
    let useDataSource = null;

    if (this.props.baseWidgetProps.useDataSources) {
      for (let i = 0; i < this.props.baseWidgetProps.useDataSources.length; i++) {
        if (this.props.baseWidgetProps.useDataSources[i].dataSourceId == this.props.dataSourceId) {
          useDataSource = this.props.baseWidgetProps.useDataSources[i];
        }
      }
    }

    return <div className="jimu-widget" style={{position: 'relative'}} ref={ref => {this.widgetContainer = ref; }}>
      {(this.state.mapLoadStatus === MapLoadStatus.Loading) && 
        <div className="jimu-widget widget-map-background">
          <div style={{ position: 'absolute', left: '50%', top: '50%'}} className="jimu-secondary-loading">
          </div>
        </div>}
      {(this.state.mapLoadStatus === MapLoadStatus.LoadError) && 
        <div className="jimu-widget widget-map-background">
          {this.getMapSwitchForErrorMap()}
          <div className="jimu-widget d-flex justify-content-center align-items-center">{this.formatMessage('mapFailure')}</div>
        </div>}
      {this.state.mapBaseJimuMapView && this.state.widthBreakpoint && <Layout isMobile={this.state.widthBreakpoint === 'xsmall'} jimuMapView={this.state.mapBaseJimuMapView} 
        appMode={this.props.baseWidgetProps.appMode} layouts={this.props.baseWidgetProps.layouts} intl={this.props.baseWidgetProps.intl}
        LayoutEntry={this.props.baseWidgetProps.builderSupportModules && this.props.baseWidgetProps.builderSupportModules.LayoutEntry}
        layoutConfig={this.getLayoutConfig()} toolConfig={this.props.baseWidgetProps.config.toolConifg ? this.props.baseWidgetProps.config.toolConifg : {} }
        widgetManifestName={this.props.baseWidgetProps.manifest.name} widgetHeight={this.state.widthBreakpoint === 'xsmall' ? null : this.state.widgetHeight}></Layout>}
      {!this.props.isDefaultMap && <div style={{position: 'absolute', display: 'none'}}><DataSourceComponent useDataSource={useDataSource}
        onDataSourceCreated={this.onDataSourceCreated} onCreateDataSourceFailed={this.onCreateDataSourceFailed}/></div>}
      <ReactResizeDetector handleWidth handleHeight onResize={this.onResize} />
    </div>;
  }
}