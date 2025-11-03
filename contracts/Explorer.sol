// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DigitalBeing.sol";
import "./MemoryFragment.sol";

/**
 * @title Explorer
 * @dev 探索者系统 - 玩家作为"读者化身"的属性和能力
 * 不是战斗属性，而是探索、理解、记忆能力
 */
contract Explorer {
    // 探索者属性
    struct ExplorerProfile {
        uint256 comprehension;     // 理解力 (0-100) - 影响从NPC获取信息的深度
        uint256 memoryCapacity;    // 记忆容量 (20-100) - 可持有的碎片数量
        uint256 insight;           // 洞察力 (0-100) - 发现隐藏线索的能力
        uint256 resonance;         // 共鸣度 (0-100) - 与NPC建立深度联系的能力
        uint256 perception;        // 感知力 (0-100) - 察觉世界熵化的敏感度
        
        uint256 fragmentsCollected;  // 收集的碎片总数
        uint256 truthsRevealed;      // 揭示的真相数量
        uint256 npcEncounters;       // NPC交互次数
        uint256 deepDialogues;       // 深度对话次数（亲密度>60的对话）
        
        uint256 explorationLevel;    // 探索等级
        uint256 experience;          // 经验值
    }

    // 探索成就
    struct Achievement {
        uint256 id;
        string title;
        string description;
        uint256 reward;            // 奖励经验值
        bool isUnlocked;
    }

    // 探索日志
    struct ExplorationLog {
        uint256 timestamp;
        string eventType;          // "fragment_found", "truth_revealed", "npc_dialogue", "insight_gained"
        string description;
        bytes32 dataHash;
    }

    DigitalBeing public digitalBeingContract;
    MemoryFragment public memoryFragmentContract;

    mapping(address => ExplorerProfile) public explorers;
    mapping(address => bool) public hasInitialized;
    mapping(address => ExplorationLog[]) public explorationLogs;
    mapping(address => mapping(uint256 => bool)) public achievements;
    
    uint256 public constant INITIAL_COMPREHENSION = 30;
    uint256 public constant INITIAL_MEMORY_CAPACITY = 20;
    uint256 public constant INITIAL_INSIGHT = 20;
    uint256 public constant INITIAL_RESONANCE = 30;
    uint256 public constant INITIAL_PERCEPTION = 25;
    
    uint256 public constant EXP_PER_LEVEL = 100;

    // 成就ID
    uint256 public constant ACHIEVEMENT_FIRST_FRAGMENT = 1;
    uint256 public constant ACHIEVEMENT_TRUTH_SEEKER = 2;
    uint256 public constant ACHIEVEMENT_DEEP_CONNECTION = 3;
    uint256 public constant ACHIEVEMENT_ENTROPY_WITNESS = 4;
    uint256 public constant ACHIEVEMENT_MASTER_EXPLORER = 5;

    event ExplorerInitialized(address indexed explorer, uint256 timestamp);
    event AttributeIncreased(address indexed explorer, string attribute, uint256 newValue);
    event LevelUp(address indexed explorer, uint256 newLevel);
    event AchievementUnlocked(address indexed explorer, uint256 achievementId, string title);
    event LogRecorded(address indexed explorer, string eventType, string description);

    constructor(address _digitalBeing, address _memoryFragment) {
        digitalBeingContract = DigitalBeing(_digitalBeing);
        memoryFragmentContract = MemoryFragment(_memoryFragment);
    }

    modifier onlyInitialized() {
        require(hasInitialized[msg.sender], "Explorer not initialized");
        _;
    }

    /**
     * @dev 初始化探索者
     */
    function initializeExplorer() external {
        require(!hasInitialized[msg.sender], "Already initialized");
        require(digitalBeingContract.addressToBeingId(msg.sender) != 0, "Must have a digital being");

        explorers[msg.sender] = ExplorerProfile({
            comprehension: INITIAL_COMPREHENSION,
            memoryCapacity: INITIAL_MEMORY_CAPACITY,
            insight: INITIAL_INSIGHT,
            resonance: INITIAL_RESONANCE,
            perception: INITIAL_PERCEPTION,
            fragmentsCollected: 0,
            truthsRevealed: 0,
            npcEncounters: 0,
            deepDialogues: 0,
            explorationLevel: 1,
            experience: 0
        });

        hasInitialized[msg.sender] = true;
        emit ExplorerInitialized(msg.sender, block.timestamp);
        
        _recordLog(
            msg.sender,
            "initialization",
            "A new digital being awakens in the twilight of Yingzhou",
            keccak256(abi.encodePacked(msg.sender, block.timestamp))
        );
    }

    /**
     * @dev 记录碎片收集
     */
    function recordFragmentCollection(address explorer, uint256 fragmentId) external {
        require(hasInitialized[explorer], "Explorer not initialized");
        
        ExplorerProfile storage profile = explorers[explorer];
        profile.fragmentsCollected++;
        
        // 获得经验
        _gainExperience(explorer, 10);
        
        // 检查首个碎片成就
        if (profile.fragmentsCollected == 1) {
            _unlockAchievement(explorer, ACHIEVEMENT_FIRST_FRAGMENT);
        }
        
        // 记录日志
        (string memory title, , , , , , ) = memoryFragmentContract.getFragment(fragmentId);
        _recordLog(
            explorer,
            "fragment_found",
            string(abi.encodePacked("Discovered fragment: ", title)),
            keccak256(abi.encodePacked(explorer, fragmentId))
        );
        
        // 每10个碎片提升洞察力
        if (profile.fragmentsCollected % 10 == 0 && profile.insight < 100) {
            profile.insight = profile.insight + 5 > 100 ? 100 : profile.insight + 5;
            emit AttributeIncreased(explorer, "insight", profile.insight);
        }
    }

    /**
     * @dev 记录真相揭示
     */
    function recordTruthRevealed(address explorer, uint256 recipeId) external {
        require(hasInitialized[explorer], "Explorer not initialized");
        
        ExplorerProfile storage profile = explorers[explorer];
        profile.truthsRevealed++;
        
        // 获得大量经验
        _gainExperience(explorer, 50);
        
        // 提升理解力
        if (profile.comprehension < 100) {
            profile.comprehension = profile.comprehension + 10 > 100 ? 100 : profile.comprehension + 10;
            emit AttributeIncreased(explorer, "comprehension", profile.comprehension);
        }
        
        // 检查真相探索者成就
        if (profile.truthsRevealed >= 3) {
            _unlockAchievement(explorer, ACHIEVEMENT_TRUTH_SEEKER);
        }
        
        // 检查大师探索者成就
        if (profile.truthsRevealed >= 5) {
            _unlockAchievement(explorer, ACHIEVEMENT_MASTER_EXPLORER);
        }
        
        _recordLog(
            explorer,
            "truth_revealed",
            "A truth about Yingzhou's history has been unveiled",
            keccak256(abi.encodePacked(explorer, recipeId))
        );
    }

    /**
     * @dev 记录NPC交互
     */
    function recordNPCEncounter(address explorer, uint256 intimacyLevel, bool isDeep) external {
        require(hasInitialized[explorer], "Explorer not initialized");
        
        ExplorerProfile storage profile = explorers[explorer];
        profile.npcEncounters++;
        
        if (isDeep) {
            profile.deepDialogues++;
        }
        
        // 获得经验
        _gainExperience(explorer, isDeep ? 15 : 5);
        
        // 提升共鸣度
        if (intimacyLevel > 60 && profile.resonance < 100) {
            profile.resonance = profile.resonance + 3 > 100 ? 100 : profile.resonance + 3;
            emit AttributeIncreased(explorer, "resonance", profile.resonance);
        }
        
        // 检查深度连接成就
        if (profile.deepDialogues >= 10) {
            _unlockAchievement(explorer, ACHIEVEMENT_DEEP_CONNECTION);
        }
    }

    /**
     * @dev 感知熵化
     */
    function recordEntropyPerception(address explorer, uint256 entropyLevel) external {
        require(hasInitialized[explorer], "Explorer not initialized");
        
        ExplorerProfile storage profile = explorers[explorer];
        
        // 感知力随着对熵化的察觉而提升
        if (entropyLevel > 50 && profile.perception < 100) {
            uint256 increase = (entropyLevel - 50) / 10;
            profile.perception = profile.perception + increase > 100 ? 100 : profile.perception + increase;
            emit AttributeIncreased(explorer, "perception", profile.perception);
        }
        
        // 检查熵化见证者成就
        if (entropyLevel > 75) {
            _unlockAchievement(explorer, ACHIEVEMENT_ENTROPY_WITNESS);
        }
        
        if (entropyLevel > 50) {
            _recordLog(
                explorer,
                "entropy_perceived",
                "The decay of the world becomes more apparent",
                keccak256(abi.encodePacked(explorer, entropyLevel))
            );
        }
    }

    /**
     * @dev 获得经验值
     */
    function _gainExperience(address explorer, uint256 amount) internal {
        ExplorerProfile storage profile = explorers[explorer];
        profile.experience += amount;

        // 检查升级
        uint256 requiredExp = profile.explorationLevel * EXP_PER_LEVEL;
        while (profile.experience >= requiredExp) {
            _levelUp(explorer);
            requiredExp = profile.explorationLevel * EXP_PER_LEVEL;
        }
    }

    /**
     * @dev 升级
     */
    function _levelUp(address explorer) internal {
        ExplorerProfile storage profile = explorers[explorer];
        profile.explorationLevel++;
        
        // 提升记忆容量
        profile.memoryCapacity += 5;
        
        // 全属性小幅提升
        if (profile.comprehension < 100) profile.comprehension += 2;
        if (profile.insight < 100) profile.insight += 2;
        if (profile.resonance < 100) profile.resonance += 2;
        if (profile.perception < 100) profile.perception += 2;

        emit LevelUp(explorer, profile.explorationLevel);
        
        _recordLog(
            explorer,
            "level_up",
            string(abi.encodePacked("Reached exploration level ", _uint2str(profile.explorationLevel))),
            keccak256(abi.encodePacked(explorer, profile.explorationLevel))
        );
    }

    /**
     * @dev 解锁成就
     */
    function _unlockAchievement(address explorer, uint256 achievementId) internal {
        if (achievements[explorer][achievementId]) return;
        
        achievements[explorer][achievementId] = true;
        
        string memory title;
        uint256 reward;
        
        if (achievementId == ACHIEVEMENT_FIRST_FRAGMENT) {
            title = "First Memory";
            reward = 20;
        } else if (achievementId == ACHIEVEMENT_TRUTH_SEEKER) {
            title = "Truth Seeker";
            reward = 100;
        } else if (achievementId == ACHIEVEMENT_DEEP_CONNECTION) {
            title = "Deep Connection";
            reward = 80;
        } else if (achievementId == ACHIEVEMENT_ENTROPY_WITNESS) {
            title = "Entropy Witness";
            reward = 60;
        } else if (achievementId == ACHIEVEMENT_MASTER_EXPLORER) {
            title = "Master of Yingzhou";
            reward = 200;
        }
        
        explorers[explorer].experience += reward;
        emit AchievementUnlocked(explorer, achievementId, title);
    }

    /**
     * @dev 记录探索日志
     */
    function _recordLog(
        address explorer,
        string memory eventType,
        string memory description,
        bytes32 dataHash
    ) internal {
        explorationLogs[explorer].push(ExplorationLog({
            timestamp: block.timestamp,
            eventType: eventType,
            description: description,
            dataHash: dataHash
        }));
        
        emit LogRecorded(explorer, eventType, description);
    }

    /**
     * @dev 获取探索者资料
     */
    function getExplorerProfile(address explorer) external view returns (ExplorerProfile memory) {
        return explorers[explorer];
    }

    /**
     * @dev 获取探索日志
     */
    function getExplorationLogs(address explorer) external view returns (ExplorationLog[] memory) {
        return explorationLogs[explorer];
    }

    /**
     * @dev 计算探索力（综合评分）
     */
    function calculateExplorationPower(address explorer) external view returns (uint256) {
        ExplorerProfile memory profile = explorers[explorer];
        return (
            profile.comprehension +
            profile.insight +
            profile.resonance +
            profile.perception +
            (profile.explorationLevel * 10)
        );
    }

    /**
     * @dev 辅助函数：uint转string
     */
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


