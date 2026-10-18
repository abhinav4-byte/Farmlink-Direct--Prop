import { useEffect, useState } from "react";
import {
  uploadImage,
  createProduct,
  getProducts,
} from "./services/products.js";

function App() {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("50");
  const [price, setPrice] = useState("40");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);

  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);

  async function loadProducts() {
    setLoadingProducts(true);

    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      setStatus(`Could not load products: ${error.message}`);
    } finally {
      setLoadingProducts(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("");
    setLoading(true);

    try {
      setStatus("Uploading image...");
      const imageUrl = await uploadImage(file);

      setStatus("Saving product...");
      await createProduct({
        name,
        quantity,
        price,
        description,
        image_url: imageUrl,
      });

      setStatus("Product created successfully!");

      setName("");
      setQuantity("50");
      setPrice("40");
      setDescription("");
      setFile(null);

      const fileInput = document.getElementById("product-image");
      if (fileInput) {
  	fileInput.value = "";
      }

      await loadProducts();
    } catch (error) {
      setStatus(`Operation failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: "850px",
        margin: "40px auto",
        padding: "0 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>FarmLink Direct</h1>
      <p>Farmer Product Listing Practice</p>

      <h2>Create a product</h2>

      <form onSubmit={handleSubmit}>
        <p>
          <label>
            Product name
            <br />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
        </p>

        <p>
          <label>
            Quantity (kg)
            <br />
            <input
              type="number"
              min="0.01"
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </label>
        </p>

        <p>
          <label>
            Price per kg (₹)
            <br />
            <input
              type="number"
              min="0.01"
              step="any"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </label>
        </p>

        <p>
          <label>
            Description
            <br />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
        </p>

        <p>
          <label>
            Product image
            <br />
            <input
	      id="product-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              required
            />
          </label>
        </p>

        <button type="submit" disabled={loading || !file}>
          {loading ? "Saving..." : "Create product"}
        </button>
      </form>

      <p role="status">{status}</p>

      <hr />

      <h2>My Listings</h2>

      {loadingProducts && <p>Loading products...</p>}

      {!loadingProducts && products.length === 0 && (
        <p>No products listed yet.</p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
        }}
      >
        {products.map((product) => (
          <article
            key={product.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "15px",
            }}
          >
            <img
              src={product.image_url}
              alt={product.name}
              style={{
                width: "100%",
                height: "160px",
                objectFit: "cover",
              }}
            />

            <h3>{product.name}</h3>
            <p>Quantity: {product.quantity} kg</p>
            <p>Price: ₹{product.price}/kg</p>
            <p>{product.description || "No description provided."}</p>
            <small>
              Added: {new Date(product.created_at).toLocaleString()}
            </small>
          </article>
        ))}
      </div>
    </main>
  );
}

export default App;