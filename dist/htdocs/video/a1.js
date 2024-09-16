/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/htdocs/video/a1.js":
/*!********************************!*\
  !*** ./src/htdocs/video/a1.js ***!
  \********************************/
/***/ (() => {

eval("gsap.registerPlugin(ScrollTrigger);\n\n// 演出対象となる要素を取得\ngsap.utils.toArray(\".c_video_1 > div\").forEach((el) => {\n  gsap.fromTo(el, {\n    width: \"280px\",//'0vw',\n    height: \"280px\",//'0vh',\n  }, {\n    width: '100vw',\n    height: '100vh',\n    //scale: .5,\n    ease: Power0.easeNone,\n    scrollTrigger: {\n      trigger: el,\n      scrub: true,\n      start: \"center center\",\n    },\n  });\n\n});\n\ngsap.utils.toArray(\".c_video_1 > div > div\").forEach((el) => {\n  gsap.fromTo(el, {\n    //scale: .65\n    width: \"400px\",//'0vw',\n    height: \"400px\",//'0vh',\n  }, {\n    //scale: 1,\n    width: '100vw',\n    height: '100vh',\n    ease: Power0.easeNone,\n    scrollTrigger: {\n      trigger: el,\n      scrub: true,\n      start: \"center center\",\n    },\n  });\n});\n\n//\ngsap.utils.toArray(\".js_video_1\").forEach((el) => {\n  const ID = el.dataset.id;\n  console.log('ID', ID);\n  if ( !ID ) return;\n  const videoSrc = 'src/' + ID + '.m3u8';\n  if (Hls.isSupported()) {\n    const hls = new Hls();\n    hls.loadSource(videoSrc);\n    hls.attachMedia(el);\n  } else if (el.canPlayType('application/vnd.apple.mpegurl')) {\n    video.src = videoSrc;\n  }\n});\n\n\n//# sourceURL=webpack:///./src/htdocs/video/a1.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/htdocs/video/a1.js"]();
/******/ 	
/******/ })()
;