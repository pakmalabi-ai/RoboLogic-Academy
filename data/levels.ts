
// This file contains the configuration for all game levels
// Grid Legend:
// 0: Floor, 1: Wall, 2: Start, 9: Goal
// 3: Red(Fire), 4: Blue(Water), 5: Yellow(Key)
// 6: Door Closed, 7: Door Open

export type GridType = number[][];
export type CommandType = 'move' | 'turnLeft' | 'turnRight' | 'pick' | 'use' | 'callPattern' | 'loop' | 'while' | 'if';

export interface LevelConfig {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  description: string;
  grid: GridType;
  gridSize: number;
  startDir: number; // 0: Up, 1: Right, 2: Down, 3: Left
  maxCommands?: number;
  tools: {
    basic: boolean;
    params?: boolean; // Number input for move
    loops?: boolean; // For Loop
    while?: boolean; // While Loop
    variables?: boolean; // Pick/Use
    patterns?: boolean; // Function def
    logic?: boolean; // If/Else simulation or conditional tools
  };
  palette: CommandType[];
  initialCode?: any[]; // For debug levels
  hint: string;
  theme: 'mars' | 'cyber' | 'cave' | 'jungle' | 'space' | 'lab';
}

// Helper to create simple grids (0=Floor, 1=Wall)
// S=Start(2), F=Finish(9), W=Wall(1), .=Floor(0), R=Red(3), B=Blue(4), Y=Key(5), D=Door(6)
const g = (layout: string[]): number[][] => {
  const map: Record<string, number> = { '.': 0, 'W': 1, 'S': 2, 'F': 9, 'R': 3, 'B': 4, 'Y': 5, 'D': 6 };
  return layout.map(row => row.split('').map(char => map[char] ?? 0));
};

