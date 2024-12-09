// app/api/return/route.js
import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import Returned from '@/lib/models/returned';


export async function POST(req) {
  await connectMongo();
  
  try {
    const data = await req.json(); // Parse request body data
    console.log('Received Data:', data); // Log the received data
    
    const newReturnedReport = new Returned(data);

    await newReturnedReport.save();
    return new Response(
      JSON.stringify({ message: 'Report saved successfully' }), 
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving report:', error); // Log the error for debugging
    return new Response(
      JSON.stringify({ message: 'Failed to save report' }), 
      { status: 500 }
    );
  }
}












