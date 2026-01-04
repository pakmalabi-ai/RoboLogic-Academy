import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { levels, LevelConfig, GridType } from '../data/levels';
import { Play, RotateCcw, Trash2, ArrowUp, ArrowLeft, ArrowRight, Save, Key, Droplet, Flame, Flag, Zap, Box, Lock, Unlock, Volume2, HelpCircle, X, Brain, Target } from 'lucide-react';

// Types
interface Robot { x: number; y: number; dir: number; inventory?: string; water?: number }
interface Command { type: string; val?: number; body?: Command[] }

// Sound Utility
const sfx = {
  ctx: null as AudioContext | null,
  init: function() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  },
  play: function(type: 'move'|'turn'|'pick'|'open'|'win'|'lose'|'ui') {
    try {
        this.init();
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        if (type === 'move') {
          // Mechanical Step Sound (Lower pitch, triangle wave for "clank")
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(100, t);
          osc.frequency.exponentialRampToValueAtTime(10, t + 0.1);
          gain.gain.setValueAtTime(0.15, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
          osc.start(t);
          osc.stop(t + 0.1);
        } else if (type === 'turn') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(200, t);
          gain.gain.setValueAtTime(0.05, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.05);
          osc.start(t);
          osc.stop(t + 0.05);
        } else if (type === 'pick') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, t);
          osc.frequency.setValueAtTime(1200, t + 0.1);
          gain.gain.setValueAtTime(0.1, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.2);
          osc.start(t);
          osc.stop(t + 0.2);
        } else if (type === 'open') {
           osc.type = 'sawtooth';
           osc.frequency.setValueAtTime(100, t);
           osc.frequency.linearRampToValueAtTime(300, t + 0.3);
           gain.gain.setValueAtTime(0.05, t);
           gain.gain.linearRampToValueAtTime(0, t + 0.3);
           osc.start(t);
           osc.stop(t + 0.3);
        } else if (type === 'win') {
            [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
                const o = this.ctx!.createOscillator();
                const g = this.ctx!.createGain();
                o.connect(g);
                g.connect(this.ctx!.destination);
                o.type = 'square';
                o.frequency.value = f;
                g.gain.setValueAtTime(0.05, t + i*0.1);
                g.gain.exponentialRampToValueAtTime(0.001, t + i*0.1 + 0.3);
                o.start(t + i*0.1);
                o.stop(t + i*0.1 + 0.3);
            });
        } else if (type === 'lose') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, t);
            osc.frequency.linearRampToValueAtTime(50, t + 0.4);
            gain.gain.setValueAtTime(0.1, t);
            gain.gain.linearRampToValueAtTime(0, t + 0.4);
            osc.start(t);
            osc.stop(t + 0.4);
        } else if (type === 'ui') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, t);
            gain.gain.setValueAtTime(0.02, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
            osc.start(t);
            osc.stop(t + 0.05);
        }
    } catch (e) {
        console.error("Audio error", e);
    }
  }
};

