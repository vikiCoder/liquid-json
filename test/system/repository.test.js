/**
 * @fileOverview This test specs runs tests on the package.json file of repository. It has a set of strict tests on the
 * content of the file as well. Any change to package.json must be accompanied by valid test case in this spec-sheet.
 */
var _ = require('lodash'),
    expect = require('chai').expect,
    parseIgnore = require('parse-gitignore');

/* global describe, it */
describe('repository', function () {
    var fs = require('fs');

    describe('package.json', function () {
        var content,
            json;

        it('must exist', function (done) {
            fs.stat('./package.json', done);
        });

        it('must have readable content', function () {
            expect(content = fs.readFileSync('./package.json').toString()).to.be.ok;
        });

        it('content must be valid JSON', function () {
            expect(json = JSON.parse(content)).to.be.ok;
        });

        describe('package.json JSON data', function () {
            it('must have valid name, description and author', function () {
                expect(json.name).to.be.a('string');
                expect(json.description).to.be.a('string');
                expect(json.author).to.equal('Postman Labs <help@getpostman.com> (=)');
                expect(json.license).to.be.a('string');
            });

            it('must have a valid version string in form of <major>.<minor>.<revision>', function () {
                // eslint-disable-next-line max-len
                expect(json.version).to.match(/^((\d+)\.(\d+)\.(\d+))(?:-([\dA-Za-z-]+(?:\.[\dA-Za-z-]+)*))?(?:\+([\dA-Za-z-]+(?:\.[\dA-Za-z-]+)*))?$/);
            });
        });

        describe('script definitions', function () {
            it('files must exist', function () {
                var scriptRegex = /^node\snpm\/.*\.js/;

                expect(json.scripts).to.be.ok;
                json.scripts && Object.keys(json.scripts).forEach(function (scriptName) {
                    expect(scriptRegex.test(json.scripts[scriptName])).to.equal(true);
                    expect(fs.existsSync('npm/' + scriptName + '.js')).to.be.ok;
                });
            });

            it('must have the hashbang defined', function () {
                json.scripts && Object.keys(json.scripts).forEach(function (scriptName) {
                    var fileContent = fs.readFileSync('npm/' + scriptName + '.js').toString();
                    expect(fileContent).to.match(/^#!\/(bin\/bash|usr\/bin\/env\snode)[\r\n][\W\w]*$/g);
                });
            });
        });

        describe('devDependencies', function () {
            it('must exist', function () {
                expect(json.devDependencies).to.be.a('object');
            });

            it('must have specified version for dependencies ', function () {
                _.forEach(json.devDependencies, function (dep) {
                    expect(dep).be.ok;
                });
            });

            it('must point to specific package version; (*, ^, ~) not expected', function () {
                _.forEach(json.devDependencies, function (dep) {
                    expect(dep).be.match(/^\d/);
                });
            });
        });

        describe('main entry script', function () {
            it('must point to a valid file', function () {
                expect(json.main).to.equal('index.js');
                expect(fs.existsSync(json.main)).to.be.ok;
            });
        });
    });

    describe('README.md', function () {
        it('must exist', function () {
            expect(fs.existsSync('./README.md')).to.be.ok;
        });

        it('must have readable content', function () {
            expect(fs.readFileSync('./README.md').toString()).to.be.ok;
        });
    });

    describe('LICENSE.md', function () {
        it('must exist', function () {
            expect(fs.existsSync('./LICENSE.md')).to.be.ok;
        });

        it('must have readable content', function () {
            expect(fs.readFileSync('./LICENSE.md').toString()).to.be.ok;
        });
    });

    describe('.gitattributes', function () {
        it('must exist', function () {
            expect(fs.existsSync('./.gitattributes')).to.be.ok;
        });

        it('must have readable content', function () {
            expect(fs.readFileSync('./.gitattributes').toString()).to.be.ok;
        });
    });

    describe('.ignore files', function () {
        var gitignorePath = '.gitignore',
            npmignorePath = '.npmignore',
            npmignore = parseIgnore(npmignorePath),
            gitignore = parseIgnore(gitignorePath);

        describe(gitignorePath, function () {
            it('must exist', function (done) {
                fs.stat(gitignorePath, done);
            });

            it('must have valid content', function () {
                expect(_.isEmpty(gitignore)).to.not.be.ok;
            });
        });

        describe(npmignorePath, function () {
            it('must exist', function (done) {
                fs.stat(npmignorePath, done);
            });

            it('must have valid content', function () {
                expect(_.isEmpty(npmignore)).to.not.be.ok;
            });
        });

        // @todo fix this test
        it.skip('.gitignore coverage must be a subset of .npmignore coverage', function () {
            expect(_.intersection(gitignore, npmignore)).to.eql(gitignore);
        });
    });

    describe('.eslintrc', function () {
        var stripJSON = require('strip-json-comments'),

            content,
            json;

        it('must exist', function (done) {
            fs.stat('./.eslintrc', done);
        });

        it('must have readable content', function () {
            expect(content = fs.readFileSync('./.eslintrc').toString()).to.be.ok;
        });

        it('must be valid JSON content', function () {
            expect(json = JSON.parse(stripJSON(content))).to.be.ok;
        });

        it('must have appropriate plugins specified', function () {
            expect(json.plugins).to.eql(['security', 'jsdoc', 'mocha']);
        });

        it('must have appropriate environments specified', function () {
            expect(json.env.browser).to.equal(true);
            expect(json.env.node).to.equal(true);
        });
    });
});
