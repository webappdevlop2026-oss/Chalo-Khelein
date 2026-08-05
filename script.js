const screens = {
  home: document.getElementById("homeScreen"),
  game: document.getElementById("gameScreen"),
  score: document.getElementById("scoreScreen")
};

const gameNames = {
  tictactoe:"Tic-Tac-Toe", memory:"Memory Match", tap:"Tap Challenge",
  guess:"Number Guess", snake:"Snake Mini", penalty:"Penalty Kick",
  color:"Color Catch", math:"Quick Math", reaction:"Reaction Test", cricket:"Cricket Timing",
  racing:"Highway Racer", brick:"Brick Breaker", space:"Space Shooter", flappy:"Sky Bird", basket:"Basket Shot", runner:"Endless Runner"
};

let currentGame = null;
let activeCategory = "all";
let scores = JSON.parse(localStorage.getItem("chaloKheleinScores") || '{"ttt":0,"memory":0,"tap":0,"guess":0,"snake":0,"penalty":0,"color":0,"math":0,"reaction":0,"cricket":0}');
if(scores.reaction===undefined)scores.reaction=0;if(scores.cricket===undefined)scores.cricket=0;["racing","brick","space","flappy","basket","runner"].forEach(k=>{if(scores[k]===undefined)scores[k]=0;});

function saveScores(){
  localStorage.setItem("chaloKheleinScores",JSON.stringify(scores));
  updateScoreUI();
}
function totalScore(){
  return scores.ttt*100 + scores.memory*150 + scores.tap + scores.guess*120 + scores.snake*10 + scores.penalty*15 + scores.color*10 + scores.math*10 + scores.cricket*10 + scores.racing*5 + scores.brick*5 + scores.space*5 + scores.flappy*10 + scores.basket*10 + scores.runner*5;
}
function updateScoreUI(){
  document.getElementById("scoreBoardTotal").textContent=totalScore();
  ["ttt","memory","tap","guess","snake","penalty","color","math","cricket","racing","brick","space","flappy","basket","runner"].forEach(k=>{
    const id="score"+k.charAt(0).toUpperCase()+k.slice(1);
    const el=document.getElementById(id); if(el) el.textContent=scores[k]||0;
  });
  const r=document.getElementById("scoreReaction");
  if(r) r.textContent=scores.reaction? scores.reaction+" ms":"--";
}
function switchScreen(name){
  Object.values(screens).forEach(s=>s.classList.add("hidden"));
  screens[name].classList.remove("hidden");
  window.scrollTo({top:0,behavior:"smooth"});
}
function showHome(){ stopRunningGames(); currentGame=null; switchScreen("home"); }
function showScoreBoard(){ updateScoreUI(); switchScreen("score"); }
function clearScores(){
  if(!confirm("Clear all saved scores?")) return;
  scores={ttt:0,memory:0,tap:0,guess:0,snake:0,penalty:0,color:0,math:0,reaction:0,cricket:0,racing:0,brick:0,space:0,flappy:0,basket:0,runner:0};
  saveScores();
}
function openGame(name){
  stopRunningGames();
  currentGame=name;
  document.getElementById("gameTitle").textContent=gameNames[name];
  document.querySelectorAll(".game-panel").forEach(p=>p.classList.add("hidden"));
  document.getElementById(name+"Game").classList.remove("hidden");
  switchScreen("game");
  resetCurrentGame();
}
function resetCurrentGame(){
  if(currentGame==="tictactoe") resetTicTacToe();
  if(currentGame==="memory") resetMemory();
  if(currentGame==="tap") resetTap();
  if(currentGame==="guess") resetGuess();
  if(currentGame==="snake") resetSnake();
  if(currentGame==="penalty") resetPenalty();
  if(currentGame==="color") resetColor();
  if(currentGame==="math") resetMath();
  if(currentGame==="reaction") resetReaction();
  if(currentGame==="cricket") resetCricket();
  if(currentGame==="racing") resetRacing();
  if(currentGame==="brick") resetBrick();
  if(currentGame==="space") resetSpace();
  if(currentGame==="flappy") resetFlappy();
  if(currentGame==="basket") resetBasket();
  if(currentGame==="runner") resetRunner();
}
function stopRunningGames(){
  clearInterval(tapTimer); clearInterval(snakeTimer); clearInterval(mathTimer); clearTimeout(reactionTimer); cancelAnimationFrame(cricketAnim); cancelAnimationFrame(racingAnim); cancelAnimationFrame(brickAnim); cancelAnimationFrame(spaceAnim); cancelAnimationFrame(flappyAnim); cancelAnimationFrame(runnerAnim);
}
function filterGames(){
  const q=document.getElementById("gameSearch").value.toLowerCase().trim();
  let count=0;
  document.querySelectorAll(".game-card").forEach(card=>{
    const name=card.dataset.name.toLowerCase();
    const cats=card.dataset.category;
    const okText=name.includes(q);
    const okCat=activeCategory==="all"||cats.includes(activeCategory);
    card.style.display=okText&&okCat?"":"none";
    if(okText&&okCat) count++;
  });
  document.getElementById("resultCount").textContent=count+" Games";
}
function filterByCategory(cat){
  activeCategory=cat;
  document.querySelectorAll(".quick-tags button").forEach(b=>b.classList.remove("active"));
  const btn=[...document.querySelectorAll(".quick-tags button")].find(b=>b.textContent.toLowerCase()===cat || (cat==="all"&&b.textContent==="All"));
  if(btn) btn.classList.add("active");
  filterGames();
  document.getElementById("allGames").scrollIntoView({behavior:"smooth"});
}

