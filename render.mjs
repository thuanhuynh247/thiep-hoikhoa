// render.mjs — phong bì chữ chạy (động) + 5 slide tĩnh, ghép thành MP4 H.264
import { chromium } from 'playwright';
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRAMES = path.join(__dirname, 'frames');
const OUT    = path.join(__dirname, 'output');
fs.mkdirSync(OUT, { recursive: true });

// ===== CẤU HÌNH =====
const DUR = 3.0;
const XF  = 0.85;
const FPS = 30;
// chuyển cảnh đa dạng cho sinh động (xoay vòng theo thứ tự); xfade của ffmpeg
const TRANSITIONS = ['slideleft', 'smoothup', 'slideleft', 'smoothup'];
const ANIM_FRAMES = 50;
const ANIM_DUR    = 2.0;
const HOLD        = DUR - ANIM_DUR;

const SEQUENCE = [
  { envelope: true },
  { bg: '2-thumoi.jpg' },
  { bg: '3-chuongtrinh.jpg' },
  { bg: '4-dresscode.jpg' },
  { bg: '5-nhovenha.jpg' },
];
// ====================

function slug(s) {
  return (s || 'thiep').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();
}

function slugLop(lop) {
  return (lop || 'khac').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();
}

function readList(file) {
  const txt = fs.readFileSync(file, 'utf8');
  const lines = txt.split(/\r?\n/).filter(l => l.trim());
  if (!lines.length) return [];
  const delim = (lines[0].split(';').length > lines[0].split(',').length) ? ';' : ',';
  const header = lines[0].split(delim).map(h => h.trim().toLowerCase());
  const iTen = header.findIndex(h => h.includes('tên') || h.includes('ten') || h.includes('họ') || h.includes('ho'));
  const iLop = header.findIndex(h => h.includes('lớp') || h.includes('lop'));
  if (iTen === -1 || iLop === -1) throw new Error('CSV cần cột tên (Họ tên) và cột Lớp ở dòng đầu.');
  return lines.slice(1).map(l => {
    const c = l.split(delim);
    return { ten: (c[iTen] || '').trim(), lop: (c[iLop] || '').trim() };
  }).filter(r => r.ten);
}

async function captureEnvelope(page, tplUrl, ten, lop, framesDir) {
  fs.rmSync(framesDir, { recursive: true, force: true });
  fs.mkdirSync(framesDir, { recursive: true });
  await page.goto(`${tplUrl}?ten=${encodeURIComponent(ten)}&lop=${encodeURIComponent(lop)}`, { waitUntil: 'load' });
  await page.waitForFunction('window.__ready===true', { timeout: 8000 }).catch(() => {});
  const empty = path.join(framesDir, 'empty.png');
  const full  = path.join(framesDir, 'full.png');
  await page.evaluate(() => window.setProgress(0));
  await page.screenshot({ path: empty, clip: { x: 0, y: 0, width: 1920, height: 1080 } });
  await page.evaluate(() => window.setProgress(1));
  await page.screenshot({ path: full, clip: { x: 0, y: 0, width: 1920, height: 1080 } });
  return { empty, full };
}

function buildFfmpegArgs(empty, full, bgPaths, outFile, music) {
  const proc = (idx, out) => `[${idx}:v]scale=1920:1080,setsar=1,fps=${FPS},format=yuv420p[${out}];`;
  const args = [
    '-loop', '1', '-t', String(ANIM_DUR), '-i', empty,   // 0
    '-loop', '1', '-t', String(DUR), '-i', full,         // 1
  ];
  bgPaths.forEach(p => args.push('-loop', '1', '-t', String(DUR), '-i', p)); // 2..n
  if (music) args.push('-i', music);

  let f = proc(0, 'e') + proc(1, 'f')
        + `[e][f]xfade=transition=fade:duration=${ANIM_DUR}:offset=0,format=yuv420p[s0];`;
  bgPaths.forEach((_, k) => { f += proc(2 + k, `s${k + 1}`); });

  let last = 's0';
  let offset = DUR - XF;
  const total = bgPaths.length + 1;  // số segment
  for (let i = 1; i < total; i++) {
    const out = (i === total - 1) ? 'vout' : `c${i}`;
    const tr = TRANSITIONS[(i - 1) % TRANSITIONS.length];
    f += `[${last}][s${i}]xfade=transition=${tr}:duration=${XF}:offset=${offset.toFixed(3)}[${out}];`;
    last = out;
    offset += (DUR - XF);
  }
  f = f.replace(/;$/, '');

  args.push('-filter_complex', f, '-map', '[vout]');
  if (music) args.push('-map', `${2 + bgPaths.length}:a`, '-shortest');
  args.push('-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20',
            '-preset', 'veryfast', '-movflags', '+faststart', '-y', outFile);
  return args;
}

async function main() {
  const listFile = process.argv[2] || path.join(__dirname, 'danhsach.csv');
  const rows = readList(listFile);
  if (!rows.length) { console.error('Danh sách rỗng.'); process.exit(1); }
  console.log(`Có ${rows.length} người. Bắt đầu render...`);

  const musicPath = path.join(__dirname, 'music.mp3');
  const music = fs.existsSync(musicPath) ? musicPath : null;
  if (music) console.log('Có nhạc nền: assets/music.mp3');

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const tplUrl = pathToFileURL(path.join(__dirname, 'template.html')).href;

  let ok = 0;
  const bgPaths = SEQUENCE.filter(it => it.bg).map(it => path.join(__dirname, it.bg));
  const byClass = path.join(OUT, 'by-class');
  fs.mkdirSync(byClass, { recursive: true });

  for (const { ten, lop } of rows) {
    const sName = slug(ten);
    const sLop  = slugLop(lop);
    const framesDir = path.join(FRAMES, sName);
    const classDir  = path.join(byClass, sLop);
    fs.mkdirSync(classDir, { recursive: true });
    try {
      const { empty, full } = await captureEnvelope(page, tplUrl, ten, lop, framesDir);
      const outFile = path.join(classDir, `thu-moi-${sName}-${sLop}.mp4`);
      execFileSync('ffmpeg', buildFfmpegArgs(empty, full, bgPaths, outFile, music), { stdio: 'ignore' });
      fs.rmSync(framesDir, { recursive: true, force: true });
      ok++;
      console.log(`✓ ${ten} (${lop})`);
    } catch (e) {
      console.error(`✗ LỖI ${ten}: ${e.message}`);
    }
  }

  await browser.close();
  console.log(`\nXong: ${ok}/${rows.length} video trong thư mục output/`);
}

main().catch(e => { console.error(e); process.exit(1); });
