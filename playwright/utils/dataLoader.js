const fs = require('fs');
const path = require('path');

function loadJson(name) {
    const filePath = path.join(__dirname, '..', 'testdata', `${name}.json`);
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function flattenDatasets(datasetFile) {
    const data = loadJson(datasetFile);
    return [
        ...(Array.isArray(data.valid) ? data.valid : []),
        ...(Array.isArray(data.invalid) ? data.invalid : []),
    ];
}

function filterByTag(data, tag = process.env.TAG) {
    if (!tag) return data;
    return data.filter(item => item.tags && item.tags.includes(tag));
}

function getDatasets(datasetFile, options = {}) {
    const data = flattenDatasets(datasetFile);
    return filterByTag(data, options.tag);
}

module.exports = {
    loadJson,
    flattenDatasets,
    filterByTag,
    getDatasets,
};
