const { assert } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")

describe("FundMe", async function () {
    let fundMe
    let deployer
    let MockV3Aggregator
    beforeEach(async function () {
        // deploy our fundMe contract
        // using hardhat deploy
        // const acounts = ethers.getSigners() THESE TWO LINES ARE ANOTHER WAY TO CALL
        // const accountZero = acounts[0]      DEPLOYER ADDRESSES INSTEAD OF METHOD BELOW
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        fundMe = await ethers.getContract("fundMe", deployer)
        mockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        )
    })
    describe("constructor", async function () {
        it("sets the aggregator addresses correctly", async function () {
            const response = await fundMe.priceFeed()
            assert.equal(response, mockV3Aggregator.address)
        })
    })
})
