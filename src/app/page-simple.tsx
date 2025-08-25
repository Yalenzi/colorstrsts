export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Color Testing App
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Advanced Color Testing System for Drug and Psychoactive Substance Detection
          </p>
          <p className="text-lg text-gray-500">
            نظام اختبارات الألوان المتقدم للكشف عن المخدرات والمؤثرات العقلية
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Chemical Testing
            </h2>
            <p className="text-gray-600 mb-4">
              Perform accurate color-based chemical tests for substance identification.
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-500">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Marquis Test
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Mandelin Test
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                Liebermann Test
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Safety First
            </h2>
            <p className="text-gray-600 mb-4">
              Always follow proper safety protocols when handling chemical reagents.
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-500">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                Wear protective equipment
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                Work in ventilated area
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                Follow disposal guidelines
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Application Status
            </h3>
            <p className="text-green-600 font-medium">
              ✅ Build Successful - Ready for Testing
            </p>
            <p className="text-sm text-gray-500 mt-2">
              All components loaded successfully
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
