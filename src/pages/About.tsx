import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, Shield, Users, Globe, Award } from "lucide-react";
import Logo from "@/components/Logo";

const About = () => {
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

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-card to-background">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            {isRTL ? 'درباره ما' : 'About Us'}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {isRTL 
              ? 'تروولینک پلتفرم پیشرو در مدیریت قراردادهای دیجیتال و امضای الکترونیکی است.'
              : 'TruLink is the leading platform for digital contract management and electronic signatures.'}
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
              {isRTL ? 'ماموریت ما' : 'Our Mission'}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              {isRTL 
                ? 'ماموریت ما ساده‌سازی فرآیندهای قراردادی و ارائه راهکارهای امن و قانونی برای کسب‌وکارها و افراد است. ما باور داریم که هر قراردادی باید شفاف، امن و قابل اعتماد باشد.'
                : 'Our mission is to simplify contract processes and provide secure, legal solutions for businesses and individuals. We believe every contract should be transparent, secure, and trustworthy.'}
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {isRTL 
                ? 'با استفاده از فناوری‌های پیشرفته هوش مصنوعی و رمزنگاری، ما تجربه‌ای یکپارچه و حرفه‌ای برای مدیریت قراردادهای شما فراهم می‌کنیم.'
                : 'Using advanced AI technology and encryption, we provide a seamless and professional experience for managing your contracts.'}
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
            {isRTL ? 'ارزش‌های ما' : 'Our Values'}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {isRTL ? 'امنیت' : 'Security'}
              </h3>
              <p className="text-muted-foreground">
                {isRTL 
                  ? 'حفاظت از داده‌های شما با بالاترین استانداردهای امنیتی'
                  : 'Protecting your data with the highest security standards'}
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {isRTL ? 'اعتماد' : 'Trust'}
              </h3>
              <p className="text-muted-foreground">
                {isRTL 
                  ? 'ایجاد روابط مبتنی بر اعتماد و شفافیت'
                  : 'Building relationships based on trust and transparency'}
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {isRTL ? 'جهانی' : 'Global'}
              </h3>
              <p className="text-muted-foreground">
                {isRTL 
                  ? 'پشتیبانی از زبان‌ها و استانداردهای بین‌المللی'
                  : 'Supporting international languages and standards'}
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {isRTL ? 'کیفیت' : 'Quality'}
              </h3>
              <p className="text-muted-foreground">
                {isRTL 
                  ? 'ارائه بهترین تجربه کاربری و خدمات'
                  : 'Delivering the best user experience and services'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            {isRTL ? 'تماس با ما' : 'Contact Us'}
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            {isRTL 
              ? 'برای هرگونه سوال یا پیشنهاد با ما در تماس باشید.'
              : 'Get in touch with us for any questions or suggestions.'}
          </p>
          <Link 
            to="/support" 
            className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-8 py-3 rounded-lg font-medium hover:bg-accent/90 transition-colors"
          >
            {isRTL ? 'پشتیبانی' : 'Support'}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border bg-card">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 TruLink. {isRTL ? 'تمامی حقوق محفوظ است.' : 'All rights reserved.'}</p>
        </div>
      </footer>
    </div>
  );
};

export default About;
