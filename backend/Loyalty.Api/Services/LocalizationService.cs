namespace Loyalty.Api.Services;

public sealed class LocalizationService
{
    private readonly Dictionary<string, string> _arabic = new(StringComparer.Ordinal)
    {
        ["Name and owner phone are required"] = "اسم النشاط ورقم هاتف المالك مطلوبان",
        ["Business type is required"] = "نوع النشاط مطلوب",
        ["Program name, reward name, and positive stamp threshold are required"] = "اسم البرنامج واسم المكافأة وحد الأختام الإيجابي مطلوبان",
        ["Stamp expiration days must be positive when provided"] = "مدة انتهاء الأختام يجب أن تكون قيمة موجبة",
        ["Business not found"] = "النشاط غير موجود",
        ["Business has no active loyalty configuration"] = "لا يوجد برنامج ولاء نشط لهذا النشاط",
        ["Phone number is required"] = "رقم الهاتف مطلوب",
        ["Customer phone is required"] = "رقم هاتف العميل مطلوب",
        ["Stamp quantity must be positive"] = "عدد الأختام يجب أن يكون قيمة موجبة",
        ["Reason is required"] = "السبب مطلوب",
        ["Staff member not found"] = "الموظف غير موجود",
        ["Multipart form data is required"] = "يجب إرسال البيانات بصيغة multipart",
        ["Kind is required"] = "نوع الملف مطلوب",
        ["File is required"] = "الملف مطلوب",
        ["Invalid kind. Use program_icon or reward_image."] = "نوع غير صالح. استخدم program_icon أو reward_image",
        ["Customer not found"] = "العميل غير موجود",
        ["Reward not available"] = "المكافأة غير متاحة",
        ["Phone number and purpose are required"] = "رقم الهاتف والغرض مطلوبان",
        ["Phone number, purpose, and code are required"] = "رقم الهاتف والغرض والرمز مطلوبة",
        ["Invalid or expired code"] = "الرمز غير صالح أو منتهي",
        ["Staff OTP sign-in is disabled. Use username and password"] = "تم إيقاف تسجيل دخول الموظفين عبر OTP. استخدم اسم المستخدم وكلمة المرور",
        ["Username and password are required"] = "اسم المستخدم وكلمة المرور مطلوبان",
        ["Invalid username or password"] = "اسم المستخدم أو كلمة المرور غير صحيحين",
        ["Display name, username, and password are required"] = "الاسم واسم المستخدم وكلمة المرور مطلوبة",
        ["Username already exists"] = "اسم المستخدم مستخدم بالفعل",
        ["Password is required"] = "كلمة المرور مطلوبة",
        ["Password must be at least 8 characters"] = "كلمة المرور يجب أن تكون 8 أحرف على الأقل",
        ["Username must be 3-40 chars and use letters, numbers, dot, underscore, or hyphen"] = "اسم المستخدم يجب أن يكون بين 3 و40 حرفًا ويحتوي على أحرف أو أرقام أو نقطة أو شرطة سفلية أو شرطة",
        ["Object storage is not configured."] = "تخزين الملفات غير مُعدّ",
        ["Magic link not found or expired"] = "رابط الدخول غير صالح أو منتهي",
        ["Invalid date range"] = "نطاق التاريخ غير صالح"
    };

    public string Translate(string key, string language)
    {
        if (string.Equals(language, "ar", StringComparison.OrdinalIgnoreCase)
            && _arabic.TryGetValue(key, out var value))
        {
            return value;
        }

        return key;
    }

    public string ResolveLanguage(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return "en";
        }

        if (value.StartsWith("ar", StringComparison.OrdinalIgnoreCase))
        {
            return "ar";
        }

        return "en";
    }
}
