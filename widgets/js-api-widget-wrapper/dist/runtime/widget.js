define(["esri/widgets/DistanceMeasurement2D","jimu-arcgis","jimu-core"], function(__WEBPACK_EXTERNAL_MODULE_esri_widgets_DistanceMeasurement2D__, __WEBPACK_EXTERNAL_MODULE_jimu_arcgis__, __WEBPACK_EXTERNAL_MODULE_jimu_core__) { return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./js-api-widget-wrapper-experience-builder/widgets/js-api-widget-wrapper/src/runtime/widget.tsx");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./js-api-widget-wrapper-experience-builder/widgets/js-api-widget-wrapper/src/runtime/widget.tsx":
/*!*******************************************************************************************************!*\
  !*** ./js-api-widget-wrapper-experience-builder/widgets/js-api-widget-wrapper/src/runtime/widget.tsx ***!
  \*******************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nvar __extends = (this && this.__extends) || (function () {\r\n    var extendStatics = function (d, b) {\r\n        extendStatics = Object.setPrototypeOf ||\r\n            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||\r\n            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };\r\n        return extendStatics(d, b);\r\n    };\r\n    return function (d, b) {\r\n        extendStatics(d, b);\r\n        function __() { this.constructor = d; }\r\n        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\r\n    };\r\n})();\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\n/** @jsx jsx */\r\nvar jimu_core_1 = __webpack_require__(/*! jimu-core */ \"jimu-core\");\r\nvar jimu_arcgis_1 = __webpack_require__(/*! jimu-arcgis */ \"jimu-arcgis\");\r\nvar DistanceMeasurement2D = __webpack_require__(/*! esri/widgets/DistanceMeasurement2D */ \"esri/widgets/DistanceMeasurement2D\");\r\nvar Widget = /** @class */ (function (_super) {\r\n    __extends(Widget, _super);\r\n    function Widget(props) {\r\n        var _this = _super.call(this, props) || this;\r\n        _this.myRef = jimu_core_1.React.createRef();\r\n        _this.activeViewChangeHandler = function (jmv) {\r\n            if (_this.state.jimuMapView) {\r\n                // we have a \"previous\" map where we added the widget\r\n                // (ex: case where two Maps in single Experience page and user is switching\r\n                // between them in the dropdown) - we must destroy the old widget in this case.\r\n                if (_this.state.currentWidget) {\r\n                    _this.state.currentWidget.destroy();\r\n                }\r\n            }\r\n            if (jmv) {\r\n                _this.setState({\r\n                    jimuMapView: jmv\r\n                });\r\n                if (_this.myRef.current) {\r\n                    // since the widget replaces the container, we must create a new DOM node\r\n                    // so when we destroy we will not remove the \"ref\" DOM node\r\n                    var container = document.createElement(\"div\");\r\n                    _this.myRef.current.appendChild(container);\r\n                    var distanceMeasurement2D = new DistanceMeasurement2D({\r\n                        view: jmv.view,\r\n                        container: container\r\n                    });\r\n                    // Save reference to the \"Current widget\" in State so we can destroy later if necessary.\r\n                    _this.setState({\r\n                        currentWidget: distanceMeasurement2D\r\n                    });\r\n                }\r\n                else {\r\n                    console.error('could not find this.myRef.current');\r\n                }\r\n            }\r\n        };\r\n        // activeViewChangeHandler is not called in the builder when \"None\" is selected\r\n        // for the map, so we must cleanup here:\r\n        _this.componentDidUpdate = function (evt) {\r\n            if (_this.props.useMapWidgetIds.length === 0) {\r\n                // \"None\" was selected in the \"Select map widget\" dropdown:\r\n                if (_this.state.currentWidget) {\r\n                    _this.state.currentWidget.destroy();\r\n                }\r\n            }\r\n        };\r\n        _this.state = {\r\n            jimuMapView: null,\r\n            currentWidget: null\r\n        };\r\n        return _this;\r\n    }\r\n    Widget.prototype.render = function () {\r\n        // If the user has selected a map, include JimuMapViewComponent.\r\n        // If not, show a message asking for the Experience Author to select it.\r\n        var jmc = jimu_core_1.jsx(\"p\", null, \"Please select a map.\");\r\n        if (this.props.hasOwnProperty(\"useMapWidgetIds\") &&\r\n            this.props.useMapWidgetIds &&\r\n            this.props.useMapWidgetIds.length === 1) {\r\n            jmc = (jimu_core_1.jsx(jimu_arcgis_1.JimuMapViewComponent, { useMapWidgetIds: this.props.useMapWidgetIds, onActiveViewChange: this.activeViewChangeHandler }));\r\n        }\r\n        return (jimu_core_1.jsx(\"div\", { className: \"widget-js-api-widget-wrapper jimu-widget\", style: { overflow: \"auto\" } },\r\n            jimu_core_1.jsx(\"div\", { className: \"here\", ref: this.myRef }),\r\n            jmc));\r\n    };\r\n    return Widget;\r\n}(jimu_core_1.BaseWidget));\r\nexports.default = Widget;\r\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9qcy1hcGktd2lkZ2V0LXdyYXBwZXItZXhwZXJpZW5jZS1idWlsZGVyL3dpZGdldHMvanMtYXBpLXdpZGdldC13cmFwcGVyL3NyYy9ydW50aW1lL3dpZGdldC50c3guanMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9qcy1hcGktd2lkZ2V0LXdyYXBwZXItZXhwZXJpZW5jZS1idWlsZGVyL3dpZGdldHMvanMtYXBpLXdpZGdldC13cmFwcGVyL3NyYy9ydW50aW1lL3dpZGdldC50c3g/YWNiMyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiogQGpzeCBqc3ggKi9cclxuaW1wb3J0IHsgQWxsV2lkZ2V0UHJvcHMsIEJhc2VXaWRnZXQsIGpzeCwgUmVhY3QgfSBmcm9tIFwiamltdS1jb3JlXCI7XHJcbmltcG9ydCB7IElNQ29uZmlnIH0gZnJvbSBcIi4uL2NvbmZpZ1wiO1xyXG5pbXBvcnQgeyBKaW11TWFwVmlld0NvbXBvbmVudCwgSmltdU1hcFZpZXcgfSBmcm9tIFwiamltdS1hcmNnaXNcIjtcclxuXHJcbmltcG9ydCBEaXN0YW5jZU1lYXN1cmVtZW50MkQgPSByZXF1aXJlKFwiZXNyaS93aWRnZXRzL0Rpc3RhbmNlTWVhc3VyZW1lbnQyRFwiKTtcclxuXHJcbmludGVyZmFjZSBJU3RhdGUge1xyXG4gIGppbXVNYXBWaWV3OiBKaW11TWFwVmlldztcclxuICBjdXJyZW50V2lkZ2V0OiBEaXN0YW5jZU1lYXN1cmVtZW50MkQ7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdpZGdldCBleHRlbmRzIEJhc2VXaWRnZXQ8QWxsV2lkZ2V0UHJvcHM8SU1Db25maWc+LCBhbnk+IHtcclxuICBwcml2YXRlIG15UmVmID0gUmVhY3QuY3JlYXRlUmVmPEhUTUxEaXZFbGVtZW50PigpO1xyXG5cclxuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xyXG4gICAgc3VwZXIocHJvcHMpO1xyXG4gICAgdGhpcy5zdGF0ZSA9IHtcclxuICAgICAgamltdU1hcFZpZXc6IG51bGwsXHJcbiAgICAgIGN1cnJlbnRXaWRnZXQ6IG51bGxcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBhY3RpdmVWaWV3Q2hhbmdlSGFuZGxlciA9IChqbXY6IEppbXVNYXBWaWV3KSA9PiB7XHJcbiAgICBpZiAodGhpcy5zdGF0ZS5qaW11TWFwVmlldykge1xyXG4gICAgICAvLyB3ZSBoYXZlIGEgXCJwcmV2aW91c1wiIG1hcCB3aGVyZSB3ZSBhZGRlZCB0aGUgd2lkZ2V0XHJcbiAgICAgIC8vIChleDogY2FzZSB3aGVyZSB0d28gTWFwcyBpbiBzaW5nbGUgRXhwZXJpZW5jZSBwYWdlIGFuZCB1c2VyIGlzIHN3aXRjaGluZ1xyXG4gICAgICAvLyBiZXR3ZWVuIHRoZW0gaW4gdGhlIGRyb3Bkb3duKSAtIHdlIG11c3QgZGVzdHJveSB0aGUgb2xkIHdpZGdldCBpbiB0aGlzIGNhc2UuXHJcbiAgICAgIGlmICh0aGlzLnN0YXRlLmN1cnJlbnRXaWRnZXQpIHtcclxuICAgICAgICB0aGlzLnN0YXRlLmN1cnJlbnRXaWRnZXQuZGVzdHJveSgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGptdikge1xyXG4gICAgICB0aGlzLnNldFN0YXRlKHtcclxuICAgICAgICBqaW11TWFwVmlldzogam12XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgaWYodGhpcy5teVJlZi5jdXJyZW50KSB7XHJcbiAgICAgICAgLy8gc2luY2UgdGhlIHdpZGdldCByZXBsYWNlcyB0aGUgY29udGFpbmVyLCB3ZSBtdXN0IGNyZWF0ZSBhIG5ldyBET00gbm9kZVxyXG4gICAgICAgIC8vIHNvIHdoZW4gd2UgZGVzdHJveSB3ZSB3aWxsIG5vdCByZW1vdmUgdGhlIFwicmVmXCIgRE9NIG5vZGVcclxuICAgICAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgICAgIHRoaXMubXlSZWYuY3VycmVudC5hcHBlbmRDaGlsZChjb250YWluZXIpO1xyXG4gIFxyXG4gICAgICAgIGNvbnN0IGRpc3RhbmNlTWVhc3VyZW1lbnQyRCA9IG5ldyBEaXN0YW5jZU1lYXN1cmVtZW50MkQoe1xyXG4gICAgICAgICAgdmlldzogam12LnZpZXcsXHJcbiAgICAgICAgICBjb250YWluZXI6IGNvbnRhaW5lclxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIFNhdmUgcmVmZXJlbmNlIHRvIHRoZSBcIkN1cnJlbnQgd2lkZ2V0XCIgaW4gU3RhdGUgc28gd2UgY2FuIGRlc3Ryb3kgbGF0ZXIgaWYgbmVjZXNzYXJ5LlxyXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xyXG4gICAgICAgICAgY3VycmVudFdpZGdldDogZGlzdGFuY2VNZWFzdXJlbWVudDJEXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcignY291bGQgbm90IGZpbmQgdGhpcy5teVJlZi5jdXJyZW50Jyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9O1xyXG5cclxuICAvLyBhY3RpdmVWaWV3Q2hhbmdlSGFuZGxlciBpcyBub3QgY2FsbGVkIGluIHRoZSBidWlsZGVyIHdoZW4gXCJOb25lXCIgaXMgc2VsZWN0ZWRcclxuICAvLyBmb3IgdGhlIG1hcCwgc28gd2UgbXVzdCBjbGVhbnVwIGhlcmU6XHJcbiAgY29tcG9uZW50RGlkVXBkYXRlID0gZXZ0ID0+IHtcclxuICAgIGlmICh0aGlzLnByb3BzLnVzZU1hcFdpZGdldElkcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgLy8gXCJOb25lXCIgd2FzIHNlbGVjdGVkIGluIHRoZSBcIlNlbGVjdCBtYXAgd2lkZ2V0XCIgZHJvcGRvd246XHJcbiAgICAgIGlmICh0aGlzLnN0YXRlLmN1cnJlbnRXaWRnZXQpIHtcclxuICAgICAgICB0aGlzLnN0YXRlLmN1cnJlbnRXaWRnZXQuZGVzdHJveSgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgcmVuZGVyKCkge1xyXG4gICAgLy8gSWYgdGhlIHVzZXIgaGFzIHNlbGVjdGVkIGEgbWFwLCBpbmNsdWRlIEppbXVNYXBWaWV3Q29tcG9uZW50LlxyXG4gICAgLy8gSWYgbm90LCBzaG93IGEgbWVzc2FnZSBhc2tpbmcgZm9yIHRoZSBFeHBlcmllbmNlIEF1dGhvciB0byBzZWxlY3QgaXQuXHJcbiAgICBsZXQgam1jID0gPHA+UGxlYXNlIHNlbGVjdCBhIG1hcC48L3A+O1xyXG4gICAgaWYgKFxyXG4gICAgICB0aGlzLnByb3BzLmhhc093blByb3BlcnR5KFwidXNlTWFwV2lkZ2V0SWRzXCIpICYmXHJcbiAgICAgIHRoaXMucHJvcHMudXNlTWFwV2lkZ2V0SWRzICYmXHJcbiAgICAgIHRoaXMucHJvcHMudXNlTWFwV2lkZ2V0SWRzLmxlbmd0aCA9PT0gMVxyXG4gICAgKSB7XHJcbiAgICAgIGptYyA9IChcclxuICAgICAgICA8SmltdU1hcFZpZXdDb21wb25lbnRcclxuICAgICAgICAgIHVzZU1hcFdpZGdldElkcz17dGhpcy5wcm9wcy51c2VNYXBXaWRnZXRJZHN9XHJcbiAgICAgICAgICBvbkFjdGl2ZVZpZXdDaGFuZ2U9e3RoaXMuYWN0aXZlVmlld0NoYW5nZUhhbmRsZXJ9XHJcbiAgICAgICAgLz5cclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gKFxyXG4gICAgICA8ZGl2XHJcbiAgICAgICAgY2xhc3NOYW1lPVwid2lkZ2V0LWpzLWFwaS13aWRnZXQtd3JhcHBlciBqaW11LXdpZGdldFwiXHJcbiAgICAgICAgc3R5bGU9e3sgb3ZlcmZsb3c6IFwiYXV0b1wiIH19XHJcbiAgICAgID5cclxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImhlcmVcIiByZWY9e3RoaXMubXlSZWZ9PjwvZGl2PlxyXG4gICAgICAgIHtqbWN9XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgKTtcclxuICB9XHJcbn1cclxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBRUE7QUFFQTtBQU9BO0FBQUE7QUFHQTtBQUFBO0FBRkE7QUFVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFsREE7QUFDQTtBQUNBO0FBQ0E7O0FBQ0E7QUFnREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFFQTtBQU1BO0FBRUE7QUFLQTtBQUNBO0FBR0E7QUFDQTtBQUFBOzsiLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./js-api-widget-wrapper-experience-builder/widgets/js-api-widget-wrapper/src/runtime/widget.tsx\n");

/***/ }),

