package jnlp;

import org.sikuli.script.Screen;
import org.sikuli.script.Pattern;
import org.sikuli.script.Key;
import org.sikuli.script.FindFailed;
import org.sikuli.script.App;

import java.awt.Toolkit;
import java.awt.datatransfer.DataFlavor;
import java.io.File;
import java.io.FileWriter;
import java.io.InputStreamReader;
import java.io.BufferedReader;

public class JNLPLauncher {

    private static final String DEFAULT_SIKULI_DIR = "/home/developer/JNLP.sikuli";
    private static final String JAVAWS_PATH = "/usr/bin/javaws";
    private final Screen screen = new Screen();

    public static void main(String[] args) {
        try {
            System.out.println("🚀 Starting JNLP Flow...");

            String jnlpPath = (args.length > 0 && args[0] != null && !args[0].trim().isEmpty())
                    ? args[0]
                    : System.getProperty("user.home") + "/Downloads/medplusLoginJnlp(1257).jnlp";

            JNLPLauncher launcher = new JNLPLauncher();
            launcher.launchJNLPApp(jnlpPath);

            System.out.println("✅ JNLP Flow Completed");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private Pattern sikuliPattern(String fileName) {
        return new Pattern(DEFAULT_SIKULI_DIR + "/" + fileName);
    }

    /** Launch JNLP */
    public void launchJNLPApp(String path) throws Exception {

        File file = new File(path);
        if (!file.exists()) throw new RuntimeException("❌ File not found");

        ProcessBuilder pb = new ProcessBuilder(JAVAWS_PATH, path);
        pb.environment().put("DISPLAY", ":0");
        pb.redirectErrorStream(true);
        Process process = pb.start();

        new Thread(() -> {
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    System.out.println("[javaws] " + line);
                }
            } catch (Exception ignored) {}
        }).start();

        System.out.println("⏳ Waiting for JNLP window...");

        int timeout = 60;
        while (timeout-- > 0) {
            if (screen.exists(sikuliPattern("Run.png"), 1) != null ||
                screen.exists(sikuliPattern("Later.png"), 1) != null) break;

            Thread.sleep(1000);
        }

        try { clickWithRetry(sikuliPattern("Later.png").similar(0.9), 5); } catch (Exception ignored) {}
        try { clickWithRetry(sikuliPattern("Checkbox.png").similar(0.9), 5); } catch (Exception ignored) {}

        // 🔥 MAIN LOGIC
        handleRunFlow();
    }

    /** 🚀 Core Run Flow */
private void handleRunFlow() throws Exception {

    int timeout = 10;
    String url = null; // ✅ declare ONLY ONCE

    while (timeout-- > 0) {

        if (screen.exists(sikuliPattern("Run.png").similar(0.9), 1) != null) {
            screen.click(sikuliPattern("Run.png").similar(0.9));
            System.out.println("✅ Clicked Run");
            Thread.sleep(2000);

            App.focus("chrome");

            // 🔥 STEP 1: Check URL immediately
            url = tryGetURLQuick();
            if (url != null) {
                saveAndExit(url);
                return;
            }

            // 🔥 STEP 2: Handle OK popup
            if (screen.exists(sikuliPattern("Ok.png").similar(0.9), 1) != null) {
                screen.click(sikuliPattern("Ok.png").similar(0.9));
                System.out.println("✅ Clicked OK");

                Thread.sleep(300);

                url = tryGetURLQuick();
                if (url != null) {
                    saveAndExit(url);
                    return;
                }
            }

            // 🔥 STEP 3: Handle Cancel
            if (screen.exists(sikuliPattern("Cancel.png").similar(0.9), 1) != null) {
                screen.click(sikuliPattern("Cancel.png").similar(0.9));
                throw new RuntimeException("❌ Cancel detected. Stopping execution.");
            }

            // 🔥 STEP 4: Fallback
            url = fetchURLFallback();   // ✅ reuse variable
            if (url != null) {
                saveAndExit(url);
                return;
            }
        }

        Thread.sleep(300);
    }

    throw new RuntimeException("❌ Run button not found");
}
    /** ⚡ Fast URL check (instant) */
    private String tryGetURLQuick() {
        try {
            screen.type("l", Key.CTRL);
            Thread.sleep(100);
            screen.type("c", Key.CTRL);

            String url = (String) Toolkit.getDefaultToolkit()
                    .getSystemClipboard()
                    .getData(DataFlavor.stringFlavor);

            if (url != null) {
                url = url.trim();
                if (url.startsWith("http") && url.length() > 30) {
                    return url;
                }
            }
        } catch (Exception ignored) {}

        return null;
    }

    /** 🔄 Fallback URL fetch (short & controlled) */
    private String fetchURLFallback() throws Exception {

        long start = System.currentTimeMillis();

        while ((System.currentTimeMillis() - start) < 5000) {

            screen.type("c", Key.CTRL);

            try {
                String url = (String) Toolkit.getDefaultToolkit()
                        .getSystemClipboard()
                        .getData(DataFlavor.stringFlavor);

                if (url != null) {
                    url = url.trim();
                    if (url.startsWith("http")) {
                        return url;
                    }
                }
            } catch (Exception ignored) {}

            Thread.sleep(150);
        }

        return null;
    }

    /** Save + Exit */
    private void saveAndExit(String url) throws Exception {
        System.out.println("🚀 URL captured: " + url);
        writeURLToFile(url);
    }

    /** Save URL */
    public void writeURLToFile(String url) throws Exception {
        try (FileWriter writer = new FileWriter("url.txt")) {
            writer.write(url);
        }
        System.out.println("💾 URL saved");
    }

    /** Retry click */
    private void clickWithRetry(Pattern pattern, int timeout) throws Exception {
        for (int i = 0; i < 2; i++) {
            try {
                screen.wait(pattern, timeout);
                screen.click(pattern);
                return;
            } catch (FindFailed e) {
                Thread.sleep(500);
            }
        }
    }
}