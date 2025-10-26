// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title WorldLedger
 * @dev 瀛州文明的世界账本 - 记录整个数字文明从创世到毁灭的历史
 */
contract WorldLedger {
    // 世界状态
    enum WorldState {
        Genesis,      // 创世
        Emergence,    // 萌芽
        Flourish,     // 繁盛
        Entropy,      // 熵化
        Collapsed     // 毁灭
    }

    // 事件类型
    enum EventType {
        Creation,     // 创建事件
        Interaction,  // 交互事件
        Discovery,    // 发现事件
        Conflict,     // 冲突事件
        Memory        // 记忆事件
    }

    // 历史事件结构
    struct HistoricalEvent {
        uint256 id;
        uint256 timestamp;
        uint256 blockNumber;
        EventType eventType;
        address actor;
        bytes32 contentHash;  // IPFS或链下存储的哈希
        string metadata;      // JSON格式的元数据
        bool isSealed;        // 是否已封存
    }

    // 世界纪元结构
    struct Era {
        string name;
        uint256 startBlock;
        uint256 endBlock;
        WorldState state;
        bytes32 narrativeHash;
    }

    // 状态变量
    WorldState public currentState;
    uint256 public currentEra;
    uint256 public eventCounter;
    uint256 public birthBlock;
    bool public isFinalized;

    // 存储
    mapping(uint256 => HistoricalEvent) public events;
    mapping(uint256 => Era) public eras;
    mapping(address => bool) public isDigitalBeing;
    mapping(address => uint256[]) public beingEvents;

    // 世界管理员（可以是DAO合约）
    address public worldGovernor;

    // 事件
    event WorldCreated(uint256 timestamp, uint256 blockNumber);
    event StateChanged(WorldState oldState, WorldState newState, uint256 timestamp);
    event EventRecorded(uint256 indexed eventId, EventType eventType, address indexed actor);
    event EraEnded(uint256 indexed eraId, uint256 blockNumber);
    event WorldFinalized(uint256 timestamp, uint256 finalBlock);
    event DigitalBeingRegistered(address indexed being, uint256 timestamp);

    modifier onlyGovernor() {
        require(msg.sender == worldGovernor, "Only governor can call");
        _;
    }

    modifier notFinalized() {
        require(!isFinalized, "World has been finalized");
        _;
    }

    modifier onlyDigitalBeing() {
        require(isDigitalBeing[msg.sender], "Only digital beings can interact");
        _;
    }

    constructor() {
        worldGovernor = msg.sender;
        currentState = WorldState.Genesis;
        birthBlock = block.number;
        eventCounter = 0;
        currentEra = 0;

        // 创建创世纪元
        eras[0] = Era({
            name: "Genesis Era",
            startBlock: block.number,
            endBlock: 0,
            state: WorldState.Genesis,
            narrativeHash: keccak256("The beginning of Yingzhou")
        });

        emit WorldCreated(block.timestamp, block.number);
    }

    /**
     * @dev 注册数字生命
     */
    function registerDigitalBeing(address being) external onlyGovernor notFinalized {
        require(!isDigitalBeing[being], "Already registered");
        isDigitalBeing[being] = true;
        emit DigitalBeingRegistered(being, block.timestamp);
    }

    /**
     * @dev 记录历史事件
     */
    function recordEvent(
        EventType eventType,
        bytes32 contentHash,
        string calldata metadata
    ) external onlyDigitalBeing notFinalized returns (uint256) {
        uint256 eventId = eventCounter++;
        
        events[eventId] = HistoricalEvent({
            id: eventId,
            timestamp: block.timestamp,
            blockNumber: block.number,
            eventType: eventType,
            actor: msg.sender,
            contentHash: contentHash,
            metadata: metadata,
            isSealed: false
        });

        beingEvents[msg.sender].push(eventId);

        emit EventRecorded(eventId, eventType, msg.sender);
        return eventId;
    }

    /**
     * @dev 推进世界状态
     */
    function advanceState(WorldState newState) external onlyGovernor notFinalized {
        require(uint8(newState) > uint8(currentState), "Cannot regress state");
        require(uint8(newState) <= uint8(WorldState.Collapsed), "Invalid state");

        WorldState oldState = currentState;
        currentState = newState;

        // 结束当前纪元
        eras[currentEra].endBlock = block.number;
        emit EraEnded(currentEra, block.number);

        // 开始新纪元
        currentEra++;
        eras[currentEra] = Era({
            name: getEraName(newState),
            startBlock: block.number,
            endBlock: 0,
            state: newState,
            narrativeHash: bytes32(0)
        });

        emit StateChanged(oldState, newState, block.timestamp);
    }

    /**
     * @dev 最终化世界 - 游戏的终点
     */
    function finalizeWorld() external onlyGovernor notFinalized {
        isFinalized = true;
        
        if (currentState != WorldState.Collapsed) {
            currentState = WorldState.Collapsed;
        }

        eras[currentEra].endBlock = block.number;
        
        emit WorldFinalized(block.timestamp, block.number);
    }

    /**
     * @dev 查询数字生命的所有事件
     */
    function getBeingEvents(address being) external view returns (uint256[] memory) {
        return beingEvents[being];
    }

    /**
     * @dev 查询事件详情
     */
    function getEvent(uint256 eventId) external view returns (HistoricalEvent memory) {
        require(eventId < eventCounter, "Event does not exist");
        return events[eventId];
    }

    /**
     * @dev 获取纪元信息
     */
    function getEra(uint256 eraId) external view returns (Era memory) {
        return eras[eraId];
    }

    /**
     * @dev 获取当前世界年龄（以区块计）
     */
    function getWorldAge() external view returns (uint256) {
        return block.number - birthBlock;
    }

    /**
     * @dev 获取纪元名称
     */
    function getEraName(WorldState state) internal pure returns (string memory) {
        if (state == WorldState.Genesis) return "Genesis Era - The Beginning";
        if (state == WorldState.Emergence) return "Emergence Era - The Awakening";
        if (state == WorldState.Flourish) return "Flourish Era - The Golden Age";
        if (state == WorldState.Entropy) return "Entropy Era - The Decay";
        if (state == WorldState.Collapsed) return "Collapse - The End";
        return "Unknown Era";
    }

    /**
     * @dev 获取熵化程度（0-100）
     * 随着时间推移，熵化程度增加，影响AI的回答质量
     */
    function getEntropyLevel() external view returns (uint256) {
        if (isFinalized) return 100;
        
        uint256 age = block.number - birthBlock;
        uint256 entropy;

        if (currentState == WorldState.Genesis) {
            entropy = 0;
        } else if (currentState == WorldState.Emergence) {
            entropy = (age * 10) / 100;
        } else if (currentState == WorldState.Flourish) {
            entropy = (age * 25) / 100;
        } else if (currentState == WorldState.Entropy) {
            entropy = (age * 60) / 100;
        } else {
            entropy = 100;
        }

        return entropy > 100 ? 100 : entropy;
    }
}

