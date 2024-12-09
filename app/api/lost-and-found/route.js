// app/api/lost-and-found/route.js
import connectMongo from '@/lib/mongodb';
import Report from '@/lib/models/found';

export async function POST(req) {
  await connectMongo();
  const data = await req.json(); // Parse request body data
  const newReport = new Report(data);

  try {
    await newReport.save();
    return new Response(JSON.stringify({ message: 'Report saved successfully' }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Failed to save report' }), { status: 500 });
  }
}
