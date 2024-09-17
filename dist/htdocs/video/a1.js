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

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _components_Article_1_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./components/_Article_1.js */ \"./src/htdocs/video/components/_Article_1.js\");\n\n\ngsap.registerPlugin(ScrollTrigger);\n\n// 動画を自動ストリーミング再生\ngsap.utils.toArray(\".js_video_1\").forEach((el) => {\n  const ID = el.dataset.id;\n  // console.log('ID', ID);\n  if ( !ID ) return;\n  const videoSrc = 'src/' + ID + '.m3u8';\n  if (Hls.isSupported()) {\n    const hls = new Hls();\n    hls.loadSource(videoSrc);\n    hls.attachMedia(el);\n  } else if (el.canPlayType('application/vnd.apple.mpegurl')) {\n    el.src = videoSrc;\n  }\n});\n\n// スクロールに応じて動画を拡大 1/2 外側\ngsap.utils.toArray(\".c_video_1__1\").forEach((el) => {\n  gsap.fromTo(el, {\n    width: \"280px\",\n    height: \"280px\",\n  }, {\n    width: \"100vw\",\n    height: \"100vh\",\n    ease: Power0.easeNone,\n    scrollTrigger: {\n      trigger: el,\n      scrub: true,\n      start: \"center center\",\n    },\n  });\n});\n\n// スクロールに応じて動画を拡大 2/2 内側\ngsap.utils.toArray(\".c_video_1__2\").forEach((el) => {\n  gsap.fromTo(el, {\n    //scale: .65\n    width: \"400px\",\n    height: \"400px\",\n  }, {\n    //scale: 1,\n    width: \"100vw\",\n    height: \"100vh\",\n    ease: Power0.easeNone,\n    scrollTrigger: {\n      trigger: el,\n      scrub: true,\n      start: \"center center\",\n    },\n  });\n});\n\n// \nlet player,\n    playerSet = false,\n    isYoutube = false;\n\ngsap.utils.toArray(\".c_article_1\").forEach((el) => {\n  new _components_Article_1_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"]({\n    el: el\n  });\n});\n\n\n//# sourceURL=webpack:///./src/htdocs/video/a1.js?");

/***/ }),

/***/ "./src/htdocs/video/components/_Article_1.js":
/*!***************************************************!*\
  !*** ./src/htdocs/video/components/_Article_1.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n//import $ from 'jquery';\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (class {\n\n  #$article;\n  #observer;\n  #$video_1;\n  #$video;\n  #$modal;\n  #$youtube;\n  #player;\n  #playerSet = false;\n  #isYoutube = false;\n\n  constructor(opts) {\n    console.group(\"Article_1\");\n    const self = this;\n    this.#$article = $(opts.el);\n    this.#$video_1 = this.#$article.find(\".c_video_1\");\n    this.#$video = this.#$video_1.find(\"video\");\n    // console.log(this.#$video);\n    // console.log(this.#$video_1.find(\"a\"));\n\n    this.#$video_1.find(\"a\").click(\"click\", this.#click);\n\n    this.#$modal = this.#$article.find(\".c_section_1\");\n    this.#$modal.click(this.#close);\n\n    this.#$youtube = this.#$modal.find(\".c_video_2\");\n\n    //observer1を作成\n    this.#observer = new IntersectionObserver(function(entries){\n      for(let i = 0; i < entries.length; i++) {\n        if( entries[i].isIntersecting ){\n          // $(entries[i].target).addClass('is_animation');\n          self.#in();\n        } else {\n          self.#out();\n        }\n      }\n    }, {\n      threshold: 0\n    }).observe(this.#$article.get(0));\n\n    console.groupEnd();\n  }\n\n  #in() {\n    console.count(\"in\");\n    this.#$video.get(0).play();\n  }\n\n  #out() {\n    console.count(\"out\");\n    this.#close();\n    this.#$video.get(0).pause();\n  }\n\n  #close = (event) => {\n    if(event) event.preventDefault();\n    // const $me = $(event.currentTarget);\n    // console.count(\"#close\");\n    if (this.#player) {\n      this.#player.pauseVideo();\n    }\n    this.#$video.get(0).play();\n    // this.#playerSet = false;\n    this.#$modal.hide();\n  }\n\n  #click = (event) => {\n    // console.count(\"click\");\n    event.preventDefault();\n    \n    gsap.fromTo(this.#$youtube.get(0), {\n      opacity: 0,\n      // onComplete: this.#close\n    }, {\n      opacity: 1,\n      onComplete: this.#open\n    });\n\n    this.#$video.get(0).pause();\n  }\n\n  #open = () => {\n    this.#$modal.show();\n    // $href.style.display = 'block';\n    if (this.#player) {\n      this.#playYoutube();\n    } else {\n      this.#setYoutube();\n    }\n  }\n\n  #onPlayerReady(event) {\n    event.target.playVideo();\n  }\n\n  #playYoutube = () => {\n    this.#player.playVideo();\n  }\n\n  #setYoutube = () => {\n    console.group(\"setYoutube\");\n    const videoID = this.#$youtube.children().attr(\"id\"),\n          youtubeID = this.#$youtube.data(\"youtube\");\n    console.log(videoID);\n    console.log(youtubeID);\n    this.#player = new YT.Player(videoID, {\n      height: 1080,\n      width: 1920,\n      videoId: youtubeID,\n      playerVars: {\n        rel: 0,\n        controls: 1,\n        showinfo: 0,\n        autoplay: 1,\n      },\n      events: {\n        onReady: this.#onPlayerReady,\n      }\n    });\n    // this.#playerSet = true;\n    console.groupEnd();\n  }\n});\n\n//# sourceURL=webpack:///./src/htdocs/video/components/_Article_1.js?");

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