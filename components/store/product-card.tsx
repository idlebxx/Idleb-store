'use client'

import type { Product } from '@/lib/types'
import { Shield } from 'lucide-react'

interface ProductCardProps {
  product: Product
  onOrder: (product: Product) => void
}

export function ProductCard({ product, onOrder }: ProductCardProps) {
  return (
    <div className="product-card">
      <div className="product-card-content">
        {/* Back - Shows first (before hover) */}
        <div className="product-card-back">
          <div className="product-card-back-content">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <Shield className="w-12 h-12 text-primary" />
            )}
            <strong className="text-lg text-center">{product.name}</strong>
            <span className="text-primary font-bold text-xl">
              {product.price.toLocaleString()} SYP
            </span>
            <button
              onClick={() => onOrder(product)}
              className="mt-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              اطلب الآن
            </button>
          </div>
        </div>

        {/* Front - Shows on hover */}
        <div className="product-card-front">
          <div className="product-card-img">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <div className="product-card-circle" />
                <div className="product-card-circle product-card-circle-right" />
                <div className="product-card-circle product-card-circle-bottom" />
              </>
            )}
          </div>

          <div className="product-card-front-content">
            {product.category && (
              <span className="product-card-badge">{product.category}</span>
            )}
            <div className="product-card-description">
              <div className="flex justify-between items-start gap-2">
                <p className="font-bold text-sm flex-1">{product.name}</p>
                <span className="text-primary font-bold text-sm whitespace-nowrap">
                  {product.price.toLocaleString()} SYP
                </span>
              </div>
              {product.description && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                  {product.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
