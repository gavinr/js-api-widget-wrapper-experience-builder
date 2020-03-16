import {React} from 'jimu-core';

export const MultiSourceMapContext = React.createContext({
  isShowMapSwitchBtn: false,
  dataSourceIds: [],
  activeDataSourceId: null,
  switchMap: () => {},
  fullScreenMap: () => {},
  initialMapState: null
});