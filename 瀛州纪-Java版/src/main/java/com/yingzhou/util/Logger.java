package com.yingzhou.util;

import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * 日志工具类
 * 将日志同时输出到控制台和文件
 */
public class Logger {
    
    private static final String LOG_FILE = "yingzhou-game.log";
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static PrintWriter fileWriter;
    
    static {
        try {
            fileWriter = new PrintWriter(new FileWriter(LOG_FILE, true), true);
            info("=== 瀛州纪游戏启动 ===");
        } catch (IOException e) {
            System.err.println("无法创建日志文件: " + e.getMessage());
        }
    }
    
    public static void info(String message) {
        log("INFO", message, null);
    }
    
    public static void warn(String message) {
        log("WARN", message, null);
    }
    
    public static void error(String message) {
        log("ERROR", message, null);
    }
    
    public static void error(String message, Throwable throwable) {
        log("ERROR", message, throwable);
    }
    
    public static void debug(String message) {
        log("DEBUG", message, null);
    }
    
    private static void log(String level, String message, Throwable throwable) {
        String timestamp = LocalDateTime.now().format(formatter);
        String logMessage = String.format("[%s] [%s] %s", timestamp, level, message);
        
        // 输出到控制台
        if ("ERROR".equals(level)) {
            System.err.println(logMessage);
        } else {
            System.out.println(logMessage);
        }
        
        // 输出到文件
        if (fileWriter != null) {
            fileWriter.println(logMessage);
            if (throwable != null) {
                throwable.printStackTrace(fileWriter);
            }
        }
        
        // 如果有异常，也打印到控制台
        if (throwable != null) {
            throwable.printStackTrace();
        }
    }
    
    public static void close() {
        if (fileWriter != null) {
            info("=== 瀛州纪游戏关闭 ===");
            fileWriter.close();
        }
    }
}
