var expect = require('chai').expect,
    bomb = require('../../lib/bomb'),

    TEST_STRING = 'string',

    testInput = {
        number: 12,
        utf8: 'ï»¿string',
        utf16: String.fromCharCode(0xFEFF) + '﻿string',
        utf32: '뮿string',
        utf16BigEndian: 'þÿstring',
        utf16LittleEndian: 'ÿþstring'
    };

describe('lib/bomb', function () {
    describe('trim', function () {
        // edge cases
        describe('edge case', function () {
            it('returns an unchanged value for undefined / no input', function () {
                expect(bomb.trim()).to.equal(undefined);
            });

            it('returns and unchanged value for non string input', function () {
                expect(bomb.trim(testInput.number)).to.equal(testInput.number);
            });
        });

        // regular string input
        it('returns an unchanged value for regular string input', function () {
            expect(bomb.trim(TEST_STRING)).to.equal(TEST_STRING);
        });

        // BOM compliant string input tests
        describe('BOM removal', function () {
            it.skip('correctly removes UTF-16 BOM', function () { // @todo: unskip after a utf16 BOM has been found
                expect(bomb.trim(testInput.utf16)).to.equal(TEST_STRING);
            });

            it('correctly removes UTF-32 BOM', function () {
                expect(bomb.trim(testInput.utf32)).to.equal(TEST_STRING);
            });

            it('correctly removes big endian UTF-16 BOM', function () {
                expect(bomb.trim(testInput.utf16BigEndian)).to.equal(TEST_STRING);
            });

            it('correctly removes little endian UTF-16 BOM', function () {
                expect(bomb.trim(testInput.utf16LittleEndian)).to.equal(TEST_STRING);
            });

            it('correctly removes UTF-8 BOM', function () {
                expect(bomb.trim(testInput.utf8)).to.equal(TEST_STRING);
            });
        });
    });
});