/* Tic Tac Toe */
let ttt=Array(9).fill(""),tttLocked=false,playerWins=0,computerWins=0;
function renderTtt(){
  const board=document.getElementById("tttBoard"); board.innerHTML="";
  ttt.forEach((v,i)=>{
    const b=document.createElement("button"); b.className="ttt-cell"; b.textContent=v; b.onclick=()=>playTtt(i); board.appendChild(b);
  });
}
function playTtt(i){
  if(tttLocked||ttt[i]) return;
  ttt[i]="X"; renderTtt();
  if(checkWinner("X")){document.getElementById("tttStatus").textContent="🎉 You won!";playerWins++;scores.ttt++;saveScores();updateTttStats();tttLocked=true;return;}
  if(ttt.every(Boolean)){document.getElementById("tttStatus").textContent="Draw!";tttLocked=true;return;}
  tttLocked=true; document.getElementById("tttStatus").textContent="Computer is thinking...";
  setTimeout(computerMove,420);
}
function computerMove(){
  const open=ttt.map((v,i)=>v?null:i).filter(v=>v!==null);
  let i=findCriticalMove("O");
  if(i===null)i=findCriticalMove("X");
  if(i===null&&ttt[4]==="")i=4;
  if(i===null){
    const corners=[0,2,6,8].filter(x=>ttt[x]==="");
    i=corners.length?corners[Math.floor(Math.random()*corners.length)]:open[Math.floor(Math.random()*open.length)];
  }
  if(i!==undefined&&i!==null) ttt[i]="O"; renderTtt();
  if(checkWinner("O")){document.getElementById("tttStatus").textContent="Computer won.";computerWins++;updateTttStats();tttLocked=true;return;}
  if(ttt.every(Boolean)){document.getElementById("tttStatus").textContent="Draw!";tttLocked=true;return;}
  tttLocked=false;document.getElementById("tttStatus").textContent="Your turn: X";
}
function findCriticalMove(mark){
  const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for(const line of lines){
    const vals=line.map(i=>ttt[i]);
    if(vals.filter(v=>v===mark).length===2 && vals.includes("")) return line[vals.indexOf("")];
  }
  return null;
}
function checkWinner(m){return [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]].some(l=>l.every(i=>ttt[i]===m));}
function updateTttStats(){document.getElementById("playerWins").textContent=playerWins;document.getElementById("computerWins").textContent=computerWins;}
function resetTicTacToe(){ttt=Array(9).fill("");tttLocked=false;document.getElementById("tttStatus").textContent="Your turn: X";renderTtt();}

/* Memory */
const memoryIcons=["🍎","🚀","🐼","⚽","🌟","🎵"];
let memoryDeck=[],firstCard=null,secondCard=null,memoryLocked=false,memoryMoves=0,memoryMatched=0;
const shuffle=a=>[...a].sort(()=>Math.random()-.5);
function resetMemory(){
  memoryDeck=shuffle([...memoryIcons,...memoryIcons]).map((icon,id)=>({icon,id,matched:false}));
  firstCard=secondCard=null;memoryLocked=false;memoryMoves=memoryMatched=0;renderMemory();updateMemoryStats();
}
function renderMemory(){
  const board=document.getElementById("memoryBoard");board.innerHTML="";
  memoryDeck.forEach(c=>{
    const b=document.createElement("button");b.className="memory-card";
    if(c.matched)b.classList.add("matched");
    if((firstCard&&firstCard.id===c.id)||(secondCard&&secondCard.id===c.id))b.classList.add("flipped");
    b.textContent=c.icon;b.onclick=()=>flipMemory(c);board.appendChild(b);
  });
}
function flipMemory(c){
  if(memoryLocked||c.matched||(firstCard&&firstCard.id===c.id))return;
  if(!firstCard){firstCard=c;renderMemory();return;}
  secondCard=c;memoryMoves++;updateMemoryStats();renderMemory();
  if(firstCard.icon===secondCard.icon){
    firstCard.matched=secondCard.matched=true;memoryMatched++;firstCard=secondCard=null;renderMemory();updateMemoryStats();
    if(memoryMatched===6){scores.memory++;saveScores();setTimeout(()=>alert("Memory game completed!"),150);}
  }else{
    memoryLocked=true;setTimeout(()=>{firstCard=secondCard=null;memoryLocked=false;renderMemory();},700);
  }
}
function updateMemoryStats(){document.getElementById("memoryMoves").textContent=memoryMoves;document.getElementById("memoryMatched").textContent=memoryMatched;}

