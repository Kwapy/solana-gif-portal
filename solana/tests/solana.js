const anchor = require("@project-serum/anchor");

const main = async() => {
  console.log("Starting test...")
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.Solana;
  const tx = await program.rpc.initialize();
  console.log("The transaction is: ", tx)
}

const runMain = async() => {
  try{
    await main()
    process.exit(0)
  }
  catch(err){
    console.error(err)
    process.exit(1)
  }
}

runMain()
