const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🧪 测试完整的交互流程...\n");

  // 从 .env.local 读取合约地址
  const envPath = path.join(__dirname, "..", ".env.local");
  let worldLedgerAddress, digitalBeingAddress, ainpcAddress;

  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      if (line.includes('NEXT_PUBLIC_WORLD_LEDGER_ADDRESS=')) {
        worldLedgerAddress = line.split('=')[1].trim();
      }
      if (line.includes('NEXT_PUBLIC_DIGITAL_BEING_ADDRESS=')) {
        digitalBeingAddress = line.split('=')[1].trim();
      }
      if (line.includes('NEXT_PUBLIC_AINPC_ADDRESS=')) {
        ainpcAddress = line.split('=')[1].trim();
      }
    });
  } catch (error) {
    console.error("❌ 无法读取 .env.local 文件");
    process.exit(1);
  }

  console.log("合约地址:");
  console.log("WorldLedger:", worldLedgerAddress);
  console.log("DigitalBeing:", digitalBeingAddress);
  console.log("AINPC:", ainpcAddress);
  console.log("");

  // 获取合约实例
  const WorldLedger = await hre.ethers.getContractFactory("WorldLedger");
  const worldLedger = WorldLedger.attach(worldLedgerAddress);

  const DigitalBeing = await hre.ethers.getContractFactory("DigitalBeing");
  const digitalBeing = DigitalBeing.attach(digitalBeingAddress);

  const AINPC = await hre.ethers.getContractFactory("AINPC");
  const ainpc = AINPC.attach(ainpcAddress);

  // 获取测试账户
  const [owner, user1] = await hre.ethers.getSigners();
  console.log("测试账户:", user1.address);
  console.log("");

  // 1. 检查注册状态
  console.log("📋 步骤1: 检查注册状态");
  const isDigitalBeingRegistered = await worldLedger.isDigitalBeing(digitalBeingAddress);
  const isAINPCRegistered = await worldLedger.isDigitalBeing(ainpcAddress);
  console.log("  DigitalBeing 已注册:", isDigitalBeingRegistered ? "✅" : "❌");
  console.log("  AINPC 已注册:", isAINPCRegistered ? "✅" : "❌");
  console.log("");

  if (!isDigitalBeingRegistered || !isAINPCRegistered) {
    console.log("❌ 有合约未注册！");
    return;
  }

  // 2. 创建或获取 Being
  console.log("📋 步骤2: 检查用户的 Digital Being");
  let beingId;
  try {
    beingId = await digitalBeing.addressToBeingId(user1.address);
    console.log("  用户已有 Being ID:", beingId.toString());
  } catch (error) {
    console.log("  用户没有 Being，创建中...");
    const tx = await digitalBeing.connect(user1).createBeing();
    await tx.wait();
    beingId = await digitalBeing.addressToBeingId(user1.address);
    console.log("  ✅ Being 创建成功，ID:", beingId.toString());
  }
  console.log("");

  // 3. 获取第一个 NPC
  console.log("📋 步骤3: 获取 NPC 信息");
  const npcIds = await ainpc.getAllNPCs();
  if (npcIds.length === 0) {
    console.log("❌ 没有 NPC！");
    return;
  }
  const testNpcId = npcIds[0];
  const npcInfo = await ainpc.getNPC(testNpcId);
  console.log("  测试 NPC ID:", testNpcId);
  console.log("  NPC 名称:", npcInfo.name);
  console.log("  NPC 类型:", npcInfo.npcType.toString());
  console.log("");

  // 4. 测试直接调用 AINPC.interact（应该成功）
  console.log("📋 步骤4: 直接调用 AINPC.interact");
  try {
    const questionHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("Test question"));
    const tx = await ainpc.connect(user1).interact(testNpcId, questionHash);
    await tx.wait();
    console.log("  ✅ 直接调用成功！");
  } catch (error) {
    console.log("  ❌ 直接调用失败:", error.message);
  }
  console.log("");

  // 5. 测试通过 DigitalBeing.interact 调用（这是用户使用的方式）
  console.log("📋 步骤5: 通过 DigitalBeing.interact 调用");
  try {
    const questionHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("Test question 2"));
    
    // 编码调用数据
    const ainpcInterface = new hre.ethers.Interface([
      "function interact(bytes32 npcId, bytes32 questionHash) external returns (bytes32)"
    ]);
    const callData = ainpcInterface.encodeFunctionData("interact", [testNpcId, questionHash]);
    
    console.log("  Being ID:", beingId.toString());
    console.log("  Target:", ainpcAddress);
    console.log("  Call Data:", callData);
    
    const tx = await digitalBeing.connect(user1).interact(beingId, ainpcAddress, callData);
    const receipt = await tx.wait();
    console.log("  ✅ 通过 DigitalBeing 调用成功！");
    console.log("  Gas 使用:", receipt.gasUsed.toString());
  } catch (error) {
    console.log("  ❌ 通过 DigitalBeing 调用失败:");
    console.log("  ", error.message);
    
    // 尝试获取更详细的错误信息
    if (error.data) {
      console.log("  错误数据:", error.data);
    }
  }
  console.log("");

  console.log("✅ 测试完成！");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 测试失败:", error);
    process.exit(1);
  });

