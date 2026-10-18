import { supabase } from "../lib/supabase.js";

const BUCKET_NAME = "product-images";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export async function uploadImage(file) {
  if (!file) {
    throw new Error("Please select a product image.");
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Only JPEG, PNG, and WebP images are allowed.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Image size must not exceed 5 MB.");
  }

  const extension = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  }[file.type];

  const uniqueId = crypto.randomUUID();
  const filePath = `products/${uniqueId}.${extension}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }

  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function createProduct(product) {
  const name = product.name?.trim();
  const quantity = Number(product.quantity);
  const price = Number(product.price);
  const description = product.description?.trim() || null;
  const imageUrl = product.image_url?.trim();

  if (!name) {
    throw new Error("Product name is required.");
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error("Quantity must be greater than zero.");
  }

  if (!Number.isFinite(price) || price <= 0) {
    throw new Error("Price must be greater than zero.");
  }

  if (!imageUrl) {
    throw new Error("Product image URL is required.");
  }

  const { data, error } = await supabase
    .from("products")
    .insert({
      name,
      quantity,
      price,
      description,
      image_url: imageUrl,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Product creation failed: ${error.message}`);
  }

  return data;
}

export async function getProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch products: ${error.message}`);
  }

  return data;
}