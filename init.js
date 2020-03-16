//to make react devtools works in iframe.
if (window.parent !== window) {
  try{
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = window.parent.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  }catch(err){
    console.warn('App is embedded in a cross-origin frame.');
  }
}

(function(argument) {

  initConfig();

  ////////////////////// utils functions
  function initConfig(){
    if(!ROOT_PATH){
      ROOT_PATH = '/';
    }
    if(!/\/$/.test(ROOT_PATH)){
      ROOT_PATH = ROOT_PATH + '/';
    }

    window.jimuConfig = {
      isBuilder: false,
      isSite: false,
      isInBuilder: isInBuilder(),
      mountPath: MOUNT_PATH,
      rootPath: ROOT_PATH,
      packagesInAppFolder: PACKAGES_IN_APP_FOLDER,
      useStructuralUrl: USE_STRUCTURAL_URL,
      isInPortal: IS_IN_PORTAL
    };

    // configure AmCharts
    window.AmCharts_path = '//www.amcharts.com/lib/3/';

    SystemJS.config({
      baseURL: PACKAGES_IN_APP_FOLDER? ROOT_PATH: ROOT_PATH + '..',
      map: {
        'css-loader': 'jimu-core/systemjs-plugin-css.js',
        'dojo-loader': 'jimu-core/systemjs-plugin-dojo.js',
        'amcharts': window.AmCharts_path,
        'gtm': 'https://www.googletagmanager.com/gtag/js',
        'survey': 'https://survey123.arcgis.com/api/jsapi',
        'surveyDev': 'https://survey123dev.arcgis.com/api/jsapi',
        'surveyQa': 'https://survey123qa.arcgis.com/api/jsapi'
      },
      packages: {
        'jimu-core': {
          main: 'index.js',
          format: 'amd'
        },
        'jimu-arcgis': {
          main: 'index.js',
          format: 'amd'
        },
        'jimu-for-builder': {
          main: 'index.js',
          format: 'amd'
        },
        'hub-common': {
          main: 'index.js',
          format: 'amd'
        },
        'jimu-ui': {
          main: 'index.js',
          format: 'amd'
        },
        'jimu-layouts': {
          main: 'common.js',
          format: 'amd'
        },
        'widgets': {
          format: 'amd'
        },
        'themes': {
          format: 'amd'
        }
      },
      meta: {
        '*/dojo.js': {
          scriptLoad: true
        },

        'css-loader': {format: 'cjs'},
        'dojo-loader': {format: 'cjs'},

        '*.css': { loader: 'css-loader' },

        'dojo/*': { loader: 'dojo-loader', format: 'amd' },
        'dijit/*': { loader: 'dojo-loader', format: 'amd' },
        'dojox/*': { loader: 'dojo-loader', format: 'amd' },
        'dgrid/*': { loader: 'dojo-loader', format: 'amd' },
        'moment/*': { loader: 'dojo-loader', format: 'amd' },
        '@dojo/*': { loader: 'dojo-loader', format: 'amd' },
        'tslib/*': { loader: 'dojo-loader', format: 'amd' },
        'cldrjs/*': { loader: 'dojo-loader', format: 'amd' },
        'globalize/*': { loader: 'dojo-loader', format: 'amd' },
        'maquette/*': { loader: 'dojo-loader', format: 'amd' },
        'maquette-jsx/*': { loader: 'dojo-loader', format: 'amd' },
        'maquette-css-transitions/*': { loader: 'dojo-loader', format: 'amd' },
        'esri/*': { loader: 'dojo-loader', format: 'amd' },

        'amcharts/*': {
          scriptLoad: true
        },

        gtm: {scriptLoad: true, format: 'global'},
        // the following settings are only for survey 3.8, they are not needed after survey 3.9 released.
        survey: {format: 'global'},
        surveyDev: {format: 'global'},
        surveyQa: {format: 'global'}
      }
    });

  }

  function isInBuilder(){
    try{
      window.parent.jimuConfig;
    }catch(err){
      //cross domain error
      return false;
    }
    return window !== window.parent && window.parent.jimuConfig && window.parent.jimuConfig.isBuilder? true: false;
  }

})();