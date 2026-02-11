from pyteal import *

# Constants
MIN_DONATION = Int(100000) # 0.1 ALGO
DURATION = Int(604800) # 1 week in seconds

# Global State Keys
GOAL = Bytes("Goal")
DEADLINE = Bytes("Deadline")
CREATOR = Bytes("Creator")
TOTAL_RAISED = Bytes("TotalRaised")
CAMPAIGN_NAME = Bytes("CampaignName")

# Router definition
router = Router(
    "FundraisingContract",
    BareCallActions(
        no_op=OnCompleteAction.create_only(Approve()),
        opt_in=OnCompleteAction.call_only(Approve()),
        close_out=OnCompleteAction.call_only(Approve()),
        update_application=OnCompleteAction.always(Reject()),
        delete_application=OnCompleteAction.always(Reject()),
    ),
)

@router.method
def create_campaign(name: abi.String, goal: abi.Uint64):
    return Seq(
        App.globalPut(CAMPAIGN_NAME, name.get()),
        App.globalPut(GOAL, goal.get()),
        App.globalPut(DEADLINE, Global.latest_timestamp() + DURATION),
        App.globalPut(CREATOR, Txn.sender()),
        App.globalPut(TOTAL_RAISED, Int(0)),
    )

@router.method
def contribute(payment: abi.PaymentTransaction):
    return Seq(
        Assert(payment.get().receiver() == Global.current_application_address()),
        Assert(payment.get().amount() >= MIN_DONATION),
        Assert(Global.latest_timestamp() < App.globalGet(DEADLINE)),
        
        # Update global state
        App.globalPut(TOTAL_RAISED, App.globalGet(TOTAL_RAISED) + payment.get().amount()),
        
        # Log contribution (could be local state too)
        Log(Concat(Bytes("Contributed: "), Itob(payment.get().amount())))
    )

@router.method
def withdraw():
    # Only creator can withdraw if goal reached
    return Seq(
        Assert(Txn.sender() == App.globalGet(CREATOR)),
        Assert(App.globalGet(TOTAL_RAISED) >= App.globalGet(GOAL)),
        
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.Payment,
            TxnField.receiver: Txn.sender(),
            TxnField.amount: App.globalGet(TOTAL_RAISED) - Global.min_txn_fee(),
        }),
        InnerTxnBuilder.Submit(),
    )

# Compile
if __name__ == "__main__":
    approval, clear, contract = router.compile_program(version=8)
    with open("fundraising.teal", "w") as f:
        f.write(approval)
    with open("fundraising_clear.teal", "w") as f:
        f.write(clear)
    with open("fundraising.json", "w") as f:
        import json
        f.write(json.dumps(contract.dictify(), indent=4))
