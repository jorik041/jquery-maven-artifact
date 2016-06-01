/**
 * jQuery Maven Artifact Plugin
 *
 * Version: 2.0.0
 * Author: Jake Wharton
 * License: Apache 2.0
 *
 * Modified: Tankery Chen
 */
(function($) {
  var defaults = {
    'packaging': 'jar'
  };

  function downloadUrl(config, version) {
    var groupPath = config.groupId.replace(/\./g, '/');
    var url = 'https://jcenter.bintray.com/' + groupPath + '/' + config.artifactId + '/' + version + '/' + config.artifactId + '-' + version;
    if (typeof(config.classifier) !== 'undefined') {
      url += '-' + config.classifier;
    }
    url += '.' + config.packaging;
    return url;
  }

  function queryBuilder(config) {
    var propertiesToQuery = {
      'groupId': 'g',
      'artifactId': 'a',
      'packaging': 'p',
      'classifier': 'l'
    };
    var query = '';
    for (var property in propertiesToQuery) {
      if (propertiesToQuery.hasOwnProperty(property) && config.hasOwnProperty(property)) {
        query += '&' + propertiesToQuery[property] + '=' + config[property];
      }
    }
    return query;
  }

  $.fn.artifactVersion = function(config, callback) {
    if (typeof(config) === 'undefined') {
      alert('Error: config object is required.');
      return;
    }
    if (typeof(callback) === 'undefined') {
      alert('Error: callback function required.');
      return;
    }
    var config = $.extend({}, defaults, config);

    var url = 'https://api.bintray.com/search/packages/maven?q=' + queryBuilder(config) + '&wt=json&json.wrf=?';

    $.getJSON(url, function(response) {
      var versions = response;
      if (versions.length == 0) {
        return;
      }

      var version = versions[0].latest_version || versions[0].v;
      var versionUrl = downloadUrl(config, version);
      callback(version, versionUrl);
    });
  };

  $.fn.artifactVersions = function(config, callback) {
    if (typeof(config) === 'undefined') {
      alert('Error: config object is required.');
      return;
    }
    if (typeof(callback) === 'undefined') {
      alert('Error: callback function required.');
      return;
    }
    var config = $.extend({}, defaults, config);

    var url = 'https://api.bintray.com/search/packages/maven?q=' + queryBuilder(config) + '&wt=json&rows=10&core=gav&json.wrf=?';
    $.getJSON(url, function(response) {
      var versions = response;
      if (versions.length == 0) {
        return;
      }
      versions.sort(function(o1, o2) {
        return o1.latest_version > o2.latest_version ? -1 : 1;
      });
      var newVersions = [];
      for (var i = 0; i < versions.length; i++) {
        var version = versions[i].latest_version;
        newVersions.push({
          name: version,
          url: downloadUrl(config, version)
        });
      }
      callback(newVersions);
    });
  }
})(jQuery);
