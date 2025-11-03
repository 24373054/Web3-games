// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./WorldLedger.sol";

/**
 * @title DigitalBeing
 * @dev 数字生命NFT - 玩家在瀛州世界中的化身
 * 每个数字生命都是一个独特的合约实例，拥有自己的记忆和状态
 */
contract DigitalBeing is ERC721, Ownable {
    struct Being {
        uint256 id;
        uint256 birthTime;
        uint256 birthBlock;
        bytes32 genesisHash;     // 创世基因哈希
        uint256 memoryCount;     // 记忆数量
        uint256 interactionCount; // 交互次数
        bool isActive;
    }

    struct Memory {
        uint256 timestamp;
        bytes32 contentHash;
        string category;  // "discovery", "dialogue", "reflection"
        uint256 associatedEvent; // 关联的世界事件ID
    }

    WorldLedger public worldLedger;
    uint256 public beingCounter;

    mapping(uint256 => Being) public beings;
    mapping(uint256 => mapping(uint256 => Memory)) public memories;
    mapping(address => uint256) public addressToBeingId;

    event BeingCreated(uint256 indexed beingId, address indexed owner, uint256 timestamp);
    event MemoryRecorded(uint256 indexed beingId, uint256 memoryIndex, bytes32 contentHash);
    event InteractionPerformed(uint256 indexed beingId, address target, bytes32 interactionHash);

    constructor(address _worldLedger) ERC721("Yingzhou Digital Being", "YZB") Ownable(msg.sender) {
        worldLedger = WorldLedger(_worldLedger);
    }

    /**
     * @dev 创建新的数字生命（铸造NFT）
     */
    function createBeing(address to) external returns (uint256) {
        require(addressToBeingId[to] == 0, "Address already has a being");
        
        uint256 beingId = ++beingCounter;
        
        // 生成独特的基因哈希
        bytes32 genesisHash = keccak256(
            abi.encodePacked(
                to,
                block.timestamp,
                block.number,
                blockhash(block.number - 1)
            )
        );

        beings[beingId] = Being({
            id: beingId,
            birthTime: block.timestamp,
            birthBlock: block.number,
            genesisHash: genesisHash,
            memoryCount: 0,
            interactionCount: 0,
            isActive: true
        });

        addressToBeingId[to] = beingId;
        _safeMint(to, beingId);

        emit BeingCreated(beingId, to, block.timestamp);
        return beingId;
    }

    /**
     * @dev 记录记忆
     */
    function recordMemory(
        uint256 beingId,
        bytes32 contentHash,
        string calldata category,
        uint256 associatedEvent
    ) external {
        require(ownerOf(beingId) == msg.sender, "Not the owner");
        require(beings[beingId].isActive, "Being is not active");

        uint256 memoryIndex = beings[beingId].memoryCount++;

        memories[beingId][memoryIndex] = Memory({
            timestamp: block.timestamp,
            contentHash: contentHash,
            category: category,
            associatedEvent: associatedEvent
        });

        emit MemoryRecorded(beingId, memoryIndex, contentHash);
    }

    /**
     * @dev 执行交互（与其他合约/数字生命）
     */
    function interact(
        uint256 beingId,
        address target,
        bytes calldata data
    ) external returns (bytes memory) {
        require(ownerOf(beingId) == msg.sender, "Not the owner");
        require(beings[beingId].isActive, "Being is not active");

        beings[beingId].interactionCount++;

        bytes32 interactionHash = keccak256(
            abi.encodePacked(target, data, block.timestamp)
        );

        // 在世界账本中记录交互事件
        worldLedger.recordEvent(
            WorldLedger.EventType.Interaction,
            interactionHash,
            string(abi.encodePacked('{"type":"interaction","target":"', _addressToString(target), '"}'))
        );

        emit InteractionPerformed(beingId, target, interactionHash);

        // 执行交互
        (bool success, bytes memory result) = target.call(data);
        require(success, "Interaction failed");

        return result;
    }

    /**
     * @dev 反思 - 查询数字生命的当前状态
     */
    function reflect(uint256 beingId) external view returns (
        uint256 age,
        uint256 memoryCount,
        uint256 interactionCount,
        bytes32 genesisHash
    ) {
        Being memory being = beings[beingId];
        age = block.timestamp - being.birthTime;
        memoryCount = being.memoryCount;
        interactionCount = being.interactionCount;
        genesisHash = being.genesisHash;
    }

    /**
     * @dev 获取记忆
     */
    function getMemory(uint256 beingId, uint256 memoryIndex) 
        external 
        view 
        returns (Memory memory) 
    {
        require(memoryIndex < beings[beingId].memoryCount, "Memory does not exist");
        return memories[beingId][memoryIndex];
    }

    /**
     * @dev 获取数字生命的所有记忆
     */
    function getAllMemories(uint256 beingId) 
        external 
        view 
        returns (Memory[] memory) 
    {
        uint256 count = beings[beingId].memoryCount;
        Memory[] memory allMemories = new Memory[](count);
        
        for (uint256 i = 0; i < count; i++) {
            allMemories[i] = memories[beingId][i];
        }
        
        return allMemories;
    }

    /**
     * @dev 辅助函数：地址转字符串
     */
    function _addressToString(address _addr) internal pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(_addr)));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint256 i = 0; i < 20; i++) {
            str[2+i*2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3+i*2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }
}

