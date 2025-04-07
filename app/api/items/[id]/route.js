import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import Lost from '@/lib/models/lost';
import Returned from '@/lib/models/returned';
import Food from '@/lib/models/food';
import { ObjectId } from 'mongodb';

export async function GET(req, { params }) {
  try {
    await connectMongo();

    const query = ObjectId.isValid(params.id) ? { _id: new ObjectId(params.id) } : { ID: params.id };

    // Try to find item in "lost" collection
    let item = await Lost.findOne(query);

    // If not found in "lost," try the "found" collection
    if (!item) {
      item = await Returned.findOne(query);
      if (item) item.Status = 'returned';
    } else 
        {
          item = await Food.findOne(query);
          if (item) item.Status = 'food';
        }

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error fetching item details:', error);
    return NextResponse.json({ error: 'Failed to fetch item details' }, { status: 500 });
  }
}
export async function DELETE(req, { params }) {
  try {
    await connectMongo();

    const query = ObjectId.isValid(params.id) ? { _id: new ObjectId(params.id) } : { ID: params.id };

    const deletedItem = await Lost.deleteOne(query);

    if (deletedItem.deletedCount === 0) {
      return NextResponse.json({ error: 'Item not found or already deleted' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Item successfully deleted' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}