/***/ "esri/widgets/DistanceMeasurement2D":
/*!*****************************************************!*\
  !*** external "esri/widgets/DistanceMeasurement2D" ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = __WEBPACK_EXTERNAL_MODULE_esri_widgets_DistanceMeasurement2D__;//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXNyaS93aWRnZXRzL0Rpc3RhbmNlTWVhc3VyZW1lbnQyRC5qcyIsInNvdXJjZXMiOlsid2VicGFjazovLy9leHRlcm5hbCBcImVzcmkvd2lkZ2V0cy9EaXN0YW5jZU1lYXN1cmVtZW50MkRcIj85MDMyIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV9lc3JpX3dpZGdldHNfRGlzdGFuY2VNZWFzdXJlbWVudDJEX187Il0sIm1hcHBpbmdzIjoiQUFBQSIsInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///esri/widgets/DistanceMeasurement2D\n");

/***/ }),

/***/ "jimu-arcgis":
/*!******************************!*\
  !*** external "jimu-arcgis" ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = __WEBPACK_EXTERNAL_MODULE_jimu_arcgis__;//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiamltdS1hcmNnaXMuanMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJqaW11LWFyY2dpc1wiPzlmMWMiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFX2ppbXVfYXJjZ2lzX187Il0sIm1hcHBpbmdzIjoiQUFBQSIsInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///jimu-arcgis\n");

/***/ }),

/***/ "jimu-core":
/*!****************************!*\
  !*** external "jimu-core" ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = __WEBPACK_EXTERNAL_MODULE_jimu_core__;//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiamltdS1jb3JlLmpzIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiamltdS1jb3JlXCI/YzY5NSJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfamltdV9jb3JlX187Il0sIm1hcHBpbmdzIjoiQUFBQSIsInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///jimu-core\n");

/***/ })

/******/ })});;