// app/api/food/route.js
import connectMongo from '@/lib/mongodb';
import Food from '@/lib/models/food';

export async function POST(req) {
  await connectMongo();
  try {
    const data = await req.json(); // Parse request body data
    const newFood = new Food(data);
    await newFood.save();

    return new Response(JSON.stringify({ message: 'Food report saved successfully' }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error saving Food report:', error);
    return new Response(
      JSON.stringify({ message: 'Failed to save Food report', error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
