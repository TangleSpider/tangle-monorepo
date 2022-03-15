// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

/** @title ERC20 Interface
    @dev Allows access to some ERC20 functions **/
interface ERC20 {
    function balanceOf(address) external view returns (uint);
    function transferFrom(address, address, uint) external;
    function transfer(address, uint) external;
}

/** @title Fractal - A light, simulated blockchain enabling Fractal swaps
    @author Brad Brown **/
contract Fractal {

    /** @notice Starts a swap
        @param target The target of the swap
        @param payments The payments of the swap
        @param expiration The time at which payments can be returned to the
        swap initiator
        @dev Stores the swap in swaps[id]. If a native coin payment is
        included, add it as a payment with a zero-address. **/
    function openSwap(
        bytes memory target,
        Asset[] memory payments,
        uint32 expiration
    ) external payable {
        swaps.push();
        Swap storage swap = swaps[swaps.length - 1];
        swap.target = target;
        swap.metadata = Metadata(true, expiration, msg.sender, swapId);
        for (uint i = 0; i < payments.length; i++) {
            swap.escrow.push();
            swap.escrow[i] = Asset(payments[i].id, payments[i].amount/*_pay(payments[i])*/);
        }
        if (msg.value > 0) {
            swap.escrow.push();
            swap.escrow[swap.escrow.length - 1] = Asset(address(0), msg.value);
        }
        emit OpenSwap(swap);
        swapId++;
    }
    event OpenSwap(Swap swap);

    /** @notice Stops a swap and returns the swap's held payments to the swap's
        submitter
        @param id The id of the swap
        @dev A swap can only be closed by its submitter if it is open and
        expired **/
    function closeSwap(uint id) external {
        Swap storage swap = swaps[id];
        require(swap.metadata.submitter == msg.sender, "not submitter");
        require(swap.metadata.open == true, "swap already closed");
        require(block.timestamp >= swap.metadata.expiration,
            "swap not yet expired"
        );
        for (uint i = 0; i < swap.escrow.length; i++) {
            Asset memory asset = swap.escrow[i];
            if (asset.id == address(0)) {
                payable(swap.metadata.submitter).transfer(
                    asset.amount
                );
            } else {
                ERC20(asset.id).transfer(
                    swap.metadata.submitter,
                    asset.amount
                );
            }
        }
        swap.metadata.open = false;
        emit CloseSwap(swap.metadata.id);
    }
    event CloseSwap(uint swapId);

    /** @notice Pays a swap's payment to Fractal
        @param payment The payment to be paid
        @return Returns the real amount of the asset transferred during
        payment **/
    function _pay(Asset memory payment) internal returns (uint) {
        address id = payment.id;
        uint amount = payment.amount;
        uint priorBalance = ERC20(id).balanceOf(address(this));
        ERC20(id).transferFrom(msg.sender, address(this), amount);
        return ERC20(id).balanceOf(address(this)) - priorBalance;
    }
    uint swapId = 0;
    Swap[] swaps;
    struct Swap {
        bytes target;
        Metadata metadata;
        Asset[] escrow;
    }
    struct Metadata {
        bool open;
        uint32 expiration;
        address submitter;
        uint id;
    }
    struct Asset {
        address id;
        uint amount;
    }
}