export const levels: LevelConfig[] = [
  // --- 1. Misi Robot Mars (Basic) ---
  {
    id: 'mars-1', category: 'Misi Robot Mars', title: 'Level 1: Langkah Pertama', subtitle: 'Dasar Gerakan',
    description: 'Halo Kapten Kecil! Bantu robot maju ke bendera hijau.',
    gridSize: 5, startDir: 1, theme: 'mars', tools: { basic: true }, palette: ['move'],
    hint: 'Klik "Maju" 2 kali, lalu tekan tombol hijau "Jalankan".',
    grid: g([
      '.....', 
      '.....', 
      'S.F..', 
      '.....', 
      '.....'
    ])
  },
  {
    id: 'mars-2', category: 'Misi Robot Mars', title: 'Level 2: Belok Kiri', subtitle: 'Dasar Gerakan',
    description: 'Benderanya ada di atas! Robot harus belok.',
    gridSize: 5, startDir: 1, theme: 'mars', tools: { basic: true }, palette: ['move', 'turnLeft'],
    hint: 'Maju sampai belokan -> Belok Kiri -> Maju lagi.',
    grid: g([
      '..F..', 
      '.....', 
      'S....', 
      '.....', 
      '.....'
    ])
  },
  {
    id: 'mars-3', category: 'Misi Robot Mars', title: 'Level 3: Belok Kanan', subtitle: 'Dasar Gerakan',
    description: 'Ada tembok menghalangi jalan. Belok kanan ya!',
    gridSize: 5, startDir: 1, theme: 'mars', tools: { basic: true }, palette: ['move', 'turnLeft', 'turnRight'],
    hint: 'Maju, Kanan, Maju, Kiri, Maju. Pelan-pelan saja.',
    grid: g([
      '.....', 
      '.....', 
      'S.W.F', 
      '..W..', 
      '.....'
    ])
  },
  {
    id: 'mars-4', category: 'Misi Robot Mars', title: 'Level 4: Putar Balik', subtitle: 'Kombinasi Gerak',
    description: 'Benderanya tertinggal di belakang. Putar balik!',
    gridSize: 5, startDir: 1, theme: 'mars', tools: { basic: true }, palette: ['move', 'turnLeft', 'turnRight'],
    hint: 'Belok Kanan 2 kali untuk putar balik.',
    grid: g([
      '.....', 
      '.....', 
      'F...S', 
      '.....', 
      '.....'
    ])
  },
  {
    id: 'mars-5', category: 'Misi Robot Mars', title: 'Level 5: Jalan Ular', subtitle: 'Tantangan',
    description: 'Jalannya zig-zag seperti ular. Ikuti kotaknya.',
    gridSize: 5, startDir: 0, theme: 'mars', tools: { basic: true }, palette: ['move', 'turnLeft', 'turnRight'],
    hint: 'Maju, Kiri, Maju, Kanan. Ulangi sampai bendera.',
    grid: g([
      '..F..', 
      '..W..', 
      '.W...', 
      '..W..', 
      '..S..'
    ])
  },

  // --- 2. Robot Kota Cyber (Patterns) ---
  {
    id: 'cyber-1', category: 'Robot Kota Cyber', title: 'Level 1: Pola Maju', subtitle: 'Pengenalan Pola',
    description: 'Kita buat "Pola A" supaya tidak capek mengetik Maju berkali-kali.',
    gridSize: 6, startDir: 1, theme: 'cyber', tools: { basic: true, patterns: true }, palette: ['move', 'callPattern'],
    hint: '1. Isi Pola A: "Maju, Maju".\n2. Kode Utama: Panggil "Pola A" 2 kali.',
    grid: g([
      '......', 
      '......', 
      'S...F.', 
      '......', 
      '......', 
      '......'
    ])
  },
  {
    id: 'cyber-2', category: 'Robot Kota Cyber', title: 'Level 2: Pola Tangga', subtitle: 'Pola Berulang',
    description: 'Ayo naik tangga! Kita buat 1 pola anak tangga, lalu panggil berulang-ulang.',
    gridSize: 6, startDir: 0, theme: 'cyber', tools: { basic: true, patterns: true }, palette: ['move', 'turnLeft', 'turnRight', 'callPattern'],
    hint: 'Isi Pola A: Maju, Kanan, Maju, Kiri.\nKode Utama: Pola A, Pola A, Pola A.',
    grid: g([
      '...F..', 
      '..W...', 
      '.W....', 
      'S.....', 
      '......', 
      '......'
    ])
  },
  {
    id: 'cyber-3', category: 'Robot Kota Cyber', title: 'Level 3: Pola Kotak', subtitle: 'Geometri',
    description: 'Robot patroli keliling kotak. Gunakan pola sisi kotak.',
    gridSize: 5, startDir: 1, theme: 'cyber', tools: { basic: true, patterns: true }, palette: ['move', 'turnLeft', 'callPattern'],
    hint: 'Isi Pola A: Maju, Maju, Kiri.\nKode Utama: Panggil Pola A 4 kali.',
    grid: g([
      '.....', 
      '.W.W.', 
      '.W.W.', 
      'S.W.F', 
      '.....'
    ])
  },
  {
    id: 'cyber-4', category: 'Robot Kota Cyber', title: 'Level 4: Lari Cepat', subtitle: 'Efisiensi',
    description: 'Jalan lurus panjang. Buat pola lari cepat!',
    gridSize: 8, startDir: 1, theme: 'cyber', tools: { basic: true, patterns: true }, palette: ['move', 'callPattern'],
    hint: 'Isi Pola A: Maju, Maju, Maju, Maju.\nKode Utama: Pola A.',
    grid: g([
      '........', 
      '........', 
      'S...F...', 
      '........', 
      '........', 
      '........', 
      '........', 
      '........'
    ])
  },
  {
    id: 'cyber-5', category: 'Robot Kota Cyber', title: 'Level 5: Pola Rahasia', subtitle: 'Master Pola',
    description: 'Cari pola gerakan yang berulang di jalan ini.',
    gridSize: 6, startDir: 1, theme: 'cyber', tools: { basic: true, patterns: true }, palette: ['move', 'turnLeft', 'turnRight', 'callPattern'],
    hint: 'Pola A: Maju, Kiri, Maju, Kanan.\nPanggil Pola A sampai finish.',
    grid: g([
      '..F...', 
      '..W...', 
      '.W....', 
      '..W...', 
      '..S...', 
      '......'
    ])
  },

  // --- 3. Laboratorium Logika (Rules) ---
  {
    id: 'logic-1', category: 'Laboratorium Logika', title: 'Level 1: Lantai Merah', subtitle: 'Aturan Warna',
    description: 'Robot otomatis! Kalau kena MERAH, dia harus Belok KANAN.',
    gridSize: 5, startDir: 1, theme: 'lab', tools: { basic: false, logic: true }, palette: [],
    hint: 'Di panel kiri, setel "Merah" jadi "Belok Kanan". Lalu jalankan.',
    grid: g([
      '.....',
      '.....',
      'S.R..', 
      '..F..',
      '.....'
    ])
  },
  {
    id: 'logic-2', category: 'Laboratorium Logika', title: 'Level 2: Dua Warna', subtitle: 'Aturan Warna',
    description: 'Merah artinya Kanan. Biru artinya Kiri.',
    gridSize: 5, startDir: 1, theme: 'lab', tools: { basic: false, logic: true }, palette: [],
    hint: 'Merah = Belok Kanan.\nBiru = Belok Kiri.',
    grid: g([
      'S.R..', 
      '..B.F',
      '.....',
      '.....',
      '.....'
    ])
  },
  {
    id: 'logic-3', category: 'Laboratorium Logika', title: 'Level 3: Lantai Pantul', subtitle: 'Aturan Warna',
    description: 'Lantai KUNING itu memantul! Robot harus Putar Balik.',
    gridSize: 5, startDir: 1, theme: 'lab', tools: { basic: false, logic: true }, palette: [],
    hint: 'Kuning = Putar Balik.\nBiru = Belok Kanan (agar naik ke bendera).',
    grid: g([
      'F....',
      'B.S.Y',
      '.....',
      '.....',
      '.....'
    ])
  },
  {
    id: 'logic-4', category: 'Laboratorium Logika', title: 'Level 4: Zig Zag Otomatis', subtitle: 'Simulasi',
    description: 'Robot jalan zig-zag sendiri. Tentukan arah beloknya.',
    gridSize: 6, startDir: 1, theme: 'lab', tools: { basic: false, logic: true }, palette: [],
    hint: 'Biru = Kiri (Naik).\nMerah = Kanan (Lurus/Bawah).',
    grid: g([
      '...R.F',
      '......',
      '.R.B..',
      '......',
      'SB....', 
      '......'
    ])
  },
  {
    id: 'logic-5', category: 'Laboratorium Logika', title: 'Level 5: Labirin Warna', subtitle: 'Master Logika',
    description: 'Ikuti jejak warna untuk keluar dari labirin.',
    gridSize: 6, startDir: 1, theme: 'lab', tools: { basic: false, logic: true }, palette: [],
    hint: 'Merah = Belok Kanan.\nBiru = Belok Kiri.',
    grid: g([
      'S.R...', 
      '......', 
      '..B.R.', 
      '......', 
      '....BF',
      '......'
    ])
  },

  // --- 4. Robot Gudang Data (Variables) ---
  {
    id: 'data-1', category: 'Robot Gudang Data', title: 'Level 1: Cari Kunci', subtitle: 'Menyimpan Benda',
    description: 'Pintu terkunci! Ambil Kunci di atas, lalu kembali ke Pintu.',
    gridSize: 5, startDir: 1, theme: 'cyber', tools: { basic: true, variables: true }, palette: ['move', 'turnLeft', 'turnRight', 'pick', 'use'],
    hint: 'Belok Kiri ke Kunci -> Ambil -> Balik ke Pintu -> Gunakan.',
    grid: g([
      '.Y...',
      '.W...',
      'S...D.F',
      '.....',
      '.....'
    ])
  },
  {
    id: 'data-2', category: 'Robot Gudang Data', title: 'Level 2: Kunci Tertinggal', subtitle: 'Menyimpan Benda',
    description: 'Waduh, Kuncinya ada di belakangmu! Putar balik dulu.',
    gridSize: 6, startDir: 1, theme: 'cyber', tools: { basic: true, variables: true }, palette: ['move', 'turnLeft', 'pick', 'use'],
    hint: '1. Putar balik (Kiri 2x)\n2. Ambil Kunci\n3. Putar balik lagi\n4. Buka Pintu',
    grid: g([
      '......',
      'Y.S.D.F', 
      '......', 
      '......', 
      '......',
      '......'
    ])
  },
  {
    id: 'data-3', category: 'Robot Gudang Data', title: 'Level 3: Ruang Rahasia', subtitle: 'Menyimpan Benda',
    description: 'Kunci disimpan di dalam ruangan khusus. Masuk dan ambil.',
    gridSize: 6, startDir: 1, theme: 'cyber', tools: { basic: true, variables: true }, palette: ['move', 'turnRight', 'turnLeft', 'pick', 'use'],
    hint: 'Masuk ruangan bawah -> Ambil Kunci -> Keluar -> Buka Pintu.',
    grid: g([
      'WWWWWW',
      '....DF', 
      'S.WWWW', 
      '..W...', 
      '.YW...', 
      'WWWWWW'
    ])
  },
  {
    id: 'data-4', category: 'Robot Gudang Data', title: 'Level 4: Tembok Pemisah', subtitle: 'Menyimpan Benda',
    description: 'Kunci dan Pintu dipisahkan tembok panjang. Jangan malas berjalan!',
    gridSize: 6, startDir: 1, theme: 'cyber', tools: { basic: true, variables: true }, palette: ['move', 'turnLeft', 'turnRight', 'pick', 'use'],
    hint: 'Ambil Kunci di pojok atas. Lalu jalan memutar ke pintu di bawah.',
    grid: g([
      'Y.....', 
      '..WWWW', 
      'S.W..F', 
      '..D...', 
      '..WWWW', 
      '......'
    ])
  },
  {
    id: 'data-5', category: 'Robot Gudang Data', title: 'Level 5: Labirin Kunci', subtitle: 'Tantangan',
    description: 'Gudang ini tertutup rapat. Cari kunci di lorong sempit.',
    gridSize: 7, startDir: 1, theme: 'cyber', tools: { basic: true, variables: true }, palette: ['move', 'turnLeft', 'turnRight', 'pick', 'use'],
    hint: 'Masuk lorong ambil Kunci. Mundur, lalu cari Pintu.',
    grid: g([
      'WWWWWWW', 
      'W.Y...W', 
      'W.WWW.W', 
      'S...D.F', 
      'W.WWW.W', 
      'W.....W', 
      'WWWWWWW'
    ])
  },

  // --- 5. Robot Tambang (Loops) ---
  {
    id: 'mine-1', category: 'Robot Tambang', title: 'Level 1: Sihir Loop', subtitle: 'Perulangan',
    description: 'Capek klik Maju terus? Pakai tombol "Loop" (Ulangi).',
    gridSize: 6, startDir: 1, theme: 'space', tools: { basic: true, loops: true }, palette: ['move', 'loop'],
    hint: 'Klik "Loop", isi angka 4. Masukkan "Maju" ke dalam kotak Loop.',
    grid: g([
      '......', 
      '......', 
      'S...F.', 
      '......', 
      '......', 
      '......'
    ])
  },
  {
    id: 'mine-2', category: 'Robot Tambang', title: 'Level 2: Tangga Loop', subtitle: 'Perulangan',
    description: 'Naik tangga menggunakan Loop. Kodenya jadi rapi.',
    gridSize: 6, startDir: 1, theme: 'space', tools: { basic: true, loops: true }, palette: ['move', 'turnLeft', 'turnRight', 'loop'],
    hint: 'Loop 3 kali. Isinya: Maju, Kiri, Maju, Kanan.',
    grid: g([
      '....F.', 
      '...W..', 
      '..W...', 
      '.W....', 
      'S.....', 
      '......'
    ])
  },
  {
    id: 'mine-3', category: 'Robot Tambang', title: 'Level 3: Keliling Batu', subtitle: 'Perulangan',
    description: 'Ayo kelilingi batu kotak besar ini.',
    gridSize: 5, startDir: 0, theme: 'space', tools: { basic: true, loops: true }, palette: ['move', 'turnLeft', 'loop'],
    hint: 'Loop 4 kali. Isinya: Maju, Maju, Kiri.',
    grid: g([
      '.....', 
      '.W.W.', 
      '.W.W.', 
      'F.W.S', 
      '.....'
    ])
  },
  {
    id: 'mine-4', category: 'Robot Tambang', title: 'Level 4: Lorong Tambang', subtitle: 'Perulangan',
    description: 'Lorong panjang berliku. Gunakan Loop.',
    gridSize: 8, startDir: 1, theme: 'space', tools: { basic: true, loops: true }, palette: ['move', 'turnLeft', 'turnRight', 'loop'],
    hint: 'Ada 3 belokan. Loop 3 kali dengan pola belokan itu.',
    grid: g([
      '........', 
      '........', 
      'S.W.W.WF', 
      '.W.W.W..', 
      '........', 
      '........', 
      '........', 
      '........'
    ])
  },
  {
    id: 'mine-5', category: 'Robot Tambang', title: 'Level 5: Patroli Kotak', subtitle: 'Perulangan',
    description: 'Robot harus patroli keliling lapangan yang luas.',
    gridSize: 7, startDir: 0, theme: 'space', tools: { basic: true, loops: true }, palette: ['move', 'turnRight', 'loop'],
    hint: 'Buat Loop 4 kali. Di dalam loop: Maju 4 kali, lalu Belok Kanan.',
    grid: g([
      '.......', 
      '.F...W.', 
      '.W...W.', 
      '.W...W.', 
      '.W...W.', 
      '.S...W.', 
      '.......'
    ])
  },

  // --- 6. Robot Kurir (Parameters) ---
  {
    id: 'courier-1', category: 'Robot Kurir', title: 'Level 1: Lompat Jauh', subtitle: 'Angka Langkah',
    description: 'Robot super ini bisa melompat jauh! Hemat tenagamu, jangan pakai banyak balok "Maju".',
    gridSize: 5, startDir: 1, theme: 'space', tools: { basic: true, params: true }, palette: ['move'],
    hint: 'Klik tombol **Maju**, lalu ubah angka **1** menjadi **3**. Robot akan langsung lompat 3 kotak!',
    grid: g([
      '.....', 
      '.....', 
      'S..F.', 
      '.....', 
      '.....'
    ])
  },
  {
    id: 'courier-2', category: 'Robot Kurir', title: 'Level 2: Lompat Super', subtitle: 'Angka Langkah',
    description: 'Jaraknya semakin jauh. Bisakah kamu melompatinya sekaligus?',
    gridSize: 6, startDir: 1, theme: 'space', tools: { basic: true, params: true }, palette: ['move'],
    hint: 'Tarik satu balok **Maju**, lalu ganti angkanya menjadi **4**. Wusss! Sampai deh.',
    grid: g([
      '......', 
      '......', 
      'S...F.', 
      '......', 
      '......', 
      '......'
    ])
  },
  {
    id: 'courier-3', category: 'Robot Kurir', title: 'Level 3: Hitung Kotak', subtitle: 'Angka Langkah',
    description: 'Kita harus belok, tapi langkahnya panjang-panjang. Hitung kotaknya baik-baik.',
    gridSize: 6, startDir: 1, theme: 'space', tools: { basic: true, params: true }, palette: ['move', 'turnLeft'],
    hint: '1. **Maju (isi 2)** untuk sampai belokan.\n2. **Belok Kiri**.\n3. **Maju (isi 2)** lagi sampai finish.',
    grid: g([
      '..F...', 
      '..W...', 
      '..W...', 
      '..S...', 
      '......', 
      '......'
    ])
  },
  {
    id: 'courier-4', category: 'Robot Kurir', title: 'Level 4: Lari Pagi', subtitle: 'Angka Langkah',
    description: 'Robot sedang olahraga lari keliling lapangan. Langkahnya harus konsisten.',
    gridSize: 5, startDir: 1, theme: 'space', tools: { basic: true, params: true }, palette: ['move', 'turnLeft'],
    hint: 'Gunakan **Maju (angka 2)** dan **Belok Kiri** secara bergantian sampai robot kembali ke titik awal.',
    grid: g([
      '.FFF.', 
      '.FWF.', 
      'SFWF.', 
      '.....', 
      '.....'
    ])
  },
  {
    id: 'courier-5', category: 'Robot Kurir', title: 'Level 5: Langkah Tepat', subtitle: 'Angka Langkah',
    description: 'Hati-hati menabrak tembok! Hitung kotak kosong di depanmu dengan teliti sebelum melangkah.',
    gridSize: 6, startDir: 1, theme: 'space', tools: { basic: true, params: true }, palette: ['move', 'turnLeft', 'turnRight'],
    hint: 'Hitung kotak kosong sebelum tembok.\n1. **Maju (angka 2)**.\n2. **Belok Kiri**.\n3. **Maju (angka 2)**.\n4. **Belok Kanan** lalu **Maju (1)**',
    grid: g([
      '......', 
      '...F..', 
      '...W..', 
      'S..W..', 
      'W.....', 
      '......'
    ])
  },

  // --- 7. Robot Gua (While Loops) ---
  {
    id: 'cave-1', category: 'Robot Gua', title: 'Level 1: Sensor Tembok', subtitle: 'Sensor Otomatis',
    description: 'Gunakan sensor! Jalan terus sampai menabrak tembok.',
    gridSize: 6, startDir: 1, theme: 'cave', tools: { basic: true, while: true }, palette: ['while', 'move'],
    hint: 'Masukkan "Maju" ke dalam blok "Sampai Mentok". Robot akan berhenti sendiri saat ada tembok.',
    grid: g([
      '......', 
      'WWWWWW', 
      'S...FW', 
      'WWWWWW', 
      '......', 
      '......'
    ])
  },
  {
    id: 'cave-2', category: 'Robot Gua', title: 'Level 2: Belok di Ujung', subtitle: 'Sensor Otomatis',
    description: 'Lorong belok L. Jalan sampai mentok, lalu belok.',
    gridSize: 6, startDir: 0, theme: 'cave', tools: { basic: true, while: true }, palette: ['while', 'move', 'turnLeft'],
    hint: '1. Sampai Mentok(Maju)\n2. Belok Kiri\n3. Sampai Mentok(Maju)',
    grid: g([
      'WWWWWW', 
      'F....W', 
      'WWWW.W', 
      'WWWW.W', 
      'WWWW.S', 
      'WWWWWW'
    ])
  },
  {
    id: 'cave-3', category: 'Robot Gua', title: 'Level 3: Tangga Buta', subtitle: 'Sensor Otomatis',
    description: 'Gelap sekali! Jalanlah mengikuti tembok. Pola: Maju-Mentok, Belok Kiri, Maju-Mentok, Belok Kanan.',
    gridSize: 6, startDir: 0, theme: 'cave', tools: { basic: true, while: true }, palette: ['while', 'move', 'turnLeft', 'turnRight'],
    hint: 'Robot menghadap ATAS. Maju Mentok, Kiri, Maju Mentok, Kanan.',
    grid: g([
      'WWFWWW', 
      'WW.WWW', 
      'WW...W', 
      'WW.WWW', 
      'WW...S', 
      'WWWWWW'
    ])
  },
  {
    id: 'cave-4', category: 'Robot Gua', title: 'Level 4: Lorong Gelap', subtitle: 'Sensor Otomatis',
    description: 'Lorong panjang berliku seperti ular. Percaya pada sensormu!',
    gridSize: 8, startDir: 1, theme: 'cave', tools: { basic: true, while: true }, palette: ['while', 'move', 'turnLeft', 'turnRight'],
    hint: 'Setiap kali berhenti (mentok), beloklah ke arah jalan yang kosong.',
    grid: g([
      'WWWWWWWW', 
      'S......W', 
      'WWWWWW.W', 
      'W......W', 
      'W.WWWWWW', 
      'W......F', 
      'WWWWWWWW', 
      'WWWWWWWW'
    ])
  },
  {
    id: 'cave-5', category: 'Robot Gua', title: 'Level 5: Kotak Spiral', subtitle: 'Sensor Otomatis',
    description: 'Putar-putar sampai ke tengah menggunakan pola yang sama.',
    gridSize: 7, startDir: 1, theme: 'cave', tools: { basic: true, while: true, loops: true }, palette: ['loop', 'while', 'move', 'turnRight'],
    hint: 'Loop 5 kali: (Maju Sampai Mentok, lalu Belok Kanan).',
    grid: g([
      'WWWWWWW', 
      'W.....W', 
      'W.WWW.W', 
      'W.WFW.W', 
      'W.W...W', 
      'W.....S', 
      'WWWWWWW'
    ])
  },

  // --- 8. Bengkel Robot (Debugging) ---
  {
    id: 'debug-1', category: 'Bengkel Robot', title: 'Level 1: Salah Arah', subtitle: 'Perbaiki Kode',
    description: 'Robot salah belok! Perbaiki kodenya.',
    gridSize: 5, startDir: 1, theme: 'cyber', tools: { basic: true }, palette: ['move', 'turnLeft', 'turnRight'],
    initialCode: [{type: 'move'}, {type: 'turnRight'}, {type: 'move'}],
    hint: 'Ganti "Kanan" jadi "Kiri".',
    grid: g([
      '..F..', 
      '..W..', 
      'S....', 
      '.....', 
      '.....'
    ])
  },
  {
    id: 'debug-2', category: 'Bengkel Robot', title: 'Level 2: Kurang Langkah', subtitle: 'Perbaiki Kode',
    description: 'Kurang maju sedikit lagi.',
    gridSize: 5, startDir: 1, theme: 'cyber', tools: { basic: true }, palette: ['move'],
    initialCode: [{type: 'move'}, {type: 'move'}],
    hint: 'Tambahkan "Maju" satu kali lagi.',
    grid: g([
      '.....', 
      '.....', 
      'S..F.', 
      '.....', 
      '.....'
    ])
  },
  {
    id: 'debug-3', category: 'Bengkel Robot', title: 'Level 3: Kelebihan', subtitle: 'Perbaiki Kode',
    description: 'Kebanyakan jalan, jadi nabrak tembok.',
    gridSize: 5, startDir: 1, theme: 'cyber', tools: { basic: true }, palette: ['move'],
    initialCode: [{type: 'move'}, {type: 'move'}, {type: 'move'}, {type: 'move'}],
    hint: 'Buang satu perintah "Maju" ke tempat sampah.',
    grid: g([
      '.....', 
      '...W.', 
      'S.F..', 
      '.....', 
      '.....'
    ])
  },
  {
    id: 'debug-4', category: 'Bengkel Robot', title: 'Level 4: Terbalik', subtitle: 'Perbaiki Kode',
    description: 'Urutan perintahnya terbalik. Harusnya Maju dulu.',
    gridSize: 5, startDir: 1, theme: 'cyber', tools: { basic: true }, palette: ['move', 'turnLeft'],
    initialCode: [{type: 'turnLeft'}, {type: 'move'}, {type: 'move'}],
    hint: 'Susun ulang: Maju dulu, baru Belok Kiri.',
    grid: g([
      'F....', 
      'W....', 
      'S....', 
      '.....', 
      '.....'
    ])
  },
  {
    id: 'debug-5', category: 'Bengkel Robot', title: 'Level 5: Bug Loop', subtitle: 'Perbaiki Kode',
    description: 'Loop-nya kurang banyak, belum sampai finish.',
    gridSize: 6, startDir: 1, theme: 'cyber', tools: { basic: true, loops: true }, palette: ['move', 'loop'],
    initialCode: [{type: 'loop', val: 2, body: [{type: 'move'}]}],
    hint: 'Ubah angka Loop dari 2 menjadi 4.',
    grid: g([
      '......', 
      '......', 
      'S...F.', 
      '......', 
      '......', 
      '......'
    ])
  },

  // --- 9. Robot Ekspedisi (Modular/Patterns) ---
  {
    id: 'exp-1', category: 'Robot Ekspedisi', title: 'Level 1: Jembatan', subtitle: 'Pengenalan Pola',
    description: 'Seberangi sungai lewat jembatan kayu.',
    gridSize: 6, startDir: 1, theme: 'jungle', tools: { basic: true, patterns: true }, palette: ['move', 'callPattern'],
    hint: 'Isi Pola A dengan "Maju". Panggil Pola A untuk melewati setiap jembatan.',
    grid: g([
      '......', 
      'BBBBBB', 
      'S....F', // Floor path clearly visible
      'BBBBBB', 
      '......', 
      '......'
    ])
  },
  {
    id: 'exp-2', category: 'Robot Ekspedisi', title: 'Level 2: Lompat Batu', subtitle: 'Pola Berulang',
    description: 'Lompati batu sungai dengan pola yang sama.',
    gridSize: 7, startDir: 1, theme: 'jungle', tools: { basic: true, patterns: true }, palette: ['move', 'callPattern'],
    hint: 'Jarak antar batu itu 2 langkah. Isi Pola A: "Maju, Maju".',
    grid: g([
      '.......', 
      '.......', 
      'S.B.B.F', 
      '.......', 
      '.......', 
      '.......',
      '.......'
    ])
  },
  {
    id: 'exp-3', category: 'Robot Ekspedisi', title: 'Level 3: Hutan Bambu', subtitle: 'Pola Zig-Zag',
    description: 'Hutan bambu ini tumbuh beraturan. Jalan zig-zag.',
    gridSize: 6, startDir: 0, theme: 'jungle', tools: { basic: true, patterns: true }, palette: ['move', 'turnLeft', 'turnRight', 'callPattern'],
    hint: 'Pola A: Maju, Kanan, Maju, Kiri. Panggil Pola A 3 kali.',
    grid: g([
      '...F..', 
      '..W...', 
      '.W....', 
      'S.....', 
      '......', 
      '......'
    ])
  },
  {
    id: 'exp-4', category: 'Robot Ekspedisi', title: 'Level 4: Bukit Terjal', subtitle: 'Pola Bertingkat',
    description: 'Mendaki bukit yang tinggi dengan pola tangga.',
    gridSize: 7, startDir: 1, theme: 'jungle', tools: { basic: true, patterns: true }, palette: ['move', 'turnLeft', 'turnRight', 'callPattern'],
    hint: 'Buat pola anak tangga. Pola A: Maju, Kiri, Maju, Kanan.',
    grid: g([
      '.....F.', 
      '....W..', 
      '...W...', 
      '..W....', 
      '.W.....', 
      'S......', 
      '.......'
    ])
  },
  {
    id: 'exp-5', category: 'Robot Ekspedisi', title: 'Level 5: Kuil Kuno', subtitle: 'Master Pola',
    description: 'Jalan menuju kuil kuno sangat panjang namun teratur.',
    gridSize: 8, startDir: 1, theme: 'jungle', tools: { basic: true, patterns: true }, palette: ['move', 'callPattern'],
    hint: 'Buat pola lari cepat (Maju 3x). Panggil berkali-kali.',
    grid: g([
      '........', 
      '........', 
      'S..F....', 
      '........', 
      '........', 
      '........', 
      '........', 
      '........'
    ])
  },

  // --- 10. Robot Penyelamat (Resources) ---
  {
    id: 'rescue-1', category: 'Robot Penyelamat', title: 'Level 1: Kebakaran!', subtitle: 'Pemadam Api',
    description: 'Ada kebakaran di depan! Padamkan apinya.',
    gridSize: 7, startDir: 1, theme: 'mars', tools: { basic: true, variables: true }, palette: ['move', 'turnLeft', 'turnRight', 'use', 'pick'],
    hint: 'Isi air dulu di kotak Biru (Gunakan), lalu siram Api di kotak Merah (Ambil).',
    grid: g([
      '.......', 
      '.......', 
      '.......', 
      'S.B.R.F', 
      '.......', 
      '.......',
      '.......'
    ])
  },
  {
    id: 'rescue-2', category: 'Robot Penyelamat', title: 'Level 2: Isi Air', subtitle: 'Pemadam Api',
    description: 'Tangki air kosong. Isi air (Biru) dulu, baru siram Api (Merah).',
    gridSize: 7, startDir: 1, theme: 'mars', tools: { basic: true, variables: true }, palette: ['move', 'use', 'pick'],
    hint: '1. Ke Air -> "Gunakan" (Isi)\n2. Ke Api -> "Ambil" (Siram)',
    grid: g([
      '.......', 
      '.......', 
      'S.B.R.F', 
      '.......', 
      '.......',
      '.......', 
      '.......'
    ])
  },
  {
    id: 'rescue-3', category: 'Robot Penyelamat', title: 'Level 3: Misi Ganda', subtitle: 'Pemadam Api',
    description: 'Isi air, lalu padamkan Api yang menghalangi jalan.',
    gridSize: 6, startDir: 1, theme: 'mars', tools: { basic: true, variables: true }, palette: ['move', 'turnLeft', 'pick', 'use'],
    hint: 'Jalan ke Biru (Isi), Belok, Jalan ke Merah (Siram).',
    grid: g([
      '.....F', 
      '.....R', 
      'S..B..', 
      '......', 
      '......', 
      '......'
    ])
  },
  {
    id: 'rescue-4', category: 'Robot Penyelamat', title: 'Level 4: Memutar', subtitle: 'Pemadam Api',
    description: 'Air ada di belakangmu! Balik badan dulu.',
    gridSize: 7, startDir: 1, theme: 'mars', tools: { basic: true, variables: true }, palette: ['move', 'turnRight', 'turnLeft', 'use', 'pick'],
    hint: 'Putar balik ambil Air, lalu kembali untuk siram Api.',
    grid: g([
      '.......', 
      'B.S.R.F', 
      '.......', 
      '.......', 
      '.......', 
      '.......',
      '.......'
    ])
  },
  {
    id: 'rescue-5', category: 'Robot Penyelamat', title: 'Level 5: Labirin Api', subtitle: 'Pemadam Api',
    description: 'Lokasi kebakaran sulit dijangkau. Hati-hati tembok.',
    gridSize: 6, startDir: 0, theme: 'mars', tools: { basic: true, variables: true }, palette: ['move', 'turnLeft', 'turnRight', 'use', 'pick'],
    hint: 'Ambil air di kiri, lalu jalan jauh memutar ke kanan.',
    grid: g([
      'F.....', 
      'R.WWW.', 
      '..W...', 
      '.WB.S.', 
      '......', 
      '......'
    ])
  }
];
