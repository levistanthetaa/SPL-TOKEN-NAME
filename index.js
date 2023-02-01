import * as mpltoken from "@metaplex-foundation/mpl-token-metadata";
import { web3 } from "@project-serum/anchor";
import * as Web3 from "@solana/web3.js";
import * as fs from "fs";

export function loadWalletKey() {
    const loaded = Web3.Keypair.fromSecretKey(
        new Uint8Array(JSON.parse(fs.readFileSync("./id.json").toString()))
    );
    return loaded;
}

const main = async () => {
    const authority = loadWalletKey();

    const connection = new Web3.Connection(
        "https://api.mainnet-beta.solana.com"
    );
    
    // SQRE TOKEN ADDRESS
    const mint = new Web3.PublicKey(
        "8HhjVMoLNLHtU7ZULbZb5dzNJ5Qu9EFSHqCZRDDVGvwh"
    );

    const [mintPda] = await web3.PublicKey.findProgramAddress(
        [
            Buffer.from("metadata"),
            mpltoken.PROGRAM_ID.toBuffer(),
            mint.toBuffer(),
        ],
        mpltoken.PROGRAM_ID
    );

    const mintMetadataInstruction =
        await mpltoken.createCreateMetadataAccountV3Instruction(
            {
                metadata: mintPda,
                mint: mint,
                mintAuthority: authority.publicKey,
                payer: authority.publicKey,
                updateAuthority: authority.publicKey,
            },
            {
                createMetadataAccountArgsV3: {
                    collectionDetails: null,
                    data: {
                        name: "Sovereign Token",
                        symbol: "SQRE",
                        uri: "https://bafkreigxbenxcumjgazedr5djlloomb23pvwklszdo6bn73ltuh2gonz5e.ipfs.nftstorage.link/",
                        sellerFeeBasisPoints: 0,
                        creators: null,
                        collection: null,
                        uses: null,
                    },
                    isMutable: true,
                },
            }
        );

    var tx = await web3.sendAndConfirmTransaction(
        connection,
        new web3.Transaction().add(mintMetadataInstruction),
        [authority]
    );

    console.log(tx);
};

main().catch((err) => {
    console.error(err);
});