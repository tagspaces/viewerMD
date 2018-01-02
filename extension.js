/* Copyright (c) 2013-present The TagSpaces Authors.
 * Use of this source code is governed by the MIT license which can be found in the LICENSE.txt file. */

define(function(require, exports, module) {
  "use strict";

  var extensionID = "viewerMD"; // ID should be equal to the directory name where the ext. is located
  var TSCORE = require('tscore');

  console.log("Loading " + extensionID);

  var md2htmlConverter;
  var containerElID;
  var currentFilePath;
  var $containerElement;
  var extensionDirectory = TSCORE.Config.getExtensionPath() + "/" + extensionID;

  function init(filePath, containerElementID) {
    console.log("Initialization MD Viewer...");
    containerElID = containerElementID;
    $containerElement = $('#' + containerElID);

    currentFilePath = filePath;
    $containerElement.empty();
    $containerElement.css("background-color", "white");
    $containerElement.append($('<iframe>', {
      sandbox: "allow-same-origin allow-scripts allow-modals",
      id: "iframeViewer",
      //"nwdisable": "",
      //"nwfaketop": "",
      "src": extensionDirectory + "/index.html?&locale=" + TSCORE.currentLanguage,
    }));

    TSCORE.IO.loadTextFilePromise(filePath).then(function(content) {
      setContent(content);
    });
  }

  function setFileType() {
    console.log("setFileType not supported on this extension");
  }

  function viewerMode(isViewerMode) {
    // set readonly
  }

  function setContent(content) {
    var UTF8_BOM = "\ufeff";

    // removing the UTF8 bom because it brakes thing like #header1 in the beginning of the document
    if (content.indexOf(UTF8_BOM) === 0) {
      content = content.substring(1, content.length);
    }

    var fileDirectory = TSCORE.TagUtils.extractContainingDirectoryPath(currentFilePath);

    if (isWeb) {
      fileDirectory = TSCORE.TagUtils.extractContainingDirectoryPath(location.href) + "/" + fileDirectory;
    }

    var cleanedContent = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
    var mdContent = TSCORE.Utils.convertMarkdown(cleanedContent);

    var contentWindow = document.getElementById("iframeViewer").contentWindow;
    if (typeof contentWindow.setContent === "function") {
      contentWindow.setContent(mdContent, fileDirectory);
    } else {
      // TODO optimize setTimeout
      window.setTimeout(function() {
        contentWindow.setContent(mdContent, fileDirectory);
      }, 500);
    }
  }

  function getContent() {
    console.log("Not implemented");
  }

  exports.init = init;
  exports.getContent = getContent;
  exports.setContent = setContent;
  exports.viewerMode = viewerMode;
  exports.setFileType = setFileType;

});
