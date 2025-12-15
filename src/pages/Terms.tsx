import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Logo from "@/components/Logo";

const Terms = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className={`min-h-screen bg-background ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <BackArrow className="w-5 h-5" />
            <span>{isRTL ? 'بازگشت' : 'Back'}</span>
          </Link>
          <Link to="/" className="flex items-center gap-2">
            <Logo size={32} />
            <span className="text-xl font-bold">
              <span className="text-foreground">Tru</span>
              <span className="text-accent">Link</span>
            </span>
          </Link>
          <div className="w-20" />
        </div>
      </header>

      {/* Content */}
      <main className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
            
            {/* Terms of Service */}
            <section className="mb-16">
              <h1 className="text-4xl font-bold text-foreground mb-8">
                {isRTL ? 'شرایط استفاده' : 'Terms of Service'}
              </h1>
              <p className="text-muted-foreground mb-6">
                {isRTL ? 'آخرین به‌روزرسانی: ۱۵ دسامبر ۲۰۲۴' : 'Last updated: December 15, 2024'}
              </p>

              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                {isRTL ? '۱. پذیرش شرایط' : '1. Acceptance of Terms'}
              </h2>
              <p className="text-muted-foreground mb-4">
                {isRTL 
                  ? 'با استفاده از خدمات تروولینک، شما موافقت خود را با این شرایط استفاده اعلام می‌کنید. اگر با هر یک از این شرایط موافق نیستید، لطفاً از استفاده از خدمات ما خودداری کنید.'
                  : 'By using TruLink services, you agree to these Terms of Service. If you do not agree with any of these terms, please refrain from using our services.'}
              </p>

              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                {isRTL ? '۲. شرح خدمات' : '2. Description of Services'}
              </h2>
              <p className="text-muted-foreground mb-4">
                {isRTL 
                  ? 'تروولینک پلتفرمی برای مدیریت قراردادهای دیجیتال، امضای الکترونیکی و ذخیره‌سازی امن اسناد ارائه می‌دهد. خدمات ما شامل ایجاد قرارداد، ارسال برای امضا، تحلیل هوش مصنوعی و بایگانی اسناد می‌شود.'
                  : 'TruLink provides a platform for digital contract management, electronic signatures, and secure document storage. Our services include contract creation, signature requests, AI analysis, and document archiving.'}
              </p>

              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                {isRTL ? '۳. حساب کاربری' : '3. User Account'}
              </h2>
              <p className="text-muted-foreground mb-4">
                {isRTL 
                  ? 'شما مسئول حفظ محرمانگی اطلاعات حساب کاربری خود هستید. هرگونه فعالیت انجام شده از طریق حساب شما، مسئولیت شماست.'
                  : 'You are responsible for maintaining the confidentiality of your account information. Any activity conducted through your account is your responsibility.'}
              </p>

              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                {isRTL ? '۴. استفاده مجاز' : '4. Acceptable Use'}
              </h2>
              <p className="text-muted-foreground mb-4">
                {isRTL 
                  ? 'شما موافقت می‌کنید که از خدمات ما فقط برای اهداف قانونی استفاده کنید و از هرگونه فعالیت غیرقانونی یا مضر خودداری نمایید.'
                  : 'You agree to use our services only for lawful purposes and to refrain from any illegal or harmful activities.'}
              </p>

              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                {isRTL ? '۵. محدودیت مسئولیت' : '5. Limitation of Liability'}
              </h2>
              <p className="text-muted-foreground mb-4">
                {isRTL 
                  ? 'تروولینک در قبال هرگونه خسارت مستقیم، غیرمستقیم، تصادفی یا تبعی ناشی از استفاده یا عدم امکان استفاده از خدمات مسئولیتی ندارد.'
                  : 'TruLink shall not be liable for any direct, indirect, incidental, or consequential damages arising from the use or inability to use our services.'}
              </p>
            </section>

            {/* Privacy Policy */}
            <section className="border-t border-border pt-16">
              <h1 className="text-4xl font-bold text-foreground mb-8">
                {isRTL ? 'سیاست حریم خصوصی' : 'Privacy Policy'}
              </h1>
              <p className="text-muted-foreground mb-6">
                {isRTL ? 'آخرین به‌روزرسانی: ۱۵ دسامبر ۲۰۲۴' : 'Last updated: December 15, 2024'}
              </p>

              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                {isRTL ? '۱. جمع‌آوری اطلاعات' : '1. Information Collection'}
              </h2>
              <p className="text-muted-foreground mb-4">
                {isRTL 
                  ? 'ما اطلاعاتی را که شما مستقیماً به ما ارائه می‌دهید جمع‌آوری می‌کنیم، از جمله نام، آدرس ایمیل، و محتوای قراردادها. همچنین اطلاعات فنی مانند آدرس IP و نوع مرورگر را به طور خودکار جمع‌آوری می‌کنیم.'
                  : 'We collect information you provide directly to us, including name, email address, and contract content. We also automatically collect technical information such as IP address and browser type.'}
              </p>

              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                {isRTL ? '۲. استفاده از اطلاعات' : '2. Use of Information'}
              </h2>
              <p className="text-muted-foreground mb-4">
                {isRTL 
                  ? 'ما از اطلاعات شما برای ارائه و بهبود خدمات، ارسال اعلان‌ها، و تأمین امنیت پلتفرم استفاده می‌کنیم.'
                  : 'We use your information to provide and improve our services, send notifications, and ensure platform security.'}
              </p>

              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                {isRTL ? '۳. اشتراک‌گذاری اطلاعات' : '3. Information Sharing'}
              </h2>
              <p className="text-muted-foreground mb-4">
                {isRTL 
                  ? 'ما اطلاعات شخصی شما را با اشخاص ثالث به اشتراک نمی‌گذاریم، مگر در موارد ضروری برای ارائه خدمات یا الزامات قانونی.'
                  : 'We do not share your personal information with third parties, except when necessary to provide services or as required by law.'}
              </p>

              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                {isRTL ? '۴. امنیت داده‌ها' : '4. Data Security'}
              </h2>
              <p className="text-muted-foreground mb-4">
                {isRTL 
                  ? 'ما از رمزنگاری و سایر اقدامات امنیتی برای حفاظت از داده‌های شما استفاده می‌کنیم. با این حال، هیچ روش انتقال یا ذخیره‌سازی الکترونیکی ۱۰۰٪ امن نیست.'
                  : 'We use encryption and other security measures to protect your data. However, no method of electronic transmission or storage is 100% secure.'}
              </p>

              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                {isRTL ? '۵. حقوق کاربران' : '5. User Rights'}
              </h2>
              <p className="text-muted-foreground mb-4">
                {isRTL 
                  ? 'شما حق دسترسی، اصلاح و حذف اطلاعات شخصی خود را دارید. برای اعمال این حقوق، با ما تماس بگیرید.'
                  : 'You have the right to access, correct, and delete your personal information. Contact us to exercise these rights.'}
              </p>

              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                {isRTL ? '۶. کوکی‌ها' : '6. Cookies'}
              </h2>
              <p className="text-muted-foreground mb-4">
                {isRTL 
                  ? 'ما از کوکی‌ها برای بهبود تجربه کاربری و تحلیل استفاده از سایت استفاده می‌کنیم. شما می‌توانید کوکی‌ها را در تنظیمات مرورگر خود غیرفعال کنید.'
                  : 'We use cookies to improve user experience and analyze site usage. You can disable cookies in your browser settings.'}
              </p>

              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                {isRTL ? '۷. تماس با ما' : '7. Contact Us'}
              </h2>
              <p className="text-muted-foreground mb-4">
                {isRTL 
                  ? 'برای هرگونه سوال در مورد این سیاست حریم خصوصی، لطفاً از طریق صفحه پشتیبانی با ما تماس بگیرید.'
                  : 'For any questions about this Privacy Policy, please contact us through the support page.'}
              </p>
            </section>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border bg-card">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 TruLink. {isRTL ? 'تمامی حقوق محفوظ است.' : 'All rights reserved.'}</p>
        </div>
      </footer>
    </div>
  );
};

export default Terms;
