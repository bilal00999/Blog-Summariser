import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // Test the connection by trying to select from the summaries table
    const { data, error } = await supabase
      .from("summaries")
      .select("count")
      .limit(1);

    if (error) {
      return NextResponse.json(
        {
          status: "error",
          message: "Supabase connection failed",
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "success",
      message: "Supabase connection working!",
      data,
    });
  } catch (err: unknown) {
    let errorMsg = "Failed to test Supabase connection";
    if (err instanceof Error) {
      errorMsg = err.message;
    }
    return NextResponse.json(
      {
        status: "error",
        message: errorMsg,
      },
      { status: 500 }
    );
  }
}
