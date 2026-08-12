import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

/**
 * POST /api/upload - Upload file to server storage
 *
 * Uploads a file to the server's public/uploads directory
 * and returns the accessible URL
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "没有提供文件" },
        { status: 400 }
      );
    }

    // Validate file type (only images)
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `不支持的文件类型: ${file.type}` },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "文件过大，最大允许10MB" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 11);
    const extension = file.name.split(".").pop();
    const fileName = `${timestamp}-${random}.${extension}`;

    // Ensure uploads directory exists
    const uploadsDir = join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = join(uploadsDir, fileName);
    await writeFile(filePath, buffer);

    // Return the URL
    const url = `/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      url,
      fileName,
      fileType: file.type,
      size: file.size,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "上传失败" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/upload - Delete a file
 *
 * Deletes a file from the server's uploads directory
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get("path");

    if (!filePath) {
      return NextResponse.json(
        { error: "缺少文件路径" },
        { status: 400 }
      );
    }

    // Security: Only allow deleting from uploads directory
    if (!filePath.startsWith("/uploads/")) {
      return NextResponse.json(
        { error: "无效的文件路径" },
        { status: 400 }
      );
    }

    const fullPath = join(process.cwd(), "public", filePath);

    // Check if file exists
    if (!existsSync(fullPath)) {
      return NextResponse.json(
        { error: "文件不存在" },
        { status: 404 }
      );
    }

    // Import unlink dynamically to avoid issues
    const { unlink } = require("fs/promises");
    await unlink(fullPath);

    return NextResponse.json({
      success: true,
      message: "文件已删除",
    });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "删除失败" },
      { status: 500 }
    );
  }
}
