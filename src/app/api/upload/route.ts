import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, R2_BUCKET } from "@/lib/r2";

/**
 * POST /api/upload - 上传文件到 Cloudflare R2
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "没有提供文件" }, { status: 400 });
    }

    // 校验文件类型（仅图片）
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `不支持的文件类型: ${file.type}` },
        { status: 400 }
      );
    }

    // 校验文件大小（最大 10MB）
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "文件过大，最大允许10MB" }, { status: 400 });
    }

    // 生成唯一文件名
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 11);
    const extension = file.name.split(".").pop();
    const fileName = `${timestamp}-${random}.${extension}`;

    // 上传到 R2
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await r2.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
      })
    );

    // 返回代理访问 URL（通过应用代理，无需 R2 公开访问）
    const url = `/api/file/${fileName}`;

    return NextResponse.json({
      success: true,
      url,
      fileName,
      fileType: file.type,
      size: file.size,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "上传失败" }, { status: 500 });
  }
}