/* Tap */
let tapTimer=null,tapStarted=false,tapCount=0,tapTime=10;
function resetTap(){clearInterval(tapTimer);tapStarted=false;tapCount=0;tapTime=10;document.getElementById("tapCount").textContent=0;document.getElementById("tapTime").textContent=10;document.getElementById("tapButton").textContent="START";document.getElementById("tapMessage").textContent="Click the button to start.";}
function handleTap(){
  if(!tapStarted){
    tapStarted=true;tapCount=1;document.getElementById("tapButton").textContent="TAP!";document.getElementById("tapCount").textContent=tapCount;
    tapTimer=setInterval(()=>{tapTime--;document.getElementById("tapTime").textContent=tapTime;if(tapTime<=0){clearInterval(tapTimer);tapStarted=false;document.getElementById("tapButton").textContent="AGAIN";document.getElementById("tapMessage").textContent=`Finished! Score: ${tapCount}`;if(tapCount>scores.tap){scores.tap=tapCount;saveScores();}}},1000);
  }else{tapCount++;document.getElementById("tapCount").textContent=tapCount;}
}

/* Guess */
let secretNumber=0,guessAttempts=0;
function resetGuess(){secretNumber=Math.floor(Math.random()*100)+1;guessAttempts=0;document.getElementById("guessAttempts").textContent=0;document.getElementById("guessInput").value="";document.getElementById("guessMessage").textContent="Enter your first guess.";}
function submitGuess(){
  const v=Number(document.getElementById("guessInput").value);
  if(!v||v<1||v>100){document.getElementById("guessMessage").textContent="Enter a number from 1 to 100.";return;}
  guessAttempts++;document.getElementById("guessAttempts").textContent=guessAttempts;
  if(v===secretNumber){document.getElementById("guessMessage").textContent=`🎉 Correct! Number was ${secretNumber}`;scores.guess++;saveScores();}
  else document.getElementById("guessMessage").textContent=v<secretNumber?"Try a bigger number ↑":"Try a smaller number ↓";
}
document.getElementById("guessInput").addEventListener("keydown",e=>{if(e.key==="Enter")submitGuess();});

/* Snake */
let snakeTimer=null,snake=[],snakeFood={x:5,y:5},snakeDir={x:1,y:0},nextSnakeDir={x:1,y:0},snakeScore=0,snakeRunning=false,snakePaused=false;
const snakeCanvas=document.getElementById("snakeCanvas"),ctx=snakeCanvas.getContext("2d"),cell=24;
function resetSnake(){
  clearInterval(snakeTimer);snake=[{x:10,y:10},{x:9,y:10},{x:8,y:10}];snakeDir={x:1,y:0};nextSnakeDir={x:1,y:0};
  snakeScore=0;snakeRunning=false;snakePaused=false;placeFood();drawSnake();
  document.getElementById("snakeScore").textContent=0;document.getElementById("snakeBest").textContent=scores.snake||0;
  document.getElementById("snakePauseBtn").textContent="Pause";
  const o=document.getElementById("snakeOverlay");o.classList.remove("hidden");o.querySelector("strong").textContent="Snake Mini";o.querySelector("span").textContent="Use Arrow Keys";o.querySelector("button").textContent="Start Game";
}
function startSnake(){
  clearInterval(snakeTimer);snakeRunning=true;snakePaused=false;document.getElementById("snakeOverlay").classList.add("hidden");
  snakeTimer=setInterval(snakeStep,115);
}
function toggleSnakePause(){
  if(!snakeRunning)return;
  snakePaused=!snakePaused;document.getElementById("snakePauseBtn").textContent=snakePaused?"Resume":"Pause";
}
function placeFood(){
  do{snakeFood={x:Math.floor(Math.random()*20),y:Math.floor(Math.random()*20)}}while(snake.some(s=>s.x===snakeFood.x&&s.y===snakeFood.y));
}
function snakeStep(){
  if(snakePaused)return;
  snakeDir=nextSnakeDir;
  const head={x:snake[0].x+snakeDir.x,y:snake[0].y+snakeDir.y};
  if(head.x<0||head.y<0||head.x>=20||head.y>=20||snake.some(s=>s.x===head.x&&s.y===head.y)){
    clearInterval(snakeTimer);snakeRunning=false;
    if(snakeScore>scores.snake){scores.snake=snakeScore;saveScores();}
    const o=document.getElementById("snakeOverlay");o.classList.remove("hidden");o.querySelector("strong").textContent="Game Over";o.querySelector("span").textContent="Score: "+snakeScore;o.querySelector("button").textContent="Play Again";return;
  }
  snake.unshift(head);
  if(head.x===snakeFood.x&&head.y===snakeFood.y){snakeScore++;document.getElementById("snakeScore").textContent=snakeScore;placeFood();}
  else snake.pop();
  drawSnake();
}
function drawSnake(){
  ctx.clearRect(0,0,480,480);
  ctx.fillStyle="#11182c";ctx.fillRect(0,0,480,480);
  ctx.strokeStyle="rgba(255,255,255,.035)";
  for(let i=0;i<=20;i++){ctx.beginPath();ctx.moveTo(i*cell,0);ctx.lineTo(i*cell,480);ctx.stroke();ctx.beginPath();ctx.moveTo(0,i*cell);ctx.lineTo(480,i*cell);ctx.stroke();}
  ctx.fillStyle="#ff5d7c";ctx.beginPath();ctx.arc(snakeFood.x*cell+12,snakeFood.y*cell+12,9,0,Math.PI*2);ctx.fill();
  snake.forEach((s,i)=>{ctx.fillStyle=i===0?"#34d399":"#6ee7b7";ctx.fillRect(s.x*cell+2,s.y*cell+2,cell-4,cell-4);});
}
document.addEventListener("keydown",e=>{
  if(currentGame!=="snake")return;
  const map={ArrowUp:{x:0,y:-1},ArrowDown:{x:0,y:1},ArrowLeft:{x:-1,y:0},ArrowRight:{x:1,y:0}};
  if(map[e.key]&&!(map[e.key].x===-snakeDir.x&&map[e.key].y===-snakeDir.y)){nextSnakeDir=map[e.key];e.preventDefault();}
});

