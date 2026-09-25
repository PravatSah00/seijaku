import { NextRequest, NextResponse } from "next/server";

import { getBackendBaseUrl } from "@/src/lib/backend";

async function proxyRequest(request: NextRequest, params: { path?: string[] }) {
  const targetPath = params.path?.join("/") ?? "";
  const targetUrl = `${getBackendBaseUrl()}/${targetPath}${request.nextUrl.search}`;
  const headers = new Headers();
  headers.set("Accept", "application/json");

  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    headers.set("Authorization", authHeader);
  }

  let body: BodyInit | undefined;
  const contentType = request.headers.get("content-type");

  if (contentType?.includes("multipart/form-data")) {
    const incomingFormData = await request.formData();
    const outgoingFormData = new FormData();

    for (const [key, value] of incomingFormData.entries()) {
      outgoingFormData.append(key, value);
    }

    body = outgoingFormData;
  } else if (request.method !== "GET" && request.method !== "HEAD") {
    const text = await request.text();
    if (text) {
      body = text;
      if (contentType) {
        headers.set("Content-Type", contentType);
      }
    }
  }

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body,
    cache: "no-store",
  });

  return new NextResponse(await response.text(), {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "application/json",
    },
  });
}

export async function GET(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return proxyRequest(request, await context.params);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return proxyRequest(request, await context.params);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return proxyRequest(request, await context.params);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return proxyRequest(request, await context.params);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return proxyRequest(request, await context.params);
}
