/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/htdocs/assets/js/common.js":
/*!****************************************!*\
  !*** ./src/htdocs/assets/js/common.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jquery */ \"./node_modules/jquery/dist/jquery.js\");\n/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var magnific_popup__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! magnific-popup */ \"./node_modules/magnific-popup/dist/jquery.magnific-popup.js\");\n/* harmony import */ var magnific_popup__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(magnific_popup__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var slick_carousel__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! slick-carousel */ \"./node_modules/slick-carousel/slick/slick.js\");\n/* harmony import */ var slick_carousel__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(slick_carousel__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _components_Carousel_1_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./components/_Carousel_1.js */ \"./src/htdocs/assets/js/components/_Carousel_1.js\");\n/* harmony import */ var _components_locationHash_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./components/_locationHash.js */ \"./src/htdocs/assets/js/components/_locationHash.js\");\n/* harmony import */ var _components_SmoothScroll_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./components/_SmoothScroll.js */ \"./src/htdocs/assets/js/components/_SmoothScroll.js\");\n\n\n\n\n\n\n\nwindow.COMMON = new Object();\n\njquery__WEBPACK_IMPORTED_MODULE_0___default()(function(){\n\t\n\tCOMMON.$window = jquery__WEBPACK_IMPORTED_MODULE_0___default()(window);\n\tCOMMON.$document = jquery__WEBPACK_IMPORTED_MODULE_0___default()(document);\n\tCOMMON.$html_body = jquery__WEBPACK_IMPORTED_MODULE_0___default()('html, body');\n\tCOMMON.$html = jquery__WEBPACK_IMPORTED_MODULE_0___default()('html');\n\tCOMMON.$body = jquery__WEBPACK_IMPORTED_MODULE_0___default()('body');\n\t\n\t//console.log( window );\n\t\n\tjquery__WEBPACK_IMPORTED_MODULE_0___default()('.carousel_1').each(function(){\n\t\tnew _components_Carousel_1_js__WEBPACK_IMPORTED_MODULE_3__[\"default\"]({\n\t\t\tel: this\n\t\t});\n\t});\n\t\n//\t ignite();\n//\t placeholder();\n\t\n\t(0,_components_locationHash_js__WEBPACK_IMPORTED_MODULE_4__[\"default\"])();\n\n\tnew _components_SmoothScroll_js__WEBPACK_IMPORTED_MODULE_5__[\"default\"]();\n\t\n});\n\n//ゼロパディング\nCOMMON.zeroPadding = function(num, len){\n\treturn ( Array(len).join('0') + num ).slice( -len );\n}\n\n\n//# sourceURL=webpack:///./src/htdocs/assets/js/common.js?");

/***/ }),

/***/ "./src/htdocs/assets/js/components/_Carousel_1.js":
/*!********************************************************!*\
  !*** ./src/htdocs/assets/js/components/_Carousel_1.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ Carousel_1)\n/* harmony export */ });\n/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jquery */ \"./node_modules/jquery/dist/jquery.js\");\n/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var slick_carousel__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! slick-carousel */ \"./node_modules/slick-carousel/slick/slick.js\");\n/* harmony import */ var slick_carousel__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(slick_carousel__WEBPACK_IMPORTED_MODULE_1__);\n\n\n\nclass Carousel_1 {\n\t\n\t#slick;\n\t#$el;\n\t#$item;\n\t#$number;\n\t#max;\n\t\n\tconstructor(opts) {\n\t\tconst self = this;\n\t\tthis.#$el = jquery__WEBPACK_IMPORTED_MODULE_0___default()(opts.el);\n\t\tconsole.log(\"this.#$el\", this.#$el);\n\t\t\n\t\tthis.#$item = this.#$el.find(\".carousel_1__item\");\n\t\tthis.#max = COMMON.zeroPadding(this.#$item.length,2);\n\t\tconsole.log(\"this.#max\", this.#max);\n\t\t\n\t\tthis.#$number = this.#$el.find(\".carousel_1__number\");\n\t\tthis.#$number.text(\"01 / \"+this.#max);\n\t\t\n\t\tthis.#$el.find(\".carousel_1__items\").slick({\n\t\t\tarrows: true,\n\t\t\tdots: true,\n\t\t}).on('beforeChange', function(event, slick, current, next){\n\t\t\t\tconsole.log('beforeChange', current, next);\n\t\t\t})\n\t\t\t.on('afterChange', function(event, slick, current){\n\t\t\t\tconsole.log('afterChange', current);\n\t\t\t\tcurrent = COMMON.zeroPadding(++current,2);\n\t\t\t\tself.#$number.text(current+\" / \"+self.#max);\n\t\t\t});\n\t}\n\t\n}\n\n//# sourceURL=webpack:///./src/htdocs/assets/js/components/_Carousel_1.js?");