/* Penalty */
let goalScore=0,penaltyBusy=false;
function resetPenalty(){goalScore=0;penaltyBusy=false;document.getElementById("goalScore").textContent=0;document.getElementById("penaltyMessage").textContent="Choose where to shoot.";document.getElementById("football").style="";document.getElementById("goalKeeper").style="";}
function shootBall(dir){
  if(penaltyBusy)return;penaltyBusy=true;
  const choices=["left","center","right"],keeper=choices[Math.floor(Math.random()*3)];
  const pos={left:"26%",center:"50%",right:"74%"};
  document.getElementById("goalKeeper").style.left=pos[keeper];
  const ball=document.getElementById("football");ball.style.left=pos[dir];ball.style.bottom="180px";
  setTimeout(()=>{
    if(dir===keeper)document.getElementById("penaltyMessage").textContent="Saved by goalkeeper!";
    else{goalScore++;scores.penalty++;saveScores();document.getElementById("goalScore").textContent=goalScore;document.getElementById("penaltyMessage").textContent="GOAL! ⚽";}
    setTimeout(()=>{ball.style.left="50%";ball.style.bottom="20px";document.getElementById("goalKeeper").style.left="50%";penaltyBusy=false;},650);
  },550);
}

/* Color */
const colors=[["RED","#ef4444"],["BLUE","#3b82f6"],["GREEN","#22c55e"],["YELLOW","#eab308"]];
let currentColor="",colorScore=0;
function resetColor(){colorScore=0;document.getElementById("colorScore").textContent=0;nextColor();}
function nextColor(){
  const target=colors[Math.floor(Math.random()*colors.length)];currentColor=target[0];
  const word=document.getElementById("colorWord");word.textContent=target[0];word.style.color=colors[Math.floor(Math.random()*colors.length)][1];
  const opts=document.getElementById("colorOptions");opts.innerHTML="";
  shuffle(colors).forEach(c=>{const b=document.createElement("button");b.style.background=c[1];b.onclick=()=>chooseColor(c[0]);opts.appendChild(b);});
}
function chooseColor(name){if(name===currentColor){colorScore++;document.getElementById("colorScore").textContent=colorScore;if(colorScore>scores.color){scores.color=colorScore;saveScores();}}else colorScore=0;nextColor();}

/* Math */
let mathTimer=null,mathTime=30,mathScore=0,mathAnswer=0;
function resetMath(){clearInterval(mathTimer);mathTime=30;mathScore=0;document.getElementById("mathTime").textContent=30;document.getElementById("mathScore").textContent=0;nextMath();mathTimer=setInterval(()=>{mathTime--;document.getElementById("mathTime").textContent=mathTime;if(mathTime<=0){clearInterval(mathTimer);document.getElementById("mathMessage").textContent="Time over!";if(mathScore>scores.math){scores.math=mathScore;saveScores();}}},1000);}
function nextMath(){const a=Math.ceil(Math.random()*15),b=Math.ceil(Math.random()*15),op=Math.random()>.5?"+":"×";mathAnswer=op==="+"?a+b:a*b;document.getElementById("mathQuestion").textContent=`${a} ${op} ${b} = ?`;document.getElementById("mathInput").value="";}
function submitMath(){if(mathTime<=0)return;const v=Number(document.getElementById("mathInput").value);if(v===mathAnswer){mathScore++;document.getElementById("mathScore").textContent=mathScore;document.getElementById("mathMessage").textContent="Correct!";nextMath();}else document.getElementById("mathMessage").textContent="Try again.";}
document.getElementById("mathInput").addEventListener("keydown",e=>{if(e.key==="Enter")submitMath();});

updateScoreUI();
renderTtt();


