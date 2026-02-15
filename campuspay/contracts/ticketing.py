from pyteal import *

# Global State
PRICE = Bytes("Price")
CREATOR = Bytes("Creator")
NFT_ID = Bytes("NftId")

router = Router(
    "TicketingContract",
    BareCallActions(
        no_op=OnCompleteAction.create_only(Approve()),
        opt_in=OnCompleteAction.call_only(Approve()),
        close_out=OnCompleteAction.call_only(Approve()),
        update_application=OnCompleteAction.always(Reject()),
        delete_application=OnCompleteAction.always(Reject()),
    ),
)

@router.method
def setup(price: abi.Uint64, nft_id: abi.Uint64):
    return Seq(
        App.globalPut(PRICE, price.get()),
        App.globalPut(NFT_ID, nft_id.get()),
        App.globalPut(CREATOR, Txn.sender()),
        # Opt-in to NFT so contract can hold it
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.AssetTransfer,
            TxnField.xfer_asset: nft_id.get(),
            TxnField.asset_receiver: Global.current_application_address(),
            TxnField.asset_amount: Int(0),
        }),
        InnerTxnBuilder.Submit(),
    )

@router.method
def buy_ticket(payment: abi.PaymentTransaction):
    return Seq(
        Assert(payment.get().amount() == App.globalGet(PRICE)),
        Assert(payment.get().receiver() == Global.current_application_address()),
        
        # Send NFT to buyer
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.AssetTransfer,
            TxnField.xfer_asset: App.globalGet(NFT_ID),
            TxnField.asset_receiver: Txn.sender(),
            TxnField.asset_amount: Int(1),
        }),
        InnerTxnBuilder.Submit(),
    )

if __name__ == "__main__":
    approval, clear, contract = router.compile_program(version=8)
    with open("ticketing.teal", "w") as f:
        f.write(approval)
    with open("ticketing_clear.teal", "w") as f:
        f.write(clear)
    with open("ticketing.json", "w") as f:
        import json
        f.write(json.dumps(contract.dictify(), indent=4))
