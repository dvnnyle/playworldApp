import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./Products.css";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState(null); // Start null to know if loaded yet
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Helper for haptic feedback
  const vibrate = () => {
    if (navigator.vibrate) navigator.vibrate(30);
  };

  // Load quantities from localStorage on mount
  useEffect(() => {
    const savedQuantities = localStorage.getItem("productQuantities");
    if (savedQuantities) {
      setQuantities(JSON.parse(savedQuantities));
    } else {
      setQuantities({}); // no saved quantities
    }
  }, []);

  // Save quantities to localStorage whenever quantities change (but only after loaded)
  useEffect(() => {
    if (quantities !== null) {
      localStorage.setItem("productQuantities", JSON.stringify(quantities));
    }
  }, [quantities]);

  useEffect(() => {
    document.body.classList.add("products-page-body");
    return () => {
      document.body.classList.remove("products-page-body");
    };
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const productsRef = collection(db, "products");
        const q = query(productsRef, orderBy("category"));
        const productSnapshot = await getDocs(q);
        const productList = productSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productList);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading || quantities === null) {
    // Wait until quantities loaded from localStorage and products loaded
    return <div className="loading">Laster produkter...</div>;
  }

  const groupedProducts = products.reduce((groups, product) => {
    const category = product.category || "Other";
    if (!groups[category]) groups[category] = [];
    groups[category].push(product);
    return groups;
  }, {});

  Object.keys(groupedProducts).forEach(category => {
    groupedProducts[category].sort((a, b) => a.price - b.price);
  });

  const incrementQuantity = (productId) => {
    setQuantities(prev => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
  };

  const decrementQuantity = (productId) => {
    setQuantities(prev => {
      const current = prev[productId] || 0;
      return { ...prev, [productId]: current > 0 ? current - 1 : 0 };
    });
  };

  const totalQuantity = Object.values(quantities).reduce((sum, q) => sum + q, 0);
  const totalPrice = products.reduce(
    (sum, p) => sum + (quantities[p.id] || 0) * p.price,
    0
  );

  const handleAddAllToCart = () => {
    const selectedProducts = products.filter(p => quantities[p.id] > 0);
    if (selectedProducts.length === 0) {
      alert("Velg antall billetter før du går videre til betaling.");
      return;
    }

    const cartItems = selectedProducts.map(p => ({
      productId: p.id,
      name: p.name,
      quantity: quantities[p.id],
      price: p.price,
      category: p.category, // <-- ensure this is included
      type: p.type,         // <-- ensure this is included
            duration: p.duration,         // <-- ensure this is included

    }));

    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    navigate("/mycart");
  };

  const getCategoryImage = (category) => {
    switch (category?.toLowerCase()) {
      case "golf":
        return require("../assets/Minigolf.webp"); // <-- your golf image
      case "lek":
        return require("../assets/Lekeland.webp");
      case "tilbehør":
        return require("../assets/Tilbehør.webp");
      case "annet":
        return require("../assets/pws.png");
      default:
        return require("../assets/pws.png");
    }
  };

  return (
    <div className="products-wrapper">
      <div className="global-rectangle">
        <h1 className="global-title">BILLETTER</h1>
      </div>

      <div className="products-container">
        {Object.entries(groupedProducts).map(([category, items]) => (
          <div key={category} className="category-group">
            <h3 className="category-title">🚀 {category.toUpperCase()}</h3>
            <ul className="products-list">
              {items.map(product => (
                <li key={product.id} className="product-card">
                  <img
                    src={
                      product.imageUrl || getCategoryImage(product.category)
                    }
                    alt={product.name}
                    className="product-image"
                  />
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <strong>{product.price} kr</strong>
                  </div>

                  <div className="quantity-controls-container">
                    <div className="quantity-controls">
                      <button
                        className="qty-btn"
                        onClick={() => {
                          vibrate();
                          decrementQuantity(product.id);
                        }}
                        aria-label={`Decrease quantity for ${product.name}`}
                      >
                        –
                      </button>
                      <span className="qty-display">{quantities[product.id] || 0}</span>
                      <button
                        className="qty-btn"
                        onClick={() => {
                          vibrate();
                          incrementQuantity(product.id);
                        }}
                        aria-label={`Increase quantity for ${product.name}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="logo-div">
        <img src={require('../assets/logo.png')} alt="Logo" className="logo-image" />
      </div>

      {/* Only show summary if any product quantity > 0 */}
      {totalQuantity > 0 && (
        <div className="summary-card">
          <h4 className="summary-title">SAMMENDRAG</h4>
          <div className="summary-section">
            <ul className="summary-list">
              {products
                .filter(p => quantities[p.id] > 0)
                .map(p => (
                  <li key={p.id} className="summary-item">
                    {quantities[p.id]}x {p.name} = {quantities[p.id] * p.price} kr
                  </li>
                ))}
            </ul>
            <p className="summary-total">
              Total: <strong>{totalPrice} kr</strong>
            </p>
          </div>

          <div className="add-all-container">
            <button
              className="add-all-btn"
              onClick={() => {
                vibrate();
                handleAddAllToCart();
              }}
            >
              Gå til betaling
            </button>
            <button
              className="clear-btn"
              onClick={() => {
                vibrate();
                setQuantities({});
              }}
            >
              Fjern alt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
