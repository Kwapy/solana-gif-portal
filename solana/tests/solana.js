const anchor = require("@project-serum/anchor");

const { SystemProgram } = anchor.web3;

const main = async() => {
  console.log("🛰 Starting test...")

  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider);

  const program = anchor.workspace.Solana;

  const baseAccount = anchor.web3.Keypair.generate()

  const tx = await program.rpc.initialize({
    accounts: {
      baseAccount: baseAccount.publicKey,
      user: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
    },
    signers: [baseAccount],
  });
  console.log("The transaction is: ", tx)

  let account = await program.account.baseAccount.fetch(baseAccount.publicKey);
  console.log("GIF Count: ", account.totalGifs.toString())

  await program.rpc.addGif("submitedgiflink1.com", {
    accounts: {
      baseAccount: baseAccount.publicKey,
      user: provider.wallet.publicKey
    },
  });
  console.log("✅ Gif %d added", (account.totalGifs+1))

  account = await program.account.baseAccount.fetch(baseAccount.publicKey)
  console.log("🖼 Total Gifs: ", account.totalGifs.toString())

  console.log("📝 Gif List: ", account.gifList);
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
