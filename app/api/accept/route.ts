import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ideaId, action, idea, status, notes, source } = body;

    if (!ideaId || !action) {
      return NextResponse.json(
        { error: "Missing ideaId or action" },
        { status: 400 }
      );
    }

    const ideaSource = source || idea?.source || "ethglobal";

    const client = await clientPromise;
    const db = client.db("IdeaCollector");
    const collection = db.collection("accepted_ideas");

    const updateSet: any = {
      updatedAt: new Date(),
      source: ideaSource,
    };

    if (action) updateSet.action = action;
    if (status !== undefined) updateSet.status = status;
    if (notes !== undefined) updateSet.notes = notes;
    if (idea) updateSet.idea = { ...idea, source: ideaSource };

    const setOnInsert: any = {
      createdAt: new Date(),
      source: ideaSource,
    };
    if (status === undefined) setOnInsert.status = "not_started";
    if (notes === undefined) setOnInsert.notes = "";

    const shouldUpsert = action === "accept" && idea !== undefined;

    // Use compound key for lookups; fall back to ideaId-only for backward compatibility
    const filter: any = { ideaId, source: ideaSource };
    const fallbackFilter: any = { ideaId };

    let result = await collection.updateOne(
      filter,
      {
        $set: updateSet,
        $setOnInsert: setOnInsert,
      },
      { upsert: shouldUpsert }
    );

    // If no match with compound key and not upserting, try fallback for old data
    if (!shouldUpsert && result.matchedCount === 0) {
      result = await collection.updateOne(
        fallbackFilter,
        {
          $set: { ...updateSet, source: ideaSource },
        }
      );
    }

    // If still no match, try id field (old documents might use id instead of ideaId)
    if (!shouldUpsert && result.matchedCount === 0) {
      result = await collection.updateOne(
        { id: ideaId },
        {
          $set: { ...updateSet, source: ideaSource },
        }
      );
    }

    // Try type coercion — MongoDB may have stored ideaId as a different type
    if (!shouldUpsert && result.matchedCount === 0) {
      const coercedId = typeof ideaId === "string" && !isNaN(Number(ideaId))
        ? Number(ideaId)
        : typeof ideaId === "number"
        ? String(ideaId)
        : ideaId;
      if (coercedId !== ideaId) {
        result = await collection.updateOne(
          { $or: [{ ideaId: coercedId }, { id: coercedId }] },
          {
            $set: { ...updateSet, source: ideaSource },
          }
        );
      }
    }

    if (!shouldUpsert && result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Idea not found in build list" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, ideaId, action, source: ideaSource });
  } catch (error) {
    console.error("Accept API Error:", error);
    return NextResponse.json(
      { error: "Failed to save idea" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("IdeaCollector");
    const collection = db.collection("accepted_ideas");

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const filter: any = { action: "accept" };
    if (status) {
      filter.status = status;
    }

    const accepted = await collection.find(filter).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({ accepted });
  } catch (error) {
    console.error("Get Accepts Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch accepted ideas" },
      { status: 500 }
    );
  }
}
