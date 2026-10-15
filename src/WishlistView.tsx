import React, { useState } from "react";
import {
  Heart,
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  Trash2,
  Sparkles,
  Share2,
  Check,
  CheckCircle2,
  Eye,
  Layers,
} from "lucide-react";
import { Product } from "./lib/cartWishlistContext";

interface WishlistViewProps {
  wishlist: Product[];
  onRemoveFromWishlist: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onMoveAllToCart: () => void;
  onBackToStore: () => void;
  onOpenCart: () => void;
  onOpenRunway?: () => void;
  onSelectProduct: (product: Product) => void;
  cartCount: number;
}

export default function WishlistView({
  wishlist,
  onRemoveFromWishlist,
  onAddToCart,
  onMoveAllToCart,
  onBackToStore,
  onOpenCart,
  onOpenRunway,
  onSelectProduct,
  cartCount,
}: WishlistViewProps) {
  const [toastMessage, setToastMessage] = useState<string>("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4500);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast("✓ Wishlist sanctuary link copied to clipboard!");
    } else {
      showToast("✓ Link ready to share!");
    }
  };

  const handleMoveAll = () => {
    onMoveAllToCart();
    showToast(`✓ Moved all ${wishlist.length} pieces to your Haute Couture Bag!`);
  };

  return (
    <main className="wishlist-page-wrapper">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="wishlist-toast">
          <div className="wishlist-toast-content">
            <CheckCircle2 size={16} strokeWidth={2.2} style={{ color: "#10b981", flexShrink: 0 }} />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            className="wishlist-toast-action-btn"
            onClick={onOpenCart}
          >
            <span>Go to Bag</span>
            <ArrowRight size={13} strokeWidth={2.2} />
          </button>
        </div>
      )}

      {/* Top Header */}
      <header className="wishlist-page-header">
        <div className="wishlist-header-inner shell">
          <button
            type="button"
            className="wishlist-back-btn"
            onClick={onBackToStore}
          >
            <ArrowLeft size={16} strokeWidth={2} />
            <span>Return to Storefront</span>
          </button>

          <div className="wishlist-brand-center" onClick={onBackToStore}>
            <span className="wishlist-brand-title">SHE’AURA</span>
            <span className="wishlist-brand-sub">SANCTUARY OF DESIRES</span>
          </div>

          <div className="wishlist-header-actions">
            <button
              type="button"
              className="wishlist-bag-btn"
              onClick={onOpenCart}
              title="Open Haute Cart & Checkout"
              aria-label="View Shopping Bag"
            >
              <ShoppingBag size={17} strokeWidth={1.8} />
              <span className="wishlist-bag-text">Haute Bag</span>
              <span className="wishlist-bag-badge">{cartCount}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="wishlist-container shell">
        {/* Editorial Subheading & Actions Bar */}
        <div className="wishlist-intro-bar">
          <div className="wishlist-heading-group">
            <div className="wishlist-monogram-badge">
              <Heart size={18} strokeWidth={2} fill="#dfb895" color="#dfb895" />
            </div>
            <div>
              <h1 className="wishlist-title">Your Curated Desires</h1>
              <p className="wishlist-subtitle">
                {wishlist.length === 0
                  ? "Your sanctuary is waiting to be filled with pieces you adore."
                  : `${wishlist.length} ${
                      wishlist.length === 1 ? "Piece" : "Pieces"
                    } saved for your upcoming beauty rituals.`}
              </p>
            </div>
          </div>

          {wishlist.length > 0 && (
            <div className="wishlist-top-actions">
              <button
                type="button"
                className="wishlist-share-btn"
                onClick={handleShare}
                title="Share your wishlist link"
              >
                <Share2 size={14} strokeWidth={2} />
                <span>Share Sanctuary</span>
              </button>

              <button
                type="button"
                className="wishlist-move-all-btn"
                onClick={handleMoveAll}
                title="Move all wishlisted pieces directly to bag"
              >
                <ShoppingBag size={14} strokeWidth={2} />
                <span>Move All to Bag ({wishlist.length})</span>
              </button>
            </div>
          )}
        </div>

        {/* Content View */}
        {wishlist.length === 0 ? (
          <div className="wishlist-empty-state">
            <div className="wishlist-empty-icon-wrap">
              <Heart size={48} strokeWidth={1.2} style={{ color: "#c18847" }} />
            </div>
            <h2>Your Sanctuary is Empty</h2>
            <p>
              Explore our Parisian-inspired wardrobe of buildable lip colours, cashmere finish powders, and luminous botanical elixirs. Tap the heart on any piece to save it here.
            </p>
            <div className="wishlist-empty-actions">
              <button
                type="button"
                className="wishlist-explore-btn"
                onClick={onBackToStore}
              >
                <span>Discover The Collection</span>
                <ArrowRight size={15} strokeWidth={2} />
              </button>
            </div>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlist.map((product) => {
              const key = product.id || product.slug || product.name;
              return (
                <article key={key} className="wishlist-card">
                  {/* Photo & Badge */}
                  <div className="wishlist-card-media">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="wishlist-card-img"
                      onClick={() => onSelectProduct(product)}
                    />
                    {product.tag && (
                      <span className="wishlist-card-tag">{product.tag}</span>
                    )}
                    <button
                      type="button"
                      className="wishlist-remove-btn"
                      onClick={() => {
                        onRemoveFromWishlist(product.id || product.slug || product.name);
                        showToast(`Removed ${product.name} from Wishlist`);
                      }}
                      title="Remove piece from wishlist"
                      aria-label="Remove piece"
                    >
                      <Trash2 size={14} strokeWidth={2} />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="wishlist-card-body">
                    <div className="wishlist-category-row">
                      <span className="wishlist-card-category">{product.category}</span>
                      <span className="wishlist-stock-pill in-stock">● In Stock</span>
                    </div>

                    <h3
                      className="wishlist-card-title"
                      onClick={() => onSelectProduct(product)}
                    >
                      {product.name}
                    </h3>

                    <p className="wishlist-card-mood">{product.mood || product.note || product.finish}</p>

                    <div className="wishlist-card-price-row">
                      <b className="wishlist-card-price">{product.price}</b>
                      {product.tone && (
                        <div className="wishlist-swatch-wrap" title={`Tone swatch`}>
                          <span
                            className="wishlist-swatch-dot"
                            style={{ backgroundColor: product.tone }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="wishlist-card-actions">
                      <button
                        type="button"
                        className="wishlist-add-bag-btn"
                        onClick={() => {
                          onAddToCart(product);
                          showToast(`✓ Added ${product.name} to your Haute Bag!`);
                        }}
                      >
                        <ShoppingBag size={14} strokeWidth={2} />
                        <span>Add to Bag</span>
                      </button>

                      <button
                        type="button"
                        className="wishlist-inspect-btn"
                        onClick={() => onSelectProduct(product)}
                        title="View full piece details"
                      >
                        <Eye size={14} strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Editorial Runway Feature Banner */}
        <div className="wishlist-editorial-banner">
          <div className="editorial-banner-content">
            <span className="editorial-eyebrow">
              <Sparkles size={13} strokeWidth={2} style={{ color: "#dfb895" }} />
              <span>THE 20-LOOK CINEMATIC RUNWAY</span>
            </span>
            <h2>Experience The Formulas In Continuous Motion.</h2>
            <p>
              Watch our live 20-look multi-camera runway atelier, see shades melt into real skin, and shop looks straight from motion.
            </p>
            <button
              type="button"
              className="editorial-runway-cta"
              onClick={() => {
                if (onOpenRunway) {
                  onOpenRunway();
                } else {
                  window.location.href = "/runway";
                }
              }}
            >
              <span>Enter Runway Cinema (20 Looks)</span>
              <ArrowRight size={15} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
