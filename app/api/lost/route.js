// app/api/lost/route.js
import connectMongo from '@/lib/mongodb';
import Lost from '@/lib/models/lost';

export async function POST(req) {
  await connectMongo();
  try {
    const data = await req.json(); // Parse request body data
    const newLost = new Lost(data);
    await newLost.save();

    return new Response(JSON.stringify({ message: 'Lost report saved successfully' }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error saving lost report:', error);
    return new Response(
      JSON.stringify({ message: 'Failed to save lost report', error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
