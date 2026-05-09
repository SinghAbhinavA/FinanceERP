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

            // ✅ Clean old file (VERY IMPORTANT)
            if (fs.existsSync(urlFile)) {
                try {
                    fs.unlinkSync(urlFile);
                    console.log('🧹 Old url.txt deleted');
                } catch (e) {
                    console.log('⚠️ Could not delete old url.txt:', e.message);
                }
            }

            // ✅ Validate paths
            if (!fs.existsSync(config.jnlpJarPath)) {
                return reject(new Error(`❌ JNLP runner jar not found: ${config.jnlpJarPath}`));
            }

            if (!fs.existsSync(config.jnlpFilePath)) {
                return reject(new Error(`❌ JNLP file not found: ${config.jnlpFilePath}`));
            }

            console.log(`🚀 Launching JNLP: ${config.jnlpFilePath}`);

            // Pass urlFile as second arg so JNLPLauncher writes captured URL to the exact path we poll
            const command = `java -jar "${config.jnlpJarPath}" "${config.jnlpFilePath}" "${urlFile}"`;
            const child = exec(command, { env: process.env });

            // Logs
            child.stdout.on('data', (data) => {
                console.log('[JNLP]', data.toString().trim());
            });

            child.stderr.on('data', (err) => {
                console.error('[JNLP ERROR]', err.toString().trim());
            });

            child.on('error', (err) => {
                return reject(new Error(`❌ Failed to start JNLP process: ${err.message}`));
            });

            // 🔁 Polling for URL instead of waiting for exit
            const startTime = Date.now();

            const checkFile = () => {
                try {
                    if (fs.existsSync(urlFile)) {

                        const url = fs.readFileSync(urlFile, 'utf-8').trim();

                        if (url && url.startsWith('http')) {
                            console.log(`✅ URL captured: ${url}`);

                            // Kill process after success
                            child.kill();

                            return resolve(url);
                        }
                    }

                    // ⏱ Timeout handling
                    if (Date.now() - startTime > timeout) {
                        child.kill();
                        return reject(new Error('❌ Timeout waiting for URL from JNLP'));
                    }

                    // Retry after 1 sec
                    setTimeout(checkFile, 1000);

                } catch (err) {
                    child.kill();
                    return reject(new Error(`❌ Error reading url.txt: ${err.message}`));
                }
            };

            // Start polling
            checkFile();
        });
    }
}

module.exports = JnlpHelper;
