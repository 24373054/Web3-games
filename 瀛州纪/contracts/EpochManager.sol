// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./WorldLedger.sol";
import "./DigitalBeing.sol";
import "./AINPC.sol";

/**
 * @title EpochManager
 * @notice 瀛州文明五大纪元管理合约
 * @dev 管理纪元切换、状态追踪和推进条件验证
 */
contract EpochManager {
    // 五大纪元枚举
    enum Epoch {
        Genesis,      // 0: 创世纪元 (Block 0 - 1,000)
        Emergence,    // 1: 萌芽纪元 (Block 1,001 - 10,000)
        Flourish,     // 2: 繁盛纪元 (Block 10,001 - 150,000)
        Entropy,      // 3: 熵化纪元 (Block 150,001 - 199,999)
        Destruction   // 4: 毁灭纪元 (Block 200,000+)
    }

    // 纪元状态结构
    struct EpochState {
        string name;              // 纪元名称
        uint256 startBlock;       // 起始区块
        uint256 endBlock;         // 结束区块
        uint8 harmonyLevel;       // 和谐度 0-100
        uint16 populationCount;   // 数字生命数量
        bool isActive;            // 是否激活
        string colorTheme;        // 颜色主题 (JSON格式)
    }

    // 推进条件结构
    struct AdvancementRequirement {
        uint8 minFragments;           // 最少碎片数
        bytes32[] requiredNPCIds;     // 必须对话的NPC ID列表
        uint256 minInteractions;      // 最少交互次数
    }

    // 状态变量
    address public worldLedger;
    address public digitalBeing;
    address public ainpc;
    address public owner;

    // 纪元配置
    mapping(uint8 => EpochState) public epochs;
    mapping(uint8 => AdvancementRequirement) public requirements;
    
    // 玩家当前纪元
    mapping(address => uint8) public playerEpoch;
    
    // 纪元推进历史
    mapping(address => mapping(uint8 => uint256)) public epochAdvancedAt;
    
    // 玩家收集的碎片记录
    mapping(address => mapping(uint256 => bool)) public playerFragments;
    mapping(address => uint256) public playerFragmentCount;
    
    // 授权的碎片铸造者
    address public memoryFragmentContract;
    address public ainpcExtendedContract;

    // 事件
    event EpochAdvanced(
        address indexed player,
        uint8 fromEpoch,
        uint8 toEpoch,
        uint256 timestamp
    );
    
    event EpochConfigured(
        uint8 indexed epoch,
        string name,
        uint256 startBlock,
        uint256 endBlock
    );

    // 修饰符
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor(
        address _worldLedger,
        address _digitalBeing,
        address _ainpc
    ) {
        owner = msg.sender;
        worldLedger = _worldLedger;
        digitalBeing = _digitalBeing;
        ainpc = _ainpc;

        // 初始化五大纪元配置
        _initializeEpochs();
        _initializeRequirements();
    }

    /**
     * @notice 初始化五大纪元配置
     */
    function _initializeEpochs() private {
        // 创世纪元
        epochs[0] = EpochState({
            name: unicode"创世纪元",
            startBlock: 0,
            endBlock: 1000,
            harmonyLevel: 0,
            populationCount: 1,
            isActive: true,
            colorTheme: '{"clear":[0.02,0.02,0.1],"bubble":[0.1,0.15,0.4]}'
        });

        // 萌芽纪元
        epochs[1] = EpochState({
            name: unicode"萌芽纪元",
            startBlock: 1001,
            endBlock: 10000,
            harmonyLevel: 30,
            populationCount: 100,
            isActive: true,
            colorTheme: '{"clear":[0.05,0.15,0.1],"bubble":[0.2,0.4,0.3]}'
        });

        // 繁盛纪元
        epochs[2] = EpochState({
            name: unicode"繁盛纪元",
            startBlock: 10001,
            endBlock: 150000,
            harmonyLevel: 100,
            populationCount: 10000,
            isActive: true,
            colorTheme: '{"clear":[0.2,0.15,0.02],"bubble":[0.6,0.5,0.2]}'
        });

        // 熵化纪元
        epochs[3] = EpochState({
            name: unicode"熵化纪元",
            startBlock: 150001,
            endBlock: 199999,
            harmonyLevel: 23,
            populationCount: 3000,
            isActive: true,
            colorTheme: '{"clear":[0.15,0.05,0.05],"bubble":[0.4,0.2,0.2]}'
        });

        // 毁灭纪元
        epochs[4] = EpochState({
            name: unicode"毁灭纪元",
            startBlock: 200000,
            endBlock: type(uint256).max,
            harmonyLevel: 0,
            populationCount: 0,
            isActive: true,
            colorTheme: '{"clear":[0.05,0.05,0.05],"bubble":[0.3,0.3,0.3]}'
        });
    }

    /**
     * @notice 初始化推进条件
     */
    function _initializeRequirements() private {
        // 创世 → 萌芽: 1碎片 + 史官对话
        bytes32[] memory req0 = new bytes32[](1);
        req0[0] = keccak256("archivist");
        requirements[0] = AdvancementRequirement({
            minFragments: 1,
            requiredNPCIds: req0,
            minInteractions: 1
        });

        // 萌芽 → 繁盛: 3碎片 + 史官和商序对话
        bytes32[] memory req1 = new bytes32[](2);
        req1[0] = keccak256("archivist");
        req1[1] = keccak256("merchant");
        requirements[1] = AdvancementRequirement({
            minFragments: 3,
            requiredNPCIds: req1,
            minInteractions: 3
        });

        // 繁盛 → 熵化: 5碎片 + 史官、工匠对话
        bytes32[] memory req2 = new bytes32[](2);
        req2[0] = keccak256("archivist");
        req2[1] = keccak256("architect");
        requirements[2] = AdvancementRequirement({
            minFragments: 5,
            requiredNPCIds: req2,
            minInteractions: 5
        });

        // 熵化 → 毁灭: 7碎片 + 遗忘者对话
        bytes32[] memory req3 = new bytes32[](1);
        req3[0] = keccak256("entropy");
        requirements[3] = AdvancementRequirement({
            minFragments: 7,
            requiredNPCIds: req3,
            minInteractions: 7
        });
    }

    /**
     * @notice 获取玩家当前纪元
     */
    function getCurrentEpoch(address player) external view returns (Epoch) {
        return Epoch(playerEpoch[player]);
    }

    /**
     * @notice 获取纪元详细信息
     */
    function getEpochState(uint8 epochId) external view returns (EpochState memory) {
        require(epochId <= 4, "Invalid epoch ID");
        return epochs[epochId];
    }

    /**
     * @notice 检查是否可以推进到下一纪元
     * @param player 玩家地址
     * @return canAdvance 是否可推进
     * @return reason 原因说明
     */
    function canAdvanceEpoch(address player) 
        external 
        view 
        returns (bool canAdvance, string memory reason) 
    {
        uint8 currentEpoch = playerEpoch[player];
        
        // 已在最后纪元
        if (currentEpoch >= 4) {
            return (false, unicode"已达到最终纪元");
        }

        AdvancementRequirement memory req = requirements[currentEpoch];

        // 检查碎片数量（需要MemoryFragment合约，暂时跳过）
        // TODO: 实现碎片数量检查

        // 检查NPC对话（需要查询AINPC合约）
        // TODO: 实现NPC对话检查

        // 检查交互次数
        DigitalBeing db = DigitalBeing(digitalBeing);
        try db.addressToBeingId(player) returns (uint256 beingId) {
            // TODO: 获取交互次数并验证
            return (true, unicode"满足推进条件");
        } catch {
            return (false, unicode"未创建数字生命");
        }
    }

    /**
     * @notice 推进到下一纪元
     * @param player 玩家地址
     */
    function advanceEpoch(address player) external {
        uint8 currentEpoch = playerEpoch[player];
        require(currentEpoch < 4, "Already at final epoch");

        // 验证推进条件（简化版本，待完善）
        // TODO: 完整验证逻辑

        uint8 newEpoch = currentEpoch + 1;
        playerEpoch[player] = newEpoch;
        epochAdvancedAt[player][newEpoch] = block.timestamp;

        emit EpochAdvanced(player, currentEpoch, newEpoch, block.timestamp);
    }

    /**
     * @notice 获取纪元主题配置（用于前端）
     */
    function getEpochTheme(uint8 epochId) 
        external 
        view 
        returns (string memory) 
    {
        require(epochId <= 4, "Invalid epoch ID");
        return epochs[epochId].colorTheme;
    }

    /**
     * @notice 获取推进要求
     */
    function getRequirement(uint8 epochId) 
        external 
        view 
        returns (
            uint8 minFragments,
            bytes32[] memory requiredNPCs,
            uint256 minInteractions
        ) 
    {
        require(epochId <= 3, "No requirement for final epoch");
        AdvancementRequirement memory req = requirements[epochId];
        return (req.minFragments, req.requiredNPCIds, req.minInteractions);
    }

    /**
     * @notice 管理员设置纪元参数
     */
    function setEpochHarmony(uint8 epochId, uint8 harmony) 
        external 
        onlyOwner 
    {
        require(epochId <= 4, "Invalid epoch ID");
        require(harmony <= 100, "Harmony must be 0-100");
        epochs[epochId].harmonyLevel = harmony;
    }

    /**
     * @notice 获取玩家的纪元历史
     */
    function getPlayerEpochHistory(address player) 
        external 
        view 
        returns (uint256[5] memory timestamps) 
    {
        for (uint8 i = 0; i < 5; i++) {
            timestamps[i] = epochAdvancedAt[player][i];
        }
        return timestamps;
    }
    
    /**
     * @notice 设置授权的合约地址
     */
    function setAuthorizedContracts(
        address _memoryFragment,
        address _ainpcExtended
    ) external onlyOwner {
        memoryFragmentContract = _memoryFragment;
        ainpcExtendedContract = _ainpcExtended;
    }
    
    /**
     * @notice 记录玩家收集碎片
     * @dev 只能由授权合约调用
     */
    function recordFragmentCollection(address player, uint256 fragmentId) external {
        require(
            msg.sender == memoryFragmentContract || msg.sender == ainpcExtendedContract,
            "Unauthorized: only MemoryFragment or AINPC contracts"
        );
        
        // 如果玩家还没有这个碎片，则记录
        if (!playerFragments[player][fragmentId]) {
            playerFragments[player][fragmentId] = true;
            playerFragmentCount[player]++;
        }
    }
    
    /**
     * @notice 获取玩家的碎片数量
     */
    function getPlayerFragmentCount(address player) external view returns (uint256) {
        return playerFragmentCount[player];
    }
    
    /**
     * @notice 检查玩家是否拥有某个碎片
     */
    function hasFragment(address player, uint256 fragmentId) external view returns (bool) {
        return playerFragments[player][fragmentId];
    }
}

