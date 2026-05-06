'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Package, ShoppingCart, Users, CreditCard, LogOut, 
  Plus, Edit, Trash, Eye, CheckCircle, XCircle, 
  TrendingUp, DollarSign, Settings, Bell, Search,
  Star, Clock, RefreshCw, Download, Filter
} from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  description: string
  image: string
  category: string
  stock: number
  status: 'active' | 'inactive'
  createdAt: string
}

interface Order {
  id: string
  customer: string
  email: string
  total: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  date: string
  items: number
}

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
  status: 'active' | 'banned'
  ordersCount: number
  totalSpent: number
  joinedDate: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'users'>('dashboard')
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [showProductModal, setShowProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
    revenue: 0,
    pendingOrders: 0,
    activeUsers: 0
  })

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('admin_logged_in')
    if (!isLoggedIn) {
      router.push('/admin/login')
    }
    loadData()
  }, [router])

  const loadData = () => {
    const savedProducts = localStorage.getItem('admin_products')
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts))
    } else {
      const demoProducts: Product[] = [
        {
          id: '1',
          name: 'اختبار اختراق',
          price: 299,
          description: 'خدمة اختبار اختراق متكاملة للأنظمة',
          image: '',
          category: 'خدمات',
          stock: 10,
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'حماية الشبكات',
          price: 499,
          description: 'حماية متقدمة للشبكات والبنية التحتية',
          image: '',
          category: 'خدمات',
          stock: 5,
          status: 'active',
          createdAt: new Date().toISOString()
        }
      ]
      setProducts(demoProducts)
      localStorage.setItem('admin_products', JSON.stringify(demoProducts))
    }

    const savedOrders = localStorage.getItem('admin_orders')
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders))
    } else {
      const demoOrders: Order[] = [
        {
          id: 'ORD-001',
          customer: 'أحمد محمد',
          email: 'ahmed@example.com',
          total: 299,
          status: 'pending',
          date: new Date().toISOString(),
          items: 1
        }
      ]
      setOrders(demoOrders)
      localStorage.setItem('admin_orders', JSON.stringify(demoOrders))
    }

    const savedUsers = localStorage.getItem('admin_users')
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers))
    } else {
      const demoUsers: User[] = [
        {
          id: '1',
          name: 'مدير النظام',
          email: 'admin@cybersec.com',
          role: 'admin',
          status: 'active',
          ordersCount: 0,
          totalSpent: 0,
          joinedDate: new Date().toISOString()
        }
      ]
      setUsers(demoUsers)
      localStorage.setItem('admin_users', JSON.stringify(demoUsers))
    }

    updateStats()
  }

  const updateStats = () => {
    const savedProducts = JSON.parse(localStorage.getItem('admin_products') || '[]')
    const savedOrders = JSON.parse(localStorage.getItem('admin_orders') || '[]')
    const savedUsers = JSON.parse(localStorage.getItem('admin_users') || '[]')
    
    const revenue = savedOrders.reduce((sum: number, order: Order) => 
      order.status !== 'cancelled' ? sum + order.total : sum, 0
    )
    
    setStats({
      products: savedProducts.length,
      orders: savedOrders.length,
      users: savedUsers.length,
      revenue: revenue,
      pendingOrders: savedOrders.filter((o: Order) => o.status === 'pending').length,
      activeUsers: savedUsers.filter((u: User) => u.status === 'active').length
    })
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_logged_in')
    localStorage.removeItem('admin_email')
    router.push('/admin/login')
  }

  const addProduct = (product: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }
    const updated = [...products, newProduct]
    setProducts(updated)
    localStorage.setItem('admin_products', JSON.stringify(updated))
    updateStats()
    setShowProductModal(false)
  }

  const updateProduct = (id: string, updates: Partial<Product>) => {
    const updated = products.map(p => p.id === id ? { ...p, ...updates } : p)
    setProducts(updated)
    localStorage.setItem('admin_products', JSON.stringify(updated))
    setEditingProduct(null)
    updateStats()
  }

  const deleteProduct = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      const updated = products.filter(p => p.id !== id)
      setProducts(updated)
      localStorage.setItem('admin_products', JSON.stringify(updated))
      updateStats()
    }
  }

  const updateOrderStatus = (id: string, status: Order['status']) => {
    const updated = orders.map(o => o.id === id ? { ...o, status } : o)
    setOrders(updated)
    localStorage.setItem('admin_orders', JSON.stringify(updated))
    updateStats()
  }

  const updateUserStatus = (id: string, status: 'active' | 'banned') => {
    const updated = users.map(u => u.id === id ? { ...u, status } : u)
    setUsers(updated)
    localStorage.setItem('admin_users', JSON.stringify(updated))
    updateStats()
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
    confirmed: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
    shipped: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
    delivered: 'bg-green-500/20 text-green-500 border-green-500/30',
    cancelled: 'bg-red-500/20 text-red-500 border-red-500/30'
  }

  const statusLabels = {
    pending: 'قيد الانتظار',
    confirmed: 'تم التأكيد',
    shipped: 'تم الشحن',
    delivered: 'تم التوصيل',
    cancelled: 'ملغي'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      {/* Sidebar */}
      <aside className="fixed right-0 top-0 h-full w-64 bg-gray-900/95 backdrop-blur-sm border-l border-gray-800 z-50">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-500" />
            <h1 className="font-bold text-lg text-white">لوحة التحكم</h1>
          </div>
          <p className="text-gray-500 text-xs mt-1">CyberSec Store</p>
        </div>
        
        <nav className="p-4 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
              activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>الرئيسية</span>
          </button>
          
          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
              activeTab === 'products' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>المنتجات</span>
          </button>
          
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
              activeTab === 'orders' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>الطلبات</span>
          </button>
          
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
              activeTab === 'users' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>المستخدمين</span>
          </button>
        </nav>
        
        <div className="absolute bottom-0 right-0 left-0 p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600/20 text-red-500 rounded-lg hover:bg-red-600/30 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="mr-64 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">
            {activeTab === 'dashboard' && 'لوحة المعلومات'}
            {activeTab === 'products' && 'إدارة المنتجات'}
            {activeTab === 'orders' && 'إدارة الطلبات'}
            {activeTab === 'users' && 'إدارة المستخدمين'}
          </h1>
          
          {activeTab === 'products' && (
            <button
              onClick={() => {
                setEditingProduct(null)
                setShowProductModal(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition"
            >
              <Plus className="w-4 h-4" />
              إضافة منتج
            </button>
          )}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700">
                <Package className="w-8 h-8 text-blue-500 mb-2" />
                <p className="text-gray-400 text-sm">المنتجات</p>
                <p className="text-2xl font-bold text-white">{stats.products}</p>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700">
                <ShoppingCart className="w-8 h-8 text-green-500 mb-2" />
                <p className="text-gray-400 text-sm">الطلبات</p>
                <p className="text-2xl font-bold text-white">{stats.orders}</p>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700">
                <Users className="w-8 h-8 text-purple-500 mb-2" />
                <p className="text-gray-400 text-sm">المستخدمين</p>
                <p className="text-2xl font-bold text-white">{stats.users}</p>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700">
                <DollarSign className="w-8 h-8 text-yellow-500 mb-2" />
                <p className="text-gray-400 text-sm">الإيرادات</p>
                <p className="text-2xl font-bold text-white">{stats.revenue} ₽</p>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700">
                <Clock className="w-8 h-8 text-orange-500 mb-2" />
                <p className="text-gray-400 text-sm">طلبات معلقة</p>
                <p className="text-2xl font-bold text-white">{stats.pendingOrders}</p>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700">
                <Users className="w-8 h-8 text-cyan-500 mb-2" />
                <p className="text-gray-400 text-sm">مستخدمين نشطين</p>
                <p className="text-2xl font-bold text-white">{stats.activeUsers}</p>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">أحدث الطلبات</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-right p-3 text-gray-400">رقم الطلب</th>
                      <th className="text-right p-3 text-gray-400">العميل</th>
                      <th className="text-right p-3 text-gray-400">المجموع</th>
                      <th className="text-right p-3 text-gray-400">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map(order => (
                      <tr key={order.id} className="border-b border-gray-800">
                        <td className="p-3 text-white">{order.id}</td>
                        <td className="p-3 text-white">{order.customer}</td>
                        <td className="p-3 text-white">{order.total} ₽</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs border ${statusColors[order.status]}`}>
                            {statusLabels[order.status]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
            <div className="mb-4">
              <div className="relative max-w-md">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="بحث عن منتج..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pr-10 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-right p-3 text-gray-400">المنتج</th>
                    <th className="text-right p-3 text-gray-400">السعر</th>
                    <th className="text-right p-3 text-gray-400">التصنيف</th>
                    <th className="text-right p-3 text-gray-400">المخزون</th>
                    <th className="text-right p-3 text-gray-400">الحالة</th>
                    <th className="text-right p-3 text-gray-400">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => (
                    <tr key={product.id} className="border-b border-gray-800">
                      <td className="p-3 text-white">{product.name}</td>
                      <td className="p-3 text-white">{product.price} ₽</td>
                      <td className="p-3 text-gray-400">{product.category}</td>
                      <td className="p-3 text-white">{product.stock}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs border ${
                          product.status === 'active' 
                            ? 'bg-green-500/20 text-green-500 border-green-500/30'
                            : 'bg-red-500/20 text-red-500 border-red-500/30'
                        }`}>
                          {product.status === 'active' ? 'نشط' : 'غير نشط'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingProduct(product)
                              setShowProductModal(true)
                            }}
                            className="p-1 text-blue-500 hover:bg-blue-500/20 rounded transition"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="p-1 text-red-500 hover:bg-red-500/20 rounded transition"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-right p-3 text-gray-400">رقم الطلب</th>
                    <th className="text-right p-3 text-gray-400">العميل</th>
                    <th className="text-right p-3 text-gray-400">البريد الإلكتروني</th>
                    <th className="text-right p-3 text-gray-400">المجموع</th>
                    <th className="text-right p-3 text-gray-400">عدد المنتجات</th>
                    <th className="text-right p-3 text-gray-400">التاريخ</th>
                    <th className="text-right p-3 text-gray-400">الحالة</th>
                    <th className="text-right p-3 text-gray-400">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} className="border-b border-gray-800">
                      <td className="p-3 text-white">{order.id}</td>
                      <td className="p-3 text-white">{order.customer}</td>
                      <td className="p-3 text-gray-400">{order.email}</td>
                      <td className="p-3 text-white">{order.total} ₽</td>
                      <td className="p-3 text-white">{order.items}</td>
                      <td className="p-3 text-gray-400">{new Date(order.date).toLocaleDateString('ar')}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs border ${statusColors[order.status]}`}>
                          {statusLabels[order.status]}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          {order.status === 'pending' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'confirmed')}
                              className="p-1 text-blue-500 hover:bg-blue-500/20 rounded"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {order.status === 'confirmed' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'shipped')}
                              className="p-1 text-purple-500 hover:bg-purple-500/20 rounded"
                            >
                              <Package className="w-4 h-4" />
                            </button>
                          )}
                          {order.status === 'shipped' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'delivered')}
                              className="p-1 text-green-500 hover:bg-green-500/20 rounded"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {(order.status === 'pending' || order.status === 'confirmed') && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'cancelled')}
                              className="p-1 text-red-500 hover:bg-red-500/20 rounded"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-right p-3 text-gray-400">الاسم</th>
                    <th className="text-right p-3 text-gray-400">البريد الإلكتروني</th>
                    <th className="text-right p-3 text-gray-400">الصلاحية</th>
                    <th className="text-right p-3 text-gray-400">عدد الطلبات</th>
                    <th className="text-right p-3 text-gray-400">إجمالي المشتريات</th>
                    <th className="text-right p-3 text-gray-400">تاريخ التسجيل</th>
                    <th className="text-right p-3 text-gray-400">الحالة</th>
                    <th className="text-right p-3 text-gray-400">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b border-gray-800">
                      <td className="p-3 text-white">{user.name}</td>
                      <td className="p-3 text-gray-400">{user.email}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs border ${
                          user.role === 'admin' 
                            ? 'bg-purple-500/20 text-purple-500 border-purple-500/30'
                            : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                        }`}>
                          {user.role === 'admin' ? 'مدير' : 'مستخدم'}
                        </span>
                      </td>
                      <td className="p-3 text-white">{user.ordersCount}</td>
                      <td className="p-3 text-white">{user.totalSpent} ₽</td>
                      <td className="p-3 text-gray-400">{new Date(user.joinedDate).toLocaleDateString('ar')}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs border ${
                          user.status === 'active' 
                            ? 'bg-green-500/20 text-green-500 border-green-500/30'
                            : 'bg-red-500/20 text-red-500 border-red-500/30'
                        }`}>
                          {user.status === 'active' ? 'نشط' : 'محظور'}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => updateUserStatus(user.id, user.status === 'active' ? 'banned' : 'active')}
                          className={`p-1 rounded transition ${
                            user.status === 'active' 
                              ? 'text-red-500 hover:bg-red-500/20'
                              : 'text-green-500 hover:bg-green-500/20'
                          }`}
                        >
                          {user.status === 'active' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-md">
            <div className="p-4 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">
                {editingProduct ? 'تعديل منتج' : 'إضافة منتج جديد'}
              </h2>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const productData = {
                name: formData.get('name') as string,
                price: Number(formData.get('price')),
                description: formData.get('description') as string,
                category: formData.get('category') as string,
                stock: Number(formData.get('stock')),
                status: formData.get('status') as 'active' | 'inactive'
              }
              
              if (editingProduct) {
                updateProduct(editingProduct.id, productData)
              } else {
                addProduct(productData)
              }
            }} className="p-4 space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">اسم المنتج</label>
                <input
                  name="name"
                  defaultValue={editingProduct?.name || ''}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-1">السعر</label>
                <input
                  name="price"
                  type="number"
                  defaultValue={editingProduct?.price || ''}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-1">الوصف</label>
                <textarea
                  name="description"
                  defaultValue={editingProduct?.description || ''}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-1">التصنيف</label>
                <input
                  name="category"
                  defaultValue={editingProduct?.category || ''}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-1">المخزون</label>
                <input
                  name="stock"
                  type="number"
                  defaultValue={editingProduct?.stock || ''}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-1">الحالة</label>
                <select
                  name="status"
                  defaultValue={editingProduct?.status || 'active'}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowProductModal(false)
                    setEditingProduct(null)
                  }}
                  className="flex-1 px-4 py-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {editingProduct ? 'تحديث' : 'إضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
