const LINES = {
  dinner_1: [['HALO', 'AH. DINNER. MY FAVORITE TIME OF DAY.']],
  dinner_2: [['BELLATRIX', 'MINE NOW.'], ['KYLO', 'HI HALO. YOUR FOOD TASTES LIKE YOUR FOOD.']],
  dinner_3: [['HALO', 'THAT WAS MY DINNER. I HAD PLANS FOR IT.']],
  kidnap_1: [['SOLDIER', 'BY ORDER OF THE KING!|WE NEED YOUR HUNGRIEST KITTENS!']],
  kidnap_2: [['BELLATRIX', "PUT ME DOWN! I'M IN CHARGE HERE!"], ['KYLO', 'OOH. A BOAT.']],
  kidnap_3: [['HALO', 'HEY! THOSE ARE MY...|ANNOYING LITTLE... ROOMMATES!']],
  door_locked: [['HALO', 'NOT WITHOUT A WEAPON. OR A SNACK.|MOSTLY A WEAPON.']],
  sugar_gift_1: [['SUGAR', "MMF. THEY TOOK THE LITTLE ONES.|I SAW. I DIDN'T GET UP."], ['HALO', "THEY'RE OVER THE OCEAN!|I HATE THE OCEAN!"], ['SUGAR', 'TAKE THIS.']],
  sugar_gift_2: [['SUGAR', "IT'S FOR BUTTER. NOW IT'S FOR DOGS."], ['SUGAR', 'AND THIS.']],
  sugar_gift_3: [['HALO', "THAT'S THE FISHBOWL. WHERE'S THE FISH?"], ['SUGAR', "IT'S A HAT NOW."], ['SUGAR', 'ZZZ.']],
  sugar_idle_0: [['SUGAR', 'STILL HERE.']],
  sugar_idle_1: [['SUGAR', 'BRING ME A SNACK.']],
  sugar_idle_2: [['SUGAR', 'ZZZ.']],
  dock: [['HALO', 'I HATE THIS. I HATE ALL OF THIS.']],
  gnome: [['GNOME', '...']],
  moth: [['MOTH', 'LIGHT. LIGHT. LIGHT. LIGHT.']],
  cattree: [['HALO', 'MY THRONE. LATER.']],
  bowl_empty: [['HALO', 'EMPTY. LIKE MY HEART.']],
  hose: [['HALO', 'THE WATER SNAKE. MY NEMESIS.']],
  sign_shallows: 'SWIM: WASD. ATTACK: J. BURST: K.',
  sign_reef: "DON'T HIT THE SPIKY ONES WHILE SPIKY.",
  sign_castle: 'NO CATS. (EXCEPT THAT ONE.)',
  sign_castle2: 'NURSERY. SHH. (THEY BITE.)',
  sign_bone: 'BONE SHOP',
  sign_tower: 'SQUIRREL WATCH',
  sign_market: 'OUT OF FOOD',
  sign_snack: 'ROYAL SNACK FINDER',
  bb_intro: [['BABYBOO', "HIII! YOU'RE SO FLUFFY!|CAN I KEEP YOU?"], ['HALO', 'NO.'], ['BABYBOO', "THEN I'LL BITE YOU. IN A CUTE WAY."]],
  bb_phase: "NOW I'M ONLY A LITTLE CUTE!!",
  bb_defeat: [['BABYBOO', "WAAAH! YOU'RE MEAN!"], ['HALO', 'YOU BIT ME FOUR TIMES.']],
  rv_intro: [['ROVER', 'OH! A CAT! IN MY OCEAN! HAHAHA!'], ['HALO', 'WHY ARE YOU LAUGHING?'], ['ROVER', "I DON'T KNOW! HAHAHAHA!"]],
  rv_phase: 'HA! HA! OW! HA!',
  rv_defeat: [['ROVER', 'HAHA... HA... I NEED A NAP.'], ['HALO', 'WE ALL DO.']],
  ch_intro: [['CHERRY', 'YOU! CAT! YOU ATE PROFESSOR PLUM!'], ['HALO', "I DON'T EVEN LIKE SNAILS."], ['CHERRY', "THAT'S WHAT A SNAIL EATER WOULD SAY!"]],
  ch_phase: 'PLUUUUUM!!',
  ch_defeat: [['CHERRY', "FINE! BUT I'M WATCHING YOU!"]],
  plum: [['CHERRY', "THIS IS... PROFESSOR PLUM'S SHELL."], ['CHERRY', 'IT HAS CHICKEN BITE MARKS ON IT.'], ['HALO', "HUH. ALMOST LIKE I DIDN'T EAT HIM."], ['CHERRY', '...OH NO. I WAS WRONG.'], ['CHERRY', "SORRY I YELLED 'PLUM' AT YOU|FOURTEEN TIMES."], ['CHERRY', "GO GET HER. I'LL HOLD THE SHELL."]],
  ck_intro_1: [['CHICKEN', 'GRRRRMMMBBBLLLL.']],
  ck_intro_2: [['HALO', '...COOL. COOL COOL COOL.'], ['KYLO', "HI HALO! SHE'S NICE ONCE YOU|GET TO KNOW HER. SHE'S NOT."]],
  ck_phase: 'HHHNNNNGGGRRRHHH.',
  ck_defeat: [['CHICKEN', 'HNNNNGH...']],
  kylo_join_1: [['KYLO', 'HALO! I FELL OFF THE BOAT.|SHE LOCKED ME UP.'], ['KYLO', "I FOUND A BOOK. IT WAS WET.|NOW I'M MAGIC."]],
  kylo_join_2: [['HALO', "...OKAY. YOU'RE COMING WITH ME."]],
  town_arrive: [['HALO', 'I SMELL DOG.'], ['KYLO', 'I SMELL ADVENTURE.']],
  npc_beach: [['BEACH GUARD', 'HALT! WHO GOES THERE?'], ['BEACH GUARD', 'A CAT? OKAY. HAVE A NICE DAY.']],
  npc_squirrel: [['WATCHER', "DON'T TALK TO ME.|I'M WATCHING THE SQUIRREL."]],
  npc_market: [['MARKET DOG', "WE'RE OUT OF FOOD.|EVEN THE BAD FOOD."]],
  npc_tail: [['TAIL CHASER', 'ALMOST GOT IT.']],
  npc_hound: [['OLD HOUND', 'THE KING HAS BEEN... BIGGER LATELY.']],
  npc_pups: [['PUPPY', 'ARE YOU A DOG?'], ['PUPPY', "SHE'S A DOG."], ['PUPPY', "SHE'S A BIG DOG."]],
  npc_gate: [['GATE GUARD', 'THE CASTLE IS CLOSED.'], ['GATE GUARD', "...OKAY IT'S OPEN. I CAN'T SAY NO."]],
  npc_gate2: [['GATE GUARD', 'GO ON IN. WIPE YOUR PAWS.']],
  po_intro: [['QUEEN POLLY', 'A GUEST! HI GUEST! BYE GUEST!|HI AGAIN!'], ['HALO', 'CAN YOU STAND STILL?'], ['QUEEN POLLY', 'NEVER!!']],
  po_phase: 'MORE ZOOMIES!!',
  po_defeat: [['QUEEN POLLY', 'OKAY. OKAY. ROYAL NAP.']],
  lo_intro: [['LOLA', "YOU'RE TALL. I HATE TALL."], ['HALO', "I'M A NORMAL SIZE."], ['LOLA', 'SAYS YOU! BOING!']],
  lo_phase: 'DOUBLE BOING!!',
  lo_defeat: [['LOLA', "OKAY OKAY! I'LL TELL YOU EVERYTHING!"]],
  reveal: [['LOLA', "THE KING ATE ALL THE FOOD.|THE WHOLE KINGDOM'S."], ['LOLA', 'NOW HE NEEDS SNACK FINDERS.|THE HUNGRIEST KITTENS AROUND.'], ['KYLO', "THAT'S US. WE'RE VERY HUNGRY."], ['HALO', 'HE TOOK YOU TO FIND HIM SNACKS?!'], ['LOLA', "THRONE ROOM'S THAT WAY.|IT SMELLS LIKE HAM."]],
  dz_intro: [['KING DOZER', 'WELCOME TO MY CASTLE.|*CHOMP* SORRY. SNACK.'], ['HALO', 'GIVE BACK THE KITTEN.'], ['KING DOZER', 'NEVER! SHE FINDS THE BEST SNACKS!'], ['BELLATRIX', "HALO! YOU'RE LATE!"]],
  dz_phase: '*BUUURP* ...PARDON ME. ROYALLY.',
  dz_defeat: [['KING DOZER', 'OKAY... I MAY HAVE OVERDONE IT.'], ['HALO', 'YOU ATE A WHOLE KINGDOM.'], ['KING DOZER', 'IT WAS A SMALL KINGDOM.']],
  end_1: [['BELLATRIX', 'FINALLY. WHAT TOOK YOU SO LONG?']],
  end_2: [['KYLO', "BELLA! I'M MAGIC NOW!"], ['BELLATRIX', "NO YOU'RE NOT."]],
  end_3: [['BELLATRIX', '...OKAY YOU ARE.'], ['HALO', "LET'S GO HOME. I'M TAKING THE RAFT."]],
  end_4: [['CHERRY', "I'LL ESCORT YOU.|IT'S THE LEAST I CAN DO."], ['BELLATRIX', 'IS THERE FOOD ON THIS BOAT?'], ['HALO', 'NO.']],
  end_5: [['SUGAR', 'TOOK YOU LONG ENOUGH.'], ['HALO', '...']],
  crossing: ['THEY SWAM TO THE DOGLANDS.', 'HALO COMPLAINED THE WHOLE WAY.', 'THE WHOLE. WAY.'],
  endcard: 'HALO SAVED THE TWINS.|THEY ATE HER DINNER AGAIN.',
  bark_hurt: ['OW!', 'RUDE!', 'MY FUR!'],
  bark_water: 'WET. EVERYTHING IS WET.',
  bark_low: "I'M FINE. I'M DYING. I'M FINE.",
  bark_treat: 'OH YEAH.',
  quips: ['HALO IS FINE. HALO IS JUST DRAMATIC.', 'NINE LIVES. PROBABLY.', "SHE'LL BE BACK. LOUDER."],
  kylo_quips: ['I CAN SMELL COLORS.', 'SNACK?', 'MAGIC IS JUST WET READING.'],
  kylo_cage: ['GO HALO!', "I'M FINE. I HAVE A BOOK."],
  item_knife: ['GOT ' + KNIFE + '!', 'IT WAS FOR BUTTER.'],
  item_helmet: ['GOT THE FISHBOWL HELMET!', 'IT IS A HAT NOW.'],
  item_kylo: ['KYLO JOINED!', 'HE CASTS MAGIC ON HIS OWN.'],
  item_key: ['GOT THE CAGE KEY!', 'IT WAS IN HIS CROWN.'],
  title_hint: 'MOVE: WASD/ARROWS  JUMP: SPACE  ATTACK: J  DASH: K',
  debug_hint: 'DEBUG: 0-9, SHIFT+1-6',
  snack_time: 'SNACK TIME!',
  ready: 'READY'
};

