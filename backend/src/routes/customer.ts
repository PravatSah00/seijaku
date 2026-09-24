import { Prisma } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";

import { hashPassword, signCustomerToken, verifyPassword } from "../lib/auth.js";
import { prisma } from "../lib/prisma.js";
import { requireCustomer } from "../middleware/requireCustomer.js";
import { asyncHandler, HttpError, parseBody } from "../utils/http.js";
import { serializeCustomer, serializeProduct } from "../utils/serializers.js";

export const customerRouter = Router();

const productInclude = {
  primaryImage: true,
  media: { include: { mediaAsset: true } },
  options: { include: { values: true } },
  collections: { include: { collection: true } },
  categories: { include: { category: true } },
} satisfies Prisma.ProductInclude;

const registerSchema = z.object({
  email: z.string().email("Invalid email format").max(254),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().max(120).optional(),
  phone: z.string().max(30).optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

const profileUpdateSchema = z.object({
  name: z.string().max(120).optional(),
  phone: z.string().max(30).optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

const wishlistAddSchema = z.object({
  productSlug: z.string().min(1, "Product slug is required"),
});

const wishlistSyncSchema = z.object({
  slugs: z.array(z.string()),
});

function routeParam(req: { params: Record<string, string | string[] | undefined> }, key: string) {
  const value = req.params[key];
  return Array.isArray(value) ? value[0] : value;
}

// Register new customer account
customerRouter.post(
  "/auth/register",
  asyncHandler(async (req, res) => {
    const input = parseBody(registerSchema, req.body);
    const normalizedEmail = input.email.trim().toLowerCase();

    const existing = await prisma.customer.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing?.passwordHash) {
      throw new HttpError(409, "An account with this email already exists. Please sign in.");
    }

    const passwordHash = await hashPassword(input.password);

    const customer = existing
      ? await prisma.customer.update({
          where: { id: existing.id },
          data: {
            passwordHash,
            name: input.name?.trim() || existing.name,
            phone: input.phone?.trim() || existing.phone,
          },
        })
      : await prisma.customer.create({
          data: {
            email: normalizedEmail,
            passwordHash,
            name: input.name?.trim() || null,
            phone: input.phone?.trim() || null,
          },
        });

    const token = signCustomerToken({
      customerId: customer.id,
      email: customer.email,
    });

    res.status(201).json({
      token,
      customer: serializeCustomer(customer),
      wishlist: [],
    });
  })
);

// Customer Login
customerRouter.post(
  "/auth/login",
  asyncHandler(async (req, res) => {
    const input = parseBody(loginSchema, req.body);
    const normalizedEmail = input.email.trim().toLowerCase();

    const customer = await prisma.customer.findUnique({
      where: { email: normalizedEmail },
      include: {
        wishlistItems: {
          include: {
            product: {
              select: { slug: true },
            },
          },
        },
      },
    });

    if (!customer || !customer.passwordHash) {
      throw new HttpError(401, "Invalid email or password");
    }

    const isValid = await verifyPassword(input.password, customer.passwordHash);
    if (!isValid) {
      throw new HttpError(401, "Invalid email or password");
    }

    if (customer.status === "INACTIVE") {
      throw new HttpError(403, "Account is disabled. Please contact support.");
    }

    const token = signCustomerToken({
      customerId: customer.id,
      email: customer.email,
    });

    const wishlistSlugs = customer.wishlistItems.map((item) => item.product.slug);

    res.json({
      token,
      customer: serializeCustomer(customer),
      wishlist: wishlistSlugs,
    });
  })
);

// Get currently logged-in customer profile & full wishlist
customerRouter.get(
  "/auth/me",
  requireCustomer,
  asyncHandler(async (req, res) => {
    const customer = await prisma.customer.findUnique({
      where: { id: req.customer!.customerId },
      include: {
        wishlistItems: {
          include: {
            product: {
              include: productInclude,
            },
          },
          orderBy: { createdAt: "desc" },
        },
        orderRequests: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    slug: true,
                    title: true,
                    priceAmount: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!customer) {
      throw new HttpError(404, "Customer not found");
    }

    const wishlistedProducts = customer.wishlistItems
      .filter((item) => item.product.workflowStatus === "PUBLISHED")
      .map((item) => serializeProduct(item.product));

    const wishlistSlugs = customer.wishlistItems.map((item) => item.product.slug);

    res.json({
      customer: serializeCustomer(customer),
      wishlistSlugs,
      wishlistProducts: wishlistedProducts,
      orders: customer.orderRequests.map((order) => ({
        id: order.id,
        status: order.status,
        paymentStatus: order.paymentStatus,
        totalAmount: order.totalAmount,
        currency: order.currency,
        createdAt: order.createdAt.toISOString(),
        itemsCount: order.items.length,
        items: order.items.map((it) => ({
          productSlug: it.product.slug,
          productTitle: it.product.title,
          quantity: it.quantity,
          unitPriceAmount: it.unitPriceAmount,
          variantSummary: it.variantSummary,
        })),
      })),
    });
  })
);

// Update customer profile (name, phone)
customerRouter.put(
  "/profile",
  requireCustomer,
  asyncHandler(async (req, res) => {
    const input = parseBody(profileUpdateSchema, req.body);

    const updated = await prisma.customer.update({
      where: { id: req.customer!.customerId },
      data: {
        ...(input.name !== undefined ? { name: input.name.trim() || null } : {}),
        ...(input.phone !== undefined ? { phone: input.phone.trim() || null } : {}),
      },
    });

    res.json({
      customer: serializeCustomer(updated),
    });
  })
);

// Change password
customerRouter.post(
  "/change-password",
  requireCustomer,
  asyncHandler(async (req, res) => {
    const input = parseBody(changePasswordSchema, req.body);

    const customer = await prisma.customer.findUnique({
      where: { id: req.customer!.customerId },
    });

    if (!customer || !customer.passwordHash) {
      throw new HttpError(404, "Customer account not found");
    }

    const isValid = await verifyPassword(input.currentPassword, customer.passwordHash);
    if (!isValid) {
      throw new HttpError(400, "Current password is incorrect");
    }

    const newHash = await hashPassword(input.newPassword);
    await prisma.customer.update({
      where: { id: customer.id },
      data: { passwordHash: newHash },
    });

    res.json({ ok: true, message: "Password updated successfully" });
  })
);

// Get Wishlist items
customerRouter.get(
  "/wishlist",
  requireCustomer,
  asyncHandler(async (req, res) => {
    const items = await prisma.wishlistItem.findMany({
      where: { customerId: req.customer!.customerId },
      include: {
        product: {
          include: productInclude,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const validItems = items.filter((item) => item.product.workflowStatus === "PUBLISHED");
    const products = validItems.map((item) => serializeProduct(item.product));
    const slugs = items.map((item) => item.product.slug);

    res.json({
      slugs,
      products,
    });
  })
);

// Add item to Wishlist
customerRouter.post(
  "/wishlist",
  requireCustomer,
  asyncHandler(async (req, res) => {
    const { productSlug } = parseBody(wishlistAddSchema, req.body);

    const product = await prisma.product.findUnique({
      where: { slug: productSlug },
    });

    if (!product) {
      throw new HttpError(404, "Product not found");
    }

    await prisma.wishlistItem.upsert({
      where: {
        customerId_productId: {
          customerId: req.customer!.customerId,
          productId: product.id,
        },
      },
      create: {
        customerId: req.customer!.customerId,
        productId: product.id,
      },
      update: {},
    });

    const allItems = await prisma.wishlistItem.findMany({
      where: { customerId: req.customer!.customerId },
      select: { product: { select: { slug: true } } },
    });

    res.json({
      ok: true,
      slugs: allItems.map((item) => item.product.slug),
    });
  })
);

// Remove item from Wishlist
customerRouter.delete(
  "/wishlist/:slug",
  requireCustomer,
  asyncHandler(async (req, res) => {
    const slug = routeParam(req, "slug");
    if (!slug) {
      throw new HttpError(400, "Missing product slug");
    }

    const product = await prisma.product.findUnique({
      where: { slug },
    });

    if (product) {
      await prisma.wishlistItem.deleteMany({
        where: {
          customerId: req.customer!.customerId,
          productId: product.id,
        },
      });
    }

    const allItems = await prisma.wishlistItem.findMany({
      where: { customerId: req.customer!.customerId },
      select: { product: { select: { slug: true } } },
    });

    res.json({
      ok: true,
      slugs: allItems.map((item) => item.product.slug),
    });
  })
);

// Sync local guest wishlist to customer's account (merge)
customerRouter.post(
  "/wishlist/sync",
  requireCustomer,
  asyncHandler(async (req, res) => {
    const { slugs } = parseBody(wishlistSyncSchema, req.body);

    if (slugs.length > 0) {
      const products = await prisma.product.findMany({
        where: { slug: { in: slugs } },
        select: { id: true, slug: true },
      });

      for (const p of products) {
        await prisma.wishlistItem.upsert({
          where: {
            customerId_productId: {
              customerId: req.customer!.customerId,
              productId: p.id,
            },
          },
          create: {
            customerId: req.customer!.customerId,
            productId: p.id,
          },
          update: {},
        });
      }
    }

    const allItems = await prisma.wishlistItem.findMany({
      where: { customerId: req.customer!.customerId },
      include: {
        product: {
          include: productInclude,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const validItems = allItems.filter((item) => item.product.workflowStatus === "PUBLISHED");
    const products = validItems.map((item) => serializeProduct(item.product));
    const allSlugs = allItems.map((item) => item.product.slug);

    res.json({
      slugs: allSlugs,
      products,
    });
  })
);
