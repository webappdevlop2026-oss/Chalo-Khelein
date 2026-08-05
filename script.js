const screens = {
  home: document.getElementById("homeScreen"),
  game: document.getElementById("gameScreen"),
  score: document.getElementById("scoreScreen")
};

const gameNames = {
  tictactoe:"Tic-Tac-Toe", memory:"Memory Match", tap:"Tap Challenge",
  guess:"Number Guess", snake:"Snake Mini", penalty:"Penalty Kick",
  color:"Color Catch", math:"Quick Math", reaction:"Reaction Test", cricket:"Cricket Timing"
};

let currentGame = null;
let activeCategory = "all";
let scores = JSON.parse(localStorage.getItem("chaloKheleinScores") || '{"ttt":0,"memory":0,"tap":0,"guess":0,"snake":0,"penalty":0,"color":0,"math":0,"reaction":0,"cricket":0}');
if(scores.reaction===undefined)scores.reaction=0;if(scores.cricket===undefined)scores.cricket=0;

function saveScores(){
  localStorage.setItem("chaloKheleinScores",JSON.stringify(scores));
  updateScoreUI();
}
function totalScore(){
  return scores.ttt*100 + scores.memory*150 + scores.tap + scores.guess*120 + scores.snake*10 + scores.penalty*15 + scores.color*10 + scores.math*10 + scores.cricket*10;
}
function updateScoreUI(){
  document.getElementById("scoreBoardTotal").textContent=totalScore();
  ["ttt","memory","tap","guess","snake","penalty","color","math","cricket"].forEach(k=>{
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
  scores={ttt:0,memory:0,tap:0,guess:0,snake:0,penalty:0,color:0,math:0,reaction:0,cricket:0};
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
}
function stopRunningGames(){
  clearInterval(tapTimer); clearInterval(snakeTimer); clearInterval(mathTimer); clearTimeout(reactionTimer); cancelAnimationFrame(cricketAnim);
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
