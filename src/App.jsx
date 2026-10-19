import { useEffect, useState } from "react";
import "./App.css";
import {
  uploadImage,
  createProduct,
  getProducts,
} from "./services/products.js";

function App() {
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [listings, setListings] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);

  async function loadProducts() {
    try {
      const products = await getProducts();
      setListings(products);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoadingProducts(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (!productName.trim() || !quantity || !price || !image) {
      setMessage("Please complete all required fields and select a photo.");
      return;
    }

    if (Number(quantity) <= 0 || Number(price) <= 0) {
      setMessage("Quantity and price must be greater than zero.");
      return;
    }

    setLoading(true);

    try {
      // 1. Upload the image to Supabase Storage.
      const imageUrl = await uploadImage(image);

      // 2. Save the product and image URL to PostgreSQL.
      await createProduct({
        name: productName,
        quantity,
        price,
        description,
        image_url: imageUrl,
      });

      // 3. Reset the form.
      setProductName("");
      setQuantity("");
      setPrice("");
      setDescription("");
      setImage(null);
      setImagePreview("");

      const fileInput = document.getElementById("productImage");
      if (fileInput) fileInput.value = "";

      setMessage("Product listing saved successfully!");

      // 4. Retrieve the saved listings.
      await loadProducts();
    } catch (error) {
      setMessage(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <h1>FarmLink Farmer Portal</h1>
      <p>Manage your farm products in one place.</p>

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label htmlFor="productName">Product name:</label>
          <input
            id="productName"
            type="text"
            placeholder="e.g. Tomatoes"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />
        </div>

        <div className="form-row">
          <label htmlFor="quantity">Quantity (kg):</label>
          <input
            id="quantity"
            type="number"
            min="0.01"
            step="any"
            placeholder="e.g. 10"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>

        <div className="form-row">
          <label htmlFor="price">Price per kg (₹):</label>
          <input
            id="price"
            type="number"
            min="0.01"
            step="any"
            placeholder="e.g. 40"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        <div className="form-row">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            placeholder="Describe your product..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="form-row">
          <label htmlFor="productImage">Product photo:</label>
          <input
            id="productImage"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0];

              if (file) {
                setImage(file);
                setImagePreview(URL.createObjectURL(file));
              }
            }}
            required
          />
        </div>

        {imagePreview && (
          <div>
            <p>Image preview:</p>
            <img
              src={imagePreview}
              alt="Selected product"
              className="image-preview"
            />
          </div>
        )}

        {message && <p role="status">{message}</p>}

        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? "Saving product..." : "Submit Listing"}
          </button>
        </div>
      </form>

      <section className="listings">
        <h2>My Listings</h2>

        {loadingProducts ? (
          <p>Loading products...</p>
        ) : listings.length === 0 ? (
          <p>No products listed yet.</p>
        ) : (
          <div className="product-grid">
            {listings.map((product) => (
              <article className="product-card" key={product.id}>
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="image-preview"
                />

                <h3>{product.name}</h3>
                <p>Quantity: {product.quantity} kg</p>
                <p>Price: ₹{product.price}/kg</p>
                <p>
                  {product.description || "No description provided."}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default App;