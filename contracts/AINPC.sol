// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./WorldLedger.sol";

/**
 * @title AINPC
 * @dev AI-NPC合约 - 瀛州世界中的智能体
 * 每个AI-NPC代表文明中的不同角色：史官、工匠、商序、先知、遗忘
 */
contract AINPC {
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
        uint256 creationTime;
        uint256 interactionCount;
        uint256 degradationLevel; // 0-100，衰变程度
        bool isActive;
    }

    struct Dialogue {
        uint256 timestamp;
        address inquirer;
        bytes32 questionHash;
        bytes32 responseHash;
        uint256 entropyLevel;
    }

    WorldLedger public worldLedger;
    
    mapping(bytes32 => NPC) public npcs;
    mapping(bytes32 => Dialogue[]) public dialogueHistory;
    bytes32[] public npcIds;

    // 对话文本内容（按请求ID索引，避免修改原结构，便于检索）
    struct DialogueContent {
        bytes32 requestId;
        string question;
        string response;
    }

    mapping(bytes32 => DialogueContent) public dialogueContents; // requestId => content

    event NPCCreated(bytes32 indexed npcId, NPCType npcType, string name);
    event DialogueRecorded(bytes32 indexed npcId, address indexed inquirer, bytes32 responseHash);
    event DialogueStored(bytes32 indexed npcId, bytes32 indexed requestId, address indexed inquirer);
    event NPCDegraded(bytes32 indexed npcId, uint256 newDegradationLevel);

    constructor(address _worldLedger) {
        worldLedger = WorldLedger(_worldLedger);
        _initializeNPCs();
    }

    /**
     * @dev 初始化预设的AI-NPC
     */
    function _initializeNPCs() internal {
        _createNPC(NPCType.Archivist, "Chronicle Keeper", "The one who remembers all");
        _createNPC(NPCType.Architect, "Prime Constructor", "The builder of foundations");
        _createNPC(NPCType.Mercantile, "Flow Arbiter", "The keeper of balance");
        _createNPC(NPCType.Oracle, "Future Echo", "The voice of possibilities");
        _createNPC(NPCType.Entropy, "Void Whisper", "The harbinger of dissolution");
    }

    /**
     * @dev 创建NPC
     */
    function _createNPC(
        NPCType npcType,
        string memory name,
        string memory description
    ) internal returns (bytes32) {
        bytes32 npcId = keccak256(
            abi.encodePacked(npcType, name, block.timestamp)
        );

        npcs[npcId] = NPC({
            idHash: npcId,
            npcType: npcType,
            name: name,
            creationTime: block.timestamp,
            interactionCount: 0,
            degradationLevel: 0,
            isActive: true
        });

        npcIds.push(npcId);

        emit NPCCreated(npcId, npcType, name);
        return npcId;
    }

    /**
     * @dev 与NPC对话（链上部分，实际AI响应在链下生成）
     * @param npcId NPC的ID
     * @param questionHash 问题的哈希（链下存储实际问题）
     * @return responseRequestId 响应请求ID，用于链下AI服务
     */
    function interact(
        bytes32 npcId,
        bytes32 questionHash
    ) external returns (bytes32 responseRequestId) {
        require(npcs[npcId].isActive, "NPC is not active");

        NPC storage npc = npcs[npcId];
        npc.interactionCount++;

        // 获取当前世界的熵化程度
        uint256 worldEntropy = worldLedger.getEntropyLevel();
        
        // 计算NPC的衰变程度（基于世界熵化和交互次数）
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

        // 记录对话请求（响应将在链下生成，通过事件监听获取）
        Dialogue memory dialogue = Dialogue({
            timestamp: block.timestamp,
            inquirer: msg.sender,
            questionHash: questionHash,
            // 暂存 requestId 到 responseHash 字段，便于检索
            responseHash: responseRequestId,
            entropyLevel: degradation
        });

        dialogueHistory[npcId].push(dialogue);

        emit DialogueRecorded(npcId, msg.sender, responseRequestId);

        // 在世界账本中记录交互
        worldLedger.recordEvent(
            WorldLedger.EventType.Interaction,
            responseRequestId,
            string(abi.encodePacked(
                '{"type":"npc_dialogue","npc":"',
                npc.name,
                '","entropy":',
                _uint2str(degradation),
                '}'
            ))
        );

        return responseRequestId;
    }

    /**
     * @dev 存储对话的完整文本到链上，并记录到世界账本
     * @param npcId NPC的ID
     * @param requestId 交互生成的请求ID（由 interact 返回/事件提供）
     * @param questionHash 问题哈希（与 interact 时一致）
     * @param questionText 问题文本
     * @param responseText 回答文本
     */
    function storeDialogue(
        bytes32 npcId,
        bytes32 requestId,
        bytes32 questionHash,
        string calldata questionText,
        string calldata responseText
    ) external {
        require(npcs[npcId].isActive, "NPC inactive");

        // 记录文本内容到映射（覆盖式，idempotent）
        dialogueContents[requestId] = DialogueContent({
            requestId: requestId,
            question: questionText,
            response: responseText
        });

        // 保持 history 中的 responseHash 等于 requestId，便于链上定位与回放

        emit DialogueStored(npcId, requestId, msg.sender);

        // 记录到世界账本（作为记忆事件），仅存摘要 + 元数据
        // metadata 采用简短 JSON，避免上链过长
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

    // 将 bytes32 转 hex 字符串（无0x前缀）
    function _toHexString(bytes32 data) internal pure returns (string memory) {
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(64);
        for (uint256 i = 0; i < 32; i++) {
            str[i*2] = alphabet[uint8(data[i] >> 4)];
            str[i*2+1] = alphabet[uint8(data[i] & 0x0f)];
        }
        return string(str);
    }

    /**
     * @dev 获取NPC信息
     */
    function getNPC(bytes32 npcId) external view returns (NPC memory) {
        return npcs[npcId];
    }

    /**
     * @dev 获取所有NPC
     */
    function getAllNPCs() external view returns (bytes32[] memory) {
        return npcIds;
    }

    /**
     * @dev 获取NPC的对话历史
     */
    function getDialogueHistory(bytes32 npcId) external view returns (Dialogue[] memory) {
        return dialogueHistory[npcId];
    }

    /**
     * @dev 获取NPC的对话数量
     */
    function getDialogueCount(bytes32 npcId) external view returns (uint256) {
        return dialogueHistory[npcId].length;
    }

    /**
     * @dev 根据类型获取NPC
     */
    function getNPCByType(NPCType npcType) external view returns (bytes32[] memory) {
        uint256 count = 0;
        
        // 先计数
        for (uint256 i = 0; i < npcIds.length; i++) {
            if (npcs[npcIds[i]].npcType == npcType) {
                count++;
            }
        }

        // 填充数组
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

    /**
     * @dev 辅助函数：uint转string
     */
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