const GameLevel: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const level = levels.find(l => l.id === id);
  
  // State
  const [grid, setGrid] = useState<GridType>([]);
  const [robot, setRobot] = useState<Robot>({ x: 0, y: 0, dir: 0 });
  const [commands, setCommands] = useState<Command[]>([]);
  const [patternCommands, setPatternCommands] = useState<Command[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [message, setMessage] = useState('');
  const [statusColor, setStatusColor] = useState('text-slate-400');
  const [activeCmdIndex, setActiveCmdIndex] = useState<number | null>(null);
  const [isRecordingLoop, setIsRecordingLoop] = useState(false);
  const [loopCount, setLoopCount] = useState(3);
  const [loopBuffer, setLoopBuffer] = useState<Command[]>([]);
  const [inventory, setInventory] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(true);
  const [showWinModal, setShowWinModal] = useState(false);

  // Logic Rules State (Level 3)
  const [logicRules, setLogicRules] = useState({ red: 'ignore', blue: 'ignore', yellow: 'ignore' });

  // Init
  useEffect(() => {
    if (level) {
      resetLevel();
      setShowHelp(true);
    }
  }, [id]);

  const resetLevel = () => {
    if (!level) return;
    setIsRunning(false);
    setMessage(level.hint);
    setStatusColor('text-blue-300');
    setActiveCmdIndex(null);
    setInventory(null);
    setShowWinModal(false);
    
    // Reset Logic Rules to Ignore
    setLogicRules({ red: 'ignore', blue: 'ignore', yellow: 'ignore' });
    
    sfx.play('ui');
    
    // Deep copy grid
    const newGrid = level.grid.map(row => [...row]);
    setGrid(newGrid);

    // Find start
    let startPos = { x: 0, y: 0 };
    for (let y = 0; y < level.gridSize; y++) {
      for (let x = 0; x < level.gridSize; x++) {
        // Ensure we don't check out of bounds if grid layout is larger than gridSize logic
        if (newGrid[y] && newGrid[y][x] === 2) startPos = { x, y };
      }
    }
    setRobot({ x: startPos.x, y: startPos.y, dir: level.startDir, water: 3 });
    
    // Initial Code for Debug Level
    if (level.initialCode) {
      const deepClone = JSON.parse(JSON.stringify(level.initialCode));
      setCommands(deepClone);
    } else {
      setCommands([]);
    }
    setPatternCommands([]);
  };

  const addCommand = (type: string, listType: 'main' | 'pattern' = 'main', val: number = 1) => {
    if (isRunning) return;
    sfx.play('ui');
    
    const cmd: Command = { type, val };

    if (isRecordingLoop) {
      setLoopBuffer([...loopBuffer, cmd]);
      return;
    }

    if (listType === 'pattern') {
      setPatternCommands([...patternCommands, cmd]);
    } else {
      setCommands([...commands, cmd]);
    }
  };

  const startLoopRecord = () => {
    sfx.play('ui');
    setIsRecordingLoop(true);
    setLoopBuffer([]);
  }

  const saveLoop = (type: 'loop' | 'while' = 'loop') => {
    sfx.play('ui');
    setIsRecordingLoop(false);
    const cmd: Command = { 
        type, 
        val: type === 'loop' ? loopCount : 0, 
        body: [...loopBuffer] 
    };
    setCommands([...commands, cmd]);
  }

  // --- Logic Engine ---

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

  const getNextPos = (r: Robot) => {
    let nx = r.x;
    let ny = r.y;
    if (r.dir === 0) ny--;
    if (r.dir === 1) nx++;
    if (r.dir === 2) ny++;
    if (r.dir === 3) nx--;
    return { x: nx, y: ny };
  };

  const checkTile = (x: number, y: number, currentGrid: GridType): 'ok' | 'crash' | 'win' | 'door' => {
     // Safety check for array bounds
     if (x < 0 || y < 0 || y >= currentGrid.length || x >= currentGrid[0].length) return 'crash';
     
     // Also enforce logical grid size if needed, but array length is truth for execution
     if (x >= level!.gridSize || y >= level!.gridSize) return 'crash';

     const tile = currentGrid[y][x];
     if (tile === 1) return 'crash'; // Wall
     if (tile === 6) return 'door'; // Locked Door
     if (tile === 9) return 'win';
     return 'ok';
  };

  const processStep = async (cmd: Command, currentRobot: Robot, currentGrid: GridType): Promise<{robot: Robot, status: string}> => {
     let r = { ...currentRobot };
     let status = 'ok';

     if (cmd.type === 'turnLeft') {
       r.dir = (r.dir - 1 + 4) % 4;
       sfx.play('turn');
     } else if (cmd.type === 'turnRight') {
       r.dir = (r.dir + 1) % 4;
       sfx.play('turn');
     } else if (cmd.type === 'move') {
       // Support params
       const dist = cmd.val || 1;
       for(let i=0; i<dist; i++) {
           const next = getNextPos(r);
           const check = checkTile(next.x, next.y, currentGrid);
           
           if (check === 'crash') { status = 'crash'; break; }
           if (check === 'door') { status = 'crash'; break; } // Hit door
           
           r.x = next.x;
           r.y = next.y;
           
           sfx.play('move');

           if (check === 'win') { status = 'win'; break; }
           
           // Visual Update step by step for params
           if (dist > 1) {
             setRobot({...r});
             await sleep(300);
           }
       }
     } else if (cmd.type === 'pick') {
       const tile = currentGrid[r.y][r.x];
       if (tile === 5) { // Key
          currentGrid[r.y][r.x] = 0;
          setInventory('key');
          r.inventory = 'key';
          setMessage("Kunci diambil!");
          sfx.play('pick');
       } else if (tile === 3) { // Fire (Rescue Level mapping: pick = extinguish)
          currentGrid[r.y][r.x] = 0;
          setMessage("Api padam!");
          sfx.play('pick');
       }
     } else if (cmd.type === 'use') {
        const next = getNextPos(r);
        // Interaction check should be safe vs array bounds
        if (next.y >= 0 && next.y < currentGrid.length && next.x >= 0 && next.x < currentGrid[0].length) {
            const tile = currentGrid[next.y][next.x];
            if (tile === 6 && r.inventory === 'key') {
                currentGrid[next.y][next.x] = 7; // Open
                setMessage("Pintu terbuka!");
                sfx.play('open');
            } else if (tile === 4) { // Water (Rescue: use = refill)
                r.water = 3;
                setMessage("Air diisi!");
                sfx.play('pick');
            }
        }
     }

     return { robot: r, status };
  };

  const runProgram = async () => {
    if (isRunning || !level) return;
    sfx.play('ui');
    setIsRunning(true);
    setMessage("Program berjalan...");
    
    // Use refs to track state during async loop
    let currentR = { ...robot };
    let currentG = grid.map(row => [...row]); // Copy

    // For Logic Level (3), it's a simulation tick
    if (level.category === 'Laboratorium Logika') {
        runLogicSimulation();
        return;
    }

    const executeQueue = async (queue: Command[]) => {
        for (let i = 0; i < queue.length; i++) {
            setActiveCmdIndex(i); // Note: highlighting nested/pattern cmds is tricky in this simplified view
            const cmd = queue[i];

            if (cmd.type === 'callPattern') {
                const res = await executeQueue(patternCommands);
                if (res !== 'ok') return res;
            } else if (cmd.type === 'loop') {
                for(let k=0; k<(cmd.val || 1); k++) {
                    const res = await executeQueue(cmd.body || []);
                    if (res !== 'ok') return res;
                }
            } else if (cmd.type === 'while') {
                 // Simple "While not wall" logic
                 let safety = 0;
                 while(safety < 30) {
                     const next = getNextPos(currentR);
                     const check = checkTile(next.x, next.y, currentG);
                     // Fix: Break only if crashing into wall or closed door. 
                     // Allow stepping on 'win' (9) or 'floor' (0) or 'key' (5)
                     if (check === 'crash' || check === 'door') break; 

                     const res = await executeQueue(cmd.body || []);
                     if (res !== 'ok') return res;
                     safety++;
                 }
            } else {
                const res = await processStep(cmd, currentR, currentG);
                currentR = res.robot;
                setRobot({ ...currentR });
                setGrid([...currentG]); // Update grid for door/item changes
                await sleep(500);

                if (res.status === 'win') return 'win';
                if (res.status === 'crash') return 'crash';
            }
        }
        return 'ok';
    };

    const finalStatus = await executeQueue(commands);
    
    setIsRunning(false);
    setActiveCmdIndex(null);

    if (finalStatus === 'win') {
        setMessage("MISI BERHASIL! 🎉");
        setStatusColor("text-green-400 font-bold text-xl");
        sfx.play('win');
        setTimeout(() => setShowWinModal(true), 500);
    } else if (finalStatus === 'crash') {
        setMessage("ROBOT CRASH! 💥");
        setStatusColor("text-red-500 font-bold");
        sfx.play('lose');
    } else {
        setMessage("Program selesai. Belum sampai tujuan.");
    }
  };

  const runLogicSimulation = () => {
     // Specific for level 3
     let tickCount = 0;
     let currentR = { ...robot };
     const timer = setInterval(() => {
        if (tickCount > 50) { clearInterval(timer); setIsRunning(false); return; }
        
        const tile = grid[currentR.y][currentR.x];
        let action = 'ignore';
        
        // 3=Red, 4=Blue, 5=Yellow
        if (tile === 3) action = logicRules.red;
        if (tile === 4) action = logicRules.blue;
        if (tile === 5) action = logicRules.yellow;

        if (action === 'right') { currentR.dir = (currentR.dir + 1) % 4; sfx.play('turn'); }
        if (action === 'left') { currentR.dir = (currentR.dir - 1 + 4) % 4; sfx.play('turn'); }
        if (action === 'u-turn') { currentR.dir = (currentR.dir + 2) % 4; sfx.play('turn'); }

        // Move
        const next = getNextPos(currentR);
        const check = checkTile(next.x, next.y, grid);
        
        if (check === 'crash') {
            setMessage("CRASH!");
            sfx.play('lose');
            setIsRunning(false);
            clearInterval(timer);
        } else if (check === 'win') {
            setMessage("WIN!");
            sfx.play('win');
            setTimeout(() => setShowWinModal(true), 500);
            setIsRunning(false);
            clearInterval(timer);
        } else {
            currentR.x = next.x;
            currentR.y = next.y;
            sfx.play('move');
            setRobot({...currentR});
        }
        tickCount++;
     }, 500);
  };

  if (!level) return <div>Level not found</div>;

  // Render Helpers
  const renderCell = (x: number, y: number, type: number) => {
     let content = null;
     let bg = 'bg-slate-800/50';
     
     if (type === 1) { bg = 'bg-slate-700 shadow-inner'; content = <div className="w-full h-full border-2 border-slate-600 bg-slate-800"></div>; }
     if (type === 2) { content = <div className="text-xs text-slate-500">START</div>; }
     if (type === 9) { content = <Flag className="text-green-500 animate-bounce" fill="currentColor" />; bg = 'bg-green-900/20'; }
     if (type === 3) { content = level.id.includes('rescue') ? <Flame className="text-orange-500 animate-pulse" /> : <div className="w-full h-full bg-red-500/50 border border-red-500"></div>; } // Fire or Red Tile
     if (type === 4) { content = level.id.includes('rescue') ? <div className="text-2xl">💧</div> : <div className="w-full h-full bg-blue-500/50 border border-blue-500"></div>; } // Water or Blue Tile
     if (type === 5) { 
        content = level.category === 'Laboratorium Logika' 
        ? <div className="w-full h-full bg-yellow-500/50 border border-yellow-500"></div> 
        : <Key className="text-yellow-400 animate-pulse" />; 
     } // Key or Yellow
     if (type === 6) { bg = 'bg-red-900/50 border-red-500 border-2'; content = <Lock size={16} className="text-red-400" />; } // Door Closed
     if (type === 7) { bg = 'bg-green-900/50 border-green-500 border-2 border-dashed'; content = <Unlock size={16} className="text-green-400" />; } // Door Open

     return (
        <div key={`${x}-${y}`} className={`relative w-full h-full border border-slate-700/50 flex items-center justify-center ${bg}`}>
            {content}
        </div>
     );
  };

  return (
    <div className="min-h-full p-4 md:p-8 relative">
        {/* Win Modal */}
        {showWinModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <div className="bg-slate-800 border-2 border-green-500 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center animate-float relative">
                <div className="text-6xl mb-4 animate-bounce">🏆</div>
                <h2 className="text-3xl font-bold text-green-400 font-tech mb-2">Misi Selesai!</h2>
                <p className="text-slate-300 mb-6">Luar biasa! Kamu berhasil menyelesaikan tantangan ini.</p>
                
                <div className="space-y-3">
                    <button 
                        onClick={() => {
                            const currentIndex = levels.findIndex(l => l.id === id);
                            if (currentIndex < levels.length - 1) {
                                navigate(`/level/${levels[currentIndex + 1].id}`);
                            } else {
                                navigate('/');
                            }
                        }}
                        className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl shadow-lg transform transition hover:scale-105 flex items-center justify-center gap-2"
                    >
                       <Play size={20} fill="currentColor"/> Lanjut Level Berikutnya
                    </button>
                    
                    <button 
                        onClick={() => { setShowWinModal(false); resetLevel(); }}
                        className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-2 rounded-xl"
                    >
                        Ulangi Level Ini
                    </button>
                </div>
            </div>
          </div>
        )}

        {/* Help Modal */}
        {showHelp && !showWinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-800 border-2 border-yellow-400 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-float">
               <button onClick={() => setShowHelp(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={24}/></button>
               <h2 className="text-2xl font-bold text-yellow-400 font-tech mb-4 text-center">{level.title}</h2>
               
               <div className="space-y-4 text-slate-200">
                  <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                     <h3 className="font-bold text-blue-400 mb-2 flex items-center gap-2"><Target size={18}/> Misi Kamu</h3>
                     <p>{level.description}</p>
                  </div>

                  <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                     <h3 className="font-bold text-green-400 mb-2 flex items-center gap-2"><Brain size={18}/> Petunjuk</h3>
                     <p>{level.hint}</p>
                  </div>
                  
                   {/* Controls Legend */}
                   <div>
                      <h3 className="font-bold text-purple-400 mb-2 text-sm uppercase">Tombol Tersedia:</h3>
                      <div className="flex flex-wrap gap-2">
                          {level.palette.map(cmd => (
                              <span key={cmd} className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300 border border-slate-600 capitalize">
                                  {cmd === 'move' ? 'Maju' : cmd === 'turnLeft' ? 'Kiri' : cmd === 'turnRight' ? 'Kanan' : cmd === 'pick' ? 'Ambil' : cmd === 'use' ? 'Gunakan' : cmd === 'loop' ? 'Ulangi (Loop)' : cmd}
                              </span>
                          ))}
                          {level.category === 'Laboratorium Logika' && <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300 border border-slate-600">Aturan Logika (Panel Kiri)</span>}
                      </div>
                   </div>
               </div>

               <button 
                 onClick={() => { sfx.play('ui'); setShowHelp(false); }}
                 className="w-full mt-6 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold py-3 rounded-xl shadow-lg transform transition hover:scale-105"
               >
                 SIAP LAKSANAKAN! 🚀
               </button>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* LEFT: Game Board */}
            <div className="space-y-4">
                <div className="bg-slate-800 p-4 rounded-xl shadow-xl border border-slate-700">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold font-tech text-yellow-400 flex items-center gap-3">
                           {level.title}
                           <button onClick={() => setShowHelp(true)} className="text-slate-400 hover:text-white"><HelpCircle size={20}/></button>
                        </h2>
                        <div className="flex items-center gap-4">
                            {level.tools.variables && (
                                <div className="flex gap-2 bg-slate-900 px-3 py-1 rounded border border-slate-600">
                                    <span className="text-xs text-slate-400">Inventory:</span>
                                    {inventory === 'key' ? <Key size={16} className="text-yellow-400"/> : <span className="text-xs text-slate-600">Empty</span>}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="aspect-square w-full max-w-[500px] mx-auto relative bg-slate-900 rounded-lg p-2 grid" style={{ gridTemplateColumns: `repeat(${level.gridSize}, 1fr)` }}>
                        {grid.map((row, y) => row.map((cell, x) => renderCell(x, y, cell)))}
                        
                        {/* Robot */}
                        <div 
                            className="absolute transition-all duration-500 flex items-center justify-center z-10"
                            style={{
                                width: `${100/level.gridSize}%`,
                                height: `${100/level.gridSize}%`,
                                left: `${(robot.x/level.gridSize)*100}%`,
                                top: `${(robot.y/level.gridSize)*100}%`,
                                transform: `rotate(${robot.dir === 0 ? 0 : robot.dir === 1 ? 90 : robot.dir === 2 ? 180 : -90}deg)`
                            }}
                        >
                            <CuteRobot />
                        </div>
                    </div>
                </div>
                
                <div className={`p-4 rounded-lg text-center font-bold border ${statusColor.includes('red') ? 'bg-red-900/20 border-red-900' : 'bg-blue-900/20 border-blue-900'} ${statusColor}`}>
                    {message}
                </div>
            </div>

            {/* RIGHT: Coding Area */}
            <div className="bg-slate-800 p-6 rounded-xl shadow-xl border border-slate-700 flex flex-col h-[600px]">
                {level.category === 'Laboratorium Logika' ? (
                    // LOGIC LEVEL UI
                    <div className="space-y-6">
                        <h3 className="font-tech text-xl text-purple-400">Aturan Robot</h3>
                        {['red', 'blue', 'yellow'].map(color => (
                            <div key={color} className="bg-slate-700 p-3 rounded flex items-center gap-3">
                                <div className={`w-8 h-8 rounded ${color === 'red' ? 'bg-red-500' : color === 'blue' ? 'bg-blue-500' : 'bg-yellow-500'}`}></div>
                                <select 
                                    className="bg-slate-900 text-white p-2 rounded flex-1"
                                    value={logicRules[color as keyof typeof logicRules]}
                                    onChange={(e) => {
                                        sfx.play('ui');
                                        setLogicRules({...logicRules, [color]: e.target.value})
                                    }}
                                >
                                    <option value="ignore">Abaikan</option>
                                    <option value="right">Belok Kanan</option>
                                    <option value="left">Belok Kiri</option>
                                    <option value="u-turn">Putar Balik</option>
                                </select>
                            </div>
                        ))}
                         <button onClick={runProgram} className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg shadow-lg">
                            JALANKAN SIMULASI
                        </button>
                    </div>
                ) : (
                    // STANDARD CODING UI
                    <>
                    <div className="mb-4 space-y-2">
                        <div className="flex gap-2 flex-wrap">
                            {level.palette.map(cmd => (
                                <button 
                                    key={cmd}
                                    onClick={() => addCommand(cmd)}
                                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded shadow border-b-2 border-indigo-800 active:scale-95 flex items-center gap-2 text-sm font-bold"
                                >
                                    {cmd === 'move' && <><ArrowUp size={16}/> Maju</>}
                                    {cmd === 'turnLeft' && <><ArrowLeft size={16}/> Kiri</>}
                                    {cmd === 'turnRight' && <><ArrowRight size={16}/> Kanan</>}
                                    {cmd === 'pick' && <><Box size={16}/> Ambil</>}
                                    {cmd === 'use' && <><Zap size={16}/> Gunakan</>}
                                    {cmd === 'callPattern' && <><Zap size={16}/> Pola A</>}
                                    {cmd === 'loop' && <><RotateCcw size={16}/> Loop</>}
                                    {cmd === 'while' && <><RotateCcw size={16}/> Sampai Mentok</>}
                                </button>
                            ))}
                        </div>
                        {level.tools.patterns && (
                             <div className="p-2 bg-slate-900 rounded border border-pink-900/50">
                                <div className="text-xs text-pink-400 font-bold mb-1">EDITOR POLA A:</div>
                                <div className="flex gap-1 overflow-x-auto pb-1 min-h-[40px]">
                                    {patternCommands.map((c, i) => (
                                        <div key={i} className="bg-pink-700 text-white text-[10px] px-2 py-1 rounded">{c.type}</div>
                                    ))}
                                    <button onClick={() => addCommand('dummy', 'pattern')} className="text-xs text-slate-500 bg-slate-800 px-2 rounded">+</button>
                                </div>
                             </div>
                        )}
                        {level.tools.loops && !isRecordingLoop && (
                             <div className="flex gap-2 items-center bg-slate-900 p-2 rounded">
                                <span className="text-xs">Ulangi:</span>
                                <input type="number" value={loopCount} onChange={(e) => setLoopCount(parseInt(e.target.value))} className="w-12 bg-slate-800 text-center rounded" />
                                <button onClick={startLoopRecord} className="text-xs bg-purple-600 px-2 py-1 rounded">Mulai Loop</button>
                             </div>
                        )}
                        {level.tools.while && !isRecordingLoop && (
                             <button onClick={startLoopRecord} className="text-xs bg-orange-600 px-2 py-1 rounded w-full">Mulai While (Sampai Mentok)</button>
                        )}
                        {isRecordingLoop && (
                             <div className="bg-yellow-900/30 p-2 rounded border border-yellow-500 flex justify-between items-center">
                                <span className="text-xs text-yellow-200 animate-pulse">Merekam Loop... ({loopBuffer.length})</span>
                                <button onClick={() => saveLoop(level.tools.while ? 'while' : 'loop')} className="text-xs bg-yellow-600 px-2 py-1 rounded text-white">Selesai</button>
                             </div>
                        )}
                    </div>

                    <div className="flex-1 bg-slate-950 rounded-lg p-3 overflow-y-auto border border-slate-700 font-code text-sm">
                        {commands.length === 0 && <div className="text-slate-600 text-center mt-10">...menunggu perintah</div>}
                        {commands.map((cmd, i) => (
                            <div key={i} className={`p-2 mb-1 rounded flex items-center gap-2 ${activeCmdIndex === i ? 'bg-yellow-900/50 border border-yellow-500' : 'bg-slate-900'}`}>
                                <span className="text-slate-500 w-6">{i+1}.</span>
                                <span className={`font-bold ${cmd.type === 'loop' || cmd.type === 'while' ? 'text-purple-400' : 'text-blue-400'}`}>
                                    {cmd.type === 'while' ? 'SAMPAI MENTOK' : cmd.type.toUpperCase()}
                                    {cmd.type === 'move' && cmd.val && cmd.val > 1 ? ` (${cmd.val})` : ''}
                                    {cmd.type === 'loop' ? ` [${cmd.val}x]` : ''}
                                </span>
                                {cmd.body && <span className="text-xs text-slate-500">({cmd.body.length} langkah)</span>}
                                <button onClick={() => {
                                    const newCmds = [...commands];
                                    newCmds.splice(i, 1);
                                    setCommands(newCmds);
                                    sfx.play('ui');
                                }} className="ml-auto text-slate-600 hover:text-red-400"><Trash2 size={14}/></button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 flex gap-2">
                        <button onClick={runProgram} disabled={isRunning} className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2">
                            <Play size={20} fill="currentColor" /> JALANKAN
                        </button>
                        <button onClick={resetLevel} className="bg-slate-700 hover:bg-slate-600 text-white px-4 rounded-lg">
                            <RotateCcw size={20} />
                        </button>
                    </div>
                    </>
                )}
            </div>
        </div>
    </div>
  );
};

// Cute Robot Component (Unified Design)
const CuteRobot = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
        {/* Antenna */}
        <line x1="50" y1="20" x2="50" y2="10" stroke="#94a3b8" strokeWidth="3" />
        <circle cx="50" cy="8" r="4" fill="#ef4444" className="animate-pulse" />
        
        {/* Head */}
        <rect x="25" y="20" width="50" height="40" rx="10" fill="#3b82f6" stroke="#1e40af" strokeWidth="3" />
        
        {/* Face Screen */}
        <rect x="32" y="30" width="36" height="20" rx="5" fill="#0f172a" />
        
        {/* Eyes */}
        <circle cx="40" cy="40" r="4" fill="#38bdf8" className="animate-bounce" />
        <circle cx="60" cy="40" r="4" fill="#38bdf8" className="animate-bounce" />
        
        {/* Body */}
        <path d="M 30 65 L 70 65 L 75 90 L 25 90 Z" fill="#64748b" stroke="#334155" strokeWidth="3" />
        
        {/* Wheels/Tracks */}
        <rect x="20" y="85" width="10" height="10" rx="2" fill="#1e293b" />
        <rect x="70" y="85" width="10" height="10" rx="2" fill="#1e293b" />
        
        {/* Details */}
        <circle cx="50" cy="75" r="5" fill="#fbbf24" />
    </svg>
);

export default GameLevel;