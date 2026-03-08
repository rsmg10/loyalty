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
        ["Display name and phone number are required"] = "الاسم ورقم الهاتف مطلوبان",
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
