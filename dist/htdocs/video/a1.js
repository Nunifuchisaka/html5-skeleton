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

/***/ "./src/htdocs/video/a1.js":
/*!********************************!*\
  !*** ./src/htdocs/video/a1.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _components_Article_1_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./components/_Article_1.js */ \"./src/htdocs/video/components/_Article_1.js\");\n\n\ngsap.registerPlugin(ScrollTrigger);\n\n// 動画を自動ストリーミング再生\ngsap.utils.toArray(\".js_video_1\").forEach((el) => {\n\tconst ID = el.dataset.id;\n\t// console.log('ID', ID);\n\tif ( !ID ) return;\n\tconst videoSrc = 'src/' + ID + '.m3u8';\n\tif (Hls.isSupported()) {\n\t\tconst hls = new Hls();\n\t\thls.loadSource(videoSrc);\n\t\thls.attachMedia(el);\n\t} else if (el.canPlayType('application/vnd.apple.mpegurl')) {\n\t\tel.src = videoSrc;\n\t}\n});\n\n// スクロールに応じて動画を拡大 1/2 外側\ngsap.utils.toArray(\".c_video_1__1\").forEach((el) => {\n\tgsap.fromTo(el, {\n\t\twidth: \"280px\",\n\t\theight: \"280px\",\n\t}, {\n\t\twidth: \"100vw\",\n\t\theight: \"100vh\",\n\t\tease: Power0.easeNone,\n\t\tscrollTrigger: {\n\t\t\ttrigger: el,\n\t\t\tscrub: true,\n\t\t\tstart: \"center center\",\n\t\t},\n\t});\n});\n\n// スクロールに応じて動画を拡大 2/2 内側\ngsap.utils.toArray(\".c_video_1__2\").forEach((el) => {\n\tgsap.fromTo(el, {\n\t\t//scale: .65\n\t\twidth: \"400px\",\n\t\theight: \"400px\",\n\t}, {\n\t\t//scale: 1,\n\t\twidth: \"100vw\",\n\t\theight: \"100vh\",\n\t\tease: Power0.easeNone,\n\t\tscrollTrigger: {\n\t\t\ttrigger: el,\n\t\t\tscrub: true,\n\t\t\tstart: \"center center\",\n\t\t},\n\t});\n});\n\n// \nlet player,\n\t\tplayerSet = false,\n\t\tisYoutube = false;\n\ngsap.utils.toArray(\".c_article_1\").forEach((el) => {\n\tnew _components_Article_1_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"]({\n\t\tel: el\n\t});\n});\n\n\n//# sourceURL=webpack:///./src/htdocs/video/a1.js?");

/***/ }),

/***/ "./src/htdocs/video/components/_Article_1.js":
/*!***************************************************!*\
  !*** ./src/htdocs/video/components/_Article_1.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n//import $ from 'jquery';\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (class {\n\n\t#$article;\n\t#observer;\n\t#$video_1;\n\t#$video;\n\t#$modal;\n\t#$youtube;\n\t#player;\n\t#playerSet = false;\n\t#isYoutube = false;\n\n\tconstructor(opts) {\n\t\tconsole.group(\"Article_1\");\n\t\tconst self = this;\n\t\tthis.#$article = $(opts.el);\n\t\tthis.#$video_1 = this.#$article.find(\".c_video_1\");\n\t\tthis.#$video = this.#$video_1.find(\"video\");\n\t\t// console.log(this.#$video);\n\t\t// console.log(this.#$video_1.find(\"a\"));\n\n\t\tthis.#$video_1.find(\"a\").click(\"click\", this.#click);\n\n\t\tthis.#$modal = this.#$article.find(\".c_section_1\");\n\t\tthis.#$modal.click(this.#close);\n\n\t\tthis.#$youtube = this.#$modal.find(\".c_video_2\");\n\n\t\t//observer1を作成\n\t\tthis.#observer = new IntersectionObserver(function(entries){\n\t\t\tfor(let i = 0; i < entries.length; i++) {\n\t\t\t\tif( entries[i].isIntersecting ){\n\t\t\t\t\t// $(entries[i].target).addClass('is_animation');\n\t\t\t\t\tself.#in();\n\t\t\t\t} else {\n\t\t\t\t\tself.#out();\n\t\t\t\t}\n\t\t\t}\n\t\t}, {\n\t\t\tthreshold: 0\n\t\t}).observe(this.#$article.get(0));\n\n\t\tconsole.groupEnd();\n\t}\n\n\t#in() {\n\t\tconsole.count(\"in\");\n\t\tthis.#$video.get(0).play();\n\t}\n\n\t#out() {\n\t\tconsole.count(\"out\");\n\t\tthis.#close();\n\t\tthis.#$video.get(0).pause();\n\t}\n\n\t#close = (event) => {\n\t\tif(event) event.preventDefault();\n\t\t// const $me = $(event.currentTarget);\n\t\t// console.count(\"#close\");\n\t\tif (this.#player) {\n\t\t\tthis.#player.pauseVideo();\n\t\t}\n\t\tthis.#$video.get(0).play();\n\t\t// this.#playerSet = false;\n\t\tthis.#$modal.hide();\n\t}\n\n\t#click = (event) => {\n\t\t// console.count(\"click\");\n\t\tevent.preventDefault();\n\t\t\n\t\tgsap.fromTo(this.#$youtube.get(0), {\n\t\t\topacity: 0,\n\t\t\t// onComplete: this.#close\n\t\t}, {\n\t\t\topacity: 1,\n\t\t\tonComplete: this.#open\n\t\t});\n\n\t\tthis.#$video.get(0).pause();\n\t}\n\n\t#open = () => {\n\t\tthis.#$modal.show();\n\t\t// $href.style.display = 'block';\n\t\tif (this.#player) {\n\t\t\tthis.#playYoutube();\n\t\t} else {\n\t\t\tthis.#setYoutube();\n\t\t}\n\t}\n\n\t#onPlayerReady(event) {\n\t\tevent.target.playVideo();\n\t}\n\n\t#playYoutube = () => {\n\t\tthis.#player.playVideo();\n\t}\n\n\t#setYoutube = () => {\n\t\tconsole.group(\"setYoutube\");\n\t\tconst videoID = this.#$youtube.children().attr(\"id\"),\n\t\t\t\t\tyoutubeID = this.#$youtube.data(\"youtube\");\n\t\tconsole.log(videoID);\n\t\tconsole.log(youtubeID);\n\t\tthis.#player = new YT.Player(videoID, {\n\t\t\theight: 1080,\n\t\t\twidth: 1920,\n\t\t\tvideoId: youtubeID,\n\t\t\tplayerVars: {\n\t\t\t\trel: 0,\n\t\t\t\tcontrols: 1,\n\t\t\t\tshowinfo: 0,\n\t\t\t\tautoplay: 1,\n\t\t\t},\n\t\t\tevents: {\n\t\t\t\tonReady: this.#onPlayerReady,\n\t\t\t}\n\t\t});\n\t\t// this.#playerSet = true;\n\t\tconsole.groupEnd();\n\t}\n});\n\n//# sourceURL=webpack:///./src/htdocs/video/components/_Article_1.js?");

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
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
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
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/htdocs/video/a1.js");
/******/ 	
/******/ })()
;