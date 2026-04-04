# Week Mind

Website `Week Mind` hien mac dinh dung Google Gemini cho:

- Phan tich du lieu nguoi dung
- Tao cau hoi khao sat
- Lap ke hoach tuan bang AI

Project ho tro 2 cach chay:

- Local: `Node.js + Express`
- Vercel: `Static site + Vercel Functions`

## Cai dat local

1. Cai `Node.js`
2. Mo terminal trong thu muc project
3. Cai dependency

```powershell
npm install
```

4. Tao file `.env` tu `.env.example`
5. Dien thong tin

```env
PORT=3000
AI_PROVIDER=gemini
GEMINI_MODEL=gemini-2.0-flash
GEMINI_API_KEY=your_gemini_api_key_here
```

## Chay local

```powershell
npm start
```

Sau do mo `http://localhost:3000`

## Deploy len Vercel

1. Day code len GitHub
2. Vao Vercel va import repo
3. Trong `Environment Variables`, them:

```env
AI_PROVIDER=gemini
GEMINI_MODEL=gemini-2.0-flash
GEMINI_API_KEY=your_gemini_api_key_here
```

4. Deploy

Vercel se dung:

- `index.html`, `styles.css`, `script.js`
- `api/survey.js`
- `api/analyze.js`
- `api/plan.js`

## Luong AI

- Khi nguoi dung luu ho so, frontend goi `POST /api/survey`
- Khi nguoi dung gui khao sat, frontend goi `POST /api/analyze`
- Khi nguoi dung tao ke hoach tuan, frontend goi `POST /api/plan`
- Neu Gemini loi hoac thieu API key, backend se tra loi tuong ung

## Luu y

- Khong mo `index.html` bang `file://`
- Neu chay local thi dung `npm start`
- Neu deploy Vercel thi khong can `server.js`; Vercel se dung `api/*.js`
- File `api/_lib/openai.js` giu ten cu de tranh vo import, nhung mac dinh da chuyen sang Gemini