/* Reaction Test */
let reactionTimer=null,reactionStartedAt=0,reactionState="idle";
function resetReaction(){
  clearTimeout(reactionTimer);reactionState="idle";
  const pad=document.getElementById("reactionPad");pad.className="reaction-pad waiting";
  document.getElementById("reactionText").textContent="Click Start";
  document.getElementById("reactionSubtext").textContent="Wait for green before clicking.";
  document.getElementById("reactionBest").textContent=scores.reaction?scores.reaction+" ms":"--";
}
function startReaction(){
  clearTimeout(reactionTimer);reactionState="waiting";
  const pad=document.getElementById("reactionPad");pad.className="reaction-pad waiting";
  document.getElementById("reactionText").textContent="Wait...";
  document.getElementById("reactionSubtext").textContent="Do not click yet.";
  reactionTimer=setTimeout(()=>{
    reactionState="ready";reactionStartedAt=performance.now();pad.className="reaction-pad ready";
    document.getElementById("reactionText").textContent="CLICK!";
    document.getElementById("reactionSubtext").textContent="Now!";
  },1500+Math.random()*2500);
}
function reactionClick(){
  const pad=document.getElementById("reactionPad");
  if(reactionState==="waiting"){
    clearTimeout(reactionTimer);reactionState="idle";pad.className="reaction-pad too-soon";
    document.getElementById("reactionText").textContent="Too Soon!";
    document.getElementById("reactionSubtext").textContent="Press Start and try again.";
  }else if(reactionState==="ready"){
    const ms=Math.round(performance.now()-reactionStartedAt);reactionState="idle";pad.className="reaction-pad waiting";
    document.getElementById("reactionText").textContent=ms+" ms";
    document.getElementById("reactionSubtext").textContent=ms<250?"Excellent reflex!":ms<350?"Good reaction!":"Keep practicing.";
    if(!scores.reaction||ms<scores.reaction){scores.reaction=ms;saveScores();}
    document.getElementById("reactionBest").textContent=scores.reaction+" ms";
  }
}

/* Cricket Timing */
let cricketAnim=0,cricketX=0,cricketRuns=0,cricketBalls=0,cricketActive=false,batSwinging=false;
function resetCricket(){
  cancelAnimationFrame(cricketAnim);cricketRuns=0;cricketBalls=0;cricketActive=false;batSwinging=false;
  document.getElementById("cricketRuns").textContent=0;document.getElementById("cricketBalls").textContent="0/12";
  document.getElementById("cricketMessage").textContent="Press SWING BAT to start.";
  const ball=document.getElementById("cricketBall");ball.style.left="6%";ball.style.bottom="80px";
}
function startCricketBall(){
  if(cricketBalls>=12){document.getElementById("cricketMessage").textContent="Innings complete! Final score: "+cricketRuns;return;}
  cricketActive=true;batSwinging=false;cricketX=6;
  const ball=document.getElementById("cricketBall");
  function frame(){
    cricketX+=0.65;ball.style.left=cricketX+"%";
    ball.style.bottom=(80+Math.sin(cricketX/8)*18)+"px";
    if(cricketX>=84){
      cricketBalls++;document.getElementById("cricketBalls").textContent=cricketBalls+"/12";
      cricketActive=false;document.getElementById("cricketMessage").textContent="Missed! Swing earlier.";
      setTimeout(startCricketBall,700);return;
    }
    cricketAnim=requestAnimationFrame(frame);
  }
  frame();
}
function swingBat(){
  const bat=document.getElementById("cricketBat");
  bat.style.transform="rotate(35deg)";setTimeout(()=>bat.style.transform="rotate(-18deg)",180);
  if(!cricketActive){startCricketBall();return;}
  if(batSwinging)return;batSwinging=true;
  let runs=0;
  if(cricketX>=72&&cricketX<=79)runs=6;
  else if(cricketX>=66&&cricketX<72)runs=4;
  else if(cricketX>=60&&cricketX<66)runs=2;
  else if(cricketX>=55&&cricketX<60)runs=1;
  if(runs>0){
    cancelAnimationFrame(cricketAnim);cricketActive=false;cricketRuns+=runs;cricketBalls++;
    document.getElementById("cricketRuns").textContent=cricketRuns;
    document.getElementById("cricketBalls").textContent=cricketBalls+"/12";
    document.getElementById("cricketMessage").textContent=runs===6?"SIX! Perfect timing!":runs===4?"FOUR! Great shot!":runs+" run"+(runs>1?"s":"")+"!";
    if(cricketRuns>scores.cricket){scores.cricket=cricketRuns;saveScores();}
    setTimeout(startCricketBall,850);
  }else{
    document.getElementById("cricketMessage").textContent="Too early! Watch the ball.";
    setTimeout(()=>batSwinging=false,200);
  }
}


