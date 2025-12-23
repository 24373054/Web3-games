package com.yingzhou;

import com.yingzhou.launcher.VersionSelector;
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
        // 显示版本选择界面
        VersionSelector versionSelector = new VersionSelector();
        versionSelector.show(primaryStage);
    }

    public static void main(String[] args) {
        launch(args);
    }
}
