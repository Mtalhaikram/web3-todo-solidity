import hre from "hardhat";


async function main() {
    const todo = await hre.viem.deployContract("Todo", []);

    console.log("Todo Contract Deployed At:", todo.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
