import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { r2, R2_BUCKET } from "@/lib/r2";

/**
 * GET /api/file/{key} - 从 Cloudflare R2 获取文件并流式返回
 * 作为图片代理，无需 R2 公开访问
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const key = path.join("/");

    const response = await r2.send(
      new GetObjectCommand({ Bucket: R2_BUCKET, Key: key })
    );

    if (!response.Body) {
      return NextResponse.json({ error: "文件不存在" }, { status: 404 });
    }

    // 流式返回文件内容
    const body = response.Body as ReadableStream;
    return new Response(body, {
      headers: {
        "Content-Type": response.ContentType || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "文件不存在" }, { status: 404 });
  }
}
