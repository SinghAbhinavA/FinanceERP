const fs = require('fs');
const path = require('path');
const os = require('os');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const sikuliDir = process.env.SIKULI_DIR
    ? path.resolve(process.cwd(), process.env.SIKULI_DIR)
    : path.resolve(process.cwd(), '../JNLP.sikuli');

function resolveJnlpFilePath() {
    const envPath = process.env.JNLP_FILE_PATH
        ? path.resolve(process.cwd(), process.env.JNLP_FILE_PATH)
        : path.resolve(sikuliDir, 'app.jnlp');

    if (fs.existsSync(envPath)) {
        return envPath;
    }

    if (fs.existsSync(sikuliDir)) {
        const jnlpFiles = fs.readdirSync(sikuliDir)
            .filter((file) => file.toLowerCase().endsWith('.jnlp'));

        if (jnlpFiles.length === 1) {
            console.warn(`⚠️ Using discovered JNLP file: ${jnlpFiles[0]}`);
            return path.resolve(sikuliDir, jnlpFiles[0]);
        }

        if (jnlpFiles.length > 1) {
            console.warn(
                `⚠️ Multiple .jnlp files found in ${sikuliDir}; using ${jnlpFiles[0]}. ` +
                'Set JNLP_FILE_PATH to the correct file if needed.'
            );
            return path.resolve(sikuliDir, jnlpFiles[0]);
        }
    }

    return envPath;
}

if (!process.env.JNLP_FILE_PATH) {
    console.warn(
        '⚠️  JNLP_FILE_PATH is not set in .env. ' +
        'JNLP-based tests will try to discover a .jnlp file under the Sikuli directory.'
    );
}

module.exports = {
    baseURL: process.env.BASE_URL || '',

    maker: {
        username: process.env.MAKER_USERNAME,
        password: process.env.MAKER_PASSWORD,
    },

    checker: {
        username: process.env.CHECKER_USERNAME,
        password: process.env.CHECKER_PASSWORD,
    },

    jnlpJarPath: process.env.JNLP_JAR_PATH ||
        path.resolve(__dirname, '../../java-jnlp/target/jnlp-runner-1.0.jar'),

    jnlpFilePath: resolveJnlpFilePath(),

    sikuliDir: sikuliDir,
};
