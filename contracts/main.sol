// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/*
Hedefler:
Yazı tura atıldığında bir tarafa para gidecek
Bu para iki tarafın da mappinglerinde tutulacak 
para cekilebilir olacak -> bunun icin buton koy + zaten iceride kitlenmesi sacma olur
randomness chainlink uzerinden olmalı 
bu kadar

*/
contract Main {
   

    mapping(address => uint256) balances;


    function withdraw() public {
        require(balances[msg.sender] > 0 , "you dont have any money" );
        balances[msg.sender] = 0;
        payable(msg.sender).transfer(balances[msg.sender]);
        
    }

    

}
