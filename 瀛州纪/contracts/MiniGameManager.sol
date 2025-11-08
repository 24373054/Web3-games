// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./EpochManager.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MiniGameManager
 * @dev 小游戏管理合约 - 记录成绩并奖励碎片
 */
contract MiniGameManager is Ownable {
    enum GameType {
        MemorySort,      // 记忆排序
        Handshake,       // 握手协议
        ResourceBalance, // 资源平衡
        CodeBuilder,     // 代码构建
        FuturePrediction,// 未来推演
        ChaosMaze        // 混沌迷宫
    }
    
    struct GameScore {
        uint8 gameType;
        uint256 score;
        uint256 completionPercent; // 完成度 0-100
        uint256 timestamp;
        uint256 epoch;
    }
    
    EpochManager public epochManager;
    
    // 玩家的游戏成绩记录
    mapping(address => mapping(uint8 => GameScore)) public playerHighScores;
    mapping(address => GameScore[]) public playerGameHistory;
    
    // 游戏类型对应的碎片ID
    mapping(uint8 => uint256) public gameToFragment;
    
    // 获得碎片所需的最低完成度
    uint256 public constant MIN_COMPLETION_FOR_FRAGMENT = 60;
    
    event GameCompleted(address indexed player, uint8 gameType, uint256 score, uint256 completionPercent);
    event FragmentRewarded(address indexed player, uint8 gameType, uint256 fragmentId);
    
    constructor(address _epochManager) Ownable(msg.sender) {
        epochManager = EpochManager(_epochManager);
        _initializeGameFragmentMapping();
    }
    
    /**
     * @dev 初始化游戏类型到碎片的映射
     */
    function _initializeGameFragmentMapping() internal {
        // 创世纪元 - 记忆排序
        gameToFragment[uint8(GameType.MemorySort)] = 0;
        
        // 萌芽纪元 - 握手协议
        gameToFragment[uint8(GameType.Handshake)] = 3;
        
        // 萌芽纪元 - 资源平衡  
        gameToFragment[uint8(GameType.ResourceBalance)] = 3;
        
        // 繁盛纪元 - 代码构建
        gameToFragment[uint8(GameType.CodeBuilder)] = 6;
        
        // 熵化纪元 - 未来推演
        gameToFragment[uint8(GameType.FuturePrediction)] = 7;
        
        // 熵化纪元 - 混沌迷宫
        gameToFragment[uint8(GameType.ChaosMaze)] = 7;
    }
    
    /**
     * @dev 提交游戏成绩
     * @param gameType 游戏类型
     * @param score 分数
     * @param completionPercent 完成度（0-100）
     */
    function submitGameScore(
        uint8 gameType,
        uint256 score,
        uint256 completionPercent
    ) external {
        require(completionPercent <= 100, "Completion percent must be <= 100");
        require(gameType < 6, "Invalid game type");
        
        address player = msg.sender;
        uint256 currentEpoch = uint256(epochManager.getCurrentEpoch(player));
        
        // 创建游戏记录
        GameScore memory gameScore = GameScore({
            gameType: gameType,
            score: score,
            completionPercent: completionPercent,
            timestamp: block.timestamp,
            epoch: currentEpoch
        });
        
        // 添加到历史记录
        playerGameHistory[player].push(gameScore);
        
        // 更新最高分
        if (score > playerHighScores[player][gameType].score) {
            playerHighScores[player][gameType] = gameScore;
        }
        
        emit GameCompleted(player, gameType, score, completionPercent);
        
        // 如果完成度足够高，奖励碎片
        if (completionPercent >= MIN_COMPLETION_FOR_FRAGMENT) {
            _rewardFragment(player, gameType);
        }
    }
    
    /**
     * @dev 奖励碎片
     */
    function _rewardFragment(address player, uint8 gameType) internal {
        uint256 fragmentId = gameToFragment[gameType];
        
        // 检查玩家是否已拥有此碎片
        // 注意：实际检查需要调用 MemoryFragment 合约
        // 这里简化处理，直接通过 EpochManager 记录碎片收集
        
        try epochManager.recordFragmentCollection(player, fragmentId) {
            emit FragmentRewarded(player, gameType, fragmentId);
        } catch {
            // 玩家可能已拥有此碎片，忽略错误
        }
    }
    
    /**
     * @dev 获取玩家的最高分
     */
    function getPlayerHighScore(address player, uint8 gameType) 
        external 
        view 
        returns (GameScore memory) 
    {
        return playerHighScores[player][gameType];
    }
    
    /**
     * @dev 获取玩家的游戏历史
     */
    function getPlayerGameHistory(address player) 
        external 
        view 
        returns (GameScore[] memory) 
    {
        return playerGameHistory[player];
    }
    
    /**
     * @dev 获取玩家的游戏次数
     */
    function getPlayerGameCount(address player) 
        external 
        view 
        returns (uint256) 
    {
        return playerGameHistory[player].length;
    }
}

