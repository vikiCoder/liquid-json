#!/usr/bin/env node
/* eslint-env node, es6 */

require('shelljs/global');

var async = require('async'),
    chalk = require('chalk'),
    _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    Mocha = require('mocha'),

    SPEC_SOURCE_DIR = path.join(__dirname, '..', 'test', 'system'),

    /**
     * Load a JSON from file synchronously
     *
     * @param {String} file
     * @returns {String}
     */
    loadJSON = function (file) {
        return JSON.parse(fs.readFileSync(path.join(__dirname, file)).toString());
    };

module.exports = function (exit) {
    // banner line
    console.info(chalk.yellow.bold('\nRunning system tests using mocha and nsp...'));

    async.series([
        // run test specs using mocha
        function (next) {
            var mocha = new Mocha();

            fs.readdir(SPEC_SOURCE_DIR, function (err, files) {
                files.filter(function (file) {
                    return (file.substr(-8) === '.test.js');
                }).forEach(function (file) {
                    mocha.addFile(path.join(SPEC_SOURCE_DIR, file));
                });

                // start the mocha run
                mocha.run(next);
                mocha = null; // cleanup
            });
        },

        // execute nsp
        // programmatically executing nsp is a bit tricky as we have to emulate the cli script's usage of internal
        // nsp functions.
        function (next) {
            var nsp = require('nsp'),
                pkg = loadJSON('../package.json'),
                nsprc = loadJSON('../.nsprc');

            console.info(chalk.yellow.bold('processing nsp for security vulnerabilities...\n'));

            // we do not pass full package for privacy concerns and also to add the ability to ignore exclude packages,
            // hence we customise the package before we send it
            nsp.check({
                offline: false,
                package: {
                    name: pkg.name,
                    dependencies: _.omit(pkg.dependencies, nsprc.exclusions || [])
                }
            }, function (err, result) {
                // if processing nsp had an error, simply print that and exit
                if (err) {
                    console.error(chalk.red('There was an error processing NSP!\n') + chalk.gray(err.message || err) +
                        '\n\nSince NSP server failure is not a blocker for tests, tests are not marked as failure!');
                    return next();
                }

                // in case an nsp vialation is found, we raise an error
                if (result.length) {
                    console.error(nsp.formatters.default(err, result));
                    return next(1);
                }

                console.info(chalk.green.bold('nsp ok!\n'));
                return next();
            });
        }
    ], exit);
};

// ensure we run this script exports if this is a direct stdin.tty run
!module.parent && module.exports(exit);
