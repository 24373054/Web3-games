// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./WorldLedger.sol";

/**
 * @title PersonalizedAINPC
 * @dev 个性化AI-NPC合约 - 每个NPC都能通过与玩家的交互形成独特个性
 * 扩展原有AINPC功能，增加：
 * 1. 玩家特定的记忆系统
 * 2. 情感倾向系统
 * 3. 对话风格演化
 * 4. 关系亲密度
 */
contract PersonalizedAINPC {
    enum NPCType {
        Archivist,   // 史官 - 记录与历史
        Architect,   // 工匠 - 创世与规则
        Mercantile,  // 商序 - 市场与资源
        Oracle,      // 先知 - 预测与推演
        Entropy      // 遗忘 - 混沌与衰变
    }

    // 情感类型
    enum EmotionType {
        Neutral,      // 中立
        Friendly,     // 友善
        Curious,      // 好奇
        Suspicious,   // 怀疑
        Respectful,   // 尊敬
        Dismissive,   // 轻视
        Fascinated,   // 着迷
        Worried       // 担忧
    }

    // NPC基础信息
    struct NPC {
        bytes32 idHash;
        NPCType npcType;
        string name;
        uint256 creationTime;
        uint256 totalInteractionCount;
        uint256 degradationLevel;
        bool isActive;
        
        // 个性特征（0-100）
        uint256 openness;       // 开放性
        uint256 formality;      // 正式程度
        uint256 verbosity;      // 话痨程度
        uint256 emotionality;   // 情绪化程度
    }

    // 玩家特定的NPC记忆
    struct PlayerMemory {
        uint256 interactionCount;     // 与该玩家的交互次数
        uint256 lastInteraction;      // 最后交互时间
        uint256 intimacyLevel;        // 亲密度（0-100）
        EmotionType currentEmotion;   // 当前对该玩家的情感
        uint256 trustLevel;           // 信任等级（0-100）
        uint256 knowledgeShared;      // 分享知识数量
        
        // 记忆的话题偏好
        mapping(bytes32 => uint256) topicFrequency;  // 话题哈希 => 讨论次数
        mapping(bytes32 => uint256) topicSentiment;  // 话题哈希 => 情感倾向（0-100）
    }

    // 对话记录（增强版）
    struct Dialogue {
        uint256 timestamp;
        address inquirer;
        bytes32 questionHash;
        bytes32 responseHash;
        uint256 entropyLevel;
        bytes32 topicHash;            // 话题标签
        EmotionType emotionAtTime;    // 对话时的情感
        uint256 intimacyAtTime;       // 对话时的亲密度
    }

    // 话题标签
    struct Topic {
        bytes32 hash;
        string name;
        uint256 discussionCount;
    }

    // 对话内容（带情感和个性化）
    struct DialogueContent {
        bytes32 requestId;
        string question;
        string response;
        string emotionTag;            // 情感标签
        uint256 personalityScore;     // 个性化分数（0-100）
    }

    // NPC成长事件
    struct GrowthEvent {
        uint256 timestamp;
        address player;
        string eventType;             // "intimacy_increase", "trust_gained", "personality_shift"
        string description;
        uint256 oldValue;
        uint256 newValue;
    }

    WorldLedger public worldLedger;
    
    mapping(bytes32 => NPC) public npcs;
    mapping(bytes32 => mapping(address => PlayerMemory)) public playerMemories;
    mapping(bytes32 => Dialogue[]) public dialogueHistory;
    mapping(bytes32 => DialogueContent) public dialogueContents;
    mapping(bytes32 => Topic) public topics;
    mapping(bytes32 => GrowthEvent[]) public npcGrowthHistory;
    
    bytes32[] public npcIds;
    bytes32[] public topicIds;

    event NPCCreated(bytes32 indexed npcId, NPCType npcType, string name);
    event DialogueRecorded(bytes32 indexed npcId, address indexed inquirer, bytes32 responseHash);
    event DialogueStored(bytes32 indexed npcId, bytes32 indexed requestId, address indexed inquirer);
    event NPCDegraded(bytes32 indexed npcId, uint256 newDegradationLevel);
    event IntimacyChanged(bytes32 indexed npcId, address indexed player, uint256 oldLevel, uint256 newLevel);
    event EmotionChanged(bytes32 indexed npcId, address indexed player, EmotionType newEmotion);
    event PersonalityEvolved(bytes32 indexed npcId, string trait, uint256 oldValue, uint256 newValue);
    event TopicDiscussed(bytes32 indexed npcId, address indexed player, bytes32 topicHash, uint256 frequency);

    constructor(address _worldLedger) {
        worldLedger = WorldLedger(_worldLedger);
        _initializeNPCs();
        _initializeTopics();
    }

    /**
     * @dev 初始化预设的AI-NPC（带个性）
     */
    function _initializeNPCs() internal {
        // 史官：高正式度，中等开放性
        _createNPC(NPCType.Archivist, "Chronicle Keeper", 60, 80, 60, 40);
        
        // 工匠：高开放性，低情绪化
        _createNPC(NPCType.Architect, "Prime Constructor", 80, 70, 50, 30);
        
        // 商序：中等各项，平衡
        _createNPC(NPCType.Mercantile, "Flow Arbiter", 50, 60, 55, 50);
        
        // 先知：高开放性，高情绪化
        _createNPC(NPCType.Oracle, "Future Echo", 90, 50, 70, 80);
        
        // 遗忘：随机波动
        _createNPC(NPCType.Entropy, "Void Whisper", 70, 40, 60, 90);
    }

    /**
     * @dev 创建NPC（带个性参数）
     */
    function _createNPC(
        NPCType npcType,
        string memory name,
        uint256 openness,
        uint256 formality,
        uint256 verbosity,
        uint256 emotionality
    ) internal returns (bytes32) {
        bytes32 npcId = keccak256(
            abi.encodePacked(npcType, name, block.timestamp)
        );

        npcs[npcId] = NPC({
            idHash: npcId,
            npcType: npcType,
            name: name,
            creationTime: block.timestamp,
            totalInteractionCount: 0,
            degradationLevel: 0,
            isActive: true,
            openness: openness,
            formality: formality,
            verbosity: verbosity,
            emotionality: emotionality
        });

        npcIds.push(npcId);
        emit NPCCreated(npcId, npcType, name);
        return npcId;
    }

    /**
     * @dev 初始化话题标签
     */
    function _initializeTopics() internal {
        _createTopic("history", "History & Memory");
        _createTopic("technology", "Technology & Innovation");
        _createTopic("philosophy", "Philosophy & Existence");
        _createTopic("future", "Future & Prediction");
        _createTopic("entropy", "Entropy & Decay");
        _createTopic("creation", "Creation & Building");
        _createTopic("economy", "Economy & Trade");
        _createTopic("personal", "Personal & Relationships");
        _createTopic("mystery", "Mystery & Unknown");
        _createTopic("emotion", "Emotions & Feelings");
    }

    /**
     * @dev 创建话题
     */
    function _createTopic(string memory name, string memory displayName) internal {
        bytes32 topicHash = keccak256(abi.encodePacked(name));
        topics[topicHash] = Topic({
            hash: topicHash,
            name: displayName,
            discussionCount: 0
        });
        topicIds.push(topicHash);
    }

    /**
     * @dev 与NPC对话（个性化版本）
     */
    function interact(
        bytes32 npcId,
        bytes32 questionHash,
        bytes32 topicHash
    ) external returns (bytes32 responseRequestId) {
        require(npcs[npcId].isActive, "NPC is not active");

        NPC storage npc = npcs[npcId];
        npc.totalInteractionCount++;

        // 获取或初始化玩家记忆
        PlayerMemory storage memory_ = playerMemories[npcId][msg.sender];
        memory_.interactionCount++;
        memory_.lastInteraction = block.timestamp;

        // 更新话题频率
        memory_.topicFrequency[topicHash]++;
        topics[topicHash].discussionCount++;

        // 计算亲密度变化
        _updateIntimacy(npcId, msg.sender);

        // 根据交互调整情感
        _updateEmotion(npcId, msg.sender);

        // 计算衰变程度
        uint256 worldEntropy = worldLedger.getEntropyLevel();
        uint256 degradation = (worldEntropy + (npc.totalInteractionCount / 10)) / 2;
        if (degradation > 100) degradation = 100;
        
        if (degradation > npc.degradationLevel) {
            npc.degradationLevel = degradation;
            emit NPCDegraded(npcId, degradation);
        }

        // 生成响应请求ID
        responseRequestId = keccak256(
            abi.encodePacked(
                npcId,
                msg.sender,
                questionHash,
                block.timestamp,
                npc.totalInteractionCount
            )
        );

        // 记录对话
        Dialogue memory dialogue = Dialogue({
            timestamp: block.timestamp,
            inquirer: msg.sender,
            questionHash: questionHash,
            responseHash: responseRequestId,
            entropyLevel: degradation,
            topicHash: topicHash,
            emotionAtTime: memory_.currentEmotion,
            intimacyAtTime: memory_.intimacyLevel
        });

        dialogueHistory[npcId].push(dialogue);
        emit DialogueRecorded(npcId, msg.sender, responseRequestId);
        emit TopicDiscussed(npcId, msg.sender, topicHash, memory_.topicFrequency[topicHash]);

        // 记录到世界账本
        worldLedger.recordEvent(
            WorldLedger.EventType.Interaction,
            responseRequestId,
            string(abi.encodePacked(
                '{"type":"personalized_dialogue","npc":"',
                npc.name,
                '","intimacy":',
                _uint2str(memory_.intimacyLevel),
                ',"emotion":"',
                _emotionToString(memory_.currentEmotion),
                '"}'
            ))
        );

        return responseRequestId;
    }

    /**
     * @dev 存储个性化对话内容
     */
    function storeDialogue(
        bytes32 npcId,
        bytes32 requestId,
        bytes32 questionHash,
        string calldata questionText,
        string calldata responseText,
        string calldata emotionTag,
        uint256 personalityScore
    ) external {
        require(npcs[npcId].isActive, "NPC inactive");

        dialogueContents[requestId] = DialogueContent({
            requestId: requestId,
            question: questionText,
            response: responseText,
            emotionTag: emotionTag,
            personalityScore: personalityScore
        });

        emit DialogueStored(npcId, requestId, msg.sender);

        // 根据对话质量调整信任度
        PlayerMemory storage memory_ = playerMemories[npcId][msg.sender];
        if (personalityScore > 70) {
            _increaseTrust(npcId, msg.sender, 1);
        }
    }

    /**
     * @dev 更新亲密度
     */
    function _updateIntimacy(bytes32 npcId, address player) internal {
        PlayerMemory storage memory_ = playerMemories[npcId][player];
        uint256 oldIntimacy = memory_.intimacyLevel;
        
        // 基于交互次数增加亲密度
        uint256 increase = 1;
        
        // 连续交互加成
        if (block.timestamp - memory_.lastInteraction < 1 hours) {
            increase = 2;
        }
        
        // 根据NPC的开放性调整
        increase = (increase * npcs[npcId].openness) / 50;
        
        if (memory_.intimacyLevel + increase <= 100) {
            memory_.intimacyLevel += increase;
        } else {
            memory_.intimacyLevel = 100;
        }

        if (memory_.intimacyLevel != oldIntimacy) {
            emit IntimacyChanged(npcId, player, oldIntimacy, memory_.intimacyLevel);
            
            // 记录成长事件
            _recordGrowthEvent(
                npcId,
                player,
                "intimacy_increase",
                "Intimacy level increased through continued interaction",
                oldIntimacy,
                memory_.intimacyLevel
            );
        }
    }

    /**
     * @dev 更新情感
     */
    function _updateEmotion(bytes32 npcId, address player) internal {
        PlayerMemory storage memory_ = playerMemories[npcId][player];
        EmotionType oldEmotion = memory_.currentEmotion;
        EmotionType newEmotion = oldEmotion;

        // 根据亲密度和信任度决定情感
        if (memory_.intimacyLevel > 80 && memory_.trustLevel > 70) {
            newEmotion = EmotionType.Friendly;
        } else if (memory_.intimacyLevel > 60) {
            newEmotion = EmotionType.Curious;
        } else if (memory_.intimacyLevel > 40) {
            newEmotion = EmotionType.Neutral;
        } else if (memory_.trustLevel < 30) {
            newEmotion = EmotionType.Suspicious;
        }

        // NPC个性影响
        if (npcs[npcId].emotionality > 70) {
            // 高情绪化的NPC情感变化更剧烈
            if (memory_.intimacyLevel > 90) {
                newEmotion = EmotionType.Fascinated;
            }
        }

        if (newEmotion != oldEmotion) {
            memory_.currentEmotion = newEmotion;
            emit EmotionChanged(npcId, player, newEmotion);
        }
    }

    /**
     * @dev 增加信任度
     */
    function _increaseTrust(bytes32 npcId, address player, uint256 amount) internal {
        PlayerMemory storage memory_ = playerMemories[npcId][player];
        uint256 oldTrust = memory_.trustLevel;
        
        if (memory_.trustLevel + amount <= 100) {
            memory_.trustLevel += amount;
        } else {
            memory_.trustLevel = 100;
        }

        _recordGrowthEvent(
            npcId,
            player,
            "trust_gained",
            "Trust level increased",
            oldTrust,
            memory_.trustLevel
        );
    }

    /**
     * @dev 记录NPC成长事件
     */
    function _recordGrowthEvent(
        bytes32 npcId,
        address player,
        string memory eventType,
        string memory description,
        uint256 oldValue,
        uint256 newValue
    ) internal {
        npcGrowthHistory[npcId].push(GrowthEvent({
            timestamp: block.timestamp,
            player: player,
            eventType: eventType,
            description: description,
            oldValue: oldValue,
            newValue: newValue
        }));
    }

    /**
     * @dev NPC个性演化（基于长期交互）
     */
    function evolvePersonality(bytes32 npcId) external {
        NPC storage npc = npcs[npcId];
        require(npc.totalInteractionCount > 100, "Not enough interactions");

        // 根据交互历史调整个性
        // 这里是简化版，实际可以根据话题分布、情感历史等进行复杂演化
        
        uint256 seed = uint256(keccak256(abi.encodePacked(npcId, block.timestamp)));
        
        // 随机小幅调整某个特质
        uint256 trait = seed % 4;
        int256 change = int256((seed >> 8) % 10) - 5; // -5 to +5
        
        if (trait == 0 && _canAdjust(npc.openness, change)) {
            uint256 oldValue = npc.openness;
            npc.openness = _adjust(npc.openness, change);
            emit PersonalityEvolved(npcId, "openness", oldValue, npc.openness);
        } else if (trait == 1 && _canAdjust(npc.formality, change)) {
            uint256 oldValue = npc.formality;
            npc.formality = _adjust(npc.formality, change);
            emit PersonalityEvolved(npcId, "formality", oldValue, npc.formality);
        } else if (trait == 2 && _canAdjust(npc.verbosity, change)) {
            uint256 oldValue = npc.verbosity;
            npc.verbosity = _adjust(npc.verbosity, change);
            emit PersonalityEvolved(npcId, "verbosity", oldValue, npc.verbosity);
        } else if (trait == 3 && _canAdjust(npc.emotionality, change)) {
            uint256 oldValue = npc.emotionality;
            npc.emotionality = _adjust(npc.emotionality, change);
            emit PersonalityEvolved(npcId, "emotionality", oldValue, npc.emotionality);
        }
    }

    /**
     * @dev 检查是否可以调整属性
     */
    function _canAdjust(uint256 value, int256 change) internal pure returns (bool) {
        if (change > 0) {
            return value + uint256(change) <= 100;
        } else {
            return value >= uint256(-change);
        }
    }

    /**
     * @dev 调整属性值
     */
    function _adjust(uint256 value, int256 change) internal pure returns (uint256) {
        if (change > 0) {
            return value + uint256(change);
        } else {
            return value - uint256(-change);
        }
    }

    // ========== 查询函数 ==========

    /**
     * @dev 获取NPC信息
     */
    function getNPC(bytes32 npcId) external view returns (NPC memory) {
        return npcs[npcId];
    }

    /**
     * @dev 获取玩家记忆
     */
    function getPlayerMemory(bytes32 npcId, address player) external view returns (
        uint256 interactionCount,
        uint256 lastInteraction,
        uint256 intimacyLevel,
        EmotionType currentEmotion,
        uint256 trustLevel,
        uint256 knowledgeShared
    ) {
        PlayerMemory storage memory_ = playerMemories[npcId][player];
        return (
            memory_.interactionCount,
            memory_.lastInteraction,
            memory_.intimacyLevel,
            memory_.currentEmotion,
            memory_.trustLevel,
            memory_.knowledgeShared
        );
    }

    /**
     * @dev 获取话题讨论频率
     */
    function getTopicFrequency(bytes32 npcId, address player, bytes32 topicHash) 
        external 
        view 
        returns (uint256) 
    {
        return playerMemories[npcId][player].topicFrequency[topicHash];
    }

    /**
     * @dev 获取所有NPC
     */
    function getAllNPCs() external view returns (bytes32[] memory) {
        return npcIds;
    }

    /**
     * @dev 获取对话历史
     */
    function getDialogueHistory(bytes32 npcId) external view returns (Dialogue[] memory) {
        return dialogueHistory[npcId];
    }

    /**
     * @dev 获取成长历史
     */
    function getGrowthHistory(bytes32 npcId) external view returns (GrowthEvent[] memory) {
        return npcGrowthHistory[npcId];
    }

    /**
     * @dev 获取所有话题
     */
    function getAllTopics() external view returns (bytes32[] memory) {
        return topicIds;
    }

    // ========== 辅助函数 ==========

    function _emotionToString(EmotionType emotion) internal pure returns (string memory) {
        if (emotion == EmotionType.Neutral) return "neutral";
        if (emotion == EmotionType.Friendly) return "friendly";
        if (emotion == EmotionType.Curious) return "curious";
        if (emotion == EmotionType.Suspicious) return "suspicious";
        if (emotion == EmotionType.Respectful) return "respectful";
        if (emotion == EmotionType.Dismissive) return "dismissive";
        if (emotion == EmotionType.Fascinated) return "fascinated";
        if (emotion == EmotionType.Worried) return "worried";
        return "unknown";
    }

    function _uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) return "0";
        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        j = _i;
        while (j != 0) {
            bstr[--k] = bytes1(uint8(48 + j % 10));
            j /= 10;
        }
        return string(bstr);
    }
}


