import {React} from 'jimu-core';
import {JimuMapView} from 'jimu-arcgis';

export interface UIComponentProps {
  jimuMapView: JimuMapView;
}

export abstract class UIComponent<P extends UIComponentProps , S> extends React.PureComponent<P, S>{
}