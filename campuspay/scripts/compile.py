import os
import sys

# Add contracts directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '../contracts'))

from fundraising import router as fundraising_router
from ticketing import router as ticketing_router
from logic_sig import bill_split_logic
from pyteal import compileTeal, Mode

def compile_contract(router, name):
    approval, clear, contract = router.compile_program(version=8)
    
    out_dir = os.path.join(os.path.dirname(__file__), '../artifacts')
    os.makedirs(out_dir, exist_ok=True)
    
    with open(os.path.join(out_dir, f"{name}.teal"), "w") as f:
        f.write(approval)
    with open(os.path.join(out_dir, f"{name}_clear.teal"), "w") as f:
        f.write(clear)
    with open(os.path.join(out_dir, f"{name}.json"), "w") as f:
        import json
        f.write(json.dumps(contract.dictify(), indent=4))
    print(f"Compiled {name}")

def compile_lsig(logic, name):
    teal = compileTeal(logic, mode=Mode.Signature, version=8)
    out_dir = os.path.join(os.path.dirname(__file__), '../artifacts')
    os.makedirs(out_dir, exist_ok=True)
    with open(os.path.join(out_dir, f"{name}.teal"), "w") as f:
        f.write(teal)
    print(f"Compiled {name}")

if __name__ == "__main__":
    compile_contract(fundraising_router, "fundraising")
    compile_contract(ticketing_router, "ticketing")
    compile_lsig(bill_split_logic(), "bill_split")