/* Highway Racer */
let racingAnim=0,racingRunning=false,racingCarX=330,racingEnemies=[],racingScore=0,racingKeys={};
const racingCanvas=document.getElementById("racingCanvas"),rctx=racingCanvas.getContext("2d");
function resetRacing(){
  cancelAnimationFrame(racingAnim);racingRunning=false;racingCarX=330;racingEnemies=[];racingScore=0;
  document.getElementById("racingScore").textContent=0;document.getElementById("racingBest").textContent=scores.racing||0;
  document.getElementById("racingOverlay").classList.remove("hidden");drawRacing();
}
function startRacing(){racingRunning=true;document.getElementById("racingOverlay").classList.add("hidden");racingLoop();}
function drawRacing(){
  rctx.fillStyle="#212633";rctx.fillRect(0,0,700,450);
  rctx.fillStyle="#565b64";rctx.fillRect(170,0,360,450);
  rctx.strokeStyle="#fff";rctx.lineWidth=5;rctx.setLineDash([28,22]);
  rctx.beginPath();rctx.moveTo(350,0);rctx.lineTo(350,450);rctx.stroke();rctx.setLineDash([]);
  rctx.fillStyle="#38bdf8";rctx.fillRect(racingCarX,365,42,70);
  rctx.fillStyle="#111";rctx.fillRect(racingCarX-4,377,7,18);rctx.fillRect(racingCarX+39,377,7,18);rctx.fillRect(racingCarX-4,410,7,18);rctx.fillRect(racingCarX+39,410,7,18);
  racingEnemies.forEach(e=>{rctx.fillStyle=e.c;rctx.fillRect(e.x,e.y,42,70);});
}
function racingLoop(){
  if(!racingRunning)return;
  if(racingKeys.ArrowLeft)racingCarX=Math.max(182,racingCarX-6);
  if(racingKeys.ArrowRight)racingCarX=Math.min(476,racingCarX+6);
  if(Math.random()<.026)racingEnemies.push({x:190+Math.floor(Math.random()*7)*44,y:-80,c:["#ef4444","#f59e0b","#a78bfa","#10b981"][Math.floor(Math.random()*4)]});
  racingEnemies.forEach(e=>e.y+=4.5);racingEnemies=racingEnemies.filter(e=>e.y<500);
  for(const e of racingEnemies){
    if(racingCarX<e.x+42&&racingCarX+42>e.x&&365<e.y+70&&435>e.y){endRacing();return;}
  }
  racingScore++;document.getElementById("racingScore").textContent=Math.floor(racingScore/10);
  drawRacing();racingAnim=requestAnimationFrame(racingLoop);
}
function endRacing(){
  racingRunning=false;const val=Math.floor(racingScore/10);if(val>scores.racing){scores.racing=val;saveScores();}
  const o=document.getElementById("racingOverlay");o.classList.remove("hidden");o.querySelector("h2").textContent="Crash!";o.querySelector("p").textContent="Distance: "+val;o.querySelector("button").textContent="Race Again";
}
document.addEventListener("keydown",e=>racingKeys[e.key]=true);document.addEventListener("keyup",e=>racingKeys[e.key]=false);

/* Brick Breaker */
let brickAnim=0,brickRunning=false,bx=350,by=330,bdx=4,bdy=-4,paddleX=300,bricks=[],brickScore=0,brickLives=3;
const brickCanvas=document.getElementById("brickCanvas"),bctx=brickCanvas.getContext("2d");
function resetBrick(){cancelAnimationFrame(brickAnim);brickRunning=false;brickScore=0;brickLives=3;bx=350;by=330;bdx=4;bdy=-4;paddleX=300;bricks=[];for(let r=0;r<5;r++)for(let c=0;c<10;c++)bricks.push({x:45+c*62,y:35+r*30,w:54,h:20,on:true});document.getElementById("brickScore").textContent=0;document.getElementById("brickLives").textContent=3;document.getElementById("brickOverlay").classList.remove("hidden");drawBrick();}
function startBrick(){brickRunning=true;document.getElementById("brickOverlay").classList.add("hidden");brickLoop();}
brickCanvas.addEventListener("mousemove",e=>{const rect=brickCanvas.getBoundingClientRect();paddleX=(e.clientX-rect.left)*(700/rect.width)-60;});
function drawBrick(){bctx.fillStyle="#0b1224";bctx.fillRect(0,0,700,450);bricks.forEach((br,i)=>{if(br.on){bctx.fillStyle=["#7c5cff","#34d399","#f59e0b","#ef4444","#38bdf8"][i%5];bctx.fillRect(br.x,br.y,br.w,br.h);}});bctx.fillStyle="#fff";bctx.fillRect(paddleX,410,120,14);bctx.beginPath();bctx.arc(bx,by,8,0,Math.PI*2);bctx.fill();}
function brickLoop(){if(!brickRunning)return;bx+=bdx;by+=bdy;if(bx<8||bx>692)bdx*=-1;if(by<8)bdy*=-1;if(by>402&&by<420&&bx>paddleX&&bx<paddleX+120)bdy=-Math.abs(bdy);for(const br of bricks){if(br.on&&bx>br.x&&bx<br.x+br.w&&by>br.y&&by<br.y+br.h){br.on=false;bdy*=-1;brickScore+=10;document.getElementById("brickScore").textContent=brickScore;break;}}if(bricks.every(b=>!b.on)){finishBrick("You Win!");return;}if(by>450){brickLives--;document.getElementById("brickLives").textContent=brickLives;if(brickLives<=0){finishBrick("Game Over");return;}bx=350;by=330;bdy=-4;}drawBrick();brickAnim=requestAnimationFrame(brickLoop);}
function finishBrick(title){brickRunning=false;if(brickScore>scores.brick){scores.brick=brickScore;saveScores();}const o=document.getElementById("brickOverlay");o.classList.remove("hidden");o.querySelector("h2").textContent=title;o.querySelector("p").textContent="Score: "+brickScore;o.querySelector("button").textContent="Play Again";}

