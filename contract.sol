// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

//create the contract
contract DiceGame{
    uint256    escrow_payment;
   
    //players array
    address[] public players;
    uint public player_length = players.length;
    //address payable receiver;
    //store the escrow address
   
    address public winner = address(0);
    

    //create a map to store player address and status
    mapping(address => uint) public status_map;
    //delete from players
    function deletePlayer(uint index) public{
        for(uint i = index; i < players.length-1; i++){
            players[i] =players[i+1];      
        }
        players.pop();
  }
    //payable function to store escrow money
    function pay_escrow()public payable{
        escrow_payment = escrow_payment + msg.value;
        status_map[msg.sender] = 8;
    }
    function get_player_index()private view returns(uint){
        for (uint i = 0;i< players.length;i++){
            if (players[i] == msg.sender){
                return i;
            }
        }
        return 1000;
    }

    function if_player_exists() private view  returns(bool){
        for (uint i = 0;i< players.length;i++){
            if (players[i] == msg.sender){
                return true;
            }
        }
        return false;
    }
    function login() public {
        if (if_player_exists() == false){
            players.push(msg.sender);
            player_length = players.length;
        }
        //check previous status if 0 then make it 7 or restore to original
        if (status_map[msg.sender] == 0)
        status_map[msg.sender] = 7;
    }

    function logout()public  {
         if (if_player_exists() == true){
            uint index = get_player_index();
            deletePlayer(index);
            player_length = players.length;
        }
        status_map[msg.sender] = 0;
    }
    
    function play_dice(uint val) public {
        //ensure payment has been made
        if (status_map[msg.sender] == 8){
             status_map[msg.sender] = val;
        }
        bool all_played = true;
        //check other players have played or not
        for (uint i = 0 ;i < players.length;i++){
            if (status_map[players[i]] < 1 ||  status_map[players[i]] > 6){
                all_played = false;
            }
        }
        if (all_played && players.length > 1){
            get_winner();
        }
    }
   
    //reset game so that it can be played again
    function reset_players()public {
       for(uint i=0;i<players.length;i++){
            status_map[players[i]]=7;
        } 
    }
    //get winner function
    function get_winner()public {
        uint counter = 0;
        //address winner;
        //address[]  memory winners;
        uint val = 0;
        //get the maximum value of dice
        for(uint i=0;i<players.length;i++){
            if (status_map[players[i]] > 0 && status_map[players[i]] <7){
                if (status_map[players[i]] > val){
                    val = status_map[players[i]];
                }
            }
        }
        //get the winners
        for(uint i=0;i<players.length;i++){
            if (status_map[players[i]] > 0 && status_map[players[i]] <7){
                if (status_map[players[i]] == val){
                    winner = players[i];
                    counter += 1;
                }
            }
        }
        

        //declare winner
        //more than one winner
        if (counter >1){
             //reset dice to paid state
            for(uint i=0;i<players.length;i++){
                status_map[players[i]]=8;
            } 
            winner =  address(0);
        }
        
        //settele accounts
        settle_accounts();
       
    }
    //settele accounts
    function settle_accounts()private {
        //case 1 single winner
        if (escrow_payment != 0 && winner != address(0) ){
            //transfer money to winners accounts
            //receiver = payable (winner);
            payable(winner).transfer(escrow_payment);
            escrow_payment = 0;
            //reset winner
            //winner = address(0);
            //reset status of all logged in players to 7
            //reset_players();
        }
        //case 2 winner == address(0)
        else{
            //take no action
        }  

        } 
        
    
}

