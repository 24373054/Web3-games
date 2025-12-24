const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DigitalBeing", function () {
  let WorldLedger, worldLedger;
  let DigitalBeing, digitalBeing;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    // 部署 WorldLedger
    WorldLedger = await ethers.getContractFactory("WorldLedger");
    worldLedger = await WorldLedger.deploy();
    await worldLedger.waitForDeployment();

    // 部署 DigitalBeing
    DigitalBeing = await ethers.getContractFactory("DigitalBeing");
    digitalBeing = await DigitalBeing.deploy(await worldLedger.getAddress());
    await digitalBeing.waitForDeployment();
  });

  describe("创建数字生命", function () {
    it("应该能够创建新的数字生命", async function () {
      await expect(
        digitalBeing.createBeing(addr1.address)
      ).to.emit(digitalBeing, "BeingCreated");

      const beingId = await digitalBeing.addressToBeingId(addr1.address);
      expect(beingId).to.equal(1);
    });

    it("每个地址只能创建一个数字生命", async function () {
      await digitalBeing.createBeing(addr1.address);
      
      await expect(
        digitalBeing.createBeing(addr1.address)
      ).to.be.revertedWith("Address already has a being");
    });

    it("应该正确初始化数字生命数据", async function () {
      await digitalBeing.createBeing(addr1.address);
      
      const [age, memoryCount, interactionCount, genesisHash] = 
        await digitalBeing.reflect(1);
      
      expect(memoryCount).to.equal(0);
      expect(interactionCount).to.equal(0);
      expect(genesisHash).to.not.equal(ethers.ZeroHash);
    });
  });

  describe("记录记忆", function () {
    beforeEach(async function () {
      await digitalBeing.createBeing(addr1.address);
    });

    it("应该允许所有者记录记忆", async function () {
      const contentHash = ethers.keccak256(ethers.toUtf8Bytes("memory"));
      
      await expect(
        digitalBeing.connect(addr1).recordMemory(1, contentHash, "discovery", 0)
      ).to.emit(digitalBeing, "MemoryRecorded");
    });

    it("不应该允许非所有者记录记忆", async function () {
      const contentHash = ethers.keccak256(ethers.toUtf8Bytes("memory"));
      
      await expect(
        digitalBeing.connect(addr2).recordMemory(1, contentHash, "discovery", 0)
      ).to.be.revertedWith("Not the owner");
    });

    it("应该正确增加记忆计数", async function () {
      const contentHash = ethers.keccak256(ethers.toUtf8Bytes("memory"));
      await digitalBeing.connect(addr1).recordMemory(1, contentHash, "discovery", 0);
      
      const [, memoryCount] = await digitalBeing.reflect(1);
      expect(memoryCount).to.equal(1);
    });
  });

  describe("反思功能", function () {
    it("应该返回正确的数字生命状态", async function () {
      await digitalBeing.createBeing(addr1.address);
      
      const [age, memoryCount, interactionCount, genesisHash] = 
        await digitalBeing.reflect(1);
      
      expect(memoryCount).to.equal(0);
      expect(interactionCount).to.equal(0);
    });
  });

  describe("获取记忆", function () {
    beforeEach(async function () {
      await digitalBeing.createBeing(addr1.address);
      const contentHash = ethers.keccak256(ethers.toUtf8Bytes("test memory"));
      await digitalBeing.connect(addr1).recordMemory(1, contentHash, "discovery", 0);
    });

    it("应该能够获取特定记忆", async function () {
      const memory = await digitalBeing.getMemory(1, 0);
      expect(memory.category).to.equal("discovery");
    });

    it("应该能够获取所有记忆", async function () {
      const memories = await digitalBeing.getAllMemories(1);
      expect(memories.length).to.equal(1);
    });
  });
});

