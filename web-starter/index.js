'use strict';
var generators = require('yeoman-generator'),
  _ = require('lodash'),
  pkg = require('../package.json'),
  Promise = require('bluebird'),
  glob = Promise.promisify(require('glob'));

module.exports = generators.Base.extend({
  initializing : {
    async : function() {
      this.options.addDevDependency(pkg.name, '~' + pkg.version);
    },
    install: function () {
        this.spawnCommand('composer', ['install']);
    },
  },
  prompting : function() {
    var that = this;
    var config = _.extend({
      // Put default config values here
      alias : '',
      host : '',
      stage_host : '',
    }, this.config.getAll());

    return that.prompt([{
      // Put config prompts here
      name : 'alias',
      message : 'What do you want your Drush alias to be?',
      default : config.alias
    },
    {
      // Put config prompts here
      name : 'host',
      message : 'What is the dev server host?',
      default : config.host
    },
    {
      // Put config prompts here
      name : 'stage_host',
      message : 'What is the stage server host?',
      default : config.stage_host
    }])
    .then(function(answers) {
      that.config.set(answers);

      // Expose the answers on the parent generator
      _.extend(that.options.parent.answers, { 'web-starter-behat' : answers });
    });
  },
  writing : {
    // Put functions to write files / directories here
    settings : function() {
      // Get current system config for this sub-generator
      var config = this.config.getAll();
      _.extend(config, this.options.parent.answers);

      var that = this;
      
      var ignoreFiles = ['tests/behat/chromedriver','tests/behat/selenium-server-standalone-2.53.1.jar', 'tests/behat/files/*'];
      
      return glob('**', {
        cwd : this.templatePath(''), 
        dot: true, 
        nodir : true,
        ignore : ignoreFiles
      }).then(function(files) {
        _.each(files, function(file) {
          that.fs.copyTpl(that.templatePath(file), that.destinationPath(file), config);
        });
        _.each(ignoreFiles, function(file) {
          that.fs.copy(that.templatePath(file), that.destinationPath(file), config);
        });
      });
    }
  }
});