const SPEAKERS = {
  HALO: { col: PAL.gold, pitch: 1, spr: 'halo_idle_0', pw: 12 },
  SUGAR: { col: '#9ad0ff', pitch: 0.8, spr: 'sugar_awake', pw: 20 },
  KYLO: { col: '#9ad0ff', pitch: 1.6, spr: 'kylo_idle_0', pw: 12 },
  BELLATRIX: { col: PAL.gold, pitch: 1.7, spr: 'bella_idle_0', pw: 12 },
  SOLDIER: { col: PAL.warn, pitch: 0.9, spr: 'soldier_walk_0', pw: 14 },
  GNOME: { col: PAL.gold, pitch: 1.2, spr: 'gnome', pw: 8 },
  MOTH: { col: PAL.gold, pitch: 2.0, spr: 'moth_0', pw: 6 },
  BABYBOO: { col: PAL.warn, pitch: 1.5, spr: 'bb_idle_0', pw: 18 },
  ROVER: { col: PAL.warn, pitch: 1.3, spr: 'rv_idle_0', pw: 18 },
  CHERRY: { col: PAL.warn, pitch: 1.0, spr: 'ch_idle_0', pw: 20 },
  CHICKEN: { col: PAL.warn, pitch: 0.45, spr: 'ck_idle_0', pw: 26 },
  'QUEEN POLLY': { col: PAL.warn, pitch: 1.2, spr: 'polly_idle_0', pw: 20 },
  LOLA: { col: PAL.warn, pitch: 1.6, spr: 'lola_idle_0', pw: 12 },
  'KING DOZER': { col: PAL.warn, pitch: 0.55, spr: 'dozer_idle_0', pw: 26 },
  'BEACH GUARD': { col: PAL.gold, pitch: 0.9, spr: 'npc0_idle_0', pw: 14 },
  WATCHER: { col: PAL.gold, pitch: 1.0, spr: 'npc1_idle_0', pw: 14 },
  'MARKET DOG': { col: PAL.gold, pitch: 1.0, spr: 'npc2_idle_0', pw: 14 },
  'TAIL CHASER': { col: PAL.gold, pitch: 1.1, spr: 'npc3_idle_0', pw: 14 },
  'OLD HOUND': { col: PAL.gold, pitch: 0.7, spr: 'npc4_idle_0', pw: 14 },
  PUPPY: { col: PAL.gold, pitch: 1.8, spr: 'pup0_idle_0', pw: 10 },
  'GATE GUARD': { col: PAL.gold, pitch: 0.85, spr: 'npc5_idle_0', pw: 14 }
};

