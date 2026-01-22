
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        // Query a lightweight table to ensure the DB stays awake
        const { data, error } = await supabase
            .from('products')
            .select('id')
            .limit(1);

        if (error) {
            console.error('Keep-Alive DB Error:', error);
            return NextResponse.json(
                { status: 'Error', message: 'Database query failed', error },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                status: 'Ok',
                message: 'Supabase is active',
                timestamp: new Date().toISOString()
            },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { status: 'Error', message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
