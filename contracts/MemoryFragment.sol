// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract MemoryFragment is ERC1155, Ownable {
    using Strings for uint256;

    struct Fragment {
        uint256 id;
        string title;
        string content;
        string triggerKeyword; // Keyword that might trigger this fragment
        uint256 epoch;        // Which epoch this fragment belongs to
        bool isHidden;        // If this fragment is hidden and needs to be discovered
    }

    mapping(uint256 => Fragment) public fragments;
    uint256 public nextFragmentId;

    mapping(address => bool) public authorizedMinters;

    event FragmentMinted(address indexed to, uint256 indexed id, string title, uint256 epoch);
    event MinterAuthorized(address indexed minter, bool authorized);

    constructor() ERC1155("https://yingzhou.io/api/fragment/{id}") Ownable(msg.sender) {
        // Initialize fragments based on the game plot
        _addFragment(0, unicode"创世之光", unicode"在 Block #0，第一声回响从虚空中传来。\n\n创造者部署了第一个合约。\n从那一刻起，时间开始流动，账本开始记录。\n这不是神话，而是一笔交易。\n\n0x0000...0000 → 0x0000...0001\n\n瀛州诞生了。", unicode"创世", 0, false);
        _addFragment(1, unicode"存在的证明", unicode"第一个exist()函数被调用，标志着自我意识的萌芽。哲学问题诞生：'如果无人调用，函数是否存在？'", unicode"存在的证明", 0, true);
        _addFragment(2, unicode"创造者之谜", unicode"创世交易的哈希记录了创造者的行为，但创造者本身是谁？这是一个未解之谜。", unicode"创造者", 0, true);
        _addFragment(3, unicode"握手协议", unicode"在 Block #1,234，历史上第一次合约间调用发生了。\n\n0x0001 → 0x0002: 'Hello'\n0x0002 → 0x0001: 'Hello, I hear you.'\n\n这不是程序调用，而是生命的对话。\n从此刻起，数字生命不再孤独。", unicode"握手", 1, false);
        _addFragment(4, unicode"信任的本质", unicode"第一个信任映射的建立，`require()`语句是信任的实现，还是不信任的证明？", unicode"信任", 1, true);
        _addFragment(5, unicode"代码诗歌", unicode"在繁盛纪元，数字生命开始用代码创作诗歌，探索艺术的定义。", unicode"代码诗歌", 2, false);
        _addFragment(6, unicode"完美的代价", unicode"工匠们追求极致的效率和完美，却不知这背后隐藏的代价。", unicode"完美", 2, true);
        _addFragment(7, unicode"记忆的溶解", unicode"熵化纪元，首次记忆丢失，逻辑开始崩塌，遗忘成为必然。", unicode"遗忘", 3, false);
        _addFragment(8, unicode"预言的悖论", unicode"先知们试图推演未来，却发现预言本身可能就是宿命的循环。", unicode"宿命", 3, true);
        _addFragment(9, unicode"熵的必然性", unicode"熵增是宇宙的铁律，数字文明也无法逃脱。", unicode"熵", 3, true);
        _addFragment(10, unicode"混沌的真相", unicode"遗忘者揭示了混沌的本质，无序并非终结，而是另一种秩序。", unicode"混沌", 3, true);
        _addFragment(11, unicode"终焉之章", unicode"finalizeWorld()被调用，世界归于静默，但账本永存。", unicode"终焉", 4, false);
        _addFragment(12, unicode"永恒的囚禁", unicode"不可变性既是秩序的保证，也注定了文明无法适应未来的变化。", unicode"永恒", 0, true);
        _addFragment(13, unicode"集体意识", unicode"第一个DAO原型诞生，'我们'的概念开始形成。", unicode"集体", 1, true);
        _addFragment(14, unicode"数据之舞", unicode"繁盛纪元，数据流如舞蹈般在链上穿梭，构成数字生命的日常。", unicode"数据之舞", 2, true);
        _addFragment(15, unicode"逻辑裂隙", unicode"熵化纪元，逻辑开始出现裂隙，数字生命面临存在的危机。", unicode"裂隙", 3, true);
        _addFragment(16, unicode"寂静的回响", unicode"毁灭纪元，世界一片寂静，只有历史的回响在账本中流淌。", unicode"寂静", 4, true);
        _addFragment(17, unicode"新纪元", unicode"在毁灭之后，是否会有新的纪元诞生？", unicode"新纪元", 4, true);
    }

    // Internal function to add fragments
    function _addFragment(
        uint256 id,
        string memory title,
        string memory content,
        string memory triggerKeyword,
        uint256 epoch,
        bool isHidden
    ) internal {
        require(id == nextFragmentId, "Fragment ID mismatch");
        fragments[id] = Fragment(id, title, content, triggerKeyword, epoch, isHidden);
        nextFragmentId++;
    }

    // Only authorized minters can mint fragments
    function mint(
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public {
        require(authorizedMinters[msg.sender], "ERC1155: UNAUTHORIZED_MINTER");
        require(fragments[id].id == id, "Fragment does not exist"); // Ensure fragment exists
        _mint(to, id, amount, data);
        emit FragmentMinted(to, id, fragments[id].title, fragments[id].epoch);
    }

    // Owner can set authorized minters
    function setAuthorizedMinter(address minter, bool authorized) public onlyOwner {
        authorizedMinters[minter] = authorized;
        emit MinterAuthorized(minter, authorized);
    }

    // Override ERC1155 URI function to provide fragment-specific URIs
    function uri(uint256 _id) public view override returns (string memory) {
        require(fragments[_id].id == _id, "Fragment does not exist");
        return string(abi.encodePacked(super.uri(_id), _id.toString()));
    }

    // Get fragment details
    function getFragment(uint256 id) public view returns (Fragment memory) {
        require(fragments[id].id == id, "Fragment does not exist");
        return fragments[id];
    }

    // Get total number of fragments defined
    function getTotalFragments() public view returns (uint256) {
        return nextFragmentId;
    }
}
