export const FUNDRAISING_ABI = {
    "name": "FundraisingContract",
    "methods": [
        {
            "name": "create_campaign",
            "args": [
                {
                    "type": "string",
                    "name": "name"
                },
                {
                    "type": "uint64",
                    "name": "goal"
                }
            ],
            "returns": {
                "type": "void"
            }
        },
        {
            "name": "contribute",
            "args": [
                {
                    "type": "pay",
                    "name": "payment"
                }
            ],
            "returns": {
                "type": "void"
            }
        },
        {
            "name": "withdraw",
            "args": [],
            "returns": {
                "type": "void"
            }
        }
    ],
    "networks": {}
};

// TEAL Source for Approval Program
export const FUNDRAISING_APPROVAL = `#pragma version 8
txn NumAppArgs
int 0
==
bnz main_l8
txna ApplicationArgs 0
method "create_campaign(string,uint64)void"
==
bnz main_l7
txna ApplicationArgs 0
method "contribute(pay)void"
==
bnz main_l6
txna ApplicationArgs 0
method "withdraw()void"
==
bnz main_l5
err
main_l5:
txn OnCompletion
int NoOp
==
txn ApplicationID
int 0
!=
&&
assert
callsub withdrawcaster_5
int 1
return
main_l6:
txn OnCompletion
int NoOp
==
txn ApplicationID
int 0
!=
&&
assert
callsub contributecaster_4
int 1
return
main_l7:
txn OnCompletion
int NoOp
==
txn ApplicationID
int 0
!=
&&
assert
callsub createcampaigncaster_3
int 1
return
main_l8:
txn OnCompletion
int NoOp
==
bnz main_l18
txn OnCompletion
int OptIn
==
bnz main_l17
txn OnCompletion
int CloseOut
==
bnz main_l16
txn OnCompletion
int UpdateApplication
==
bnz main_l15
txn OnCompletion
int DeleteApplication
==
bnz main_l14
err
main_l14:
int 0
return
main_l15:
int 0
return
main_l16:
txn ApplicationID
int 0
!=
assert
int 1
return
main_l17:
txn ApplicationID
int 0
!=
assert
int 1
return
main_l18:
txn ApplicationID
int 0
==
assert
int 1
return

// create_campaign
createcampaign_0:
proto 2 0
byte "CampaignName"
frame_dig -2
extract 2 0
app_global_put
byte "Goal"
frame_dig -1
app_global_put
byte "Deadline"
global LatestTimestamp
int 604800
+
app_global_put
byte "Creator"
txn Sender
app_global_put
byte "TotalRaised"
int 0
app_global_put
retsub

// contribute
contribute_1:
proto 1 0
frame_dig -1
gtxns Receiver
global CurrentApplicationAddress
==
assert
frame_dig -1
gtxns Amount
int 100000
>=
assert
global LatestTimestamp
byte "Deadline"
app_global_get
<
assert
byte "TotalRaised"
byte "TotalRaised"
app_global_get
frame_dig -1
gtxns Amount
+
app_global_put
byte "Contributed: "
frame_dig -1
gtxns Amount
itob
concat
log
retsub

// withdraw
withdraw_2:
proto 0 0
txn Sender
byte "Creator"
app_global_get
==
assert
byte "TotalRaised"
app_global_get
byte "Goal"
app_global_get
>=
assert
itxn_begin
int pay
itxn_field TypeEnum
txn Sender
itxn_field Receiver
byte "TotalRaised"
app_global_get
global MinTxnFee
-
itxn_field Amount
itxn_submit
retsub

// create_campaign_caster
createcampaigncaster_3:
proto 0 0
byte ""
int 0
txna ApplicationArgs 1
frame_bury 0
txna ApplicationArgs 2
btoi
frame_bury 1
frame_dig 0
frame_dig 1
callsub createcampaign_0
retsub

// contribute_caster
contributecaster_4:
proto 0 0
int 0
txn GroupIndex
int 1
-
frame_bury 0
frame_dig 0
gtxns TypeEnum
int pay
==
assert
frame_dig 0
callsub contribute_1
retsub

// withdraw_caster
withdrawcaster_5:
proto 0 0
callsub withdraw_2
retsub`;

// TEAL Source for Clear State Program
export const FUNDRAISING_CLEAR = `#pragma version 8
int 0
return`;

export const TICKETING_ABI = {
    "name": "TicketingContract",
    "methods": [
        {
            "name": "setup",
            "args": [
                {
                    "type": "uint64",
                    "name": "price"
                },
                {
                    "type": "uint64",
                    "name": "nft_id"
                }
            ],
            "returns": {
                "type": "void"
            }
        },
        {
            "name": "buy_ticket",
            "args": [
                {
                    "type": "pay",
                    "name": "payment"
                }
            ],
            "returns": {
                "type": "void"
            }
        }
    ],
    "networks": {}
};

export const TICKETING_APPROVAL = `#pragma version 8
txn NumAppArgs
int 0
==
bnz main_l6
txna ApplicationArgs 0
method "setup(uint64,uint64)void"
==
bnz main_l5
txna ApplicationArgs 0
method "buy_ticket(pay)void"
==
bnz main_l4
err
main_l4:
txn OnCompletion
int NoOp
==
txn ApplicationID
int 0
!=
&&
assert
callsub buyticketcaster_3
int 1
return
main_l5:
txn OnCompletion
int NoOp
==
txn ApplicationID
int 0
!=
&&
assert
callsub setupcaster_2
int 1
return
main_l6:
txn OnCompletion
int NoOp
==
bnz main_l16
txn OnCompletion
int OptIn
==
bnz main_l15
txn OnCompletion
int CloseOut
==
bnz main_l14
txn OnCompletion
int UpdateApplication
==
bnz main_l13
txn OnCompletion
int DeleteApplication
==
bnz main_l12
err
main_l12:
int 0
return
main_l13:
int 0
return
main_l14:
txn ApplicationID
int 0
!=
assert
int 1
return
main_l15:
txn ApplicationID
int 0
!=
assert
int 1
return
main_l16:
txn ApplicationID
int 0
==
assert
int 1
return

// setup
setup_0:
proto 2 0
byte "Price"
frame_dig -2
app_global_put
byte "NftId"
frame_dig -1
app_global_put
byte "Creator"
txn Sender
app_global_put
itxn_begin
int axfer
itxn_field TypeEnum
frame_dig -1
itxn_field XferAsset
global CurrentApplicationAddress
itxn_field AssetReceiver
int 0
itxn_field AssetAmount
itxn_submit
retsub

// buy_ticket
buyticket_1:
proto 1 0
frame_dig -1
gtxns Amount
byte "Price"
app_global_get
==
assert
frame_dig -1
gtxns Receiver
global CurrentApplicationAddress
==
assert
itxn_begin
int axfer
itxn_field TypeEnum
byte "NftId"
app_global_get
itxn_field XferAsset
txn Sender
itxn_field AssetReceiver
int 1
itxn_field AssetAmount
itxn_submit
retsub

// setup_caster
setupcaster_2:
proto 0 0
int 0
dup
txna ApplicationArgs 1
btoi
frame_bury 0
txna ApplicationArgs 2
btoi
frame_bury 1
frame_dig 0
frame_dig 1
callsub setup_0
retsub

// buy_ticket_caster
buyticketcaster_3:
proto 0 0
int 0
txn GroupIndex
int 1
-
frame_bury 0
frame_dig 0
gtxns TypeEnum
int pay
==
assert
frame_dig 0
callsub buyticket_1
retsub`;

export const TICKETING_CLEAR = `#pragma version 8
int 0
return`;

