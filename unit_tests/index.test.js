// const express = require("express");
// const supertest = require("supertest");
// import { enableFetchMocks } from 'jest-fetch-mock'
// enableFetchMocks()
// const appserver = require('../appserver');

const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
import {JSDOM} from 'jsdom';
import fetchMock from "jest-fetch-mock";

const html = fs.readFileSync(path.resolve("./public/index.html"), "utf8");

describe('the unit tests', () => {

    const dangerousParam = {runScripts: "dangerously"};
    let theDom;
    let theWindow;
    beforeAll(() => {
        // Citation: https://levelup.gitconnected.com/how-to-unit-test-html-and-vanilla-javascript-without-a-ui-framework-c4c89c9f5e56
        theDom = new JSDOM(html, dangerousParam)
        // theWindow = theDom.window;

        document.documentElement.innerHTML = html.toString();
        fetchMock.enableMocks();
        fetchMock.doMock();
    });

    // Intentionally ignored test. Exists to show that tests which should pass do pass
    xit('should pass', () => {
        expect(1).toEqual(1);
    });

    // Intentionally ignored test. Exists to show that tests which should fail do fail
    xit('should not pass', () => {
        expect(1).toEqual(2);
    });

    describe('the necessary components are present', () => {
        it('should have the buttons', () => {
            const buttonList = ['submitButton', 'disable-alarm', 'debug-0600', 'debug-1800', 'debug-now', 'debug-now-plus-2'];
            buttonList.forEach(value => {
                expect(getHelperByDom(value)).toBeTruthy();
                expect(getHelper(value)).toBeInstanceOf(HTMLButtonElement);
            });
        });
        it('should have the text areas', () => {
            const textAreaList = ['submit-text', 'alarm-time-text'];
            textAreaList.forEach(value => {
                expect(getHelperByDom(value)).toBeTruthy();
                expect(getHelper(value)).toBeInstanceOf(HTMLTextAreaElement);
            });
        });
        it('should have the time input', () => {
            expect(getHelperByDom('time-selector')).toBeTruthy();  // check that element exists in the DOM
            expect(getHelper('time-selector')).toBeInstanceOf(HTMLInputElement); // Check that type matches expected type
        });
    });

    describe('clicking the buttons', () => {
        global.fetch = jest.fn();
        beforeAll(() => {
            fetchMock.resetMocks();
        });

        it('should update the time displayed to the user when Debug plus 2 clicked', () => {
            const EXTRA_MINUTES = 2;
            fetchMock.once("ok");
            const debugPlus2Button = getHelperByDom('debug-now-plus-2');
            debugPlus2Button.click();
            let d = new Date();
            d.setTime(d.getTime() + (EXTRA_MINUTES * 60 * 1000));
            expect(getHelperByDom('alarm-time-text').value)
                .toBe(d.toLocaleTimeString('en-US', {hour12: false, hour: '2-digit', minute: '2-digit'}));
        });

        it('should update the time displayed to the user when Debug 0600 clicked', () => {
            fetchMock.once("ok");
            const debug0600 = getHelperByDom('debug-0600');
            debug0600.click();
            expect(getHelperByDom('alarm-time-text').value).toBe('06:00');
        });

        it('should update the time displayed to the user when Debug 1800 clicked', () => {
            fetchMock.once("ok");
            const debug1800 = getHelperByDom('debug-1800');
            debug1800.click();
            expect(getHelperByDom('alarm-time-text').value).toBe('18:00');
        });

        it('should update the time displayed to the user when user entered time submitted', () => {
            const TIME_STRING = '13:57';
            fetchMock.once("ok");
            const submitButton = getHelperByDom('submitButton');
            const timeInput = getHelperByDom('time-selector');
            timeInput.value = TIME_STRING;
            submitButton.click();
            expect(getHelperByDom('alarm-time-text').value).toBe(TIME_STRING);
        });

        it('should turn the alarm off when turn alarm off button clicked', () => {
            fetchMock.once("ok");
            const disableButton = getHelperByDom('disable-alarm');
            disableButton.click();
            expect(getHelperByDom('alarm-time-text').value).toBe('--:--');
            expect(getHelperByDom('submit-text').value).toBe('Alarm set off');
            // console.log(theDom.getInternalVMContext()._globalProxy);
        });

    });

    function getHelperByDom(s) {
        return theDom.window.document.getElementById(s);
    }

    function getHelper(s) {
        return document.getElementById(s);
    }
});
