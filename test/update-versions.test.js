'use strict';

// Task 16: the automatic release bumps the addon's patch when every bundled update is a patch
// update, and its minor when at least one of them is a minor update. Nothing new is no release:
// that is refused. Run with `node --test test/` (npm run test:unit).

const test = require('node:test');
const assert = require('node:assert');

const {updateLevel, bumpLevel, bumpVersion} = require('../update_versions.js');

test('updateLevel names the part of the version that changed', () => {
    assert.strictEqual(updateLevel('24.25.26', '24.25.27'), 'patch');
    assert.strictEqual(updateLevel('24.25.26', '24.25.30'), 'patch');
    assert.strictEqual(updateLevel('24.25.26', '24.26.0'), 'minor');
    assert.strictEqual(updateLevel('5.0.6', '5.2.1'), 'minor');
    assert.strictEqual(updateLevel('24.25.26', '25.0.0'), 'major');
});

test('bumpLevel: patch only when every update is a patch update', () => {
    const cases = [
        {name: 'one patch update', updates: [{name: 'Node.js', from: '24.25.26', to: '24.25.27'}], want: 'patch'},
        {name: 'two patch updates', updates: [
            {name: 'Node.js', from: '24.25.26', to: '24.25.27'},
            {name: 'Node-RED', from: '5.0.6', to: '5.0.7'}
        ], want: 'patch'},
        {name: 'one minor update', updates: [{name: 'Node.js', from: '24.25.26', to: '24.26.0'}], want: 'minor'},
        {name: 'a minor among patches', updates: [
            {name: 'Node.js', from: '24.25.26', to: '24.25.27'},
            {name: 'npm', from: '11.4.2', to: '11.5.0'},
            {name: 'Node-RED', from: '5.0.6', to: '5.0.7'}
        ], want: 'minor'}
    ];
    for (const c of cases) {
        assert.strictEqual(bumpLevel(c.updates), c.want, c.name);
    }
});

test('bumpLevel refuses a release with nothing new', () => {
    assert.throws(() => bumpLevel([]), /nothing to release/);
});

test('bumpVersion raises the patch, or the minor and resets the patch', () => {
    assert.strictEqual(bumpVersion('9.7.4', 'patch'), '9.7.5');
    assert.strictEqual(bumpVersion('9.7.4', 'minor'), '9.8.0');
    assert.strictEqual(bumpVersion('9.9.0', 'minor'), '9.10.0');
});
