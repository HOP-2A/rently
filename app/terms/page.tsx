// app/terms/page.tsx
"use client";

import Link from "next/link";
import {
  Home,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Scale,
  Mail,
  Phone,
} from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
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
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl mb-6 shadow-lg">
            <FileText className="w-6 h-6 text-purple-600" />
            <span className="text-base font-bold text-purple-700">
              Үйлчилгээний нөхцөл
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
            Хэрэглэх нөхцөл
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            RENTLY платформыг ашиглахдаа дагаж мөрдөх нөхцөл, журам
          </p>
          <p className="text-sm text-gray-500 mt-3">
            Сүүлд шинэчлэгдсэн: 2026 оны 2-р сарын 7
          </p>
        </div>

        <div className="space-y-8">
          <section className="bg-white rounded-3xl border-2 border-gray-200 p-8 shadow-xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 flex-shrink-0">
                <CheckCircle2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  1. Нөхцөл зөвшөөрөх
                </h2>
                <p className="text-gray-600">
                  RENTLY платформыг ашиглаж эхлэхдээ дараах зүйлийг зөвшөөрч
                  байна
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200">
                <p className="text-gray-700 leading-relaxed">
                  Та энэхүү үйлчилгээний нөхцөл болон нууцлалын бодлогыг уншиж
                  танилцаад зөвшөөрч байна гэж үзнэ. Хэрэв та нөхцөлтэй санал
                  нийлэхгүй бол платформыг ашиглах эрхгүй.
                </p>
              </div>

              <div className="p-5 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200">
                <p className="text-gray-700 leading-relaxed">
                  Үйлчилгээний нөхцөл хугацаа алдалгүй өөрчлөгдөж болно.
                  Томоохон өөрчлөлт орох тохиолдолд бид танд мэдэгдэх болно.
                  Үргэлжлүүлэн ашиглах нь өөрчлөлтийг зөвшөөрсөнд тооцно.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-3xl border-2 border-gray-200 p-8 shadow-xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  2. Хэрэглэгчийн үүрэг хариуцлага
                </h2>
                <p className="text-gray-600">
                  Платформыг ашиглахдаа та дараах зүйлийг хүлээн зөвшөөрч байна
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
                <CheckCircle2 className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">
                    Үнэн мэдээлэл өгөх
                  </h3>
                  <p className="text-sm text-gray-700">
                    Та бүртгэлдээ үнэн зөв мэдээлэл оруулах, шаардлагатай бол
                    шинэчлэх үүрэгтэй
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200">
                <CheckCircle2 className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">
                    Account хамгаалах
                  </h3>
                  <p className="text-sm text-gray-700">
                    Та өөрийн нэвтрэх нэр, нууц үгийг хамгаалах, бусдад
                    задруулахгүй байх үүрэгтэй. Таны account-оос үүссэн бүх үйл
                    ажиллагаанд та хариуцлага хүлээнэ.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border-2 border-purple-200">
                <CheckCircle2 className="w-6 h-6 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">
                    Хууль дүрмийг дагах
                  </h3>
                  <p className="text-sm text-gray-700">
                    Та Монгол Улсын хууль тогтоомжийг дагаж мөрдөх, бусдын
                    эрхийг хүндэтгэх үүрэгтэй
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border-2 border-orange-200">
                <CheckCircle2 className="w-6 h-6 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">
                    Зохих ёсоор ашиглах
                  </h3>
                  <p className="text-sm text-gray-700">
                    Та платформыг зөвхөн зохих зорилгоор ашиглах, систем эвдэх,
                    автоматжуулалт хийх, спам илгээх зэрэг үйлдэл хийхгүй байх
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-3xl border-2 border-gray-200 p-8 shadow-xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30 flex-shrink-0">
                <XCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  3. Хориглох зүйлс
                </h2>
                <p className="text-gray-600">
                  Дараах үйлдлийг хийхийг хатуу хориглоно
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border-2 border-red-200">
                <XCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">
                    ❌ Худал мэдээлэл оруулах
                  </h3>
                  <p className="text-sm text-gray-700">
                    Худал зар оруулах, бусдыг хууран мэхлэх зорилготой мэдээлэл
                    дамжуулах
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl border-2 border-red-200">
                <XCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">
                    ❌ Доромжлол, дарамт
                  </h3>
                  <p className="text-sm text-gray-700">
                    Бусдыг доромжлох, заналхийлэх, үл тоомсорлох, ялгаварлах
                    агуулга нийтлэх
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border-2 border-orange-200">
                <XCircle className="w-6 h-6 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">
                    ❌ Хууль бус үйлдэл
                  </h3>
                  <p className="text-sm text-gray-700">
                    Хууль бус, шударга бус үйлдэл хийх, бусдын эрхийг зөрчих
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200">
                <XCircle className="w-6 h-6 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">
                    ❌ Систем эвдэх
                  </h3>
                  <p className="text-sm text-gray-700">
                    Платформын ажиллагааг саатуулах, вирус тараах, аюулгүй
                    байдлыг зөрчих оролдлого хийх
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200">
                <XCircle className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">
                    ❌ Олон account үүсгэх
                  </h3>
                  <p className="text-sm text-gray-700">
                    Тоглоом зөрчих зорилгоор олон тооны account үүсгэх,
                    автоматжуулалт ашиглах
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-3xl border-2 border-gray-200 p-8 shadow-xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30 flex-shrink-0">
                <AlertTriangle className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  4. Хариуцлагын хязгаарлалт
                </h2>
                <p className="text-gray-600">
                  Платформын хариуцлагын талаар анхаарах зүйлс
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200">
                <h3 className="font-bold text-gray-900 mb-3">
                  🔍 Зар, мэдээллийн үнэн зөв
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  RENTLY нь зөвхөн зарын платформ бөгөөд зар оруулагчийн
                  мэдээллийн үнэн зөвийг баталгаажуулахгүй. Гэрээ хэлэлцээр
                  хийх, мөнгөн гүйлгээ хийхдээ өөрөө шалгаж баталгаажуулах
                  үүрэгтэй.
                </p>
              </div>

              <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200">
                <h3 className="font-bold text-gray-900 mb-3">
                  💰 Санхүүгийн гүйлгээ
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Бид хэрэглэгчдийн хоорондын мөнгөн гүйлгээнд оролцдоггүй,
                  хариуцлага хүлээхгүй. Бүх төлбөр, тооцоо нь хувь хүмүүсийн
                  хооронд шууд хийгдэнэ.
                </p>
              </div>

              <div className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border-2 border-purple-200">
                <h3 className="font-bold text-gray-900 mb-3">
                  ⚠️ Техникийн алдаа
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Системийн алдаа, үйлчилгээний тасалдал, өгөгдөл алдагдах
                  зэрэгт бид бүрэн хариуцлага хүлээхгүй. Гэхдээ хамгийн сайн
                  үйлчилгээ үзүүлэхийн төлөө ажилладаг.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-3xl border-2 border-gray-200 p-8 shadow-xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30 flex-shrink-0">
                <Scale className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  5. Гэрээ цуцлах
                </h2>
                <p className="text-gray-600">
                  Хэрхэн account цуцлах болон бидний эрх
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
                <h3 className="font-bold text-gray-900 mb-3">
                  👤 Хэрэглэгчийн эрх
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  Та хүссэн үедээ account-аа устгаж, үйлчилгээг зогсоох эрхтэй.
                  Profile хуудаснаасаа эсвэл бидэнд хандаж устгуулах боломжтой.
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Account устгасан тохиолдолд таны бүх мэдээлэл устгагдах боловч
                  хууль ёсоор хадгалах шаардлагатай мэдээлэл үлдэж болно.
                </p>
              </div>

              <div className="p-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border-2 border-red-200">
                <h3 className="font-bold text-gray-900 mb-3">
                  🚫 Платформын эрх
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Та үйлчилгээний нөхцөлийг зөрчсөн, хууль бус үйлдэл хийсэн,
                  бусдад хор хөнөөл учруулсан тохиолдолд бид таны account-ыг түр
                  эсвэл бүрмөсөн хаах эрхтэй.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-3xl border-2 border-gray-200 p-8 shadow-xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  6. Өөрчлөлт оруулах
                </h2>
                <p className="text-gray-600">
                  Үйлчилгээний нөхцөлд өөрчлөлт орох тохиолдол
                </p>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-200">
              <p className="text-gray-700 leading-relaxed mb-4">
                Бид энэхүү үйлчилгээний нөхцөлд хугацаа алдалгүй өөрчлөлт
                оруулах эрхтэй. Томоохон өөрчлөлт орох үед бид:
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <span>Өөрчлөлтийн талаар имэйлээр мэдэгдэнэ</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <span>Платформ дээр мэдэгдэл гаргана</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <span>
                    Өөрчлөлт хүчин төгөлдөр болох огноог тодорхой зааж өгнө
                  </span>
                </li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                Өөрчлөлтийн дараа үйлчилгээг үргэлжлүүлэн ашиглах нь шинэ
                нөхцөлийг зөвшөөрсөнд тооцогдоно.
              </p>
            </div>
          </section>

          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-3xl border-2 border-teal-200 p-8 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Асуулт байна уу?
            </h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              Хэрэв үйлчилгээний нөхцөлтэй холбоотой асуулт, тодруулга хэрэгтэй
              бол бидэнтэй холбогдоорой.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@rently.mn"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-2xl font-bold hover:from-teal-700 hover:to-teal-600 shadow-lg shadow-teal-500/30 transition-all hover:scale-105"
              >
                <Mail className="w-5 h-5" />
                support@rently.mn
              </a>

              <a
                href="tel:+97699112233"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-teal-500 text-teal-600 rounded-2xl font-bold hover:bg-teal-50 transition-all hover:scale-105"
              >
                <Phone className="w-5 h-5" />
                +976 9911-2233
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
