'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/store/header'
import { SearchBar } from '@/components/store/search-bar'
import { ProductCard } from '@/components/store/product-card'
import { OrderModal } from '@/components/store/order-modal'
import type { Product, Profile } from '@/lib/types'
import { Loader2, Shield, Package } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()

      // Get user
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (authUser) {
        setUser({ email: authUser.email || '' })

        // Get profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (profileData) {
          setProfile(profileData)
        }
      }

      // Fetch products
      const response = await fetch('/api/products')
      const data = await response.json()
      if (data.products) {
        setProducts(data.products)
      }

      setLoading(false)
    }

    loadData()
  }, [])

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products

    const query = searchQuery.toLowerCase()
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query)
    )
  }, [products, searchQuery])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    router.refresh()
  }

  const handleOrder = (product: Product) => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    setSelectedProduct(product)
  }

  const handleSubmitOrder = async (data: {
    contactInfo: string
    notes: string
  }) => {
    if (!selectedProduct) return

    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        productPrice: selectedProduct.price,
        contactInfo: data.contactInfo,
        notes: data.notes,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create order')
    }

    setSelectedProduct(null)
    router.push('/orders')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="grid-bg" />
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="grid-bg" />

      <Header user={user} profile={profile} onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">
              أمن سيبراني متقدم
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
            أدوات وخدمات{' '}
            <span className="text-primary">الأمن السيبراني</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
            متجر متخصص في أدوات الأمن السيبراني، هندسة الأدوات، وخدمات إدارة
            السوشيال ميديا
          </p>
        </section>

        {/* Search */}
        <section className="flex justify-center mb-12">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </section>

        {/* Products Grid */}
        <section>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h2 className="text-xl font-semibold mb-2">لا توجد منتجات</h2>
              <p className="text-muted-foreground">
                {searchQuery
                  ? 'لم يتم العثور على منتجات مطابقة للبحث'
                  : 'لم يتم إضافة منتجات بعد'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOrder={handleOrder}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Order Modal */}
      {selectedProduct && (
        <OrderModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSubmit={handleSubmitOrder}
        />
      )}
    </div>
  )
}
