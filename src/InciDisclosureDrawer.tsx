import React, { useState, useMemo } from "react";
import { X, ShieldCheck, Sparkles, Copy, Check, Droplets, Leaf } from "lucide-react";
import { getProductInciDetails, InciHighlight } from "./lib/inciData";

interface InciDisclosureDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    name: string;
    slug?: string;
    category?: string;
    ingredients?: string;
    image?: string;
    price?: string;
  };
}

export default function InciDisclosureDrawer({
  isOpen,
  onClose,
  product,
}: InciDisclosureDrawerProps) {
  const [copied, setCopied] = useState(false);

  const inci = useMemo(() => getProductInciDetails(product), [product]);

  if (!isOpen) return null;

  const handleCopyInci = () => {
    if (!inci.fullInci) return;
    navigator.clipboard.writeText(inci.fullInci);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="inci-drawer-backdrop" onClick={onClose}>
      <aside
        className="inci-drawer-panel"
        onClick={(e) => e.stopPropagation()}
        aria-label="Verified INCI Formulation Drawer"
      >
        {/* Header */}
        <div className="inci-drawer-header">
          <div>
            <span className="inci-eyebrow">
              <Sparkles size={13} className="text-amber-700" />
              LABORATORY TRANSPARENCY · OFFICIAL INCI STANDARD
            </span>
            <h2 className="inci-title">{product.name}</h2>
            <span className="inci-category">{product.category || "Couture Formula"}</span>
          </div>
          <button
            type="button"
            className="inci-close-btn"
            onClick={onClose}
            aria-label="Close INCI breakdown"
          >
            <X size={18} />
          </button>
        </div>

        {/* Purity Guarantee Badges */}
        <div className="inci-purity-strip">
          {inci.badges.map((badge) => (
            <span key={badge} className="inci-purity-pill">
              <ShieldCheck size={12} />
              {badge}
            </span>
          ))}
        </div>

        {/* Scrollable Body */}
        <div className="inci-drawer-body">
          {/* Executive Summary */}
          <div className="inci-summary-card">
            <span className="inci-card-label">Formula Architecture</span>
            <p className="inci-summary-text">{inci.summary}</p>
          </div>

          {/* Key Actives & Systems */}
          {inci.highlights.length > 0 && (
            <div className="inci-section">
              <div className="inci-section-title">
                <Leaf size={14} />
                <span>Key Actives & Functional Systems</span>
              </div>
              <div className="inci-highlights-grid">
                {inci.highlights.map((h: InciHighlight) => (
                  <div key={h.name} className="inci-highlight-card">
                    <div className="inci-highlight-head">
                      <span className="inci-highlight-name">{h.name}</span>
                      {h.concentration && (
                        <span className="inci-concentration-badge">{h.concentration}</span>
                      )}
                    </div>
                    <span className="inci-highlight-role">{h.role}</span>
                    <p className="inci-highlight-benefit">{h.benefit}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full INCI Nomenclature */}
          {inci.fullInci && (
            <div className="inci-section">
              <div className="inci-section-header-row">
                <div className="inci-section-title">
                  <Droplets size={14} />
                  <span>Complete INCI Formulation</span>
                </div>
                <button
                  type="button"
                  className="inci-copy-btn"
                  onClick={handleCopyInci}
                  title="Copy full INCI list"
                >
                  {copied ? (
                    <>
                      <Check size={12} className="text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Copy INCI</span>
                    </>
                  )}
                </button>
              </div>
              <div className="inci-code-box">
                <p>{inci.fullInci}</p>
              </div>
            </div>
          )}

          {/* Application Guidance */}
          {inci.howToUse && (
            <div className="inci-section">
              <div className="inci-section-title">
                <Sparkles size={14} />
                <span>Application Ritual & Skin Synergy</span>
              </div>
              <p className="inci-ritual-text">{inci.howToUse}</p>
            </div>
          )}

          {/* Clean Standard Pledge */}
          <div className="inci-pledge-card">
            <div className="inci-pledge-header">
              <ShieldCheck size={16} />
              <span>The SheAura Laboratory Standard</span>
            </div>
            <p>
              We formulate without compromise. Every active, emollient, and mineral pigment is
              biocompatible, dermatologically vetted, and free from parabens, phthalates, and animal
              derivatives. Crafted for comfort, long wear, and authentic radiance.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="inci-drawer-footer">
          <span>SHE’AURA MAISON · ALL RIGHTS RESERVED</span>
          <button type="button" className="inci-done-btn" onClick={onClose}>
            Close Standard
          </button>
        </div>
      </aside>
    </div>
  );
}