/* Space Shooter */
let spaceAnim=0,spaceRunning=false,shipX=330,bullets=[],aliens=[],spaceScore=0,spaceLives=3,spaceKeys={};
const spaceCanvas=document.getElementById("spaceCanvas"),sctx=spaceCanvas.getContext("2d");
function resetSpace(){cancelAnimationFrame(spaceAnim);spaceRunning=false;shipX=330;bullets=[];aliens=[];spaceScore=0;spaceLives=3;document.getElementById("spaceScore").textContent=0;document.getElementById("spaceLives").textContent=3;document.getElementById("spaceOverlay").classList.remove("hidden");drawSpace();}
function startSpace(){spaceRunning=true;document.getElementById("spaceOverlay").classList.add("hidden");spaceLoop();}
function drawSpace(){sctx.fillStyle="#050816";sctx.fillRect(0,0,700,450);for(let i=0;i<60;i++){sctx.fillStyle="rgba(255,255,255,.45)";sctx.fillRect((i*97)%700,(i*53)%450,2,2);}sctx.fillStyle="#38bdf8";sctx.beginPath();sctx.moveTo(shipX+20,385);sctx.lineTo(shipX,430);sctx.lineTo(shipX+40,430);sctx.closePath();sctx.fill();sctx.fillStyle="#facc15";bullets.forEach(b=>sctx.fillRect(b.x,b.y,4,12));aliens.forEach(a=>{sctx.fillStyle="#ef4444";sctx.fillRect(a.x,a.y,34,24);});}
function spaceLoop(){if(!spaceRunning)return;if(spaceKeys.ArrowLeft)shipX=Math.max(5,shipX-6);if(spaceKeys.ArrowRight)shipX=Math.min(655,shipX+6);bullets.forEach(b=>b.y-=8);bullets=bullets.filter(b=>b.y>-20);if(Math.random()<.03)aliens.push({x:Math.random()*650,y:-30});aliens.forEach(a=>a.y+=2.2);for(const b of bullets)for(const a of aliens)if(a.x< b.x&&a.x+34>b.x&&a.y<b.y&&a.y+24>b.y){a.hit=b.hit=true;spaceScore+=10;document.getElementById("spaceScore").textContent=spaceScore;}bullets=bullets.filter(b=>!b.hit);aliens=aliens.filter(a=>!a.hit);for(const a of aliens){if(a.y>390&&a.x<shipX+40&&a.x+34>shipX){a.hit=true;spaceLives--;document.getElementById("spaceLives").textContent=spaceLives;if(spaceLives<=0){finishSpace();return;}}}aliens=aliens.filter(a=>a.y<470&&!a.hit);drawSpace();spaceAnim=requestAnimationFrame(spaceLoop);}
function finishSpace(){spaceRunning=false;if(spaceScore>scores.space){scores.space=spaceScore;saveScores();}const o=document.getElementById("spaceOverlay");o.classList.remove("hidden");o.querySelector("h2").textContent="Mission Over";o.querySelector("p").textContent="Score: "+spaceScore;o.querySelector("button").textContent="Play Again";}
document.addEventListener("keydown",e=>{spaceKeys[e.key]=true;if(currentGame==="space"&&e.code==="Space"&&spaceRunning){bullets.push({x:shipX+18,y:385});e.preventDefault();}});document.addEventListener("keyup",e=>spaceKeys[e.key]=false);

