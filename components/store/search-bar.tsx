'use client'

import { Search, SlidersHorizontal } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onFilterClick?: () => void
}

export function SearchBar({ value, onChange, onFilterClick }: SearchBarProps) {
  return (
    <div className="search-container">
      <div className="search-glow" />
      <div className="search-dark-border" />
      <div className="search-dark-border" />
      <div className="search-dark-border" />
      <div className="search-white" />
      <div className="search-border" />

      <div className="relative">
        <input
          type="text"
          placeholder="ابحث عن المنتجات..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="search-input"
          dir="rtl"
        />

        <button
          onClick={onFilterClick}
          className="filter-icon hover:bg-primary/20 transition-colors"
        >
          <SlidersHorizontal className="w-5 h-5 text-muted-foreground" />
        </button>

        <div className="search-icon">
          <Search className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>
    </div>
  )
}
