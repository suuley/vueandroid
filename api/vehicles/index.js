export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const hasUri = !!process.env.MONGO_URI;
  const length = process.env.MONGO_URI ? process.env.MONGO_URI.length : 0;
  const mongoKeys = Object.keys(process.env).filter(k => k.toUpperCase().includes('MONGO'));

  res.status(200).json({ 
    hasUri, 
    length, 
    mongoKeys,
    message: hasUri ? "✅ Vercel sees the variable!" : "❌ Vercel DOES NOT see the variable."
  });
}