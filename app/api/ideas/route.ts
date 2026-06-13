import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const event = searchParams.get("event");
    const skip = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db("IdeaCollector");
    const ethCollection = db.collection("ethglobal_ideas");
    const ycCollection = db.collection("yc_ideas");

    // Fetch from both collections
    const ethFilter: any = {};
    if (event && event !== "all") {
      ethFilter.event = event;
    }

    const ethPromise = ethCollection
      .find(ethFilter)
      .skip(skip)
      .limit(limit)
      .toArray();

    const ycPromise = ycCollection
      .find()
      .skip(skip)
      .limit(limit)
      .toArray();

    const [ethIdeas, ycIdeas] = await Promise.all([ethPromise, ycPromise]);

    // Normalize ETHGlobal ideas
    const normalizedEth = ethIdeas.map((idea) => ({
      ...idea,
      source: "ethglobal" as const,
      categories:
        idea.project_prizes?.map((p: any) => p.name) || [],
    }));

    // Normalize YC ideas - hide YC branding, present as novel concepts
    const normalizedYc = ycIdeas.map((idea) => {
      const firstCategory =
        idea.industries?.[0] || idea.tags?.[0] || "Startup";

      // Pick the best description: prefer long_description if substantial
      let description = idea.description || "";
      if (idea.long_description && idea.long_description.length > description.length + 20) {
        description = idea.long_description;
      }

      // Truncate very long descriptions
      if (description.length > 800) {
        description = description.slice(0, 800) + "...";
      }

      return {
        _id: idea._id.toString(),
        id: idea.id,
        source: "yc" as const,
        title: idea.title,
        description,
        url: idea.url,
        // Hide YC batch info; use a neutral industry tag as the "event" badge
        event: firstCategory,
        // Hide YC-specific fields from the public shape; we won't show prizes
        // but we keep categories for potential internal use
        categories: idea.tags || idea.industries || [],
      };
    });

    // Merge and shuffle for a balanced mix
    const merged = shuffle([...normalizedEth, ...normalizedYc]);

    // Slice to requested limit
    const ideas = merged.slice(0, limit);

    const totalEth = await ethCollection.countDocuments(ethFilter);
    const totalYc = await ycCollection.countDocuments();

    return NextResponse.json({
      ideas,
      total: totalEth + totalYc,
      page,
      limit,
      hasMore: skip + ideas.length < totalEth + totalYc,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch ideas" },
      { status: 500 }
    );
  }
}
