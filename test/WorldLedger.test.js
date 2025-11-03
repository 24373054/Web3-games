const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("WorldLedger", function () {
  let WorldLedger, worldLedger;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    WorldLedger = await ethers.getContractFactory("WorldLedger");
    worldLedger = await WorldLedger.deploy();
    await worldLedger.waitForDeployment();
  });

  describe("部署", function () {
    it("应该正确设置初始状态", async function () {
      expect(await worldLedger.currentState()).to.equal(0); // Genesis
      expect(await worldLedger.isFinalized()).to.equal(false);
      expect(await worldLedger.worldGovernor()).to.equal(owner.address);
    });

    it("应该创建创世纪元", async function () {
      const era = await worldLedger.getEra(0);
      expect(era.state).to.equal(0);
      expect(era.name).to.include("Genesis");
    });
  });

  describe("数字生命注册", function () {
    it("应该允许governor注册数字生命", async function () {
      await worldLedger.registerDigitalBeing(addr1.address);
      expect(await worldLedger.isDigitalBeing(addr1.address)).to.equal(true);
    });

    it("不应该允许非governor注册数字生命", async function () {
      await expect(
        worldLedger.connect(addr1).registerDigitalBeing(addr2.address)
      ).to.be.revertedWith("Only governor can call");
    });

    it("不应该允许重复注册", async function () {
      await worldLedger.registerDigitalBeing(addr1.address);
      await expect(
        worldLedger.registerDigitalBeing(addr1.address)
      ).to.be.revertedWith("Already registered");
    });
  });

  describe("事件记录", function () {
    beforeEach(async function () {
      await worldLedger.registerDigitalBeing(addr1.address);
    });

    it("应该允许数字生命记录事件", async function () {
      const contentHash = ethers.keccak256(ethers.toUtf8Bytes("test event"));
      const metadata = '{"type":"test"}';

      await expect(
        worldLedger.connect(addr1).recordEvent(0, contentHash, metadata)
      ).to.emit(worldLedger, "EventRecorded");

      const event = await worldLedger.getEvent(0);
      expect(event.actor).to.equal(addr1.address);
      expect(event.contentHash).to.equal(contentHash);
    });

    it("不应该允许非数字生命记录事件", async function () {
      const contentHash = ethers.keccak256(ethers.toUtf8Bytes("test"));
      await expect(
        worldLedger.connect(addr2).recordEvent(0, contentHash, "")
      ).to.be.revertedWith("Only digital beings can interact");
    });
  });

  describe("世界状态推进", function () {
    it("应该允许governor推进状态", async function () {
      await expect(
        worldLedger.advanceState(1) // Emergence
      ).to.emit(worldLedger, "StateChanged");

      expect(await worldLedger.currentState()).to.equal(1);
    });

    it("不应该允许状态倒退", async function () {
      await worldLedger.advanceState(2); // Flourish
      await expect(
        worldLedger.advanceState(1) // 尝试回到 Emergence
      ).to.be.revertedWith("Cannot regress state");
    });
  });

  describe("世界最终化", function () {
    it("应该允许governor最终化世界", async function () {
      await expect(
        worldLedger.finalizeWorld()
      ).to.emit(worldLedger, "WorldFinalized");

      expect(await worldLedger.isFinalized()).to.equal(true);
      expect(await worldLedger.currentState()).to.equal(4); // Collapsed
    });

    it("最终化后不应该允许记录新事件", async function () {
      await worldLedger.registerDigitalBeing(addr1.address);
      await worldLedger.finalizeWorld();

      const contentHash = ethers.keccak256(ethers.toUtf8Bytes("test"));
      await expect(
        worldLedger.connect(addr1).recordEvent(0, contentHash, "")
      ).to.be.revertedWith("World has been finalized");
    });
  });

  describe("熵化程度", function () {
    it("创世纪元熵化应该为0", async function () {
      expect(await worldLedger.getEntropyLevel()).to.equal(0);
    });

    it("最终化后熵化应该为100", async function () {
      await worldLedger.finalizeWorld();
      expect(await worldLedger.getEntropyLevel()).to.equal(100);
    });
  });
});

