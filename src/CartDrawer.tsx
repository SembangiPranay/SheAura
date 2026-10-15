import React from "react";
import {
  ShoppingBag,
  X,
  Trash2,
  Plus,
  Minus,
  Heart,
  Sparkles,
  ShieldCheck,
  Gift,
  ArrowRight,
} from "lucide-react";
import { CartItem, Product } from "./lib/cartWishlistContext";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onMoveToWishlist: (item: CartItem) => void;
  onOpenFullCart: () => void;
  onOpenCheckout: () => void;
  onSelectProduct: (product: Product) => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onMoveToWishlist,
  onOpenFullCart,
  onOpenCheckout,
  onSelectProduct,
}: CartDrawerProps) {
  if (!isOpen) return null;

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.priceNum * item.quantity,
    0
  );
  const freeShippingThreshold = 1500;
  const freeShippingRemaining = Math.max(0, freeShippingThreshold - subtotal);
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const progressPercent = Math.min(
    100,
    Math.round((subtotal / freeShippingThreshold) * 100)
  );

  return (
    <div className="cart-drawer-backdrop" onClick={onClose}>
      <aside
        className="cart-drawer-panel"
        onClick={(e) => e.stopPropagation()}
        aria-label="Shopping Bag Drawer"
      >
        {/* Top Header */}
        <div className="cart-drawer-header">
          <div className="cart-drawer-title-group">
            <div className="cart-drawer-icon-wrap">
              <ShoppingBag size={18} strokeWidth={2} style={{ color: "#dfb895" }} />
            </div>
            <div>
              <h2 className="cart-drawer-title">HAUTE COUTURE BAG</h2>
              <span className="cart-drawer-count">
                {totalItems} {totalItems === 1 ? "Piece" : "Pieces"} Curated
              </span>
            </div>
          </div>
          <button
            type="button"
            className="cart-drawer-close-btn"
            onClick={onClose}
            aria-label="Close Shopping Bag"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Free Delivery Indicator */}
        <div className="cart-free-shipping-card">
          <div className="cart-free-shipping-top">
            <span className="cart-free-shipping-label">
              <Sparkles size={13} strokeWidth={2} style={{ color: "#c18847" }} />
              {isFreeShipping ? (
                <b>Complimentary Haute Delivery Unlocked!</b>
              ) : (
                <span>
                  Add <b>₹{freeShippingRemaining.toLocaleString("en-IN")}</b> more for Complimentary Delivery
                </span>
              )}
            </span>
            <span className="cart-free-shipping-pct">{progressPercent}%</span>
          </div>
          <div className="cart-free-shipping-bar">
            <div
              className="cart-free-shipping-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="cart-drawer-body">
          {cartItems.length === 0 ? (
            <div className="cart-empty-state">
              <div className="cart-empty-icon">
                <ShoppingBag size={40} strokeWidth={1.2} style={{ color: "#a88272" }} />
              </div>
              <h3 className="cart-empty-title">Your Bag is Empty</h3>
              <p className="cart-empty-subtitle">
                Explore our botanical lip colours, soft-focus blush silks, and radiant couture formulas.
              </p>
              <button
                type="button"
                className="cart-empty-cta"
                onClick={() => {
                  onClose();
                  setTimeout(() => {
                    document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
              >
                <span>Discover The First Drop</span>
                <ArrowRight size={14} strokeWidth={2} />
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item-card">
                  {/* Item Image */}
                  <div
                    className="cart-item-image-wrap"
                    onClick={() => {
                      onSelectProduct(item.product);
                      onClose();
                    }}
                    title={`View ${item.product.name}`}
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="cart-item-image"
                    />
                    {item.selectedTone && (
                      <span
                        className="cart-item-tone-dot"
                        style={{ backgroundColor: item.selectedTone }}
                      />
                    )}
                  </div>

                  {/* Item Info */}
                  <div className="cart-item-info">
                    <div className="cart-item-header-row">
                      <span className="cart-item-category">
                        {item.product.category}
                      </span>
                      <b className="cart-item-price">
                        ₹{(item.priceNum * item.quantity).toLocaleString("en-IN")}
                      </b>
                    </div>

                    <h4
                      className="cart-item-name"
                      onClick={() => {
                        onSelectProduct(item.product);
                        onClose();
                      }}
                    >
                      {item.product.name}
                    </h4>

                    {item.selectedShade && (
                      <span className="cart-item-shade">
                        Shade: {item.selectedShade}
                      </span>
                    )}

                    {/* Stepper & Actions */}
                    <div className="cart-item-actions-row">
                      <div className="cart-stepper">
                        <button
                          type="button"
                          className="cart-stepper-btn"
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} strokeWidth={2} />
                        </button>
                        <span className="cart-stepper-value">{item.quantity}</span>
                        <button
                          type="button"
                          className="cart-stepper-btn"
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} strokeWidth={2} />
                        </button>
                      </div>

                      <div className="cart-item-sub-actions">
                        <button
                          type="button"
                          className="cart-action-icon-btn"
                          onClick={() => onMoveToWishlist(item)}
                          title="Save to Wishlist"
                        >
                          <Heart size={14} strokeWidth={1.8} />
                          <span className="sr-only">Wishlist</span>
                        </button>
                        <button
                          type="button"
                          className="cart-action-icon-btn delete"
                          onClick={() => onRemoveItem(item.id)}
                          title="Remove piece from bag"
                        >
                          <Trash2 size={14} strokeWidth={1.8} />
                          <span className="sr-only">Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {cartItems.length > 0 && (
          <div className="cart-drawer-footer">
            {/* Complimentary Gift Box Banner */}
            <div className="cart-gift-packaging-pill">
              <Gift size={14} strokeWidth={2} style={{ color: "#c18847" }} />
              <span>Includes Signature She’Aura Silk Box with Gold Ribbon</span>
            </div>

            {/* Subtotal & Delivery Row */}
            <div className="cart-summary-lines">
              <div className="cart-summary-line">
                <span>Subtotal</span>
                <b>₹{subtotal.toLocaleString("en-IN")}</b>
              </div>
              <div className="cart-summary-line">
                <span>Haute Maison Shipping</span>
                <span className={isFreeShipping ? "shipping-free-tag" : ""}>
                  {isFreeShipping ? "FREE" : "₹150"}
                </span>
              </div>
              <div className="cart-summary-line grand-total">
                <span>Estimated Total</span>
                <span className="total-val">
                  ₹{(subtotal + (isFreeShipping ? 0 : 150)).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="cart-drawer-buttons">
              <button
                type="button"
                className="cart-primary-checkout-btn"
                onClick={onOpenCheckout}
              >
                <span>Proceed to Couture Checkout</span>
                <ArrowRight size={15} strokeWidth={2} />
              </button>
              <button
                type="button"
                className="cart-secondary-view-btn"
                onClick={onOpenFullCart}
              >
                <span>View Full Bag & Promo Details</span>
              </button>
            </div>

            {/* Security Guarantee */}
            <div className="cart-security-badge">
              <ShieldCheck size={13} strokeWidth={2} style={{ color: "#059669" }} />
              <span>Authentic Botanical Formula · Encrypted Checkout · Easy Returns</span>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
