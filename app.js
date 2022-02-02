//data storage schema
window.data = {
    index:[],
    addresses:[],
    status:[],
    icons:[],
    winner:"",
    balance:[]
};
//initialize web3js and metamask
async function loadWeb3() {
    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        window.ethereum.enable();
    }
}
loadWeb3();
//get the smartcontract
let contract = new web3.eth.Contract(ABI,CONTRACT_ADDRESS);

//create an array to hold players
let players = [];

//elements
//buttons
const loginButton = document.querySelector('.loginButton');
const logoutButton = document.querySelector('.logoutButton');
const playButton = document.querySelector(".playButton");
const transferButton = document.querySelector(".transferButton");
const updateButton = document.querySelector(".updateButton");
const restartButton = document.querySelector(".restartButton");
const sendButton = document.querySelector(".sendButton");
//spans
const showAccount = document.querySelector('.showAccount');
const accBalance  = document.querySelector('.accBalance');

//const player1Span = document.querySelector(".player1Span");
//const player2Span = document.querySelector(".player2Span");
//const player3Span = document.querySelector(".player3Span");

//winner image
const winnerIcon = document.querySelector(".winner");
//dice image
const dicePicture = document.querySelector(".dicePicture");
const dicePictureArray = ["dice1.jpg","dice2.jpg","dice3.jpg","dice4.jpg","dice5.jpg","dice6.jpg"];
//init
//hide buttons
logoutButton.style.display = "none" ;
transferButton.style.display = "none" ;
playButton.style.display = "none";
updateButton.style.display = "none";
restartButton.style.display = "none";
sendButton.style.display = "none";
//--------LOGIN CLIENT SIDE and SERVER SIDE-------


//create an async function to get account and account balance
async function login() {
    console.log("hello login");
    //get all the accounts and display account
    window.accounts = await ethereum.request({ method: 'eth_requestAccounts' });//await window.web3.eth.getAccounts()
    

    //login the server
    var x = await contract.methods.login().send({from:accounts[0]});
    console.log(x);

    //update ballance of the account
    await web3.eth.getBalance(accounts[0],(e,b)=>{
          b=web3.utils.fromWei(b,"ether");
          accBalance.innerHTML = b;
          showAccount.innerHTML = accounts[0];
      });
    
    //hide the login button and show the logout button
    
    
 
    //update
    await updatePlayer();
    loginButton.style.display = "none"; 
    logoutButton.style.display = "block"; 
    playButton.style.display = "none"; 
    
    updateButton.style.display = "block";
    restartButton.style.display = "none"; 
    sendButton.style.display = "block"; 
    let status = await contract.methods.status_map(accounts[0]).call();
    if (["1","2","3","4","5","6"].indexOf(status) != -1){
        transferButton.style.display = "none"; 
    }
    else{
        transferButton.style.display = "block"; 
    }
        
}  

//logout function
async function logout(){
    await contract.methods.logout().send({from:accounts[0]});
   
    
    //update
    await updatePlayer();
    loginButton.style.display = "block"; 
    logoutButton.style.display = "none"; 
    playButton.style.display = "none"; 
    transferButton.style.display = "none"; 
    updateButton.style.display = "block";
    restartButton.style.display = "none"; 
    sendButton.style.display = "none"; 
    accBalance.innerHTML = "";
    showAccount.innerHTML = "";

    
}

//transfer money function
async function transfer_money(){
    let amount = 100000000000000000;//in Wei  total 1 ether 
    await contract.methods.pay_escrow().send({from:accounts[0],value:amount});
    //update balance
    await web3.eth.getBalance(accounts[0],(e,b)=>{
        b=web3.utils.fromWei(b,"ether");
        accBalance.innerHTML = b;
    });

    

    //update
    await updatePlayer();
    loginButton.style.display = "none"; 
    logoutButton.style.display = "block"; 
    playButton.style.display = "block"; 
    transferButton.style.display = "none"; 
    updateButton.style.display = "block";
    restartButton.style.display = "none"; 
    sendButton.style.display = "block"; 
}

//function to play dice
async function play_dice(){
    

     //roll the dice
     let dice = Math.floor(Math.random()*5) + 1 ;
    

     //send dice to smart contract
    await contract.methods.play_dice(dice).send({from:accounts[0]});

    //display dice pictures
    dicePicture.src = dicePictureArray[dice-1];

    //player1Span.innerHTML = dice;
    //get the status of the player
   
    //show hide play and transfer button based on the status
    await updatePlayer();
    loginButton.style.display = "none"; 
    logoutButton.style.display = "block"; 
    transferButton.style.display = "none"; 
    updateButton.style.display = "block";
    sendButton.style.display = "block"; 
    //if all status are 8 
    let all_status_8 = false;
    let num = 0 ;
    for (let i=0;i<data.addresses.length;i++){
        num = num +data.status[i];
    }
    if (num == 8*data.addresses.length){
        all_status_8 = true;
    }
    if(data.addresses.length > 1 && all_status_8){
        playButton.style.display = "block"; 
        restartButton.style.display = "none"; 
    }
    else{
        //else show the restart button 
        playButton.style.display = "none"; 
        restartButton.style.display = "block";
    }
     
}

