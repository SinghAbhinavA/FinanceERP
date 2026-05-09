const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const config = require('../config/env');

class JnlpHelper {

    /**
     * Launch the JNLP runner jar and return the application URL
     */
    static async launchAndGetURL(timeout = 60000) {

        return new Promise((resolve, reject) => {

            const urlFile = path.resolve(__dirname, '../url.txt');

            // ✅ Clean old file
            if (fs.existsSync(urlFile)) {
                try {
                    fs.unlinkSync(urlFile);
                    console.log('🧹 Old url.txt deleted');
                } catch (e) {
                    console.log('⚠️ Could not delete old url.txt:', e.message);
                }
            }

            // ✅ Validate JAR path
            if (!fs.existsSync(config.jnlpJarPath)) {
                return reject(
                    new Error(`❌ JNLP runner jar not found: ${config.jnlpJarPath}`)
                );
            }

            // ✅ Validate JNLP path
            if (!fs.existsSync(config.jnlpFilePath)) {
                return reject(
                    new Error(`❌ JNLP file not found: ${config.jnlpFilePath}`)
                );
            }

            console.log('==============================');
            console.log('🚀 Launching JNLP...');
            console.log('JNLP FILE:', config.jnlpFilePath);
            console.log('JNLP JAR :', config.jnlpJarPath);
            console.log('DISPLAY  :', process.env.DISPLAY);
            console.log('JAVA_HOME:', process.env.JAVA_HOME);
            console.log('==============================');

            // ✅ Java command
            const command =
                `java -jar "${config.jnlpJarPath}" ` +
                `"${config.jnlpFilePath}" "${urlFile}"`;

            // ✅ IMPORTANT: inherit xvfb DISPLAY
            const child = exec(command, {
                env: process.env
            });

            // ✅ STDOUT logs
            child.stdout.on('data', (data) => {
                console.log('[JNLP]', data.toString().trim());
            });

            // ✅ STDERR logs
            child.stderr.on('data', (data) => {
                console.error('[JNLP ERROR]', data.toString().trim());
            });

            // ✅ Process error
            child.on('error', (err) => {
                return reject(
                    new Error(`❌ Failed to start JNLP process: ${err.message}`)
                );
            });

            const startTime = Date.now();

            // ✅ Poll URL file
            const checkFile = () => {

                try {

                    if (fs.existsSync(urlFile)) {

                        const url = fs.readFileSync(urlFile, 'utf-8').trim();

                        if (url && url.startsWith('http')) {

                            console.log(`✅ URL captured: ${url}`);

                            // Kill Java process
                            child.kill();

                            return resolve(url);
                        }
                    }

                    // ✅ Timeout
                    if (Date.now() - startTime > timeout) {

                        child.kill();

                        return reject(
                            new Error('❌ Timeout waiting for URL from JNLP')
                        );
                    }

                    // Retry after 1 second
                    setTimeout(checkFile, 1000);

                } catch (err) {

                    child.kill();

                    return reject(
                        new Error(`❌ Error reading url.txt: ${err.message}`)
                    );
                }
            };

            // ✅ Start polling
            checkFile();
        });
    }
}

module.exports = JnlpHelper;