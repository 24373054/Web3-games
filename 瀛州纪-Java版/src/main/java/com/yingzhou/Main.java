package com.yingzhou;

import com.yingzhou.launcher.VersionSelector;
import com.yingzhou.util.Logger;
import javafx.application.Application;
import javafx.stage.Stage;

/**
 * 瀛州纪 - Java版主入口
 * 
 * @author 瀛州纪开发团队
 * @version 1.0
 */
public class Main extends Application {

    @Override
    public void start(Stage primaryStage) {
        try {
            Logger.info("=== 瀛州纪 Java版 v1.0 ===");
            Logger.info("系统信息:");
            Logger.info("  Java版本: " + System.getProperty("java.version"));
            Logger.info("  JavaFX版本: " + System.getProperty("javafx.version"));
            Logger.info("  操作系统: " + System.getProperty("os.name"));
            Logger.info("  系统架构: " + System.getProperty("os.arch"));
            
            // 显示版本选择界面
            VersionSelector versionSelector = new VersionSelector();
            versionSelector.show(primaryStage);
            
        } catch (Exception e) {
            Logger.error("应用启动失败", e);
            throw e;
        }
    }

    public static void main(String[] args) {
        try {
            launch(args);
        } catch (Exception e) {
            Logger.error("应用运行出错", e);
            e.printStackTrace();
        } finally {
            Logger.close();
        }
    }
}