//get player data from the smartcontract and display
async function updatePlayer(){
    
    //reset data holder
    window.data = {
        index:[],
        addresses:[],
        status:[],
        icons:[],
        winner:"",
        balance:[]
    };
    //get data
    let icons = ["1.jpg","2.jpg","3.jpg","4.jpg","5.jpg","6.jpg","7.jpg","8.jpg","9.jpg","10.jpg"];
    let player_length = await contract.methods.player_length().call();
    for (let i=0;i<player_length;i++){
        data.addresses.push(await contract.methods.players(i).call());
        data.index.push(i);
        data.icons.push(icons[i]);
        await web3.eth.getBalance(data.addresses[i],(e,b)=>{
            b=web3.utils.fromWei(b,"ether");
            data.balance.push(b);
        });
    }
    //let status = []
    for (let i=0;i<player_length;i++){
        data.status.push(await contract.methods.status_map(data.addresses[i]).call());
    }
    data.winner = await contract.methods.winner().call();
    
    

    let winner_index = find_index(data.addresses,data.winner);
    let winner_icon;
    if (winner_index == -1){
        winner_icon = "win.gif";
    }
    else{
        winner_icon = data.icons[winner_index];
    }
    
    winnerIcon.src = winner_icon;
    //display data on a tabular manner
    const tableBody = document.querySelector(".tableBody");
    tableBody.innerHTML = create_table_string();//
    //player1Span.innerHTML = status[0];
    //player2Span.innerHTML = status[1];
    //player3Span.innerHTML = status[2];
    
    //set the winner avtar
    //let images = ["rahul.jpg","anshuman.jpg","pandey.jpg"];

    //button show and hide logic
    let status = await contract.methods.status_map(accounts[0]).call();
    //console.log(typeof(status));
    //money transfered but no winner
    if (["1","2","3","4","5","6"].indexOf(status) != -1){
        //show the play button and hide the transfer button
        //playButton.style.display = "none";
        //transferButton.style.display = "none";
        //display correct dice image
        dicePicture.src = dicePictureArray[status-1];
    }
    else if(status == "8" || status == "0"){
        //hide play button and show transfer button
        //playButton.style.display = "block" ;
        //transferButton.style.display = "none";
        dicePicture.src = "dice.gif";
    }
    else{
        playButton.style.display = "none" ;
        transferButton.style.display = "block";
        dicePicture.src = "dice.gif";
    }
    let restart_condition = true;
    //check for restart condition
    for (let i=0;i<data.addresses.length;i++){
        if(["1","2","3","4","5","6"].indexOf(data.status[i])==-1) {
            //console.log(data.status[[i]]);
            restart_condition = false;
        }
        
    }
    //if only one player
    if (data.addresses.length < 2){
        restart_condition = false;
    }
    //console.log(restart_condition);
    if (restart_condition){
        console.log("restart");
        //display restart button
        restartButton.style.display = "block";
    }
    //update balance 
    //accBalance.innerHTML = data.balance[find_index(data.addresses,accounts[0])];
    console.log("hello balance from update");

    await web3.eth.getBalance(accounts[0],(e,b)=>{
        accBalance.innerHTML = web3.utils.fromWei(b,"ether");
        console.log("balance");
        console.log(b);
    });
    console.log(data.addresses);
    console.log(data.status);
    console.log(data.winner);
    console.log(data.balance);
    console.log("hello");
}
//restart function
async function restart(){
    //reset dice image
    dicePicture.src = "dice.gif";
    //hide restart button
    
    updatePlayer();
    let restart_condition = true;
    //check for restart condition
    for (let i=0;i<data.addresses.length;i++){
        if(["1","2","3","4","5","6"].indexOf(data.status[i])==-1) {
            console.log(data.status[[i]]);
            restart_condition = false;
        }
    }
    console.log(restart_condition);
    if (restart_condition){
        await contract.methods.reset_players().send({from:accounts[0]});
    }
    setTimeout(()=>{updatePlayer();},2000);
    
    //get the status of all players

   
    //if status of all players between 1 to 6 then reset all to 7

    //hide all buttons except logout and transfer

    //update table
    loginButton.style.display = "none"; 
    logoutButton.style.display = "block"; 
    transferButton.style.display = "block"; 
    updateButton.style.display = "block";
    sendButton.style.display = "block"; 

    playButton.style.display = "none"; 
    restartButton.style.display = "none"; 
    //restartButton.style.display = "none";
}
//function to create table data
function create_table_string(){
    let str = "";
    for (let i=0;i<data.index.length;i++){
        //complete first row
        let first = (data.index[i]+1).toString();
        let second = data.icons[i].toString();
        let third = data.addresses[i].toString();
        let fourth = data.status[i].toString();
        let fifth = data.balance[i].toString();
        let row_str = "<tr><th scope='row'>"+first+"</th>"+"<td>"+'<img width = "50px" src ="'+second+'" class="winner"></img>'+"</td>"+"<td>"+third+"</td>"+"<td>"+fourth+"</td>"+"<td>"+fifth+"</td>"+"</tr>";
        str = str+row_str;
    }
    //let str = "<tr><th scope='row'>"+first+"</th>"+"<td>"+second+"/td"+"<td>"+third+"/td"+"<td>"+fourth+"/td"+"</tr>";
    //'<tr><th scope="row">1</th><td>Mark</td><td>Otto</td><td>@mdo</td></tr>';
    return str;
}
//helper function to find index from an array
function find_index(_array,_data){
    for (let i = 0;i<_array.length;i++){
        if (_array[i] == _data){
            return i;
        }
    }
    return -1;
}