function Grid(w, h, ch) { this.w = w; this.h = h; this.a = []; for (let y = 0; y < h; y++) this.a.push(new Array(w).fill(ch)); this.sp = []; this.rooms = []; this.trig = []; }
Grid.prototype.f = function (x, y, w, h, ch) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (i >= 0 && j >= 0 && i < this.w && j < this.h) this.a[j][i] = ch; return this; };
Grid.prototype.s = function (x, y, str) { for (let i = 0; i < str.length; i++) { const c = str[i]; if (c !== ' ' && x + i >= 0 && x + i < this.w && y >= 0 && y < this.h) this.a[y][x + i] = c; } return this; };
Grid.prototype.fe = function (x, y, w, h, ch, only) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (i >= 0 && j >= 0 && i < this.w && j < this.h && this.a[j][i] === only) this.a[j][i] = ch; return this; };
Grid.prototype.k = function (pts) { for (const p of pts) this.s(p[0], p[1], 'o'); return this; };
Grid.prototype.out = function () { return { tiles: this.a.map(r => r.join('')), spawns: this.sp, rooms: this.rooms, trig: this.trig }; };

function buildShallows() {
  const g = new Grid(170, 18, '.');
  g.f(0, 0, 170, 1, 'A').f(0, 1, 170, 1, '~').f(0, 16, 170, 2, '#').f(0, 2, 1, 14, '#').f(169, 2, 1, 14, '#');
  g.f(1, 13, 11, 3, '#').s(4, 12, 'P').s(2, 12, '1').s(10, 12, '1');
  g.sp.push({ t: 'sign', x: 8, y: 12, text: 'sign_shallows' });
  g.s(19, 8, 'm').k([[13, 10], [15, 7], [17, 12], [7, 8]]);
  g.f(22, 2, 19, 7, '#').f(24, 9, 3, 1, '#').f(33, 9, 4, 1, '#');
  g.s(26, 15, 'c').s(31, 15, 'c').s(38, 15, 'c').k([[24, 12], [29, 12], [34, 12], [39, 12]]);
  g.s(23, 15, '1').s(35, 15, '3');
  g.s(44, 5, 'j').s(48, 10, 'j').s(52, 4, 'j').s(56, 9, 'j').k([[46, 13], [50, 7], [54, 13]]);
  g.s(43, 15, '1').s(47, 15, '1').s(53, 15, '1').s(57, 15, '3');
  g.s(62, 15, 'C').s(60, 15, '1').s(65, 15, '2');
  g.f(66, 3, 23, 5, '>').f(76, 9, 8, 5, 'd').f(76, 15, 8, 1, '^').f(70, 12, 3, 4, '#');
  g.k([[69, 5], [73, 5], [77, 5], [81, 5], [85, 5]]);
  g.rooms.push({ x: 92, y: 0, waves: [[['c', 6, 15], ['c', 17, 15], ['j', 12, 7]], [['m', 12, 6]]] });
  g.f(101, 13, 2, 3, '#').f(108, 12, 1, 4, '#').k([[97, 10], [111, 9]]).s(95, 15, '1').s(105, 15, '2');
  g.f(117, 7, 6, 1, '#').s(117, 6, '^').s(122, 6, '^').k([[119, 5], [120, 5]]);
  g.rooms.push({ x: 124, y: 0, waves: [[['c', 5, 15], ['c', 18, 15], ['j', 11, 6]], [['c', 12, 15], ['m', 8, 5]]] });
  g.f(129, 12, 3, 4, '#').f(140, 14, 2, 2, '#').k([[134, 9], [144, 8]]).s(137, 15, '1');
  g.sp.push({ t: 'prop', x: 154, y: 15, spr: 'heartrock' });
  g.s(160, 13, 'H').k([[150, 10], [157, 7], [165, 9]]);
  g.f(163, 2, 6, 6, '#').f(163, 12, 6, 4, '#').f(168, 8, 1, 4, 'D').s(151, 15, '2').s(159, 15, '1');
  return g.out();
}
function buildReef() {
  const g = new Grid(180, 30, '.');
  g.f(0, 0, 180, 1, 'A').f(0, 1, 180, 1, '~').f(0, 26, 180, 4, '#').f(0, 2, 1, 24, '#').f(179, 2, 1, 24, '#');
  g.f(1, 22, 27, 4, '#').f(10, 20, 4, 2, '#').f(20, 2, 8, 3, '#').s(4, 21, 'P');
  g.sp.push({ t: 'sign', x: 7, y: 21, text: 'sign_reef' });
  g.s(15, 15, 'f').s(25, 12, 'f').k([[9, 18], [14, 12], [19, 16], [24, 18], [22, 8]]);
  g.s(2, 21, '2').s(16, 21, '2').s(22, 21, '1').s(26, 21, '2').s(11, 19, '2');
  g.f(28, 2, 24, 8, '#').f(28, 19, 24, 7, '#');
  g.s(33, 10, 'e').s(43, 10, 'e').s(38, 18, 'e').s(48, 18, 'e').k([[30, 14], [35, 14], [41, 14], [46, 14], [50, 12]]);
  g.f(52, 2, 36, 24, '.').f(56, 2, 2, 19, '#').f(62, 8, 2, 18, '#').f(68, 2, 2, 19, '#').f(74, 8, 2, 18, '#').f(80, 2, 2, 19, '#').f(86, 8, 2, 18, '#');
  g.s(58, 12, '^').s(67, 14, '^').s(70, 10, '^').s(79, 12, '^').s(73, 20, '^').s(61, 5, '^');
  g.s(65, 12, 'j').s(77, 14, 'j').s(71, 18, 'm');
  g.f(82, 4, 2, 17, 'd').f(84, 4, 2, 17, 'u');
  g.k([[53, 3], [60, 3], [66, 24], [72, 3], [78, 24], [84, 22], [59, 23], [65, 6]]);
  g.s(53, 25, '2').s(64, 25, '1').s(71, 25, '2').s(77, 25, '1').s(89, 25, '2');
  g.s(94, 25, 'C').s(91, 25, '1');
  g.f(98, 2, 24, 11, '#');
  g.rooms.push({ x: 98, y: 12, waves: [[['f', 6, 7], ['f', 17, 6], ['m', 12, 4]], [['e', 12, 13], ['c', 5, 13], ['c', 19, 13]]] });
  g.f(104, 23, 3, 3, '#').f(115, 22, 2, 4, '#').k([[101, 17], [118, 18]]);
  g.f(124, 24, 26, 2, '%').f(124, 17, 1, 7, '%').f(149, 17, 1, 7, '%').f(124, 13, 26, 1, '%').f(128, 13, 4, 1, '.');
  g.f(150, 2, 24, 11, '#');
  g.sp.push({ t: 'crab', x: 136, y: 23, chef: 1 });
  g.s(144, 23, 'e').s(140, 18, 'f').s(130, 8, 'j').s(138, 6, 'm');
  g.sp.push({ t: 'prop', x: 133, y: 20, spr: 'pot', bob: 1 }, { t: 'prop', x: 141, y: 17, spr: 'pot', bob: 1 }, { t: 'prop', x: 146, y: 21, spr: 'pot', bob: 1 });
  g.k([[127, 15], [135, 20], [143, 15], [126, 8], [141, 4], [146, 9]]);
  g.rooms.push({ x: 150, y: 12, waves: [[['j', 7, 5], ['j', 16, 7], ['f', 12, 9]], [['c', 5, 13], ['c', 18, 13], ['e', 11, 13]]] });
  g.f(157, 21, 2, 5, '#').f(163, 23, 2, 3, '#').k([[153, 17], [170, 16]]);
  g.f(174, 2, 5, 11, '#').s(176, 25, 'H').f(178, 13, 1, 13, 'D').k([[172, 20], [175, 18]]).s(173, 25, '2');
  return g.out();
}
function buildTrench() {
  const g = new Grid(36, 150, '#');
  g.f(8, 2, 20, 29, '.').s(17, 4, 'P');
  g.f(14, 6, 8, 23, 'd');
  for (const y of [9, 15, 21, 27]) g.s(8, y, '^');
  for (const y of [12, 18, 24]) g.s(27, y, '^');
  g.s(27, 15, 'e').s(11, 13, 'f').s(22, 24, 'm').k([[10, 7], [24, 10], [12, 20], [25, 27], [18, 30]]);
  g.f(6, 31, 24, 25, '.').f(6, 44, 6, 1, '#').f(24, 39, 6, 1, '#').f(20, 50, 5, 1, '#');
  g.s(10, 34, 'j').s(22, 37, 'j').s(14, 42, 'j').s(26, 46, 'j').s(11, 51, 'j').k([[7, 43], [28, 38], [18, 47], [8, 54]]);
  g.s(7, 43, '4').s(26, 38, '4').s(22, 49, '4');
  g.f(7, 57, 22, 16, '.').f(10, 56, 16, 1, '.').f(16, 73, 4, 1, '.');
  g.f(7, 66, 8, 1, '#').f(21, 63, 8, 1, '#');
  g.rooms.push({ x: 6, y: 56, waves: [[['f', 6, 5], ['f', 17, 6], ['m', 11, 9]], [['e', 1, 8], ['e', 22, 12]]] });
  g.k([[9, 65], [25, 62]]).s(12, 65, '4').s(23, 62, '4');
  g.f(7, 74, 22, 5, '.').s(10, 78, 'C').s(8, 78, '4');
  g.f(14, 79, 8, 21, '.').f(15, 80, 6, 19, 'u');
  g.s(14, 84, 'e').s(21, 89, 'e').s(14, 95, 'e').s(18, 92, 'j').s(17, 86, 'f').k([[16, 82], [19, 88], [16, 97]]);
  g.f(6, 100, 24, 7, '.').f(6, 105, 9, 2, '#');
  g.sp.push({ t: 'prop', x: 9, y: 104, spr: 'shell' });
  g.trig.push({ x: 6, y: 100, w: 24, h: 6, id: 'plum', once: 1 });
  g.f(7, 108, 22, 14, '.').f(16, 107, 13, 1, '.').f(20, 122, 4, 3, '.');
  g.rooms.push({ x: 6, y: 107, waves: [[['c', 4, 14], ['c', 18, 14], ['j', 11, 6]], [['c', 10, 14], ['j', 16, 8]]] });
  for (const x of [8, 13, 18, 26]) g.s(x, 121, '5');
  g.k([[9, 112], [27, 115]]);
  g.f(8, 125, 20, 15, '.').f(16, 131, 10, 1, '#').s(21, 130, 'H').k([[10, 128], [25, 134], [12, 142], [26, 143]]);
  g.f(8, 140, 20, 6, '.').s(10, 145, 'c').f(16, 146, 4, 2, 'D');
  g.sp.push({ t: 'rockgate', x: 14, y: 143, w: 8, h: 3 });
  g.s(9, 145, '5').s(25, 145, '5').s(24, 139, '4');
  return g.out();
}
function buildCastle1() {
  const g = new Grid(190, 24, '.');
  g.f(0, 0, 190, 2, '#').f(0, 20, 190, 4, '#').f(0, 2, 2, 18, '#').f(188, 2, 2, 18, '#');
  g.s(4, 19, 'P').s(16, 19, 'g').s(21, 19, 'g').k([[7, 18], [11, 17], [17, 17]]);
  g.sp.push({ t: 'sign', x: 8, y: 19, text: 'sign_castle' });
  for (const x of [6, 18, 38, 52, 72, 104, 118, 160, 180]) g.s(x, 4, '6');
  for (const x of [11, 30, 62, 90, 128, 146, 170]) g.s(x, 5, '7');
  for (const x of [26, 46, 84, 112, 138, 176]) g.s(x, 9, '9');
  g.s(24, 17, '====').s(29, 14, '====').s(34, 11, '====').s(39, 14, '====').f(44, 12, 2, 8, '#');
  g.s(30, 13, 'p').s(40, 19, 'p').k([[25, 16], [31, 12], [35, 10], [36, 10], [41, 13], [44, 11]]);
  g.s(47, 17, '===').f(50, 15, 4, 1, '#').s(52, 14, 'b').s(59, 17, '===').f(62, 15, 4, 1, '#').s(64, 14, 'b');
  g.f(55, 20, 3, 2, '.').f(55, 22, 3, 1, '^').f(67, 20, 2, 2, '.').f(67, 22, 2, 1, '^');
  g.s(48, 9, '8888').s(56, 8, '888').s(64, 9, '8888');
  g.k([[48, 16], [51, 14], [56, 17], [63, 14], [66, 18]]);
  g.s(73, 19, 'C');
  g.f(76, 2, 24, 5, '#').s(80, 16, '====').s(91, 16, '====').s(85, 13, '====');
  g.rooms.push({ x: 76, y: 6, waves: [[['g', 5, 13], ['g', 12, 13], ['g', 18, 13]], [['p', 6, 13], ['p', 17, 13], ['b', 11, 6]]] });
  g.k([[81, 15], [92, 15]]);
  g.f(106, 20, 18, 4, '.').f(114, 18, 2, 6, '#');
  g.sp.push({ t: 'bowl', x: 106, y: 18, dx: 64, dy: 0 }, { t: 'bowl', x: 116, y: 17, dx: 64, dy: 0 });
  g.s(114, 17, 'p').s(126, 19, 'p').k([[108, 16], [112, 15], [118, 14], [122, 15]]);
  g.f(132, 2, 24, 5, '#').s(142, 13, '====').s(135, 16, '===').s(150, 16, '===');
  g.rooms.push({ x: 132, y: 6, waves: [[['g', 6, 13], ['g', 17, 13], ['p', 12, 13]], [['g', 9, 13], ['b', 12, 6]]] });
  g.k([[136, 15], [151, 15]]);
  g.s(160, 17, '====').s(166, 15, '====').k([[161, 16], [167, 14], [168, 14], [175, 18], [178, 18], [171, 18]]);
  g.s(176, 19, 'H').f(185, 16, 2, 4, 'D');
  return g.out();
}
function buildCastle2() {
  const g = new Grid(30, 90, '.');
  g.f(0, 0, 30, 2, '#').f(0, 86, 30, 4, '#').f(0, 0, 2, 90, '#').f(28, 0, 2, 90, '#');
  g.s(5, 85, 'P');
  g.sp.push({ t: 'sign', x: 9, y: 85, text: 'sign_castle2' });
  const plat = [[7, 84, 8], [15, 82, 10], [20, 80, 7], [10, 78, 9], [3, 76, 7], [8, 74, 9], [17, 72, 10], [10, 70, 7], [4, 68, 6]];
  for (const q of plat) g.s(q[0], q[1], '='.repeat(q[2]));
  g.s(20, 81, 'g').s(12, 73, 'g').s(24, 71, 'b');
  g.k([[9, 83], [22, 79], [13, 77], [5, 75], [20, 71], [6, 67]]);
  g.f(2, 66, 26, 1, '#').s(10, 66, '====').s(5, 65, 'C').s(7, 65, 'O');
  g.s(16, 64, '====').s(12, 62, '====');
  g.f(2, 22, 2, 40, '#').f(26, 22, 2, 40, '#');
  g.f(4, 61, 22, 1, '#').s(12, 61, '====');
  for (const q of [[5, 57, 5], [18, 57, 5], [11, 55, 6], [4, 53, 5], [19, 53, 5], [11, 51, 6], [4, 49, 5], [19, 49, 5], [11, 47, 6], [4, 45, 5], [19, 45, 5]]) g.s(q[0], q[1], '='.repeat(q[2]));
  g.s(8, 60, 'O').s(20, 60, 'O');
  g.rooms.push({ x: 3, y: 44, waves: [[['p', 5, 16], ['p', 9, 16], ['p', 15, 16], ['p', 19, 16]], [['g', 6, 16], ['g', 17, 16], ['b', 10, 6]]] });
  g.k([[6, 56], [20, 56], [13, 50], [13, 46]]);
  g.f(4, 44, 22, 1, '#').s(13, 44, '====');
  g.s(5, 42, '=====').s(5, 40, '====');
  g.f(4, 39, 22, 1, '#').s(5, 39, '====');
  for (const q of [[5, 36, 5], [18, 36, 5], [11, 34, 6], [4, 32, 5], [19, 32, 5], [11, 30, 6], [4, 28, 5], [19, 28, 5], [11, 26, 6], [4, 24, 5], [19, 24, 5]]) g.s(q[0], q[1], '='.repeat(q[2]));
  g.s(9, 38, 'O').s(19, 38, 'O');
  g.rooms.push({ x: 3, y: 22, waves: [[['p', 4, 16], ['p', 12, 16], ['p', 19, 16]], [['g', 8, 16], ['p', 6, 16], ['p', 17, 16]]] });
  g.k([[7, 35], [21, 35], [13, 29], [13, 25]]);
  g.f(4, 22, 22, 1, '#').s(18, 22, '====');
  g.fe(2, 3, 26, 18, 'w', '.');
  for (const q of [[12, 20, 9], [18, 18, 8], [11, 16, 8], [17, 14, 8], [19, 12, 8], [12, 10, 8], [6, 8, 8]]) g.s(q[0], q[1], '='.repeat(q[2]));
  g.f(2, 6, 9, 1, '#').s(11, 6, '===');
  g.s(13, 15, 'b').s(24, 11, 'b');
  g.f(3, 4, 2, 2, 'D').s(8, 5, 'H');
  g.k([[14, 19], [21, 17], [15, 13], [22, 11], [14, 9], [9, 7], [25, 16]]);
  return g.out();
}
function arenaWater() {
  const g = new Grid(24, 18, '.');
  g.f(0, 0, 24, 1, 'A').f(0, 1, 24, 1, '~').f(0, 16, 24, 2, '#').f(0, 2, 1, 14, '#').f(23, 2, 1, 14, '#');
  return g;
}
function arenaLand() {
  const g = new Grid(24, 18, '.');
  g.f(0, 0, 24, 2, '#').f(0, 16, 24, 2, '#').f(0, 2, 1, 14, '#').f(23, 2, 1, 14, '#');
  return g;
}
function buildArenaBabyboo() { const g = arenaWater(); g.f(6, 13, 1, 3, '#').f(17, 13, 1, 3, '#').s(3, 15, 'P'); for (const x of [2, 10, 14, 21]) g.s(x, 15, '2'); g.s(8, 15, '1'); return g.out(); }
function buildArenaRover() { const g = arenaWater(); g.f(6, 6, 3, 2, '#').f(15, 10, 3, 2, '#').s(3, 15, 'P'); for (const x of [2, 9, 13, 20]) g.s(x, 15, '2'); g.s(16, 9, '2').s(7, 5, '2'); return g.out(); }
function buildArenaCherry() {
  const g = arenaWater(); g.f(0, 2, 2, 14, '#').f(22, 2, 2, 14, '#').s(4, 15, 'P').s(15, 15, '1').s(19, 15, '3');
  g.sp.push({ t: 'prop', x: 8, y: 15, spr: 'snailrock' });
  return g.out();
}
function buildArenaChicken() {
  const g = new Grid(24, 18, '.');
  g.f(0, 0, 24, 2, '#').f(0, 16, 24, 2, '#').f(0, 2, 1, 14, '#').f(23, 2, 1, 14, '#').s(3, 15, 'P');
  for (const x of [2, 7, 12, 19]) g.s(x, 15, '5'); g.s(5, 15, '4').s(16, 15, '4');
  return g.out();
}
function buildArenaPolly() { const g = arenaLand(); g.s(1, 13, '====').s(19, 13, '====').s(4, 15, 'P'); g.s(5, 5, '6').s(18, 5, '6').s(11, 4, '7'); return g.out(); }
function buildArenaLola() {
  const g = new Grid(24, 18, '.');
  g.f(0, 16, 24, 2, '#').f(0, 0, 1, 16, '#').f(23, 0, 1, 16, '#').s(3, 13, '====').s(17, 13, '====').s(10, 10, '====').s(4, 15, 'P');
  return g.out();
}
function buildArenaDozer() {
  const g = arenaLand(); g.s(4, 15, 'P');
  g.s(6, 5, '6').s(17, 5, '6').s(11, 4, '7');
  g.sp.push({ t: 'ledge', x: 3, y: 12.5, w: 3 }, { t: 'ledge', x: 16, y: 12.5, w: 3 });
  return g.out();
}

