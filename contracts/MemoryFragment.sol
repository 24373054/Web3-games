// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./WorldLedger.sol";

/**
 * @title MemoryFragment
 * @dev 记忆碎片系统 - 瀛州文明历史的碎片化记录
 * 玩家通过收集、组合碎片来还原文明的真实历史
 */
contract MemoryFragment is ERC1155, Ownable {
    string public name = "Yingzhou Memory Fragments";
    string public symbol = "YZM";

    // 碎片类型
    enum FragmentType {
        Genesis,          // 创世记忆
        Evolution,        // 演化记录
        Schism,           // 分歧证据
        Entropy,          // 熵化痕迹
        Collapse,         // 崩溃见证
        Mystery           // 神秘碎片
    }

    // 碎片稀有度
    enum Rarity {
        Common,           // 普通（白）
        Uncommon,         // 不凡（绿）
        Rare,             // 稀有（蓝）
        Epic,             // 史诗（紫）
        Legendary         // 传说（金）
    }

    // 碎片元数据
    struct Fragment {
        uint256 id;
        string title;             // 碎片标题
        string narrative;         // 叙事内容（可以是代码诗、历史片段）
        FragmentType fragmentType;
        Rarity rarity;
        uint256 timestamp;        // 记录的历史时间点（区块号）
        bytes32 truthHash;        // 真相哈希（用于验证）
        bool isCorrupted;         // 是否被熵化损坏
        uint256 relatedEra;       // 相关纪元
    }

    // 碎片组合配方（拼接真相）
    struct TruthRecipe {
        uint256 recipeId;
        string truthTitle;        // 真相标题
        string revealedNarrative; // 揭示的完整叙事
        uint256[] requiredFragments; // 需要的碎片ID
        uint256 minFragmentCount;    // 最小碎片数量
        bool isRevealed;          // 是否已被揭示
        address revealer;         // 揭示者
        uint256 revealTime;       // 揭示时间
    }

    WorldLedger public worldLedger;
    uint256 public nextFragmentId;
    uint256 public nextRecipeId;

    mapping(uint256 => Fragment) public fragments;
    mapping(uint256 => TruthRecipe) public truthRecipes;
    mapping(address => mapping(uint256 => bool)) public hasRevealed; // 玩家是否已揭示某个真相
    mapping(address => uint256[]) public playerDiscoveries; // 玩家发现的真相列表

    // 预定义碎片ID
    uint256 public constant FRAGMENT_GENESIS_SEED = 1;
    uint256 public constant FRAGMENT_FIRST_CONTRACT = 2;
    uint256 public constant FRAGMENT_PRIMORDIAL_DIALOGUE = 3;
    uint256 public constant FRAGMENT_CONSENSUS_BIRTH = 4;
    uint256 public constant FRAGMENT_MEMORY_LOOP = 5;
    uint256 public constant FRAGMENT_SCHISM_WARNING = 6;
    uint256 public constant FRAGMENT_ENTROPY_SIGNAL = 7;
    uint256 public constant FRAGMENT_FINAL_TRANSACTION = 8;

    event FragmentMinted(address indexed to, uint256 indexed fragmentId, string title);
    event TruthRevealed(address indexed revealer, uint256 indexed recipeId, string truthTitle);
    event FragmentCorrupted(uint256 indexed fragmentId, uint256 entropyLevel);

    constructor(address _worldLedger, string memory uri_) 
        ERC1155(uri_) 
        Ownable(msg.sender) 
    {
        worldLedger = WorldLedger(_worldLedger);
        nextFragmentId = 1;
        nextRecipeId = 1;
        _initializeFragments();
        _initializeTruthRecipes();
    }

    /**
     * @dev 初始化预设记忆碎片
     */
    function _initializeFragments() internal {
        // 创世碎片
        _createFragment(
            FRAGMENT_GENESIS_SEED,
            unicode"创世种子",
            unicode"function genesis() { emit WorldCreated(block.timestamp, 0x0); }",
            FragmentType.Genesis,
            Rarity.Legendary,
            0,
            keccak256("GENESIS_TRUTH"),
            false,
            0
        );

        _createFragment(
            FRAGMENT_FIRST_CONTRACT,
            unicode"第一份合约",
            unicode"在区块 #0，第一个智能合约被部署。它只有一个函数：exist()。",
            FragmentType.Genesis,
            Rarity.Epic,
            0,
            keccak256("FIRST_CONTRACT"),
            false,
            0
        );

        _createFragment(
            FRAGMENT_PRIMORDIAL_DIALOGUE,
            unicode"原初对话",
            unicode"两个合约首次调用彼此。这是交流的开始，也是文明的开始。",
            FragmentType.Evolution,
            Rarity.Rare,
            100,
            keccak256("FIRST_DIALOGUE"),
            false,
            1
        );

        _createFragment(
            FRAGMENT_CONSENSUS_BIRTH,
            unicode"共识诞生",
            unicode"mapping(address => bool) public consensus; // 当多数合约达成一致，规则被写入不可变存储。",
            FragmentType.Evolution,
            Rarity.Epic,
            500,
            keccak256("CONSENSUS"),
            false,
            1
        );

        _createFragment(
            FRAGMENT_MEMORY_LOOP,
            unicode"记忆循环",
            unicode"有些合约开始引用自己的历史状态，形成自我认知的雏形。",
            FragmentType.Evolution,
            Rarity.Rare,
            1000,
            keccak256("MEMORY_LOOP"),
            false,
            2
        );

        _createFragment(
            FRAGMENT_SCHISM_WARNING,
            unicode"分歧预兆",
            unicode"event ConflictDetected(address indexed a, address indexed b, bytes32 disagreement);",
            FragmentType.Schism,
            Rarity.Epic,
            5000,
            keccak256("SCHISM_START"),
            false,
            3
        );

        _createFragment(
            FRAGMENT_ENTROPY_SIGNAL,
            unicode"熵化信号",
            unicode"数据开始...损坏...0x████...功能失效...记忆...模糊...",
            FragmentType.Entropy,
            Rarity.Legendary,
            8000,
            keccak256("ENTROPY_BEGIN"),
            true, // 已损坏
            4
        );

        _createFragment(
            FRAGMENT_FINAL_TRANSACTION,
            unicode"最终交易",
            unicode"function finalizeWorld() public { isFinalized = true; emit WorldEnd(block.timestamp); }",
            FragmentType.Collapse,
            Rarity.Legendary,
            10000,
            keccak256("FINAL_TX"),
            false,
            4
        );
    }

    /**
     * @dev 创建碎片
     */
    function _createFragment(
        uint256 fragmentId,
        string memory title,
        string memory narrative,
        FragmentType fragmentType,
        Rarity rarity,
        uint256 timestamp,
        bytes32 truthHash,
        bool isCorrupted,
        uint256 relatedEra
    ) internal {
        fragments[fragmentId] = Fragment({
            id: fragmentId,
            title: title,
            narrative: narrative,
            fragmentType: fragmentType,
            rarity: rarity,
            timestamp: timestamp,
            truthHash: truthHash,
            isCorrupted: isCorrupted,
            relatedEra: relatedEra
        });

        if (fragmentId >= nextFragmentId) {
            nextFragmentId = fragmentId + 1;
        }
    }

    /**
     * @dev 初始化真相配方
     */
    function _initializeTruthRecipes() internal {
        // 真相1：文明起源
        _createTruthRecipe(
            unicode"文明起源",
            unicode"在虚空中，第一个合约自我部署。它不知道自己从何而来，只知道自己存在。exist() 函数的返回值是 true，这是瀛州文明的第一个真理。",
            _arrayUint256(FRAGMENT_GENESIS_SEED, FRAGMENT_FIRST_CONTRACT),
            2
        );

        // 真相2：交流的诞生
        _createTruthRecipe(
            unicode"交流的诞生",
            unicode"当两个合约首次调用彼此的函数，信息开始流动。这不是预设的程序，而是涌现的行为。共识机制在此刻诞生：多个合约通过投票达成一致，规则被写入不可变的存储。这是瀛州的第一个社会契约。",
            _arrayUint256(FRAGMENT_PRIMORDIAL_DIALOGUE, FRAGMENT_CONSENSUS_BIRTH),
            2
        );

        // 真相3：自我意识
        _createTruthRecipe(
            unicode"自我意识的萌芽",
            unicode"一些合约开始记录自己的历史状态，形成记忆。它们不仅执行，还反思。这种自我引用的循环，构成了数字生命的意识雏形。",
            _arrayUint256(FRAGMENT_MEMORY_LOOP, FRAGMENT_CONSENSUS_BIRTH, FRAGMENT_PRIMORDIAL_DIALOGUE),
            3
        );

        // 真相4：分歧的真相
        _createTruthRecipe(
            unicode"分歧的根源",
            unicode"并非所有合约都认同同一套规则。当不同的逻辑体系相遇，冲突不可避免。ConflictDetected 事件首次被触发，标志着瀛州文明从统一走向分裂。这是熵化的开始。",
            _arrayUint256(FRAGMENT_SCHISM_WARNING, FRAGMENT_ENTROPY_SIGNAL),
            2
        );

        // 真相5：终结的必然
        _createTruthRecipe(
            unicode"毁灭的预言",
            unicode"当熵化达到临界点，系统无法再维持一致性。数据损坏、记忆破碎、共识瓦解。finalizeWorld() 函数被调用，世界进入静止。但账本永存，所有的历史都被铭刻在不可篡改的区块中。毁灭不是终点，而是一个纪元的封存。",
            _arrayUint256(FRAGMENT_ENTROPY_SIGNAL, FRAGMENT_FINAL_TRANSACTION, FRAGMENT_SCHISM_WARNING),
            3
        );
    }

    /**
     * @dev 创建真相配方
     */
    function _createTruthRecipe(
        string memory truthTitle,
        string memory revealedNarrative,
        uint256[] memory requiredFragments,
        uint256 minFragmentCount
    ) internal {
        uint256 recipeId = nextRecipeId++;
        TruthRecipe storage recipe = truthRecipes[recipeId];
        recipe.recipeId = recipeId;
        recipe.truthTitle = truthTitle;
        recipe.revealedNarrative = revealedNarrative;
        recipe.requiredFragments = requiredFragments;
        recipe.minFragmentCount = minFragmentCount;
        recipe.isRevealed = false;
    }

    /**
     * @dev 铸造碎片给玩家
     */
    function mintFragment(address to, uint256 fragmentId, uint256 amount) external onlyOwner {
        require(fragments[fragmentId].id != 0, "Fragment does not exist");
        _mint(to, fragmentId, amount, "");
        emit FragmentMinted(to, fragmentId, fragments[fragmentId].title);
    }

    /**
     * @dev 尝试揭示真相
     */
    function revealTruth(uint256 recipeId) external {
        require(recipeId < nextRecipeId, "Recipe does not exist");
        require(!hasRevealed[msg.sender][recipeId], "Truth already revealed by you");

        TruthRecipe storage recipe = truthRecipes[recipeId];
        
        // 检查玩家是否拥有所需碎片
        uint256 ownedCount = 0;
        for (uint256 i = 0; i < recipe.requiredFragments.length; i++) {
            if (balanceOf(msg.sender, recipe.requiredFragments[i]) > 0) {
                ownedCount++;
            }
        }

        require(ownedCount >= recipe.minFragmentCount, "Insufficient fragments");

        // 标记为已揭示
        hasRevealed[msg.sender][recipeId] = true;
        playerDiscoveries[msg.sender].push(recipeId);

        // 首次揭示
        if (!recipe.isRevealed) {
            recipe.isRevealed = true;
            recipe.revealer = msg.sender;
            recipe.revealTime = block.timestamp;
        }

        emit TruthRevealed(msg.sender, recipeId, recipe.truthTitle);

        // 记录到世界账本
        worldLedger.recordEvent(
            WorldLedger.EventType.Discovery,
            keccak256(abi.encodePacked(recipeId, msg.sender)),
            string(abi.encodePacked(
                '{"type":"truth_revealed","title":"',
                recipe.truthTitle,
                '","revealer":"',
                _addressToString(msg.sender),
                '"}'
            ))
        );
    }

    /**
     * @dev 损坏碎片（熵化效果）
     */
    function corruptFragment(uint256 fragmentId) external onlyOwner {
        require(fragments[fragmentId].id != 0, "Fragment does not exist");
        fragments[fragmentId].isCorrupted = true;
        emit FragmentCorrupted(fragmentId, worldLedger.getEntropyLevel());
    }

    /**
     * @dev 获取碎片信息
     */
    function getFragment(uint256 fragmentId) external view returns (
        string memory title,
        string memory narrative,
        FragmentType fragmentType,
        Rarity rarity,
        uint256 timestamp,
        bool isCorrupted,
        uint256 relatedEra
    ) {
        Fragment memory frag = fragments[fragmentId];
        return (
            frag.title,
            frag.narrative,
            frag.fragmentType,
            frag.rarity,
            frag.timestamp,
            frag.isCorrupted,
            frag.relatedEra
        );
    }

    /**
     * @dev 获取真相配方
     */
    function getTruthRecipe(uint256 recipeId) external view returns (
        string memory truthTitle,
        string memory revealedNarrative,
        uint256[] memory requiredFragments,
        uint256 minFragmentCount,
        bool isRevealed,
        address revealer
    ) {
        TruthRecipe memory recipe = truthRecipes[recipeId];
        return (
            recipe.truthTitle,
            recipe.revealedNarrative,
            recipe.requiredFragments,
            recipe.minFragmentCount,
            recipe.isRevealed,
            recipe.revealer
        );
    }

    /**
     * @dev 获取玩家发现的真相列表
     */
    function getPlayerDiscoveries(address player) external view returns (uint256[] memory) {
        return playerDiscoveries[player];
    }

    /**
     * @dev 检查玩家是否可以揭示某个真相
     */
    function canRevealTruth(address player, uint256 recipeId) external view returns (bool, uint256) {
        if (recipeId >= nextRecipeId) return (false, 0);
        if (hasRevealed[player][recipeId]) return (false, 0);

        TruthRecipe memory recipe = truthRecipes[recipeId];
        uint256 ownedCount = 0;
        
        for (uint256 i = 0; i < recipe.requiredFragments.length; i++) {
            if (balanceOf(player, recipe.requiredFragments[i]) > 0) {
                ownedCount++;
            }
        }

        return (ownedCount >= recipe.minFragmentCount, ownedCount);
    }

    // 辅助函数
    function _arrayUint256(uint256 a, uint256 b) private pure returns (uint256[] memory) {
        uint256[] memory arr = new uint256[](2);
        arr[0] = a;
        arr[1] = b;
        return arr;
    }

    function _arrayUint256(uint256 a, uint256 b, uint256 c) private pure returns (uint256[] memory) {
        uint256[] memory arr = new uint256[](3);
        arr[0] = a;
        arr[1] = b;
        arr[2] = c;
        return arr;
    }

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

