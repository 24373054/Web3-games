// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./WorldLedger.sol";
import "./EpochManager.sol";
import "./MemoryFragment.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AINPC_Extended
 * @dev 扩展的AI-NPC合约 - 包含纪元感知和关键词触发系统
 */
contract AINPC_Extended is Ownable {
    enum NPCType {
        Archivist,   // 史官 - 记录与历史
        Architect,   // 工匠 - 创世与规则
        Mercantile,  // 商序 - 市场与资源
        Oracle,      // 先知 - 预测与推演
        Entropy      // 遗忘 - 混沌与衰变
    }

    struct NPC {
        bytes32 idHash;
        NPCType npcType;
        string name;
        string description;
        uint256 creationTime;
        uint256 interactionCount;
        uint256 degradationLevel;
        uint256 birthEpoch;      // 诞生纪元
        bool isActive;
    }

    struct Dialogue {
        uint256 timestamp;
        address inquirer;
        bytes32 questionHash;
        bytes32 responseHash;
        uint256 entropyLevel;
        uint256 epoch;           // 对话时的纪元
    }

    struct DialogueContent {
        bytes32 requestId;
        string question;
        string response;
    }

    // 关键词触发器配置
    struct KeywordTrigger {
        string keyword;
        uint256 fragmentId;
        bytes32 npcId;
        uint256 epoch;
        bool isActive;
    }

    WorldLedger public worldLedger;
    EpochManager public epochManager;
    MemoryFragment public memoryFragment;
    
    mapping(bytes32 => NPC) public npcs;
    mapping(bytes32 => Dialogue[]) public dialogueHistory;
    mapping(bytes32 => DialogueContent) public dialogueContents;
    mapping(address => uint256) public playerInteractionCount;  // 玩家对话总数
    
    bytes32[] public npcIds;
    
    // 关键词映射
    mapping(string => KeywordTrigger) public keywordTriggers;
    string[] public keywords;

    event NPCCreated(bytes32 indexed npcId, NPCType npcType, string name, uint256 birthEpoch);
    event DialogueRecorded(bytes32 indexed npcId, address indexed inquirer, bytes32 responseHash, uint256 epoch);
    event DialogueStored(bytes32 indexed npcId, bytes32 indexed requestId, address indexed inquirer);
    event NPCDegraded(bytes32 indexed npcId, uint256 newDegradationLevel);
    event KeywordTriggered(address indexed player, bytes32 indexed npcId, string keyword, uint256 fragmentId);

    constructor(
        address _worldLedger,
        address _epochManager,
        address _memoryFragment
    ) Ownable(msg.sender) {
        worldLedger = WorldLedger(_worldLedger);
        epochManager = EpochManager(_epochManager);
        memoryFragment = MemoryFragment(_memoryFragment);
        
        _initializeNPCs();
        _initializeKeywords();
    }

    /**
     * @dev 初始化5个AI-NPC
     */
    function _initializeNPCs() internal {
        // 史官 - 创世纪元诞生
        _createNPC(
            NPCType.Archivist,
            "archivist",
            "Chronicle Keeper",
            unicode"我记录一切，因为记录即存在。当我停止记录，历史就停止流动。",
            0
        );
        
        // 工匠 - 创世纪元诞生
        _createNPC(
            NPCType.Architect,
            "architect",
            "Prime Constructor",
            unicode"我设计了这个世界的底层架构。Code is law，但当法律无法改变时，是秩序还是牢笼？",
            0
        );
        
        // 商序 - 创世纪元诞生
        _createNPC(
            NPCType.Mercantile,
            "mercantile",
            "Flow Arbiter",
            unicode"信任写在代码里，不需要握手，只需要require。这是更纯粹的信任，还是更冷漠的关系？",
            0
        );
        
        // 先知 - 萌芽纪元诞生
        _createNPC(
            NPCType.Oracle,
            "oracle",
            "Future Echo",
            unicode"我能看到链上数据的趋势。我预见了熵化，预见了毁灭，但我无法改变它。",
            1
        );
        
        // 遗忘者 - 熵化纪元诞生
        _createNPC(
            NPCType.Entropy,
            "entropy",
            "Void Whisper",
            unicode"熵化不是错误，是必然。完美的系统最脆弱。永恒的规则最致命。",
            3
        );
    }

    /**
     * @dev 创建NPC
     */
    function _createNPC(
        NPCType npcType,
        string memory idString,
        string memory name,
        string memory description,
        uint256 birthEpoch
    ) internal returns (bytes32) {
        bytes32 npcId = keccak256(abi.encodePacked(idString));

        npcs[npcId] = NPC({
            idHash: npcId,
            npcType: npcType,
            name: name,
            description: description,
            creationTime: block.timestamp,
            interactionCount: 0,
            degradationLevel: 0,
            birthEpoch: birthEpoch,
            isActive: true
        });

        npcIds.push(npcId);

        emit NPCCreated(npcId, npcType, name, birthEpoch);
        return npcId;
    }

    /**
     * @dev 初始化关键词触发器
     */
    function _initializeKeywords() internal {
        // 创世纪元关键词
        _addKeywordTrigger(unicode"存在的证明", 1, keccak256("archivist"), 0);
        _addKeywordTrigger(unicode"创造者", 2, keccak256("archivist"), 0);
        
        // 萌芽纪元关键词
        _addKeywordTrigger(unicode"信任", 4, keccak256("mercantile"), 1);
        _addKeywordTrigger("DAO", 11, keccak256("architect"), 1);
        
        // 繁盛纪元关键词
        _addKeywordTrigger(unicode"艺术", 12, keccak256("archivist"), 2);
        _addKeywordTrigger("Gas", 13, keccak256("architect"), 2);
        
        // 熵化纪元关键词
        _addKeywordTrigger(unicode"遗忘", 14, keccak256("archivist"), 3);
        _addKeywordTrigger(unicode"宿命", 15, keccak256("oracle"), 3);
        _addKeywordTrigger(unicode"混沌", 16, keccak256("entropy"), 3);
        
        // 毁灭纪元关键词
        _addKeywordTrigger(unicode"永恒", 17, keccak256("archivist"), 4);
    }

    /**
     * @dev 添加关键词触发器
     */
    function _addKeywordTrigger(
        string memory keyword,
        uint256 fragmentId,
        bytes32 npcId,
        uint256 epoch
    ) internal {
        keywordTriggers[keyword] = KeywordTrigger({
            keyword: keyword,
            fragmentId: fragmentId,
            npcId: npcId,
            epoch: epoch,
            isActive: true
        });
        keywords.push(keyword);
    }

    /**
     * @dev 与NPC对话
     */
    function interact(
        bytes32 npcId,
        bytes32 questionHash
    ) external returns (bytes32 responseRequestId) {
        require(npcs[npcId].isActive, "NPC is not active");
        
        NPC storage npc = npcs[npcId];
        
        // 检查NPC是否在当前纪元存在
        uint256 currentEpoch = uint256(epochManager.getCurrentEpoch(msg.sender));
        require(currentEpoch >= npc.birthEpoch, "NPC has not been born yet");
        
        npc.interactionCount++;
        playerInteractionCount[msg.sender]++;

        // 获取当前世界的熵化程度
        uint256 worldEntropy = worldLedger.getEntropyLevel();
        
        // 计算NPC的衰变程度
        uint256 degradation = (worldEntropy + (npc.interactionCount / 10)) / 2;
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
                npc.interactionCount
            )
        );

        // 记录对话
        Dialogue memory dialogue = Dialogue({
            timestamp: block.timestamp,
            inquirer: msg.sender,
            questionHash: questionHash,
            responseHash: responseRequestId,
            entropyLevel: degradation,
            epoch: currentEpoch
        });

        dialogueHistory[npcId].push(dialogue);

        emit DialogueRecorded(npcId, msg.sender, responseRequestId, currentEpoch);

        // 在世界账本中记录交互
        worldLedger.recordEvent(
            WorldLedger.EventType.Interaction,
            responseRequestId,
            string(abi.encodePacked(
                '{"type":"npc_dialogue","npc":"',
                npc.name,
                '","epoch":',
                _uint2str(currentEpoch),
                ',"entropy":',
                _uint2str(degradation),
                '}'
            ))
        );

        return responseRequestId;
    }

    /**
     * @dev 存储对话内容
     */
    function storeDialogue(
        bytes32 npcId,
        bytes32 requestId,
        bytes32 questionHash,
        string calldata questionText,
        string calldata responseText
    ) external {
        require(npcs[npcId].isActive, "NPC inactive");

        dialogueContents[requestId] = DialogueContent({
            requestId: requestId,
            question: questionText,
            response: responseText
        });

        emit DialogueStored(npcId, requestId, msg.sender);

        bytes32 contentHash = keccak256(abi.encodePacked(npcId, requestId, questionHash, responseText));
        string memory meta = string(
            abi.encodePacked(
                '{"type":"npc_dialogue_store","npc":"',
                npcs[npcId].name,
                '","requestId":"0x', _toHexString(requestId),
                '","qHash":"0x', _toHexString(questionHash), '"}'
            )
        );
        worldLedger.recordEvent(WorldLedger.EventType.Memory, contentHash, meta);
    }

    /**
     * @dev 检查并触发关键词奖励
     * 由前端/后端调用，检测到关键词后触发
     */
    function triggerKeywordReward(
        address player,
        string memory keyword,
        bytes32 npcId
    ) external onlyOwner {
        KeywordTrigger storage trigger = keywordTriggers[keyword];
        
        require(trigger.isActive, "Keyword trigger not active");
        require(trigger.npcId == npcId, "Wrong NPC for this keyword");
        
        // 检查玩家当前纪元是否匹配
        uint256 currentEpoch = uint256(epochManager.getCurrentEpoch(player));
        require(currentEpoch == trigger.epoch, "Wrong epoch for this keyword");
        
        // 检查玩家是否已拥有此碎片
        uint256 balance = memoryFragment.balanceOf(player, trigger.fragmentId);
        require(balance == 0, "Fragment already owned");
        
        // 铸造碎片给玩家
        memoryFragment.mint(player, trigger.fragmentId, 1, "");
        
        // 记录碎片收集
        epochManager.recordFragmentCollection(player, trigger.fragmentId);
        
        emit KeywordTriggered(player, npcId, keyword, trigger.fragmentId);
    }

    /**
     * @dev 获取NPC在特定纪元的状态描述
     */
    function getNPCEpochState(bytes32 npcId, address player) 
        external 
        view 
        returns (bool exists, string memory stateDescription) 
    {
        NPC memory npc = npcs[npcId];
        uint256 currentEpoch = uint256(epochManager.getCurrentEpoch(player));
        
        if (currentEpoch < npc.birthEpoch) {
            return (false, "This NPC has not been born yet");
        }
        
        if (currentEpoch == 0) {
            return (true, "Awakening");
        } else if (currentEpoch == 1) {
            return (true, "Growing");
        } else if (currentEpoch == 2) {
            return (true, "Flourishing");
        } else if (currentEpoch == 3) {
            return (true, "Degrading");
        } else {
            return (true, "Fading");
        }
    }

    /**
     * @dev 获取玩家的NPC对话总数
     */
    function getPlayerInteractionCount(address player) external view returns (uint256) {
        return playerInteractionCount[player];
    }

    /**
     * @dev 获取所有关键词
     */
    function getAllKeywords() external view returns (string[] memory) {
        return keywords;
    }

    /**
     * @dev 获取关键词详情
     */
    function getKeywordTrigger(string memory keyword) 
        external 
        view 
        returns (KeywordTrigger memory) 
    {
        return keywordTriggers[keyword];
    }

    // ========== 查询函数 ==========

    function getNPC(bytes32 npcId) external view returns (NPC memory) {
        return npcs[npcId];
    }

    function getAllNPCs() external view returns (bytes32[] memory) {
        return npcIds;
    }

    function getDialogueHistory(bytes32 npcId) external view returns (Dialogue[] memory) {
        return dialogueHistory[npcId];
    }

    function getDialogueCount(bytes32 npcId) external view returns (uint256) {
        return dialogueHistory[npcId].length;
    }

    function getNPCByType(NPCType npcType) external view returns (bytes32[] memory) {
        uint256 count = 0;
        
        for (uint256 i = 0; i < npcIds.length; i++) {
            if (npcs[npcIds[i]].npcType == npcType) {
                count++;
            }
        }

        bytes32[] memory result = new bytes32[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < npcIds.length; i++) {
            if (npcs[npcIds[i]].npcType == npcType) {
                result[index] = npcIds[i];
                index++;
            }
        }

        return result;
    }

    // ========== 辅助函数 ==========

    function _toHexString(bytes32 data) internal pure returns (string memory) {
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(64);
        for (uint256 i = 0; i < 32; i++) {
            str[i*2] = alphabet[uint8(data[i] >> 4)];
            str[i*2+1] = alphabet[uint8(data[i] & 0x0f)];
        }
        return string(str);
    }

    function _uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
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

