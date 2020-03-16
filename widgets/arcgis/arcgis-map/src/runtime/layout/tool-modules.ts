import Zoom from '../tools/zoom';
import Home from '../tools/home';
import Compass from '../tools/compass';
import Locate from '../tools/locate';
import Navigation from '../tools/navigation';
import Search from '../tools/search';
import Layers from '../tools/layers';
import BaseMap from '../tools/basemap';
import MapSwitch from '../tools/mapswitch';
import FullScreen from '../tools/fullscreen';
import ScaleBar from '../tools/scalebar';
import Attribution from '../tools/attribution';
import Measure from '../tools/measure';

const ToolModules: {[ModuleName: string]: any} = {
  Zoom: Zoom,
  Home: Home,
  Navigation: Navigation,
  Locate: Locate,
  Compass: Compass,
  Search: Search,
  Layers: Layers,
  BaseMap: BaseMap,
  Measure: Measure,
  MapSwitch: MapSwitch,
  FullScreen: FullScreen,
  ScaleBar: ScaleBar,
  Attribution: Attribution
};

export default ToolModules;