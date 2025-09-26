import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { transactionReference, paymentReference } = body;

    if (!transactionReference && !paymentReference) {
      return NextResponse.json({ error: "Missing references" }, { status: 400 });
    }

    // Call Monnify API to verify
    const res = await fetch(
      `https://sandbox.monnify.com/api/v1/merchant/transactions/query?paymentReference=${paymentReference}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(
            `${process.env.MONNIFY_API_KEY}:${process.env.MONNIFY_SECRET_KEY}`
          ).toString("base64")}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to verify transaction", details: data },
        { status: 500 }
      );
    }

    // Check Monnify's response for success
    if (data.requestSuccessful && data.responseBody?.paymentStatus === "PAID") {
      // 💾 Save successful payment in DB (if you want)
      return NextResponse.json({
        success: true,
        status: data.responseBody.paymentStatus,
        amount: data.responseBody.amountPaid,
      });
    } else {
      return NextResponse.json({
        success: false,
        status: data.responseBody?.paymentStatus,
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Verification failed" },
      { status: 500 }
    );
  }
}
