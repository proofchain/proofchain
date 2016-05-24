//
// proofcha.in
// Mini-Blockchain simulator
// @author Leonardo Demartino
// @since May 2016
//
/*
 * Copyright 2016 delek.net (Leonardo Demartino)
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
document.addEventListener("contextmenu", function(e){e.preventDefault();}, false);

var music = new Audio('../resources/sounds/sleepy_tracking.mp3');

var sound_mining = new Audio('../resources/sounds/mining.mp3');
var sound_mined_fork = new Audio('../resources/sounds/mined_fork.mp3');
var sound_mined_main = new Audio('../resources/sounds/mined_main.mp3');
var sound_no_electricity = new Audio('../resources/sounds/no_electricity.mp3');
var sound_salary = new Audio('../resources/sounds/salary.mp3');
var sound_buy = new Audio('../resources/sounds/buy.mp3');
var sound_no_money = new Audio('../resources/sounds/no_money.mp3');

var canvas, ctx;

var block_size=20;
var forks_count=0;

var blocks = []; 

var minedBlocks = [];
var startFork = [];
var mainChain=0;
var timePerBlock=1000;
var salary=1000;
var salaryTime=60000;
var money=0;
var electricity=1000;
var time = 0;
var difficulty=2;
var blinkCounter=0, blinkColor=0;
var scroll=1, longestChain=0, screenFractionScrolling=4;

function block(fork) {
    this.x = canvas.width/2+(block_size+5)*fork-block_size/2;
    this.y = canvas.height-(block_size+5)*minedBlocks[fork]-block_size;

    this.xvel = 0;
    this.yvel = 0;
	
	this.height=minedBlocks[fork];
	this.fork=fork;

    this.waitTime = Math.random() * 1000;

    this.color = fork;
	this.mining=false;
	
	if(forks_count<fork)forks_count=fork;
}

block.prototype.update = function () {
    this.x += this.xvel;
    this.y += this.yvel;

    this.yvel += 0;
}

function mine(forkP){
	var fork=forkP;
    if(fork==-1){
        //search the longest chain
        var bestMinedblocks=0;
        for(var i=0; i<=forks_count; i++){
            if(minedBlocks[i]>bestMinedblocks){
                fork=i;
                bestMinedblocks=minedBlocks[i];
            }
        }
        longestChain=bestMinedblocks;
		
		//count how much there are
        var counts=0;
        for(var i=0; i<=forks_count; i++){
            if(minedBlocks[i]==longestChain){
                counts++;
            }
        }
        
		//random about those ones
		var use_this_as_best=Math.floor(Math.random()*counts);
		for(var i=0; i<=forks_count; i++){
            if(minedBlocks[i]==longestChain){
                counts++;
				if(counts==use_this_as_best){
					fork=i;
					break;
				}
            }
        }
		
		mainChain=fork;
    }
	blocks[fork][minedBlocks[fork]] = new block(fork);
	blocks[fork][minedBlocks[fork]].mining=true;
	minedBlocks[fork]++;
}

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

	blinkCounter++;
	if(blinkCounter>50/difficulty){
		blinkColor++;
		blinkCounter=0;
	}
			
	for(var f=0; f<=forks_count; f++){
		for (var i = startFork[f]; i < minedBlocks[f]; i++) {
			blocks[f][i].update();
			
			if(blocks[f][i].mining){
				if(i==longestChain)blocks[f][i].color=blinkCounter;
				else blocks[f][i].color=blinkColor;
			}
			else blocks[f][i].color=f;
			
			if(blocks[f][i].mining && i<minedBlocks[f]-1)blocks[f][i].mining=false;
			
			if (blocks[f][i].color%6==0)ctx.fillStyle = '#00F';
			if (blocks[f][i].color%6==1)ctx.fillStyle = '#0FF';
			if (blocks[f][i].color%6==2)ctx.fillStyle = '#FFF';
			if (blocks[f][i].color%6==3)ctx.fillStyle = '#FF0';
			if (blocks[f][i].color%6==4)ctx.fillStyle = '#F00';
			if (blocks[f][i].color%6==5)ctx.fillStyle = '#F0F';
			
            if(scroll==1){
                if(longestChain*(block_size+5)>=scroll*canvas.height){
					scroll++;
					$().toastmessage('showToast', {
								text     : 'Camera move!',
								stayTime : 1000,
								sticky   : false,
								position : 'top-right',
								type     : 'notice'
							});
				}
            }
            else{
                if(longestChain*(block_size+5)>=(scroll+1)*canvas.height/2){
					scroll++;
					$().toastmessage('showToast', {
								text     : 'Camera move!',
								stayTime : 1000,
								sticky   : false,
								position : 'top-right',
								type     : 'notice'
							});
				}
            }
            ctx.fillRect(blocks[f][i].x, blocks[f][i].y+(scroll-1)*(canvas.height/2), block_size, block_size);

		}

		time = time + 1;

		document.getElementById("orphaned_chains").value = "ORPHANED CHAINS:" + " " + forks_count;
		document.getElementById("main_chain").value = "MAIN CHAIN:" + " " + longestChain;
        document.getElementById("money").value = "MONEY:" + " " + money;
        document.getElementById("electricity").value = "ELECTRICITY:" + " " + electricity;
	}
	setTimeout(loop, 1);
}

function mouseMove (e) {
    var x = e.offsetX;
    var y = e.offsetY;
	var f=0;
	
    for (var i in blocks[f]){//check if coordinates are in square
        var obj=blocks[f][i];
        if (x>obj.x-block_size && x<obj.x+block_size) {
            if (y>obj.y-block_size && y<obj.y+block_size){
                //obj.destroy();//destroy square if it is
            }
        }
    }
}

function ask(fork) {
    var a = Math.floor(Math.random() * 10) + 1;
    var b = Math.floor(Math.random() * 10) + 1;
    var op = ["*", "+", "/", "-"][Math.floor(Math.random()*4)];
    $('<p>You\'re mining a block in fork '+fork+'<br>How much is ' + a + ' ' + op + ' ' + b + '?</p>').prompt(function(e){if(e.response==eval( a + op + b))mine(fork);})
}

function startMining(fork){
	mine(fork);
	blocks[fork][minedBlocks[fork]-1].mining=true;
}

function mouseDown(e){
	var x = e.offsetX;
    var y = e.offsetY;
    y-=(scroll-1)*(canvas.height/2);
	if(x>=canvas.width/2-block_size/2){
		var fork=parseInt((x-canvas.width/2+block_size/2)/(block_size+5));
		var height=parseInt(canvas.height/(block_size+5)-y/(block_size+5));
		
		//document.getElementById("time").value = "fc:"+forks_count+" f:" + fork + " h:" + height + " sf:"+startFork[fork]+" mb:"+minedBlocks[fork];
		
		if(fork<=forks_count && startFork[fork]<=height && minedBlocks[fork]>height){
            if(e.which==3){
                startChain(fork+1, height, false);
				$().toastmessage('showToast', {
						text     : 'You have forked the Mainchain at block height '+(height+1)+'!',
						sticky   : false,
						position : 'top-right',
						type     : 'warning'
					});
            }else{
				if(height==minedBlocks[fork]-1){
					if(blocks[fork][minedBlocks[fork]-1].mining){
                        electricity-=100;
                        if(electricity<0){
                            electricity=0;
							if(money==0){
								showGameOver();
							}
							else{
								$().toastmessage('showToast', {
												 text     : 'Not enough electricity to mine, please buy some more!',
												 stayTime : 5000,
												 sticky   : false,
												 position : 'top-right',
												 type     : 'error'
												 });
							}
							sound_no_electricity.play();
                            return;
                        }
						sound_mining.play();

						if(fork==mainChain){
							if(parseInt(Math.random()*100)==1){
								blocks[fork][minedBlocks[fork]-1].mining=false;
								$().toastmessage('showToast', {
												 text     : 'You have successfully mined a block in the Mainchain you earned lot of money!',
												 sticky   : false,
												 position : 'top-right',
												 type     : 'success'
												 });
								money+=salary*2;
								sound_mined_main.play();
							}
						}
						else{
							if(parseInt(Math.random()*12)==1){
								blocks[fork][minedBlocks[fork]-1].mining=false;
								$().toastmessage('showToast', {
									text     : 'You have successfully mined a block in the forked chain '+fork+' no money for you!',
									sticky   : false,
									position : 'top-right',
									type     : 'success'
								});
								
								sound_mined_fork.play();
							}
						} 
					}
					else{
						startMining(fork);
						$().toastmessage('showToast', {
								text     : 'You started a new block, click on it repeatedly until you mine it!',
								stayTime : 3000,
								sticky   : false,
								position : 'top-right',
								type     : 'notice'
							});
					}
				}
            }
		}
	}
}

function startChain(fork, startHeight, automatic){
	blocks[fork] = [];
	startFork[fork]=startHeight;
	minedBlocks[fork]=startFork[fork];
	mine(fork);
	if(automatic)setInterval(mine, timePerBlock, -1);
}

function go() {
    canvas = document.getElementById("cv");
    ctx = canvas.getContext("2d");

    canvas.addEventListener('mousemove',mouseMove);
	canvas.addEventListener('mousedown',mouseDown);
	
	startChain(0,0,true);
    getSalary();
    
    ctx.lineWidth = "4";
    ctx.strokeStyle = "rgb(255,255,255)";
	music.loop = true;
	music.play();
    loop();
}

function buyElectricity(){
    if(money>49){
        money-=50;
        electricity+=100;
		sound_buy.play();
    }
    else{
        $().toastmessage('showToast', {
                         text     : 'You don\' have money to buy electricity!, mine in the mainchain to get some more or wait until you get your salary!',
                         stayTime : 5000,
                         sticky   : false,
                         position : 'top-right',
                         type     : 'error'
                         });
		sound_no_money.play();
    }
}

function getSalary(){
    money+=salary;
    
    $().toastmessage('showToast', {
                     text     : 'Your salary just arrived to your account, you have ' + money +' in your balance to buy more electricity to mine!',
                     stayTime : 5000,
                     sticky   : false,
                     position : 'top-right',
                     type     : 'success'
                     });
}

function showHelp(){
	$("<p><b>How to play</b><br>\
	<br>\
The goal of the game is make a fork that exceeds the fast Mainchain!<br>\
You have some money in your account to buy electricity to mine (the icon with the credit cards!)<br>\
Mining on the longest chain will give you lot of money but it is very difficult to mine there! :(<br>\
Use well your money and know exactly when it is convinient to mine in the Mainchain to achieve the objective.<br>\
A flashing block means it is being discovered! Try to left click it exactly when a particular color appears to mine it!<br>\
The longest chain is mined at ultrafast speed because it is being mined by the majority.<br>\
You can fork a chain by right clicking on a block.<br>\
<br>\
Don't waste your money or you will lose! Good luck!</p>").alert();
}

function showGameOver(){
	$("<p><b>Game Over</b><br>\
	<br>\
You're out of money and electricity! The Blockchain is secure!</p>").alert();
	sound_salary.play();
}