const SUGAR_POS = { x: 14 * 16 + 4, y: 5 * 16 + 10 };
function buildCatCountry() {
  const g = new Grid(40, 30, '.');
  const rng = mulberry32(7);
  for (let y = 0; y < 30; y++) for (let x = 0; x < 40; x++) if (rng() < 0.07) g.a[y][x] = 'f';
  g.f(22, 23, 12, 2, 's').f(32, 16, 3, 9, 's');
  g.f(24, 25, 16, 5, 'W').f(34, 17, 6, 8, 'W');
  g.f(0, 0, 40, 1, 'T').f(0, 29, 24, 1, 'T').f(0, 0, 1, 30, 'T').f(39, 0, 1, 17, 'T');
  g.f(1, 1, 17, 13, '#').f(2, 3, 15, 10, '_').f(7, 8, 6, 3, 'r').s(8, 13, '++');
  g.f(18, 1, 21, 1, 'F').f(18, 1, 1, 3, 'F');
  g.f(8, 14, 2, 6, ',').f(8, 20, 24, 2, ',').f(30, 20, 2, 4, ',').f(30, 24, 2, 5, 'k');
  g.s(10, 9, 'P');
  for (const p of [[21, 5], [22, 5], [22, 6], [26, 3], [36, 4], [37, 4], [37, 9], [3, 17], [4, 17], [3, 18], [12, 25], [13, 25], [5, 26], [18, 26], [27, 14], [36, 13], [2, 22], [15, 17]]) g.s(p[0], p[1], 'T');
  g.sp.push(
    { t: 'bowl', x: 4 * 16, y: 5 * 16 + 4, spr: 'bowl_blue', id: 'bowl_halo' },
    { t: 'bowl', x: 6 * 16, y: 5 * 16 + 4, spr: 'bowl_pink', id: 'bowl_bella' },
    { t: 'bowl', x: 8 * 16, y: 5 * 16 + 4, spr: 'bowl_full', id: 'bowl_kylo' },
    { t: 'prop', x: 16 * 16, y: 4 * 16 + 4, spr: 'heater', solid: [18, 6] },
    { t: 'prop', x: SUGAR_POS.x, y: SUGAR_POS.y + 2, spr: 'cushion', solid: [34, 8], under: 1 },
    { t: 'sugar', x: SUGAR_POS.x, y: SUGAR_POS.y },
    { t: 'prop', x: 15 * 16, y: 12 * 16 + 8, spr: 'cattree', solid: [20, 8], talk: 'cattree' },
    { t: 'prop', x: 27 * 16, y: 11 * 16, spr: 'gnome', solid: [10, 6], talk: 'gnome' },
    { t: 'prop', x: 20 * 16, y: 15 * 16, spr: 'hose', talk: 'hose' },
    { t: 'prop', x: 11 * 16 + 8, y: 14 * 16 - 6, spr: 'plight', under: 0, high: 1 },
    { t: 'moth', x: 11 * 16 + 8, y: 14 * 16 - 14 },
    { t: 'door', x: 9 * 16, y: 14 * 16, tx: 8, ty: 13 }
  );
  g.k([[5, 10], [12, 4], [20, 8], [24, 12], [33, 6], [28, 17], [14, 22], [20, 26], [35, 11], [26, 19]]);
  g.trig.push({ x: 30, y: 27, w: 2, h: 2, id: 'dock', once: 1 });
  return g.out();
}
function buildDogTown() {
  const g = new Grid(48, 36, '.');
  const rng = mulberry32(11);
  for (let y = 4; y < 29; y++) for (let x = 0; x < 48; x++) if (rng() < 0.06) g.a[y][x] = 'f';
  g.f(0, 29, 48, 4, 's').f(0, 33, 48, 3, 'W');
  g.f(0, 0, 48, 4, 'Q').f(22, 2, 4, 2, 'G');
  g.f(22, 4, 4, 25, ',').f(17, 10, 14, 6, 'p');
  g.f(10, 19, 8, 3, 'R').f(10, 22, 8, 3, 'B');
  g.f(36, 6, 8, 3, 'R').f(36, 9, 8, 3, 'B').f(36, 15, 7, 3, 'R').f(36, 18, 7, 2, 'B');
  g.f(2, 7, 11, 1, 'F').f(2, 16, 11, 1, 'F').f(2, 7, 1, 10, 'F').f(12, 7, 1, 10, 'F').f(12, 11, 1, 2, '.');
  g.f(0, 4, 1, 25, 'T').f(47, 4, 1, 25, 'T');
  g.s(24, 31, 'P');
  for (const p of [[15, 6], [16, 6], [30, 6], [44, 13], [45, 13], [5, 22], [6, 22], [18, 27], [3, 26], [44, 24], [34, 13], [19, 7]]) g.s(p[0], p[1], 'T');
  g.sp.push(
    { t: 'prop', x: 24 * 16, y: 13 * 16 + 4, spr: 'fountain', solid: [36, 12] },
    { t: 'prop', x: 32 * 16, y: 26 * 16, spr: 'tower', solid: [30, 12], label: 'sign_tower' },
    { t: 'prop', x: 30 * 16, y: 28 * 16, spr: 'stall', solid: [40, 10], label: 'sign_market' },
    { t: 'prop', x: 36 * 16, y: 28 * 16, spr: 'stall', solid: [40, 10], label: 'sign_market' },
    { t: 'prop', x: 42 * 16, y: 28 * 16, spr: 'stall', solid: [40, 10], label: 'sign_market' },
    { t: 'label', x: 14 * 16, y: 19 * 16 + 10, text: 'sign_bone' },
    { t: 'npc', x: 27 * 16, y: 30 * 16 + 8, k: 0, line: 'npc_beach' },
    { t: 'npc', x: 29 * 16, y: 25 * 16, k: 1, line: 'npc_squirrel' },
    { t: 'npc', x: 36 * 16, y: 28 * 16 + 14, k: 2, line: 'npc_market' },
    { t: 'npc', x: 15 * 16, y: 27 * 16, k: 3, line: 'npc_tail', spin: 1 },
    { t: 'npc', x: 19 * 16, y: 17 * 16, k: 4, line: 'npc_hound' },
    { t: 'npc', x: 6 * 16, y: 19 * 16, pup: 0, line: 'npc_pups' },
    { t: 'npc', x: 7 * 16 + 6, y: 19 * 16 + 8, pup: 1, line: 'npc_pups' },
    { t: 'npc', x: 8 * 16 + 12, y: 19 * 16, pup: 2, line: 'npc_pups' },
    { t: 'npc', x: 27 * 16, y: 5 * 16 + 8, k: 5, line: 'npc_gate', gate: 1 },
    { t: 'parkball', x: 7 * 16, y: 12 * 16 },
    { t: 'portcullis', x: 24 * 16, y: 4 * 16 }
  );
  g.k([[4, 10], [9, 13], [20, 8], [28, 8], [33, 12], [40, 14], [45, 20], [8, 24], [20, 26], [27, 20], [38, 23], [12, 30], [35, 31], [4, 30], [42, 4]]);
  g.trig.push({ x: 22, y: 3, w: 4, h: 1, id: 'gate_exit' });
  return g.out();
}