/* Flappy */
let flappyAnim=0,flappyRunning=false,birdY=210,birdV=0,pipes=[],flappyScore=0;
const flappyCanvas=document.getElementById("flappyCanvas"),fctx=flappyCanvas.getContext("2d");
function resetFlappy(){cancelAnimationFrame(flappyAnim);flappyRunning=false;birdY=210;birdV=0;pipes=[];flappyScore=0;document.getElementById("flappyScore").textContent=0;document.getElementById("flappyBest").textContent=scores.flappy||0;document.getElementById("flappyOverlay").classList.remove("hidden");drawFlappy();}
function startFlappy(){flappyRunning=true;birdY=210;birdV=-5;pipes=[];flappyScore=0;document.getElementById("flappyOverlay").classList.add("hidden");flappyLoop();}
function flap(){if(flappyRunning)birdV=-7;}
flappyCanvas.addEventListener("click",flap);document.addEventListener("keydown",e=>{if(currentGame==="flappy"&&e.code==="Space"){flap();e.preventDefault();}});
function drawFlappy(){fctx.fillStyle="#67c9f3";fctx.fillRect(0,0,700,450);fctx.fillStyle="#5fbf66";fctx.fillRect(0,420,700,30);pipes.forEach(p=>{fctx.fillStyle="#2ba84a";fctx.fillRect(p.x,0,60,p.gapY-80);fctx.fillRect(p.x,p.gapY+80,60,450-(p.gapY+80));});fctx.font="38px sans-serif";fctx.fillText("🐦",90,birdY);}
function flappyLoop(){if(!flappyRunning)return;birdV+=.38;birdY+=birdV;if(Math.random()<.018)pipes.push({x:720,gapY:120+Math.random()*200,passed:false});pipes.forEach(p=>p.x-=3.2);for(const p of pipes){if(!p.passed&&p.x<90){p.passed=true;flappyScore++;document.getElementById("flappyScore").textContent=flappyScore;}if(90>p.x-35&&90<p.x+60&&!(birdY>p.gapY-60&&birdY<p.gapY+80)){endFlappy();return;}}pipes=pipes.filter(p=>p.x>-80);if(birdY<20||birdY>420){endFlappy();return;}drawFlappy();flappyAnim=requestAnimationFrame(flappyLoop);}
function endFlappy(){flappyRunning=false;if(flappyScore>scores.flappy){scores.flappy=flappyScore;saveScores();}const o=document.getElementById("flappyOverlay");o.classList.remove("hidden");o.querySelector("h2").textContent="Game Over";o.querySelector("p").textContent="Score: "+flappyScore;o.querySelector("button").textContent="Fly Again";}

/* Basket */
let basketPower=0,basketDir=1,basketTimer=null,basketScore=0,basketBusy=false;
function resetBasket(){clearInterval(basketTimer);basketPower=0;basketDir=1;basketScore=0;basketBusy=false;document.getElementById("basketScore").textContent=0;document.getElementById("basketBall").style="";basketTimer=setInterval(()=>{basketPower+=basketDir*2;if(basketPower>=100||basketPower<=0)basketDir*=-1;document.querySelector("#powerBar span").style.height=basketPower+"%";document.querySelector("#powerBar span").style.marginTop=(100-basketPower)+"%";},35);}
function shootBasket(){if(basketBusy)return;basketBusy=true;const ball=document.getElementById("basketBall");const good=basketPower>72&&basketPower<88;ball.style.left="78%";ball.style.bottom=good?"235px":"150px";ball.style.transform="scale(.75)";setTimeout(()=>{if(good){basketScore++;scores.basket++;saveScores();document.getElementById("basketScore").textContent=basketScore;document.getElementById("basketMessage").textContent="SWISH! Perfect shot!";}else document.getElementById("basketMessage").textContent="Missed! Try the green zone.";setTimeout(()=>{ball.style="";basketBusy=false;},550);},950);}

/* Runner */
let runnerAnim=0,runnerRunning=false,runnerY=330,runnerV=0,runnerObs=[],runnerScore=0;
const runnerCanvas=document.getElementById("runnerCanvas"),runctx=runnerCanvas.getContext("2d");
function resetRunner(){cancelAnimationFrame(runnerAnim);runnerRunning=false;runnerY=330;runnerV=0;runnerObs=[];runnerScore=0;document.getElementById("runnerScore").textContent=0;document.getElementById("runnerBest").textContent=scores.runner||0;document.getElementById("runnerOverlay").classList.remove("hidden");drawRunner();}
function startRunner(){runnerRunning=true;document.getElementById("runnerOverlay").classList.add("hidden");runnerLoop();}
function runnerJump(){if(runnerRunning&&runnerY>=329)runnerV=-12;}
document.addEventListener("keydown",e=>{if(currentGame==="runner"&&e.code==="Space"){runnerJump();e.preventDefault();}});
function drawRunner(){runctx.fillStyle="#9fd3ff";runctx.fillRect(0,0,700,450);runctx.fillStyle="#4e9f53";runctx.fillRect(0,390,700,60);runctx.font="48px sans-serif";runctx.fillText("🏃",90,runnerY+45);runnerObs.forEach(o=>{runctx.font="45px sans-serif";runctx.fillText("🪨",o.x,388);});}
function runnerLoop(){if(!runnerRunning)return;runnerV+=.65;runnerY+=runnerV;if(runnerY>330){runnerY=330;runnerV=0;}if(Math.random()<.02)runnerObs.push({x:720});runnerObs.forEach(o=>o.x-=5);for(const o of runnerObs){if(o.x<140&&o.x>80&&runnerY>285){endRunner();return;}if(!o.passed&&o.x<80){o.passed=true;runnerScore++;document.getElementById("runnerScore").textContent=runnerScore;}}runnerObs=runnerObs.filter(o=>o.x>-60);drawRunner();runnerAnim=requestAnimationFrame(runnerLoop);}
function endRunner(){runnerRunning=false;if(runnerScore>scores.runner){scores.runner=runnerScore;saveScores();}const o=document.getElementById("runnerOverlay");o.classList.remove("hidden");o.querySelector("h2").textContent="Game Over";o.querySelector("p").textContent="Score: "+runnerScore;o.querySelector("button").textContent="Run Again";}
