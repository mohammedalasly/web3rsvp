const hre = require("hardhat")

const main = async () => {

    // deploy the contract
    const rsvpContractFactory = await hre.ethers.getContractFactory("Web3RSVP")
    const rsvpContract = await rsvpContractFactory.deploy()
    await rsvpContract.deployed()
    console.log("Contract deployed to:", rsvpContract.address)

    console.log("--------------------------------------------------------------")

    // define the event data
    let deposit = hre.ethers.utils.parseEther("1")
    let maxCapacity = 3
    let timestamp = 1718926200
    let eventDataCID = "bafybeibhwfzx6oo5rymsxmkdxpmkfwyvbjrrwcl7cekmbzlupmp5ypkyfi"

    // create a new event with our mock data
    let txn = await rsvpContract.createNewEvent(timestamp, deposit, maxCapacity, eventDataCID)
    let wait = await txn.wait()
    console.log("NEW EVENT CREATED:", wait.events[0].event, wait.events[0].args)

    let eventID = wait.events[0].args.eventID
    console.log("EVENT ID:", eventID)

    console.log("--------------------------------------------------------------")

    // call our contract functions from the deployer wallet address
    txn = await rsvpContract.createNewRSVP(eventID, { value: deposit }) // send our deposit
    wait = await txn.wait()
    console.log("NEW RSVP:", wait.events[0].event, wait.events[0].args)

    console.log("--------------------------------------------------------------")

    // To get our deployer wallet address
    const [deployer, address1, address2] = await hre.ethers.getSigners()
    txn = await rsvpContract.connect(address1).createNewRSVP(eventID, { value: deposit })
    wait = await txn.wait()
    console.log("NEW RSVP:", wait.events[0].event, wait.events[0].args)

    console.log("--------------------------------------------------------------")

    txn = await rsvpContract.connect(address2).createNewRSVP(eventID, { value: deposit })
    wait = await txn.wait()
    console.log("NEW RSVP:", wait.events[0].event, wait.events[0].args)

    console.log("--------------------------------------------------------------")

    // call this function from the deployer address
    txn = await rsvpContract.confirmAllAttendees(eventID) // confirm all of the RSVPs
    wait = await txn.wait()
    wait.events.forEach((event) => console.log("CONFIRMED:", event.args.attendeeAddress))

    // wait 10 years
    await hre.network.provider.send("evm_increaseTime", [15778800000000])

    txn = await rsvpContract.withdrawUnclaimedDeposits(eventID)
    wait = await txn.wait()
    console.log("WITHDRAWN:", wait.events[0].event, wait.events[0].args)

    console.log("--------------------------------------------------------------")
}

const runMain = async () => {
    try {
        await main()
        process.exit(0)
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}

runMain()