const AREAS = {
  title: { view: 'title', music: 'title' },
  cat_country: { name: 'CAT COUNTRY', sub: 'HOME, SWEET HOME', view: 'topdown', pal: 'cat', music: 'home', build: buildCatCountry, onEnter: 'cat_enter', kylo: false },
  shallows: { name: 'FISHTANK OCEAN', sub: 'THE SHALLOWS', view: 'side', water: true, pal: 'shallows', bg: 'shallows', music: 'ocean', build: buildShallows, onEnter: 'water_enter' },
  boss_babyboo: { view: 'boss', water: true, pal: 'shallows', bg: 'shallows', music: 'boss_fish', build: buildArenaBabyboo, boss: 'babyboo', bx: 16 * 16, by: 9 * 16, name: 'BABYBOO', sub: 'THE CUTEST MENACE', intro: 'bb_intro', phase: 'bb_phase', defeat: 'bb_defeat' },
  reef: { name: 'FISHTANK OCEAN', sub: 'THE REEF', view: 'side', water: true, pal: 'reef', bg: 'reef', music: 'ocean', build: buildReef },
  boss_rover: { view: 'boss', water: true, pal: 'reef', bg: 'reef', music: 'boss_fish', build: buildArenaRover, boss: 'rover', bx: 18 * 16, by: 6 * 16, name: 'ROVER', sub: 'THE GIGGLING TORPEDO', intro: 'rv_intro', phase: 'rv_phase', defeat: 'rv_defeat' },
  boss_cherry: { view: 'boss', water: true, pal: 'reef', bg: 'rim', music: 'boss_fish', build: buildArenaCherry, boss: 'cherry', bx: 17 * 16, by: 11 * 16, name: 'CHERRY', sub: 'THE FURIOUS FRIEND', intro: 'ch_intro', phase: 'ch_phase', defeat: 'ch_defeat' },
  trench: { name: 'FISHTANK OCEAN', sub: "CHICKEN'S TRENCH", view: 'side', water: true, pal: 'trench', bg: 'trench', music: 'trench', build: buildTrench, dark: [0.2, 0.6], cam: 'down', rumble: 1 },
  boss_chicken: { view: 'boss', water: true, pal: 'lair', bg: 'lair', music: 'chicken', build: buildArenaChicken, boss: 'chicken', bx: 15 * 16, by: 16 * 16, name: 'CHICKEN', sub: 'THE THING IN THE TRENCH', intro: 'ck_intro', phase: 'ck_phase', defeat: 'ck_defeat', dark: [0.45, 0.45], noSurface: 1 },
  card_crossing: { view: 'card', music: 'ocean' },
  dog_town: { name: 'THE DOGLANDS', sub: 'DOG TOWN', view: 'topdown', pal: 'town', music: 'dogtown', build: buildDogTown, onEnter: 'town_enter' },
  castle_1: { name: "KING DOZER'S CASTLE", sub: 'THE GREAT HALLS', view: 'side', pal: 'castle', bg: 'castle', music: 'castle', build: buildCastle1 },
  boss_polly: { view: 'boss', pal: 'castle', bg: 'ballroom', music: 'boss_dog', build: buildArenaPolly, boss: 'polly', bx: 16 * 16, by: 16 * 16, name: 'QUEEN POLLY', sub: 'HER ROYAL ZOOMINESS', intro: 'po_intro', phase: 'po_phase', defeat: 'po_defeat' },
  castle_2: { name: "KING DOZER'S CASTLE", sub: 'THE TALL TOWER', view: 'side', pal: 'castle', bg: 'tower', music: 'castle', build: buildCastle2, cam: 'up' },
  boss_lola: { view: 'boss', pal: 'roof', bg: 'roof', music: 'boss_dog', build: buildArenaLola, boss: 'lola', bx: 17 * 16, by: 16 * 16, name: 'LOLA', sub: 'THE SKY POUNCER', intro: 'lo_intro', phase: 'lo_phase', defeat: 'lo_defeat' },
  boss_dozer: { view: 'boss', pal: 'castle', bg: 'throne', music: 'dozer', build: buildArenaDozer, boss: 'dozer', bx: 15 * 16, by: 16 * 16, name: 'KING DOZER', sub: 'RULER OF ALL SNACKS', intro: 'dz_intro', phase: 'dz_phase', defeat: 'dz_defeat' },
  ending: { view: 'cutscene', music: 'home' },
  end: { view: 'end', music: 'end' }
};
const ORDER = ['cat_country', 'shallows', 'boss_babyboo', 'reef', 'boss_rover', 'boss_cherry', 'trench', 'boss_chicken', 'card_crossing', 'dog_town', 'castle_1', 'boss_polly', 'castle_2', 'boss_lola', 'boss_dozer', 'ending', 'end'];
const ENEMY_CH = { c: 'crab', j: 'jelly', f: 'puffer', e: 'eel', m: 'swarm', g: 'pdog', p: 'puppy', b: 'bdog' };
for (const id in AREAS) AREAS[id].id = id;
function areaData(id) { const A = AREAS[id]; if (!A.build) return null; if (!A.data) A.data = A.build(); return A.data; }
function countKibble() {
  let n = 0;
  for (const id of ORDER) {
    const d = areaData(id); if (!d) continue;
    const td = AREAS[id].view === 'topdown';
    for (const r of d.tiles) for (const ch of r) { if (ch === 'o') n++; else if (ch === 'm' && !td) n += 3; }
    for (const rm of d.rooms) for (const wv of rm.waves) for (const s of wv) if (s[0] === 'm') n += 3;
  }
  return n;
}
