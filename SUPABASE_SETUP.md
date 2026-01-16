# 🔧 Supabase Kurulum Adımları

## 1. Veritabanı Şemasını Oluştur

1. [Supabase Dashboard](https://supabase.com/dashboard)'a git
2. Projenizi seçin (cpfqgdntqxbkftbikrfr)
3. Sol menüden **SQL Editor**'ü aç
4. **New Query** butonuna tıkla
5. Aşağıdaki dosyanın içeriğini yapıştır ve **Run** butonuna bas:

📄 `supabase/migrations/20240116_initial_schema.sql`

Bu şema şunları oluşturacak:
- ✅ profiles tablosu
- ✅ likes tablosu
- ✅ matches tablosu
- ✅ messages tablosu
- ✅ RLS (Row Level Security) politikaları
- ✅ Otomatik match oluşturma trigger'ı

## 2. Test Kullanıcılarını Ekle

1. Yine **SQL Editor**'de yeni bir query aç
2. Aşağıdaki dosyanın içeriğini yapıştır ve **Run** butonuna bas:

📄 `supabase/seed.sql`

Bu 10 test kullanıcısı ekleyecek:
- 👤 Selen Yılmaz (İstanbul)
- 👤 Can Demir (Ankara)
- 👤 Melis Kaya (İzmir)
- 👤 Ege Arslan (İstanbul)
- 👤 Ayşe Şahin (Antalya)
- 👤 Berk Öztürk (İstanbul)
- 👤 Deniz Aydın (İstanbul)
- 👤 Kaan Yıldız (Bodrum)
- 👤 Elif Çelik (Ankara)
- 👤 Mert Koç (İstanbul)

## 3. Realtime'ı Aktifleştir (Chat için)

1. Sol menüden **Database** → **Replication**'a git
2. **messages** tablosunu bul
3. **Enable Realtime** butonuna tıkla

## 4. Email Şablonlarını Ayarla (Opsiyonel)

1. Sol menüden **Authentication** → **Email Templates**'e git
2. **Confirm Signup** şablonunu düzenle
3. Redirect URL'i ayarla: `http://localhost:3000/auth/callback`

## ✅ Kontrol Listesi

- [ ] Schema migration çalıştırıldı
- [ ] Seed data eklendi
- [ ] Realtime aktifleştirildi
- [ ] Email templates ayarlandı

## 🧪 Test Etme

1. Uygulamayı başlat: `npm run dev`
2. Yeni bir hesap oluştur: `/signup`
3. Giriş yap: `/login`
4. Discover sayfasında test kullanıcılarını gör: `/discover`
5. Sağa kaydır (like) ve eşleşmeleri kontrol et: `/matches`
6. Mesajlaşmayı test et: `/chat`

## ⚠️ Önemli Notlar

- Test kullanıcıları sadece `profiles` tablosunda. Auth kullanıcıları değiller.
- Gerçek kullanıcılar signup yapınca otomatik olarak `profiles` tablosuna eklenir.
- Match'ler otomatik oluşur (karşılıklı like olduğunda).
- Chat gerçek zamanlı çalışır (Supabase Realtime sayesinde).

## 🐛 Sorun Giderme

### "No profiles found" hatası
- Seed data'nın doğru çalıştığından emin ol
- SQL Editor'de `SELECT * FROM profiles;` çalıştır

### Chat mesajları gelmiyor
- Realtime'ın aktif olduğunu kontrol et
- Browser console'da hata var mı bak

### Login çalışmıyor
- Email confirmation gerekiyor mu kontrol et
- Supabase Auth settings'de "Enable email confirmations" kapalı olmalı (development için)

---

Sorularınız için: [GitHub Issues](https://github.com/gokhanyigit06/loopweb/issues)
