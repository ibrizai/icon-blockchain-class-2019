pragma solidity >=0.4.0 <0.6.0;

contract helloWorld {
   string storedData = 'helloWorld';
   
   function renderHelloWorld () public view returns (string memory) {
     return storedData; 
    }

    function set( string memory x) public {
        storedData = x;
    } 
}