/***/ }),

/***/ "./src/htdocs/assets/js/components/_SmoothScroll.js":
/*!**********************************************************!*\
  !*** ./src/htdocs/assets/js/components/_SmoothScroll.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jquery */ \"./node_modules/jquery/dist/jquery.js\");\n/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_0__);\n\r\n\r\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (class {\r\n\t\r\n\t#option;\r\n\t#$html;\r\n\t#SPEED_DEFAULT = 800; // 最初の速度\r\n\t#SPEED_REPEAT = 800; // 繰り返し時の速度\r\n\r\n\tconstructor(opts) {\r\n\t\tthis.#option = jquery__WEBPACK_IMPORTED_MODULE_0___default().extend({\r\n\t\t\ttarget: '[data-smooth-scroll]',\r\n\t\t\tgnav: null,\r\n\t\t}, opts);\r\n\r\n\t\tthis.#$html = jquery__WEBPACK_IMPORTED_MODULE_0___default()('html');\r\n\r\n\t\tjquery__WEBPACK_IMPORTED_MODULE_0___default()('a' + this.#option.target).on('click', this.#click);\r\n\t\tjquery__WEBPACK_IMPORTED_MODULE_0___default()(this.#option.target).find('a[href*=\"#\"]').click(this.#click);\r\n\t}\r\n\t\r\n\t#scrollAnimate = ($this, positionStart, scrollSpeed) => {\r\n\t\tconst self = this;\r\n\t\tthis.#$html.animate({\r\n\t\t\tscrollTop: positionStart\r\n\t\t}, scrollSpeed, 'swing', function(){\r\n\t\t\t// スクロールアニメーション終了時に、目的地のY座標を取得\r\n\t\t\tconst positionEnd = $this.offset().top;\r\n\t\t\t\r\n\t\t\t// 処理を繰り返すかの判定\r\n\t\t\t// 目的地のY座標が変わっていたらやり直し\r\n\t\t\tif(positionStart !== positionEnd) {\r\n\t\t\t\tself.#scrollAnimate($this, positionEnd, self.#SPEED_REPEAT);\r\n\t\t\t}\r\n\t\t});\r\n\t}\r\n\t\r\n\t#click = (e) => {\r\n\t\tconst $me = jquery__WEBPACK_IMPORTED_MODULE_0___default()(e.currentTarget),\r\n\t\t\t\t\thref = $me.attr('href'),\r\n\t\t\t\t\thash = this.#extractHash(href),\r\n\t\t\t\t\t$hash = jquery__WEBPACK_IMPORTED_MODULE_0___default()(hash);\r\n\t\tconsole.log('hash', hash);\r\n\t\tif ( $hash.length ) {\r\n\t\t\te.preventDefault();\r\n\t\t\tif ( this.#option.gnav ) {\r\n\t\t\t\tthis.#option.gnav.close();\r\n\t\t\t}\r\n\t\t\tconst positionStart = $hash.offset().top;\r\n\t\t\tthis.#scrollAnimate($hash, positionStart, this.#SPEED_DEFAULT);\r\n\t\t}\r\n\t}\r\n\r\n\t#extractHash(href) {\r\n\t\tconst hash = href.match(/#(.*)/);\r\n\t\treturn hash ? hash[0] : null;\r\n\t}\r\n\t\r\n});\n\n//# sourceURL=webpack:///./src/htdocs/assets/js/components/_SmoothScroll.js?");

/***/ }),

/***/ "./src/htdocs/assets/js/components/_locationHash.js":
/*!**********************************************************!*\
  !*** ./src/htdocs/assets/js/components/_locationHash.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* export default binding */ __WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jquery */ \"./node_modules/jquery/dist/jquery.js\");\n/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_0__);\n\n\n/* harmony default export */ function __WEBPACK_DEFAULT_EXPORT__() {\n\tconsole.count('locationHash.js');\n\t\n\twindow.addEventListener('hashchange', function(e){\n\t\tconsole.log('hashchange', location.hash, '' === location.hash);\n\t\tif ( '' === location.hash ) {\n\t\t\te.preventDefault();\n\t\t}\n\t}, false);\n\t\n}\n\n//# sourceURL=webpack:///./src/htdocs/assets/js/components/_locationHash.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"assets/js/common": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunk"] = self["webpackChunk"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["assets/js/vendor"], () => (__webpack_require__("./src/htdocs/assets/js/common.js")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;