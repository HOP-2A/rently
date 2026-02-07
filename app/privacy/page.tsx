"use client";

import Link from "next/link";
import {
  Home,
  Shield,
  Lock,
  Eye,
  Database,
  Mail,
  FileText,
  Phone,
} from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-lg border-b-2 border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/30 group-hover:shadow-xl group-hover:shadow-teal-500/40 transition-all group-hover:scale-105">
                <Home className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">
                RENTLY
              </span>
            </Link>

            <Link
              href="/"
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-500 text-white font-bold hover:from-teal-700 hover:to-teal-600 shadow-lg shadow-teal-500/30 transition-all hover:scale-105"
            >
              Буцах
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl mb-6 shadow-lg">
            <Shield className="w-6 h-6 text-blue-600" />
            <span className="text-base font-bold text-blue-700">
              Нууцлалын бодлого
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
            Таны хувийн мэдээлэл
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Бид таны хувийн мэдээллийг хэрхэн цуглуулж, ашиглаж, хамгаалж
            байгааг тодорхой заасан
          </p>
          <p className="text-sm text-gray-500 mt-3">
            Сүүлд шинэчлэгдсэн: 2026 оны 2-р сарын 7
          </p>
        </div>

        <div className="space-y-8">
          <section className="bg-white rounded-3xl border-2 border-gray-200 p-8 shadow-xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
                <Database className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  1. Цуглуулдаг мэдээлэл
                </h2>
                <p className="text-gray-600">
                  Таны үйлчилгээг ашиглах явцад бидний цуглуулдаг мэдээллийн
                  төрлүүд
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="pl-6 border-l-4 border-blue-500">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Хувийн мэдээлэл
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>
                      <strong>Хэрэглэгчийн нэр:</strong> Таны системд нэвтрэх
                      нэр
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>
                      <strong>Нэр:</strong> Таны бүтэн нэр (хэрэв өгсөн бол)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>
                      <strong>Имэйл хаяг:</strong> Таны холбоо барих имэйл
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>
                      <strong>Утасны дугаар:</strong> Таны холбоо барих утас
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>
                      <strong>Хаяг:</strong> Таны зарын байршил
                    </span>
                  </li>
                </ul>
              </div>

              <div className="pl-6 border-l-4 border-indigo-500">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Автоматаар цуглуулдаг мэдээлэл
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">•</span>
                    <span>
                      <strong>IP хаяг:</strong> Таны интернет холболтын хаяг
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">•</span>
                    <span>
                      <strong>Төхөөрөмжийн мэдээлэл:</strong> Браузер, үйлдлийн
                      систем
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">•</span>
                    <span>
                      <strong>Cookies:</strong> Таны үйлчилгээг ашиглах
                      туршлагыг сайжруулах
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">•</span>
                    <span>
                      <strong>Үйл ажиллагааны түүх:</strong> Хадгалсан зарууд,
                      хүсэлтүүд
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-3xl border-2 border-gray-200 p-8 shadow-xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 flex-shrink-0">
                <Eye className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  2. Мэдээллийг хэрхэн ашигладаг вэ
                </h2>
                <p className="text-gray-600">
                  Таны мэдээллийг дараах зорилгоор ашигладаг
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-2xl border-2 border-purple-200">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                  Үйлчилгээ үзүүлэх
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Account үүсгэх, удирдах</li>
                  <li>• Зар оруулах, харах, хадгалах</li>
                  <li>• Түрээсийн хүсэлт илгээх/хүлээн авах</li>
                  <li>• Хэрэглэгчдийн хоорондын холбоо барих</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border-2 border-blue-200">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  Сайжруулах
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Үйлчилгээний чанарыг дээшлүүлэх</li>
                  <li>• Хэрэглэгчийн туршлагыг сайжруулах</li>
                  <li>• Шинэ функц нэмэх</li>
                  <li>• Техникийн асуудал шийдвэрлэх</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-200">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  Харилцаа холбоо
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Мэдэгдэл илгээх</li>
                  <li>• Шинэ мэдээлэл хүргэх</li>
                  <li>• Хүсэлтийн хариу өгөх</li>
                  <li>• Нууц үг сэргээх</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-2xl border-2 border-orange-200">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
                  Аюулгүй байдал
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Залилан мэхлэлт илрүүлэх</li>
                  <li>• Хууль зөрчилтөөс сэргийлэх</li>
                  <li>• Хэрэглэгчийн эрхийг хамгаалах</li>
                  <li>• Системийн аюулгүй байдал</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-3xl border-2 border-gray-200 p-8 shadow-xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30 flex-shrink-0">
                <Lock className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  3. Мэдээллийн хамгаалалт
                </h2>
                <p className="text-gray-600">
                  Таны мэдээллийг хамгаалахын тулд авч байгаа арга хэмжээнүүд
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
                <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">🔐</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Шифрлэлт</h3>
                  <p className="text-sm text-gray-700">
                    Бүх мэдээлэл SSL/TLS протоколоор шифрлэгдсэн байдлаар
                    дамжуулагдана
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">🛡️</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">
                    Нууц үгийн аюулгүй байдал
                  </h3>
                  <p className="text-sm text-gray-700">
                    Нууц үг хэш хийгдэж, өөрийн эх хэлбэрээр хадгалагддаггүй
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border-2 border-purple-200">
                <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">🔒</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">
                    Хандалтын хяналт
                  </h3>
                  <p className="text-sm text-gray-700">
                    Зөвхөн эрх бүхий ажилтнууд л мэдээлэлд хандах боломжтой
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border-2 border-orange-200">
                <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">💾</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">
                    Нөөц хадгалалт
                  </h3>
                  <p className="text-sm text-gray-700">
                    Өгөгдлийн нөөц хадгалалт тогтмол хийгдэж, сэргээх боломжтой
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-3xl border-2 border-gray-200 p-8 shadow-xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30 flex-shrink-0">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  4. Таны эрх
                </h2>
                <p className="text-gray-600">
                  Өөрийн хувийн мэдээллийн талаар таны эдэлдэг эрхүүд
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="p-5 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border-2 border-red-200">
                <h3 className="font-bold text-gray-900 mb-2">✏️ Засах эрх</h3>
                <p className="text-sm text-gray-700">
                  Та өөрийн profile мэдээллийг хэдийд ч өөрчлөх, шинэчлэх
                  боломжтой
                </p>
              </div>

              <div className="p-5 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200">
                <h3 className="font-bold text-gray-900 mb-2">
                  📥 Татаж авах эрх
                </h3>
                <p className="text-sm text-gray-700">
                  Та өөрийн бүх мэдээллийг татаж авах хүсэлт гаргаж болно
                </p>
              </div>

              <div className="p-5 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border-2 border-purple-200">
                <h3 className="font-bold text-gray-900 mb-2">🗑️ Устгах эрх</h3>
                <p className="text-sm text-gray-700">
                  Та account болон бүх мэдээллээ бүрмөсөн устгах боломжтой
                </p>
              </div>

              <div className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
                <h3 className="font-bold text-gray-900 mb-2">
                  🚫 Татгалзах эрх
                </h3>
                <p className="text-sm text-gray-700">
                  Та мэдээлэл цуглуулах, боловсруулахыг зогсоох хүсэлт гаргаж
                  болно
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-3xl border-2 border-gray-200 p-8 shadow-xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/30 flex-shrink-0">
                <Mail className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  5. Холбоо барих
                </h2>
                <p className="text-gray-600">
                  Асуулт, санал хүсэлт байвал бидэнтэй холбогдоорой
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl border-2 border-teal-200">
                <Mail className="w-8 h-8 text-teal-600" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">Имэйл хаяг</p>
                  <a
                    href="mailto:privacy@rently.mn"
                    className="font-bold text-teal-600 hover:text-teal-700"
                  >
                    privacy@rently.mn
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200">
                <Phone className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">Утас</p>
                  <a
                    href="tel:+97699110000"
                    className="font-bold text-blue-600 hover:text-blue-700"
                  >
                    +976 99110000
                  </a>
                </div>
              </div>
            </div>
          </section>

          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl border-2 border-amber-200 p-8 text-center">
            <p className="text-sm text-gray-700 leading-relaxed">
              Энэхүү нууцлалын бодлого нь цаг үеийн шаардлагад нийцүүлэн
              шинэчлэгдэж болно. Томоохон өөрчлөлт орох тохиолдолд бид танд
              мэдэгдэх болно.
              <br />
              <strong className="text-gray-900 mt-2 block">
                Баярлалаа! 🙏
              </strong>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
