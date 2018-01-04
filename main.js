/* Copyright (c) 2013-present The TagSpaces Authors.
 * Use of this source code is governed by the MIT license which can be found in the LICENSE.txt file. */
/* globals marked */
'use strict';

var $mdContent;

$(document).ready(init);

function init() {
  var locale = getParameterByName('locale');
  var filepath = getParameterByName('file');

  sendMessageToHost({ command: 'loadDefaultTextContent' });

  var extSettings;
  loadExtSettings();

  $mdContent = $('#mdContent');

  var styles = ['', 'solarized-dark', 'github', 'metro-vibes', 'clearness', 'clearness-dark'];
  var currentStyleIndex = 0;
  if (extSettings && extSettings.styleIndex) {
    currentStyleIndex = extSettings.styleIndex;
  }

  var zoomSteps = ['zoomSmallest', 'zoomSmaller', 'zoomSmall', 'zoomDefault', 'zoomLarge', 'zoomLarger', 'zoomLargest'];
  var currentZoomState = 3;
  if (extSettings && extSettings.zoomState) {
    currentZoomState = extSettings.zoomState;
  }

  $mdContent.removeClass();
  $mdContent.addClass('markdown ' + styles[currentStyleIndex] + ' ' + zoomSteps[currentZoomState]);

  $('#changeStyleButton').bind('click', function() {
    currentStyleIndex = currentStyleIndex + 1;
    if (currentStyleIndex >= styles.length) {
      currentStyleIndex = 0;
    }
    $mdContent.removeClass();
    $mdContent.addClass('markdown ' + styles[currentStyleIndex] + ' ' + zoomSteps[currentZoomState]);
    saveExtSettings();
  });

  $('#resetStyleButton').bind('click', function() {
    currentStyleIndex = 0;
    $mdContent.removeClass();
    $mdContent.addClass('markdown ' + styles[currentStyleIndex] + ' ' + zoomSteps[currentZoomState]);
    saveExtSettings();
  });

  $('#zoomInButton').bind('click', function() {
    currentZoomState++;
    if (currentZoomState >= zoomSteps.length) {
      currentZoomState = 6;
    }
    $mdContent.removeClass();
    $mdContent.addClass('markdown ' + styles[currentStyleIndex] + ' ' + zoomSteps[currentZoomState]);
    saveExtSettings();
  });

  $('#zoomOutButton').bind('click', function() {
    currentZoomState--;
    if (currentZoomState < 0) {
      currentZoomState = 0;
    }
    $mdContent.removeClass();
    $mdContent.addClass('markdown ' + styles[currentStyleIndex] + ' ' + zoomSteps[currentZoomState]);
    saveExtSettings();
  });

  $('#zoomResetButton').bind('click', function() {
    currentZoomState = 3;
    $mdContent.removeClass();
    $mdContent.addClass('markdown ' + styles[currentStyleIndex] + ' ' + zoomSteps[currentZoomState]);
    saveExtSettings();
  });

  // Init internationalization
  i18next.init({
    ns: {namespaces: ['ns.viewerMD']},
    debug: true,
    lng: locale,
    fallbackLng: 'en_US'
  }, function() {
    jqueryI18next.init(i18next, $);
    $('[data-i18n]').localize();
  });

  function saveExtSettings() {
    var settings = {
      'styleIndex': currentStyleIndex,
      'zoomState':  currentZoomState
    };
    localStorage.setItem('viewerMDSettings', JSON.stringify(settings));
  }

  function loadExtSettings() {
    extSettings = JSON.parse(localStorage.getItem('viewerMDSettings'));
  }

  /* TODO checks if works on cordova and web
  getFileContentPromise(filepath, 'text').then((content) => {
    setContent(content, filepath.substring(0, filepath.lastIndexOf('/')));
  }).catch(error => console.log('Error getting file content: ' + error));
  */
}

function setContent(content, fileDirectory) {
  $mdContent = $('#mdContent');
  content = marked(content);
  $mdContent.empty().append(content);

  //$('base').attr('href', fileDirectory + '//');

  if (fileDirectory.indexOf('file://') === 0) {
    fileDirectory = fileDirectory.substring(('file://').length, fileDirectory.length);
  }

  var hasURLProtocol = function(url) {
    return (
      url.indexOf('http://') === 0 ||
      url.indexOf('https://') === 0 ||
      url.indexOf('file://') === 0 ||
      url.indexOf('data:') === 0
    );
  };

  // fixing embedding of local image, audio and video files
  $mdContent.find('img[src], source[src]').each(function() {
    var currentSrc = $(this).attr('src');
    if (!hasURLProtocol(currentSrc)) {
      var path = (isWeb ? '' : 'file://') + fileDirectory + '/' + currentSrc;
      $(this).attr('src', path);
    }
  });

  $mdContent.find('a[href]').each(function() {
    var currentSrc = $(this).attr('href');
    var path;

    if(currentSrc.indexOf('#') === 0 ) {
      // Leave the default link behaviour by internal links
    } else {
      if (!hasURLProtocol(currentSrc)) {
        var path = (isWeb ? '' : 'file://') + fileDirectory + '/' + currentSrc;
        $(this).attr('href', path);
      }

      $(this).off();
      $(this).on('click', function(e) {
        e.preventDefault();
        if (path) {
          currentSrc = encodeURIComponent(path);
        }

        sendMessageToHost({command: 'openLinkExternally', link : currentSrc});
      });
    }
  });
}
