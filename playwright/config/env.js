const path = require('path');
const os = require('os');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

if (!process.env.JNLP_FILE_PATH) {
    console.warn(
        '⚠️  JNLP_FILE_PATH is not set in .env. ' +
        'JNLP-based tests will fail unless JNLP_FILE_PATH points to a valid .jnlp file.'
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

   jnlpFilePath: process.env.JNLP_FILE_PATH
    ? path.resolve(process.cwd(), process.env.JNLP_FILE_PATH)
    : path.resolve(process.cwd(), '../JNLP.sikuli/app.jnlp'),

    sikuliDir:
        process.env.SIKULI_DIR ||
        path.join(os.homedir(), 'FinanceERP/JNLP.sikuli'),
};
