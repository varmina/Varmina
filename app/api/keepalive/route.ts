import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    // Just fetch one product ID to register activity
    const { error } = await supabase.from('products').select('id').limit(1);
    
    if (error) {
      console.error('Keepalive error:', error);
      return NextResponse.json({ status: 'error', error: error.message }, { status: 500 });
    }

    return NextResponse.json({ status: 'ok', activity: true, timestamp: new Date().toISOString() });
  } catch {
    return NextResponse.json({ status: 'error', message: 'Internal Server Error' }, { status: 500 });
  }
}
