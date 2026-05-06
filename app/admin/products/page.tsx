'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Edit, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  category: string | null
  is_active: boolean
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image_url: '',
    is_active: true
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setProducts(data)
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const supabase = createClient()
    const productData = {
      name: formData.name,
      description: formData.description || null,
      price: parseFloat(formData.price),
      category: formData.category || null,
      image_url: formData.image_url || null,
      is_active: formData.is_active
    }

    let error
    if (editingProduct) {
      const { error: updateError } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id)
      error = updateError
    } else {
      const { error: insertError } = await supabase
        .from('products')
        .insert([productData])
      error = insertError
    }

    if (!error) {
      fetchProducts()
      closeModal()
    }
    setSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return
    
    const supabase = createClient()
    await supabase.from('products').delete().eq('id', id)
    fetchProducts()
  }

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    const supabase = createClient()
    await supabase
      .from('products')
      .update({ is_active: !currentActive })
      .eq('id', id)
    fetchProducts()
  }

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        category: product.category || '',
        image_url: product.image_url || '',
        is_active: product.is_active
      })
    } else {
      setEditingProduct(null)
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        image_url: '',
        is_active: true
      })
    }
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingProduct(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">إدارة المنتجات</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          إضافة منتج
        </button>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr className="border-b">
              <th className="text-right p-3">الصورة</th>
              <th className="text-right p-3">الاسم</th>
              <th className="text-right p-3">السعر</th>
              <th className="text-right p-3">التصنيف</th>
              <th className="text-right p-3">الحالة</th>
              <th className="text-right p-3">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-8 text-muted-foreground">
                  لا توجد منتجات
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="border-b hover:bg-muted/30">
                  <td className="p-3">
                    {product.image_url ? (
                      <Image 
                        src={product.image_url} 
                        alt={product.name}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-xs">
                        لا صورة
                      </div>
                    )}
                  </td>
                  <td className="p-3 font-medium">{product.name}</td>
                  <td className="p-3">{product.price} ₽</td>
                  <td className="p-3">{product.category || '-'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      product.is_active 
                        ? 'bg-green-500/10 text-green-500' 
                        : 'bg-red-500/10 text-red-500'
                    }`}>
                      {product.is_active ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(product)}
                        className="p-1 hover:text-blue-500 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(product.id, product.is_active)}
                        className="p-1 hover:text-yellow-500 transition-colors"
                      >
                        {product.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-1 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg w-full max-w-md">
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold">
                {editingProduct ? 'تعديل منتج' : 'إضافة منتج جديد'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm mb-1">اسم المنتج *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-background border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-1">الوصف</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-background border rounded-lg"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm mb-1">السعر *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 bg-background border rounded-lg"
                  required
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">التصنيف</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-background border rounded-lg"
                  placeholder="مثال: أدوات, خدمات, ..."
                />
              </div>

              <div>
                <label className="block text-sm mb-1">رابط الصورة</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-3 py-2 bg-background border rounded-lg"
                  placeholder="https://..."
                />
                {formData.image_url && (
                  <div className="mt-2">
                    <Image 
                      src={formData.image_url} 
                      alt="Preview"
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="is_active" className="text-sm">منتج نشط</label>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-muted transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  {submitting ? 'جاري الحفظ...' : (editingProduct ? 'تحديث' : 'إضافة')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
