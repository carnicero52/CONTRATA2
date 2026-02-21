'use client';

import { useState } from 'react';
import { 
  registerCompany, 
  login, 
  getCurrentCompany 
} from '@/lib/storage';
import { useRouter } from 'next/navigation';
import { Building2, Users, FileText, CheckCircle } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    socialMedia: ''
  });

  const handleLogin = async () => {
    setLoading(true);
    setMessage(null);
    
    const company = login(formData.email, formData.password);
    
    if (company) {
      setMessage({ type: 'success', text: '¡Bienvenido!' });
      router.push('/admin');
    } else {
      setMessage({ type: 'error', text: 'Email o contraseña incorrectos' });
    }
    
    setLoading(false);
  };

  const handleRegister = async () => {
    setLoading(true);
    setMessage(null);
    
    if (!formData.name || !formData.email || !formData.password) {
      setMessage({ type: 'error', text: 'Nombre, email y contraseña son requeridos' });
      setLoading(false);
      return;
    }

    const result = registerCompany(formData);
    
    if (result.success) {
      setMessage({ type: 'success', text: result.message });
      setIsLogin(true);
    } else {
      setMessage({ type: 'error', text: result.message });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-800">ContrataFácil</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Recepción de Currículums <span className="text-blue-600">Simplificada</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Crea tu página de empleo y recibe currículums automáticamente.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <Users className="w-10 h-10 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Gestiona Candidatos</h3>
              <p className="text-gray-500 text-sm">Organiza y filtra candidatos por estado</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <FileText className="w-10 h-10 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Recibe CVs</h3>
              <p className="text-gray-500 text-sm">Los candidatos suben su CV directamente</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <CheckCircle className="w-10 h-10 text-purple-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Exporta Datos</h3>
              <p className="text-gray-500 text-sm">Descarga todo en CSV cuando quieras</p>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Form */}
      <section className="pb-16 px-4">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => { setIsLogin(true); setMessage(null); }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition ${isLogin ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => { setIsLogin(false); setMessage(null); }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition ${!isLogin ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
            >
              Registrarse
            </button>
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message.text}
            </div>
          )}

          <div className="space-y-4">
            {!isLogin && (
              <input
                type="text"
                placeholder="Nombre del negocio *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
            
            <input
              type="email"
              placeholder="Email *"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <input
              type="password"
              placeholder="Contraseña *"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            {!isLogin && (
              <>
                <input
                  type="tel"
                  placeholder="Teléfono"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Dirección"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </>
            )}

            <button
              onClick={isLogin ? handleLogin : handleRegister}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? 'Procesando...' : isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-8 px-4 text-center">
        <p className="text-sm">ContrataFácil - Sistema de Recepción de Currículums</p>
        <p className="text-xs mt-2">Versión Simple - Datos guardados localmente</p>
      </footer>
    </div>
  );
}
